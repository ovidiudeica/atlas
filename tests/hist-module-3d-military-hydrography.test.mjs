import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validateHistoricalMilitaryHydrography} from '../src/data/historicalMilitaryHydrography.mjs';

const folder=new URL('../public/data/historical/v1/',import.meta.url);
const read=x=>JSON.parse(readFileSync(new URL(x,folder),'utf8'));
const physical=read('georeferencing-3d-physical-topographic-crosscheck.json');
const register=read('georeferencing-3d-austrian-military-hydrography.json');
const check=(r=register)=>validateHistoricalMilitaryHydrography(physical,r);

test('Austrian surveys: four original maps indexed, first + third inspected, second pending',()=>{
 assert.deepEqual(check(),{ok:true,errors:[]});
 assert.deepEqual(register.cases.map(c=>c.thirdSurvey.sheetId),['5172_000','5670_000','5572_000','5772_000']);
 assert.deepEqual(register.timeSlices.map(x=>x.regionalComparisonPerformed),[true,false,true]);
 assert.ok(register.cases.every(x=>x.firstSurvey.previewFiles.every(z=>z.sha256.length===64)));
 assert.equal(register.sources.locSampleCollar5172.originalEditionYearVerified,null);
});

test('Austrian survey continuity does not establish a certified historical physical GCP',()=>{
 assert.ok(register.cases.every(x=>x.historicalGcpQualified===false));
 assert.ok(register.cases.every(x=>x.fitEligible===false&&x.blindHoldoutEligible===false));
 assert.ok(register.cases.every(x=>x.secondSurvey.sourceImageRecovered===false));
 assert.equal(register.evidenceGates.historicalPhysicalControlAccepted1835,0);
 assert.equal(register.evidenceGates.blindHoldoutPointsReleased,0);
 assert.equal(register.evidenceGates.modifiedACTUAL,false);
});

test('Austrian military survey QA rejects fictional dates, blind holdout and fabricated confluence pixels',()=>{
 const reject=mod=>{
  const cloned=structuredClone(register);
  mod(cloned);
  assert.equal(check(cloned).ok,false);
 };
 reject(x=>x.timeSlices[1].regionalComparisonPerformed=true);
 reject(x=>x.timeSlices[2].pixelCertified=true);
 reject(x=>x.sources.locSampleCollar5172.originalEditionYearVerified=1885);
 reject(x=>x.cases[0].secondSurvey.sourceImageRecovered=true);
 reject(x=>x.cases[1].firstSurvey.previewFiles[0].sha256='missing');
 reject(x=>x.cases[2].thirdSurvey.regionalCropSha256='0');
 reject(x=>x.cases[2].thirdSurvey.editionYearVerified=1909);
 reject(x=>x.cases[3].firstSurvey.uniqueHistoricalJunctionPixel=[123,456]);
 reject(x=>x.cases[3].historicalGcpQualified=true);
 reject(x=>x.cases[3].fitEligible=true);
 reject(x=>x.cases[0].blindHoldoutEligible=true);
 reject(x=>x.evidenceGates.secondSurveyOriginalSheetsInspected=4);
 reject(x=>x.evidenceGates.historicalHydrologicalStabilityAccepted=true);
 reject(x=>x.evidenceGates.modifiedACTUAL=true);
});
