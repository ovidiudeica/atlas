import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {shortTreeName} from '../src/data/treeNames.mjs';
import {presentationParentId} from '../src/data/treeOverlay.mjs';
import {compareTreeSiblings,EAST_STAT_PARENT_ID,EAST_BENDER_ADM4_ID,
  EAST_UATSN_ADM4_ID,EAST_BENDER_ADM8_CITY_ID} from '../src/data/treeOrder.mjs';

const entities=JSON.parse(gunzipSync(readFileSync(new URL(
  '../public/data/phase4/catalog.json.gz',import.meta.url))).toString('utf8')).entities;
const byId=new Map(entities.map(x=>[x.id,x]));
const children=(id,view)=>entities.filter(x=>(view!=='administrative'||x.roles.includes('administrative'))
  &&(view!=='statistical'||x.roles.includes('statistical'))
  &&presentationParentId(x,view)===id);
const sorted=(id,view,lang)=>children(id,view).sort((a,b)=>
  compareTreeSiblings(a,b,view,id,lang));
const shortOrder=(a,b,lang)=>shortTreeName(a,lang).localeCompare(shortTreeName(b,lang),lang)
  ||a.id.localeCompare(b.id,'en');

test('WEB-R3.13: 2 East ADM4, Bender 2 ADM8, UATSN 79 ADM8, authentic parentage',()=>{
 assert.equal(entities.length,4283);
 assert.equal(EAST_STAT_PARENT_ID,'stat-MD120');
 assert.equal(EAST_BENDER_ADM4_ID,'osm-r9581354');
 assert.equal(EAST_UATSN_ADM4_ID,'osm-r2607033');
 assert.equal(EAST_BENDER_ADM8_CITY_ID,'osm-r12463379');
 assert.equal(byId.get(EAST_BENDER_ADM4_ID).registry.code,'0500');
 assert.equal(byId.get(EAST_UATSN_ADM4_ID).registry.code,'9800');
 for(const id of [EAST_BENDER_ADM4_ID,EAST_UATSN_ADM4_ID]){
   assert.equal(byId.get(id).administrativeParentId,'osm-r58974');
   assert.equal(byId.get(id).treeParentId,EAST_STAT_PARENT_ID);
 }
 assert.deepEqual(new Set(children(EAST_STAT_PARENT_ID,'all').map(x=>x.id)),
   new Set([EAST_BENDER_ADM4_ID,EAST_UATSN_ADM4_ID]));
 assert.equal(children(EAST_STAT_PARENT_ID,'administrative').length,0);
 for(const view of ['all','administrative']){
   assert.equal(children(EAST_BENDER_ADM4_ID,view).length,2);
   assert.equal(children(EAST_UATSN_ADM4_ID,view).length,79);
 }
});

test('WEB-R3.17: East Bender CUATM 0500 precedes UATSN 9800; 81 ADM8 use CUATM RO/EN',()=>{
 for(const lang of ['ro','en']){
  assert.deepEqual(sorted(EAST_STAT_PARENT_ID,'all',lang).map(x=>x.id),
    [EAST_BENDER_ADM4_ID,EAST_UATSN_ADM4_ID]);
  for(const view of ['all','administrative']){
   assert.deepEqual(sorted(EAST_BENDER_ADM4_ID,view,lang).map(x=>x.id),
     [EAST_BENDER_ADM8_CITY_ID,'osm-r12463378']);
   const kids=sorted(EAST_UATSN_ADM4_ID,view,lang);
   assert.equal(kids.length,79);
   assert.equal(new Set(kids.map(x=>x.id)).size,79);
   assert(kids.every(x=>x.adminLevel===8&&x.treeParentId===EAST_UATSN_ADM4_ID
     &&x.administrativeParentId===EAST_UATSN_ADM4_ID));
   assert.deepEqual(kids.map(x=>x.id),[...kids].sort((a,b)=>
     (a.registry.code).localeCompare(b.registry.code,'en')||a.id.localeCompare(b.id,'en')).map(x=>x.id),'UATSN '+lang+' '+view);
  }
 }
});

test('WEB-R3.13: duplicate Hlinaia IDs, official CUATM and visible disambiguation',()=>{
 const one=byId.get('osm-r9301463'),two=byId.get('osm-r8291058');
 assert.equal(shortTreeName(one,'ro'),'Hlinaia');
 assert.equal(shortTreeName(two,'ro'),'Hlinaia');
 assert.equal(one.registry.code,'5029');
 assert.equal(two.registry.code,'7625');
 assert.notEqual(one.osmRelationId,two.osmRelationId);
 const actual=sorted(EAST_UATSN_ADM4_ID,'all','ro');
 const positions=actual.flatMap((x,i)=>x.id===one.id||x.id===two.id?[[x.id,i]]:[]);
 assert.equal(positions.length,2);
 assert.equal(positions[0][0],one.id,'CUATM 5029 must precede CUATM 7625');
 assert.equal(positions[1][0],two.id);
 assert(positions[0][1]<positions[1][1]);
 const app=readFileSync(new URL('../src/App.tsx',import.meta.url),'utf8');
 assert.match(app,/node\.id==='osm-r9301463'\|\|node\.id==='osm-r8291058'/);
 assert.match(app,/roleLabel\(node\)\}\{eastHlinaiaCode/);
 assert.match(app,/accessibleRowLabel/);
});

test('WEB-R3.13: statistical view and existing Nistrenia, Găgăuzia, Chișinău, regions unchanged',()=>{
 for(const x of entities)assert.equal(presentationParentId(x,'statistical'),x.treeParentId);
 assert.equal(children(EAST_STAT_PARENT_ID,'statistical').length,0);
 assert.deepEqual([...children('osm-r65335','all')].sort((a,b)=>
   compareTreeSiblings(a,b,'all','osm-r65335','ro')).map(x=>shortTreeName(x,'ro')),
   ['Tiraspol','Bender','Slobozia','Grigoriopol','Dubăsari','Rîbnița','Camenca']);
 for(const [id,first] of Object.entries({
  'stat-MD111':'osm-r58983','stat-MD112':'osm-r1692078','stat-MD113':'osm-r1104136'
 }))assert.equal(sorted(id,'all','ro')[0].id,first);
 assert.equal(sorted('osm-r1699032','all','ro')[0].id,'osm-r1706978');
 assert.equal(sorted('osm-r1691801','all','ro')[0].id,'osm-r1748490');
 for(const id of ['osm-r1216706','osm-r12215667','osm-r6879649']){
  assert.equal(byId.get(id).administrativeParentId,'osm-r65343');
  assert.equal(byId.get(id).treeParentId,'osm-r65343');
 }
});

test('WEB-R3.14: East NTS3 and CUATM 9800 display distinct source-grounded short labels',()=>{
 const nts=byId.get('stat-MD120'),uatsn=byId.get(EAST_UATSN_ADM4_ID);
 assert.equal(nts.statisticalRoles[0].code,'MD120');
 assert.equal(nts.sourceTags['ref:nuts'],'MD121');
 assert.equal(nts.sourceTags.alt_name,'Regiunea Transnistria');
 assert.equal(uatsn.sourceTags.short_name,'UATSN');
 assert.equal(uatsn.registry.code,'9800');
 for(const lang of ['ro','en']){
   assert.equal(shortTreeName(nts,lang),'Transnistria');
   assert.equal(shortTreeName(uatsn,lang),lang==='ro'?'UATSN':'ATULBD');
   assert.notEqual(shortTreeName(nts,lang),shortTreeName(uatsn,lang));
 }
 assert.equal(nts.treeParentId,'stat-MD12');
 assert.equal(uatsn.treeParentId,nts.id);
 assert.equal(uatsn.administrativeParentId,'osm-r58974');
 assert.equal(shortTreeName(byId.get('osm-r65335'),'ro'),'Nistrenia');
 assert.equal(shortTreeName(byId.get('osm-r65335'),'en'),'Pridnestrovie');
});
