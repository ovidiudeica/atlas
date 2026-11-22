/** HIST-MODULE.3d — military cartographic hydrography audit, fail-closed. */
export const HIST3D_MILITARY_SCHEMA='atlas-historical-3d-austrian-military-hydrography-comparison-v1';
const isObject=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const isHash=x=>typeof x==='string'&&/^[a-f0-9]{64}$/.test(x);

export function validateHistoricalMilitaryHydrography(physical, military){
 const errors=[];
 const check=(flag,why)=>{if(!flag)errors.push(why)};
 if(!isObject(physical)||!isObject(military))return {ok:false,errors:['Missing physical or historical cartographic evidence']};
 check(military.schema===HIST3D_MILITARY_SCHEMA,'Wrong military hydrography schema');
 check(military.overallDecision==='HOLD_ZERO_GCP_TO_BLIND_FIT_HOLDOUT','Uncertified historic GCP admitted');
 const periods=military.timeSlices;
 check(Array.isArray(periods)&&periods.length===3,'Three distinct original survey periods required');
 const names=['first_military_survey_josephine','second_military_survey_franciscan','third_military_survey_spezialkarte'];
 if(Array.isArray(periods)&&periods.length===3){
  for(let i=0;i<3;i++){
   check(periods[i].survey===names[i],'Changed or reordered military survey period');
   check(periods[i].pixelCertified===false&&periods[i].datumProjectionVerified===false,'Unverified survey datum/pixel certified');
  }
  check(periods[0].nominalScaleDenominator===28800&&periods[2].nominalScaleDenominator===75000,'Map-scale data changed');
  check(periods[1].regionalComparisonPerformed===false,'Second survey comparison falsely completed');
 }
 check(military.sources?.locSampleCollar5172?.originalEditionYearVerified===null,
    'LOC receipt/acquisition stamp was mistaken for the map edition date');
 const all=military.cases,prior=physical.landmarks;
 check(Array.isArray(all)&&all.length===4&&Array.isArray(prior)&&prior.length===4,'Four physical candidates mandatory');
 if(Array.isArray(all)&&Array.isArray(prior)){
  const priorIds=new Set(prior.map(x=>x.id)),ids=new Set();
  for(const c of all){
   check(priorIds.has(c.physicalReferenceId)&&!ids.has(c.physicalReferenceId),'Changed or duplicated confluence ID');
   ids.add(c.physicalReferenceId);
   check(Array.isArray(c.firstSurvey?.sheetPageNumbers)&&c.firstSurvey.sheetPageNumbers.length>=1,
     'First-survey evidence unspecified');
   check(Array.isArray(c.firstSurvey?.previewFiles)&&c.firstSurvey.previewFiles.length>=1&&
     c.firstSurvey.previewFiles.every(f=>isHash(f.sha256)&&typeof f.originalCommonsPage==='string'),
     'First survey source fingerprints missing');
   check(c.firstSurvey?.uniqueHistoricalJunctionPixel===null&&
       c.firstSurvey?.sourceGeoreferenceAccuracyQualified===false,
       'First military survey native-pixel accuracy invented');
   check(c.secondSurvey?.sourceImageRecovered===false&&
       c.secondSurvey?.localSectionSurveyYearVerified===false&&
       c.secondSurvey?.uniqueHistoricalJunctionPixel===null&&
       c.secondSurvey?.status==='BLOCKED_MISSING_TARGET_SHEET_RASTER',
       'Second military survey falsely inspected or admitted');
   check(isHash(c.thirdSurvey?.regionalCropSha256) &&
       /^\d{4}_000$/.test(c.thirdSurvey?.sheetId||'') &&
       c.thirdSurvey?.locIndexFootprintContainsEUHydroNode===true,
       'LOC source crop/footprint lacks traceability');
   check(c.thirdSurvey?.editionYearVerified===null&&
       c.thirdSurvey?.uniqueHistoricalJunctionPixel===null&&
       c.thirdSurvey?.sourceGeoreferenceAccuracyQualified===false,
       'LOC unknown edition silently promoted as a historical control');
   check(c.historicalFluvialStabilityFrom18thTo21stCentury==='NOT_ESTABLISHED'&&
       c.historicalGcpQualified===false&&c.fitEligible===false&&
       c.blindHoldoutEligible===false,'Historical geomorphic stability or FIT/HOLDOUT invented');
   check(c.decision==='HOLD_HYDROGRAPHIC_CONTINUITY_NOT_GEODETIC_STABILITY',
       'Individual holdout evidence improperly upgraded');
  }
  check(ids.size===4,'Duplicate / missing military confluence case');
 }
 const gate=military.evidenceGates;
 const zeros=['firstSurveyDirectConfluencePixelsQualified','secondSurveyOriginalSheetsInspected',
              'thirdSurveyEditionDatesVerified','historicalPhysicalControlAccepted1835',
              'historicalPhysicalControlAccepted1841','blindHoldoutPointsReleased',
              'newHistoricalBoundaryDigitization'];
 for(const key of zeros)check(gate?.[key]===0,'Unauthorized evidence promotion: '+key);
 check(gate?.newFitPerformed===false&&gate?.independentMapToMapUncertaintyMeasured===false&&
       gate?.historicalHydrologicalStabilityAccepted===false&&gate?.modifiedACTUAL===false,
       'Undocumented map fit, uncertainty claim, stationary confluence, or ACTUAL changed');
 check(physical.overallVerdict==='HOLD_PHYSICAL_GCP_PENDING_UNIQUE_ORIGINAL_PIXEL_AND_HISTORICAL_STABILITY',
       'Previous physical control evidence not fail-closed');
 return {ok:errors.length===0,errors};
}
