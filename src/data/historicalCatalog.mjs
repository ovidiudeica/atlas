/**
 * HIST-MODULE.1 — source-backed, read-only Historical pilot catalogue.
 *
 * This is deliberately independent of the ACTUAL catalogue and its release
 * certificate. A candidate historical link may be inspected in review mode,
 * but is never promoted to an authoritative public tree automatically.
 */
import { validateHistoricalPeriod, validateHistoricalAdminBridge } from './historicalAdminBridge.mjs';
import { validateTemporalHierarchy } from './historicalTemporalHierarchy.mjs';
import { validateHistoricalGeometryRegister, historicalUsesForGeometry } from './historicalGeometryUses.mjs';

const SCHEMA = 'atlas-historical-pilot-v1';
const BASE = 'data/historical/v1/';
const EVIDENCE = new Set(['qualified','candidate','in_review']);

function nonempty(x) { return typeof x === 'string' && x.trim().length > 0; }

function requireUnique(rows, key, errors) {
  if (!Array.isArray(rows)) { errors.push(key + ' must be an array'); return new Map(); }
  const seen = new Map();
  for (const row of rows) {
    const id = key === 'geometryUses' ? row?.useId :
      key === 'geometries' ? row?.geometryId : row?.id;
    if (!nonempty(id) || seen.has(id)) errors.push(key + ': duplicate/missing ID ' + id);
    else seen.set(id, row);
  }
  return seen;
}

function dateNumber(d, fallback) {
  if (d === null) return fallback;
  return d.year * 10000 + (d.month ?? 1) * 100 + (d.day ?? 1);
}

function dateEndNumber(d, fallback) {
  if (d === null) return fallback;
  return d.year * 10000 + (d.month ?? 12) * 100 + (d.day ?? 31);
}

function inWindow(period, iso) {
  if (!validateHistoricalPeriod(period) || !/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(iso))
    return false;
  const [y, m, d] = iso.split('-').map(Number);
  if (!validateHistoricalPeriod({kind: 'snapshot', at: {year:y,month:m,day:d}}))
    return false;
  const key = y * 10000 + m * 100 + d;
  if (period.kind === 'snapshot') {
    return dateNumber(period.at, -Infinity) <= key &&
      key <= dateEndNumber(period.at, Infinity);
  }
  return dateNumber(period.start, -Infinity) <= key &&
    key <= dateEndNumber(period.end, Infinity);
}

export function validateHistoricalPilotCatalog(catalog, geometryCollection = null) {
  const errors = [];
  if (!catalog || typeof catalog !== 'object' || Array.isArray(catalog))
    return { ok: false, errors: ['catalog must be an object'] };
  if (catalog.schema !== SCHEMA) errors.push('unsupported schema');
  if (catalog.coverage?.complete !== false ||
      catalog.coverage?.historicalBoundariesCertified !== false ||
      catalog.coverage?.hierarchyQualified !== false)
    errors.push('pilot must state incomplete, uncertified historical coverage');
  if (!nonempty(catalog.citation?.doi) || catalog.citation?.license !== 'CC-BY-4.0')
    errors.push('HistoGIS attribution/license required');
  if (!/^[a-f0-9]{64}$/.test(catalog.sourceArchiveSha256 || ''))
    errors.push('archive SHA-256 required');

  const sources = requireUnique(catalog.sources, 'sources', errors);
  const entities = requireUnique(catalog.entities, 'entities', errors);
  const versions = requireUnique(catalog.versions, 'versions', errors);
  const geometries = requireUnique(catalog.geometries, 'geometries', errors);
  requireUnique(catalog.geometryUses, 'geometryUses', errors);
  requireUnique(catalog.hierarchy, 'hierarchy', errors);
  if (!Array.isArray(catalog.bridge) || !Array.isArray(catalog.events) ||
      !Array.isArray(catalog.symbols)) errors.push('bridge, events and symbols must be arrays');

  for (const entity of entities.values()) {
    if (!nonempty(entity.sourceName) || !nonempty(entity.names?.ro) ||
        !nonempty(entity.startDate) || !nonempty(entity.endDate) ||
        entity.startDate > entity.endDate ||
        !EVIDENCE.has(entity.identityReviewStatus))
      errors.push('invalid source identity ' + entity.id);
  }
  for (const version of versions.values()) {
    if (!entities.has(version.entityId) || !geometries.has(version.geometryId) ||
        !validateHistoricalPeriod(version.period) ||
        !EVIDENCE.has(version.evidenceStatus) ||
        !Array.isArray(version.sourceIds) || !version.sourceIds.length ||
        !version.sourceIds.every(id => sources.has(id)))
      errors.push('invalid version reference ' + version.id);
    if (version.boundaryCertification !== 'not_certified')
      errors.push('historical version may not claim legal boundary certification: ' + version.id);
  }
  for (const asset of geometries.values()) {
    if (asset.boundaryCertification !== 'not_certified' ||
        asset.geometryAvailable !== true ||
        asset.hashMethod !== 'sha256:canonical-json-object:source-crs' ||
        !Array.isArray(asset.sourceShapeIds) || !asset.sourceShapeIds.length)
      errors.push('invalid GIS asset provenance ' + asset.geometryId);
  }

  try { validateHistoricalGeometryRegister(catalog.geometries, catalog.geometryUses, catalog.versions); }
  catch (e) { errors.push('geometry register: ' + e.message); }

  try {
    const result = validateTemporalHierarchy(catalog.versions, catalog.hierarchy);
    if (!result.ok) errors.push(...result.errors.map(e => 'hierarchy: ' + e));
  } catch (e) { errors.push('hierarchy: ' + e.message); }

  for (const relation of catalog.hierarchy || []) {
    const parent = versions.get(relation.parentVersionId);
    const child = versions.get(relation.childVersionId);
    if (!parent || !child) continue;
    if (!inWindow(parent.period, isoStart(relation.period)) ||
        !inWindow(parent.period, isoEnd(relation.period)) ||
        !inWindow(child.period, isoStart(relation.period)) ||
        !inWindow(child.period, isoEnd(relation.period)))
      errors.push('relationship time outside parent/child: ' + relation.id);
    if (relation.evidenceStatus === 'qualified' && relation.topologicalReviewRequired)
      errors.push('cannot qualify a topologically divergent hierarchy: ' + relation.id);
    if (!Number.isFinite(relation.outsideParentPercent) ||
        relation.outsideParentPercent < 0 || relation.outsideParentPercent > 100)
      errors.push('invalid spatial QA: ' + relation.id);
    if (!relation.sourceIds?.every(x => sources.has(x)))
      errors.push('unknown hierarchy source ' + relation.id);
  }

  const bridge = Array.isArray(catalog.bridge) ? catalog.bridge : [];
  const bv = validateHistoricalAdminBridge(bridge, {
    actualIds: [], historicalEntityIds: [...entities.keys()],
    historicalVersionIds: [...versions.keys()], actualSnapshotDate: '2026-10-05'
  });
  if (!bv.ok) errors.push(...bv.errors.map(x => 'bridge: ' + x));
  // The first pilot contains NO cross-module identity assertions.
  if (bridge.length) errors.push('pilot may not assert ACTUAL crosswalk without ACTUAL catalogue review');

  if (geometryCollection !== null) {
    if (geometryCollection?.type !== 'FeatureCollection' ||
        !Array.isArray(geometryCollection.features))
      errors.push('invalid geometry feature collection');
    else {
      const features = new Map();
      for (const feature of geometryCollection.features) {
        const id = feature?.properties?.geometryId;
        if (!nonempty(id) || features.has(id) || feature.id !== id ||
            !['Polygon', 'MultiPolygon'].includes(feature.geometry?.type) ||
            feature.properties.canonicalHash !== geometries.get(id)?.canonicalHash)
          errors.push('invalid/duplicate GIS feature ' + String(id));
        else features.set(id, feature);
      }
      if (features.size !== geometries.size)
        errors.push('geometry feature count != canonical geometry count');
    }
  }
  return {ok: errors.length === 0, errors};
}

function isoStart(period) {
  const d = period?.kind === 'interval' ? period.start : period?.at;
  return d ? [String(d.year).padStart(4, '0'), String(d.month || 1).padStart(2, '0'),
    String(d.day || 1).padStart(2, '0')].join('-') : '0001-01-01';
}

function isoEnd(period) {
  const d = period?.kind === 'interval' ? period.end : period?.at;
  return d ? [String(d.year).padStart(4, '0'), String(d.month || 12).padStart(2, '0'),
    String(d.day || 31).padStart(2, '0')].join('-') : '9999-12-31';
}

export function versionsForHistoricalEntity(catalog, entityId) {
  return catalog.versions.filter(v => v.entityId === entityId)
    .sort((a, b) => dateNumber(a.period.start ?? null, -Infinity) -
      dateNumber(b.period.start ?? null, -Infinity));
}

/**
 * Candidate preview explicitly opted into by the review caller. By default,
 * uncertified links never appear as verified historical parentage.
 */
export function historicalChildrenAtDate(catalog, parentVersionId, isoDate, perspectiveId,
  { includeCandidates = false } = {}) {
  return catalog.hierarchy.filter(r => r.parentVersionId === parentVersionId &&
    r.perspectiveId === perspectiveId &&
    (r.evidenceStatus === 'qualified' || includeCandidates) &&
    inWindow(r.period, isoDate))
    .map(r => ({ childVersionId: r.childVersionId, relationId: r.id,
      evidenceStatus: r.evidenceStatus,
      topologicalReviewRequired: r.topologicalReviewRequired }));
}

export function historicalParentAtDate(catalog, childVersionId, isoDate, perspectiveId,
  { includeCandidates = false } = {}) {
  return catalog.hierarchy.filter(r => r.childVersionId === childVersionId &&
    r.perspectiveId === perspectiveId &&
    (r.evidenceStatus === 'qualified' || includeCandidates) &&
    inWindow(r.period, isoDate))
    .map(r => ({ parentVersionId: r.parentVersionId, relationId: r.id,
      evidenceStatus: r.evidenceStatus }));
}

export function geometryUsesInHistoricalCatalog(catalog, geometryId) {
  return historicalUsesForGeometry(catalog.geometryUses, geometryId);
}

/**
 * This fetches the attributed pilot, not ACTUAL. Historical map rendering is
 * deliberately deferred until the UI can display source/certification caveats.
 */
export async function loadHistoricalPilotCatalog(baseUrl = import.meta.env?.BASE_URL ?? '/') {
  const prefix = baseUrl.replace(/\/?$/, '/') + BASE;
  const response = await fetch(prefix + 'catalog.json');
  if (!response.ok) throw Error('Historical catalog HTTP ' + response.status);
  const catalog = await response.json();
  const status = validateHistoricalPilotCatalog(catalog);
  if (!status.ok) throw Error('Historical catalog validation failed: ' + status.errors.join('; '));
  return catalog;
}

export async function loadHistoricalPilotGeometries(baseUrl = import.meta.env?.BASE_URL ?? '/') {
  const prefix = baseUrl.replace(/\/?$/, '/') + BASE;
  const response = await fetch(prefix + 'geometry.geojson');
  if (!response.ok) throw Error('Historical geometry HTTP ' + response.status);
  const features = await response.json();
  if (features?.type !== 'FeatureCollection' || !Array.isArray(features.features))
    throw Error('Invalid historical geometry collection');
  return features;
}
