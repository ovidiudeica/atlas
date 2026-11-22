import { EntityCardSection } from './EntityCardSection';
import { formatHistoricalUse, historicalUsesForGeometry, type HistoricalGeometryUse } from '../data/historicalGeometryUses.mjs';

export interface HistoricalGeometryUseSectionProps {
  geometryId: string;
  uses: readonly HistoricalGeometryUse[];
  lang: 'ro' | 'en';
}

/**
 * HIST-MODULE.1 — use in the Entity detail panel when a historical geometry
 * is selected. Shows *every* dated/snapshot use of the shared contour, not just
 * the temporal slice currently visible on the map.
 *
 * Data are passed in by the future Historical module catalogue. Rendering does
 * not create or duplicate geometries, infer periods or change ACTUAL entities.
 */
export function HistoricalGeometryUseSection({ geometryId, uses, lang }: HistoricalGeometryUseSectionProps) {
  const entries = historicalUsesForGeometry(uses, geometryId);
  if (!entries.length) return null;

  const ro = lang === 'ro';
  const status: Record<HistoricalGeometryUse['evidenceStatus'], string> = ro
    ? { qualified: 'Admis cartografic', candidate: 'Candidat', in_review: 'În verificare' }
    : { qualified: 'Cartographically accepted', candidate: 'Candidate', in_review: 'Under review' };

  return <EntityCardSection
    title={ro ? 'Utilizări istorice ale acestei geometrii' : 'Historical uses of this geometry'}
    kind="cartographic">
    <p className="note">
      {ro ? 'Un singur contur, cu toate utilizările documentate în ordine cronologică.' :
        'One shared outline, with every documented use in chronological order.'}
    </p>
    <ol className="historical-geometry-uses" style={{ paddingInlineStart: '1.5rem', margin: '0.75rem 0' }}>
      {entries.map(use => <li key={use.useId} style={{ padding: '0.25rem 0 0.75rem' }}>
        <strong>{formatHistoricalUse(use, lang)}</strong>
        <div>{use.entityName[lang] || use.entityName.ro}</div>
        <div className="note">{ro ? 'Statut' : 'Status'}: {status[use.evidenceStatus]}</div>
        <div className="note">{ro ? 'Sursă' : 'Source'}: {use.sourceIds.length ?
          use.sourceIds.join(', ') : (ro ? 'Nedefinită' : 'Not specified')}</div>
        {use.notes?.[lang] && <p className="note">{use.notes[lang]}</p>}
      </li>)}
    </ol>
  </EntityCardSection>;
}
