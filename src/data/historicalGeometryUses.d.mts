import type { HistoricalPeriod } from './historicalAdminBridge.mjs';

export interface HistoricalGeometryRecord {
  geometryId: string;
  /** Source-exact SHA-256; hash policy is declared separately. */
  canonicalHash: string;
  hashMethod?: string;
  sourceShapeIds?: number[];
  evidenceStatus?: 'qualified'|'candidate'|'in_review';
  boundaryCertification?: string;
  geometryAvailable?: boolean;
}

export interface HistoricalGeometryUse {
  useId: string;
  geometryId: string;
  entityId: string;
  versionId: string;
  entityName: { ro: string; en?: string };
  period: HistoricalPeriod;
  sourceIds: string[];
  evidenceStatus: 'qualified'|'candidate'|'in_review';
  notes?: { ro?: string; en?: string };
}

/** Global labels from the same website-wide App.WORDS[lang]. */
export interface GeometryUsageLabels {
  geometryUsesTitle: string;
  geometryUsesNote: string;
  geometryUseStatus: string;
  geometryUseNoSource: string;
  geometryEvidenceQualified: string;
  geometryEvidenceCandidate: string;
  geometryEvidenceReview: string;
  referenceDatePrefix: string;
  source: string;
}

export interface HistoricalGeometryVersionRef {
  id: string;
  entityId: string;
  geometryId: string;
  period: HistoricalPeriod;
}

export function sortHistoricalGeometryUses(uses: readonly HistoricalGeometryUse[]): HistoricalGeometryUse[];
export function historicalUsesForGeometry(uses: readonly HistoricalGeometryUse[], geometryId: string): HistoricalGeometryUse[];
export function formatHistoricalUse(use: HistoricalGeometryUse, lang: 'ro'|'en', labels: Pick<GeometryUsageLabels,'referenceDatePrefix'>): string;
export function validateHistoricalGeometryRegister(
  geometries: readonly HistoricalGeometryRecord[], uses: readonly HistoricalGeometryUse[],
  versions?: readonly HistoricalGeometryVersionRef[]
): {geometryCount: number; usageCount: number};
