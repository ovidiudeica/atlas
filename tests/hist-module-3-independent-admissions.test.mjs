import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
import {
 validateIndependentHistoricalAdmissions,
 independentAttestationsForVersion,
 independentMembershipsForVersion,
 independentBridgesForActual,
 independentBridgesForHistorical
} from '../src/data/historicalIndependentAdmissions.mjs';
import {validateHistoricalPilotCatalog} from '../src/data/historicalCatalog.mjs';
import {validateHistoricalQualification} from '../src/data/historicalQualification.mjs';
import {validateHistoricalPeriod} from '../src/data/historicalAdminBridge.mjs';

const base=new URL('../public/data/historical/v1/',import.meta.url);
const read=name=>JSON.parse(readFileSync(new URL(name,base),'utf8'));
const pilot=read('catalog.json'),geometry=read('geometry.geojson');
const qa=read('qualification.json'),admissions=read('admissions.json');
const actualBytes=readFileSync(new URL('../public/data/phase4/catalog.json.gz',import.meta.url));
const actual=JSON.parse(gunzipSync(actualBytes).toString());
const modernShape=readFileSync(new URL('../public/data/phase4/geometry/ro-adm-09-detailed.geojson.gz',import.meta.url));
const histShape=readFileSync(new URL('geometry.geojson',base));
const sum=b=>createHash('sha256').update(b).digest('hex');
const ver=n=>'histogis-v9:version:'+n;

test('HIST3: only a separate qualified-evidence sidecar is added, HistoGIS pilot unchanged',()=>{
 assert.deepEqual(validateHistoricalPilotCatalog(pilot,geometry),{ok:true,errors:[]});
 assert.deepEqual(validateHistoricalQualification(pilot,qa),{ok:true,errors:[]});
 assert.deepEqual(validateIndependentHistoricalAdmissions(pilot,admissions,actual),{ok:true,errors:[]});
 assert.deepEqual(pilot.bridge,[]);
 assert.ok(pilot.versions.every(v=>v.evidenceStatus==='candidate'&&v.boundaryCertification==='not_certified'));
 assert.ok(pilot.hierarchy.every(r=>r.evidenceStatus==='candidate'));
 assert.equal(admissions.coverage.historicalBoundariesLegallyCertified,false);
 assert.deepEqual(admissions.geometryDecisions,[]);
});

test('HIST3: catalog and geometry provenance is pinned to unchanged source bytes',()=>{
 assert.equal(sum(actualBytes),admissions.actualCatalogSha256);
 assert.equal(sum(modernShape),admissions.actualGeometryShardSha256);
 assert.equal(sum(histShape),admissions.historicalGeometryGeojsonSha256);
 assert.equal(admissions.actualSnapshotDate,'2026-10-05');
 assert.equal(actual.certificate,'CERTIFIED_CARTOGRAPHIC_SOURCE_WITH_ACCEPTED_EXCEPTIONS');
 assert.equal(actual.entities.length,4283);
});

test('HIST3: original 1849 constitution attests exactly four memberships and never their full periods',()=>{
 const links=admissions.relationAttestations;
 assert.deepEqual(links.map(r=>r.childVersionId).sort(),[12391,12392,12404,12405].map(ver).sort());
 for(const r of links){
  assert.equal(r.parentVersionId,ver(9915));
  assert.deepEqual(r.attestedAt,{kind:'snapshot',at:{year:1849,month:3,day:4}});
  assert.equal(r.kind,'territorial_membership_not_direct_parentage');
  assert.equal(r.evidenceStatus,'qualified');
  assert.equal(r.fullIntervalCertified,false);
  assert.equal(r.directAdministrativeParentCertified,false);
  assert.equal(r.boundaryCertified,false);
  assert.ok(pilot.hierarchy.some(p=>p.id===r.sourceRelationId&&p.evidenceStatus==='candidate'));
 }
 const parent=independentMembershipsForVersion(admissions,ver(9915));
 assert.equal(parent.length,4);
 assert.equal(independentMembershipsForVersion(admissions,ver(12383)).length,0);
});

test('HIST3: first 1849 law day cannot be backdated into the HistoGIS Bukovina 1849-03-05 version',()=>{
 const v=pilot.versions.find(v=>v.sourceShapeId===9936);
 assert.ok(v);
 assert.equal(v.sourceOriginalType,'Kingdom');
 assert.equal(v.period.start.day,5);
 assert.equal(v.period.start.month,3);
 assert.equal(v.period.start.year,1849);
 const first=independentAttestationsForVersion(admissions,ver(9936),{qualifiedOnly:true});
 assert.equal(first.length,1);
 assert.equal(first[0].verifiedHistoricalType,'Duchy');
 assert.deepEqual(first[0].attestedAt,{kind:'snapshot',at:{year:1861,month:2,day:28}});
 assert.ok(admissions.unresolved.some(x=>x.kind==='date_mismatch'));
 assert.ok(admissions.unresolved.some(x=>x.kind==='type_mismatch'));
 const invalid=structuredClone(admissions);
 invalid.identityAttestations.find(x=>x.historicalVersionId===ver(9936)).attestedAt=
  {kind:'snapshot',at:{year:1849,month:3,day:4}};
 assert.equal(validateIndependentHistoricalAdmissions(pilot,invalid,actual).ok,false);
});

test('HIST3: accepted name facts are snapshots only, with separate unresolved labels',()=>{
 const q=admissions.identityAttestations.filter(x=>x.evidenceStatus==='qualified');
 const pending=admissions.identityAttestations.filter(x=>x.evidenceStatus==='in_review');
 assert.equal(q.length,13);
 assert.equal(pending.length,6);
 assert.ok(q.every(x=>x.attestedAt.kind==='snapshot'&&!x.wholeVersionIntervalCertified));
 assert.ok(q.every(x=>x.boundaryCertified===false));
 assert.ok(pending.some(x=>x.historicalVersionId===ver(12408)));
 assert.equal(independentAttestationsForVersion(admissions,ver(12408),{qualifiedOnly:true}).length,0);
 assert.equal(independentAttestationsForVersion(admissions,ver(12383),{qualifiedOnly:true}).length,1);
});

test('HIST3: five geometrically measured historical/ACTUAL bridges are not successor claims',()=>{
 assert.equal(admissions.bridges.length,5);
 const suceava=independentBridgesForActual(admissions,'osm-r2077868');
 assert.equal(suceava.length,2);
 const district=independentBridgesForHistorical(admissions,
  'histogis-v9:entity:shape-11756');
 assert.equal(district.length,2);
 for(const link of admissions.bridges){
  assert.equal(link.kind,'territorial_overlap');
  assert.equal(link.referenceScope,'verified_intersection_between_source_polygons_only');
  assert.equal(link.evidenceStatus,'qualified');
  assert.equal(link.institutionalContinuityCertified,false);
  assert.equal(link.administrativeSuccessionCertified,false);
  assert.equal(link.identicalBoundaryCertified,false);
  assert.equal(link.legalBoundaryCertified,false);
  assert.equal(link.historicalPeriod.kind,'snapshot');
  assert.equal(link.historicalPeriod.at.year,1907);
  assert.equal(link.geometryComparison.crs,'EPSG:3035');
  const modern=actual.entities.find(x=>x.id===link.actualId);
  assert.ok(modern?.roles.includes('administrative'));
  assert.equal(modern?.geometryShard,'ro-adm-09');
 }
 assert.ok(suceava[0].geometryComparison.historicalCoveragePercent<100);
});

test('HIST3: any artificial legal promotion or fabricated source fails closed',()=>{
 function rejects(change){
  const d=structuredClone(admissions);change(d);
  const v=validateIndependentHistoricalAdmissions(pilot,d,actual);
  assert.equal(v.ok,false,JSON.stringify(v));
 }
 rejects(d=>d.bridges[0].institutionalContinuityCertified=true);
 rejects(d=>d.bridges[0].kind='identical_boundary');
 rejects(d=>d.relationAttestations[0].directAdministrativeParentCertified=true);
 rejects(d=>d.identityAttestations[0].wholeVersionIntervalCertified=true);
 rejects(d=>d.coverage.historicalBoundariesLegallyCertified=true);
 rejects(d=>d.geometryDecisions.push({id:'invented'}));
 rejects(d=>d.sources[0].independentOfHistogis=false);
 rejects(d=>d.bridges[0].actualId='osm-invented-1');
 rejects(d=>d.bridges[0].historicalPeriod={kind:'snapshot',at:{year:1770}});
 rejects(d=>d.unresolved=d.unresolved.filter(x=>x.kind!=='type_mismatch'));
});
