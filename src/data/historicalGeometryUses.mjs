/**
 * HIST-MODULE.1 — immutable, one-to-many historical geometry usage register.
 *
 * A geometry is stored once; historical uses point to its geometryId.
 * Historical dates describe source-supported use, not inferred boundary validity.
 * Geometry fingerprints must be produced by a separate canonical GIS pipeline.
 */
const MONTHS = {
  ro: ['ianuarie','februarie','martie','aprilie','mai','iunie','iulie','august','septembrie','octombrie','noiembrie','decembrie'],
  en: ['January','February','March','April','May','June','July','August','September','October','November','December']
};

function assertDate(date) {
  if (date === undefined || date === null) return;
  if (!Number.isInteger(date.year) || date.year === 0) throw Error('Historical date must have a nonzero integer year');
  if (date.month !== undefined && (!Number.isInteger(date.month) || date.month < 1 || date.month > 12)) {
    throw Error('Invalid historical date month');
  }
  if (date.day !== undefined && (date.month === undefined || !Number.isInteger(date.day) || date.day < 1 || date.day > 31)) {
    throw Error('Invalid historical date day');
  }
}

function startOf(use) {
  return use.kind === 'reference' ? use.at : use.from;
}

function compareDates(a, b) {
  if (!a) return b ? 1 : 0; // Undated records appear after dated records.
  if (!b) return -1;
  return a.year - b.year || (a.month ?? 0) - (b.month ?? 0) || (a.day ?? 0) - (b.day ?? 0);
}

function verifyUse(use) {
  if (!use || !use.geometryId || !use.useId || !use.entityId ||
      !use.entityName || !use.entityName.ro ||
      !['reference', 'interval'].includes(use.kind)) {
    throw Error('Invalid historical geometry use');
  }
  if (use.kind === 'reference') {
    if (!use.at || use.from || use.to) throw Error('Reference use must have at and no interval bounds');
  } else if (use.at) {
    throw Error('Interval use must not have a reference date');
  }
  for (const date of [use.at, use.from, use.to]) assertDate(date);
  if (use.from && use.to && compareDates(use.from, use.to) > 0) {
    throw Error('Historical period end precedes start');
  }
  if (!Array.isArray(use.sourceIds) || use.sourceIds.some(s => typeof s !== 'string' || !s)) {
    throw Error('Historical use needs source IDs (empty array allowed while under review)');
  }
  if (!['qualified', 'candidate', 'in_review'].includes(use.evidenceStatus)) {
    throw Error('Historical use needs explicit evidence status');
  }
}

/** Return a new chronologically ordered list; never change the source inventory. */
export function sortHistoricalGeometryUses(uses) {
  if (!Array.isArray(uses)) throw TypeError('Uses must be an array');
  const indexed = uses.map((use, index) => {
    verifyUse(use);
    return { use, index };
  });
  return indexed.sort((a, b) =>
    compareDates(startOf(a.use), startOf(b.use)) ||
    compareDates(a.use.kind === 'interval' ? a.use.to : a.use.at,
                 b.use.kind === 'interval' ? b.use.to : b.use.at) ||
    a.index - b.index
  ).map(item => item.use);
}

/** All temporal and cross-entity uses of the ONE selected geometry. */
export function historicalUsesForGeometry(uses, geometryId) {
  if (typeof geometryId !== 'string' || !geometryId) throw Error('Invalid geometry ID');
  return sortHistoricalGeometryUses(uses.filter(use => use.geometryId === geometryId));
}

export function formatHistoricalDate(date, lang = 'ro') {
  assertDate(date);
  if (!date) return lang === 'ro' ? 'dată necunoscută' : 'unknown date';
  const language = lang === 'en' ? 'en' : 'ro';
  const year = date.year > 0 ? String(date.year)
    : String(Math.abs(date.year)) + (language === 'ro' ? ' î.Hr.' : ' BCE');
  const day = date.day === undefined ? '' : String(date.day) + ' ';
  const month = date.month === undefined ? '' : MONTHS[language][date.month - 1] + ' ';
  const base = language === 'en' && date.month !== undefined
    ? (date.day === undefined ? month.trim() + ' ' : month + String(date.day) + ', ') + year
    : day + month + year;
  const qualifiers = language === 'ro'
    ? { circa: 'cca ', before: 'înainte de ', after: 'după ' }
    : { circa: 'c. ', before: 'before ', after: 'after ' };
  return (qualifiers[date.qualifier] || '') + base;
}

/**
 * Reference years are snapshots, not implied periods of unchanging borders.
 * Period boundaries may be imprecise; only supplied precision is displayed.
 */
export function formatHistoricalUse(use, lang, labels) {
  verifyUse(use);
  // All user-facing labels come from App's existing global WORDS[lang].
  // No Historical-specific language switch, vocabulary or locale state.
  if (!labels || !['referenceDatePrefix', 'undatedPeriod', 'untilPrefix', 'fromPrefix']
    .every(key => typeof labels[key] === 'string')) {
    throw Error('Global geometry-use translation labels required');
  }
  if (use.kind === 'reference') return labels.referenceDatePrefix + formatHistoricalDate(use.at, lang);
  if (!use.from && !use.to) return labels.undatedPeriod;
  if (!use.from) return labels.untilPrefix + formatHistoricalDate(use.to, lang);
  if (!use.to) return labels.fromPrefix + formatHistoricalDate(use.from, lang);
  return formatHistoricalDate(use.from, lang) + ' – ' + formatHistoricalDate(use.to, lang);
}

/**
 * Validate storage-level uniqueness and referential integrity.
 * Near-equal shapes must NEVER be deduplicated solely by distance/tolerance.
 */
export function validateHistoricalGeometryRegister(geometries, uses) {
  if (!Array.isArray(geometries) || !Array.isArray(uses)) throw TypeError('Expected two arrays');
  const geometryIds = new Set();
  const geometryHashes = new Map();
  for (const item of geometries) {
    if (!item || typeof item.geometryId !== 'string' || !item.geometryId ||
        typeof item.canonicalHash !== 'string' || !item.canonicalHash) throw Error('Invalid geometry record');
    if (geometryIds.has(item.geometryId)) throw Error('Duplicate geometry ID: ' + item.geometryId);
    if (geometryHashes.has(item.canonicalHash)) {
      throw Error('A geometry fingerprint is stored more than once: ' + item.canonicalHash);
    }
    geometryIds.add(item.geometryId);
    geometryHashes.set(item.canonicalHash, item.geometryId);
  }
  const useIds = new Set();
  for (const use of uses) {
    verifyUse(use);
    if (!geometryIds.has(use.geometryId)) throw Error('Unknown geometry: ' + use.geometryId);
    if (useIds.has(use.useId)) throw Error('Duplicate temporal use: ' + use.useId);
    useIds.add(use.useId);
  }
  return { geometryCount: geometryIds.size, usageCount: uses.length };
}
