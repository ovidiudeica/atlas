import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {buildHistoricalOhmTree,validateOhmParentage} from '../src/data/historicalOhmTree.mjs';

const root=new URL('../',import.meta.url);
const read=path=>JSON.parse(readFileSync(new URL(path,root),'utf8'));
const index=read('public/data/historical/v1/geodata/index.json');
const parentage=read('public/data/historical/v1/ohm-parentage.json');
const qa=read('docs/historical/import/HIST-OHM-TREE.2-QUALIFICATION-QA.json');

test('every OHM group is audited individually with no missing or duplicated source versions',()=>{
 assert.equal(qa.schema,'atlas-historical-ohm-parentage-qualification-v2');
 assert.deepEqual([qa.sourceVersionCount,qa.sourceGroupCount],[139,76]);
 assert.equal(qa.cases.length,76);
 assert.equal(qa.acceptedRelationCount,19);
 const groups=new Set(index.entries.map(e=>e.sourceGroup));
 const reviewed=new Set(qa.cases.map(x=>x.sourceGroup));
 assert.equal(reviewed.size,76);
 assert.deepEqual([...reviewed].sort(),[...groups].sort());
 const versionIds=qa.cases.flatMap(x=>x.sourceVersionIds).sort();
 assert.deepEqual(versionIds,index.entries.map(e=>e.id).sort());
 for(const row of qa.cases){
   const entries=index.entries.filter(e=>e.sourceGroup===row.sourceGroup);
   assert.equal(row.caseId.startsWith('HIST-OHM-TREE.2-'),true);
   assert.deepEqual(row.sourceRelations,entries.map(e=>e.sourceRelationId));
   assert.equal(row.geometryBoundaryCertified,false);
   assert.equal(row.administrativeParentsInferredFromGeometry,false);
   assert.equal(row.sourceOnly,true);
   for(const cite of row.evidenceReferences){
     assert.match(cite.url,/^https:\/\//);
     assert.equal(cite.url,qa.evidenceCatalogue[cite.key].url);
   }
 }
});
test('historical TREE.2 admitted links remain traceable after the 2B source-identity correction',()=>{
 assert.deepEqual(validateOhmParentage(index,parentage),{ok:true,errors:[]});
 const allLinkIds=new Set(parentage.links.map(x=>x.id));
 const admitted=qa.cases.filter(x=>x.acceptedLinkIds.length);
 const held=qa.cases.filter(x=>!x.acceptedLinkIds.length);
 assert.equal(admitted.length,19);
 assert.equal(held.length,57);
 assert.equal(qa.acceptedSourceGroups,admitted.length);
 assert.equal(qa.pendingSourceGroups,held.length);
 const historicalIds=new Set(admitted.flatMap(x=>x.acceptedLinkIds));
 const withdrawnIds=new Set((parentage.retractedLinks||[]).map(x=>x.id));
 assert.equal(historicalIds.size,19);
 assert([...historicalIds].every(id=>allLinkIds.has(id)||withdrawnIds.has(id)),
   'Old qualified evidence remains represented as active or explicitly retracted');
 assert(withdrawnIds.has('ohm-1930-suceava-to-romania'));
 assert.equal(allLinkIds.has('ohm-1930-suceava-to-romania'),false);
 for(const row of held)assert(!row.verdict.startsWith('QUALIFIED_'));
 const stateRoots=qa.cases.filter(x=>x.verdict==='POLITICAL_ENTITY_ROOT');
 assert.equal(stateRoots.length,4);
 for(const row of stateRoots)assert.equal(row.acceptedLinkIds.length,0);
});
test('1930 snapshot membership is independent of temporal evidence for OHM polygons',()=>{
 const tree=buildHistoricalOhmTree(index,parentage,1930);
 const kingdom=tree.nodes.get('Regatul României');
 assert.equal(kingdom.children.length,15);
 assert.equal(tree.activeLinks.length,15);
 const undated=kingdom.children.filter(x=>x.activeEntries.length===0);
 assert.equal(undated.length,12);
 assert(undated.every(node=>node.parentEvidence.temporalAssertion===
   '1930_documentary_snapshot_not_continuity'));
 assert.equal(tree.legalBoundariesCertified,false);
 assert.equal(tree.qualifiedGeometryBorders,0);
 assert.equal(buildHistoricalOhmTree(index,parentage,1931).activeLinks.length,3);
 assert.equal(buildHistoricalOhmTree(index,parentage,1939).activeLinks.length,0);
});
test('Partium transitions, missing Hungarian rulers, Transnistria and Soviet oblasts stay guarded',()=>{
 const interesting={
  'Comitate istorice/Comitatul Zaránd':'PENDING_PARTITIONED_PARENTAGE',
  'Comitate istorice/Comitatul Ung':'PENDING_SOURCE_TEMPORAL_DEFECT',
  'Județe istorice/Județul Jugastru':'PARENT_OUTSIDE_OHM',
  'Județe istorice/Județul Moghilău':'PARENT_OUTSIDE_OHM',
  'Județe istorice/Județul Tulcin':'PARENT_OUTSIDE_OHM',
  'Regiunea Akkerman':'PARENT_OUTSIDE_OHM',
  'Regiunea Ismail':'PARENT_OUTSIDE_OHM',
  'Transcarpatia':'PARENT_OUTSIDE_OHM',
  'Districtul Bucovina':'PARENT_OUTSIDE_OHM'
 };
 for(const [name,status] of Object.entries(interesting)){
   const row=qa.cases.find(x=>x.sourceGroup===name);
   assert.equal(row.verdict,status);
   assert.deepEqual(row.acceptedLinkIds,[]);
 }
 assert.equal(buildHistoricalOhmTree(index,parentage,1800).activeLinks.length,3);
});
