import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import test from 'node:test';

const root=fileURLToPath(new URL('../',import.meta.url));
const read=p=>readFileSync(resolve(root,p));
const parse=p=>JSON.parse(read(p).toString('utf8'));
const digest=p=>createHash('sha256').update(read(p)).digest('hex');
const ohmPath='public/data/historical/v1/geodata/index.json';
const rohgisPath='public/data/historical/v1/rohgis/catalog-1930.json';
const auditPath='public/data/historical/v1/reconciliation/ohm-rohgis-1930.json';
const ohm=parse(ohmPath);
const rohgis=parse(rohgisPath);
const evidence=parse(auditPath);
const normalise=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'')
  .toLowerCase().replace(/[șş]/g,'s').replace(/[țţ]/g,'t');
const ohmById=new Map(ohm.entries.map(v=>[v.id,v]));
const roById=new Map(rohgis.versions.map(v=>[v.entityId,v]));

test('TREE.5 is strictly an additive evidence sidecar, source snapshots unchanged',()=>{
  assert.equal(evidence.schema,'hist-ohm-tree5-rohgis-1930-cross-source-reconciliation-v1');
  assert.equal(evidence.year,1930);
  assert.equal(evidence.provenance.ohmIndexSha256,digest(ohmPath));
  const legacy=structuredClone(rohgis);
  for(const v of legacy.versions)if(v.kind!=='judet'){v.kind='plasa';delete v.sourceRank;}
  assert.equal(evidence.provenance.rohgisIndexSha256,createHash('sha256').update(JSON.stringify(legacy)).digest('hex'));
  assert.equal(ohm.entries.length,139);
  assert.equal(rohgis.versions.length,565);
  assert.equal(new Set(ohm.entries.map(e=>e.geometryId)).size,125);
  assert.equal(new Set(rohgis.versions.map(e=>e.geometryId)).size,565);
  assert.equal(evidence.counters.sharedGeometryIdPromotions,0);
  assert.equal(evidence.exactGeometryScreen.decision,'NO_CROSS_SOURCE_GEOMETRY_ID_REUSE');
});
test('TREE.5 has 16 individually traced county cases, 3 temporally scoped and 13 unknown end dates',()=>{
  assert.equal(evidence.cases.length,16);
  const names=new Set();
  let explicit1930=0,missingEnd=0,disjointNames=0;
  for(const c of evidence.cases){
    assert.ok(!names.has(c.nameRo),'duplicate county case '+c.nameRo);
    names.add(c.nameRo);
    const o=ohmById.get(c.ohmId),r=roById.get(c.rohgisEntityId);
    assert.ok(o&&r,'unresolved source version');
    assert.equal(r.kind,'judet');
    assert.equal(normalise(c.nameRo),normalise(r.nameRo));
    assert.equal(normalise(c.nameRo),normalise(o.sourceGroup.split('Județul ')[1]));
    assert.deepEqual(c.ohmPeriod,{start:o.sourcePeriod.start,end:o.sourcePeriod.end});
    assert.equal(c.sourceProvenance.ohmOriginalSha256,o.sourceFileSha256);
    assert.equal(c.sourceProvenance.rohgisOriginalHashSha256,r.sourceHashSha256);
    assert.deepEqual(c.geometryIds,{ohm:o.geometryId,rohgis:r.geometryId});
    assert.equal(c.historicalIdentityCertified,false);
    assert.equal(c.legalBoundaryCertified,false);
    assert.equal(c.sharedGeometryIdEligible,false);
    assert.equal(c.geometricComparison.topologicallyEqual,false);
    assert.ok(c.geometricComparison.intersectionOverUnion>=0);
    assert.ok(c.geometricComparison.intersectionOverUnion<1);
    assert.ok(c.geometricComparison.symmetricDifferenceSqKm>0);
    assert.ok(c.geometricComparison.boundaryHausdorffKm>0);
    if(c.temporalEvidenceStatus.startsWith('OHM_SOURCE_PERIOD_CONTAINS_1930')){
      explicit1930++;
      assert.ok(o.sourcePeriod.end && o.sourcePeriod.start.slice(0,4)<='1930' && o.sourcePeriod.end.slice(0,4)>='1930');
    }else{
      missingEnd++;
      assert.equal(o.sourcePeriod.end,null);
      assert.equal(c.temporalEvidenceStatus,'END_UNKNOWN_CANNOT_INFER_1930');
    }
    if(c.correspondenceStatus==='GEOGRAPHICALLY_DIFFERENT_HOMONYM')disjointNames++;
  }
  assert.deepEqual([explicit1930,missingEnd,disjointNames],[3,13,1]);
  const suceava=evidence.cases.find(x=>x.nameRo==='Suceava');
  assert.ok(suceava.geometricComparison.intersectionOverUnion<0.001);
  assert.ok(evidence.suceavaAlternativesNotIdentity.some(x=>x.nameRo==='Baia'&&x.intersectionOverUnion>0.6));
});
test('TREE.5 individually disposes all 704 source versions with no cross-family IDs',()=>{
  assert.equal(evidence.rohgisDispositions.length,565);
  assert.equal(evidence.ohmDispositions.length,139);
  const oid=new Set(),rid=new Set();
  for(const x of evidence.ohmDispositions){
    assert.ok(!oid.has(x.id));
    oid.add(x.id);
    assert.equal(x.crossFamilySharedGeometryId,false);
    assert.equal(ohmById.get(x.id)?.geometryId,x.geometryId);
  }
  for(const x of evidence.rohgisDispositions){
    assert.ok(!rid.has(x.id));
    rid.add(x.id);
    assert.equal(x.crossFamilySharedGeometryId,false);
    assert.equal(roById.get(x.id)?.geometryId,x.geometryId);
  }
  assert.equal(evidence.rohgisDispositions.filter(x=>x.disposition==='NO_OHM_PLASA_TIER').length,494);
  assert.equal(evidence.rohgisDispositions.filter(x=>x.disposition==='NO_OHM_COUNTY_SAME_NAME').length,55);
  assert.equal(evidence.rohgisDispositions.filter(x=>x.disposition==='SAME_NAME_COUNTY_CASE_GEOMETRY_DIFFERENT').length,16);
  assert.equal(evidence.ohmDispositions.filter(x=>x.disposition==='SAME_NAME_COUNTY_CASE_GEOMETRY_DIFFERENT').length,16);
  assert.equal(evidence.ohmDispositions.filter(x=>x.disposition==='OCCUPATION_COUNTY_OUTSIDE_1930_OR_NAME_UNMATCHED').length,3);
});
// A necessary condition for identical geometry is equal bounding box in the
// same CRS. This gate screens ALL 139*565 source-version combinations, not only
// matching names. Rounded boxes are a candidate prefilter, not an equality test.
const bbox=geom=>{
 const a=[Infinity,Infinity,-Infinity,-Infinity];
 function visit(x){
   if(typeof x[0]==='number'){
     a[0]=Math.min(a[0],x[0]);a[1]=Math.min(a[1],x[1]);
     a[2]=Math.max(a[2],x[0]);a[3]=Math.max(a[3],x[1]);
   }else for(const y of x)visit(y);
 }
 visit(geom.coordinates);
 return a.map(x=>x.toFixed(8)).join(',');
};
test('TREE.5 checks all 78,535 exact-equality candidate boxes on unmodified EPSG:4326 shards',()=>{
 const ohmBoxes=[];
 for(const shard of ohm.shards){
   const fc=parse('public/data/historical/v1/geodata/'+shard.file);
   assert.equal(fc.type,'FeatureCollection');
   for(const f of fc.features)ohmBoxes.push([f.id,bbox(f.geometry)]);
 }
 const roBoxes=[];
 for(const shard of rohgis.geometryShards){
   const fc=parse('public/data/historical/v1/rohgis/'+shard.path);
   assert.equal(fc.type,'FeatureCollection');
   for(const f of fc.features)roBoxes.push([f.id,bbox(f.geometry)]);
 }
 assert.equal(ohmBoxes.length,139);
 assert.equal(roBoxes.length,565);
 const set=new Map();
 for(const [id,b] of roBoxes){
   if(!set.has(b))set.set(b,[]);
   set.get(b).push(id);
 }
 const matches=ohmBoxes.flatMap(([id,b])=>(set.get(b)||[]).map(other=>[id,other]));
 assert.equal(ohmBoxes.length*roBoxes.length,78535);
 assert.deepEqual(matches,[]);
 assert.equal(evidence.counters.strictBoundingBoxPrefilterPairs,0);
 assert.equal(evidence.counters.topologicallyEqualPairs,0);
});