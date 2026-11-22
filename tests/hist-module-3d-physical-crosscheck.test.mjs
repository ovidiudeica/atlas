import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validateHistorical3dPhysicalCrosscheck} from '../src/data/historicalPhysicalCrosscheck.mjs';

const root=new URL('../public/data/historical/v1/',import.meta.url);
const read=name=>JSON.parse(readFileSync(new URL(name,root),'utf8'));
const review=read('georeferencing-3d-review.json');
const topology=read('georeferencing-3d-physical-topographic-crosscheck.json');
const check=(x=topology)=>validateHistorical3dPhysicalCrosscheck(review,x);

test('3d physical crosscheck: independent EEA topology is recorded as modern-only',()=>{
 assert.deepEqual(check(),{ok:true,errors:[]});
 assert.equal(topology.reference.notDerivedFromHistoGIS,true);
 assert.equal(topology.landmarks.length,4);
 assert.deepEqual(topology.landmarks.map(x=>x.modernTopographicFinding.nodeId),
  ['NO35132805','NO35093042','NO35095608','NO35092876']);
 assert.ok(topology.landmarks.every(x=>x.nativeRasterEvidence.length===2));
 assert.equal(topology.landmarks[0].modernTopographicFinding.referenceWgs84.lon,23.91306916363337);
 assert.equal(topology.landmarks[2].modernTopographicFinding.shortConnectorSeparationMeters,38.72);
 assert.equal(topology.landmarks[3].modernTopographicFinding.shortConnectorSeparationMeters,96.27);
});

test('3d physical crosscheck: crop provenances are native source windows, never GCP values',()=>{
 for(const point of topology.landmarks){
  assert.ok(point.nativeRasterEvidence.every(c=>c.pixelAtConfluence===null));
  assert.equal(point.fitEligible,false);
  assert.equal(point.blindHoldoutEligible,false);
  assert.equal(point.timeStability1835ToModern,'NOT_ESTABLISHED');
 }
 assert.equal(topology.safeguards.originalBoundaryDigitizationBasedOnThesePoints,0);
 assert.equal(topology.safeguards.georeferenceRecalculated,false);
 assert.equal(topology.safeguards.actualChanged,false);
});

test('3d physical crosscheck rejects invented pixel matches, false stability and unauthorized admissions',()=>{
 const reject=modify=>{
  const clone=structuredClone(topology);
  modify(clone);
  assert.equal(check(clone).ok,false);
 };
 reject(x=>x.reference.notDerivedFromHistoGIS=false);
 reject(x=>x.historicalSources[0].sha256='0'.repeat(64));
 reject(x=>x.landmarks[0].nativeRasterEvidence[1].pixelAtConfluence=[1234,5678]);
 reject(x=>x.landmarks[0].nativeRasterEvidence[0].unambiguousPixelMatch=true);
 reject(x=>x.landmarks[2].timeStability1835ToModern='CERTIFIED');
 reject(x=>x.landmarks[2].fitEligible=true);
 reject(x=>x.landmarks[3].blindHoldoutEligible=true);
 reject(x=>x.landmarks[0].modernTopographicFinding.sourceHistoricEpochMatchesMap=true);
 reject(x=>x.landmarks[1].nativeRasterEvidence[0].nativePixelWindow=[100000,12,1,1]);
 reject(x=>x.landmarks[1].modernTopographicFinding.networkLinks=[]);
 reject(x=>x.safeguards.acceptedFitGCP1835=1);
 reject(x=>x.safeguards.acceptedBlindHoldoutGCP1841=1);
 reject(x=>x.safeguards.actualChanged=true);
});
