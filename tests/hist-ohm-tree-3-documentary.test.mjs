import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {
 buildHistoricalOhmTree,validateOhmParentage,validateDocumentaryParents,
 isDocumentaryParentId
} from '../src/data/historicalOhmTree.mjs';
const base=new URL('../public/data/historical/v1/',import.meta.url);
const read=p=>JSON.parse(readFileSync(new URL(p,base),'utf8'));
const index=read('geodata/index.json');
const links=read('ohm-parentage.json');
const docs=read('documentary-parents.json');
const tree=year=>buildHistoricalOhmTree(index,links,year,docs);

test('documentary parents: 11 qualified institutions, each absolutely geometry free',()=>{
 assert.deepEqual(validateDocumentaryParents(docs),{ok:true,errors:[]});
 assert.equal(docs.nodes.length,11);
 assert.equal(new Set(docs.nodes.map(n=>n.id)).size,11);
 assert(docs.nodes.every(n=>n.geometryId===null&&
   n.geometryStatus==='NO_GEOMETRY_DOCUMENTARY_NODE'&&
   n.noLegalBoundaryCertification===true));
 for(const doc of docs.nodes){
   assert(isDocumentaryParentId(doc.id));
   assert(doc.evidence.length>0);
   assert(doc.evidence.every(e=>e.url.startsWith('https://')));
   assert(doc.documentedWindows.every(w=>
     w.dateStatus==='EVIDENCE_SCOPE_NOT_INSTITUTIONAL_BIRTH_OR_DEATH'));
 }
 assert.deepEqual(validateOhmParentage(index,links,docs),{ok:true,errors:[]});
 assert.equal(index.entries.length,139);
 assert.equal(index.geometryAssets,125);
 assert.equal(links.links.length,96);
 assert.equal(links.links.filter(l=>l.id.startsWith('ohm-1911-')).length,28);
});

test('year 1911: 28 contemporary Hungarian counties, with no fabricated OHM geometries',()=>{
 const t=tree(1911);
 const hun=t.nodes.get('doc:kingdom-hungary');
 assert(hun?.documentaryOnly);
 assert.equal(hun.geometryId,null);
 assert.equal(hun.versions.length,0);
 assert.equal(hun.activeEntries.length,0);
 assert.equal(hun.children.length,28);
 assert(hun.children.every(c=>c.category==='comitates'&&
   c.parentEvidence.temporalAssertion==='1911_contemporary_named_county_snapshot_only'));
 assert.equal(t.activeLinks.length,30); // 28 Hungarian + Bukovina + Bessarabia
 assert.equal(t.groupCount,76);
 assert.equal(t.sourceVersionCount,139);
 assert.equal(t.assetCount,125);
 assert.equal(t.documentaryNodeCount,3);
 assert.equal(t.documentaryOnlyGeometryCount,0);
 const before=tree(1910),after=tree(1912);
 assert.equal(before.nodes.get('doc:kingdom-hungary').children.length,0);
 assert.equal(after.nodes.get('doc:kingdom-hungary').children.length,0);
 assert.equal(before.nodes.get('Comitate istorice/Comitatul Ung').parentGroup,null,
   'Malformed one-day OHM Ung version remains HOLD');
});

test('year 1942: Transnistrian counties nested only under occupation administration',()=>{
 const t=tree(1942),gov=t.nodes.get('doc:transnistria-governorate');
 assert(gov?.documentaryOnly);
 assert.equal(gov.children.length,3);
 assert.deepEqual(gov.children.map(x=>x.group).sort(),[
   'Județe istorice/Județul Jugastru',
   'Județe istorice/Județul Moghilău',
   'Județe istorice/Județul Tulcin'
 ].sort());
 for(const c of gov.children){
   assert.equal(c.parentEvidence.boundaryCertified,false);
   assert(!c.parentEvidence.id.includes('romania'));
 }
 assert.equal(t.nodes.get('Regatul României').children.length,0);
 assert.equal(tree(1945).nodes.get('doc:transnistria-governorate'),undefined);
});

test('year 1946: USSR / Ukrainian SSR nested documentary chain to oblasts',()=>{
 const t=tree(1946),ussr=t.nodes.get('doc:ussr');
 const ukr=t.nodes.get('doc:ukrainian-ssr');
 assert(ussr&&ukr);
 assert.equal(ukr.parentGroup,'doc:ussr');
 assert.equal(t.nodes.get('RSS Moldovenească').parentGroup,'doc:ussr');
 assert.deepEqual(ukr.children.map(x=>x.group).sort(),[
   'Regiunea Cernăuți','Regiunea Ismail','Regiunea Transcarpatia'
 ].sort());
 assert(!ukr.children.some(x=>x.group==='Regiunea Akkerman'));
 assert.equal(t.activeLinks.length,5);
 assert.equal(t.documentaryNodeCount,2);
 assert.equal(t.documentaryOnlyGeometryCount,0);
});

test('no wartime extrapolation of Ukrainian SSR oblast administration',()=>{
 const late1940=tree(1940);
 const sov=late1940.nodes.get('doc:ukrainian-ssr');
 assert(sov);
 assert.equal(sov.children.length,3); // Akkerman, Izmail, Chernivtsi: within calendar year
 assert.equal(tree(1942).nodes.get('doc:ukrainian-ssr').children.length,0);
 assert.equal(tree(1950).nodes.get('doc:ukrainian-ssr').children.length,3);
});

test('Galician and imperial hierarchy is time scoped without political alias conflation',()=>{
 const h1835=tree(1835);
 assert.equal(h1835.nodes.get('Districtul Bucovina').parentGroup,'doc:galicia-lodomeria');
 assert.equal(h1835.nodes.get('doc:galicia-lodomeria').parentGroup,'doc:austrian-empire');
 assert.equal(h1835.nodes.get('Bucovina').parentGroup,null);
 assert.equal(h1835.nodes.get('Frontiera Militară a Banatului').parentGroup,
   'doc:habsburg-military-frontier');
 const h1760=tree(1760);
 assert.equal(h1760.nodes.get('Banatul Timișoarei').parentGroup,
   'doc:habsburg-monarchy');
 const h1890=tree(1890);
 assert.equal(h1890.nodes.get('Bucovina').parentGroup,'doc:austrian-crownlands');
 assert.equal(h1890.nodes.get('Gubernia Basarabia').parentGroup,'doc:russian-empire');
 assert.equal(h1890.nodes.get('doc:kingdom-hungary').children.length,0);
});

test('registry refuses undocumented, duplicate, geometry-bearing and temporally invalid institutions',()=>{
 const invalid=edit=>{
   const copy=structuredClone(docs);edit(copy);
   assert.equal(validateDocumentaryParents(copy).ok,false);
 };
 invalid(x=>{x.nodes[0].geometryId='geom:invented'});
 invalid(x=>{x.nodes[0].geometryStatus='CERTIFIED'});
 invalid(x=>{x.nodes[0].documentedWindows[0].end='invalid-date'});
 invalid(x=>{x.nodes[0].evidence=[]});
 invalid(x=>{x.nodes.push(structuredClone(x.nodes[0]))});
 const missing=structuredClone(docs);
 missing.nodes=missing.nodes.filter(x=>x.id!=='doc:kingdom-hungary');
 assert.equal(validateOhmParentage(index,links,missing).ok,false);
 const outside=structuredClone(links);
 outside.links.find(x=>x.parentSourceGroup==='doc:kingdom-hungary').start='1800-01-01';
 assert.equal(validateOhmParentage(index,outside,docs).ok,false);
 const conflict=structuredClone(links);
 const child='Regiunea Ismail';
 conflict.links.push({...conflict.links.find(x=>x.childSourceGroup===child),
   id:'fabricated_conflict',parentSourceGroup:'doc:ussr'});
 assert.equal(validateOhmParentage(index,conflict,docs).ok,false);
 const cyclic=structuredClone(links);
 cyclic.links.push({
   ...cyclic.links.find(x=>x.childSourceGroup==='doc:ukrainian-ssr'),
   id:'invented_cycle',childSourceGroup:'doc:ussr',parentSourceGroup:'doc:ukrainian-ssr'
 });
 assert.equal(validateOhmParentage(index,cyclic,docs).ok,false);
});
