import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  validateHistoricalQualification, buildHistoricalReviewTree,
  historicalDateInPeriod
} from '../src/data/historicalQualification.mjs';
import { validateHistoricalPilotCatalog } from '../src/data/historicalCatalog.mjs';

const dir=new URL('../public/data/historical/v1/', import.meta.url);
const catalog=JSON.parse(readFileSync(new URL('catalog.json',dir),'utf8'));
const qualification=JSON.parse(readFileSync(new URL('qualification.json',dir),'utf8'));
const geometry=JSON.parse(readFileSync(new URL('geometry.geojson',dir),'utf8'));
const vn=n=>'histogis-v9:version:'+n;

test('geometry and qualification payloads are complete, sourced and non-certified',()=>{
  assert.deepEqual(validateHistoricalPilotCatalog(catalog,geometry),{ok:true,errors:[]});
  assert.deepEqual(validateHistoricalQualification(catalog,qualification),{ok:true,errors:[]});
  assert.deepEqual(qualification.counts,{
    blocked_spatial_contradiction:2,
    requires_boundary_reconciliation:6,
    spatially_consistent_source_candidate:44
  });
  assert.equal(qualification.relations.length,52);
  assert.ok(qualification.relations.every(r=>r.qualifiedAsHistoricalBoundary===false));
  assert.equal(qualification.evaluation.projection,'EPSG:3035');
  assert.equal(catalog.coverage.historicalBoundariesCertified,false);
  assert.deepEqual(catalog.bridge,[]);
});

test('two completely disjoint proposed direct parents never enter the review tree',()=>{
  const active=buildHistoricalReviewTree(catalog,qualification,'1835-07-01');
  const rejected=active.rejected.map(r=>r.relationId);
  assert.equal(active.rejected.length,2);
  assert.ok(rejected.some(id=>id.includes(':12324:12328:')));
  assert.ok(rejected.some(id=>id.includes(':12383:12406:')));
  assert.ok(active.unlinked.some(v=>v.id===vn(12324)));
  assert.ok(active.unlinked.some(v=>v.id===vn(12383)));
  for(const edges of active.children.values()){
    assert.ok(edges.every(e=>!rejected.includes(e.relationId)));
    assert.ok(edges.every(e=>e.candidate===true));
  }
  assert.equal(active.qualifiedRelations,0);
});

test('documented 1835 versus post-1850 windows are not mixed or interpolated',()=>{
  const old=buildHistoricalReviewTree(catalog,qualification,'1835-07-01');
  const reform=buildHistoricalReviewTree(catalog,qualification,'1852-07-01');
  const late=buildHistoricalReviewTree(catalog,qualification,'1910-07-01');
  assert.ok(old.roots.some(v=>v.sourceShapeId===9915));
  assert.ok(!old.roots.some(v=>v.sourceShapeId===9936));
  assert.ok(reform.roots.some(v=>v.sourceShapeId===9915));
  assert.ok(reform.roots.some(v=>v.sourceShapeId===9936));
  assert.ok(late.roots.some(v=>v.sourceShapeId===9970));
  assert.ok(!late.roots.some(v=>v.sourceShapeId===9915));
  assert.ok(!old.children.has(vn(9970)));
  assert.ok(!late.children.has(vn(9915)));
});

test('calendar validity and exact source dates are preserved',()=>{
  const first=catalog.versions.find(v=>v.sourceShapeId===9936);
  const second=catalog.versions.find(v=>v.sourceShapeId===9970);
  assert.ok(historicalDateInPeriod(first.period,'1867-12-21'));
  assert.ok(!historicalDateInPeriod(first.period,'1867-12-22'));
  assert.ok(historicalDateInPeriod(second.period,'1867-12-22'));
  assert.ok(!historicalDateInPeriod(second.period,'1867-12-21'));
  assert.equal(historicalDateInPeriod(first.period,'1867-02-30'),false);
  assert.throws(()=>buildHistoricalReviewTree(catalog,qualification,'1835-13-01'),/Invalid historical review date/);
});

test('undocumented/false qualifications must fail closed',()=>{
  const extra=structuredClone(qualification);
  extra.relations.push(extra.relations[0]);
  assert.equal(validateHistoricalQualification(catalog,extra).ok,false);
  const promoted=structuredClone(qualification);
  promoted.relations[0].qualifiedAsHistoricalBoundary=true;
  assert.equal(validateHistoricalQualification(catalog,promoted).ok,false);
  const changed=structuredClone(qualification);
  changed.sourceArchiveSha256='0'.repeat(64);
  assert.equal(validateHistoricalQualification(catalog,changed).ok,false);
  const removed=structuredClone(qualification);
  removed.relations.pop();
  assert.equal(validateHistoricalQualification(catalog,removed).ok,false);
  const warped=structuredClone(qualification);
  warped.relations.find(x=>x.decision==='blocked_spatial_contradiction').outsidePercentEqualArea=10;
  assert.equal(validateHistoricalQualification(catalog,warped).ok,false);
});
