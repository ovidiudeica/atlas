import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {compareTreeSiblings,compareRomaniaSiblingCodes,NISTRIAN_CHILD_ORDER}
  from '../src/data/treeOrder.mjs';
import {presentationParentId} from '../src/data/treeOverlay.mjs';

const entities=JSON.parse(gunzipSync(readFileSync(
  new URL('../public/data/phase4/catalog.json.gz',import.meta.url))).toString('utf8')).entities;
const byId=new Map(entities.map(x=>[x.id,x]));
const inView=(x,view)=>view==='all'||(view==='administrative'
  ?x.roles.includes('administrative'):x.statisticalRoles.length>0);
const children=(id,view)=>entities.filter(x=>x.country==='RO'&&inView(x,view)
  &&presentationParentId(x,view)===id);
const sorted=(id,view='all',lang='ro')=>children(id,view).sort(
  (a,b)=>compareTreeSiblings(a,b,view,id,lang));

test('WEB-R3.19b: Romanian inventory has precisely 4/8/42 NUTS1/2/3 roles',()=>{
  const ro=entities.filter(x=>x.country==='RO');
  assert.equal(ro.length,3241);
  const byLevel=new Map();
  for(const n of ro)for(const r of n.statisticalRoles){
    if(r.classification!=='NUTS')continue;
    byLevel.set(r.level,(byLevel.get(r.level)||0)+1);
    assert(r.code&&r.version);
  }
  assert.deepEqual([...byLevel].sort((a,b)=>a[0]-b[0]),[[1,4],[2,8],[3,42]]);
  assert(byId.get('osm-r377733').statisticalRoles.some(r=>r.code==='RO321'));
  assert.equal(byId.get('osm-r377733').registry.code,'403');
});
test('WEB-R3.19b: RO31 and RO32 use NUTS3, with Bucharest RO321 first',()=>{
  for(const parent of ['stat-RO31','stat-RO32']){
    const arr=sorted(parent,'all','ro');
    assert(arr.length>=2,'Missing NUTS3 children: '+parent);
    const codes=arr.map(n=>n.statisticalRoles.find(r=>r.classification==='NUTS')?.code);
    assert(codes.every(Boolean));
    assert.deepEqual(codes,[...codes].sort());
    assert.deepEqual(sorted(parent,'all','en').map(n=>n.id),arr.map(n=>n.id));
  }
  assert.equal(sorted('stat-RO32','all','ro')[0].id,'osm-r377733');
});
test('WEB-R3.19b: SIRUTA is numerically sorted, codes before missing, ties by Atlas ID',()=>{
  const item=(id,code)=>({id,country:'RO',name:id,roles:['administrative'],
    statisticalRoles:[],adminLevel:8,registry:code?{system:'SIRUTA',code}:null});
  assert(compareRomaniaSiblingCodes(item('a','98'),item('b','100'))<0);
  assert(compareRomaniaSiblingCodes(item('a','100'),item('b',null))<0);
  assert(compareRomaniaSiblingCodes(item('a','100'),item('b','0100'))<0);
  const stat={...item('a','100'),statisticalRoles:[{classification:'NUTS',code:'RO321'}]};
  assert(compareRomaniaSiblingCodes(stat,item('b','2'))<0);
});
test('WEB-R3.19b: every Romanian presentation sibling group keeps code order',()=>{
  const parents=new Set(entities.filter(x=>x.country==='RO').flatMap(x=>
    [x.treeParentId,x.administrativeParentId]).filter(Boolean));
  let codedPairs=0;
  for(const view of ['all','administrative','statistical'])for(const lang of ['ro','en']){
    for(const parent of parents){
      const arr=sorted(parent,view,lang);
      assert.equal(new Set(arr.map(x=>x.id)).size,arr.length);
      for(let i=1;i<arr.length;i++){
        const byCodes=compareRomaniaSiblingCodes(arr[i-1],arr[i]);
        if(byCodes!==null){assert(byCodes<=0,parent+' / '+arr[i-1].id+' / '+arr[i].id);codedPairs++;}
      }
    }
  }
  assert(codedPairs>3000);
});
test('WEB-R3.19b: Nistrenia cadastral ordering is not affected by Romanian change',()=>{
  const children=entities.filter(x=>x.treeParentId==='osm-r65335');
  assert.deepEqual(children.sort((a,b)=>compareTreeSiblings(a,b,'all','osm-r65335','ro')).map(x=>x.id),
    NISTRIAN_CHILD_ORDER);
});
