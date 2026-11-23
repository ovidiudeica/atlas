import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {
  buildHistoricalOhmTree,validateOhmParentage,uniqueSourceVersionAtYear,
  ohmCategory,entityIdFromGroup
} from '../src/data/historicalOhmTree.mjs';
import {projectGeodataHistoricalSourceCatalog} from '../src/data/historicalGeodataTemporal.mjs';

const base=new URL('../public/data/historical/v1/',import.meta.url);
const read=path=>JSON.parse(readFileSync(new URL(path,base),'utf8'));
const index=read('geodata/index.json'),parentage=read('ohm-parentage.json');
const countRoots=roots=>Object.values(roots).reduce((n,arr)=>n+arr.length,0);

test('OHM temporal tree preserves 139 versions, 125 exact geometry assets, 76 source groups',()=>{
 assert.deepEqual(validateOhmParentage(index,parentage),{ok:true,errors:[]});
 const projection=projectGeodataHistoricalSourceCatalog(index);
 const tree=buildHistoricalOhmTree(index,parentage,1835);
 assert.deepEqual([tree.sourceVersionCount,tree.assetCount,tree.groupCount],[139,125,76]);
 assert.equal(tree.nodes.size,76);
 assert.equal(countRoots(tree.roots),76);
 assert.deepEqual(tree.activeLinks,[]);
 assert.equal(tree.legalBoundariesCertified,false);
 assert.equal(tree.qualifiedGeometryBorders,0);
 assert.equal(projection.geometries.length,125);
 assert.equal(projection.geometryUses.length,139);
 assert.equal(new Set(projection.geometryUses.map(x=>x.geometryId)).size,125);
});
test('OHM exact geometry reuse across multiple periods never merges institutional IDs',()=>{
 const tree=buildHistoricalOhmTree(index,parentage,1850);
 const bukovina=tree.nodes.get('Bucovina');
 assert(bukovina);
 assert.equal(bukovina.versions.length,4);
 const canonical='geom:ohm-r2684081';
 assert(bukovina.versions.some(x=>x.geometryId===canonical));
 assert(bukovina.versions.filter(x=>x.geometryId===canonical).length>=2);
 const reused=index.geometryDuplicates.filter(([a,b])=>{
   const source=index.entries.find(x=>x.id===a),alias=index.entries.find(x=>x.id===b);
   return source?.sourceGroup!==alias?.sourceGroup;
 });
 assert(reused.length>0,'Exact geometry may be reused across distinct source groups');
 assert(reused.every(([a,b])=>index.entries.find(x=>x.id===a)?.geometryId===
   index.entries.find(x=>x.id===b)?.geometryId));
 assert.equal(bukovina.qualification,'provisional_source_identity');
});
test('only qualified and time-bound parentage creates children under the kingdom',()=>{
 const tree=buildHistoricalOhmTree(index,parentage,1930);
 assert.equal(tree.activeLinks.length,3);
 const romania=tree.nodes.get('Regatul României');
 assert(romania);
 assert.deepEqual(romania.children.map(x=>x.group).sort(),[
   'Județe istorice/Județul Arad',
   'Județe istorice/Județul Maramureș',
   'Județe istorice/Județul Timiș-Torontal'
 ].sort());
 assert.equal(countRoots(tree.roots),73);
 for(const child of romania.children){
   assert.equal(child.parentGroup,romania.group);
   assert.equal(child.parentEvidence.evidenceStatus,'qualified_membership_only');
   assert.equal(child.parentEvidence.boundaryCertified,false);
   assert.equal(uniqueSourceVersionAtYear(child,1930)?.sourceGroup,child.group);
 }
 assert.equal(romania.children.every(n=>n.category==='counties'),true);
});
test('historic reorganization removes unqualified parentage without moving sources',()=>{
 const post=buildHistoricalOhmTree(index,parentage,1939);
 const pre=buildHistoricalOhmTree(index,parentage,1920);
 assert.equal(post.activeLinks.length,0);
 assert.equal(pre.activeLinks.length,0);
 assert.equal(post.nodes.get('Regatul României').children.length,0);
 assert.equal(countRoots(post.roots),76);
 assert.equal(countRoots(pre.roots),76);
});
test('incomplete source periods do not claim 1930 geometry availability',()=>{
 const tree=buildHistoricalOhmTree(index,parentage,1930);
 const bacau=tree.nodes.get('Județe istorice/Județul Bacău');
 assert(bacau);
 assert.equal(bacau.versions.length,1);
 assert.equal(bacau.versions[0].sourcePeriod.end,null);
 assert.equal(uniqueSourceVersionAtYear(bacau,1930),null);
 assert.equal(bacau.parentGroup,null);
 assert.equal(ohmCategory(bacau.group),'counties');
 assert.match(entityIdFromGroup(bacau.group),/^ohm:provisional-entity:/);
});
test('invalid/unsourced and cyclic parenthood fails closed',()=>{
 const bad=change=>{
   const copy=structuredClone(parentage);
   change(copy);
   assert.equal(validateOhmParentage(index,copy).ok,false);
 };
 bad(x=>x.links[0].boundaryCertified=true);
 bad(x=>x.links[0].evidenceStatus='candidate');
 bad(x=>x.links[0].evidence=[]);
 bad(x=>x.links[0].parentSourceGroup='nonexistent state');
 bad(x=>x.links[0].childSourceGroup=x.links[0].parentSourceGroup);
 bad(x=>x.links[0].end='not a date');
 bad(x=>x.links.push({...x.links[0],id:'conflict',parentSourceGroup:'Transilvania'}));
 bad(x=>x.links.push({...x.links[0],id:'cycle',childSourceGroup:x.links[0].parentSourceGroup,
   parentSourceGroup:x.links[0].childSourceGroup}));
});
