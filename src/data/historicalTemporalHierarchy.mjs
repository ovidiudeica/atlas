/**
 * HIST-MODULE.0 — temporal parent/child contract, separate from ACTUAL.
 * Parentage is asserted from qualified historical evidence, not polygon
 * containment. A snapshot does not prove an administrative interval.
 */
import { periodContainsYear, validateHistoricalPeriod } from './historicalAdminBridge.mjs';

const RELATION_KINDS = new Set(['administrative', 'statistical', 'editorial']);
const EVIDENCE_STATUSES = new Set(['qualified', 'candidate', 'in_review']);

function nonEmpty(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function boundedInterval(p) {
  return p?.kind === 'interval' && p.start !== null && p.end !== null;
}

function starts(p) {
  if (p?.kind !== 'interval' || p.start === null) return -Infinity;
  return p.start.year;
}

function ends(p) {
  if (p?.kind !== 'interval' || p.end === null) return Infinity;
  return p.end.year;
}

function intersects(a, b) {
  if (!validateHistoricalPeriod(a) || !validateHistoricalPeriod(b)) return false;
  if (a.kind !== 'interval' || b.kind !== 'interval') return false;
  return starts(a) <= ends(b) && starts(b) <= ends(a);
}

function covers(outer, inner) {
  if (!validateHistoricalPeriod(outer) || !validateHistoricalPeriod(inner)) return false;
  if (inner.kind !== 'interval' || !boundedInterval(inner)) return false;
  if (outer.kind !== 'interval') return false;
  return starts(outer) <= starts(inner) && ends(outer) >= ends(inner);
}

function fullyActive(link, year) {
  return link.evidenceStatus === 'qualified' &&
    boundedInterval(link.period) && periodContainsYear(link.period, year);
}

function probeYears(links) {
  // Boundary years and every nonempty gap's midpoint are sufficient to detect
  // integer-year membership changes without scanning millennia.
  const boundaries = new Set();
  for (const link of links) if (boundedInterval(link.period)) {
    boundaries.add(link.period.start.year);
    boundaries.add(link.period.end.year);
  }
  const ordered = [...boundaries].sort((a, b) => a - b);
  const probe = new Set(ordered);
  for (let i = 1; i < ordered.length; i++) {
    const midpoint = Math.floor((ordered[i - 1] + ordered[i]) / 2);
    if (midpoint !== 0) probe.add(midpoint);
  }
  return [...probe].filter(y => y !== 0);
}

function cyclesAtYear(active, year, errors) {
  const map = new Map();
  for (const link of active) {
    const key = link.perspectiveId + '|' + link.kind;
    const edges = map.get(key) || new Map();
    const targets = edges.get(link.parentVersionId) || new Set();
    targets.add(link.childVersionId);
    edges.set(link.parentVersionId, targets);
    map.set(key, edges);
  }
  for (const [perspective, edges] of map) {
    const visited = new Set(), visiting = new Set();
    const dfs = node => {
      if (visiting.has(node)) return true;
      if (visited.has(node)) return false;
      visiting.add(node);
      for (const to of edges.get(node) || []) if (dfs(to)) return true;
      visiting.delete(node);
      visited.add(node);
      return false;
    };
    for (const node of edges.keys()) if (dfs(node)) {
      errors.push('cyclic hierarchy in ' + perspective + ' at ' + year);
      break;
    }
  }
}

/**
 * Versions have {id, entityId, period}. Links are temporal, typed assertions.
 * A grouping row may be editorial; this is never converted to legal parentage.
 * Competing historical administrations use distinct perspectiveId values.
 */
export function validateTemporalHierarchy(versions, links) {
  const errors = [];
  if (!Array.isArray(versions) || !Array.isArray(links)) {
    return { ok: false, errors: ['versions and links must be arrays'] };
  }
  const versionById = new Map();
  for (const v of versions) {
    if (!v || !nonEmpty(v.id) || !nonEmpty(v.entityId) ||
        !validateHistoricalPeriod(v.period) || versionById.has(v.id)) {
      errors.push('invalid or duplicate historical version ' + String(v?.id));
      continue;
    }
    versionById.set(v.id, v);
  }
  const ids = new Set();
  const semantic = new Set();
  for (let i = 0; i < links.length; i++) {
    const r = links[i], tag = 'links[' + i + ']';
    if (!r || typeof r !== 'object' || Array.isArray(r)) {
      errors.push(tag + ' invalid relation'); continue;
    }
    if (!nonEmpty(r.id) || ids.has(r.id)) errors.push(tag + ' invalid or duplicate id');
    else ids.add(r.id);
    if (!RELATION_KINDS.has(r.kind)) errors.push(tag + ' invalid kind');
    if (!EVIDENCE_STATUSES.has(r.evidenceStatus)) errors.push(tag + ' invalid status');
    if (!nonEmpty(r.perspectiveId)) errors.push(tag + ' missing administrative perspective');
    if (!versionById.has(r.parentVersionId) || !versionById.has(r.childVersionId))
      errors.push(tag + ' unknown parent/child version');
    if (r.parentVersionId === r.childVersionId) errors.push(tag + ' self-parent');
    if (!validateHistoricalPeriod(r.period)) errors.push(tag + ' invalid interval');
    if (!Array.isArray(r.sourceIds) || !r.sourceIds.length || !r.sourceIds.every(nonEmpty))
      errors.push(tag + ' documentary sources required');
    if (r.evidenceStatus === 'qualified') {
      if (!boundedInterval(r.period)) errors.push(tag + ' qualification needs bounded interval');
      const p = versionById.get(r.parentVersionId);
      const c = versionById.get(r.childVersionId);
      if (p && !covers(p.period, r.period)) errors.push(tag + ' parent version does not cover relationship');
      if (c && !covers(c.period, r.period)) errors.push(tag + ' child version does not cover relationship');
    }
    const key = [r.parentVersionId, r.childVersionId, r.kind, r.perspectiveId,
      JSON.stringify(r.period)].join('|');
    if (semantic.has(key)) errors.push(tag + ' repeated relationship');
    semantic.add(key);
  }

  const qualified = links.filter(r => r && r.evidenceStatus === 'qualified' &&
    boundedInterval(r.period) && RELATION_KINDS.has(r.kind) &&
    nonEmpty(r.perspectiveId));
  for (const year of probeYears(qualified)) {
    const active = qualified.filter(r => fullyActive(r, year));
    const parents = new Map();
    for (const r of active) {
      if (r.kind !== 'administrative') continue;
      const k = r.perspectiveId + '|' + r.childVersionId;
      const existing = parents.get(k);
      if (existing && existing !== r.parentVersionId) {
        errors.push('multiple administrative parents in the same perspective for ' +
          r.childVersionId + ' at ' + year);
      }
      parents.set(k, r.parentVersionId);
    }
    cyclesAtYear(active, year, errors);
  }
  return { ok: errors.length === 0, errors: [...new Set(errors)] };
}

/**
 * Only qualified, bounded relationships become navigable tree edges. Candidate
 * and snapshot-only links remain visible as evidence but not certified nodes.
 */
export function childrenForHistoricalYear(links, parentVersionId, year, perspectiveId) {
  return links.filter(link => link.parentVersionId === parentVersionId &&
    link.perspectiveId === perspectiveId && fullyActive(link, year))
    .map(link => ({ childVersionId: link.childVersionId, kind: link.kind,
      relationId: link.id }));
}

export function parentsForHistoricalYear(links, childVersionId, year, perspectiveId) {
  return links.filter(link => link.childVersionId === childVersionId &&
    link.perspectiveId === perspectiveId && fullyActive(link, year))
    .map(link => ({ parentVersionId: link.parentVersionId, kind: link.kind,
      relationId: link.id }));
}
