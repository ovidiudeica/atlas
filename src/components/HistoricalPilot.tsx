import { useState } from 'react';
import { EntityCardSection } from './EntityCardSection';
import { GeometryUsesSection } from './GeometryUsesSection';
import {
  HistoricalLaw1851Tree, HistoricalBoundaryDocumentarySection,
  type HistoricalReviewLabels
} from './HistoricalOriginalReview';
import type {HistoricalBoundaryReview} from '../data/historicalBoundaryReview.mjs';
import {
  HistoricalGeorefTrialSummary,HistoricalGeorefCaseSection,
  type HistoricalGeorefLabels
} from './HistoricalGeorefTrial';
import type {
  OriginalMapFitHoldoutRegister, OriginalMapFitHoldoutResults
} from '../data/historicalGeorefFitHoldout.mjs';
import {
  HistoricalDocumentaryEvidence, HistoricalActualConnections,
  type HistoricalEvidenceLabels
} from './HistoricalEvidenceSections';
import {
  independentAttestationsForVersion,
  type HistoricalIndependentAdmissions
} from '../data/historicalIndependentAdmissions.mjs';
import { formatHistoricalPeriod } from '../data/historicalAdminBridge.mjs';
import {
  geometryUsesInHistoricalCatalog, versionsForHistoricalEntity,
  type PilotHistoricalCatalog, type HistoricalVersion
} from '../data/historicalCatalog.mjs';
import {
  buildHistoricalReviewTree, historicalDateInPeriod, type HistoricalQualification,
  type HistoricalReviewTree
} from '../data/historicalQualification.mjs';

export interface HistoricalLabels extends HistoricalEvidenceLabels, HistoricalReviewLabels, HistoricalGeorefLabels {
  historyPilotTitle: string;
  historyPilotEnable: string;
  historyPilotDisable: string;
  historyPilotWarning: string;
  historyPilotSource: string;
  historyPilotYear: string;
  historyPilotLoading: string;
  historyPilotNoRoots: string;
  historyPilotUnlinked: string;
  historyPilotUnlinkedNote: string;
  historyPilotCandidate: string;
  historyPilotSpatialWarning: string;
  historyPilotOpen: string;
  historyPilotSelected: string;
  historyPilotYears: string;
  historyPilotIdentity: string;
  historyPilotOriginalName: string;
  historyPilotOriginalType: string;
  historyPilotVersions: string;
  historyPilotHierarchy: string;
  historyPilotNoParent: string;
  historyPilotNoChildren: string;
  historyPilotGeometry: string;
  historyPilotSources: string;
  historyPilotCurrent: string;
  historyPilotNoBridge: string;
  historyPilotReviewNote: string;
  historyPilotMap: string;
  historyPilotStatus: string;
  historyPilotSourceName: string;
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

type Locale = 'ro'|'en';

function titleOf(v:HistoricalVersion,lang:Locale) {
  return v.name[lang] || v.name.ro;
}

function periodOf(v:HistoricalVersion,lang:Locale) {
  return formatHistoricalPeriod(v.period,lang);
}

/**
 * A source-derived tree is NOT an authoritative hierarchy. This component is
 * mounted only in the Historical module, and only after a deliberate reviewer
 * opt-in. No administrative polygons or ACTUAL selections are modified.
 */
export function HistoricalPilotTree({
  catalog,qualification,admissions,boundaryReview,georefRegister,georefResults,
  year,preview,selectedVersionId,lang,labels,
  loading,error,onYear,onPreview,onSelect
}:{
  catalog:PilotHistoricalCatalog|null;
  qualification:HistoricalQualification|null;
  admissions:HistoricalIndependentAdmissions|null;
  boundaryReview:HistoricalBoundaryReview|null;
  georefRegister:OriginalMapFitHoldoutRegister|null;
  georefResults:OriginalMapFitHoldoutResults|null;
  year:number;
  preview:boolean;
  selectedVersionId:string|null;
  lang:Locale;
  labels:HistoricalLabels;
  loading:boolean;
  error:string|null;
  onYear:(year:number)=>void;
  onPreview:(enabled:boolean)=>void;
  onSelect:(versionId:string)=>void;
}) {
  const [collapsed,setCollapsed]=useState<string[]>([]);
  const byVersion = new Map((catalog?.versions || []).map(v=>[v.id,v]));
  const tree:HistoricalReviewTree|null=preview&&catalog&&qualification
    ?buildHistoricalReviewTree(catalog,qualification,
      String(year).padStart(4,'0')+'-07-01'):null;

  const renderVersion = (version:HistoricalVersion,depth:number,
    visited:Set<string>, warning=false):React.ReactNode => {
    if(visited.has(version.id)||depth>12)return null;
    const nextVisited=new Set(visited);nextVisited.add(version.id);
    const edges=tree?.children.get(version.id)||[];
    const expanded=!collapsed.includes(version.id);
    const selected=selectedVersionId===version.id;
    const label=titleOf(version,lang);
    const facts=independentAttestationsForVersion(admissions,version.id,
      {qualifiedOnly:true});
    return <div className="territory-branch" key={version.id}>
      <div className={'tree-line'+(selected?' is-selected':'')} role="treeitem"
        aria-level={depth+1} aria-selected={selected}
        aria-expanded={edges.length?expanded:undefined}
        style={{paddingLeft:Math.min(depth,7)*14+3}}>
        {edges.length?
          <button type="button" className="expand-button"
            aria-label={(expanded?'− ':'+ ')+label}
            onClick={()=>setCollapsed(old=>expanded?[...old,version.id]:
              old.filter(id=>id!==version.id))}>{expanded?'⌄':'›'}</button>:
          <span className="tree-spacer" aria-hidden="true">·</span>}
        <button type="button" className="tree-label"
          aria-label={label+' · '+periodOf(version,lang)}
          aria-current={selected?'true':undefined}
          onClick={()=>onSelect(version.id)}>
          <span className="tree-label-heading"><span className="node-name">{label}</span></span>
          <span className="node-level">{version.sourceOriginalType} · {periodOf(version,lang)}</span>
          {facts.length>0&&<span className="history-verified-snapshot">
            {labels.historicalDocumentaryQualified}:
            {' '}{facts.map(f=>f.attestedAt.at.year).join(', ')}
          </span>}
          {warning&&<span className="node-disambiguation" role="note">
            {labels.historyPilotSpatialWarning}</span>}
        </button>
      </div>
      {edges.length>0&&expanded&&<div role="group" className="tree-children">
        {edges.map(edge=>{
          const child=byVersion.get(edge.versionId);
          return child?renderVersion(child,depth+1,nextVisited,edge.reviewRequired):null;
        })}
      </div>}
    </div>;
  };
  return <section className="tree-content history-pilot-pane" aria-label={labels.historyPilotTitle}>
    <p className="source-caveat"><strong>{labels.historyPilotWarning}</strong></p>
    <p className="note">{labels.historyPilotSource}</p>
    {loading&&<p role="status">{labels.historyPilotLoading}</p>}
    {error&&<p role="alert">{error}</p>}
    {catalog&&qualification&&<div className="history-pilot-controls">
      <label className="history-pilot-option">
        <input type="checkbox" checked={preview} onChange={e=>onPreview(e.target.checked)}
          aria-label={preview?labels.historyPilotDisable:labels.historyPilotEnable}/>
        <strong>{preview?labels.historyPilotDisable:labels.historyPilotEnable}</strong>
      </label>
      {preview&&<label className="history-pilot-year">{labels.historyPilotYear}
        <input type="number" min="1000" max="1999" step="1" value={year}
          onChange={e=>{
            const value=Number(e.target.value);
            if(Number.isInteger(value)&&value>=1000&&value<=1999)onYear(value);
          }} />
      </label>}
    </div>}
    {tree&&<div className="history-pilot-review">
      {admissions&&<p className="history-admissions-summary">
        {labels.historicalDocumentaryQualified}:
        {' '}{admissions.identityAttestations.filter(x=>x.evidenceStatus==='qualified').length}
        {' · '}{labels.historicalDocumentaryMembership}:
        {' '}{admissions.relationAttestations.length}
      </p>}
      <p className="tree-hint">{labels.historyPilotCandidate}: {tree.candidateRelations}
        {' · '}{labels.historyPilotSpatialWarning}: {qualification!.counts.requires_boundary_reconciliation}
        {' · '}{labels.historyPilotNoParent}: {tree.rejected.length}</p>
      {tree.roots.length?
        <div className="tree-list" role="tree" aria-label={labels.historyPilotTitle}>
          {tree.roots.map(v=>renderVersion(v,0,new Set()))}
        </div>:<p className="tree-empty">{labels.historyPilotNoRoots}</p>}
      {tree.unlinked.length>0&&<details className="history-pilot-unlinked">
        <summary>{labels.historyPilotUnlinked} ({tree.unlinked.length})</summary>
        <p className="note">{labels.historyPilotUnlinkedNote}</p>
        <div className="tree-list" role="tree" aria-label={labels.historyPilotUnlinked}>
          {tree.unlinked.map(v=>renderVersion(v,0,new Set()))}
        </div>
      </details>}
      <HistoricalLaw1851Tree review={boundaryReview} year={year} lang={lang}
        labels={labels} onSelect={onSelect}/>
      <HistoricalGeorefTrialSummary register={georefRegister}
        results={georefResults} lang={lang} labels={labels}/>
      <p className="source-caveat">{labels.historyPilotReviewNote}</p>
    </div>}
  </section>;
}

export function HistoricalPilotEntityCard({
  catalog,qualification,admissions,boundaryReview,georefRegister,georefResults,
  versionId,year,lang,labels,onSelect,onMap,
  onSelectActual,actualName
}:{
  catalog:PilotHistoricalCatalog;
  qualification:HistoricalQualification;
  admissions:HistoricalIndependentAdmissions|null;
  boundaryReview:HistoricalBoundaryReview|null;
  georefRegister:OriginalMapFitHoldoutRegister|null;
  georefResults:OriginalMapFitHoldoutResults|null;
  versionId:string;
  year:number;
  lang:Locale;
  labels:HistoricalLabels;
  onSelect:(versionId:string)=>void;
  onMap:()=>void;
  onSelectActual:(id:string)=>void;
  actualName:(id:string)=>string;
}) {
  const version=catalog.versions.find(v=>v.id===versionId);
  if(!version)return null;
  const identity=catalog.entities.find(x=>x.id===version.entityId);
  const variants=versionsForHistoricalEntity(catalog,version.entityId);
  const iso=String(year).padStart(4,'0')+'-07-01';
  const review=buildHistoricalReviewTree(catalog,qualification,iso);
  const parents=catalog.hierarchy.filter(r=>r.childVersionId===versionId &&
    r.period.kind==='interval' && r.evidenceStatus==='candidate' &&
    historicalDateInPeriod(r.period,iso));
  const children=review.children.get(versionId)||[];
  const byVersion=new Map(catalog.versions.map(v=>[v.id,v]));
  const qa=new Map(qualification.relations.map(r=>[r.id,r]));
  const uses=geometryUsesInHistoricalCatalog(catalog,version.geometryId);
  const sources=catalog.sources.filter(s=>version.sourceIds.includes(s.id));
  return <section className="detail-content history-entity-detail">
    <div className="entity-card" key={versionId}>
      <header className="entity-title">
        <span className="flag flag--coat" aria-hidden="true">◇</span>
        <div>
          <h3 tabIndex={-1}>{titleOf(version,lang)}</h3>
          <small>{version.sourceOriginalType} · {periodOf(version,lang)}</small>
        </div>
      </header>
      <p className="source-caveat"><strong>{labels.historyPilotWarning}</strong></p>
      <div className="entity-actions">
        <button type="button" onClick={onMap}>{labels.historyPilotMap}</button>
      </div>
      <EntityCardSection title={labels.historyPilotIdentity} kind="identity">
        <dl className="metadata">
          <dt>{labels.historyPilotOriginalName}</dt><dd>{identity?.sourceName||titleOf(version,lang)}</dd>
          <dt>{labels.historyPilotOriginalType}</dt><dd>{version.sourceOriginalType}</dd>
          <dt>{labels.historyPilotYears}</dt><dd>{periodOf(version,lang)}</dd>
          <dt>{labels.historyPilotStatus}</dt><dd>{labels.historyPilotCandidate}</dd>
          <dt>HistoGIS ID</dt><dd>{version.sourceShapeId}</dd>
        </dl>
        {identity?.untranslatedSourceLabel&&
          <p className="note">{labels.historyPilotSourceName}</p>}
      </EntityCardSection>
      <HistoricalDocumentaryEvidence admissions={admissions} catalog={catalog}
        versionId={versionId} lang={lang} labels={labels}/>
      <HistoricalBoundaryDocumentarySection review={boundaryReview}
        catalog={catalog} versionId={versionId} year={year} lang={lang}
        labels={labels} onSelect={onSelect}/>
      <HistoricalGeorefCaseSection register={georefRegister}
        results={georefResults} versionId={versionId}
        lang={lang} labels={labels}/>
      <EntityCardSection title={labels.historyPilotVersions} kind="hierarchy">
        <ol className="historical-geometry-uses">
          {variants.map(v=><li key={v.id}>
            <button type="button" aria-current={v.id===versionId?'true':undefined}
              onClick={()=>onSelect(v.id)}>{periodOf(v,lang)} · {v.sourceOriginalType}</button>
          </li>)}
        </ol>
      </EntityCardSection>
      <EntityCardSection title={labels.historyPilotHierarchy} kind="hierarchy" collapsible>
        <p className="note">{labels.historyPilotReviewNote}</p>
        <dl className="metadata">
          <dt>{labels.historyPilotNoParent}</dt>
          <dd>{parents.length?
            <ul>{parents.map(r=><li key={r.id}>
              {byVersion.get(r.parentVersionId)?.name[lang]||r.parentVersionId}
              {' · '}{formatHistoricalPeriod(r.period,lang)}
              {' · '}{qa.get(r.id)?.decision==='blocked_spatial_contradiction'?
                labels.historyPilotSpatialWarning:labels.historyPilotCandidate}
            </li>)}</ul>:'—'}</dd>
          <dt>{labels.historyPilotOpen}</dt>
          <dd>{children.length?
            <ul>{children.map(edge=><li key={edge.relationId}>
              <button type="button" onClick={()=>onSelect(edge.versionId)}>
                {byVersion.get(edge.versionId)?.name[lang]||edge.versionId}
              </button>
              {edge.reviewRequired&&<small> · {labels.historyPilotSpatialWarning}</small>}
            </li>)}</ul>:labels.historyPilotNoChildren}</dd>
        </dl>
      </EntityCardSection>
      <GeometryUsesSection geometryId={version.geometryId}
        uses={catalog.geometryUses} lang={lang} labels={labels}/>
      <EntityCardSection title={labels.historyPilotCurrent} kind="administrative">
        {admissions?.bridges.some(b=>b.historicalVersionId===versionId)?
          <HistoricalActualConnections admissions={admissions}
            historicalEntityId={version.entityId} versionId={versionId}
            actualName={actualName} lang={lang} labels={labels}
            onOpenActual={onSelectActual}/>:
          <p className="note">{labels.historyPilotNoBridge}</p>}
      </EntityCardSection>
      <EntityCardSection title={labels.historyPilotSources} kind="cartographic">
        <p className="note">{labels.historyPilotSource}</p>
        <ul>{sources.map(s=><li key={s.id}><a href={s.url} target="_blank" rel="noopener noreferrer">
          {s.name||s.id}</a></li>)}</ul>
        <p className="note">HistoGIS v9.0 · CC BY 4.0</p>
      </EntityCardSection>
    </div>
  </section>;
}
