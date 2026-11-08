import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {SIM_R3_ENTITY_IDS,SIM_R3_COUNTS,editorialSymbolsForEntity,
 symbolAssetUrl,symbolSourceUrl} from '../src/data/territorialSymbols.mjs';
import {officialSymbolsForEntity,REVIEWED_SYMBOL_IDS} from '../src/data/officialSymbols.mjs';

const catalog=JSON.parse(gunzipSync(readFileSync(new URL(
 '../public/data/phase4/catalog.json.gz',import.meta.url))).toString('utf8'));
const byId=new Map(catalog.entities.map(row=>[row.id,row]));

test('SIM-R3: 42 Romanian counties/Bucharest + 32 Moldovan raions map 1:1 to real Atlas nodes',()=>{
 assert.equal(catalog.entities.length,4283);
 assert.equal(SIM_R3_ENTITY_IDS.length,74);
 assert.equal(new Set(SIM_R3_ENTITY_IDS).size,74);
 assert.equal(SIM_R3_COUNTS.entities,74);
 const entries=SIM_R3_ENTITY_IDS.map(id=>[id,editorialSymbolsForEntity(byId.get(id))]);
 let ro=0,md=0,coat=0,flag=0,both=0,neutral=0;
 for(const [id,rec] of entries){
  assert(byId.has(id),'Unknown Atlas ID '+id);
  assert(rec,'Missing media row '+id);
  const node=byId.get(id);
  assert.equal(rec.country,node.country,id+' country mismatch');
  assert.equal(node.adminLevel,4,id+' must be a county/raion or Bucharest ADM4');
  assert(node.roles.includes('administrative'),id+' must have an administrative role');
  assert.equal(node.osmRelationId,Number(id.replace('osm-r','')),id+' OSM relation mismatch');
  assert(rec.name&&rec.name.length>2);
  if(rec.country==='RO')ro++;else md++;
  if(rec.coat)coat++;if(rec.flag)flag++;
  if(rec.coat&&rec.flag)both++;
  if(!rec.coat&&!rec.flag)neutral++;
  for(const asset of [rec.coat,rec.flag]){
   if(!asset)continue;
   assert.equal(asset.kind==='official'?asset.tier:'B',asset.tier);
   assert(symbolAssetUrl(asset).startsWith('https://'));
   assert(symbolSourceUrl(asset).startsWith('https://'));
   if(asset.kind==='commons'){
    assert(asset.file&&!/\b(?:old|pre-2017|2015-2016|circa 2007)\b/i.test(asset.file));
    assert(symbolSourceUrl(asset).startsWith('https://commons.wikimedia.org/wiki/File:'));
   }else{
    assert.equal(rec.name,'Raionul Taraclia','Institutional assets require reviewed exact owner');
    assert.match(symbolSourceUrl(asset),/^https:\/\/raiontaraclia\.md\//);
   }
  }
 }
 assert.equal(ro,42);assert.equal(md,32);
 assert.deepEqual({entities:74,coat,flag,both,neutral},SIM_R3_COUNTS);
 assert.equal(neutral,2);
});

test('SIM-R3: 2024 Bucharest and 2026 Briceni/Harghita/Vrancea exceptions are explicit',()=>{
 const bu=editorialSymbolsForEntity(byId.get('osm-r377733'));
 assert.equal(bu.coat,null);assert.equal(bu.flag,null);
 assert.match(bu.reference,/2024/);
 const hr=editorialSymbolsForEntity(byId.get('osm-r2248660'));
 assert.equal(hr.coat,null);assert.match(hr.reference,/311970/);
 const br=editorialSymbolsForEntity(byId.get('osm-r59002'));
 assert.equal(br.coat,null);assert.equal(br.flag,null);assert.match(br.reference,/briceni/);
 const vn=editorialSymbolsForEntity(byId.get('osm-r2260187'));
 assert.equal(vn.coat.file,'ROU VN VRANCEA COA.png');
 assert.match(vn.reference,/309686/);
 const tar=editorialSymbolsForEntity(byId.get('osm-r1699033'));
 assert.equal(tar.coat.kind,'official');assert.equal(tar.flag.kind,'official');
 assert.notEqual(symbolAssetUrl(tar.coat),symbolAssetUrl(tar.flag));
});

test('SIM-R3: preserve all SIM-R2a exact-ID assets without assigning their symbols to relatives',()=>{
 assert.equal(REVIEWED_SYMBOL_IDS.length,7);
 for(const id of REVIEWED_SYMBOL_IDS){
  assert(byId.has(id));
  assert(officialSymbolsForEntity(byId.get(id)));
  assert.equal(editorialSymbolsForEntity(byId.get(id)),null,'SIM-R2a must be the sole exact-ID provider');
 }
 for(const id of ['osm-r1691801','osm-r2607033','stat-MD120','osm-r65335','osm-r90689','osm-r58974']){
  assert.equal(editorialSymbolsForEntity(byId.get(id)),null);
 }
 assert.equal(editorialSymbolsForEntity({id:'osm-r99999999'}),null);
 assert.equal(editorialSymbolsForEntity(null),null);
});

test('SIM-R3: tree and card UI share source-backed symbols and neutral failures',()=>{
 const app=readFileSync(new URL('../src/App.tsx',import.meta.url),'utf8');
 const css=readFileSync(new URL('../src/styles.css',import.meta.url),'utf8');
 const fallback=readFileSync(new URL('../src/components/TerritorialSymbolImage.tsx',import.meta.url),'utf8');
 assert.match(app,/editorialSymbolsForEntity\(currentNode\)/);
 assert.match(app,/officialSymbolsForEntity\(currentNode\)/);
 assert.match(app,/officialSymbolsForEntity\(node\)/);
 assert.match(app,/symbolSourceUrl\(asset\)/);
 assert.match(app,/tree-label-heading/);
 assert.match(app,/territory-symbol-gallery--editorial/);
 assert.match(app,/kind="symbols"/);
 assert.match(fallback,/onError=\{\(\)=>setFailed\(true\)\}/);
 assert.match(fallback,/territorial-symbol-fallback/);
 assert.match(css,/\.tree-territorial-symbol/);
 assert.match(css,/\.territory-symbol-gallery--editorial/);
});
