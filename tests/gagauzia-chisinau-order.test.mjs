import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {compareTreeSiblings,GAGAUZIA_PARENT_ID,CHISINAU_PARENT_ID}
  from '../src/data/treeOrder.mjs';
import {shortTreeName} from '../src/data/treeNames.mjs';

const entries=JSON.parse(gunzipSync(readFileSync(
 new URL('../public/data/phase4/catalog.json.gz',import.meta.url))).toString('utf8')).entities;
const byId=new Map(entries.map(x=>[x.id,x]));
const groups=[
 {id:GAGAUZIA_PARENT_ID,name:'Găgăuzia',levels:{5:3,8:26},
  first:['osm-r1706979','osm-r1706978','osm-r7103068']},
 {id:CHISINAU_PARENT_ID,name:'Chișinău',levels:{7:5,8:19},
  first:['osm-r1813306','osm-r1813297','osm-r58512','osm-r1813315','osm-r1813316']}
];
const children=id=>entries.filter(x=>x.treeParentId===id);
test('certified Gagauzia and Chisinau parentage and child identities are unchanged',()=>{
 assert.equal(entries.length,4283);
 assert.equal(byId.size,4283);
 for(const {id,name,levels} of groups){
   const parent=byId.get(id),direct=children(id);
   assert.equal(parent.name,name);
   assert.equal(direct.length,Object.values(levels).reduce((a,b)=>a+b,0));
   assert(direct.every(x=>x.administrativeParentId===id));
   assert.equal(new Set(direct.map(x=>x.id)).size,direct.length);
   const count={};for(const node of direct)count[node.adminLevel]=(count[node.adminLevel]||0)+1;
   assert.deepEqual(count,levels);
 }
});
test('3 raions and 5 sectors precede ADM8 localities, alphabetically in both languages and views',()=>{
 for(const {id,first} of groups){
   const source=children(id);
   for(const lang of ['ro','en'])for(const view of ['administrative','all']){
     const actual=[...source].sort((a,b)=>compareTreeSiblings(a,b,view,id,lang));
     assert.deepEqual(new Set(actual.map(x=>x.id)),new Set(source.map(x=>x.id)));
     assert.deepEqual(actual.slice(0,first.length).map(x=>x.id),first,
       id+'/'+view+'/'+lang);
     for(let n=1;n<actual.length;n++){
       const prev=actual[n-1],next=actual[n];
       assert(prev.adminLevel<=next.adminLevel,'Level ordering '+id+'/'+view+'/'+lang);
       if(prev.adminLevel===next.adminLevel)
         assert(shortTreeName(prev,lang).localeCompare(shortTreeName(next,lang),lang)<=0,
           'Alphabetical order '+id+'/'+view+'/'+lang+': '+shortTreeName(prev,lang)+' > '+shortTreeName(next,lang));
     }
   }
 }
});
test('short sector names preserve full source labels and identities',()=>{
 for(const [id,short,full] of [
   ['osm-r1813297','Buiucani','Buiucani Sector'],
   ['osm-r1813316','Rîșcani','Rîșcani Sector']]){
   const node=byId.get(id);
   assert.equal(node.shortName.en,full);
   assert.equal(shortTreeName(node,'en'),short);
   assert.equal(shortTreeName(node,'ro'),short);
   assert.equal(node.adminLevel,7);
   assert.equal(node.administrativeParentId,CHISINAU_PARENT_ID);
 }
 for(const [raion,local] of [
   ['osm-r1706978','osm-r19118615'],
   ['osm-r1706979','osm-r19118605'],
   ['osm-r7103068','osm-r19117343']]){
   const p=byId.get(raion),c=byId.get(local);
   assert.equal(p.name,c.name);
   assert.equal(p.adminLevel,5);
   assert.equal(c.adminLevel,8);
   assert.equal(p.administrativeParentId,c.administrativeParentId);
   assert.equal(p.administrativeParentId,GAGAUZIA_PARENT_ID);
 }
});
test('Nistrenia sibling order and unrelated default tree ordering remain stable',()=>{
 const pmr=children('osm-r65335');
 assert.deepEqual([...pmr].sort((a,b)=>compareTreeSiblings(a,b,'administrative','osm-r65335','ro'))
   .map(x=>shortTreeName(x,'ro')),
   ['Camenca','Dubăsari','Grigoriopol','Rîbnița','Slobozia','Bender','Tiraspol']);
 const others=entries.filter(x=>x.administrativeParentId==='osm-r58974'&&
   x.id!=='osm-r65335').slice(0,9);
 assert.deepEqual(
   [...others].sort((a,b)=>compareTreeSiblings(a,b,'administrative','osm-r58974','ro')).map(x=>x.id),
   [...others].sort((a,b)=>a.name.localeCompare(b.name,'ro')).map(x=>x.id));
});
