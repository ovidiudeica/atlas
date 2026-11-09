import {R8_CORRECTIONS} from '../src/data/symbolR8Selections.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import {officialSymbolsForEntity} from '../src/data/officialSymbols.mjs';
import {editorialSymbolsForEntity,symbolAssetUrl,symbolSourceUrl} from '../src/data/territorialSymbols.mjs';
import {globalSymbolsForEntity,withGlobalSymbols} from '../src/data/globalSymbols.mjs';
import {GLOBAL_SYMBOL_IDS} from '../src/data/globalSymbolSelections.mjs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url));
const bytes=read('public/data/phase4/catalog.json.gz');
const nodes=JSON.parse(gunzipSync(bytes)).entities;
const registry=JSON.parse(gunzipSync(read('public/data/symbols/registry.json.gz'))).entities;
const report=JSON.parse(read('docs/audits/SIM-R4-COVERAGE.json'));
const identities=JSON.parse(read('docs/audits/SIM-R4-IDENTITIES.json')).identities;
test('SIM-R4: complete inventory is indexed by the 4283 certified exact IDs',()=>{
 assert.equal(nodes.length,4283);assert.equal(new Set(nodes.map(n=>n.id)).size,4283);
 assert.equal(Object.keys(registry).length,4283);
 assert.deepEqual(new Set(GLOBAL_SYMBOL_IDS),new Set(nodes.map(n=>n.id)));
 assert.equal(report.catalogSHA256,createHash('sha256').update(bytes).digest('hex'));
 for(const n of nodes){
  const r=registry[n.id];assert(r,n.id);assert.equal(r.atlasId,n.id);
  for(const k of ['country','osmRelationId','officialName','adminLevel'])assert.deepEqual(r[k],n[k],n.id+':'+k);
  assert.deepEqual(r.shortName,n.shortName);assert.deepEqual(r.roles,n.roles);
  assert.equal(r.parentId,n.administrativeParentId);assert.equal(r.treeParentId,n.treeParentId);
  assert.equal(r.registry?.code||null,n.registry?.code||null);
  assert.deepEqual(r.statisticalRoles,n.statisticalRoles);
  assert(Object.hasOwn(r,'coat')&&Object.hasOwn(r,'flag'));
 }
 assert.equal(globalSymbolsForEntity({id:'unknown',country:'RO'}),null);
 assert.equal(globalSymbolsForEntity(null),null);
});
test('SIM-R4: selected symbols have separate kinds, identifiable sources and explicit identity evidence',()=>{
 for(const n of nodes){
  const r=registry[n.id];
  for(const kind of ['coat','flag']){
   const a=r[kind];assert(['CANDIDATE','REVIEWED_SOURCE','MISSING'].includes(r.status[kind]));
   if(!a){assert.equal(a,null);assert.equal(r.status[kind],'MISSING');continue;}
   assert.match(r.source[kind],/^https:\/\//);assert(r.sourceType[kind]);
   if(r.status[kind]==='CANDIDATE'){
    assert.equal(r.identityConflict,false);
    const candidates=r.candidates.filter(c=>c.symbolType===kind&&c.eligible&&c.url===a.url);
    assert(candidates.length>0,n.id+':'+kind+' selected without source candidate');
    for(const c of candidates){
     assert.equal(c.atlasId,n.id);assert.equal(c.holder,n.officialName);assert(c.identityEvidence);
     if(c.identityEvidence.method?.includes('P843')){
      assert.equal(n.registry.system,'SIRUTA');assert.equal(c.identityEvidence.value,n.registry.code);
      assert.equal(identities[n.id].qid,c.wikidata);
     }
    }
   }
   if(a.kind!=='local'){assert(symbolAssetUrl(a));assert(symbolSourceUrl(a));}
  }
  if(r.coat&&r.flag)assert.notEqual(r.coat.url,r.flag.url,n.id+' coat/flag conflation');
 }
});
test('SIM-R4: SIM-R2a/R3 symbols and known exclusions survive population',()=>{
 for(const n of nodes){
  const official=officialSymbolsForEntity(n),editorial=editorialSymbolsForEntity(n),r=registry[n.id];
  for(const kind of ['coat','flag']){
   if(official?.[kind])assert.equal(r[kind].file,official[kind]);
   else if(editorial?.[kind])assert.equal(r[kind].url,symbolAssetUrl(editorial[kind]));
  }
  if(editorial){
   const display=withGlobalSymbols(n,editorial);
   for(const k of ['coat','flag'])if(editorial[k])assert.deepEqual(display[k],R8_CORRECTIONS[n.id]?.[k]||editorial[k]);
  }
 }
 for(const [id,kind] of [['osm-r377733','coat'],['osm-r377733','flag'],['osm-r2248660','coat'],['osm-r59002','coat'],['osm-r59002','flag']])assert.equal(registry[id][kind],null);
 for(const n of nodes.filter(n=>!n.roles.includes('administrative'))){
  assert.equal(registry[n.id].coat,null);assert.equal(registry[n.id].flag,null);
 }
});
const counts=list=>({entities:list.length,coat:list.filter(r=>r.coat).length,flag:list.filter(r=>r.flag).length,
 both:list.filter(r=>r.coat&&r.flag).length,withoutImages:list.filter(r=>!r.coat&&!r.flag).length,
 candidates:list.reduce((sum,r)=>sum+['coat','flag'].filter(k=>r[k]&&r.status[k]==='CANDIDATE').length,0),
 processed:list.filter(r=>r.discovery.state==='PROCESSED').length,
 coveragePercent:Number((100*list.filter(r=>r.coat||r.flag).length/list.length).toFixed(2)),
 coatCoveragePercent:Number((100*list.filter(r=>r.coat).length/list.length).toFixed(2)),
 flagCoveragePercent:Number((100*list.filter(r=>r.flag).length/list.length).toFixed(2))});
test('SIM-R4: coverage and missing/unprocessed lists are computed from the actual registry',()=>{
 const rows=Object.values(registry);assert.deepEqual(report.total,counts(rows));
 for(const country of ['RO','MD'])assert.deepEqual(report.byCountry[country],counts(rows.filter(r=>r.country===country)));
 assert.deepEqual(new Set(report.unprocessed),new Set(rows.filter(r=>r.discovery.state==='UNPROCESSED').map(r=>r.atlasId)));
 assert.deepEqual(new Set(report.withoutImages),new Set(rows.filter(r=>!r.coat&&!r.flag).map(r=>r.atlasId)));
});
test('SIM-R4: UI retains lazy images, neutral network failures and per-symbol sources',()=>{
 const image=read('src/components/TerritorialSymbolImage.tsx').toString();
 const app=read('src/App.tsx').toString();
 assert.match(image,/loading='lazy'/);assert.match(image,/onError=\{\(\)=>setFailed\(true\)\}/);
 const coat=read('src/data/entityCoat.mjs').toString();
 assert.match(coat,/withGlobalSymbols\(node,editorialSymbolsForEntity\(node\)\)/);
 assert.match(app,/coatImageForEntity\(node,import\.meta\.env\.BASE_URL\)/);
 assert.match(app,/withGlobalSymbols\(currentNode,editorialSymbolsForEntity\(currentNode\)\)/);
 assert.match(app,/symbolSourceUrl\(asset\)/);assert.match(app,/Candidate image · review pending/);
 for(const n of nodes.filter(n=>!registry[n.id].coat&&!registry[n.id].flag)){
  const r=globalSymbolsForEntity(n);assert(r);
  // SIM-R6 adds literal decree annexes only to this previously empty district.
  if(n.id==='osm-r59002'){assert.equal(registry[n.id].coat,null);assert.match(r.coat.url,/sim-r6\/briceni-coat/);assert.match(r.flag.url,/sim-r6\/briceni-flag/);}
  else {assert.equal(r.coat,null);assert.equal(r.flag,null);}
 }
});

test('SIM-R4: national symbols and homonymous authority collisions are not local symbols',()=>{
 assert.equal(registry['osm-r2607033'].coat,null);
 for(const id of ['osm-r13833310','osm-r14739069']){
  assert.equal(registry[id].coat,null,id+' homonymous authority collision');
  assert(registry[id].reviewNotes.some(n=>n.includes('unrelated Atlas holders')));
 }
 for(const row of Object.values(registry)){
  for(const root of ['osm-r90689','osm-r58974','osm-r65335']){
   if(row.atlasId===root)continue;
   for(const kind of ['coat','flag'])if(row[kind]&&registry[root][kind])
    assert.notEqual(row[kind].url,registry[root][kind].url,row.atlasId+' inherited root symbol');
  }
 }
});

test('SIM-R4: Commons holder descriptions resolve Bunești homonyms and reject Leova at Cneazevca',()=>{
 assert.equal(registry['osm-r19113640'].coat,null);
 assert.equal(registry['osm-r10519773'].coat.file,'ROU BV Bunesti CoA.png');
 assert.equal(registry['osm-r14778265'].coat.file,'ROU SV Bunesti CoA.png');
});
