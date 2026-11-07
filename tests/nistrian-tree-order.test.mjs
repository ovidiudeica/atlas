import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {shortTreeName} from '../src/data/treeNames.mjs';
const data=JSON.parse(gunzipSync(readFileSync(new URL('../public/data/phase4/catalog.json.gz',import.meta.url))).toString('utf8'));
const arr=data.entities;
const fields=x=>({
 id:x.id,name:x.name,shortRO:shortTreeName(x,'ro'),shortEN:shortTreeName(x,'en'),
 official:x.officialName,level:x.adminLevel,roles:x.roles,stats:x.statisticalRoles?.map(r=>r.code),
 adminParent:x.administrativeParentId,treeParent:x.treeParentId
});
test('diagnose Nistrian Republic branch and all immediate source children',()=>{
 assert.equal(arr.length,4283);
 const matching=arr.filter(x=>/nistrean|nistr|transnistr|pridnestrov|moldoveneasc|moldavian|republic/i
   .test([x.name,x.officialName,x.shortName?.ro,x.shortName?.en,JSON.stringify(x.sourceTags||{})].join(' ')));
 const likely=matching.filter(x=>/republic|republica|республик|рм|пмр|nistrean/i
   .test([x.name,x.officialName,x.shortName?.ro,x.shortName?.en].join(' ')));
 const parents=[...new Map([...matching,...likely].map(x=>[x.id,x])).values()];
 const byParent=parents.map(p=>{
   const children=arr.filter(x=>x.treeParentId===p.id||x.administrativeParentId===p.id);
   return {parent:fields(p),n:children.length,
     children:children.map(x=>({...fields(x),link:x.treeParentId===p.id?'tree':'admin-only'})),
     currentOrder:children.map(x=>x.name).sort((a,b)=>a.localeCompare(b,'ro'))};
 }).filter(x=>x.n>0);
 console.log('NISTRIAN-HIERARCHY-FORENSICS '+JSON.stringify({matched:matching.map(fields),
   branches:byParent,orphaned:arr.filter(x=>x.country==='MD'&&x.adminLevel===5).slice(0,35).map(fields)}));
});