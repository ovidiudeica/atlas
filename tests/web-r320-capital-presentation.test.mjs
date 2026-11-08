import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {shortTreeName} from '../src/data/treeNames.mjs';
import {presentationParentId,CHISINAU_ID,CHISINAU_CITY_ID,SECTOR_IDS}
  from '../src/data/treeOverlay.mjs';
import {compareTreeSiblings,NISTRIAN_CHILD_ORDER}
  from '../src/data/treeOrder.mjs';
import {resolveTerritorialRoles,BUCHAREST_ATLAS_ID} from '../src/data/territoryRoles.mjs';
const catalog=JSON.parse(gunzipSync(readFileSync(
  new URL('../public/data/phase4/catalog.json.gz',import.meta.url))).toString('utf8'));
const nodes=new Map(catalog.entities.map(n=>[n.id,n]));
const children=(parent,view)=>catalog.entities.filter(n=>
  (view==='all'||n.roles.includes('administrative'))&&presentationParentId(n,view)===parent);
test('WEB-R3.20: București ADM9 sectors remain canonical children, numeric SIRUTA 1 to 6',()=>{
 const buch=nodes.get(BUCHAREST_ATLAS_ID);
 assert.equal(buch.adminLevel,4);assert.equal(buch.osmRelationId,377733);
 assert.equal(buch.registry.code,'403');
 const roles=resolveTerritorialRoles(buch);
 assert.equal(roles.administrative.find(x=>x.basis==='SIRUTA')?.registryCode,'179132');
 assert.equal(roles.cartographic.osmAdminLevel,4);
 const expected=['Sector 1','Sector 2','Sector 3','Sector 4','Sector 5','Sector 6'];
 for(const view of ['all','administrative'])for(const lang of ['ro','en']){
  const sectors=children(BUCHAREST_ATLAS_ID,view).sort((a,b)=>
    compareTreeSiblings(a,b,view,BUCHAREST_ATLAS_ID,lang));
  assert.deepEqual(sectors.map(n=>n.name),expected);
  assert.equal(sectors.length,6);
  for(const n of sectors){
   assert.equal(n.adminLevel,9);
   assert.equal(n.administrativeParentId,BUCHAREST_ATLAS_ID);
   assert.equal(n.treeParentId,BUCHAREST_ATLAS_ID);
   assert.equal(n.registry.system,'SIRUTA');
   assert(n.registry.code);
  }
 }
 assert.equal(catalog.entities.filter(n=>n.osmRelationId===377733).length,1);
});
test('WEB-R3.20: ADM4 municipiu and ADM8 oraș Chișinău coexist with authentic geometry IDs',()=>{
 const m=nodes.get(CHISINAU_ID),city=nodes.get(CHISINAU_CITY_ID);
 assert(m&&city);assert.equal(m.adminLevel,4);assert.equal(city.adminLevel,8);
 assert.notEqual(m.osmRelationId,city.osmRelationId);
 assert.notEqual(m.geometryShard,null);assert.notEqual(city.geometryShard,null);
 assert.equal(city.administrativeParentId,CHISINAU_ID);
 assert.equal(city.treeParentId,CHISINAU_ID);
 assert.equal(shortTreeName(m,'ro'),'Chișinău');
 assert.equal(shortTreeName(city,'ro'),'Chișinău');
 assert.equal(shortTreeName(city,'en'),'Chișinău');
 assert.equal(city.name,'Chișinău');
 assert(city.officialName.includes('Chișinău'),'Original official name remains searchable');
 for(const view of ['all','administrative']){
  const direct=children(CHISINAU_ID,view);
  assert.equal(direct.length,19);
  assert.equal(direct.sort((a,b)=>compareTreeSiblings(a,b,view,CHISINAU_ID,'ro'))[0].id,CHISINAU_CITY_ID);
  const nested=children(CHISINAU_CITY_ID,view);
  assert.equal(nested.length,5);
  assert.deepEqual(new Set(nested.map(x=>x.id)),new Set(SECTOR_IDS));
  for(const n of nested){
   assert.equal(n.administrativeParentId,CHISINAU_ID);
   assert.equal(presentationParentId(n,view),CHISINAU_CITY_ID);
  }
 }
});
test('WEB-R3.20: tree cannot silently discard city or change Nistrenia order',()=>{
 const source=readFileSync(new URL('../src/App.tsx',import.meta.url),'utf8');
 assert.match(source,/isChisinauCity&&searchMatch/);
 assert.match(source,/City of Chișinău/);
 assert.match(source,/function chooseSearch\(id:string\)/);
 assert.match(source,/const parent=presentationParentId\(cursor,treeView\)/);
 assert.match(source,/onClick=\{\(\)=>searchMatch\?chooseSearch\(node.id\):choose\(node.id\)\}/);
 assert.deepEqual(catalog.entities.filter(x=>x.treeParentId==='osm-r65335')
   .sort((a,b)=>compareTreeSiblings(a,b,'all','osm-r65335','ro')).map(x=>x.id),
   NISTRIAN_CHILD_ORDER);
 assert.equal(catalog.entities.length,4283);
});
