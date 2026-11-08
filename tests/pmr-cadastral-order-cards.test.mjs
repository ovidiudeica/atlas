import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {PMR_CADASTRAL_SOURCE,PMR_CADASTRAL_SEAT_CODES,
  PMR_CADASTRAL_ORDER,pmrCadastralSeatCode} from '../src/data/pmrCadastral.mjs';
import {NISTRIAN_PARENT_ID,NISTRIAN_CHILD_ORDER,compareTreeSiblings} from '../src/data/treeOrder.mjs';
import {shortTreeName} from '../src/data/treeNames.mjs';
import {presentationParentId} from '../src/data/treeOverlay.mjs';

const catalog=JSON.parse(gunzipSync(readFileSync(new URL(
  '../public/data/phase4/catalog.json.gz',import.meta.url))).toString('utf8')).entities;
const byId=new Map(catalog.map(x=>[x.id,x]));
const EXPECTED=[
  ['osm-r944727','32','Bender','Bender'],
  ['osm-r1702219','33','Tiraspol','Tiraspol'],
  ['osm-r1702214','40','Grigoriopol','Grigoriopol'],
  ['osm-r1702215','45','Dubăsari','Dubasari'],
  ['osm-r1702217','55','Rîbnița','Ribnita'],
  ['osm-r1702218','57','Slobozia','Slobozia'],
  ['osm-r1702216','66','Camenca','Camenca']
];
const expectedIds=EXPECTED.map(x=>x[0]);

test('WEB-R3.18: all seven cadastral seat-code associations sourced, unique and strictly increasing',()=>{
 assert.equal(catalog.length,4283);
 assert.equal(NISTRIAN_PARENT_ID,'osm-r65335');
 assert.deepEqual(Object.keys(PMR_CADASTRAL_SEAT_CODES).sort(),
   [...expectedIds].sort(),'exact seven, no silent new entities');
 assert.deepEqual(PMR_CADASTRAL_ORDER,expectedIds);
 assert.deepEqual(NISTRIAN_CHILD_ORDER,expectedIds);
 assert.deepEqual(EXPECTED.map(x=>x[1]),['32','33','40','45','55','57','66']);
 for(const [id,code] of EXPECTED){
   const node=byId.get(id);
   assert(node,'Existing Atlas territory '+id);
   assert.equal(node.country,'MD');
   assert.equal(node.adminLevel,5);
   assert.equal(node.registry,null,'No fabricated CUATM registry for '+id);
   assert.equal(node.treeParentId,NISTRIAN_PARENT_ID);
   assert.equal(node.administrativeParentId,NISTRIAN_PARENT_ID);
   assert.equal(pmrCadastralSeatCode(id),code);
   assert.equal(PMR_CADASTRAL_SEAT_CODES[id].code,code);
 }
 assert.equal(PMR_CADASTRAL_SOURCE.order,'361');
 assert.equal(PMR_CADASTRAL_SOURCE.annex,2);
 assert.equal(PMR_CADASTRAL_SOURCE.orderDate,'2015-12-25');
 assert.equal(PMR_CADASTRAL_SOURCE.registrationNumber,'7368');
 assert.equal(PMR_CADASTRAL_SOURCE.url,
   'https://ulpmr.ru/ul/show/15qmcSyGNzdrq4CHg3YTYT7pZL4prutaleyY%3D');
});

test('WEB-R3.18: same PMR cadastral order in RO/EN and All/Administrative; no statistical Nistrenia children',()=>{
 for(const view of ['all','administrative'])for(const lang of ['ro','en']){
   const arr=catalog.filter(x=>presentationParentId(x,view)===NISTRIAN_PARENT_ID)
     .sort((a,b)=>compareTreeSiblings(a,b,view,NISTRIAN_PARENT_ID,lang));
   assert.deepEqual(arr.map(x=>x.id),expectedIds,view+' '+lang);
   assert.deepEqual(arr.map(x=>pmrCadastralSeatCode(x.id)),EXPECTED.map(x=>x[1]));
   assert.deepEqual(arr.map(x=>shortTreeName(x,lang)),EXPECTED.map(x=>x[lang==='ro'?2:3]));
 }
 assert.equal(catalog.filter(x=>x.statisticalRoles.length&&
   presentationParentId(x,'statistical')===NISTRIAN_PARENT_ID).length,0);
});

test('WEB-R3.18: PMR code is NOT CUATM or KLADR, is not assigned to other territories',()=>{
 const otherIds=[
   NISTRIAN_PARENT_ID,'osm-r58974','stat-MD120',
   'osm-r2607033','osm-r9581354','osm-r1691801',
   'osm-r1706978','osm-r1748490','osm-r90689'
 ];
 for(const id of otherIds)assert.equal(pmrCadastralSeatCode(id),null,'No PMR code '+id);
 const js=readFileSync(new URL('../src/data/pmrCadastral.mjs',import.meta.url),'utf8');
 assert(!/KLADR_PMR_CODES|registry\.system.*PMR/i.test(js),'Do not conflate registries');
 for(const id of expectedIds){
   assert(!Object.hasOwn(byId.get(id),'pmrCadastralCode'),'Do not mutate canonical catalog');
 }
});

test('WEB-R3.18: source-backed detail field and caveat appear only when PMR code available',()=>{
 const app=readFileSync(new URL('../src/App.tsx',import.meta.url),'utf8');
 assert.match(app,/pmrCadastralCode: 'Cod cadastral PMR'/);
 assert.match(app,/pmrCadastralCode: 'PMR cadastral code'/);
 assert.match(app,/<dt>\{t\.pmrCadastralCode\}<\/dt><dd>\{pmrCadastralSeatCode\(currentNode\.id\)\}<\/dd>/);
 assert.match(app,/pmrCadastralSeatCode\(currentNode\.id\)&&/);
 assert.match(app,/PMR_CADASTRAL_SOURCE\.url/);
 assert.match(app,/t\.pmrCadastralCaveat/);
 assert.match(app,/nu este identificator KLADR PMR sau cod CUATM/);
});
