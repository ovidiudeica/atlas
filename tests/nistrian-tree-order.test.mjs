import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {shortTreeName} from '../src/data/treeNames.mjs';
const arr=JSON.parse(gunzipSync(readFileSync(
 new URL('../public/data/phase4/catalog.json.gz',import.meta.url))).toString('utf8')).entities;
const info=x=>({id:x.id,name:x.name,shortRO:shortTreeName(x,'ro'),
  shortEN:shortTreeName(x,'en'),official:x.officialName,level:x.adminLevel,
  roles:x.roles,adminParent:x.administrativeParentId,treeParent:x.treeParentId});
test('inventory Nistrian Republic and its direct descendants',()=>{
 assert.equal(arr.length,4283);
 const keywords=/republic|republica|nistrean|transnistr|pridnestrov|приднестр|молдавск/i;
 const named=arr.filter(x=>keywords.test(
   [x.name,x.officialName,x.shortName?.ro,x.shortName?.en].join(' ')));
 const branches=named.map(parent=>{
   const children=arr.filter(x=>x.treeParentId===parent.id||x.administrativeParentId===parent.id);
   return {parent:info(parent),count:children.length,
     children:children.map(x=>({...info(x),link:x.treeParentId===parent.id?'tree':'admin-only'}))};
 }).filter(x=>x.count>0||/republic|nistrean/i.test(x.parent.name));
 console.log('NISTRIAN-PARENT-REPORT '+JSON.stringify({
   named:named.map(info),branches
 }));
});
