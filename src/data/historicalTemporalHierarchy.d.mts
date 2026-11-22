import type { EvidenceStatus, HistoricalPeriod } from './historicalAdminBridge.mjs';

export type HistoricalHierarchyKind = 'administrative'|'statistical'|'editorial';

export interface HistoricalVersionRef {
  id: string;
  entityId: string;
  period: HistoricalPeriod;
}

export interface HistoricalHierarchyLink {
  id: string;
  parentVersionId: string;
  childVersionId: string;
  /** Distinguishes parallel legal/de facto/other documented administrations. */
  perspectiveId: string;
  /** Editorial category is NOT legal administrative parentage. */
  kind: HistoricalHierarchyKind;
  period: HistoricalPeriod;
  evidenceStatus: EvidenceStatus;
  sourceIds: string[];
}

export function validateTemporalHierarchy(
  versions: readonly HistoricalVersionRef[], links: readonly HistoricalHierarchyLink[]
): { ok: boolean; errors: string[] };

export function childrenForHistoricalYear(
  links: readonly HistoricalHierarchyLink[], parentVersionId: string,
  year: number, perspectiveId: string
): { childVersionId: string; kind: HistoricalHierarchyKind; relationId: string }[];

export function parentsForHistoricalYear(
  links: readonly HistoricalHierarchyLink[], childVersionId: string,
  year: number, perspectiveId: string
): { parentVersionId: string; kind: HistoricalHierarchyKind; relationId: string }[];
