import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {
  validateGeodataHistoricalIndex,validateGeodataGeometryShard,
  geodataSourceAtDate,geodataSourcesAtYear
} from '../src/data/historicalGeodata.mjs';

const base=new URL('../public/data/historical/v1/geodata/',import.meta.url);
const read=name=>JSON.parse(readFileSync(new URL(name,base),'utf8'));
const index=read('index.json');

test('historical source index: 27 geometries imported into six separate OHM source shards',()=>{
 assert.deepEqual(validateGeodataHistoricalIndex(index),{ok:true,errors:[]});
 assert.equal(index.entries.length,27);
 assert.equal(index.shards.length,6);
 assert.equal(index.shards.reduce((n,s)=>n+s.count,0),27);
 assert.equal(index.notCanonicalHierarchy,true);
 assert.equal(index.notLegalBoundaryCertification,true);
 assert.deepEqual(index.geometryDuplicates.length,3);
 assert.ok(index.entries.every(e=>e.status==='source_candidate_not_certified'));
});

test('source geom coordinates, types and original OSM relation identifiers are intact',()=>{
 const ids=new Set();
 for(const shard of index.shards){
   const data=read(shard.file);
   assert.deepEqual(validateGeodataGeometryShard(data,index,shard.file),{ok:true,errors:[]});
   assert.equal(data.features.length,shard.count);
   for(const feature of data.features){
     assert.ok(!ids.has(feature.id));
     ids.add(feature.id);
     assert.equal(feature.properties.atlas_historical_boundary_certified,false);
     assert.ok(['Polygon','MultiPolygon'].includes(feature.geometry.type));
     assert.equal(feature.id,'ohm-r'+feature.properties.ohm_relation_id);
   }
 }
 assert.equal(ids.size,27);
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
 reject(x=>x.entries[1].geometryId=x.entries[0].geometryId);
 reject(x=>x.entries[0].sourcePeriod.sourceOnly=false);
 reject(x=>x.entries[0].sourcePeriod.start='eighteenth century');
 reject(x=>x.entries[0].geometryShard='../phase4/catalog.json.gz');
 reject(x=>x.entries[0].sourceDriveFileId='');
 reject(x=>x.shards[0].count=999);
});
