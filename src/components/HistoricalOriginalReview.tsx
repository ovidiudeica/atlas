import {EntityCardSection} from './EntityCardSection';
import {
  historicalLawHierarchyAtYear, historicalBoundaryIssueForVersion,
  type HistoricalBoundaryReview
} from '../data/historicalBoundaryReview.mjs';
import type {PilotHistoricalCatalog} from '../data/historicalCatalog.mjs';

type Locale='ro'|'en';
export interface HistoricalReviewLabels {
  history3bTitle:string;
  history3bLawParent:string;
  history3bGazetteDate:string;
  history3bLawOnly:string;
  history3bNoGeometry:string;
  history3bLawWarning:string;
  history3bReviewTitle:string;
  history3bBlocked:string;
  history3bNeedsOriginal:string;
  history3bOutsideParent:string;
  history3bSourceLink:string;
  history3bDirectLaw:string;
  history3bNoFullPeriod:string;
  history3bNoGeoProof:string;
}

const gazetteLink='https://jbc.bj.uj.edu.pl/Content/203610/PDF/NDIGCZAS002330_1851_1_035.pdf';
const mapLink='https://www.davidrumsey.com/luna/servlet/detail/RUMSEY~8~1~297853~90069447';
const versionLabel=(catalog:PilotHistoricalCatalog,id:string,lang:Locale)=>
  catalog.versions.find(v=>v.id===id)?.name[lang]||id;

/** Normative prospective hierarchy. NO linkage to direct historical parent
 * over a full duration and no polygon is synthesized from documentary nodes.
 */
export function HistoricalLaw1851Tree({review,year,lang,labels,onSelect}:{
 review:HistoricalBoundaryReview|null;year:number;lang:Locale;
 labels:HistoricalReviewLabels;onSelect:(id:string)=>void;
}){
 const regions=historicalLawHierarchyAtYear(review,year);
 if(!review||!regions.length)return null;
 return <details className="history-law-1851">
  <summary>{labels.history3bTitle} — 1851 (5 / 36)</summary>
  <p className="source-caveat">{labels.history3bLawWarning}</p>
  <p className="note"><a href={gazetteLink} rel="noopener noreferrer"
    target="_blank">{labels.history3bSourceLink}: RGBl. 117/1851, §§2–5, Beilage A/B</a></p>
  <div className="history-law-regions">
   {regions.map(r=><details key={r.id} className="history-law-region">
    <summary>{r.name} · Kreis ({r.children.length})</summary>
    {r.historicalVersionId?
      <button type="button" className="history-law-open"
        onClick={()=>onSelect(r.historicalVersionId!)}>
        {labels.history3bDirectLaw} — {r.name}</button>:
      <p className="note">{labels.history3bNoGeometry}</p>}
    <ul>{r.children.map(c=><li key={c.id}>
      {c.name} <small>({labels.history3bLawOnly})</small>
    </li>)}</ul>
   </details>)}
  </div>
 </details>;
}

export function HistoricalBoundaryDocumentarySection({
  review,catalog,versionId,year,lang,labels,onSelect
}:{
 review:HistoricalBoundaryReview|null;
 catalog:PilotHistoricalCatalog;
 versionId:string;year:number;lang:Locale;labels:HistoricalReviewLabels;
 onSelect:(id:string)=>void;
}){
 if(!review)return null;
 const issues=historicalBoundaryIssueForVersion(review,versionId);
 const legal=year===1851?review.legalHierarchy:null;
 const matched=legal?.regions.filter(r=>r.sourceHistoricalVersionId===versionId)||[];
 const isRoot=legal?.crownlandHistoricalVersionId===versionId;
 if(!issues.length&&!matched.length&&!isRoot)return null;
 return <EntityCardSection kind="cartographic" title={labels.history3bReviewTitle} collapsible>
  <p className="source-caveat">{labels.history3bNoGeoProof}</p>
  {issues.length>0&&<ul className="history-3b-issues">
    {issues.map(issue=><li key={issue.sourceRelationId}>
      <strong>{issue.childName} → {issue.parentName}</strong>
      {' · '}{issue.sourceTopologyVerdict==='blocked_spatial_contradiction'?
          labels.history3bBlocked:labels.history3bNeedsOriginal}
      <div>{labels.history3bOutsideParent}:
        {' '}{issue.outsidePercentEqualArea.toFixed(3)}%</div>
      <p className="note">{issue.qualitativeOriginalEvidence}</p>
    </li>)}
  </ul>}
  {(matched.length>0||isRoot)&&<>
    <p className="note">{labels.history3bGazetteDate}: 16.05.1851.
      {' '}{labels.history3bNoFullPeriod}</p>
    {matched.map(region=><p key={region.id}>
      <strong>{region.originalName}</strong>
      {' · '}{labels.history3bLawParent}:
      {' '}{versionLabel(catalog,legal!.crownlandHistoricalVersionId,lang)}
    </p>)}
    {isRoot&&<ul className="history-3b-issues">
      {legal!.regions.map(region=><li key={region.id}>
        {region.sourceHistoricalVersionId?
          <button type="button" className="history-law-open"
            onClick={()=>onSelect(region.sourceHistoricalVersionId!)}>
            {region.originalName}</button>:
          <strong>{region.originalName} ({labels.history3bNoGeometry})</strong>}
        {' · '}{region.children.length} {labels.history3bLawOnly}
      </li>)}
    </ul>}
  </>}
  <p className="note"><a href={gazetteLink} rel="noopener noreferrer"
     target="_blank">{labels.history3bSourceLink}: RGBl. 117/1851</a></p>
  <p className="note"><a href={mapLink} rel="noopener noreferrer" target="_blank">
    {labels.history3bSourceLink}: Raffelsperger 1841</a></p>
 </EntityCardSection>;
}
