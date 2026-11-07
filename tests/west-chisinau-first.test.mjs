import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {shortTreeName} from '../src/data/treeNames.mjs';
import {presentationParentId} from '../src/data/treeOverlay.mjs';
import {compareTreeSiblings,WEST_STAT_PARENT_ID,CHISINAU_PARENT_ID,
  NISTRIAN_PARENT_ID,NISTRIAN_CHILD_ORDER,EAST_STAT_PARENT_ID} from '../src/data/treeOrder.mjs';

const entities=JSON.parse(gunzipSync(readFileSync(
  new URL('../public/data/phase4/catalog.json.gz',import.meta.url))).toString('utf8')).entities;
const byId=new Map(entities.map(x=>[x.id,x]));
const inView=(node,view)=>view==='all'||view==='administrative'
  ?view==='all'||node.roles.includes('administrative')
  :node.statisticalRoles.length>0||['osm-r90689','osm-r58974'].includes(node.id);
const children=(id,view)=>entities.filter(n=>inView(n,view)&&presentationParentId(n,view)===id);
const ordered=(id,view,lang)=>children(id,view).sort((a,b)=>
  compareTreeSiblings(a,b,view,id,lang));

const WEST_IDS=[
  'osm-r1691801', // Chișinău, NTS3 MD115, ADM4
  'stat-MD111', // Nord
  'stat-MD112', // Centru
  'stat-MD113', // Sud
  'osm-r1699032' // Găgăuzia, NTS3 MD114, ADM4
];

test('WEB-R3.16 West: authentic five children, Chișinău first, existing sibling order preserved in both languages and mixed/statistical views',()=>{
 assert.equal(entities.length,4283);
 assert.equal(WEST_STAT_PARENT_ID,'stat-MD11');
 assert.equal(CHISINAU_PARENT_ID,'osm-r1691801');
 assert.equal(byId.get(WEST_STAT_PARENT_ID).treeParentId,'osm-r58974');
 assert.equal(byId.get(CHISINAU_PARENT_ID).statisticalRoles[0].code,'MD115');
 assert.equal(byId.get(CHISINAU_PARENT_ID).adminLevel,4);
 for(const view of ['all','statistical'])for(const lang of ['ro','en']){
  const actual=ordered(WEST_STAT_PARENT_ID,view,lang);
  assert.deepEqual(actual.map(x=>x.id),WEST_IDS,view+' / '+lang);
  assert.deepEqual(actual.map(x=>shortTreeName(x,lang)),
    lang==='ro'?['Chișinău','Nord','Centru','Sud','Găgăuzia']:
      ['Chișinău','North','Centre','South','Gagauzia']);
  assert.equal(new Set(actual.map(x=>x.id)).size,5,'no duplicates');
  assert(actual.every(x=>x.treeParentId===WEST_STAT_PARENT_ID),'original NTS2 parent');
 }
 assert.equal(children(WEST_STAT_PARENT_ID,'administrative').length,0,
   'NTS2 West never becomes a canonical administrative parent');
 assert.equal(byId.get(CHISINAU_PARENT_ID).administrativeParentId,'osm-r58974',
   'Chișinău stays an ADM4 child of Moldova');
});

test('WEB-R3.16 keeps Chișinău city-first and five sectors nested, and preserves Găgăuzia/Nistrenia/Transnistria',()=>{
 for(const view of ['all','administrative']){
  const city=ordered(CHISINAU_PARENT_ID,view,'ro');
  assert.equal(city.length,19);
  assert.equal(city[0].id,'osm-r1748490');
  const sectors=ordered('osm-r1748490',view,'ro');
  assert.equal(sectors.length,5);
  assert.deepEqual(sectors.map(x=>shortTreeName(x,'ro')),
    ['Botanica','Buiucani','Centru','Ciocana','Rîșcani']);
  assert.equal(ordered('osm-r1699032',view,'ro')[0].id,'osm-r1706978');
  assert.deepEqual(ordered(NISTRIAN_PARENT_ID,view,'ro').map(x=>x.id),
    NISTRIAN_CHILD_ORDER);
 }
 assert.deepEqual(ordered(EAST_STAT_PARENT_ID,'all','ro').map(x=>x.id),
   ['osm-r2607033','osm-r9581354']);
 for(const id of ['stat-MD111','stat-MD112','stat-MD113','osm-r1699032']){
   assert.equal(byId.get(id).treeParentId,WEST_STAT_PARENT_ID);
 }
 for(const id of ['osm-r2607033','osm-r9581354']){
  assert.equal(byId.get(id).administrativeParentId,'osm-r58974');
 }
});
