import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {
  validateGeodataHistoricalIndex,validateGeodataGeometryShard,
  geodataSourceAtDate,geodataSourcesAtYear
} from '../src/data/historicalGeodata.mjs';

const base=new URL('../public/data/historical/v1/geodata/',import.meta.url);
const read=name=>JSON.parse(readFileSync(new URL(name,base),'utf8'));
const index=read('index.json');

test('historical source index: 290 source occurrences use 212 exact logical geometry assets',()=>{
 assert.deepEqual(validateGeodataHistoricalIndex(index),{ok:true,errors:[]});
 assert.equal(index.entries.length,290);
 assert.equal(index.shards.length,32);
 assert.equal(index.shards.reduce((n,s)=>n+s.count,0),290);
 assert.equal(index.notCanonicalHierarchy,true);
 assert.equal(index.notLegalBoundaryCertification,true);
 assert.equal(index.geometryDuplicates.length,78);
 assert.equal(index.geometryAssets,212);
 assert.deepEqual(index.countsBySource,{OHM:139,HURI:99,TRANSILVANIA_COLLECTION:52});
 assert.ok(index.entries.every(e=>e.status==='source_candidate_not_certified'));
});

test('source geom coordinates, types and original OSM relation identifiers are intact',()=>{
 const ids=new Set();
 for(const shard of index.shards){
   const data=read(shard.file);
   assert.deepEqual(validateGeodataGeometryShard(data,index,shard.file),{ok:true,errors:[]});
   assert.equal(data.features.length,shard.count);
   for(let i=0;i<data.features.length;i++){
     const feature=data.features[i];
     assert.ok(['Polygon','MultiPolygon'].includes(feature.geometry.type));
     if(shard.file.startsWith('ohm-')){
       assert.ok(!ids.has(feature.id));
       ids.add(feature.id);
       assert.equal(feature.properties.atlas_historical_boundary_certified,false);
       assert.equal(feature.id,'ohm-r'+feature.properties.ohm_relation_id);
     }else{
       const match=index.entries.find(e=>e.geometryShard===shard.file&&e.sourceFeatureIndex===i);
       assert.ok(match);
       assert.equal(match.boundaryCertification,undefined);
       assert.equal(match.sourceRightsStatus,'HOLD_PENDING_REUSE_CONFIRMATION');
     }
   }
 }
 assert.equal(ids.size,139);
});

test('OHM source dates are not automatically extended or legal-certified',()=>{
 const b=index.entries.find(e=>e.sourceRelationId===2746401);
 assert.ok(b);
 assert.equal(b.sourcePeriod.start,'1878-07-13');
 assert.match(b.sourcePeriod.notes,/arbitrarily chosen/i);
 assert.equal(geodataSourceAtDate(b,'1878-07-01'),false);
 assert.equal(geodataSourceAtDate(b,'1879-07-01'),true);
 assert.equal(geodataSourceAtDate(b,'1920-07-01'),false);
 assert.ok(geodataSourcesAtYear(index,1835).length>0);
 assert.ok(index.entries.some(e=>e.sourcePeriod.start?.startsWith('1417')));
 assert.ok(index.entries.some(e=>e.sourcePeriod.end==='1947-12-30'));
});

test('fail closed on fictional source certification, ID collision, path and time changes',()=>{
 const reject=change=>{
   const copy=structuredClone(index);
   change(copy);
   assert.equal(validateGeodataHistoricalIndex(copy).ok,false);
 };
 reject(x=>x.notLegalBoundaryCertification=false);
 reject(x=>x.entries[0].status='legal_boundary_certified');
 reject(x=>x.entries[1].id=x.entries[0].id);
 reject(x=>x.entries[1].geometryId='geom:ohm-r0000000');
 reject(x=>x.geometryAssets=999);
 reject(x=>x.geometryDuplicates.push(['ohm-r2878295','ohm-r2746379']));
 reject(x=>x.entries[0].sourcePeriod.sourceOnly=false);
 reject(x=>x.entries[0].sourcePeriod.start='eighteenth century');
 reject(x=>x.entries[0].geometryShard='../phase4/catalog.json.gz');
 reject(x=>{x.entries[0].sourceDriveFileId=null;x.entries[0].sourcePath='';});
 reject(x=>x.entries[0].sourceFileSha256='missing');
 reject(x=>x.shards[0].count=999);
});

test('HURI RASSM snapshots are dated only at their exact source observation',()=>{
 const huri=index.entries.filter(e=>e.sourceFamily==='HURI');
 assert.equal(huri.length,99);
 assert.equal(huri.filter(e=>e.sourceGroup.includes('raioane')).length,91);
 assert.equal(huri.filter(e=>e.sourceGroup.includes('contururi')).length,8);
 assert.equal(new Set(huri.map(e=>e.sourcePeriod.start)).size,8);
 for(const e of huri){
   assert.equal(e.sourcePeriod.kind,'snapshot');
   assert.equal(e.sourcePeriod.start,e.sourcePeriod.end);
   assert.equal(geodataSourceAtDate(e,e.sourcePeriod.start),true);
   assert.equal(e.sourceRightsStatus,'HOLD_PENDING_REUSE_CONFIRMATION');
   assert.equal(geodataSourceAtDate(e,'1940-01-01'),false);
 }
});
test('Transilvania collection 1860 label is not asserted as a historical snapshot',()=>{
 const trans=index.entries.filter(e=>e.sourceFamily==='TRANSILVANIA_COLLECTION');
 assert.equal(trans.length,52);
 for(const e of trans){
   assert.deepEqual([e.sourcePeriod.start,e.sourcePeriod.end],[null,null]);
   assert.equal(e.sourcePeriod.kind,'undated');
   assert.equal(geodataSourceAtDate(e,'1860-01-01'),false);
   assert.equal(e.sourceRightsStatus,'HOLD_PENDING_REUSE_CONFIRMATION');
 }
 assert.equal(geodataSourcesAtYear(index,1860).filter(e=>e.sourceFamily==='TRANSILVANIA_COLLECTION').length,0);
});
test('supplemental source ID, temporal status and rights cannot be silently promoted',()=>{
 const e=index.entries.find(x=>x.sourceFamily==='TRANSILVANIA_COLLECTION');
 const bad=structuredClone(index);
 const t=bad.entries.find(x=>x.id===e.id);
 t.sourcePeriod.start='1860-01-01';t.sourcePeriod.end='1860-12-31';
 assert.equal(validateGeodataHistoricalIndex(bad).ok,false);
 const bad2=structuredClone(index);
 bad2.entries.find(x=>x.id===e.id).sourceRightsStatus='REDISTRIBUTION_APPROVED';
 assert.equal(validateGeodataHistoricalIndex(bad2).ok,false);
});

test('supplement source payloads reconstruct original Drive SHA-256 (BOM tracked)',()=>{
 const expected={
  'huri-rassm-raioane.geojson':'60569c218122617c8d65daa6b3720a4fd5d0db1d91c508b11ceb8bd8bf9fa45b',
  'huri-rassm-contururi.geojson':'b29dce1c55d6bb3ba027c9e93b73b9406f36a25be8f29d8dd3f244aa89422138',
  'transilvania-1860-districte.geojson':'2e72107cc06d035ce1337daca79520d37b42d4b30dfad464cd6aa4735c766091'
 };
 for(const [filename,originalHash] of Object.entries(expected)){
   const rendered=readFileSync(new URL(filename,base));
   const original=filename.startsWith('huri-')?
     Buffer.concat([Buffer.from([0xef,0xbb,0xbf]),rendered]):rendered;
   assert.equal(createHash('sha256').update(original).digest('hex'),originalHash);
 }
});
