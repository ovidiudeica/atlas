import type { ReactNode } from 'react';

/**
 * WEB-R4.0 — layout-only building block for entity details.
 *
 * The parent owns entity selection, geometry visibility and export callbacks.
 * This component neither interprets territorial roles nor mutates the catalogue.
 */
export interface EntityCardSectionProps {
  title: string;
  children: ReactNode;
  collapsible?: boolean;
  kind?: 'identity' | 'administrative' | 'statistical' | 'hierarchy' | 'children' | 'cartographic' | 'records' | 'symbols';
}

export function EntityCardSection({
  title, children, collapsible = false, kind = 'identity'
}: EntityCardSectionProps) {
  const className = 'entity-card-section entity-card-section--' + kind;
  if (collapsible) {
    return <details className={className + ' entity-card-section--collapsible'}>
      <summary>{title}</summary>
      <div className="entity-card-section-body">{children}</div>
    </details>;
  }
  return <section className={className} aria-label={title}>
    <h4>{title}</h4>
    <div className="entity-card-section-body">{children}</div>
  </section>;
}
