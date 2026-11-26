import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {validateSupplementalCatalog,validateSupplementalShard,buildSupplementalTree,supplementalEntryAtYear,loadSupplementalCatalog,loadSupplementalFeature} from '../src/data/historicalSupplemental.mjs';
const root=new URL('../public/data/historical/v1/',import.meta.url);
const read=p=>JSON.parse(readFileSync(new URL(p,root),'utf8'));
const cat=read('supplemental/index.json'),ohm=read('geodata/index.json'),rohgis=read('rohgis/catalog-1930.json');
const walk=nodes=>nodes.flatMap(n=>[n,...walk(n.children)]);
const flat=t=>t.flatMap(f=>f.groups.flatMap(g=>walk(g.roots)));
const entry=id=>cat.entries.find(e=>e.id==='histogis-v9:version:'+id);
test('Supplemental schema is independent and preserves 54 versions, 53 source assets and attribution',()=>{
 assert.deepEqual(validateSupplementalCatalog(cat),{ok:true,errors:[]});
 assert.equal(cat.entries.length,54);assert.equal(cat.assets.length,53);
 assert.equal(cat.entries.filter(e=>e.region==='transylvania').length,34);
 assert.equal(cat.entries.filter(e=>e.region==='bukovina').length,20);
 assert.equal(cat.relations.length,52);
 assert.equal(cat.relations.filter(r=>r.topologicalReviewRequired).length,8);
 assert.equal(entry(9936).geometryId,entry(9970).geometryId);
 assert.equal(entry(9936).entityId,entry(9970).entityId);
 assert.ok(cat.entries.every(e=>e.sourceCitation.license==='CC BY 4.0'&&e.sourcePeriod.sourceOnly&&e.status==='source_candidate_not_certified'));
 assert.equal(rohgis.versions.length,565);
 const protectedIds=new Set([...ohm.entries,...rohgis.versions].map(e=>e.geometryId));
 assert.ok(cat.assets.every(a=>!protectedIds.has(a.id)));
});
test('Geometry shard contains exact source assets, no duplicate coordinate payload or false certification',()=>{
 const signature=g=>createHash('sha256').update(JSON.stringify([g.type,g.coordinates])).digest('hex');
 const signatures=new Set();
 for(const s of cat.geometryShards){
  const bytes=readFileSync(new URL('supplemental/'+s.file,root));
  assert.equal(createHash('sha1').update(Buffer.from('blob '+bytes.length+'\0')).update(bytes).digest('hex'),s.sourceGitBlob);
  const d=JSON.parse(bytes);
  assert.deepEqual(validateSupplementalShard(d,cat,s.file),{ok:true,errors:[]});
  for(const f of d.features){const k=signature(f.geometry);assert.ok(!signatures.has(k));signatures.add(k);}
 }
 assert.equal(signatures.size,53);
 for(const s of ohm.shards)for(const f of read('geodata/'+s.file).features)
   assert.ok(!signatures.has(signature(f.geometry)),'exact cross-source duplicate with OHM');
 for(const s of rohgis.geometryShards)for(const f of read('rohgis/'+s.path).features)
   assert.ok(!signatures.has(signature(f.geometry)),'exact cross-source duplicate with RoHGIS');
});
test('Calendar-year eligibility, candidate relation, search and exceptions are conservative',()=>{
 assert.equal(flat(buildSupplementalTree(cat,1835,false)).length,54);
 assert.equal(flat(buildSupplementalTree(cat,1869,true)).length,10);
 const n=flat(buildSupplementalTree(cat,1869,true)).find(x=>x.entry.id===entry(11361).id);
 assert.equal(n.parent.parentId,entry(9970).id);
 assert.equal(n.parent.qualifiedHistoricalParentage,false);
 const search=flat(buildSupplementalTree(cat,1869,true,'Radautz'));
 assert.ok(search.some(x=>x.entry.id===entry(11361).id));
 assert.ok(search.some(x=>x.entry.id===entry(9970).id));
 assert.ok(!supplementalEntryAtYear(entry(11361),1867));
 assert.ok(supplementalEntryAtYear(entry(11361),1868));
 assert.ok(!supplementalEntryAtYear(entry(11361),1894));
 assert.deepEqual(buildSupplementalTree(cat,1930,true),[]);
 assert.deepEqual(buildSupplementalTree(cat,1814,true),[]);
 for(const year of [1835,1849,1867,1869,1893,1918])for(const n of flat(buildSupplementalTree(cat,year,true)))
  if(n.parent)assert.ok(!n.parent.topologicalReviewRequired&&!n.parent.qualifiedHistoricalParentage);
 const ambiguous=structuredClone(cat),r=ambiguous.relations.find(r=>r.childId===entry(11361).id&&r.parentId===entry(9970).id);
 ambiguous.relations.push({...r,id:r.id+':ambiguous'});
 assert.equal(flat(buildSupplementalTree(ambiguous,1869,true)).find(n=>n.entry.id===entry(11361).id).parent,null);
 assert.ok(!supplementalEntryAtYear({sourcePeriod:{start:'1868-08-31',end:null,sourceOnly:true}},1869));
});
test('Source catalogue rejects certification, invalid periods, rights, geometry and relationship references',()=>{
 for(const mutation of [
   c=>c.legalBoundariesCertified=true,
   c=>c.entries[0].sourceCitation.license='unknown',
   c=>c.entries[0].sourcePeriod.start='1868-02-30',
   c=>c.entries[0].geometryShard='../bad.geojson',
   c=>c.relations[0].qualifiedHistoricalParentage=true,
   c=>c.relations[0].end='1930-12-31',
   c=>c.assets[1].canonicalHash=c.assets[0].canonicalHash
 ]){
  const copy=structuredClone(cat);mutation(copy);
  assert.equal(validateSupplementalCatalog(copy).ok,false);
 }
});
test('Supplemental loader lazy-loads a shared shard and returns one asset for two source versions',async()=>{
 const originalFetch=globalThis.fetch;let calls=[];
 globalThis.fetch=async url=>{
  calls.push(String(url));
  return new Response(readFileSync(new URL(String(url).split('/supplemental/')[1],new URL('supplemental/',root))),{status:200});
 };
 try{
  const c=await loadSupplementalCatalog('/');
  assert.equal(calls.length,1);
  const a=await loadSupplementalFeature(c,entry(9936),'/');
  const b=await loadSupplementalFeature(c,entry(9970),'/');
  assert.equal(a,b);assert.equal(a.id,entry(9936).featureId);assert.equal(calls.length,2);
  assert.equal(a.properties.boundaryCertification,'not_certified');
 }finally{globalThis.fetch=originalFetch;}
});
