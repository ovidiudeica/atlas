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
 assert.equal(countRoots(tree.roots),73);
 assert.equal(tree.activeLinks.length,3);
 assert.deepEqual(tree.nodes.get('Transilvania').children.map(n=>n.group).sort(),[
   'Țara Chioarului',
   'Comitate istorice/Comitatul Kraszna',
   'Comitate istorice/Comitatul Közép-Szolnok'
 ].sort());
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
test('1930 documentary parents are qualified without conflating old Suceava with Bukovina',()=>{
 const tree=buildHistoricalOhmTree(index,parentage,1930);
 assert.equal(tree.activeLinks.length,15);
 const romania=tree.nodes.get('Regatul României');
 assert(romania);
 const admitted=['Arad','Bacău','Botoșani','Covurlui','Dorohoi','Fălciu','Iași',
   'Maramureș','Neamț','Putna','Roman','Tecuci','Timiș-Torontal','Tutova','Vaslui'];
 assert.deepEqual(romania.children.map(x=>x.group).sort(),
   admitted.map(x=>'Județe istorice/Județul '+x).sort());
 assert.equal(countRoots(tree.roots),61);
 assert.equal(tree.nodes.get('Județe istorice/Județul Suceava').parentGroup,null);
 for(const child of romania.children){
   assert.equal(child.parentGroup,romania.group);
   assert.equal(child.parentEvidence.evidenceStatus,'qualified_membership_only');
   assert.equal(child.parentEvidence.boundaryCertified,false);
   if(child.versions[0].sourcePeriod.end!==null)
     assert.equal(uniqueSourceVersionAtYear(child,1930)?.sourceGroup,child.group);
   else
     assert.equal(uniqueSourceVersionAtYear(child,1930),null);
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
 assert.equal(bacau.parentGroup,'Regatul României');
 assert.equal(bacau.parentEvidence.evidenceStatus,'qualified_membership_only');
 assert.equal(bacau.activeEntries.length,0);
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

test('1930 official record admits 15 source identities and quarantines misidentified Suceava',()=>{
 const tree=buildHistoricalOhmTree(index,parentage,1930);
 for(const short of ['Jugastru','Moghilău','Tulcin']){
   const node=tree.nodes.get('Județe istorice/Județul '+short);
   assert.equal(node.parentGroup,null);
 }
 for(const short of ['Bacău','Botoșani','Covurlui','Dorohoi','Fălciu','Iași','Neamț',
   'Putna','Roman','Tecuci','Tutova','Vaslui']){
   const node=tree.nodes.get('Județe istorice/Județul '+short);
   assert.equal(node.parentGroup,'Regatul României');
   assert.equal(node.parentEvidence.temporalAssertion,'1930_documentary_snapshot_not_continuity');
   assert.equal(node.parentEvidence.boundaryCertified,false);
   assert.equal(node.activeEntries.length,0);
 }
 assert.equal(buildHistoricalOhmTree(index,parentage,1931).activeLinks.length,3,
   '1930 gazette evidence cannot be extended to 1931');
});
test('Partium membership extends to the documented 27 December 1860 transfer',()=>{
 const early=buildHistoricalOhmTree(index,parentage,1731);
 const partium=buildHistoricalOhmTree(index,parentage,1800);
 const transition=buildHistoricalOhmTree(index,parentage,1848);
 const beforeTransfer=buildHistoricalOhmTree(index,parentage,1860);
 const afterTransfer=buildHistoricalOhmTree(index,parentage,1861);
 assert.equal(early.activeLinks.length,0);
 assert.equal(partium.activeLinks.length,3);
 assert.equal(transition.activeLinks.length,3);
 assert.equal(beforeTransfer.activeLinks.length,3);
 assert.equal(afterTransfer.activeLinks.length,0);
 assert.equal(partium.nodes.get('Comitate istorice/Comitatul Zaránd').parentGroup,null,
   'Zaránd 1732 partition remains unresolved');
});

test('existing Principatele Unite parent gains eleven 1865 county children with no auto-qualified polygon',()=>{
 const tree=buildHistoricalOhmTree(index,parentage,1865);
 const parent=tree.nodes.get('Principatele Unite');
 const expected=['Bacău','Botoșani','Covurlui','Dorohoi','Fălciu','Iași','Putna','Roman',
   'Suceava','Tecuci','Tutova'];
 assert.deepEqual(parent.children.map(c=>c.group).sort(),
   expected.map(c=>'Județe istorice/Județul '+c).sort());
 assert.equal(tree.activeLinks.length,11);
 assert.equal(countRoots(tree.roots),65);
 for(const child of parent.children){
   assert.equal(child.activeEntries.length,0);
   assert.equal(child.parentEvidence.temporalAssertion,
     '1865_annual_documentary_snapshot_not_a_legal_start_or_end');
   assert.equal(uniqueSourceVersionAtYear(child,1865),null);
 }
 assert.equal(tree.nodes.get('Județe istorice/Județul Neamț').parentGroup,null);
 assert.equal(tree.nodes.get('Județe istorice/Județul Vaslui').parentGroup,null);
 assert.equal(buildHistoricalOhmTree(index,parentage,1866).activeLinks.length,0);
});
test('1925 official county list admits 15 source groups, separate Fălticeni/Bukovina identities',()=>{
 const tree=buildHistoricalOhmTree(index,parentage,1925);
 assert.equal(tree.activeLinks.length,15);
 assert.equal(tree.nodes.get('Regatul României').children.length,15);
 assert.equal(tree.nodes.get('Județe istorice/Județul Suceava').parentGroup,null);
 assert.equal(buildHistoricalOhmTree(index,parentage,1890).activeLinks.length,2);
 const suceava=buildHistoricalOhmTree(index,parentage,1890)
   .nodes.get('Județe istorice/Județul Suceava');
 assert.equal(suceava.parentGroup,'Regatul României');
 assert.equal(suceava.parentEvidence.temporalAssertion,
   '1890_county_report_administrative_snapshot');
});
