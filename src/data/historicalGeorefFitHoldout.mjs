/**
 * HIST-MODULE.3c: original 1835/1841 raster FIT/HOLDOUT is an explorative
 * REGISTRATION, not evidence that a historical administrative line is correct.
 * Never conflate a numeric transform with a certified polygon or parentage.
 */
const expectedMapIds=['hist3c:map:streit-1835','hist3c:map:raffelsperger-1841'];
const expectedSources={
 'hist3c:map:streit-1835':{
  sha:'02e55f68e870aa6e8c65ff12a71e2a080a2787443eaa0e8a58e7c3fe83d1408a',
  size:9190975,year:1835,native:[2039,1613],preview:[1600,1266]},
 'hist3c:map:raffelsperger-1841':{
  sha:'c3b0f75ba204744405cb20e5f2af004d4514a108d131540c3a608cbb53dc7d87',
  size:15084248,year:1841,native:[11426,8661],preview:[1700,1289]}
};
const SHA=/^[a-f0-9]{64}$/;
const isObject=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const number=x=>typeof x==='number'&&Number.isFinite(x);
const errUnique=errs=>[...new Set(errs)];
const equals=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const rmse=xs=>Math.sqrt(xs.reduce((z,x)=>z+x*x,0)/xs.length);

export function validateOriginalMapFitHoldout(pilot,review,register,results){
 const errors=[];
 if(!register||register.schema!=='atlas-historical-fit-holdout-review-v1'||
    !results||results.schema!=='atlas-historical-fit-holdout-results-v1')
  return {ok:false,errors:['Unsupported HIST3c schema/QA results']};
 if(register.historicalArchiveSha256!==pilot?.sourceArchiveSha256||
    register.historicalArchiveSha256!==review?.pilotArchiveSha256)
  errors.push('Original historic source SHA drift');
 if(!equals(register.originalRasterSources?.map(x=>x.id),expectedMapIds)||
    !equals(results.maps?.map(x=>x.sourceId),expectedMapIds))
  errors.push('Both specific independent originals must be present');
 const t=register.transformation;
 if(!t||t.model!=='affine_2d_least_squares'||t.targetCRS!=='EPSG:3035'||
    t.fitMinimum!==6||t.holdoutMinimum!==3||
    t.fitAndHoldoutDisjoint!==true||
    t.previewPixelsConvertedToNative!==true||
    t.trialMaximumHoldoutRMSEMeters!==5000||
    t.trialMaximumHoldoutErrorMeters!==10000||
    t.independentControlClassification!==
      'not_certified_due_to_approximate_urban_centers_and_non_blind_review'||
    t.groundSurveyedLandmarks!==0||t.independentGeomorphicHoldouts!==0||
    t.certifiedGeoreferencingAllowed!==false)
  errors.push('Exploratory FIT/HOLDOUT limitations or quality gates absent');

 const ref=new Set((register.coordinateReferences||[]).map(x=>x.id));
 if(ref.size<3||!(register.coordinateReferences||[]).every(x=>x.url?.startsWith('https://')))
  errors.push('Missing independent point-coordinate references');
 const src=new Map((review?.sources||[]).map(x=>[x.id,x]));
 for(const [i,map] of (register.originalRasterSources||[]).entries()){
  const expectation=expectedSources[map.id],res=results.maps?.[i];
  if(!expectation||map.archiveSha256!==expectation.sha||
     map.archiveBytes!==expectation.size||
     map.year!==expectation.year||
     map.rasterNative?.width!==expectation.native[0]||
     map.rasterNative?.height!==expectation.native[1]||
     map.analysisPreview?.width!==expectation.preview[0]||
     map.analysisPreview?.height!==expectation.preview[1]||
     !map.archiveUrl?.startsWith('https://')||
     map.independentOfHistoGIS!==true||
     map.cartographicImageVerified!==true)
   errors.push('Original map provenance or raster dimensions mismatch '+map?.id);
  if(map.id==='hist3c:map:raffelsperger-1841'&&
     src.get('hist3b:map:raffelsperger-1841')?.archiveSha256!==map.archiveSha256)
   errors.push('Raffelsperger image SHA differs from HIST3b');
  const controls=map.controls||[];
  const names=new Set(),roles={FIT:0,HOLDOUT:0};
  for(const c of controls){
   if(!c.id||names.has(c.id)||!c.placeName||
      !['FIT','HOLDOUT'].includes(c.role)||!ref.has(c.referenceSourceId)||
      !number(c.pixelPreview?.x)||!number(c.pixelPreview?.y)||
      !number(c.targetWgs84?.lon)||!number(c.targetWgs84?.lat)||
      Math.abs(c.targetWgs84.lon)>180||Math.abs(c.targetWgs84.lat)>90||
      c.pixelPreview.x<0||c.pixelPreview.x>=map.analysisPreview.width||
      c.pixelPreview.y<0||c.pixelPreview.y>=map.analysisPreview.height||
      c.landmarkKind!=='historic_town_center_map_symbol_or_label'||
      c.pointQuality!=='provisional_visual_only_not_ground_survey'||
      c.fitHoldoutIndependence!=='disjoint_coordinates_but_not_blind_selection'||
      c.directImageInspection!==true||!number(c.pixelUncertaintyPreviewPx)||
      !number(c.referenceLocationUncertaintyMeters))
    errors.push('Unqualified GCP '+map.id+' '+c.id);
   names.add(c.id);roles[c.role]=(roles[c.role]||0)+1;
  }
  if(roles.FIT<6||roles.HOLDOUT<3||controls.length!==res?.points?.length||
     res.fitCount!==roles.FIT||res.holdoutCount!==roles.HOLDOUT)
   errors.push('Missing/disjoint FIT/HOLDOUT count '+map.id);
  if(!res||res.archiveSha256!==map.archiveSha256||
     res.sourceFileVerified!==true||res.targetCRS!=='EPSG:3035'||
     res.fitHoldoutDisjoint!==true||
     res.fitReferenceIsIndependentOfHistoGIS!==true||
     res.blindIndependentHoldout!==false||
     res.approvedForBoundaryTracing!==false||
     res.historicalBoundaryCertified!==false||
     res.certificationDecision!=='HOLD'||
     res.suitableForCanonicalHistoricalGeometry!==false||
     res.geotransformNative?.length!==6||
     !res.geotransformNative.every(number)||
     !number(res.fitRMSEMeters)||!number(res.holdoutRMSEMeters)||
     !number(res.holdoutMaxMeters))
   errors.push('Invalid or prematurely qualified trial georeferencing '+map?.id);
  const fitErr=[],holdErr=[];
  for(const [idx,c] of controls.entries()){
   const row=res?.points?.[idx];
   const sx=c.pixelPreview.x*map.rasterNative.width/map.analysisPreview.width;
   const sy=c.pixelPreview.y*map.rasterNative.height/map.analysisPreview.height;
   if(!row||row.id!==c.id||row.role!==c.role||
      row.referenceSourceId!==c.referenceSourceId||
      row.positionQuality!==c.pointQuality||
      !number(row.errorMeters)||
      Math.abs(row.pixelNative[0]-sx)>0.0002||
      Math.abs(row.pixelNative[1]-sy)>0.0002)
    errors.push('FIT/HOLDOUT point mismatch '+map.id+' '+c.id);
   if(number(row?.errorMeters)){
     if(c.role==='FIT')fitErr.push(row.errorMeters);
     else holdErr.push(row.errorMeters);
   }
  }
  if(fitErr.length===roles.FIT&&holdErr.length===roles.HOLDOUT){
   const fitRM=rmse(fitErr),hRM=rmse(holdErr),hMax=Math.max(...holdErr);
   if(Math.abs(fitRM-res.fitRMSEMeters)>0.01||
      Math.abs(hRM-res.holdoutRMSEMeters)>0.01||
      Math.abs(hMax-res.holdoutMaxMeters)>0.01)
    errors.push('Unreproducible aggregate GCP metrics '+map.id);
   const passed=hRM<=5000&&hMax<=10000;
   if(res.passNumericTrialGates!==passed)
    errors.push('Numeric FIT/HOLDOUT gate misreported '+map.id);
   if(passed)
    errors.push('This HIST3c snapshot cannot silently promote any initially failed trial');
  }
 }
 const initial=review?.boundaryDisputes||[];
 const baseline=new Map(initial.map(x=>[x.sourceRelationId,x]));
 const cases=register.boundaryCases||[],outcomes=results.eightCases||[];
 if(cases.length!==8||outcomes.length!==8||
    cases.filter(x=>x.decision==='BLOCKED_SOURCE_PARENT').length!==2||
    outcomes.filter(x=>x.decision==='BLOCKED_SOURCE_PARENT').length!==2)
  errors.push('Eight source boundary disputes must be retained 2 blocked / 6 HOLD');
 for(const [i,c] of cases.entries()){
  const original=baseline.get(c.sourceRelationId),q=outcomes[i];
  if(!original||!q||q.sourceRelationId!==c.sourceRelationId||
     c.baselineDecision!==original.sourceTopologyVerdict||
     Math.abs(c.baselineOutsidePercent-original.outsidePercentEqualArea)>1e-7||
     c.decision!==q.decision||
     c.independentBoundaryLine1835!=='not_traced'||
     c.independentBoundaryLine1841!=='not_traced'||
     q.original1835LineDigitized!==false||
     q.original1841LineDigitized!==false||
     q.fitHoldoutGeoreferencingAccepted!==false||
     c.legalBoundaryCertified!==false||
     q.legalBoundaryCertified!==false||
     c.administrativeParentReassignment!==null||
     q.reassignedLegalParent!==null||
     c.newGeometryId!==null||
     q.newHistoricalGeometryId!==null)
   errors.push('Independently unsupported historical geometry/parent change '+c.sourceRelationId);
 }
 const a=register.admissions;
 if(!a||a.newCanonicalGeoreferencedRasters!==0||
    a.newHistoricalGeometryIds!==0||
    a.changedOriginalHistoGISGeometries!==0||
    a.changedHistoricalParents!==0||a.changedACTUAL!==0||
    a.directlyVerifiedOriginalBoundaryLines!==0||a.caseCount!==8||
    a.blockedSourceParentCount!==2||a.otherBoundaryHoldCount!==6||
    results.acceptedOriginalMapGeoreferencing!==0||
    results.acceptedLegalHistoricalBoundaryPolygons!==0||
    results.acceptedReparentings!==0||
    results.independentHistoGISDigitizationUsedInFit!==false||
    results.blindHoldout!==false||
    results.pointConfidence!=='provisional_visual')
  errors.push('Original/canonical geometry source protections lost');
 return {ok:errors.length===0,errors:errUnique(errors)};
}

export async function loadOriginalMapFitHoldout(pilot,review,baseUrl=import.meta.env?.BASE_URL??'/'){
 const base=baseUrl.replace(/\/?$/,'/')+'data/historical/v1/';
 const qa=baseUrl.replace(/\/?$/,'/')+'data/historical/qa/';
 const [a,b]=await Promise.all([
   fetch(base+'georeferencing-3c.json'),
   fetch(qa+'HIST-MODULE.3c-FIT-HOLDOUT.json')]);
 if(!a.ok||!b.ok)throw Error('HIST3c QA source HTTP '+a.status+'/'+b.status);
 const register=await a.json(),results=await b.json();
 const checked=validateOriginalMapFitHoldout(pilot,review,register,results);
 if(!checked.ok)throw Error('HIST3c fail-closed source QA '+checked.errors.join('; '));
 return {register,results};
}

export function fitHoldoutCaseForVersion(register,versionId){
 const original=register?.boundaryCases||[];
 return original.filter(r=>r.sourceRelationId.includes(':')&&(
   r.sourceRelationId.split(':').slice(2,4).join(':') &&
   (r.sourceRelationId.startsWith('histogis-v9:hierarchy:')&&
    r.sourceRelationId.includes(':'+versionId.split(':').at(-1)+':'))));
}
