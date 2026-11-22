import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validateGeodataSourceCatalog,geodataVersionAttestedAtYear,geodataPeriodLabel} from '../src/data/historicalGeodataSource.mjs';

const root=new URL('../public/data/historical/geodata-source/v1/',import.meta.url);
const catalog=JSON.parse(readFileSync(new URL('catalog.json',root),'utf8'));

test('HIST-GEODATA: exactly 30 original source files, 81 source uses, 77 distinct geometry assets',()=>{
 assert.deepEqual(validateGeodataSourceCatalog(catalog),{ok:true,errors:[]});
 assert.equal(catalog.historicalPolygonSourcesCount,30);
 assert.equal(catalog.sourcePolygonOccurrences,81);
 assert.equal(catalog.uniqueGeometryAssets,77);
 assert.equal(catalog.versions.filter(v=>v.sourceCollection==='OHM').length,29);
 assert.equal(catalog.versions.filter(v=>v.sourceCollection==='Transilvania 1860').length,52);
});
test('HIST-GEODATA: every source version refers to unchanged existing GeoJSON feature',()=>{
 const byFile=new Map();
 for(const v of catalog.versions){
  if(!byFile.has(v.sourceFile)){
   const raw=JSON.parse(readFileSync(new URL(v.sourceFile,root),'utf8'));
   assert.equal(raw.type,'FeatureCollection');
   byFile.set(v.sourceFile,raw);
  }
  const f=byFile.get(v.sourceFile).features[v.featureIndex];
  assert.ok(f);
  assert.match(f.geometry.type,/^(MultiPolygon|Polygon)$/);
  assert.equal(v.boundaryCertification,'NOT_CERTIFIED');
  assert.equal(v.administrativeParentStatus,'NOT_QUALIFIED');
 }
 assert.equal(byFile.size,30);
});
test('HIST-GEODATA: physically identical source geometry is only one logical asset',()=>{
 const seen=new Map();
 for(const v of catalog.versions){
  const doc=JSON.parse(readFileSync(new URL(v.sourceFile,root),'utf8'));
  const geometry=JSON.stringify(doc.features[v.featureIndex].geometry);
  if(seen.has(geometry))assert.equal(v.geometryAssetId,seen.get(geometry));
  else seen.set(geometry,v.geometryAssetId);
 }
 assert.equal(seen.size,catalog.uniqueGeometryAssets);
});
test('HIST-GEODATA: 1860 snapshots never extend to other years; source ranges not legal evidence',()=>{
 const d=catalog.versions.find(x=>x.id==='trans1860:0');
 assert.ok(d);
 assert.equal(geodataVersionAttestedAtYear(d,1860),true);
 assert.equal(geodataVersionAttestedAtYear(d,1859),false);
 assert.equal(geodataVersionAttestedAtYear(d,1861),false);
 assert.match(geodataPeriodLabel(d,'ro'),/1860/);
 const o=catalog.versions.find(x=>x.id==='ohm:r2829384');
 assert.ok(o);
 assert.equal(geodataVersionAttestedAtYear(o,1860),true);
 assert.equal(geodataVersionAttestedAtYear(o,1880),false);
 const onlyStart={...o,period:{kind:'source_interval',start:'1867',end:null}};
 const onlyEnd={...o,period:{kind:'source_interval',start:null,end:'1867'}};
 const undated={...o,period:{kind:'source_interval',start:null,end:null}};
 assert.equal(geodataVersionAttestedAtYear(onlyStart,1867),true);
 assert.equal(geodataVersionAttestedAtYear(onlyStart,1880),false);
 assert.equal(geodataVersionAttestedAtYear(onlyEnd,1867),true);
 assert.equal(geodataVersionAttestedAtYear(onlyEnd,1850),false);
 assert.equal(geodataVersionAttestedAtYear(undated,1867),false);
});
test('HIST-GEODATA: unverified source cannot become certified by metadata mutation',()=>{
 for(const change of [
  x=>x.versions[0].boundaryCertification='CERTIFIED',
  x=>x.versions[1].administrativeParentStatus='QUALIFIED',
  x=>x.versions[2].sourceStatus='DEFAULT_LEGAL_POLYGON',
  x=>x.versions[3].geometryAssetId='missing',
  x=>x.policies.parentHierarchyNotInferred=false
 ]){
  const copy=structuredClone(catalog);change(copy);
  assert.equal(validateGeodataSourceCatalog(copy).ok,false);
 }
});
