import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {presentationParentId} from '../src/data/treeOverlay.mjs';
import {compareTreeSiblings,compareMoldovaSiblingCodes,
  NISTRIAN_CHILD_ORDER} from '../src/data/treeOrder.mjs';

const entities=JSON.parse(gunzipSync(readFileSync(
  new URL('../public/data/phase4/catalog.json.gz',import.meta.url))).toString('utf8')).entities;
const byId=new Map(entities.map(x=>[x.id,x]));
const inView=(x,view)=>view==='all'||(view==='administrative'
  ?x.roles.includes('administrative')
  :x.statisticalRoles.length>0||x.id==='osm-r90689'||x.id==='osm-r58974');
const siblings=(parent,view)=>entities.filter(x=>inView(x,view)&&presentationParentId(x,view)===parent);
const sorted=(p,v,l)=>siblings(p,v).sort((a,b)=>compareTreeSiblings(a,b,v,p,l));
const key=n=>{
  const s=n.statisticalRoles?.[0]?.code;
  if(s)return [0,s,n.registry?.system==='CUATM'?n.registry.code:''];
  const c=n.registry?.system==='CUATM'&&n.registry?.code;
  return c?[1,c,'']:[2,'',''];
};
const byKey=(a,b)=>{
  const x=key(a),y=key(b);
  for(let i=0;i<x.length;i++){
    const d= i===0?x[i]-y[i]:x[i].localeCompare(y[i],'en');
    if(d)return d;
  }
  return a.id.localeCompare(b.id,'en');
};
const oldRomaniaComparator=(a,b,view)=>{
  const aStat=a.roles.includes('statistical')&&!a.roles.includes('administrative')?0:1;
  const bStat=b.roles.includes('statistical')&&!b.roles.includes('administrative')?0:1;
  if(aStat!==bStat)return aStat-bStat;
  const aCode=a.statisticalRoles[0]?.code,bCode=b.statisticalRoles[0]?.code;
  if(view!=='administrative'&&aCode&&bCode)
    return aCode.localeCompare(bCode,'en',{numeric:true});
  if((a.adminLevel??0)!==(b.adminLevel??0)&&view==='administrative')
    return (a.adminLevel??0)-(b.adminLevel??0);
  return a.name.localeCompare(b.name,'ro');
};

test('WEB-R3.17: code resolver prioritizes NTS and dual-role MD114/MD115 over CUATM 0100/9600',()=>{
  const west=sorted('stat-MD11','all','ro');
  assert.deepEqual(west.map(x=>x.statisticalRoles[0].code),
    ['MD111','MD112','MD113','MD114','MD115']);
  assert.equal(byId.get('osm-r1691801').registry.code,'0100');
  assert.equal(byId.get('osm-r1699032').registry.code,'9600');
  assert(compareMoldovaSiblingCodes(byId.get('osm-r1699032'),byId.get('osm-r1691801'))<0,
    'MD114 precedes MD115 despite reverse CUATM order');
  assert.deepEqual(sorted('stat-MD120','all','ro').map(x=>x.registry.code),['0500','9800']);
  assert.deepEqual(sorted('osm-r58974','all','ro').map(x=>x.id).slice(0,2),
    ['stat-MD11','stat-MD12']);
});

test('WEB-R3.17: all Moldovan coded sibling families sort by relevant code, in every view and language',()=>{
  assert.equal(entities.length,4283);
  const md=entities.filter(n=>n.country==='MD');
  const parents=new Set(md.map(n=>n.treeParentId).concat(md.map(n=>n.administrativeParentId)).filter(Boolean));
  let groups=0, codedPairs=0;
  for(const view of ['all','administrative','statistical'])for(const lang of ['ro','en']){
    for(const parent of parents){
      const arr=sorted(parent,view,lang);
      if(arr.length<2)continue;
      assert.equal(new Set(arr.map(x=>x.id)).size,arr.length,parent+' duplicate child');
      assert(arr.every(x=>x.country==='MD'),parent+' cross-jurisdiction child');
      const coded=arr.filter(n=>key(n)[0]!==2);
      // Comparison of the encoded portion is independent of the sort implementation.
      assert.deepEqual(coded.map(x=>x.id),[...coded].sort(byKey).map(x=>x.id),
        parent+' '+view+' '+lang+' coded sibling order');
      assert.deepEqual(arr.slice(0,coded.length).map(x=>x.id),
        coded.map(x=>x.id),parent+' '+view+' '+lang+' coded before uncoded');
      codedPairs+=Math.max(0,coded.length-1);
      groups++;
    }
  }
  assert(groups>100,'expected extensive parent families');
  assert(codedPairs>3000,'expected broad CUATM coverage across views');
});

test('WEB-R3.17: all four known CUATM sibling collisions use stable Atlas IDs',()=>{
 const collisions={
  'osm-r1692078':['1050'],
  'osm-r1693908':['7160'],
  'osm-r59007':['3417'],
  'osm-r85827':['8034']
 };
 for(const [parent,codes] of Object.entries(collisions)){
   for(const code of codes){
     const siblingsWithCode=sorted(parent,'all','ro').filter(n=>n.registry?.code===code);
     assert(siblingsWithCode.length>=2,parent+' '+code);
     assert.deepEqual(siblingsWithCode.map(x=>x.id),
       [...siblingsWithCode.map(x=>x.id)].sort((a,b)=>a.localeCompare(b,'en')),
       parent+' '+code+' collision is deterministic');
   }
 }
});

test('WEB-R3.17: un-coded exceptions retain identities, parentage and agreed Nistrenia order',()=>{
  assert.deepEqual(sorted('osm-r65335','all','ro').map(x=>x.id),NISTRIAN_CHILD_ORDER);
  assert.deepEqual(sorted('osm-r65335','administrative','en').map(x=>x.id),NISTRIAN_CHILD_ORDER);
  assert.deepEqual(sorted('osm-r1699032','all','ro').map(x=>x.id),
    ['osm-r1706978','osm-r1706979','osm-r7103068']);
  const balti=sorted('osm-r58983','administrative','ro');
  assert.deepEqual(balti.map(x=>x.registry?.code||null),['0301','4839',null]);
  const chisCity=sorted('osm-r1748490','all','ro');
  assert.deepEqual(chisCity.map(x=>x.registry?.code||null),
    ['0110','0120','0140','0150',null]);
  assert.equal(chisCity.at(-1).id,'osm-r58512','uncoded sector Centru is last');
  for(const node of mdRoots()){
    assert.equal(presentationParentId(node,'statistical'),node.treeParentId);
    assert.equal(presentationParentId(node,'administrative'),node.administrativeParentId);
  }
});
function mdRoots(){
  return ['osm-r65335','osm-r1691801','osm-r1699032','osm-r9581354','osm-r2607033']
    .map(id=>byId.get(id));
}

test('WEB-R3.19b: Romanian code ordering replaces the previously frozen fallback',()=>{
 const ro=entities.filter(n=>n.country==='RO');
 const parents=new Set(ro.flatMap(x=>[x.treeParentId,x.administrativeParentId]).filter(Boolean));
 let compared=0;
 for(const view of ['all','administrative','statistical'])for(const lang of ['ro','en']){
  for(const parent of parents){
   const arr=siblings(parent,view);
   if(arr.length<2||!arr.every(x=>x.country==='RO'))continue;
   const actual=[...arr].sort((a,b)=>compareTreeSiblings(a,b,view,parent,lang));
   const coded=actual.filter(n=>n.statisticalRoles.some(r=>r.classification==='NUTS')
     ||n.registry?.system==='SIRUTA'&&n.registry?.code);
   const expected=[...coded].sort((a,b)=>{
     const x=a.statisticalRoles.find(r=>r.classification==='NUTS')?.code;
     const y=b.statisticalRoles.find(r=>r.classification==='NUTS')?.code;
     if(Boolean(x)!==Boolean(y))return x?-1:1;
     if(x&&y&&x!==y)return x.localeCompare(y,'en',{numeric:true});
     const ca=a.registry?.system==='SIRUTA'?a.registry.code:null;
     const cb=b.registry?.system==='SIRUTA'?b.registry.code:null;
     if(Boolean(ca)!==Boolean(cb))return ca?-1:1;
     if(ca&&cb&&ca!==cb)return Number(ca)-Number(cb);
     return a.id.localeCompare(b.id,'en');
   });
   assert.deepEqual(coded.map(n=>n.id),expected.map(n=>n.id),
     'Romania official-code order: '+parent+' '+view+' '+lang);
   compared++;
  }
 }
 assert(compared>100,'Romanian sibling groups covered');
});
