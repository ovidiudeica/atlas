import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {
 validateOriginalMapFitHoldout,fitHoldoutCaseForVersion
} from '../src/data/historicalGeorefFitHoldout.mjs';
import {validateHistoricalBoundaryReview} from '../src/data/historicalBoundaryReview.mjs';
import {validateHistoricalPilotCatalog} from '../src/data/historicalCatalog.mjs';
import {validateHistoricalQualification} from '../src/data/historicalQualification.mjs';

const dir=new URL('../public/data/historical/v1/',import.meta.url);
const read=x=>JSON.parse(readFileSync(new URL(x,dir),'utf8'));
const pilot=read('catalog.json'),quality=read('qualification.json');
const previous=read('boundary-parentage-review.json');
const register=read('georeferencing-3c.json');
const results=read('georeferencing-3c-results.json');
const check=(r=register,qa=results)=>validateOriginalMapFitHoldout(pilot,previous,r,qa);

test('HIST3c: both original-source data and replayed actual GCP residuals accepted as honest QA records',()=>{
 assert.deepEqual(validateHistoricalPilotCatalog(pilot),{ok:true,errors:[]});
 assert.deepEqual(validateHistoricalQualification(pilot,quality),{ok:true,errors:[]});
 assert.deepEqual(validateHistoricalBoundaryReview(pilot,quality,previous),{ok:true,errors:[]});
 assert.deepEqual(check(),{ok:true,errors:[]});
});

test('HIST3c: both original scans and native dimensions are fingerprinted; no source geometry changed',()=>{
 assert.deepEqual(register.originalRasterSources.map(x=>x.year),[1835,1841]);
 assert.deepEqual(register.originalRasterSources.map(x=>x.archiveBytes),[9190975,15084248]);
 assert.deepEqual(register.originalRasterSources.map(x=>x.rasterNative.width),[2039,11426]);
 assert.deepEqual(register.originalRasterSources.map(x=>x.rasterNative.height),[1613,8661]);
 assert.equal(register.historicalArchiveSha256,pilot.sourceArchiveSha256);
 assert.equal(pilot.geometries.length,53);
 assert.equal(pilot.hierarchy.length,52);
 assert.ok(pilot.versions.every(x=>x.boundaryCertification==='not_certified'));
 assert.ok(pilot.hierarchy.every(x=>x.evidenceStatus==='candidate'));
 assert.equal(results.independentHistoGISDigitizationUsedInFit,false);
});

test('HIST3c: 1835 = 7 FIT + 4 HOLDOUT; 1841 = 7 FIT + 3 HOLDOUT',()=>{
 assert.deepEqual(results.maps.map(x=>x.fitCount),[7,7]);
 assert.deepEqual(results.maps.map(x=>x.holdoutCount),[4,3]);
 for(const [i,m] of results.maps.entries()){
  const controls=register.originalRasterSources[i].controls;
  const fit=new Set(controls.filter(x=>x.role==='FIT').map(x=>x.id));
  const hold=new Set(controls.filter(x=>x.role==='HOLDOUT').map(x=>x.id));
  assert.ok([...fit].every(x=>!hold.has(x)));
  assert.equal(m.fitHoldoutDisjoint,true);
  assert.equal(m.sourceFileVerified,true);
  assert.equal(m.targetCRS,'EPSG:3035');
  assert.equal(m.geotransformNative.length,6);
  assert.ok(controls.every(x=>x.pointQuality==='provisional_visual_only_not_ground_survey'));
 }
 assert.equal(register.transformation.groundSurveyedLandmarks,0);
 assert.equal(register.transformation.independentGeomorphicHoldouts,0);
 assert.equal(results.blindHoldout,false);
});

test('HIST3c: independent HOLDOUT rejected both image fits, no boundary accepted',()=>{
 const [s,r]=results.maps;
 assert.ok(s.fitRMSEMeters>5000&&s.fitRMSEMeters<6000);
 assert.ok(s.holdoutRMSEMeters>9000&&s.holdoutRMSEMeters<10000);
 assert.ok(s.holdoutMaxMeters>15000&&s.holdoutMaxMeters<17000);
 assert.ok(r.fitRMSEMeters>5000&&r.fitRMSEMeters<6000);
 assert.ok(r.holdoutRMSEMeters>7000&&r.holdoutRMSEMeters<9000);
 assert.ok(r.holdoutMaxMeters>10000&&r.holdoutMaxMeters<11000);
 for(const m of results.maps){
  assert.equal(m.passNumericTrialGates,false);
  assert.equal(m.certificationDecision,'HOLD');
  assert.equal(m.approvedForBoundaryTracing,false);
  assert.equal(m.suitableForCanonicalHistoricalGeometry,false);
  assert.equal(m.historicalBoundaryCertified,false);
 }
 assert.equal(results.acceptedOriginalMapGeoreferencing,0);
 assert.equal(results.acceptedLegalHistoricalBoundaryPolygons,0);
 assert.equal(results.acceptedReparentings,0);
});

test('HIST3c: eight original HistoGIS geometry exceptions are reassessed individually but still blocked/HOLD',()=>{
 assert.equal(register.boundaryCases.length,8);
 assert.equal(results.eightCases.length,8);
 const blocked=results.eightCases.filter(x=>x.decision==='BLOCKED_SOURCE_PARENT');
 const hold=results.eightCases.filter(x=>x.decision==='HOLD_ORIGINAL_BOUNDARY_RECONCILIATION');
 assert.equal(blocked.length,2);assert.equal(hold.length,6);
 assert.ok(blocked.some(x=>x.childName==='Doboka'));
 assert.ok(blocked.some(x=>x.childName==='Mühlbach'));
 for(const r of results.eightCases){
   const original=previous.boundaryDisputes.find(x=>x.sourceRelationId===r.sourceRelationId);
   assert.equal(r.sourceOutsidePercent,original?.outsidePercentEqualArea);
   assert.equal(r.original1835LineDigitized,false);
   assert.equal(r.original1841LineDigitized,false);
   assert.equal(r.fitHoldoutGeoreferencingAccepted,false);
   assert.equal(r.legalBoundaryCertified,false);
   assert.equal(r.reassignedLegalParent,null);
   assert.equal(r.newHistoricalGeometryId,null);
 }
 assert.equal(fitHoldoutCaseForVersion(register,'histogis-v9:version:12324').length,1);
 assert.equal(fitHoldoutCaseForVersion(register,'histogis-v9:version:12383').length,1);
 assert.equal(fitHoldoutCaseForVersion(register,'histogis-v9:version:99999').length,0);
});

test('HIST3c: no fraudulent source, GCP, RMS, blind HOLDOUT or boundary promotions can pass',()=>{
 const rejects=(fn)=>{
  const r=structuredClone(register),qa=structuredClone(results);
  fn(r,qa);
  const v=check(r,qa);
  assert.equal(v.ok,false,JSON.stringify(v));
 };
 rejects((r,qa)=>r.originalRasterSources[0].archiveSha256='0'.repeat(64));
 rejects((r,qa)=>r.originalRasterSources[1].rasterNative.width=123);
 rejects((r,qa)=>r.originalRasterSources[0].controls[0].role='HOLDOUT');
 rejects((r,qa)=>r.originalRasterSources[0].controls[1].id=r.originalRasterSources[0].controls[0].id);
 rejects((r,qa)=>r.originalRasterSources[0].controls[0].pointQuality='surveyed');
 rejects((r,qa)=>r.originalRasterSources[0].controls[0].landmarkKind='independent_rock');
 rejects((r,qa)=>r.transformation.independentGeomorphicHoldouts=3);
 rejects((r,qa)=>r.transformation.certifiedGeoreferencingAllowed=true);
 rejects((r,qa)=>qa.maps[1].passNumericTrialGates=true);
 rejects((r,qa)=>qa.maps[0].holdoutRMSEMeters=2200);
 rejects((r,qa)=>qa.maps[0].points[0].errorMeters=0);
 rejects((r,qa)=>qa.maps[0].certificationDecision='CERTIFIED');
 rejects((r,qa)=>qa.maps[0].blindIndependentHoldout=true);
 rejects((r,qa)=>r.boundaryCases[0].childVersionId='histogis-v9:version:88888');
 rejects((r,qa)=>r.boundaryCases[0].administrativeParentReassignment='histogis-v9:version:9915');
 rejects((r,qa)=>qa.eightCases[0].legalBoundaryCertified=true);
 rejects((r,qa)=>qa.eightCases[0].newHistoricalGeometryId='fake');
 rejects((r,qa)=>r.admissions.changedACTUAL=1);
});
