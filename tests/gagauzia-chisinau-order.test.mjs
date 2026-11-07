import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {shortTreeName} from '../src/data/treeNames.mjs';
import {compareTreeSiblings} from '../src/data/treeOrder.mjs';
const data=JSON.parse(gunzipSync(readFileSync(new URL('../public/data/phase4/catalog.json.gz',import.meta.url))).toString('utf8'));
const all=data.entities;
const meta=node=>({id:node.id,name:node.name,official:node.officialName,
  shortRO:shortTreeName(node,'ro'),shortEN:shortTreeName(node,'en'),
  sourceRO:node.shortName?.ro,sourceEN:node.shortName?.en,admin:node.adminLevel,
  roles:node.roles,stat:node.statisticalRoles.map(x=>x.code),
  treeParent:node.treeParentId,adminParent:node.administrativeParentId});
test('forensic all direct children under Gagauzia and Chisinau',()=>{
 assert.equal(all.length,4283);
 const parents=['osm-r1699032','osm-r1691801'];
 const branches=parents.map(pid=>{
   const parent=all.find(x=>x.id===pid);
   assert(parent,pid);
   const tree=all.filter(x=>x.treeParentId===pid);
   const admin=all.filter(x=>x.administrativeParentId===pid);
   return {parent:meta(parent),treeCount:tree.length,administrativeCount:admin.length,
     treeChildren:tree.map(meta),adminChildren:admin.map(meta),
     order:{
       currentMixed:[...tree].sort((a,b)=>compareTreeSiblings(a,b,'all',pid,'ro')).map(x=>x.id),
       currentAdministrative:[...admin].sort((a,b)=>compareTreeSiblings(a,b,'administrative',pid,'ro')).map(x=>x.id)
     }};
 });
 console.log('AUTONOMY-SIBLINGS-REPORT '+JSON.stringify(branches));
});