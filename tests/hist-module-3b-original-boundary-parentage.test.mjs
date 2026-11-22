import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {
  validateHistoricalBoundaryReview,
  historicalLawHierarchyAtYear,
  historicalBoundaryIssueForVersion
} from '../src/data/historicalBoundaryReview.mjs';
import {validateHistoricalPilotCatalog} from '../src/data/historicalCatalog.mjs';
import {validateHistoricalQualification} from '../src/data/historicalQualification.mjs';
import {validateTemporalHierarchy} from '../src/data/historicalTemporalHierarchy.mjs';

const dir=new URL('../public/data/historical/v1/',import.meta.url);
const read=name=>JSON.parse(readFileSync(new URL(name,dir),'utf8'));
const catalog=read('catalog.json'),quality=read('qualification.json'),review=read('boundary-parentage-review.json');
const version=n=>'histogis-v9:version:'+n;

test('HIST3b official register is independently sourced and fail-closed',()=>{
 assert.deepEqual(validateHistoricalBoundaryReview(catalog,quality,review),{ok:true,errors:[]});
 assert.deepEqual(validateHistoricalPilotCatalog(catalog),{ok:true,errors:[]});
 assert.deepEqual(validateHistoricalQualification(catalog,quality),{ok:true,errors:[]});
 assert.deepEqual(validateTemporalHierarchy(catalog.versions,catalog.hierarchy),{ok:true,errors:[]});
 assert.equal(catalog.hierarchy.length,52);
 assert.equal(catalog.bridge.length,0);
 assert.ok(catalog.versions.every(v=>v.boundaryCertification==='not_certified'));
 assert.ok(catalog.hierarchy.every(l=>l.evidenceStatus==='candidate'));
});

test('1851 RGBl Nr.117 §2–§4 and Beilage B: exactly 5 Kreise and 36 direct Bezirke',()=>{
 const x=review.legalHierarchy;
 assert.equal(x.claimStatus,'qualified_normative_structure_at_publication_only');
 assert.equal(x.effectiveOperationConfirmed,false);
 assert.equal(x.completeDurationConfirmed,false);
 assert.deepEqual(x.attestedAt,{kind:'snapshot',at:{year:1851,month:5,day:16}});
 assert.deepEqual(x.regions.map(r=>r.originalName),
   ['Hermannstadt','Karlsburg','Klausenburg','Dées','Maros-Vásárhely']);
 assert.deepEqual(x.regions.map(r=>r.children.length),[6,10,6,7,7]);
 assert.ok(x.regions.every(r=>r.lawParentId===version(9915)));
 assert.ok(x.regions.every(r=>r.children.every(c=>
   c.parentId===r.id&&c.qualifiedDirectParentNormativelyAtPublication&&
   c.sourceHistoricalVersionId===null&&c.geometryMissingInHistoGIS)));
 assert.equal(x.regions.flatMap(r=>r.children).length,36);
 assert.equal(review.admissions.directParentsAtNormativePublication,41);
 assert.equal(review.admissions.historicalDirectParentsForFullPeriods,0);
});

test('Only four 1851 circles match HistoGIS versions: Karlsburg stays documentary only',()=>{
 const x=review.legalHierarchy.regions;
 assert.deepEqual(x.map(r=>r.sourceHistoricalShapeId),[12660,null,12657,12659,12658]);
 assert.deepEqual(x.map(r=>r.sourceCatalogType),['County',null,'County','County','County']);
 assert.equal(x[1].sourceHistoricalVersionId,null);
 assert.ok(x[1].children.every(c=>c.sourceHistoricalVersionId===null));
});

test('1851 legislative scheme never leaks into 1815–1849 HistoGIS parentage',()=>{
 assert.deepEqual(historicalLawHierarchyAtYear(review,1835),[]);
 assert.deepEqual(historicalLawHierarchyAtYear(review,1849),[]);
 assert.deepEqual(historicalLawHierarchyAtYear(review,1854),[]);
 const on1851=historicalLawHierarchyAtYear(review,1851);
 assert.equal(on1851.length,5);
 assert.equal(on1851.flatMap(r=>r.children).length,36);
 assert.ok(on1851.every(r=>r.children.every(c=>c.historicalVersionId===null)));
 const original=catalog.hierarchy.filter(r=>r.childVersionId===version(12383));
 assert.equal(original.length,1);
 assert.equal(original[0].evidenceStatus,'candidate');
 assert.equal(original[0].parentVersionId,version(12406));
});

test('All eight independent boundary disputes reproduce HistoGIS EPSG:3035 verdicts',()=>{
 const problem=new Map(quality.relations.filter(r=>
   r.decision!=='spatially_consistent_source_candidate').map(r=>[r.id,r]));
 assert.equal(problem.size,8);
 assert.equal(review.boundaryDisputes.length,8);
 for(const b of review.boundaryDisputes){
  const q=problem.get(b.sourceRelationId);
  assert.ok(q);
  assert.equal(b.sourceTopologyVerdict,q.decision);
  assert.equal(b.outsidePercentEqualArea,q.outsidePercentEqualArea);
  assert.equal(b.legalBoundaryQualified,false);
  assert.equal(b.boundaryLineIndependentlyVectorized,false);
  assert.equal(b.originalGeometryKept,true);
  assert.equal(b.proposedReplacementParentId,null);
  assert.equal(b.proposedReplacementGeometryId,null);
  assert.deepEqual(b.independentGcpFit,[]);
  assert.deepEqual(b.independentGcpHoldout,[]);
 }
 assert.equal(historicalBoundaryIssueForVersion(review,version(12324)).length,1);
 assert.equal(historicalBoundaryIssueForVersion(review,version(12383)).length,1);
});

test('Doboka and Mühlbach: disjoint source parents stay blocked',()=>{
 const blocked=review.boundaryDisputes.filter(r=>
   r.sourceTopologyVerdict==='blocked_spatial_contradiction');
 assert.equal(blocked.length,2);
 assert.deepEqual(blocked.map(r=>r.childVersionId).sort(),[version(12324),version(12383)].sort());
 assert.ok(blocked.every(r=>r.outsidePercentEqualArea===100));
 assert.ok(blocked.every(r=>r.earlierPeriodAdministrativeParentStatus==='blocked_invalid_source_parent'));
 assert.ok(blocked.some(r=>r.qualitativeOriginalEvidence.includes('Dobokáer')));
 assert.ok(blocked.some(r=>r.qualitativeOriginalEvidence.includes('Mühlenbach')));
});

test('Independent period map acquired but lack of FIT/HOLDOUT prevents historical boundary qualification',()=>{
 const raster=review.sources.find(x=>x.id==='hist3b:map:raffelsperger-1841');
 const original=review.sources.find(x=>x.id==='hist3b:law:rgbl-117-1851');
 assert.equal(raster.originalDownloadedAndHashed,true);
 assert.match(raster.archiveSha256,/^[a-f0-9]{64}$/);
 assert.equal(raster.archiveBytes,15084248);
 assert.equal(raster.independentlyGeoreferenced,false);
 assert.equal(original.archiveBytes,800587);
 assert.equal(review.independentGeoreferencing.fit.length,0);
 assert.equal(review.independentGeoreferencing.holdout.length,0);
 assert.equal(review.independentGeoreferencing.holdoutPassed,false);
 assert.equal(review.independentGeoreferencing.boundaryPromotionsPermitted,false);
 assert.equal(review.admissions.newlyCertifiedLegalBoundaryPolygons,0);
 assert.equal(review.admissions.newlyGeneratedPolygons,0);
});

test('Any artificial promotion, missing law child or false independent control fails',()=>{
 function invalid(fn) {
  const changed=structuredClone(review);fn(changed);
  const tested=validateHistoricalBoundaryReview(catalog,quality,changed);
  assert.equal(tested.ok,false,JSON.stringify(tested));
 }
 invalid(d=>d.admissions.historicalDirectParentsForFullPeriods=1);
 invalid(d=>d.admissions.newlyCertifiedLegalBoundaryPolygons=1);
 invalid(d=>d.legalHierarchy.effectiveOperationConfirmed=true);
 invalid(d=>d.legalHierarchy.completeDurationConfirmed=true);
 invalid(d=>d.legalHierarchy.regions[1].sourceHistoricalVersionId=version(12657));
 invalid(d=>d.legalHierarchy.regions[0].children.pop());
 invalid(d=>d.legalHierarchy.regions[0].children[0].sourceHistoricalVersionId=version(12383));
 invalid(d=>d.legalHierarchy.attestedAt={kind:'snapshot',at:{year:1841}});
 invalid(d=>d.sources.find(x=>x.id==='hist3b:source:histogis-1835').independentOfHistoGIS=true);
 invalid(d=>d.sources.find(x=>x.id==='hist3b:map:raffelsperger-1841').independentlyGeoreferenced=true);
 invalid(d=>d.independentGeoreferencing.holdoutPassed=true);
 invalid(d=>d.boundaryDisputes[0].proposedReplacementParentId=version(9915));
 invalid(d=>d.boundaryDisputes[0].legalBoundaryQualified=true);
 invalid(d=>d.boundaryDisputes=d.boundaryDisputes.filter(x=>x.sourceTopologyVerdict!=='blocked_spatial_contradiction'));
 invalid(d=>d.pilotArchiveSha256='0'.repeat(64));
});
