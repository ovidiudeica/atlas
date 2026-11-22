import type { HistoricalPeriod } from './historicalAdminBridge.mjs';
import type { PilotHistoricalCatalog, HistoricalVersion } from './historicalCatalog.mjs';

export type SpatialReviewDecision =
 'spatially_consistent_source_candidate'|
 'requires_boundary_reconciliation'|
 'blocked_spatial_contradiction';

export interface HistoricalRelationQualification {
  id: string;
  decision: SpatialReviewDecision;
  outsidePercentEqualArea: number;
  overlapPercentEqualArea: number;
  qualifiedAsHistoricalBoundary: false;
  note: string;
}

export interface HistoricalQualification {
  schema: 'hist-pilot-qualification-v1';
  sourceArchiveSha256: string;
  evaluation: {
    projection: 'EPSG:3035';
    method: string;
    temporal: string;
    status: string;
    thresholds: {
      excludeOutsidePercent: number;
      requiresReconciliationOutsidePercent: number;
    };
  };
  counts: Record<SpatialReviewDecision,number>;
  relations: HistoricalRelationQualification[];
}
export interface HistoricalReviewEdge {
  versionId: string;
  relationId: string;
  candidate: true;
  reviewRequired: boolean;
  outsidePercent: number;
}
export interface HistoricalReviewTree {
  roots: HistoricalVersion[];
  children: Map<string,HistoricalReviewEdge[]>;
  unlinked: HistoricalVersion[];
  rejected: {
    relationId:string;childVersionId:string;parentVersionId:string;reason:string
  }[];
  candidateRelations: number;
  qualifiedRelations: 0;
}
export const PILOT_ROOT_IDS:readonly number[];
export const PILOT_PERSPECTIVE: string;
export const REVIEW_DECISIONS:readonly SpatialReviewDecision[];
export function validateHistoricalQualification(
  catalog:PilotHistoricalCatalog,qualification:HistoricalQualification
):{ok:boolean;errors:string[]};
export function loadHistoricalPilotQualification(
  catalog:PilotHistoricalCatalog,baseUrl?:string
):Promise<HistoricalQualification>;
export function historicalDateInPeriod(
  period:HistoricalPeriod,iso:string
):boolean;
export function buildHistoricalReviewTree(
  catalog:PilotHistoricalCatalog,qualification:HistoricalQualification,iso:string
):HistoricalReviewTree;
