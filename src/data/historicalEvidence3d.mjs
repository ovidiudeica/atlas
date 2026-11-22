/**
 * HIST-MODULE.3d — fail-closed review of native-source evidentiary status.
 * No unverified line, town-centre GCP or non-blind holdout may certify polygons.
 */
export const HIST3D_SCHEMA='atlas-historical-3d-native-evidence-review-v1';
const isObject=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const same=(a,b)=>a===b;

export function validateHistorical3dReview(predecessor, previousQA, review){
 const errors=[];
 const fault=(condition,message)=>{if(!condition)errors.push(message);};
 if(!isObject(predecessor)||!isObject(previousQA)||!isObject(review))
   return {ok:false,errors:['Missing original-source, previous QA or 3d register']};
 fault(review.schema===HIST3D_SCHEMA,'Wrong HIST3d schema');
 fault(review.stage==='PARTIAL_NATIVE_MAP_SCREENING_NO_CERTIFIABLE_GEOREFERENCING_OR_BOUNDARY','3d stage cannot claim certification');
 fault(review.releaseDecision==='HOLD_AND_PROHIBIT_PROMOTION','3d release must remain HOLD');
 const sources=predecessor.originalRasterSources;
 const sourceMaps=previousQA.maps;
 fault(Array.isArray(sources)&&sources.length===2,'Expected two original 3c maps');
 fault(Array.isArray(sourceMaps)&&sourceMaps.length===2,'Expected two prior 3c fits');
 const originals=review.originals;
 fault(Array.isArray(originals)&&originals.length===2,'Exactly two 3d sources mandatory');
 if(Array.isArray(originals)&&Array.isArray(sources)&&sources.length===2){
  for(let i=0;i<2;i++){
   const o=originals[i],s=sources[i],m=sourceMaps?.[i];
   if(!isObject(o)||!isObject(s)){errors.push('Missing map original '+i);continue}
   fault(o.sourceId===s.id&&o.year===s.year,'Original map identity differs '+i);
   fault(o.archiveSha256===s.archiveSha256,'Original map fingerprint differs '+i);
   fault(m?.historicalBoundaryCertified===false&&m?.certificationDecision==='HOLD','3c original georeference must remain HOLD '+i);
   fault(o.scale?.precisionEstimateQualified===false,'Unsupported scale-accuracy claim '+i);
   if(i===0){
    fault(o.scale?.printedDenominator===1200000,'Streit scale must be checked against printed 1:1,200,000');
    fault(o.scale?.printedCartoucheVisuallyRead===true,'Streit marginal scale must be examined');
    fault(o.scale?.wbcCatalogDenominator===200000&&o.scale?.wbcCatalogConflict===true,'WBC catalog conflict must be explicit');
   }else{
    fault(o.scale?.rumseyCatalogDenominator===890000,'Raffelsperger catalog scale changed');
    fault(o.scale?.printedScaleIndependentlyMeasured===false,'Unperformed Raffelsperger marginal scale measurement asserted');
   }
  }
 }
 const points=review.candidatePhysicalLandmarks;
 fault(Array.isArray(points)&&points.length>=3,'Physical research candidates missing');
 if(Array.isArray(points)){
  const ids=new Set();
  for(const p of points){
   fault(typeof p.id==='string'&&!ids.has(p.id),'Duplicated/invalid physical feature ID');
   ids.add(p.id);
   fault(p.quality==='RESEARCH_CANDIDATE_NOT_GCP'&&p.holdoutEligible===false,'Research candidate may not become an unverified GCP');
   fault(p.groundCoordinates===null&&p.nativePixel1835===null&&p.nativePixel1841===null,'Fabricated physical GCP coordinates');
   fault(p.historicCourseStability!==true,'Unverified immutable fluvial point asserted');
  }
 }
 const hold=review.holdoutProtocol;
 fault(hold?.status==='PROTOCOL_DRAFT_NOT_EXECUTED','Blind holdout protocol falsely reported executed');
 fault(hold?.preexisting3cSplitBlind===false,'Non-blind 3c split re-labelled blind');
 fault(hold?.fittedModelsFrozenBeforeBlindEvaluation===false&&hold?.cryptographicPrecommitCreated===false,
       'Pre-registration or frozen model claimed without proof');
 fault(hold?.requiredMinFitPerMap>=6&&hold?.requiredMinBlindHoldoutPerMap>=3,'FIT/HOLDOUT size requirements weakened');
 for(const k of ['verifiedPhysicalFitPoints1835','verifiedPhysicalFitPoints1841','blindHoldoutMeasured1835',
                  'blindHoldoutMeasured1841','acceptedGeoreferences'])fault(hold?.[k]===0,'Premature 3d observation: '+k);
 const lines=review.nativeLineDigitization;
 fault(lines?.status==='NOT_COMPLETED_NO_UNAMBIGUOUSLY_ATTRIBUTED_NATIVE_LINES','Native boundary tracing falsely certified');
 fault(lines?.independentVectorTracesCount===0&&lines?.sourceLineAttributionVerified===false
     &&Array.isArray(lines?.lines)&&lines.lines.length===0,'Disputed boundary line falsely vectorized');
 const cases=review.boundaryCases,prev=previousQA.eightCases;
 fault(Array.isArray(cases)&&cases.length===8,'Exactly eight dispute records mandatory');
 fault(Array.isArray(prev)&&prev.length===8,'Predecessor eight dispute records missing');
 if(Array.isArray(cases)&&Array.isArray(prev)){
  const pm=new Map(prev.map(c=>[c.sourceRelationId,c]));
  const ids=new Set();
  for(const c of cases){
   const q=pm.get(c.sourceRelationId);
   fault(!ids.has(c.sourceRelationId),'Duplicate dispute');
   ids.add(c.sourceRelationId);
   fault(!!q,'Unrecognized HistoGIS dispute');
   if(q){
    fault(c.childName===q.childName&&c.sourceParentName===q.parentName,'Changed disputed relation');
    fault(Math.abs(c.histogisOutsidePercent-q.sourceOutsidePercent)<1e-8,'Changed baseline spatial QA');
    fault(c.decision===q.decision,'Premature changed verdict');
   }
   fault(c.original1835NativeBoundaryLine===null&&c.original1841NativeBoundaryLine===null&&
         c.sourceLineTracedByIndependentOperator===false,'Original-line evidence invented');
   fault(c.legalBoundaryQualified===false&&c.administrativeParentReassigned===false,
         'Uncertified polygon or parent promoted');
  }
  fault(ids.size===8,'Missing unique HistoGIS disputes');
 }
 const admissions=review.admissions;
 for(const key of ['acceptedHistoricalPolygons','acceptedNewGeoreferencedMaps','certifiedBoundaryLines',
                  'changedAdministrativeParentEdges','modifiedACTUAL']){
  fault(admissions?.[key]===0,'Forbidden historical/ACTUAL promotion '+key);
 }
 fault(previousQA.acceptedOriginalMapGeoreferencing===0 &&
       previousQA.acceptedLegalHistoricalBoundaryPolygons===0 &&
       previousQA.blindHoldout===false,'3c baseline status was changed');
 return {ok:errors.length===0,errors};
}
