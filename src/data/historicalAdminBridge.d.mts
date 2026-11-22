export interface HistoricalDate {
  /** Historical year, using negative values for BCE; year 0 is invalid. */
  year: number;
  month?: number;
  day?: number;
}
export type HistoricalPeriod =
  | { kind: 'snapshot'; at: HistoricalDate }
  | { kind: 'interval'; start: HistoricalDate | null; end: HistoricalDate | null };

export type BridgeKind =
  | 'institutional_continuity'
  | 'administrative_succession'
  | 'territorial_overlap'
  | 'identical_boundary';

export type EvidenceStatus = 'qualified' | 'candidate' | 'in_review';

export interface GeometryComparison {
  historicalGeometryId: string;
  actualGeometryId: string;
  crs: string;
  method: string;
  /** Measured % of the historical territory intersecting ACTUAL. */
  historicalCoveragePercent: number;
  /** Measured % of ACTUAL territory intersecting historical. */
  actualCoveragePercent: number;
}

export interface HistoricalAdminLink {
  id: string;
  actualId: string;
  historicalEntityId: string;
  historicalVersionId: string;
  historicalPeriod: HistoricalPeriod;
  /** Snapshot date for the immutable ACTUAL release used in this comparison. */
  actualSnapshotDate: string;
  kind: BridgeKind;
  evidenceStatus: EvidenceStatus;
  sourceIds: string[];
  geometryComparison?: GeometryComparison;
}

export interface BridgeReferenceCatalogues {
  actualIds: Iterable<string>;
  historicalEntityIds: Iterable<string>;
  historicalVersionIds: Iterable<string>;
  actualSnapshotDate: string;
}

export declare const BRIDGE_KINDS: readonly BridgeKind[];
export declare const BRIDGE_EVIDENCE: readonly EvidenceStatus[];
export function validateHistoricalPeriod(period: unknown): period is HistoricalPeriod;
export function formatHistoricalPeriod(period: HistoricalPeriod, lang?: 'ro'|'en', options?: {snapshotPrefix?: string} | null): string;
export function periodContainsYear(period: HistoricalPeriod, year: number): boolean;
export function validateHistoricalAdminBridge(
  links: readonly HistoricalAdminLink[],
  reference: BridgeReferenceCatalogues
): { ok: boolean; errors: string[] };
export function historicalLinksForActual(
  links: readonly HistoricalAdminLink[], actualId: string, qualifiedOnly?: boolean
): HistoricalAdminLink[];
export function actualLinksForHistorical(
  links: readonly HistoricalAdminLink[], historicalEntityId: string, qualifiedOnly?: boolean
): HistoricalAdminLink[];
export function navigationTargetForBridge(
  link: HistoricalAdminLink, fromModule: 'administrative'|'historical'
): { module: 'historical'; entityId: string; versionId: string; period: HistoricalPeriod }
  | { module: 'administrative'; entityId: string } | null;
