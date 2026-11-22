/**
 * HIST-MODULE.1 — one geometry asset, any number of source-dated uses.
 * HistoricalPeriod is imported from HIST-MODULE.0: there is exactly ONE
 * temporal contract for catalogues, hierarchy, bridges and card chronology.
 */
import { validateHistoricalPeriod, formatHistoricalPeriod } from './historicalAdminBridge.mjs';

const EVIDENCE = new Set(['qualified', 'candidate', 'in_review']);

function assertUse(use) {
  if (!use || typeof use !== 'object' || !['useId', 'geometryId', 'entityId', 'versionId']
    .every(k => typeof use[k] === 'string' && use[k].length > 0) ||
    !use.entityName || typeof use.entityName.ro !== 'string' ||
    !use.entityName.ro.length || !validateHistoricalPeriod(use.period) ||
    !Array.isArray(use.sourceIds) || !use.sourceIds.length ||
    !use.sourceIds.every(x => typeof x === 'string' && x.length > 0) ||
    !EVIDENCE.has(use.evidenceStatus)) {
    throw Error('Invalid historical geometry use');
  }
}

function startDate(use) {
  return use.period.kind === 'snapshot' ? use.period.at : use.period.start;
}

function endDate(use) {
  return use.period.kind === 'snapshot' ? use.period.at : use.period.end;
}

function orderDate(a, b, nullLast) {
  if (!a) return b ? (nullLast ? 1 : -1) : 0;
  if (!b) return nullLast ? -1 : 1;
  return a.year - b.year || (a.month ?? 0) - (b.month ?? 0) ||
    (a.day ?? 0) - (b.day ?? 0);
}

export function sortHistoricalGeometryUses(uses) {
  if (!Array.isArray(uses)) throw TypeError('Uses must be an array');
  const indexed = uses.map((use, index) => { assertUse(use); return {use, index}; });
  return indexed.sort((a, b) =>
    orderDate(startDate(a.use), startDate(b.use), true) ||
    orderDate(endDate(a.use), endDate(b.use), false) ||
    a.index - b.index).map(x => x.use);
}

export function historicalUsesForGeometry(uses, geometryId) {
  if (typeof geometryId !== 'string' || !geometryId.length)
    throw Error('Invalid geometry ID');
  return sortHistoricalGeometryUses(uses.filter(use => use.geometryId === geometryId));
}

/**
 * Display intervals ONLY as yearX–yearY. Full day/month precision is preserved
 * in the source records and used in temporal decisions. Labels are from the
 * website-global WORDS[lang]; this function owns no independent UI strings.
 */
export function formatHistoricalUse(use, lang, labels) {
  assertUse(use);
  if (!labels || typeof labels.referenceDatePrefix !== 'string')
    throw Error('Global geometry-use translation labels required');
  if (use.period.kind === 'snapshot') {
    return labels.referenceDatePrefix + formatHistoricalPeriod(
      use.period, lang, {snapshotPrefix: ''});
  }
  return formatHistoricalPeriod(use.period, lang);
}

/**
 * SHA-256 must be produced from an explicit, documented normalisation
 * method. No fuzzy matching or deduplication between different sources.
 */
export function validateHistoricalGeometryRegister(geometries, uses, versions = []) {
  if (!Array.isArray(geometries) || !Array.isArray(uses) ||
      !Array.isArray(versions)) throw TypeError('Expected arrays');
  const ids = new Set(), hashes = new Set(), byId = new Map();
  for (const g of geometries) {
    if (!g || typeof g.geometryId !== 'string' || !g.geometryId ||
        typeof g.canonicalHash !== 'string' || !/^[a-f0-9]{64}$/i.test(g.canonicalHash))
      throw Error('Invalid geometry record');
    if (ids.has(g.geometryId)) throw Error('Duplicate geometry ID: ' + g.geometryId);
    if (hashes.has(g.canonicalHash)) throw Error('Geometry fingerprint is stored more than once');
    ids.add(g.geometryId); hashes.add(g.canonicalHash); byId.set(g.geometryId, g);
  }
  const versionById = new Map(versions.map(v => [v.id, v]));
  const useIds = new Set();
  for (const use of uses) {
    assertUse(use);
    if (!ids.has(use.geometryId)) throw Error('Unknown geometry: ' + use.geometryId);
    if (useIds.has(use.useId)) throw Error('Duplicate temporal use: ' + use.useId);
    useIds.add(use.useId);
    if (versions.length) {
      const v = versionById.get(use.versionId);
      if (!v || v.entityId !== use.entityId || v.geometryId !== use.geometryId ||
        JSON.stringify(v.period) !== JSON.stringify(use.period))
        throw Error('Geometry use does not match its historical version: ' + use.useId);
    }
  }
  return {geometryCount: ids.size, usageCount: uses.length};
}
