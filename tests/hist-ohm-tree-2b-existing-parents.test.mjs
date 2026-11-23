import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {buildHistoricalOhmTree,validateOhmParentage} from '../src/data/historicalOhmTree.mjs';
const root=new URL('../',import.meta.url);
const read=p=>JSON.parse(readFileSync(new URL(p,root),'utf8'));
const index=read('public/data/historical/v1/geodata/index.json');
const ledger=read('public/data/historical/v1/ohm-parentage.json');
const qa=read('docs/historical/import/HIST-OHM-TREE.2B-QUALIFICATION-QA.json');
const group=n=>'Județe istorice/Județul '+n;

test('2B individual original-source review never invents Neamț/Vaslui 1865 verification',()=>{
 assert.equal(qa.schema,'atlas-historical-ohm-tree-2b-qualification-v1');
 assert.deepEqual([qa.originalOHMVersions,qa.originalGeometryAssets,qa.sourceGroups],[139,125,76]);
 assert.deepEqual([qa.previousParentageLinks,qa.currentParentageLinks],[19,46]);
 assert.deepEqual([qa.new1865Memberships,qa.held1865Memberships,qa.new1890Memberships,
   qa.new1925Memberships,qa.partiumExtendedLinks,qa.withdrawnHistoricalIdentityMatches],
   [11,2,2,15,3,1]);
 assert.equal(qa.cases1865.length,13);
 assert.equal(new Set(qa.cases1865.map(x=>x.sourceGroup)).size,13);
 for(const row of qa.cases1865){
   const e=index.entries.find(v=>v.sourceGroup===row.sourceGroup);
   assert(e);
   assert.equal(row.ohmSourceRelationId,e.sourceRelationId);
   assert.equal(row.geometryCertifiedFor1865,false);
   assert.equal(row.manualFacsimileVisualVerification,'NOT_COMPLETED_ORIGINAL_PDF_VISUAL_ACCESS_UNAVAILABLE');
   if(row.admissionId){
     assert.equal(row.membershipDecision,'ADMIT_DOCUMENTARY_1865_SNAPSHOT_ONLY');
     assert(ledger.links.some(l=>l.id===row.admissionId));
   } else {
     assert.equal(row.membershipDecision,'HOLD_NOT_ADMITTED');
     assert(['Neamț','Vaslui'].some(name=>row.sourceGroup===group(name)));
   }
 }
 assert.equal(qa.cases1865.filter(x=>x.admissionId).length,11);
 assert.deepEqual(qa.cases1865.filter(x=>!x.admissionId).map(x=>x.originalHistoricalCountyName).sort(),
   ['Neamț','Vaslui']);
});
test('the 2B register has no temporal parent overlaps, fabricated legal boundaries or source mutations',()=>{
 assert.deepEqual(validateOhmParentage(index,ledger),{ok:true,errors:[]});
 assert.equal(ledger.links.length,46);
 assert.equal(buildHistoricalOhmTree(index,ledger,1890).parentageTimeResolution,
   'calendar_year_documented_at_some_point');
 assert.deepEqual(buildHistoricalOhmTree(index,ledger,1890).ambiguousAnnualParents,[]);
 assert.equal(qa.cases1890.length,2);
 assert.equal(qa.cases1925.length,15);
 assert.equal(qa.transylvaniaPartium.length,3);
 assert(ledger.links.every(l=>l.boundaryCertified===false&&l.sourceIdentityCertified===false));
 assert.equal(qa.geometryChanged,false);
 assert.equal(qa.actualDataChanged,false);
 const count=year=>buildHistoricalOhmTree(index,ledger,year).activeLinks.length;
 assert.deepEqual([1800,1848,1860,1861,1865,1866,1890,1891,1925,1926,1930,1931,1939]
   .map(count),[3,3,3,0,11,0,2,0,15,3,15,3,0]);
});
test('Moldavian Suceava 1859 remains 1865 and 1890, not falsely 1925/1930 Bukovina Suceava',()=>{
 const old=group('Suceava');
 assert.equal(buildHistoricalOhmTree(index,ledger,1865).nodes.get(old).parentGroup,
   'Principatele Unite');
 assert.equal(buildHistoricalOhmTree(index,ledger,1890).nodes.get(old).parentGroup,
   'Regatul României');
 assert.equal(buildHistoricalOhmTree(index,ledger,1925).nodes.get(old).parentGroup,null);
 assert.equal(buildHistoricalOhmTree(index,ledger,1930).nodes.get(old).parentGroup,null);
 assert.equal(ledger.retractedLinks.length,1);
 assert.equal(ledger.retractedLinks[0].id,'ohm-1930-suceava-to-romania');
 assert.equal(ledger.retractedLinks[0].status,'RETRACTED_IDENTITY_CONFLATION');
 assert(ledger.retractedLinks[0].retractedReason.includes('Fălticeni'));
});
test('dated Partium administrative belonging ends before 27 December 1860',()=>{
 const partium=ledger.links.filter(l=>l.id.startsWith('ohm-partium-1733-'));
 assert.equal(partium.length,3);
 assert(partium.every(l=>l.start==='1733-02-16'&&l.end==='1860-12-26'));
 assert(partium.every(l=>l.temporalAssertion==='documented_partium_administration_up_to_1860_transition'));
 assert.equal(buildHistoricalOhmTree(index,ledger,1860).activeLinks.length,3);
 assert.equal(buildHistoricalOhmTree(index,ledger,1861).activeLinks.length,0);
});
test('no incomplete OHM polygon is promoted to an active checked version by documentary parentage',()=>{
 for(const y of [1865,1890,1925,1930]){
   const t=buildHistoricalOhmTree(index,ledger,y);
   const withUndatedGeometry=[...t.nodes.values()].filter(n=>n.parentGroup&&
     n.versions.some(v=>v.sourcePeriod.end===null));
   assert(withUndatedGeometry.length>0);
   assert(withUndatedGeometry.every(n=>n.activeEntries.length===0));
   assert.equal(t.qualifiedGeometryBorders,0);
   assert.equal(t.legalBoundariesCertified,false);
 }
});

test('time-specific documentary snapshot is never asserted as July 1 membership',()=>{
 for(const [year,expected] of [[1865,11],[1890,2],[1925,15],[1930,15]]){
   const tree=buildHistoricalOhmTree(index,ledger,year);
   assert.equal(tree.activeLinks.length,expected);
   assert.equal(tree.referenceDate,year+'-07-01');
   assert.equal(tree.parentageTimeResolution,'calendar_year_documented_at_some_point');
 }
 const links1890=buildHistoricalOhmTree(index,ledger,1890).activeLinks;
 assert(links1890.every(x=>x.start==='1890-10-15'));
 const links1925=buildHistoricalOhmTree(index,ledger,1925).activeLinks;
 assert(links1925.every(x=>x.start==='1925-10-07'));
 assert.equal(links1890.some(x=>x.start<='1890-07-01'),false);
 assert.equal(links1925.some(x=>x.start<='1925-07-01'),false);
});
test('multiple non-overlapping direct parents within a single year do not fabricate a unique parent',()=>{
 const copy=structuredClone(ledger);
 const first=copy.links.find(x=>x.id==='ohm-1925-bacau-to-regatul-romaniei');
 assert(first);
 copy.links.push({...first,id:'ohm-test-temporal-change',
   start:'1925-01-01',end:'1925-03-31',
   parentSourceGroup:'Principatele Unite'});
 assert.deepEqual(validateOhmParentage(index,copy),{ok:true,errors:[]});
 const t=buildHistoricalOhmTree(index,copy,1925);
 assert(t.ambiguousAnnualParents.includes(first.childSourceGroup));
 assert.equal(t.nodes.get(first.childSourceGroup).parentGroup,null);
 assert.equal(t.activeLinks.length,14);
});
