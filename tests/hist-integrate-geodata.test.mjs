import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {
  validateGeodataHistoricalIndex,validateGeodataGeometryShard,
  geodataSourceAtDate,geodataSourcesAtYear
} from '../src/data/historicalGeodata.mjs';

const base=new URL('../public/data/historical/v1/geodata/',import.meta.url);
const read=name=>JSON.parse(readFileSync(new URL(name,base),'utf8'));
const index=read('index.json');

test('historical source index: 139 OHM versions use 125 exact logical geometry assets',()=>{
 assert.deepEqual(validateGeodataHistoricalIndex(index),{ok:true,errors:[]});
 assert.equal(index.entries.length,139);
 assert.equal(index.shards.length,29);
 assert.equal(index.shards.reduce((n,s)=>n+s.count,0),139);
 assert.equal(index.notCanonicalHierarchy,true);
 assert.equal(index.notLegalBoundaryCertification,true);
 assert.equal(index.geometryDuplicates.length,14);
 assert.equal(index.geometryAssets,125);
 assert.deepEqual(index.countsBySource,{OHM:139});
 assert.equal(index.entries.filter(e=>e.sourceGroup.startsWith('Județe istorice/')).length,19);
 assert.equal(index.entries.filter(e=>e.sourceGroup.startsWith('Comitate istorice/')).length,77);
 assert.equal(index.entries.filter(e=>!e.sourceGroup.startsWith('Județe istorice/') &&
   !e.sourceGroup.startsWith('Comitate istorice/')).length,43);
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

test('OHM-first cleanup excludes HistoGIS and supplementary geometry assets',()=>{
 assert.deepEqual(index.sourceFamilies,['OHM']);
 assert.ok(index.entries.every(e=>e.sourceFamily==='OHM'));
 assert.ok(index.shards.every(x=>x.file.startsWith('ohm-')));
 assert.equal(existsSync(new URL('../geometry.geojson',base)),false);
 assert.equal(existsSync(new URL('huri-rassm-raioane.geojson',base)),false);
 assert.equal(existsSync(new URL('huri-rassm-contururi.geojson',base)),false);
 assert.equal(existsSync(new URL('transilvania-1860-districte.geojson',base)),false);
});
