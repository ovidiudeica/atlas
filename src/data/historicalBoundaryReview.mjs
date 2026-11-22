/**
 * HIST-MODULE.3b — independent historical evidence review.
 *
 * Distinguish: (a) a LEGALLY PRESCRIBED organization, (b) historically
 * OPERATING direct parentage, and (c) CERTIFIED historic boundary geometry.
 * A positive verdict for (a) does not imply (b) or (c). We preserve the
 * original HistoGIS v9 data and ACTUAL snapshots byte-for-byte.
 */
import {validateHistoricalPeriod} from './historicalAdminBridge.mjs';
import {historicalDateInPeriod} from './historicalQualification.mjs';

export const HIST3B_SCHEMA='atlas-historical-boundary-parentage-review-v1';
const nonempty=x=>typeof x==='string'&&x.trim().length>0;
const obj=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const SHA=/^[a-f0-9]{64}$/;
const restricted=new Set(['blocked_spatial_contradiction','requires_boundary_reconciliation']);
const expectedRegions=['hermannstadt','karlsburg','klausenburg','dees','maros-vasarhely'];
const expectedCount=[6,10,6,7,7];
const idPrefix='hist3b:1851:kreis:';

export function validateHistoricalBoundaryReview(catalog,qualification,review) {
  const errors=[];
  if(!obj(review)||review.schema!==HIST3B_SCHEMA)
    return {ok:false,errors:['Unsupported HIST-MODULE.3b review schema']};
  if(review.pilotArchiveSha256!==catalog?.sourceArchiveSha256)
    errors.push('Original HistoGIS archive provenance differs');
  if(review.originalHierarchiesCount!==catalog?.hierarchy?.length||
     review.originalGeometriesCount!==catalog?.geometries?.length)
    errors.push('HistoGIS original coverage count mismatch');
  if(JSON.stringify(review.originalQualificationCounts)!==
     JSON.stringify(qualification?.counts))
    errors.push('Historical topology qualification counts altered');

  const sourceList=Array.isArray(review.sources)?review.sources:[];
  const src=new Map();
  if(sourceList.length!==4)errors.push('Independent and dependent source inventory incomplete');
  for(const s of sourceList){
    if(!obj(s)||!nonempty(s.id)||src.has(s.id)||!nonempty(s.url)||
       !s.url.startsWith('https://')||!nonempty(s.title)||
       typeof s.independentOfHistoGIS!=='boolean')
      errors.push('Invalid/duplicate source record '+s?.id);
    src.set(s.id,s);
  }
  const law=src.get('hist3b:law:rgbl-117-1851');
  const map=src.get('hist3b:map:raffelsperger-1841');
  const pointer=src.get('hist3b:map:streit-1835');
  const derivative=src.get('hist3b:source:histogis-1835');
  if(!law||law.kind!=='contemporary_official_normative'||law.published!=='1851-05-16'||
     law.originalDownloadedAndHashed!==true||!SHA.test(law.archiveSha256||'')||
     law.archiveBytes<=0||law.independentOfHistoGIS!==true||
     law.originalFacsimileVisuallyChecked!==false)
    errors.push('Original 1851 gazette provenance/limits not preserved');
  if(!map||map.independentOfHistoGIS!==true||map.date!=='1841'||
     map.independentlyGeoreferenced!==false||
     map.originalDownloadedAndHashed!==true||
     !SHA.test(map.archiveSha256||'')||map.archiveBytes<=0||
     map.sourceScaleDenominator!==890000)
    errors.push('Independent map provenance or georeferencing gate false');
  if(!pointer||pointer.date!=='1835'||pointer.independentOfHistoGIS!==true||
     pointer.originalDownloadedAndHashed!==false)
    errors.push('Streit source only identified, not acquired');
  if(!derivative||derivative.independentOfHistoGIS!==false)
    errors.push('HistoGIS derivative cannot serve as an independent reference');

  const hierarchy=review.legalHierarchy;
  const root='histogis-v9:version:9915';
  const at={kind:'snapshot',at:{year:1851,month:5,day:16}};
  if(!obj(hierarchy)||hierarchy.evidenceId!==law?.id||
     hierarchy.claimStatus!=='qualified_normative_structure_at_publication_only'||
     hierarchy.perspectiveId!=='austria-1851-published-normative-organization'||
     JSON.stringify(hierarchy.attestedAt)!==JSON.stringify(at)||
     !validateHistoricalPeriod(hierarchy.attestedAt)||
     hierarchy.crownlandHistoricalVersionId!==root||
     hierarchy.legalNormDate!=='1851-05-12'||
     hierarchy.firstGazettePublicationDate!=='1851-05-16'||
     hierarchy.effectiveOperationConfirmed!==false||
     hierarchy.completeDurationConfirmed!==false||
     hierarchy.historicalBoundariesQualified!==false||
     hierarchy.regionCount!==5||hierarchy.districtCount!==36||
     !Array.isArray(hierarchy.regions)||hierarchy.regions.length!==5)
    errors.push('Normative-only 1851 hierarchy is missing or unlawfully promoted');

  const versions=new Map((catalog?.versions||[]).map(v=>[v.id,v]));
  const sourceRelationIds=new Set((catalog?.hierarchy||[]).map(x=>x.id));
  const knownIds=new Set();
  let childCount=0;
  for(let i=0;i<(hierarchy?.regions||[]).length;i++){
    const r=hierarchy.regions[i];
    if(!obj(r)||r.id!==idPrefix+expectedRegions[i]||
       r.lawParentId!==root||r.lawOfficeType!=='Kreis'||
       r.qualifiesDirectParentFromCrownlandOnGazetteDate!==true||
       r.existence!=='normative_organization_as_published_not_verified_activated'||
       r.boundaryQualified!==false||r.annexSection!=='§2–§3; Beilage A/B'||
       !Array.isArray(r.children)||r.children.length!==expectedCount[i]||
       knownIds.has(r.id))
      errors.push('Invalid normative Kreis '+r?.id);
    knownIds.add(r.id);
    const v=r.sourceHistoricalVersionId?versions.get(r.sourceHistoricalVersionId):null;
    if(i===1){
      if(r.sourceHistoricalVersionId!==null||r.sourceHistoricalShapeId!==null||
         r.geometryMissingInHistoGIS!==true)
        errors.push('Karlsburg law-only Kreis must not inherit invented source geometry');
    }else if(!v||v.sourceShapeId!==r.sourceHistoricalShapeId||
       v.name.ro!==r.originalName||v.sourceOriginalType!=='County'||
       r.sourceCatalogType!=='County'||
       r.geometryMissingInHistoGIS!==false||
       !historicalDateInPeriod(v.period,'1851-05-16'))
      errors.push('1851 Kreis mismatched against immutable HistoGIS version '+r?.id);
    for(const child of r.children||[]){
      childCount++;
      if(!obj(child)||knownIds.has(child.id)||
         child.parentId!==r.id||
         child.lawOfficeType!=='politischer Bezirk / Bezirkshauptmannschaft'||
         !nonempty(child.originalName)||
         child.sourceHistoricalVersionId!==null||
         child.geometryMissingInHistoGIS!==true||
         child.qualifiedDirectParentNormativelyAtPublication!==true||
         child.activeAdministrationVerified!==false||
         child.boundaryQualified!==false||
         !Number.isInteger(child.rowOrdinal))
        errors.push('Invalid/invented 1851 Bezirk '+child?.id);
      knownIds.add(child.id);
    }
  }
  if(childCount!==36||knownIds.size!==41)
    errors.push('Missing or duplicated 1851 5-Kreis/36-Bezirk nodes');

  const originalProblems=(qualification?.relations||[]).filter(r=>restricted.has(r.decision));
  const problems=review.boundaryDisputes;
  if(!Array.isArray(problems)||problems.length!==originalProblems.length||problems.length!==8)
    errors.push('Every of the eight original source contradictions requires one independent review');
  const seen=new Set();
  for(const item of problems||[]){
    const source=(catalog?.hierarchy||[]).find(x=>x.id===item.sourceRelationId);
    const current=(qualification?.relations||[]).find(x=>x.id===item.sourceRelationId);
    if(!source||!current||!restricted.has(current.decision)||seen.has(item.sourceRelationId)||
       source.childVersionId!==item.childVersionId||
       source.parentVersionId!==item.parentVersionId||
       current.decision!==item.sourceTopologyVerdict||
       Math.abs(current.outsidePercentEqualArea-item.outsidePercentEqualArea)>1e-9)
      errors.push('Unmatched/altered original boundary exception '+item?.sourceRelationId);
    seen.add(item?.sourceRelationId);
    const bad=current?.decision==='blocked_spatial_contradiction';
    if(item.independentBoundaryStatus!=='on_hold_pending_contemporary_raster_gcp_fit_holdout'||
       item.earlierPeriodAdministrativeParentStatus!==
         (bad?'blocked_invalid_source_parent':'unproven_direct_parent')||
       !nonempty(item.qualitativeOriginalEvidence)||
       !Array.isArray(item.checkedAgainst)||
       !item.checkedAgainst.includes(law?.id)||
       !item.checkedAgainst.includes(map?.id)||
       item.legalBoundaryQualified!==false||
       item.boundaryLineIndependentlyVectorized!==false||
       item.originalGeometryKept!==true||
       item.proposedReplacementParentId!==null||
       item.proposedReplacementGeometryId!==null||
       !Array.isArray(item.independentGcpFit)||item.independentGcpFit.length||
       !Array.isArray(item.independentGcpHoldout)||item.independentGcpHoldout.length)
      errors.push('Unjustified historical boundary/parent promotion '+item?.sourceRelationId);
  }
  const qa=review.independentGeoreferencing;
  if(!qa||qa.targetSourceId!==map?.id||qa.fit?.length!==0||
     qa.holdout?.length!==0||qa.minimumFitCount<6||
     qa.minimumHoldoutCount<3||qa.distinctPhysicalObjectsRequired!==true||
     qa.fitHoldoutIndependent!==true||
     qa.georeferencingProduced!==false||qa.holdoutPassed!==false||
     qa.independentBoundaryVectorizationCompleted!==false||
     qa.boundaryPromotionsPermitted!==false||
     qa.selectedNewHistoricalGeometryIds?.length!==0)
    errors.push('Raster evidence is not an independently qualified georeferenced boundary');
  if(!obj(review.admissions)||
     review.admissions.directParentsAtNormativePublication!==41||
     review.admissions.historicalDirectParentsForFullPeriods!==0||
     review.admissions.earlier1815To1849ParentCorrections!==0||
     review.admissions.newlyCertifiedLegalBoundaryPolygons!==0||
     review.admissions.newlyGeneratedPolygons!==0)
    errors.push('Invalid normative vs historical admissions separation');
  if(!Array.isArray(review.caveats)||review.caveats.length<5)
    errors.push('Missing critical legal/temporal scope caveats');
  return {ok:errors.length===0,errors:[...new Set(errors)]};
}

export async function loadHistoricalBoundaryReview(catalog,qualification,baseUrl=import.meta.env?.BASE_URL??'/'){
 const prefix=baseUrl.replace(/\/?$/,'/')+'data/historical/v1/';
 const response=await fetch(prefix+'boundary-parentage-review.json');
 if(!response.ok)throw new Error('Historical boundary review HTTP '+response.status);
 const data=await response.json();
 const gate=validateHistoricalBoundaryReview(catalog,qualification,data);
 if(!gate.ok)throw new Error('Invalid HIST3b review: '+gate.errors.join('; '));
 return data;
}

/**
 * Documented LEGISLATIVE hierarchy of 1851, never a certified 1815–1849 tree.
 * Snapshots can be shown in the Historical module alongside the HistoGIS pilot,
 * but cannot be merged into the certified, bounded administrative tree.
 */
export function historicalLawHierarchyAtYear(review,year){
 if(year!==1851||review?.legalHierarchy?.claimStatus!==
    'qualified_normative_structure_at_publication_only')return [];
 return review.legalHierarchy.regions.map(r=>({
   id:r.id,name:r.originalName,historicalVersionId:r.sourceHistoricalVersionId,
   children:r.children.map(c=>({id:c.id,name:c.originalName,historicalVersionId:null}))
 }));
}

export function historicalBoundaryIssueForVersion(review,versionId){
 return (review?.boundaryDisputes||[]).filter(r=>
   r.childVersionId===versionId||r.parentVersionId===versionId);
}
