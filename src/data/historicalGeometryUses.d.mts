export interface HistoricalDate {
  /** Astronomical year zero is not accepted; negative years represent BCE. */
  year: number;
  month?: number;
  day?: number;
  qualifier?: 'circa' | 'before' | 'after';
}

export interface HistoricalGeometryRecord {
  geometryId: string;
  /** Exact canonical GIS fingerprint, computed outside this registry. */
  canonicalHash: string;
}

export interface HistoricalGeometryUse {
  /** Stable usage ID, distinct from geometryId and entityId. */
  useId: string;
  geometryId: string;
  entityId: string;
  entityName: { ro: string; en?: string };
  /** A dated source snapshot is NOT proof of a multi-year interval. */
  kind: 'reference' | 'interval';
  at?: HistoricalDate;
  from?: HistoricalDate;
  to?: HistoricalDate;
  sourceIds: string[];
  evidenceStatus: 'qualified' | 'candidate' | 'in_review';
  notes?: { ro?: string; en?: string };
}

export function sortHistoricalGeometryUses(uses: readonly HistoricalGeometryUse[]): HistoricalGeometryUse[];
export function historicalUsesForGeometry(uses: readonly HistoricalGeometryUse[], geometryId: string): HistoricalGeometryUse[];
export function formatHistoricalDate(date: HistoricalDate | null | undefined, lang?: 'ro' | 'en'): string;
export function formatHistoricalUse(use: HistoricalGeometryUse, lang?: 'ro' | 'en'): string;
export function validateHistoricalGeometryRegister(
  geometries: readonly HistoricalGeometryRecord[],
  uses: readonly HistoricalGeometryUse[]
): { geometryCount: number; usageCount: number };
