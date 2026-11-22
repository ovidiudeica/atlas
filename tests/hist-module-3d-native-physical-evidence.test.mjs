import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validateHistorical3dReview} from '../src/data/historicalEvidence3d.mjs';

const root=new URL('../public/data/historical/v1/',import.meta.url);
const load=name=>JSON.parse(readFileSync(new URL(name,root),'utf8'));
const predecessor=load('georeferencing-3c.json');
const old=load('georeferencing-3c-results.json');
const review=load('georeferencing-3d-review.json');
const check=(r=review,p=predecessor,q=old)=>validateHistorical3dReview(p,q,r);

test('3d register: exact original-map fingerprints and independently examined Streit scale conflict',()=>{
 assert.deepEqual(check(),{ok:true,errors:[]});
 assert.deepEqual(review.originals.map(x=>x.year),[1835,1841]);
 assert.equal(review.originals[0].scale.printedDenominator,1200000);
 assert.equal(review.originals[0].scale.wbcCatalogDenominator,200000);
 assert.equal(review.originals[1].scale.printedScaleIndependentlyMeasured,false);
});
test('3d: physical points are research candidates, no fabricated blind holdout or native line',()=>{
 assert.equal(review.candidatePhysicalLandmarks.length,4);
 assert.ok(review.candidatePhysicalLandmarks.every(x=>x.quality==='RESEARCH_CANDIDATE_NOT_GCP'));
 assert.equal(review.holdoutProtocol.status,'PROTOCOL_DRAFT_NOT_EXECUTED');
 assert.equal(review.holdoutProtocol.blindHoldoutMeasured1835,0);
 assert.equal(review.holdoutProtocol.blindHoldoutMeasured1841,0);
 assert.deepEqual(review.nativeLineDigitization.lines,[]);
 assert.equal(review.admissions.acceptedHistoricalPolygons,0);
 assert.equal(review.admissions.modifiedACTUAL,0);
});
test('3d: all eight previous HistoGIS disputes retain individually audited HOLD/BLOCK',()=>{
 assert.equal(review.boundaryCases.length,8);
 const blocked=review.boundaryCases.filter(x=>x.decision==='BLOCKED_SOURCE_PARENT');
 assert.deepEqual(blocked.map(x=>x.childName),['Doboka','Mühlbach']);
 assert.equal(review.boundaryCases.filter(x=>x.decision==='HOLD_ORIGINAL_BOUNDARY_RECONCILIATION').length,6);
 for(const c of review.boundaryCases){
  assert.equal(c.original1835NativeBoundaryLine,null);
  assert.equal(c.original1841NativeBoundaryLine,null);
  assert.equal(c.legalBoundaryQualified,false);
  assert.equal(c.administrativeParentReassigned,false);
 }
});
test('3d: resist accidental/fraudulent promotion of maps, holdout, control points or parents',()=>{
 const rejects=change=>{
   const copy=structuredClone(review);
   change(copy);
   assert.equal(check(copy).ok,false);
 };
 rejects(x=>x.releaseDecision='CERTIFIED');
 rejects(x=>x.originals[0].scale.printedDenominator=200000);
 rejects(x=>x.originals[1].scale.printedScaleIndependentlyMeasured=true);
 rejects(x=>x.originals[0].archiveSha256='0'.repeat(64));
 rejects(x=>x.candidatePhysicalLandmarks[0].quality='surveyed');
 rejects(x=>x.candidatePhysicalLandmarks[0].nativePixel1835=[100,200]);
 rejects(x=>x.holdoutProtocol.preexisting3cSplitBlind=true);
 rejects(x=>x.holdoutProtocol.blindHoldoutMeasured1841=3);
 rejects(x=>x.holdoutProtocol.cryptographicPrecommitCreated=true);
 rejects(x=>x.nativeLineDigitization.independentVectorTracesCount=1);
 rejects(x=>x.nativeLineDigitization.lines=[{coordinates:[[1,2],[3,4]]}]);
 rejects(x=>x.boundaryCases[0].legalBoundaryQualified=true);
 rejects(x=>x.boundaryCases[0].administrativeParentReassigned=true);
 rejects(x=>x.boundaryCases[0].histogisOutsidePercent=0);
 rejects(x=>x.admissions.modifiedACTUAL=1);
});
