/**
 * HIST-MODULE.0 — cross-module identity/territory bridge.
 * Read-only, pure operations. ACTUAL OSM/SIRUTA/CUATM/NUTS identities are never
 * inferred from names, geometry overlap, or historical entity names.
 *
 * There are no production links in this module. Data admission is an explicit,
 * separately reviewed operation.
 */

export const BRIDGE_KINDS = Object.freeze([
  'institutional_continuity',
  'administrative_succession',
  'territorial_overlap',
  'identical_boundary'
]);

export const BRIDGE_EVIDENCE = Object.freeze(['qualified', 'candidate', 'in_review']);

function plain(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function nonEmpty(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function validDate(date) {
  if (!plain(date) || !Number.isInteger(date.year) || date.year === 0) return false;
  if (date.month !== undefined && (!Number.isInteger(date.month) || date.month < 1 || date.month > 12)) return false;
  if (date.day !== undefined) {
    if (date.month === undefined || !Number.isInteger(date.day) || date.day < 1) return false;
    const leap = date.year % 4 === 0 && (date.year % 100 !== 0 || date.year % 400 === 0);
    const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][date.month - 1];
    if (date.day > days) return false; // Proleptic Gregorian date validation.
  }
  return true;
}

function dateValue(date, bound) {
  if (date === null) return bound === 'start' ? -Infinity : Infinity;
  return date.year * 372 + (date.month || (bound === 'start' ? 1 : 12)) * 31 +
    (date.day || (bound === 'start' ? 1 : 31));
}

/** A cartographic attestation is NOT a verified duration. */
export function validateHistoricalPeriod(period) {
  if (!plain(period)) return false;
  if (period.kind === 'snapshot') return validDate(period.at) &&
    period.start === undefined && period.end === undefined;
  if (period.kind !== 'interval' || !Object.hasOwn(period, 'start') ||
      !Object.hasOwn(period, 'end')) return false;
  if (period.start !== null && !validDate(period.start)) return false;
  if (period.end !== null && !validDate(period.end)) return false;
  if (period.start === null && period.end === null) return false;
  return dateValue(period.start, 'start') <= dateValue(period.end, 'end');
}

function formattedYear(date, lang) {
  const year = Math.abs(date.year);
  return String(year) + (date.year < 0 ? (lang === 'en' ? ' BCE' : ' î.Hr.') : '');
}

/**
 * Public periods use yearX–yearY, even when source precision includes a month
 * or day. Exact dates remain in the underlying record.
 * Unknown bounds stay visibly unknown; a snapshot is only an attestation.
 */
export function formatHistoricalPeriod(period, lang = 'ro', options = null) {
  if (!validateHistoricalPeriod(period)) throw new Error('Invalid historical period');
  if (period.kind === 'snapshot')
    return (typeof options?.snapshotPrefix === 'string' ? options.snapshotPrefix :
      (lang === 'en' ? 'Attested in ' : 'Atestat în ')) + formattedYear(period.at, lang);
  return (period.start === null ? '?' : formattedYear(period.start, lang)) + '–' +
    (period.end === null ? '?' : formattedYear(period.end, lang));
}

/** Only confirmed start/end intervals support arbitrary-year membership. */
export function periodContainsYear(period, year) {
  if (!validateHistoricalPeriod(period) || !Number.isInteger(year) || year === 0) return false;
  if (period.kind === 'snapshot') return period.at.year === year;
  if (period.start === null || period.end === null) return false;
  return period.start.year <= year && year <= period.end.year;
}

function validGeometryComparison(c) {
  return plain(c) &&
    nonEmpty(c.historicalGeometryId) && nonEmpty(c.actualGeometryId) &&
    nonEmpty(c.crs) && nonEmpty(c.method) &&
    Number.isFinite(c.historicalCoveragePercent) &&
    Number.isFinite(c.actualCoveragePercent) &&
    c.historicalCoveragePercent >= 0 && c.historicalCoveragePercent <= 100 &&
    c.actualCoveragePercent >= 0 && c.actualCoveragePercent <= 100;
}

/**
 * The registry references the current certified catalogue, but never embeds
 * or mutates it. historicalVersionIds must come from the separately admitted
 * Historical catalogue.
 */
export function validateHistoricalAdminBridge(links, reference) {
  const errors = [];
  if (!Array.isArray(links)) return { ok: false, errors: ['links must be an array'] };
  const actualIds = new Set(reference?.actualIds || []);
  const historicalEntityIds = new Set(reference?.historicalEntityIds || []);
  const historicalVersionIds = new Set(reference?.historicalVersionIds || []);
  const snapshot = reference?.actualSnapshotDate;
  if (!nonEmpty(snapshot)) errors.push('actualSnapshotDate is required');
  const ids = new Set();
  const pairs = new Set();
  for (let i = 0; i < links.length; i++) {
    const r = links[i];
    const tag = 'links[' + i + ']';
    if (!plain(r)) { errors.push(tag + ' must be an object'); continue; }
    if (!nonEmpty(r.id) || ids.has(r.id)) errors.push(tag + ' duplicate or absent id');
    else ids.add(r.id);
    if (!actualIds.has(r.actualId)) errors.push(tag + ' unknown ACTUAL id');
    if (!historicalEntityIds.has(r.historicalEntityId)) errors.push(tag + ' unknown Historical entity');
    if (!historicalVersionIds.has(r.historicalVersionId)) errors.push(tag + ' unknown Historical version');
    if (!BRIDGE_KINDS.includes(r.kind)) errors.push(tag + ' invalid relation kind');
    if (!BRIDGE_EVIDENCE.includes(r.evidenceStatus)) errors.push(tag + ' invalid evidence status');
    if (!validateHistoricalPeriod(r.historicalPeriod)) errors.push(tag + ' invalid historical period');
    if (r.actualSnapshotDate !== snapshot) errors.push(tag + ' ACTUAL snapshot mismatch');
    if (!Array.isArray(r.sourceIds) || !r.sourceIds.length ||
        !r.sourceIds.every(nonEmpty)) errors.push(tag + ' source evidence required');
    if (r.kind === 'territorial_overlap' || r.kind === 'identical_boundary') {
      if (r.evidenceStatus === 'qualified' && !validGeometryComparison(r.geometryComparison))
        errors.push(tag + ' qualified spatial relation needs measured comparison');
      if (r.geometryComparison !== undefined && !validGeometryComparison(r.geometryComparison))
        errors.push(tag + ' invalid geometry comparison');
    }
    if (r.geometryComparison !== undefined && !validGeometryComparison(r.geometryComparison))
      errors.push(tag + ' invalid geometry comparison');
    const key = [r.actualId, r.historicalEntityId, r.historicalVersionId, r.kind,
      JSON.stringify(r.historicalPeriod)].join('|');
    if (pairs.has(key)) errors.push(tag + ' duplicate semantic relation');
    pairs.add(key);
  }
  return { ok: errors.length === 0, errors };
}

function byTime(a, b) {
  const d = p => p.kind === 'snapshot' ? p.at : p.start;
  const y = p => d(p) === null ? -Infinity : d(p)?.year ?? -Infinity;
  return y(a.historicalPeriod) - y(b.historicalPeriod) || a.id.localeCompare(b.id);
}

/** Entries remain distinct: many-to-many, not a guessed one-to-one match. */
export function historicalLinksForActual(links, actualId, qualifiedOnly = false) {
  return links.filter(r => r.actualId === actualId &&
    (!qualifiedOnly || r.evidenceStatus === 'qualified')).sort(byTime);
}

export function actualLinksForHistorical(links, historicalEntityId, qualifiedOnly = false) {
  return links.filter(r => r.historicalEntityId === historicalEntityId &&
    (!qualifiedOnly || r.evidenceStatus === 'qualified')).sort(byTime);
}

/**
 * Never navigate on a candidate or unreviewed match. The UI must present a
 * choice when multiple qualified matches exist; do not pick the first one.
 */
export function navigationTargetForBridge(link, fromModule) {
  if (!link || link.evidenceStatus !== 'qualified') return null;
  if (fromModule === 'administrative') {
    return { module: 'historical', entityId: link.historicalEntityId,
      versionId: link.historicalVersionId, period: link.historicalPeriod };
  }
  if (fromModule === 'historical') return { module: 'administrative', entityId: link.actualId };
  return null;
}
