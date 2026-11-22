import { EntityCardSection } from './EntityCardSection';
import { formatHistoricalPeriod } from '../data/historicalAdminBridge.mjs';
import {
 independentAttestationsForVersion, independentMembershipsForVersion,
 independentBridgesForActual, independentBridgesForHistorical,
 type HistoricalIndependentAdmissions
} from '../data/historicalIndependentAdmissions.mjs';
import type { PilotHistoricalCatalog } from '../data/historicalCatalog.mjs';

type Locale='ro'|'en';

export interface HistoricalEvidenceLabels {
 historicalDocumentaryEvidence:string;
 historicalDocumentaryQualified:string;
 historicalDocumentaryReview:string;
 historicalDocumentaryMoment:string;
 historicalDocumentaryType:string;
 historicalDocumentaryScope:string;
 historicalDocumentaryLegalCaveat:string;
 historicalDocumentarySource:string;
 historicalDocumentaryMembership:string;
 historicalDocumentaryNoMembership:string;
 historicalDocumentaryException:string;
 historicalOverlapTitle:string;
 historicalOverlapNotice:string;
 historicalOverlapGoToHistory:string;
 historicalOverlapGoToActual:string;
 historicalOverlapSourcePeriod:string;
 historicalOverlapMeasuredAt:string;
 historicalOverlapHistoricalCoverage:string;
 historicalOverlapCurrentCoverage:string;
 historicalOverlapNoContinuity:string;
 historicalOverlapCurrentTitle:string;
}

const typeLabel=(kind:string,lang:Locale):string=>{
  if(lang==='en')return kind;
  const types:Record<string,string>={
    'Grand Principality':'Mare principat',Duchy:'Ducat',County:'Comitat',
    District:'District','Saxon Seat':'Scaun săsesc','Political District':'District politic'
  };
  return types[kind]||kind;
};
const stamp=(period:{kind:'snapshot';at:{year:number;month?:number;day?:number}}):string=>{
  const d=period.at;
  return [d.day===undefined?'':String(d.day).padStart(2,'0'),
    d.month===undefined?'':String(d.month).padStart(2,'0'),String(d.year)]
    .filter(Boolean).join('.');
};
const sourceLabel=(admissions:HistoricalIndependentAdmissions,id:string)=>
  admissions.sources.find(s=>s.id===id);

export function HistoricalDocumentaryEvidence({
  admissions,catalog,versionId,lang,labels
}:{
  admissions:HistoricalIndependentAdmissions|null;
  catalog:PilotHistoricalCatalog;
  versionId:string;
  lang:Locale;labels:HistoricalEvidenceLabels;
}){
  if(!admissions)return null;
  const attestations=independentAttestationsForVersion(admissions,versionId);
  const relations=independentMembershipsForVersion(admissions,versionId);
  const issues=admissions.unresolved.filter(x=>x.versionId===versionId);
  if(!attestations.length&&!relations.length&&!issues.length)return null;
  const byVersion=new Map(catalog.versions.map(v=>[v.id,v]));
  return <EntityCardSection kind="hierarchy" title={labels.historicalDocumentaryEvidence} collapsible>
    <p className="note">{labels.historicalDocumentaryLegalCaveat}</p>
    {attestations.length>0&&<ul className="history-evidence-list">
      {attestations.map(a=><li key={a.id}>
        <strong>{a.evidenceStatus==='qualified'?labels.historicalDocumentaryQualified:
          labels.historicalDocumentaryReview}</strong>
        {' · '}{labels.historicalDocumentaryMoment}: {stamp(a.attestedAt)}
        <div>{labels.historicalDocumentaryType}: {typeLabel(a.verifiedHistoricalType,lang)}</div>
        {a.sourceIds.map(sid=>{
          const source=sourceLabel(admissions,sid);
          return source?<div key={sid}><a href={source.url} target="_blank"
            rel="noopener noreferrer">{labels.historicalDocumentarySource}: {source.title}</a></div>:null;
        })}
      </li>)}
    </ul>}
    {relations.length>0&&<>
      <h5>{labels.historicalDocumentaryMembership}</h5>
      <ul className="history-evidence-list">
      {relations.map(r=><li key={r.id}>
        {byVersion.get(r.childVersionId)?.name[lang]||r.childVersionId}
        {' · '}{byVersion.get(r.parentVersionId)?.name[lang]||r.parentVersionId}
        {' · '}{labels.historicalDocumentaryMoment}: {stamp(r.attestedAt)}
        <div><strong>{labels.historicalDocumentaryQualified}</strong>
          {' · '}{labels.historicalDocumentaryNoMembership}</div>
        {r.sourceIds.map(sid=>{const src=sourceLabel(admissions,sid);return src?
          <div key={sid}><a href={src.url} target="_blank" rel="noopener noreferrer">
            {labels.historicalDocumentarySource}: {src.title}</a></div>:null;})}
      </li>)}
      </ul>
    </>}
    {issues.length>0&&<ul className="history-evidence-issues">
      {issues.map(issue=><li key={issue.id}><strong>{labels.historicalDocumentaryException}:</strong>
        {' '}{issue.note}</li>)}
    </ul>}
  </EntityCardSection>;
}

/** A measured two-snapshot source overlap, never an institutional identity. */
export function ActualHistoryConnections({
 admissions,actualId,lang,labels,onOpenHistorical
}:{
 admissions:HistoricalIndependentAdmissions|null;
 actualId:string;lang:Locale;labels:HistoricalEvidenceLabels;
 onOpenHistorical:(versionId:string)=>void;
}){
 const links=independentBridgesForActual(admissions,actualId);
 if(!links.length)return null;
 return <EntityCardSection title={labels.historicalOverlapTitle} kind="hierarchy" collapsible>
   <p className="note">{labels.historicalOverlapNotice}</p>
   <ul className="history-evidence-list">{links.map(link=><li key={link.id}>
     <strong>{link.historicalSourceName}</strong>
     {' · '}{formatHistoricalPeriod(link.historicalSourcePeriod,lang)}
     <div className="history-overlap-coverage">
       {labels.historicalOverlapHistoricalCoverage}:
       {' '}{link.geometryComparison.historicalCoveragePercent.toFixed(2)}%;
       {' '}{labels.historicalOverlapCurrentCoverage}:
       {' '}{link.geometryComparison.actualCoveragePercent.toFixed(2)}%
     </div>
     <div><small>{labels.historicalOverlapMeasuredAt}: 1907 ↔ 2026</small></div>
     <button type="button" className="history-overlap-nav"
       onClick={()=>onOpenHistorical(link.historicalVersionId)}>
       {labels.historicalOverlapGoToHistory}
     </button>
   </li>)}</ul>
   <p className="source-caveat">{labels.historicalOverlapNoContinuity}</p>
 </EntityCardSection>;
}

export function HistoricalActualConnections({
 admissions,historicalEntityId,versionId,actualName,lang,labels,onOpenActual
}:{
 admissions:HistoricalIndependentAdmissions|null;
 historicalEntityId:string;versionId:string;
 actualName:(actualId:string)=>string;
 lang:Locale;labels:HistoricalEvidenceLabels;
 onOpenActual:(actualId:string)=>void;
}){
 const links=independentBridgesForHistorical(admissions,historicalEntityId)
   .filter(x=>x.historicalVersionId===versionId);
 if(!links.length)return null;
 return <div className="history-current-links">
   <p className="note">{labels.historicalOverlapNotice}</p>
   <ul className="history-evidence-list">
     {links.map(link=><li key={link.id}>
       <strong>{actualName(link.actualId)}</strong>
       {' · '}{labels.historicalOverlapMeasuredAt}: 1907 ↔ 2026
       <div className="history-overlap-coverage">
         {labels.historicalOverlapHistoricalCoverage}:
         {' '}{link.geometryComparison.historicalCoveragePercent.toFixed(2)}%;
         {' '}{labels.historicalOverlapCurrentCoverage}:
         {' '}{link.geometryComparison.actualCoveragePercent.toFixed(2)}%
       </div>
       <button type="button" className="history-overlap-nav"
         onClick={()=>onOpenActual(link.actualId)}>{labels.historicalOverlapGoToActual}</button>
     </li>)}
   </ul>
   <p className="source-caveat">{labels.historicalOverlapNoContinuity}</p>
 </div>;
}
