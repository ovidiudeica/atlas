import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {shortTreeName} from '../src/data/treeNames.mjs';
import {presentationParentId} from '../src/data/treeOverlay.mjs';
import {compareTreeSiblings,REGIONAL_SEATS,DISTRICT_SEATS} from '../src/data/treeOrder.mjs';

// Source reference: certified OSMB Moldova 2026-10-05; read-only audit
// atlas-md-nord-centru-sud-audit-2026-11-07.md. No canonical reparenting.
const entities=JSON.parse(gunzipSync(readFileSync(
  new URL('../public/data/phase4/catalog.json.gz',import.meta.url))).toString('utf8')).entities;
const byId=new Map(entities.map(x=>[x.id,x]));
const regions=Object.freeze({
 'stat-MD111':{count:12,children:315,first:'osm-r58983'},
 'stat-MD112':{count:13,children:357,first:'osm-r1691800'},
 'stat-MD113':{count:8,children:184,first:'osm-r1211126'}
});
const inView=(view,node)=>view==='all'||(view==='administrative'
  ?node.roles.includes('administrative')
  :node.statisticalRoles.length>0||['osm-r90689','osm-r58974'].includes(node.id));
const children=(id,view)=>entities.filter(node=>inView(view,node)&&presentationParentId(node,view)===id);
const sorted=(id,lang,view)=>children(id,view).sort((a,b)=>compareTreeSiblings(a,b,view,id,lang));
const localizedSort=(a,b,lang)=>shortTreeName(a,lang).localeCompare(shortTreeName(b,lang),lang)
  ||a.id.localeCompare(b.id,'en');

test('WEB-R3.10 exact released scope: 33 ADM4, 856 ADM8 (including 3 preexisting Căușeni/NI conflicts)',()=>{
 assert.equal(entities.length,4283);
 assert.equal(Object.keys(REGIONAL_SEATS).length,3);
 assert.equal(Object.keys(DISTRICT_SEATS).length,33);
 assert.equal(new Set(Object.values(DISTRICT_SEATS)).size,33,'Each raion has its own seat ID');
 let totalDistricts=0,totalLocals=0;
 for(const [regionId,expect] of Object.entries(regions)){
   const regional=byId.get(regionId);
   assert(regional,'Missing NTS3 '+regionId);
   assert.equal(regional.statisticalRoles[0].code,regionId.slice(5));
   assert.equal(REGIONAL_SEATS[regionId],expect.first);
   const districts=children(regionId,'all');
   assert.equal(districts.length,expect.count,regionId);
   assert(districts.every(d=>d.country==='MD'&&d.roles.includes('administrative')&&d.adminLevel===4));
   for(const district of districts){
     assert.equal(district.treeParentId,regionId,'No statistical parent change '+district.id);
     assert.equal(district.administrativeParentId,'osm-r58974','Administrative root preserved '+district.id);
     const seatId=DISTRICT_SEATS[district.id];
     assert(seatId,'Unregistered seat for '+district.id);
     const seat=byId.get(seatId);
     assert(seat&&seat.adminLevel===8,'Seat must be real ADM8 '+seatId);
     assert.equal(seat.administrativeParentId,district.id,'Source ADM4 parent of seat unchanged');
     assert.equal(seat.treeParentId,district.id,'Tree parent of seat unchanged');
     const locals=children(district.id,'administrative');
     assert.equal(locals.filter(x=>x.adminLevel===8).length,locals.length);
     assert(locals.some(x=>x.id===seatId));
     assert.equal(locals.length,children(district.id,'all').length);
     totalLocals+=locals.length;
   }
   assert.equal(districts.reduce((n,d)=>n+children(d.id,'all').length,0),expect.children);
   totalDistricts+=districts.length;
 }
 assert.equal(totalDistricts,33);
 assert.equal(totalLocals,856);
 assert.deepEqual(new Set(Object.keys(DISTRICT_SEATS)),
   new Set(Object.keys(regions).flatMap(id=>children(id,'all').map(x=>x.id))));
});

test('Region agency seat comes first; other 11/12/7 ADM4 sorted by compact localized name',()=>{
 for(const lang of ['ro','en'])for(const [regionId,meta] of Object.entries(regions)){
   const actual=sorted(regionId,lang,'all');
   assert.equal(actual[0].id,meta.first,regionId+' '+lang);
   assert.deepEqual(actual.slice(1).map(x=>x.id),
     [...actual.slice(1)].sort((a,b)=>localizedSort(a,b,lang)).map(x=>x.id),
     regionId+' localized order '+lang);
   assert.equal(children(regionId,'administrative').length,0,
     'Statistical region must NOT be an administrative parent '+regionId);
 }
});

test('Every raion ADM8 seat is first in both views and languages; remaining locals alphabetically ordered',()=>{
 for(const view of ['all','administrative'])for(const lang of ['ro','en'])
   for(const [district,seat] of Object.entries(DISTRICT_SEATS)){
     const actual=sorted(district,lang,view);
     assert(actual.length>0,district+' nonempty');
     assert.equal(actual[0].id,seat,district+' '+lang+' '+view);
     assert.deepEqual(actual.slice(1).map(x=>x.id),
       [...actual.slice(1)].sort((a,b)=>localizedSort(a,b,lang)).map(x=>x.id),
       district+' '+lang+' '+view);
     assert.equal(new Set(actual.map(x=>x.id)).size,actual.length);
     assert(actual.every(x=>x.administrativeParentId===district),
       'No administrative reparenting '+district);
   }
});

test('three pre-existing Căușeni catalog children have documented conflicting OSMB NI source parents',()=>{
 // The OSMB archive states: Cremenciug/Chițcani -> Slobozia NI;
 // Gîsca -> Bender NI. The public Atlas catalogue still records Căușeni.
 // This test records, not fixes, the existing provenance conflict.
 const conflictIds=['osm-r1216706','osm-r12215667','osm-r6879649'];
 const causeni=children('osm-r65343','administrative');
 assert.equal(causeni.length,30);
 assert.equal(new Set(causeni.map(x=>x.id)).size,30);
 assert(conflictIds.every(id=>causeni.some(x=>x.id===id)));
 for(const id of conflictIds){
   assert.equal(byId.get(id).administrativeParentId,'osm-r65343');
   assert.equal(byId.get(id).treeParentId,'osm-r65343');
 }
 assert.equal(causeni.length-conflictIds.length,27,'27 OSMB-direct Căușeni children');
});

test('Dubăsari Council seat Coșnița wins over Cocieri and name duplicates do not displace verified IDs',()=>{
 assert.equal(DISTRICT_SEATS['osm-r1692123'],'osm-r19013515');
 assert.equal(byId.get('osm-r19013515').name.replaceAll('ş','ș').replaceAll('ţ','ț'),'Coșnița');
 for(const lang of ['ro','en'])for(const view of ['all','administrative'])
   assert.equal(sorted('osm-r1692123',lang,view)[0].id,'osm-r19013515');
 for(const id of ['osm-r59007','osm-r1693907','osm-r59005']){
   const seat=DISTRICT_SEATS[id],local=children(id,'administrative');
   assert(local.some(x=>x.id===seat));
   assert.equal(sorted(id,'ro','administrative')[0].id,seat);
 }
});

test('Statistical view, source parents, and accepted Găgăuzia/WEB-R3.15 Nistrenia/Chișinău rules are respected',()=>{
 for(const node of entities){
   // WEB-R3.10 has no parent overlay; all source parent pointers are read-only.
   assert.equal(presentationParentId(node,'statistical'),node.treeParentId);
 }
 for(const id of Object.keys(REGIONAL_SEATS))
   assert.equal(children(id,'statistical').length,0);
 assert.deepEqual([...children('osm-r65335','all')].sort((a,b)=>
     compareTreeSiblings(a,b,'all','osm-r65335','ro')).map(x=>shortTreeName(x,'ro')),
   ['Tiraspol','Bender','Slobozia','Grigoriopol','Dubăsari','Rîbnița','Camenca']);
 assert.equal(sorted('osm-r1699032','ro','all')[0].id,'osm-r1706978');
 assert.equal(sorted('osm-r1691801','ro','all')[0].id,'osm-r1748490');
 for(const regionId of Object.keys(REGIONAL_SEATS)){
   for(const district of children(regionId,'all')){
     assert.equal(presentationParentId(district,'all'),regionId);
     assert.equal(presentationParentId(district,'administrative'),'osm-r58974');
   }
 }
});
