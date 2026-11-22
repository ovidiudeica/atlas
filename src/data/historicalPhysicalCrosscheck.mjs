/** HIST-MODULE.3d: certify only the scope actually supported by EU-Hydro topology. */
export const HIST3D_PHYSICAL_SCHEMA='atlas-historical-3d-physical-topographic-crosscheck-v1';
const obj=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const hash=x=>typeof x==='string'&&/^[0-9a-f]{64}$/.test(x);
const EXPECTED=['HIST3D-PHYS-SOMES-JOIN','HIST3D-PHYS-MURES-STREI','HIST3D-PHYS-TARNAVA-JOIN','HIST3D-PHYS-OLT-CIBIN'];

export function validateHistorical3dPhysicalCrosscheck(previous,register){
 const errors=[];
 const test=(value,msg)=>{if(!value)errors.push(msg)};
 if(!obj(previous)||!obj(register))return {ok:false,errors:['Missing original register or physical crosscheck']};
 test(register.schema===HIST3D_PHYSICAL_SCHEMA,'Unsupported physical crosscheck schema');
 test(register.overallVerdict==='HOLD_PHYSICAL_GCP_PENDING_UNIQUE_ORIGINAL_PIXEL_AND_HISTORICAL_STABILITY',
     'Crosscheck not allowed to certify source pixel or physical GCP');
 test(register.reference?.notDerivedFromHistoGIS===true,'Independent topographic reference required');
 test(register.reference?.provider==='European Environment Agency','Unexpected topographic provider');
 test(register.reference?.sourceReferenceCRS==='EPSG:4326','Unrecorded reference CRS');
 test(register.reference?.sourceSuppliedPositionalUncertaintyMeters===null,
     'Claimed unsourced point positional precision');
 const originals=register.historicalSources;
 const priorOriginals=previous.originals;
 test(Array.isArray(originals)&&originals.length===2,'Two original maps required');
 if(Array.isArray(originals)&&Array.isArray(priorOriginals)&&originals.length===2&&priorOriginals.length===2){
  for(let i=0;i<2;i++){
   test(originals[i].id===priorOriginals[i].sourceId,'Map source identity changed');
   test(originals[i].sha256===priorOriginals[i].archiveSha256&&hash(originals[i].sha256),
        'Original map binary fingerprint mismatch');
   test(originals[i].nativeRasterSize?.length===2&&originals[i].nativeRasterSize.every(n=>Number.isInteger(n)&&n>0),
        'Missing native source dimensions');
  }
  test(originals[0].scaleDenominator===1200000,'Streit original scale cannot be silently changed');
  test(originals[1].catalogScaleDenominator===890000,'Raffelsperger catalog scale cannot be silently changed');
 }
 const landmarks=register.landmarks,baseline=previous.candidatePhysicalLandmarks;
 test(Array.isArray(landmarks)&&landmarks.length===4,'Four crosschecked physical candidates required');
 if(Array.isArray(landmarks)&&Array.isArray(baseline)){
  const ids=landmarks.map(x=>x.id);
  test(new Set(ids).size===4&&EXPECTED.every(id=>ids.includes(id))&&baseline.every(x=>ids.includes(x.id)),
       'Different or duplicated source-candidate IDs');
  for(const point of landmarks){
   const tp=point.modernTopographicFinding;
   test(obj(tp)&&typeof tp.nodeId==='string'&&tp.nodeId.startsWith('NO')&&
        Number.isFinite(tp.referenceWgs84?.lon)&&Number.isFinite(tp.referenceWgs84?.lat),
        'Non-identifiable EEA EU-Hydro hydrological node');
   test(Array.isArray(tp?.networkLinks)&&tp.networkLinks.length>=3&&tp.networkLinks.every(
        link=>typeof link.objectId==='string'&&link.objectId.startsWith('RL')&&[7,8,9,10].includes(link.layer)),
        'Missing source-network links');
   test(tp?.sourceHistoricEpochMatchesMap===false&&tp?.independentPhysicalSurveyControl===false,
        'Modern network incorrectly asserted to certify historical course or control station');
   test(point.timeStability1835ToModern==='NOT_ESTABLISHED','Unverified fluvial stationarity claimed');
   test(point.physicalLandmarkCertifiedForMap1835===false&&point.physicalLandmarkCertifiedForMap1841===false,
        'Historical point falsely certified');
   test(point.fitEligible===false&&point.blindHoldoutEligible===false,'Unqualified landmark promoted into FIT/HOLDOUT');
   test(point.outcome==='EXTERNAL_MODERN_REFERENCE_IDENTIFIED_HISTORICAL_PIXEL_NOT_QUALIFIED',
        'Historical pixel has not been independently qualified');
   const cropped=point.nativeRasterEvidence;
   test(Array.isArray(cropped)&&cropped.length===2,'Two native-source crop checks required');
   if(Array.isArray(cropped)&&cropped.length===2){
    for(let i=0;i<2;i++){
     const c=cropped[i],orig=originals?.[i];
     const w=c.nativePixelWindow;
     test(c.sourceId===orig?.id&&hash(c.sha256)&&Array.isArray(w)&&w.length===4&&
          w.every(n=>Number.isInteger(n))&&w[0]>=0&&w[1]>=0&&w[2]>0&&w[3]>0&&
          w[0]+w[2]<=orig.nativeRasterSize[0]&&w[1]+w[3]<=orig.nativeRasterSize[1],
          'Source raster crop not reproducible or valid');
     test(c.pixelAtConfluence===null&&c.unambiguousPixelMatch===false&&
          c.sourceColorOrRiverAttributionCertified===false,
          'An unobserved historical junction has been given fabricated native pixels');
    }
   }
  }
 }
 const g=register.safeguards;
 for(const k of ['originalBoundaryDigitizationBasedOnThesePoints','acceptedFitGCP1835',
                   'acceptedFitGCP1841','acceptedBlindHoldoutGCP1835','acceptedBlindHoldoutGCP1841'])
   test(g?.[k]===0,'Unqualified physical landmark promoted: '+k);
 test(g?.georeferenceRecalculated===false&&g?.canonicalGeometryEdited===false&&
      g?.actualChanged===false&&g?.independentSecondReaderHistoricalPixelAudit===false,
      'Unauthorized historical coordinate transformation, ACTUAL modification or second-reader certification');
 return {ok:errors.length===0,errors};
}
