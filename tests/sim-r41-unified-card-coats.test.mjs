import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {coatImageForEntity} from '../src/data/entityCoat.mjs';
import {officialSymbolsForEntity} from '../src/data/officialSymbols.mjs';
import {editorialSymbolsForEntity,symbolAssetUrl} from '../src/data/territorialSymbols.mjs';
import {globalSymbolsForEntity,withGlobalSymbols} from '../src/data/globalSymbols.mjs';

const nodes=JSON.parse(gunzipSync(readFileSync(new URL('../public/data/phase4/catalog.json.gz',import.meta.url)))).entities;
const find=id=>{
 const node=nodes.find(n=>n.id===id);
 assert(node,'Missing Atlas ID '+id);
 return node;
};

test('SIM-R4.1: country and de facto state card headers resolve exact coats, not national flags',()=>{
 const examples=[
  ['osm-r90689','Coat_of_arms_of_Romania.svg','Flag_of_Romania.svg'],
  ['osm-r58974','Coat_of_arms_of_Moldova.svg','Flag_of_Moldova.svg'],
  ['osm-r65335','Coat_of_arms_of_Transnistria.svg','Flag_of_Transnistria']
 ];
 for(const [id,coat,flag] of examples){
  const node=find(id);
  const header=coatImageForEntity(node,'/atlas/');
  const gallery=withGlobalSymbols(node,editorialSymbolsForEntity(node));
  assert(header,'Missing coat in header '+id);
  assert(header.includes(coat),'Incorrect header coat '+id+': '+header);
  assert.equal(header,symbolAssetUrl(gallery.coat),'Header and gallery disagree '+id);
  assert(gallery.flag&&symbolAssetUrl(gallery.flag).includes(flag),
   'Territorial gallery retains separate national/de facto flag '+id);
  assert.notEqual(header,symbolAssetUrl(gallery.flag),'A flag was rendered in the heading');
 }
});

test('SIM-R4.1: single shared source matches all 4283 exact-ID tree and card headings',()=>{
 assert.equal(nodes.length,4283);
 let coats=0,withoutCoat=0,flagOnly=0;
 for(const node of nodes){
  const official=officialSymbolsForEntity(node);
  const combined=withGlobalSymbols(node,editorialSymbolsForEntity(node));
  const expected=official?.coat?'/atlas/symbols/'+official.coat:symbolAssetUrl(combined?.coat);
  const actual=coatImageForEntity(node,'/atlas/');
  assert.equal(actual,expected,'Wrong exact-ID coat '+node.id);
  if(actual)coats++;else withoutCoat++;
  if(!actual&&combined?.flag){
   flagOnly++;
   assert.equal(actual,null,'Flag-only entity should keep a neutral coat placeholder '+node.id);
  }
 }
 assert(coats>1000&&withoutCoat>1000&&flagOnly>0,
  'Regression in the full identity cohort or missing flag-only fallbacks');
});

test('SIM-R4.1: SIM-R2a reviewed coats, SIM-R3 county coats and statistical neutrals remain intact',()=>{
 assert.equal(coatImageForEntity(find('osm-r1699032'),'/atlas/'),'/atlas/symbols/gagauzia-coat.png');
 assert.equal(coatImageForEntity(find('osm-r1748490'),'/atlas/'),'/atlas/symbols/chisinau-coat.jpg');
 assert(coatImageForEntity(find('osm-r194271'),'/atlas/').includes('Actual_Alba_county_CoA.png'));
 assert.equal(coatImageForEntity(find('osm-r377733'),'/atlas/'),null);
 assert.equal(coatImageForEntity(find('stat-MD120'),'/atlas/'),null);
 assert.equal(coatImageForEntity(null,'/atlas/'),null);
 assert.equal(coatImageForEntity({id:'not-in-atlas'},'/atlas/'),null);
});

test('SIM-R4.1: both tree and heading call the shared coat selector; flags remain gallery-only',()=>{
 const app=readFileSync(new URL('../src/App.tsx',import.meta.url),'utf8');
 assert.match(app,/const treeSymbolSrc=coatImageForEntity\(node,import\.meta\.env\.BASE_URL\)/);
 assert.match(app,/const headerCoatSrc=currentNode\?coatImageForEntity\(currentNode,import\.meta\.env\.BASE_URL\):null/);
 assert.match(app,/src=\{headerCoatSrc\}/);
 assert.match(app,/className="flag flag--coat"/);
 assert.match(app,/src=\{symbolAssetUrl\(asset\)\}/);
 assert.doesNotMatch(app,/flagFileForEntity\(currentNode\)/);
 const smoke=readFileSync(new URL('../scripts/ci/browser-smoke.mjs',import.meta.url),'utf8');
 assert.match(smoke,/async function entityCoatAndFlagAssets\(cdp\)/);
 assert.match(smoke,/await entityCoatAndFlagAssets\(client\)/);
});
