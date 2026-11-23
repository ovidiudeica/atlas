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
test('all audited temporal previews mirror actual unmodified parentage ledger',()=>{
 assert.equal(audit.documentaryParentage.qualifiedDirectLinks,parentage.links.length);
 assert.deepEqual(audit.documentaryParentage.qualifiedParents.sort(),
   [...new Set(parentage.links.map(l=>l.parentSourceGroup))].sort());
 for(const snapshot of audit.currentTreeSnapshots){
   const tree=buildHistoricalOhmTree(index,parentage,snapshot.year);
   assert.equal(tree.activeLinks.length,snapshot.documentaryLinks);
   const roots=Object.values(tree.roots).flat();
   assert.equal(roots.length,snapshot.topLevelSourceGroups);
   assert.deepEqual(snapshot.parents.map(p=>[p.group,[...p.children].sort()]).sort(),
     [...new Map(tree.activeLinks.map(e=>[e.parentSourceGroup,
       tree.activeLinks.filter(l=>l.parentSourceGroup===e.parentSourceGroup)
         .map(l=>l.childSourceGroup).sort()])).entries()].sort());
 }
});
test('1865 parent attachment is only a candidate, with 13 geometry-uncertain OHM versions',()=>{
 const c=audit.priorityCandidate;
 assert.equal(c.parentGroup,'Principatele Unite');
 assert.equal(c.referenceYear,1865);
 assert.equal(c.proposalStatus,'AUDIT_ONLY_DO_NOT_APPLY_TO_ACTIVE_PARENTAGE_REGISTER');
 assert.equal(c.children.length,13);
 assert.equal(new Set(c.children.map(c=>c.childGroup)).size,13);
 assert.equal(parentage.links.filter(l=>l.parentSourceGroup==='Principatele Unite').length,0);
 for(const candidate of c.children){
   const e=index.entries.find(e=>e.sourceGroup===candidate.childGroup);
   assert(e);
   assert.equal(e.sourceRelationId,candidate.sourceRelation);
   assert.equal(e.sourcePeriod.start,'1859');
   assert.equal(e.sourcePeriod.end,null);
   assert.equal(candidate.verdict,'CANDIDATE_NOT_ADMITTED');
 }
});
