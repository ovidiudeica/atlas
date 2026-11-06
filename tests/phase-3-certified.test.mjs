import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { createHash } from 'node:crypto';

const source=new URL('../data/candidates/phase3/actual/',import.meta.url);
const read=name=>readFileSync(new URL(name,source));
const json=name=>JSON.parse(read(name).toString('utf8'));
const manifest=json('manifest-v3.json');
const older=json('manifest-v2.json');
const decisions=json('source-exception-decisions-v1.json');
const QA=json('simplification-qa-v1.json');
const overlap=json('simplification-overlaps-v1.json');
const coverage=json('simplification-parent-cover-v1.json');
const hash=b=>createHash('sha256').update(b).digest('hex');
const targets=[
 ['ro-administrative-simplified-v1.geojson.gz','ro-administrative-v2.geojson.gz',3229],
 ['md-administrative-simplified-v1.geojson.gz','md-administrative-v2.geojson.gz',1036],
 ['ro-statistical-simplified-v1.geojson.gz','ro-statistical-v2.geojson.gz',12],
 ['md-statistical-simplified-v1.geojson.gz','md-statistical-v2.geojson.gz',6]
];

test('cartographic certificate has explicit, limited, source-faithful scope',()=>{
 assert.equal(manifest.status,'CERTIFIED_CARTOGRAPHIC_SOURCE_WITH_ACCEPTED_EXCEPTIONS');
 assert.equal(manifest.readyForProtectedIntegration,true);
 assert.equal(manifest.legallyCertified,false);
 assert.equal(decisions.legalCertification,false);
 assert.equal(manifest.exceptions.topologicalCases,5);
 assert.equal(manifest.exceptions.cuatmCases,6);
 assert.equal(manifest.exceptions.legalIdentityAmbiguityRemaining,4);
 assert.equal(manifest.simplifiedGeometry.mapshaperUnrepairedArcIntersectionsMD,3);
 assert.match(manifest.simplifiedGeometry.engineWarningDisposition,/not a legal certification/i);
 assert.equal(manifest.exceptions.decisionRegisterSha256,hash(read('source-exception-decisions-v1.json')));
 assert.equal(manifest.baseline.v2ManifestSha256,hash(read('manifest-v2.json')));
 assert.equal(older.status,'GEOMETRY_COMPLETE_NOT_PROMOTABLE');
 assert.match(manifest.releaseScope,/not a legal/i);
});

test('every certified simplified feature maps one-to-one to an original geometry',()=>{
 for(const [simplified,canonical,count] of targets) {
   const b=read(simplified),entry=manifest.newArtifacts[simplified];
   assert(entry,'missing certificate entry '+simplified);
   assert.equal(entry.sha256,hash(b),simplified);
   assert.equal(entry.bytes,b.length,simplified);
   assert.equal(entry.featureCount,count,simplified);
   const sc=JSON.parse(gunzipSync(b)),oc=JSON.parse(gunzipSync(read(canonical)));
   assert.equal(sc.type,'FeatureCollection');
   assert.equal(sc.features.length,count,simplified);
   assert.equal(oc.features.length,count,canonical);
   const before=new Map(oc.features.map(f=>[f.properties?.atlasId,f]));
   const after=new Map(sc.features.map(f=>[f.properties?.atlasId,f]));
   assert.equal(before.size,count);
   assert.equal(after.size,count);
   for(const [id,prior] of before){
     assert(id&&after.has(id),'missing source geometry id '+id);
     const current=after.get(id);
     assert(['Polygon','MultiPolygon'].includes(current.geometry?.type),id+' invalid type');
     assert.deepEqual(current.properties,prior.properties,id+' source feature properties changed');
   }
 }
});

test('certification evidence is hash-pinned and passes simplification gates',()=>{
 for(const name of ['simplification-qa-v1.json','simplification-overlaps-v1.json','simplification-parent-cover-v1.json']){
   const entry=manifest.newArtifacts[name];
   assert(entry,'missing evidence '+name);
   assert.equal(hash(read(name)),entry.sha256,name+' checksum');
   assert.equal(read(name).length,entry.bytes,name+' size');
 }
 assert.equal(QA.newInvalidCount,0);
 assert.equal(QA.invalidList.length,0);
 assert.equal(QA.areaLarge.length,0);
 assert.equal(Object.keys(QA.groups).length,4);
 for(const group of Object.values(QA.groups)){
   assert.equal(group.invalidSimplified,0);
   assert.equal(group.countOver1Pct,0);
   assert(group.maxAreaDriftPercent<1);
   assert(group.reductionPercent>30);
 }
 assert.equal(overlap.allNewMaterial.length,0);
 assert.equal(overlap.changedMaterial.length,0);
 const all=Object.values(overlap.groups);
 const total=all.reduce((s,x)=>s+x.checkedPairs,0);
 assert(total>=15000);
 assert.equal(manifest.simplifiedGeometry.exhaustivePairsChecked,total);
 assert.equal(all.reduce((s,x)=>s+x.baselineOverlapPairs,0),3);
 assert.equal(all.reduce((s,x)=>s+x.simplifiedOverlapPairs,0),3);
 assert.equal(coverage.parents.length,79);
 assert.equal(coverage.issues.length,0);
 for(const row of coverage.parents){
   assert(row.gapDeltaKm2<=0.01+1e-10,'new gap '+row.parent);
   assert(row.excessDeltaKm2<=0.01+1e-10,'new excess '+row.parent);
 }
});

test('all known individual source exceptions are accounted for without legal claims',()=>{
 assert.equal(decisions.topologicalCases.length,5);
 assert.equal(decisions.cuatmCases.length,6);
 const topoIDs=new Set(decisions.topologicalCases.map(x=>x.id));
 assert.equal(topoIDs.size,5);
 const overlapCount=decisions.topologicalCases.filter(x=>x.type==='same-level-overlap').length;
 const parentCount=decisions.topologicalCases.filter(x=>x.type==='child-outside-parent').length;
 assert.equal(overlapCount,3);
 assert.equal(parentCount,2);
 const pairs=new Set(decisions.cuatmCases.map(x=>x.code));
 assert.deepEqual([...pairs].sort(),['0100','0500','1050','3417','7160','8034']);
 assert.equal(decisions.cuatmCases.filter(x=>x.officialCUATMIdentity==='one').length,2);
 assert.equal(decisions.cuatmCases.filter(x=>x.officialCUATMIdentity==='unverified_source_component_mapping').length,4);
 assert(decisions.topologicalCases.every(x=>x.decision==='accepted_as_OSMB_source_exception'&&x.changeToOriginal==='none'));
 assert(decisions.cuatmCases.every(x=>x.relationIds?.length>=2));
});

test('cartographic certificate preserves all v2 source geometry hashes',()=>{
 const keys=['actual/ro-administrative-v2.geojson.gz',
 'actual/md-administrative-v2.geojson.gz',
 'actual/ro-statistical-v2.geojson.gz',
 'actual/md-statistical-v2.geojson.gz'];
 for(const name of keys){
  const previous=older.files[name];
  assert(previous,name+' missing in historical manifest');
  const actual=read(name.replace('actual/',''));
  assert.equal(hash(actual),previous.sha256);
  assert.equal(actual.length,previous.bytes);
  assert.deepEqual(manifest.baseline.originalGeometryFiles[name],previous);
 }
});
