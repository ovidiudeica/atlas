/**
 * HIST-MODULE.2 — evidence-safe qualification of the HistoGIS source pilot.
 * Spatial consistency is a cartographic diagnostic, NOT proof of legal
 * boundary, institutional continuity or direct administrative parentage.
 */
import { validateHistoricalPeriod } from './historicalAdminBridge.mjs';

export const PILOT_ROOT_IDS = Object.freeze([9915, 9936, 9970]);
export const PILOT_PERSPECTIVE = 'histogis-v9:source-administration';
export const REVIEW_DECISIONS = Object.freeze([
  'spatially_consistent_source_candidate',
  'requires_boundary_reconciliation',
  'blocked_spatial_contradiction'
]);

const ROOTS = new Set(PILOT_ROOT_IDS);

export function validateHistoricalQualification(catalog, qualification) {
  const errors = [];
  if (!catalog || !qualification || qualification.schema !== 'hist-pilot-qualification-v1')
    return {ok: false, errors: ['Unsupported historical qualification register']};
  if (qualification.sourceArchiveSha256 !== catalog.sourceArchiveSha256)
    errors.push('Qualification source archive mismatch');
  if (qualification.evaluation?.projection !== 'EPSG:3035' ||
      qualification.evaluation?.status !==
      'geometry-topology-checked; institutional parentage unverified')
    errors.push('Missing projection and non-certification declaration');
  if (!Array.isArray(qualification.relations)) {
    errors.push('Missing relation qualifications');
    return {ok: false, errors};
  }
  const expected = new Set(catalog.hierarchy.map(r => r.id));
  const original = new Map(catalog.hierarchy.map(r => [r.id, r]));
  const seen = new Set();
  const counts = Object.fromEntries(REVIEW_DECISIONS.map(s => [s, 0]));
  for (const row of qualification.relations) {
    if (!row || !expected.has(row.id) || seen.has(row.id)) {
      errors.push('Unknown or duplicate qualification id: ' + row?.id); continue;
    }
    seen.add(row.id);
    if (!REVIEW_DECISIONS.includes(row.decision) ||
        row.qualifiedAsHistoricalBoundary !== false ||
        !Number.isFinite(row.outsidePercentEqualArea) ||
        row.outsidePercentEqualArea < 0 || row.outsidePercentEqualArea > 100 ||
        !Number.isFinite(row.overlapPercentEqualArea) ||
        row.overlapPercentEqualArea < 0 || row.overlapPercentEqualArea > 100 ||
        Math.abs(row.overlapPercentEqualArea +
            row.outsidePercentEqualArea - 100) > 0.02)
      errors.push('Invalid spatial qualification: ' + row.id);
    const originalRow = original.get(row.id);
    if (originalRow?.evidenceStatus !== 'candidate')
      errors.push('Qualified tree cannot be inferred from source pilot: ' + row.id);
    if (Math.abs(originalRow.outsideParentPercent -
        row.outsidePercentEqualArea) > 0.08)
      errors.push('Unexpected source/projection discrepancy: ' + row.id);
    if (row.decision === REVIEW_DECISIONS[2] &&
        row.outsidePercentEqualArea < 99.99)
      errors.push('Blocked relation requires full spatial contradiction: ' + row.id);
    if (row.decision === REVIEW_DECISIONS[0] &&
        row.outsidePercentEqualArea > 0.1)
      errors.push('Spatially consistent relation has excessive discrepancy: ' + row.id);
    if (row.decision === REVIEW_DECISIONS[1] &&
        (row.outsidePercentEqualArea <= 0.1 ||
         row.outsidePercentEqualArea >= 99.99))
      errors.push('Incorrect spatial review classification: ' + row.id);
    counts[row.decision] = (counts[row.decision] || 0) + 1;
  }
  if (seen.size !== expected.size)
    errors.push('Incomplete qualification coverage: ' + seen.size + '/' + expected.size);
  for (const decision of REVIEW_DECISIONS)
    if (qualification.counts?.[decision] !== counts[decision])
      errors.push('Qualification totals changed: ' + decision);
  return {ok: errors.length === 0, errors};
}

function toNumber(p, end) {
  const d = p?.kind === 'snapshot' ? p.at : end ? p?.end : p?.start;
  if (!d) return end ? Infinity : -Infinity;
  return d.year * 10000 + (d.month ?? (end ? 12 : 1)) * 100 +
    (d.day ?? (end ? 31 : 1));
}

export async function loadHistoricalPilotQualification(catalog,
  baseUrl = import.meta.env?.BASE_URL ?? '/') {
  const prefix = baseUrl.replace(/\/?$/, '/') + 'data/historical/v1/';
  const response = await fetch(prefix + 'qualification.json');
  if (!response.ok) throw Error('Historical qualification HTTP ' + response.status);
  const qualification = await response.json();
  const gate = validateHistoricalQualification(catalog, qualification);
  if (!gate.ok) throw Error('Historical qualification invalid: ' + gate.errors.join('; '));
  return qualification;
}

export function historicalDateInPeriod(period, iso) {
  if (!validateHistoricalPeriod(period) || !/^\d{4}-\d{2}-\d{2}$/.test(iso))
    return false;
  const [year,month,day] = iso.split('-').map(Number);
  if (!validateHistoricalPeriod({kind:'snapshot',at:{year,month,day}})) return false;
  const selected = year * 10000 + month * 100 + day;
  return toNumber(period, false) <= selected &&
    selected <= toNumber(period, true);
}

/**
 * Returns a source-proposed tree for an explicit reviewer preview.
 * Excludes two geometrically impossible direct links, keeps all orphan
 * records available, and never changes evidenceStatus to "qualified".
 */
export function buildHistoricalReviewTree(catalog, qualification, iso) {
  const gate = validateHistoricalQualification(catalog, qualification);
  if (!gate.ok) throw Error('Historical qualification failed: ' + gate.errors.join('; '));
  if (!historicalDateInPeriod({kind:'snapshot',at:{year:1815,month:1,day:1}}, iso) &&
      !/^\d{4}-\d{2}-\d{2}$/.test(iso))
    throw Error('Invalid historical review date');
  if (!validateHistoricalPeriod({kind:'snapshot',at:
      {year:Number(iso.slice(0,4)),month:Number(iso.slice(5,7)),day:Number(iso.slice(8,10))}}))
    throw Error('Invalid historical review date');

  const active = catalog.versions.filter(v => historicalDateInPeriod(v.period, iso));
  const versions = new Map(active.map(v => [v.id, v]));
  const byQualification = new Map(qualification.relations.map(r => [r.id, r]));
  const children = new Map(), parentIds = new Set(), rejected = [];
  for (const rel of catalog.hierarchy) {
    if (!versions.has(rel.parentVersionId) || !versions.has(rel.childVersionId) ||
        !historicalDateInPeriod(rel.period, iso)) continue;
    const audit = byQualification.get(rel.id);
    if (audit.decision === 'blocked_spatial_contradiction') {
      rejected.push({relationId: rel.id, childVersionId: rel.childVersionId,
        parentVersionId: rel.parentVersionId, reason: audit.decision});
      continue;
    }
    const edges = children.get(rel.parentVersionId) || [];
    edges.push({versionId: rel.childVersionId, relationId: rel.id,
      candidate: true, reviewRequired: audit.decision === 'requires_boundary_reconciliation',
      outsidePercent: audit.outsidePercentEqualArea});
    children.set(rel.parentVersionId, edges);
    parentIds.add(rel.childVersionId);
  }
  for (const edges of children.values())
    edges.sort((a,b) => (versions.get(a.versionId)?.name.ro || '')
      .localeCompare(versions.get(b.versionId)?.name.ro || '', 'ro'));
  const roots = active.filter(v => ROOTS.has(v.sourceShapeId) && !parentIds.has(v.id))
    .sort((a,b)=>a.sourceShapeId - b.sourceShapeId);
  const unlinked = active.filter(v => !ROOTS.has(v.sourceShapeId) &&
    !parentIds.has(v.id));
  return {roots, children, unlinked, rejected,
    candidateRelations: [...children.values()].reduce((n,a)=>n+a.length,0),
    qualifiedRelations: 0};
}
