import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {buildUrbanClassification} from '../scripts/historical/build_rohgis_urban_classification.mjs';
import {attachRohgisUrbanClassification} from '../src/data/historicalRohgisUrban1930.mjs';
import {toRohgisGeodataEntry,rohgis1930VersionsAtYear,loadRohgis1930Catalog} from '../src/data/historicalRohgis1930.mjs';
const read=p=>JSON.parse(readFileSync(new URL('../'+p,import.meta.url),'utf8'));
const c=read('public/data/historical/v1/rohgis/catalog-1930.json'),a=read('docs/historical/reconciliation/HIST-OHM-TREE.9-URBAN-QUALIFICATION.json'),b=read('docs/historical/reconciliation/HIST-OHM-TREE.9a-CENSUS-RECONCILIATION.json'),d=read('public/data/historical/v1/rohgis/urban-classification-1930.json');
test('9b: documentary projection reproducible for all 172 urban versions',()=>{
 assert.deepEqual(d,buildUrbanClassification(c,a,b));
 const joined=attachRohgisUrbanClassification(c,d);
 assert.deepEqual(joined.versions.map(({urbanClassification,...v})=>v),c.versions);
 const items=joined.versions.filter(v=>v.urbanClassification);
 assert.equal(items.length,172);
 assert.equal(items.filter(v=>v.urbanClassification.subtype==='municipiu').length,20);
 assert.equal(items.filter(v=>v.urbanClassification.subtype==='oraș').length,152);
 assert.equal(items.filter(v=>v.urbanClassification.evidenceLevel==='OFFICIAL_TEXT_OCR_ATTESTATION').length,88);
 assert.equal(items.filter(v=>v.urbanClassification.evidenceLevel==='1930_STATISTICAL_SUBTYPE_ATTESTED_OCR').length,61);
 assert.equal(items.filter(v=>v.urbanClassification.evidenceLevel==='OTHER_OFFICIAL_ATTESTATION_OCR').length,23);
 assert.equal(items.filter(v=>v.urbanClassification.population).length,7);
 for(const v of items){
  const e=toRohgisGeodataEntry(v);
  assert.equal(e.sourceType,'unitate urbană');
  assert.equal(e.sourceRank,'III');
  assert.equal(e.urbanClassification.legalSubtypeCertified,false);
  assert.equal(e.urbanClassification.legalBoundaryCertified,false);
  assert.equal(e.urbanClassification.canonicalChangeAdmitted,false);
  assert.ok(e.urbanClassification.evidence.every(x=>x.url.startsWith('https://')));
 }
 assert.equal(rohgis1930VersionsAtYear(joined,1929).length,0);
 assert.equal(rohgis1930VersionsAtYear(joined,1931).length,0);
 assert.equal(rohgis1930VersionsAtYear(joined,1930).length,565);
});
test('9b: reject incomplete, mismatched or falsely certified documentary records',()=>{
 for(const alter of [x=>x.records.pop(),x=>x.records[0].geometryId='invalid',x=>x.records[0].legalSubtypeCertified=true,x=>x.records[0].evidence=[],x=>x.records[0].evidence[0].source='invalid',x=>x.records.find(r=>r.population).population.geometryPopulationScopeVerified=true]){
  const copy=structuredClone(d);alter(copy);assert.throws(()=>attachRohgisUrbanClassification(c,copy));
 }
});
test('9b: loader reads both original catalogue and documentary evidence',async()=>{
 const original=globalThis.fetch;
 globalThis.fetch=async url=>new Response(readFileSync(new URL('../public/'+String(url).replace(/^\//,''),import.meta.url)),{status:200});
 try{const merged=await loadRohgis1930Catalog('/');assert.equal(merged.versions.filter(v=>v.urbanClassification).length,172);}finally{globalThis.fetch=original}
});
