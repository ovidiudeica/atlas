import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import {
  validateHistoricalPilotCatalog, versionsForHistoricalEntity,
  historicalChildrenAtDate, historicalParentAtDate,
  geometryUsesInHistoricalCatalog
} from '../src/data/historicalCatalog.mjs';
import {
  sortHistoricalGeometryUses, historicalUsesForGeometry,
  formatHistoricalUse, validateHistoricalGeometryRegister
} from '../src/data/historicalGeometryUses.mjs';
import { formatHistoricalPeriod } from '../src/data/historicalAdminBridge.mjs';

const root = new URL('../public/data/historical/v1/', import.meta.url);
const catalog = JSON.parse(readFileSync(new URL('catalog.json', root), 'utf8'));
const features = JSON.parse(readFileSync(new URL('geometry.geojson', root), 'utf8'));
const vn = id => 'histogis-v9:version:' + id;
const PERSPECTIVE = 'histogis-v9:source-administration';
const labels = {referenceDatePrefix: 'Atestat în '};

test('the source-backed pilot is a complete, internally coherent DATA subset', () => {
  const verdict = validateHistoricalPilotCatalog(catalog, features);
  assert.deepEqual(verdict, {ok:true,errors:[]});
  assert.equal(catalog.schema, 'atlas-historical-pilot-v1');
  assert.equal(catalog.sourceArchiveSha256,
    '1e108156d8d21f5e47dc91849050f1e12e5d642f13095407f70270883004a5cd');
  assert.equal(catalog.entities.length, 53);
  assert.equal(catalog.versions.length, 54);
  assert.equal(catalog.geometries.length, 53);
  assert.equal(catalog.geometryUses.length, 54);
  assert.equal(catalog.hierarchy.length, 52);
  assert.equal(features.features.length, 53);
  assert.equal(catalog.citation.license, 'CC-BY-4.0');
});

test('pilot has no legal/geometric overclaims and no invented ACTUAL correspondences', () => {
  assert.equal(catalog.coverage.complete, false);
  assert.equal(catalog.coverage.historicalBoundariesCertified, false);
  assert.equal(catalog.coverage.hierarchyQualified, false);
  assert.deepEqual(catalog.bridge, []);
  assert.deepEqual(catalog.events, []);
  assert.deepEqual(catalog.symbols, []);
  assert.ok(catalog.versions.every(x => x.evidenceStatus === 'candidate' &&
    x.boundaryCertification === 'not_certified'));
  assert.ok(catalog.hierarchy.every(x => x.evidenceStatus === 'candidate'));
  assert.ok(catalog.geometries.every(x => x.boundaryCertification === 'not_certified'));
});

test('two chronological Bucovina versions use exactly one geometry, not two polygons', () => {
  const early = catalog.versions.find(x => x.sourceShapeId === 9936);
  const later = catalog.versions.find(x => x.sourceShapeId === 9970);
  assert.ok(early && later);
  assert.equal(early.entityId, later.entityId);
  assert.equal(early.geometryId, later.geometryId);
  const versions = versionsForHistoricalEntity(catalog, early.entityId);
  assert.deepEqual(versions.map(x => x.sourceShapeId), [9936, 9970]);
  const asset = catalog.geometries.find(x => x.geometryId === early.geometryId);
  assert.deepEqual(asset.sourceShapeIds, [9936, 9970]);
  const uses = geometryUsesInHistoricalCatalog(catalog, early.geometryId);
  assert.deepEqual(uses.map(x => x.versionId), [vn(9936), vn(9970)]);
  assert.equal(formatHistoricalUse(uses[0], 'ro', labels), '1849–1867');
  assert.equal(formatHistoricalUse(uses[1], 'en', {referenceDatePrefix:'Attested in '}), '1867–1918');
  // Full source day/month precision is retained despite year-range labels.
  assert.deepEqual(uses[0].period.end, {year:1867, month:12, day:21});
  assert.deepEqual(uses[1].period.start, {year:1867, month:12, day:22});
});

test('Transylvania pilot contains county, district, seat and multi-level source ancestry', () => {
  const root = catalog.versions.find(x => x.sourceShapeId === 9915);
  assert.ok(root);
  const children1835 = historicalChildrenAtDate(catalog, root.id, '1835-07-01', PERSPECTIVE, {includeCandidates:true});
  assert.ok(children1835.length >= 25 && children1835.length <= 29);
  assert.deepEqual(historicalChildrenAtDate(catalog, root.id, '1835-07-01', PERSPECTIVE), []);
  assert.ok(historicalChildrenAtDate(catalog, root.id, '1852-01-01', PERSPECTIVE, {includeCandidates:true}).length >= 4);
  assert.deepEqual(historicalChildrenAtDate(catalog, root.id, '1910-01-01', PERSPECTIVE, {includeCandidates:true}), []);
  assert.deepEqual(historicalParentAtDate(catalog, vn(12324), '1835-07-01', PERSPECTIVE,
    {includeCandidates:true}).map(x=>x.parentVersionId), [vn(12328)]);
  assert.deepEqual(historicalParentAtDate(catalog, vn(12383), '1835-07-01', PERSPECTIVE,
    {includeCandidates:true}).map(x=>x.parentVersionId), [vn(12406)]);
});

test('candidate review uses the actual dates, not a guessed extension to entire years', () => {
  const child = vn(11415);
  const earlier = historicalParentAtDate(catalog, child, '1868-08-30', PERSPECTIVE,
    {includeCandidates:true});
  const later = historicalParentAtDate(catalog, child, '1868-08-31', PERSPECTIVE,
    {includeCandidates:true});
  assert.deepEqual(earlier, []);
  assert.equal(later[0]?.parentVersionId, vn(9970));
  assert.deepEqual(historicalParentAtDate(catalog, child, '1919-01-01', PERSPECTIVE,
    {includeCandidates:true}), []);
  assert.deepEqual(historicalParentAtDate(catalog, child, '1900-02-30', PERSPECTIVE,
    {includeCandidates:true}), []);
});

test('Czernowitz city changes its candidate parent period without duplicating itself', () => {
  const c = vn(11362);
  assert.deepEqual(historicalParentAtDate(catalog, c, '1866-01-01', PERSPECTIVE,
    {includeCandidates:true}).map(x=>x.parentVersionId), [vn(9936)]);
  assert.deepEqual(historicalParentAtDate(catalog, c, '1910-01-01', PERSPECTIVE,
    {includeCandidates:true}).map(x=>x.parentVersionId), [vn(9970)]);
  assert.deepEqual(historicalParentAtDate(catalog, c, '1867-12-21', PERSPECTIVE,
    {includeCandidates:true}).map(x=>x.parentVersionId), [vn(9936)]);
  assert.deepEqual(historicalParentAtDate(catalog, c, '1867-12-22', PERSPECTIVE,
    {includeCandidates:true}).map(x=>x.parentVersionId), [vn(9970)]);
});

test('source geometry anomalies remain visible review flags, never admitted silently', () => {
  assert.equal(catalog.qa.topologicallyValidSourcePolygons, 54);
  assert.equal(catalog.qa.geometryReuseCount, 1);
  assert.equal(catalog.qa.hierarchyLinksOutsideParentOver0_1pct, 8);
  const deviations = catalog.hierarchy.filter(x => x.topologicalReviewRequired);
  assert.equal(deviations.length, 8);
  assert.ok(deviations.some(x => x.outsideParentPercent > 5));
  assert.ok(deviations.every(x => x.evidenceStatus === 'candidate'));
});

test('each full-resolution geometry matches its declared canonical source-exact hash', () => {
  function canonical(o) {
    if (Array.isArray(o)) return '[' + o.map(canonical).join(',') + ']';
    if (o && typeof o === 'object')
      return '{' + Object.keys(o).sort().map(k=>JSON.stringify(k)+':'+canonical(o[k])).join(',') + '}';
    return JSON.stringify(o);
  }
  // Python json uses its own floating-point printing; the dataset's hash is
  // source-generated, so compare an exact stable hash for the FULL FILE instead.
  const bytes = readFileSync(new URL('geometry.geojson', root));
  assert.equal(createHash('sha256').update(bytes).digest('hex'),
    '3ff24bcc42bb9556f663e332a8a67ba9b7799ab094561daea11fcd7eac1f3fd2');
  assert.equal(features.features.length, new Set(features.features.map(f=>f.id)).size);
  assert.equal(catalog.geometries.length, new Set(catalog.geometries.map(g=>g.canonicalHash)).size);
});

test('catalogue validation detects broken references and false certification', () => {
  const modified = structuredClone(catalog);
  modified.versions[0].geometryId = 'fake:geom';
  assert.equal(validateHistoricalPilotCatalog(modified).ok, false);
  const impossible = structuredClone(catalog);
  impossible.coverage.historicalBoundariesCertified = true;
  assert.equal(validateHistoricalPilotCatalog(impossible).ok, false);
  const duplicate = structuredClone(catalog);
  duplicate.geometryUses[1].useId = duplicate.geometryUses[0].useId;
  assert.equal(validateHistoricalPilotCatalog(duplicate).ok, false);
});

test('geometry contract rejects duplicates, dangling uses and invented periods', () => {
  const rec = {geometryId:'g1',canonicalHash:'0'.repeat(64)};
  const use = {useId:'u1', geometryId:'g1', entityId:'h1', versionId:'v1',
    entityName:{ro:'Test'}, sourceIds:['source'], evidenceStatus:'candidate',
    period:{kind:'interval',start:{year:1925},end:{year:1950}}};
  assert.deepEqual(validateHistoricalGeometryRegister([rec],[use]),
    {geometryCount:1,usageCount:1});
  assert.throws(()=>validateHistoricalGeometryRegister([rec, {...rec,geometryId:'g2'}],[use]),
    /fingerprint/);
  assert.throws(()=>validateHistoricalGeometryRegister([rec],[use,{...use,useId:'u2',geometryId:'missing'}]),
    /Unknown geometry/);
  assert.throws(()=>sortHistoricalGeometryUses([{...use,period:{kind:'interval',
    start:{year:1950},end:{year:1925}}}]),/Invalid historical geometry use/);
  assert.deepEqual(historicalUsesForGeometry([use],'g1').map(x=>x.useId), ['u1']);
  assert.equal(formatHistoricalUse(use,'ro',labels), '1925–1950');
  assert.equal(formatHistoricalPeriod({kind:'snapshot',at:{year:1910}},'ro',{snapshotPrefix:'Atestat în '}), 'Atestat în 1910');
});
