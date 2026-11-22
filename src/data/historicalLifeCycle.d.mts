import type { HistoricalPeriod, EvidenceStatus } from './historicalAdminBridge.mjs';

export type HistoricalEventKind =
  'establishment'|'abolition'|'rename'|'status_change'|
  'administrative_reform'|'parent_change'|'boundary_change'|
  'territorial_transfer'|'division'|'merger'|'capital_change'|'symbol_change';
export type HistoricalSymbolKind = 'flag'|'coat'|'seal'|'emblem';
export type GeometryDecisionStatus = 'admitted'|'provisional'|'undecided';

export interface HistoricalEvent {
  id:string;
  kind:HistoricalEventKind;
  when:HistoricalPeriod;
  entityIds:string[];
  predecessorEntityIds?:string[];
  successorEntityIds?:string[];
  relatedGeometryIds?:string[];
  description:{ro:string;en:string};
  evidenceStatus:EvidenceStatus;
  sourceIds:string[];
}
export interface HistoricalSymbolUse {
  id:string;
  entityId:string;
  kind:HistoricalSymbolKind;
  period:HistoricalPeriod;
  evidenceStatus:EvidenceStatus;
  rightsStatus:'cleared'|'unknown'|'restricted';
  sourceIds:string[];
  official:boolean;
  approvalSourceIds?:string[];
  assetPath?:string;
}
export interface HistoricalGeometryDecision {
  id:string;
  versionId:string;
  period:HistoricalPeriod;
  status:GeometryDecisionStatus;
  evidenceStatus:EvidenceStatus;
  selectedGeometryId:string|null;
  alternativeGeometryIds:string[];
  rationale:string;
  sourceIds:string[];
}

export interface LifeCycleReferences {
  entities:readonly {id:string}[];
  versions:readonly {id:string;period:HistoricalPeriod}[];
  geometries:readonly {geometryId:string}[];
  sources:readonly {id:string}[];
  events?:readonly HistoricalEvent[];
  symbols?:readonly HistoricalSymbolUse[];
  geometryDecisions?:readonly HistoricalGeometryDecision[];
}

export const HISTORICAL_EVENT_TYPES:readonly HistoricalEventKind[];
export const HISTORICAL_SYMBOL_TYPES:readonly HistoricalSymbolKind[];
export const GEOMETRY_DECISION_STATUS:readonly GeometryDecisionStatus[];
export function validateHistoricalLifeCycle(records:LifeCycleReferences): {
  ok:boolean;errors:string[];
};
