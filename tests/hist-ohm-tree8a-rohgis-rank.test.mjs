import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validateRohgis1930Catalog,toRohgisGeodataEntry,rohgis1930VersionsAtYear} from '../src/data/historicalRohgis1930.mjs';
const read=p=>JSON.parse(readFileSync(new URL('../'+p,import.meta.url),'utf8'));
const c=read('public/data/historical/v1/rohgis/catalog-1930.json');
const audit=read('docs/historical/reconciliation/HIST-OHM-TREE.8-RANK-AUDIT.json');
test('8a: all source records retain identity, geometry and original rank',()=>{
 const byId=new Map(c.versions.map(v=>[v.entityId,v]));
 assert.equal(byId.size,565);
 assert.equal(audit.records.length,494);
 for(const r of audit.records){
   const v=byId.get(r.entityId);
   assert.ok(v);
   assert.deepEqual([v.versionId,v.geometryId,v.nameRo,v.sourceParentLabel,v.sourceRecordId,v.sourceRank],[r.versionId,r.geometryId,r.name,r.county,String(r.sourceRecordId),r.sourceRank]);
   assert.equal(v.kind,r.sourceRank==='II'?'plasa':'urban_unit');
   assert.equal(v.boundaryCertified,false);
   assert.equal(v.crossFamilyIdentityCertified,false);
   assert.equal(v.parentId,c.versions.find(p=>p.kind==='judet'&&p.nameRo===r.county)?.entityId);
   const e=toRohgisGeodataEntry(v);
   assert.equal(e.sourceRank,r.sourceRank);
   assert.equal(e.sourceType,r.sourceRank==='II'?'plasă':'unitate urbană');
   assert.equal(e.geometryId,r.geometryId);
 }
 for(const county of audit.counties){
   const sub=c.versions.filter(v=>v.sourceParentLabel===county.county);
   assert.equal(sub.filter(v=>v.kind==='plasa').length,county.officialPlasi);
   assert.equal(sub.filter(v=>v.kind==='urban_unit').length,county.rankIII);
 }
 assert.equal(rohgis1930VersionsAtYear(c,1930).length,565);
 assert.equal(rohgis1930VersionsAtYear(c,1929).length,0);
 assert.equal(rohgis1930VersionsAtYear(c,1931).length,0);
});
test('8a: invalid rank or parent is rejected',()=>{
 const invalid=structuredClone(c);
 invalid.versions.find(x=>x.kind==='urban_unit').sourceRank='II';
 assert.equal(validateRohgis1930Catalog(invalid).ok,false);
 const wrongParent=structuredClone(c);
 wrongParent.versions.find(x=>x.kind==='urban_unit').parentId='unknown';
 assert.equal(validateRohgis1930Catalog(wrongParent).ok,false);
 assert.equal(validateRohgis1930Catalog(c).ok,true);
});
