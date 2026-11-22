import {EntityCardSection} from './EntityCardSection';
import {
  fitHoldoutCaseForVersion,
  type OriginalMapFitHoldoutRegister,
  type OriginalMapFitHoldoutResults
} from '../data/historicalGeorefFitHoldout.mjs';

type Locale='ro'|'en';
export interface HistoricalGeorefLabels {
  history3cTitle:string;
  history3cWarning:string;
  history3cMapStatus:string;
  history3cFit:string;
  history3cHoldout:string;
  history3cFitRmse:string;
  history3cHoldoutRmse:string;
  history3cMaxHoldout:string;
  history3cOriginal:string;
  history3cCase:string;
  history3cUnverified:string;
  history3cTrialRejected:string;
  history3cBoundaryStatus:string;
  history3cBlocked:string;
  history3cHold:string;
}

const km=(meters:number,locale:Locale)=>
  (meters/1000).toLocaleString(locale==='ro'?'ro-RO':'en-US',
    {minimumFractionDigits:2,maximumFractionDigits:2})+' km';

export function HistoricalGeorefTrialSummary({
  register,results,lang,labels
}:{
  register:OriginalMapFitHoldoutRegister|null;
  results:OriginalMapFitHoldoutResults|null;
  lang:Locale;
  labels:HistoricalGeorefLabels;
}){
  if(!register||!results)return null;
  return <details className="history-3c-summary">
    <summary>{labels.history3cTitle} · 1835–1841</summary>
    <p className="source-caveat">{labels.history3cWarning}</p>
    <p className="note">{labels.history3cBoundaryStatus}:
      {' '}{results.acceptedLegalHistoricalBoundaryPolygons}/8
      {' · '}{labels.history3cTrialRejected}: 2/2
    </p>
    <div className="history-3c-map-grid">
      {results.maps.map(map=>{
        const original=register.originalRasterSources.find(x=>x.id===map.sourceId);
        return <section className="history-3c-map-qa" key={map.sourceId}>
          <strong>{map.year}: {original?.title||map.sourceId}</strong>
          <dl>
            <dt>{labels.history3cFit}</dt><dd>{map.fitCount}</dd>
            <dt>{labels.history3cHoldout}</dt><dd>{map.holdoutCount}</dd>
            <dt>{labels.history3cFitRmse}</dt><dd>{km(map.fitRMSEMeters,lang)}</dd>
            <dt>{labels.history3cHoldoutRmse}</dt><dd>{km(map.holdoutRMSEMeters,lang)}</dd>
            <dt>{labels.history3cMaxHoldout}</dt><dd>{km(map.holdoutMaxMeters,lang)}</dd>
          </dl>
          {original&&<a href={original.catalogUrl} target="_blank"
            rel="noopener noreferrer">{labels.history3cOriginal}: {map.year}</a>}
          <p className="source-caveat">{labels.history3cUnverified}</p>
        </section>;
      })}
    </div>
  </details>;
}

/** This displays a blocked evidence verdict, NOT a vectorized map boundary. */
export function HistoricalGeorefCaseSection({
  register,results,versionId,lang,labels
}:{
  register:OriginalMapFitHoldoutRegister|null;
  results:OriginalMapFitHoldoutResults|null;
  versionId:string;lang:Locale;
  labels:HistoricalGeorefLabels;
}){
  if(!register||!results)return null;
  const cases=fitHoldoutCaseForVersion(register,versionId);
  if(!cases.length)return null;
  return <EntityCardSection kind="cartographic" title={labels.history3cCase} collapsible>
    <p className="source-caveat">{labels.history3cWarning}</p>
    <ul className="history-3c-case-list">
      {cases.map(c=><li key={c.sourceRelationId}>
        <strong>{c.childName} → {c.parentName}</strong>
        <div>{c.decision==='BLOCKED_SOURCE_PARENT'?
          labels.history3cBlocked:labels.history3cHold}</div>
        <div>{labels.history3cBoundaryStatus}: {labels.history3cUnverified}</div>
      </li>)}
    </ul>
    {results.maps.map(m=><p className="note" key={m.sourceId}>
      {m.year}: {labels.history3cFit} {m.fitCount},
      {' '}{labels.history3cHoldout} {m.holdoutCount},
      {' '}{labels.history3cHoldoutRmse} {km(m.holdoutRMSEMeters,lang)}
    </p>)}
  </EntityCardSection>;
}
