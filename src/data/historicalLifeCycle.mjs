/**
 * HIST-MODULE.1 — life-cycle, symbols and geometry decision contracts.
 * These are evidence-bearing records, not automatic consequences of GIS
 * containment or identical names. The initial source pilot intentionally
 * contains no such assertions.
 */
import { validateHistoricalPeriod } from './historicalAdminBridge.mjs';

export const HISTORICAL_EVENT_TYPES = Object.freeze([
  'establishment', 'abolition', 'rename', 'status_change',
  'administrative_reform', 'parent_change', 'boundary_change',
  'territorial_transfer', 'division', 'merger', 'capital_change',
  'symbol_change'
]);
export const HISTORICAL_SYMBOL_TYPES = Object.freeze(['flag','coat','seal','emblem']);
export const GEOMETRY_DECISION_STATUS = Object.freeze(['admitted','provisional','undecided']);

const statuses = new Set(['qualified','candidate','in_review']);
const rights = new Set(['cleared','unknown','restricted']);

function nonempty(x) { return typeof x === 'string' && x.trim().length > 0; }
function plain(x) { return x && typeof x === 'object' && !Array.isArray(x); }
function references(arr, known) { return Array.isArray(arr) && arr.every(x => nonempty(x) && known.has(x)); }
function sourcesArePresent(arr, known) { return references(arr, known) && arr.length > 0; }
function unique(arr) { return arr.length === new Set(arr).size; }
function dateValue(d, end) {
  if (d === null) return end ? Infinity : -Infinity;
  return d.year * 10000 + (d.month ?? (end ? 12 : 1)) * 100 +
    (d.day ?? (end ? 31 : 1));
}
function bounds(p) {
  if (!validateHistoricalPeriod(p)) return null;
  if (p.kind === 'snapshot') return [
    dateValue(p.at, false),dateValue(p.at, true)];
  return [dateValue(p.start, false),dateValue(p.end, true)];
}
function contained(outer, inner) {
  const a = bounds(outer), b = bounds(inner);
  return a && b && a[0] <= b[0] && a[1] >= b[1];
}
function intersects(a,b) {
  const aa=bounds(a),bb=bounds(b);
  return aa && bb && aa[0] <= bb[1] && bb[0] <= aa[1];
}

export function validateHistoricalLifeCycle({
  entities=[], versions=[], geometries=[], sources=[],
  events=[], symbols=[], geometryDecisions=[]
} = {}) {
  const errors=[];
  const knownEntities=new Set(entities.map(x=>x.id));
  const knownVersions=new Map(versions.map(x=>[x.id,x]));
  const knownGeometries=new Set(geometries.map(x=>x.geometryId));
  const knownSources=new Set(sources.map(x=>x.id));
  const used={events:new Set(),symbols:new Set(),decisions:new Set()};

  if (!Array.isArray(events) || !Array.isArray(symbols) ||
      !Array.isArray(geometryDecisions))
    return {ok:false,errors:['events, symbols and geometryDecisions must be arrays']};

  for(const e of events) {
    if (!plain(e) || !nonempty(e.id) || used.events.has(e.id)) {
      errors.push('invalid/duplicate event id');continue;
    }
    used.events.add(e.id);
    if (!HISTORICAL_EVENT_TYPES.includes(e.kind) ||
        !validateHistoricalPeriod(e.when) ||
        !statuses.has(e.evidenceStatus) ||
        !sourcesArePresent(e.sourceIds,knownSources))
      errors.push('invalid dated event '+e.id);
    if (!references(e.entityIds,knownEntities) || !e.entityIds.length ||
        !references(e.predecessorEntityIds || [],knownEntities) ||
        !references(e.successorEntityIds || [],knownEntities))
      errors.push('unknown event entities '+e.id);
    if (e.relatedGeometryIds !== undefined &&
        !references(e.relatedGeometryIds,knownGeometries))
      errors.push('unknown event geometry '+e.id);
    const together=[...e.entityIds,...(e.predecessorEntityIds||[]),
      ...(e.successorEntityIds||[])];
    if (!unique(e.entityIds) || !unique(e.predecessorEntityIds||[]) ||
        !unique(e.successorEntityIds||[]))
      errors.push('duplicate event participants '+e.id);
    if (!nonempty(e.description?.ro) || !nonempty(e.description?.en))
      errors.push('event needs translated description '+e.id);
  }

  for(const sym of symbols) {
    if (!plain(sym) || !nonempty(sym.id) || used.symbols.has(sym.id)) {
      errors.push('invalid/duplicate symbol id');continue;
    }
    used.symbols.add(sym.id);
    if (!HISTORICAL_SYMBOL_TYPES.includes(sym.kind) ||
        !knownEntities.has(sym.entityId) ||
        !validateHistoricalPeriod(sym.period) ||
        !statuses.has(sym.evidenceStatus) ||
        !sourcesArePresent(sym.sourceIds,knownSources) ||
        !rights.has(sym.rightsStatus))
      errors.push('invalid historical symbol '+sym.id);
    if (sym.assetPath !== undefined &&
        (!nonempty(sym.assetPath) || sym.rightsStatus !== 'cleared' ||
         sym.evidenceStatus !== 'qualified'))
      errors.push('uncleared/unverified historical symbol asset '+sym.id);
    if (sym.official === true &&
        (!sourcesArePresent(sym.approvalSourceIds,knownSources) ||
         sym.evidenceStatus !== 'qualified'))
      errors.push('official symbol requires an approval source '+sym.id);
  }

  for (const choice of geometryDecisions) {
    if (!plain(choice) || !nonempty(choice.id) ||
        used.decisions.has(choice.id)) {
      errors.push('invalid/duplicate geometry decision id');continue;
    }
    used.decisions.add(choice.id);
    const v=knownVersions.get(choice.versionId);
    const alternatives=choice.alternativeGeometryIds;
    if (!v || !GEOMETRY_DECISION_STATUS.includes(choice.status) ||
        !validateHistoricalPeriod(choice.period) ||
        !statuses.has(choice.evidenceStatus) ||
        !nonempty(choice.rationale) ||
        !sourcesArePresent(choice.sourceIds,knownSources) ||
        !Array.isArray(alternatives) ||
        !references(alternatives,knownGeometries) ||
        !unique(alternatives) ||
        (choice.selectedGeometryId !== null &&
         !knownGeometries.has(choice.selectedGeometryId)) ||
        alternatives.includes(choice.selectedGeometryId))
      errors.push('invalid geometry decision '+choice.id);
    if (v && !contained(v.period,choice.period))
      errors.push('geometry decision outside version '+choice.id);
    if (choice.status === 'admitted' &&
        (choice.evidenceStatus !== 'qualified' || !choice.selectedGeometryId))
      errors.push('admitted geometry requires qualified primary '+choice.id);
    if (choice.status === 'undecided' && choice.selectedGeometryId !== null)
      errors.push('undecided geometry cannot have a primary '+choice.id);
    if (choice.status !== 'undecided' && !choice.selectedGeometryId)
      errors.push('primary geometry required '+choice.id);
  }
  // No two admitted primaries can claim the same version at overlapping dates.
  const admitted=geometryDecisions.filter(d=>d?.status==='admitted' &&
    validateHistoricalPeriod(d.period));
  for(let i=0;i<admitted.length;i++)
    for(let j=i+1;j<admitted.length;j++)
      if(admitted[i].versionId===admitted[j].versionId &&
        intersects(admitted[i].period,admitted[j].period))
        errors.push('overlapping admitted geometry decisions '+admitted[i].versionId);
  return {ok:errors.length===0,errors:[...new Set(errors)]};
}
