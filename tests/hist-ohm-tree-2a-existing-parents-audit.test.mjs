import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {buildHistoricalOhmTree} from '../src/data/historicalOhmTree.mjs';

const root=new URL('../',import.meta.url);
const read=p=>JSON.parse(readFileSync(new URL(p,root),'utf8'));
const index=read('public/data/historical/v1/geodata/index.json');
const parentage=read('public/data/historical/v1/ohm-parentage.json');
const audit=read('docs/historical/import/HIST-OHM-TREE.2A-EXISTING-PARENTS-AUDIT.json');

test('existing-parent audit covers exactly the 18 higher-level OHM groups',()=>{
 assert.equal(audit.schema,'atlas-historical-ohm-existing-parents-audit-v1');
 assert.deepEqual([audit.sourceIndex.entitySourceGroups,audit.sourceIndex.highLevelSourceGroups,
   audit.sourceIndex.countyGroups,audit.sourceIndex.comitateGroups],[76,18,19,39]);
 assert.deepEqual([audit.sourceIndex.sourceVersions,audit.sourceIndex.uniqueGeometryAssets],[139,125]);
 const groups=new Set(index.entries.filter(e=>
   !e.sourceGroup.startsWith('Județe istorice/')&&
   !e.sourceGroup.startsWith('Comitate istorice/')).map(e=>e.sourceGroup));
 assert.equal(groups.size,18);
 assert.deepEqual([...new Set(audit.existingParents.map(p=>p.group))].sort(),[...groups].sort());
});
test('2A snapshots are preserved as immutable 19-link historical baselines',()=>{
 assert.equal(audit.documentaryParentage.qualifiedDirectLinks,19);
 assert.deepEqual([...audit.documentaryParentage.qualifiedParents].sort(),
   ['Regatul României','Transilvania'].sort());
 for(const snapshot of audit.currentTreeSnapshots){
   assert.equal(snapshot.documentaryLinks,
     snapshot.parents.reduce((sum,p)=>sum+p.children.length,0));
   assert.equal(snapshot.topLevelSourceGroups,76-snapshot.documentaryLinks);
 }
 // A baseline audit is NOT asserted to match the new live 2B register.
 const historicLinks=parentage.links.filter(l=>!l.id.startsWith('doc-')&&!l.id.startsWith('ohm-1911-'));
 assert.equal(historicLinks.length,46);
 assert.equal(parentage.links.length,96,'TREE.3 adds fifty new links without rewriting 2A/2B evidence');
});

test('1865 parent attachment is only a candidate, with 13 geometry-uncertain OHM versions',()=>{
 const c=audit.priorityCandidate;
 assert.equal(c.parentGroup,'Principatele Unite');
 assert.equal(c.referenceYear,1865);
 assert.equal(c.proposalStatus,'AUDIT_ONLY_DO_NOT_APPLY_TO_ACTIVE_PARENTAGE_REGISTER');
 assert.equal(c.children.length,13);
 assert.equal(new Set(c.children.map(c=>c.childGroup)).size,13);
 assert.equal(parentage.links.filter(l=>l.parentSourceGroup==='Principatele Unite').length,11,
   '2B admitted individually verified 1865 links after the 2A proposal');
 assert.equal(c.children.filter(x=>parentage.links.some(l=>
   l.parentSourceGroup==='Principatele Unite'&&
   l.childSourceGroup===x.childGroup)).length,11);
 for(const candidate of c.children){
   const e=index.entries.find(e=>e.sourceGroup===candidate.childGroup);
   assert(e);
   assert.equal(e.sourceRelationId,candidate.sourceRelation);
   assert.equal(e.sourcePeriod.start,'1859');
   assert.equal(e.sourcePeriod.end,null);
   assert.equal(candidate.verdict,'CANDIDATE_NOT_ADMITTED');
 }
});
