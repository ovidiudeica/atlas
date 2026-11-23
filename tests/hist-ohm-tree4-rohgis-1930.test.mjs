import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {
 validateRohgis1930Catalog,rohgis1930VersionsAtYear,
 toRohgisGeodataEntry,loadRohgis1930Feature
} from '../src/data/historicalRohgis1930.mjs';
import {
 validateOhmParentage,buildHistoricalOhmTree
} from '../src/data/historicalOhmTree.mjs';

const root=new URL('../',import.meta.url);
const read=path=>JSON.parse(readFileSync(new URL(path,root),'utf8'));
const source='public/data/historical/v1/rohgis/';
const catalog=read(source+'catalog-1930.json');
const ohmIndex=read('public/data/historical/v1/geodata/index.json');
const parents=read('public/data/historical/v1/ohm-parentage.json');
const documentary=read('public/data/historical/v1/documentary-parents.json');

test('RoHGIS 1930 catalog admits only the 1930 source snapshot',()=>{
 const gate=validateRohgis1930Catalog(catalog);
 assert.deepEqual(gate,{ok:true,errors:[]});
 assert.equal(rohgis1930VersionsAtYear(catalog,1930).length,565);
 assert.equal(rohgis1930VersionsAtYear(catalog,1929).length,0);
 assert.equal(rohgis1930VersionsAtYear(catalog,1931).length,0);
 const counties=catalog.versions.filter(v=>v.kind==='judet');
 const plasi=catalog.versions.filter(v=>v.kind==='plasa');
 assert.equal(counties.length,71);
 assert.equal(plasi.length,494);
 assert.equal(new Set(catalog.versions.map(v=>v.geometryId)).size,565);
 assert.equal(new Set(plasi.map(v=>v.entityId)).size,494);
 const countyIds=new Set(counties.map(v=>v.entityId));
 for(const v of counties)assert.equal(v.parentId,catalog.documentaryStateRoot);
 for(const v of plasi)assert.ok(countyIds.has(v.parentId));
 assert.ok(plasi.filter(v=>v.nameRo===plasi[0].nameRo).length>=1);
});

test('RoHGIS 1930 GeoJSON shards preserve source IDs and unqualified parentage',()=>{
 const shards=catalog.geometryShards;
 assert.equal(shards.length,16);
 let seen=0;const ids=new Set();
 for(const item of shards){
   const data=read(source+item.path);
   assert.equal(data.type,'FeatureCollection');
   assert.equal(data.metadata.crs,'EPSG:4326');
   assert.equal(data.metadata.sourceCRS,'EPSG:3844');
   assert.equal(data.metadata.legalBoundariesCertified,false);
   assert.equal(data.features.length,item.count);
   for(const f of data.features){
     assert.ok(['Polygon','MultiPolygon'].includes(f.geometry.type));
     assert.equal(f.properties.atlasHistoricalBoundaryCertified,false);
     assert.ok(!ids.has(f.id),'Duplicate RoHGIS source feature');
     ids.add(f.id);seen++;
   }
 }
 assert.equal(seen,565);
 assert.equal(ids.size,565);
});

test('RoHGIS loader returns indexed source feature, not a certified boundary',async()=>{
 const county=catalog.versions.find(v=>v.kind==='judet');
 const entry=toRohgisGeodataEntry(county);
 assert.equal(entry.sourceFamily,'ROHGIS');
 assert.equal(entry.geometryId,county.geometryId);
 assert.equal(entry.sourcePeriod.kind,'snapshot');
 const originalFetch=globalThis.fetch;
 globalThis.fetch=async url=>new Response(readFileSync(new URL(
   'public/'+String(url).replace(/^\//,''),root)),{status:200});
 try{
   const feature=await loadRohgis1930Feature(catalog,county,'/');
   assert.equal(feature.id,county.entityId);
   assert.equal(feature.properties.atlasHistoricalBoundaryCertified,false);
   assert.equal(feature.properties.parentEntityId,county.parentId);
 }finally{globalThis.fetch=originalFetch;}
});

test('Separate interwar Hungarian documentary parent is documented only in June 1928',()=>{
 const edge=parents.links.find(x=>x.id==='ohm-1928-csanad-arad-torontal-to-hungary');
 assert.ok(edge);
 assert.equal(edge.start,'1928-06-01');
 assert.equal(edge.end,'1928-06-30');
 assert.equal(edge.boundaryCertified,false);
 assert.notEqual(edge.parentSourceGroup,'doc:kingdom-hungary');
 const valid=validateOhmParentage(ohmIndex,parents,documentary);
 assert.equal(valid.ok,true,valid.errors.join('; '));
 const t=buildHistoricalOhmTree(ohmIndex,parents,1928,documentary);
 const child=t.nodes.get('Comitate istorice/Comitatul Csanád-Arad-Torontál');
 assert.equal(child.parentEvidence?.id,edge.id);
 const t1923=buildHistoricalOhmTree(ohmIndex,parents,1923,documentary);
 assert.equal(t1923.nodes.get('Comitate istorice/Comitatul Csanád-Arad-Torontál')?.parentEvidence?.id===edge.id,false);
});
