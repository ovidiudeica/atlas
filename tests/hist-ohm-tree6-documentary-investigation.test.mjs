import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import test from 'node:test';

const root=fileURLToPath(new URL('../',import.meta.url));
const read=p=>JSON.parse(readFileSync(new URL('../'+p,import.meta.url),'utf8'));
const previous=read('public/data/historical/v1/reconciliation/ohm-rohgis-1930.json');
const evidence=read('public/data/historical/v1/reconciliation/ohm-rohgis-1930-documentary.json');
const ohm=read('public/data/historical/v1/geodata/index.json');
const rohgis=read('public/data/historical/v1/rohgis/catalog-1930.json');
const oldById=new Map(ohm.entries.map(x=>[x.id,x]));
const oldCasesById=new Map(previous.cases.map(x=>[x.ohmId,x]));
const newById=new Map(rohgis.versions.map(x=>[x.entityId,x]));

test('TREE.6: 13 open-end cases verified individually against immutable OHM/RoHGIS source versions',()=>{
 assert.equal(evidence.schema,'hist-ohm-tree6-documentary-reconciliation-v1');
 assert.equal(evidence.status,'SOURCE_ONLY_PARTIAL_DOCUMENTARY_QUALIFICATION_NO_BOUNDARY_CERTIFICATION');
 assert.equal(evidence.scope.ohmOpenEndedCases,13);
 assert.deepEqual(evidence.scope.priorityCases,['Suceava','Neamț']);
 assert.equal(evidence.scope.remainingCases,11);
 assert.equal(evidence.cases.length,13);
 const names=new Set();
 for(const c of evidence.cases){
  assert.ok(!names.has(c.nameRo),c.nameRo);names.add(c.nameRo);
  const original=oldById.get(c.ohmId),older=oldCasesById.get(c.ohmId);
  const rhs=newById.get(c.rohgisId);
  assert.ok(original&&older&&rhs,'original source version and previous comparison exist');
  assert.equal(c.ohmEnd,null);
  assert.equal(original.sourcePeriod.end,null);
  assert.equal(original.sourcePeriod.start,'1859');
  assert.equal(c.nameRo,older.nameRo);
  assert.equal(c.rohgisId,older.rohgisEntityId);
  assert.equal(rhs.kind,'judet');
  assert.equal(c.officiallyNamed1930,true);
  assert.equal(c.geometryIdSharingAdmitted,false);
  assert.equal(c.legalBoundaryCertified,false);
  assert.equal(c.geometricComparison.iou,older.geometricComparison.intersectionOverUnion);
  assert.equal(c.geometricComparison.ohmOnlySqKm,older.geometricComparison.onlyOhmSqKm);
  assert.equal(c.geometricComparison.rohgisOnlySqKm,older.geometricComparison.onlyRohgisSqKm);
  assert.ok(c.officialPlasi1930>=1&&c.officialPlasi1930<=5);
  for(const neighbor of c.geometricComparison.oldOHMResidualIn1930Counties){
   assert.ok(neighbor.overlapSqKm>0);
   assert.equal(neighbor.interpretation,'SPATIAL_ONLY');
  }
  assert.ok(c.individualFinding.length>30);
 }
 assert.equal(evidence.cases.reduce((sum,x)=>sum+x.officialPlasi1930,0),38);
 assert.equal(new Set(previous.cases.filter(x=>x.ohmPeriod.end===null).map(x=>x.ohmId)).size,13);
 assert.deepEqual(names,new Set(['Bacău','Botoșani','Covurlui','Dorohoi','Fălciu','Iași','Neamț','Putna','Roman','Suceava','Tecuci','Tutova','Vaslui']));
});
test('TREE.6: Suceava Moldavian name succession is not a RoHGIS Bukovinian same-name identity',()=>{
 const c=evidence.cases.find(x=>x.nameRo==='Suceava');
 assert.equal(c.isSameInstitutionAs1930NamedCounty,false);
 assert.equal(c.evidenceLevel,'CONTEMPORARY_RENAMING_CONFIRMED');
 assert.equal(evidence.situationSuceava.different1930BucovinianSuceava,true);
 assert.equal(evidence.situationSuceava.moldavianNameYearEnd,1923);
 assert.equal(evidence.situationSuceava.exact1923DayUnresolved,true);
 assert.equal(evidence.situationSuceava.equivalenceOfGeometry,false);
 assert.ok(evidence.situationSuceava.oldOHMOverlaySqKm.Baia>2100);
 assert.ok(evidence.situationSuceava.oldOHMOverlaySqKm['Neamț']>790);
 assert.ok(evidence.situationSuceava.oldOHMOverlaySqKm['Câmpulung']>380);
});
test('TREE.6: Neamț 1926/1930 report events remain distinct from 1936 failed proposals',()=>{
 assert.ok(evidence.situationNeamt.rohgisMinusOhmSqKm>800);
 assert.ok(evidence.situationNeamt.portionAlsoInOhmOldSuceavaSqKm>790);
 const transfers=evidence.situationNeamt.transferClaims;
 assert.equal(transfers.length,13);
 assert.ok(transfers.some(x=>x.date==='1930-01-01'&&x.from==='Baia'&&x.to==='Neamț'&&x.communes.includes('Țibucani')));
 assert.ok(transfers.some(x=>x.date==='1926-01-01'&&x.to==='Neamț'&&x.communes.includes('Broșteni')));
 const proposals=transfers.filter(x=>x.date==='1936-PROPOSED');
 assert.equal(proposals.length,1);
 assert.equal(proposals[0].enactedStatus,'NOT_ENACTED_IN_SOURCE');
 assert.ok(transfers.every(x=>x.source==='NEAMT1936'));
});
test('TREE.6: 1930 official 322 plăși cannot silently certify 494 multiyear RoHGIS features',()=>{
 assert.equal(evidence.plasiDiscrepancy.nationalCountOfficialAt1930,322);
 assert.equal(evidence.plasiDiscrepancy.rohgisPlasiFeatures1929to1933,494);
 assert.equal(evidence.plasiDiscrepancy.difference,172);
 assert.match(evidence.plasiDiscrepancy.status,/HOLD/);
 assert.equal(rohgis.versions.filter(v=>v.kind==='plasa').length,494);
 assert.equal(rohgis.yearFilterRestriction,'ONLY_1930');
 assert.ok(evidence.restrictions.includes('NO_CROSS_SOURCE_GEOMETRY_ID_REUSE'));
 assert.ok(evidence.restrictions.includes('NEVER_INFER_MISSING_OHM_END_FROM_1930_COUNTY_NAME'));
 assert.equal(previous.counters.sharedGeometryIdPromotions,0);
});
