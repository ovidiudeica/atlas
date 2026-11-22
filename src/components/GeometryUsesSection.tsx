import { EntityCardSection } from './EntityCardSection';
import {
  formatHistoricalUse, historicalUsesForGeometry,
  type GeometryUsageLabels, type HistoricalGeometryUse
} from '../data/historicalGeometryUses.mjs';

export interface GeometryUsesSectionProps {
  geometryId: string;
  uses: readonly HistoricalGeometryUse[];
  /** The current website-wide EN/RO selection; never held locally. */
  lang: 'ro' | 'en';
  /** The global translated labels (App.WORDS[lang]), shared by every module. */
  labels: GeometryUsageLabels;
}

/**
 * Shared Entity-panel subsection for a geometry referenced in any module.
 * Content and dates follow the site's existing language selection; there is
 * no module-specific bilingual component or additional translation state.
 *
 * The partial HistoGIS pilot provides source-attributed candidates; admission and UI activation stay separate.
 * Rendering does not fetch or duplicate geometries or modify ACTUAL.
 */
export function GeometryUsesSection({ geometryId, uses, lang, labels }: GeometryUsesSectionProps) {
  const entries = historicalUsesForGeometry(uses, geometryId);
  if (!entries.length) return null;

  const status: Record<HistoricalGeometryUse['evidenceStatus'], string> = {
    qualified: labels.geometryEvidenceQualified,
    candidate: labels.geometryEvidenceCandidate,
    in_review: labels.geometryEvidenceReview
  };

  return <EntityCardSection title={labels.geometryUsesTitle} kind="cartographic">
    <p className="note">{labels.geometryUsesNote}</p>
    <ol className="historical-geometry-uses" style={{ paddingInlineStart: '1.5rem', margin: '0.75rem 0' }}>
      {entries.map(use => <li key={use.useId} style={{ padding: '0.25rem 0 0.75rem' }}>
        <strong>{formatHistoricalUse(use, lang, labels)}</strong>
        <div>{use.entityName[lang] || use.entityName.ro}</div>
        <div className="note">{labels.geometryUseStatus}: {status[use.evidenceStatus]}</div>
        <div className="note">{labels.source}: {use.sourceIds.length ?
          use.sourceIds.join(', ') : labels.geometryUseNoSource}</div>
        {use.notes?.[lang] && <p className="note">{use.notes[lang]}</p>}
      </li>)}
    </ol>
  </EntityCardSection>;
}
