import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateHistoricalPeriod, formatHistoricalPeriod, periodContainsYear,
  validateHistoricalAdminBridge, historicalLinksForActual,
  actualLinksForHistorical, navigationTargetForBridge
} from '../src/data/historicalAdminBridge.mjs';
import {
  validateTemporalHierarchy, childrenForHistoricalYear,
  parentsForHistoricalYear
} from '../src/data/historicalTemporalHierarchy.mjs';

// These fixtures are invented to test contracts; no historical relationship is asserted.
const date = year => ({ year });
const span = (a, b) => ({ kind: 'interval', start: a === null ? null : date(a),
  end: b === null ? null : date(b) });
const snapshot = year => ({ kind: 'snapshot', at: date(year) });
const actualId = 'osm-r194271';
const historicalId = 'hist:synthetic-county';
const versionId = 'hist-version:synthetic-1925-1950';
const refs = {
  actualIds: [actualId], historicalEntityIds: [historicalId],
  historicalVersionIds: [versionId], actualSnapshotDate: '2026-10-05'
};
const link = (overrides = {}) => ({
  id: 'bridge:synthetic-01',
  actualId, historicalEntityId: historicalId, historicalVersionId: versionId,
  actualSnapshotDate: '2026-10-05',
  kind: 'institutional_continuity', evidenceStatus: 'qualified',
  historicalPeriod: span(1925, 1950),
  sourceIds: ['source:synthetic-document'], ...overrides
});

const hierarchy = (id, parent, child, start = 1925, end = 1950, extra = {}) => ({
  id, parentVersionId: parent, childVersionId: child,
  kind: 'administrative', perspectiveId: 'historic:documented-perspective',
  evidenceStatus: 'qualified', period: span(start, end),
  sourceIds: ['source:synthetic-document'], ...extra
});

test('yearX–yearY formatting, BCE, unknown boundaries, and snapshots stay distinct', () => {
  assert.equal(formatHistoricalPeriod(span(1925, 1950), 'ro'), '1925–1950');
  assert.equal(formatHistoricalPeriod(span(1925, 1950), 'en'), '1925–1950');
  assert.equal(formatHistoricalPeriod(span(-106, 106), 'ro'), '106 î.Hr.–106');
  assert.equal(formatHistoricalPeriod(span(null, 1950), 'ro'), '?–1950');
  assert.equal(formatHistoricalPeriod(span(1910, null), 'ro'), '1910–?');
  assert.equal(formatHistoricalPeriod(snapshot(1910), 'ro'), 'Atestat în 1910');
  assert.equal(formatHistoricalPeriod(snapshot(1910), 'en'), 'Attested in 1910');
  assert.equal(periodContainsYear(snapshot(1910), 1909), false);
  assert.equal(periodContainsYear(span(1910, null), 1911), false);
  assert.equal(periodContainsYear(span(1910, 1920), 1911), true);
});

test('invalid dates and intervals cannot silently enter the historic index', () => {
  assert.equal(validateHistoricalPeriod(span(1950, 1925)), false);
  assert.equal(validateHistoricalPeriod(snapshot(0)), false);
  assert.equal(validateHistoricalPeriod(span(null, null)), false);
  assert.equal(validateHistoricalPeriod({ kind: 'snapshot', at: { year: 1910, month: 13 } }), false);
  assert.equal(validateHistoricalPeriod({ kind: 'snapshot', at: { year: 1910, month: 2, day: 30 } }), false);
  assert.equal(validateHistoricalPeriod({ kind: 'interval', start: date(1925) }), false);
  assert.throws(() => formatHistoricalPeriod(span(1950, 1925)), /Invalid historical period/);
});

test('the bridge validates explicit IDs and never derives continuity from names', () => {
  const verdict = validateHistoricalAdminBridge([link()], refs);
  assert.deepEqual(verdict, { ok: true, errors: [] });
  const broken = validateHistoricalAdminBridge([link({
    actualId: 'osm-r-does-not-exist',
    historicalEntityId: 'hist:unknown',
    historicalVersionId: 'hist-version:unknown',
    actualSnapshotDate: '2030-01-01',
    sourceIds: []
  })], refs);
  assert.equal(broken.ok, false);
  assert.match(broken.errors.join('|'), /ACTUAL|Historical|snapshot|source/);
});

test('qualified spatial links require two measured coverage percentages', () => {
  const base = link({ kind: 'territorial_overlap' });
  assert.equal(validateHistoricalAdminBridge([base], refs).ok, false);
  assert.equal(validateHistoricalAdminBridge([{
    ...base,
    geometryComparison: {
      historicalGeometryId: 'geom-h', actualGeometryId: 'geom-a',
      crs: 'EPSG:3035', method: 'intersection and area in projected CRS',
      historicalCoveragePercent: 71.23, actualCoveragePercent: 38.44
    }
  }], refs).ok, true);
  assert.equal(validateHistoricalAdminBridge([{
    ...base, geometryComparison: {
      historicalGeometryId: 'geom-h', actualGeometryId: 'geom-a',
      crs: 'EPSG:3035', method: 'intersection',
      historicalCoveragePercent: 102, actualCoveragePercent: 38.44
    }
  }], refs).ok, false);
});

test('many-to-many and multiple alternatives are preserved; no first-match navigation', () => {
  const newer = link({
    id: 'bridge:newer', historicalEntityId: 'hist:second',
    historicalVersionId: 'hist-version:second', historicalPeriod: span(1940, 1950),
    evidenceStatus: 'candidate'
  });
  const older = link({ id: 'bridge:older', historicalPeriod: span(1925, 1938) });
  const extendedRefs = {
    ...refs, historicalEntityIds: [historicalId, 'hist:second'],
    historicalVersionIds: [versionId, 'hist-version:second']
  };
  assert.equal(validateHistoricalAdminBridge([newer, older], extendedRefs).ok, true);
  assert.deepEqual(historicalLinksForActual([newer, older], actualId).map(x => x.id),
    ['bridge:older', 'bridge:newer']);
  assert.equal(historicalLinksForActual([newer, older], actualId, true).length, 1);
  assert.equal(actualLinksForHistorical([newer, older], 'hist:second').length, 1);
  assert.equal(navigationTargetForBridge(newer, 'administrative'), null);
  assert.deepEqual(navigationTargetForBridge(older, 'administrative'), {
    module: 'historical', entityId: historicalId, versionId,
    period: span(1925, 1938)
  });
  assert.deepEqual(navigationTargetForBridge(older, 'historical'), {
    module: 'administrative', entityId: actualId
  });
});

test('duplicate semantic bridge links are rejected independently of technical ID', () => {
  const duplicated = { ...link(), id: 'bridge:other-id' };
  assert.equal(validateHistoricalAdminBridge([link(), duplicated], refs).ok, false);
});

test('temporal hierarchy supports genuine multi-level ancestry', () => {
  const versions = [
    { id: 'hist-v:romania', entityId: 'hist:romania', period: span(1925, 1950) },
    { id: 'hist-v:county', entityId: 'hist:county', period: span(1925, 1950) },
    { id: 'hist-v:plasa', entityId: 'hist:plasa', period: span(1925, 1950) }
  ];
  const links = [
    hierarchy('link:one', 'hist-v:romania', 'hist-v:county'),
    hierarchy('link:two', 'hist-v:county', 'hist-v:plasa')
  ];
  assert.equal(validateTemporalHierarchy(versions, links).ok, true);
  assert.deepEqual(childrenForHistoricalYear(links, 'hist-v:romania', 1930,
    'historic:documented-perspective').map(x => x.childVersionId), ['hist-v:county']);
  assert.deepEqual(childrenForHistoricalYear(links, 'hist-v:county', 1930,
    'historic:documented-perspective').map(x => x.childVersionId), ['hist-v:plasa']);
  assert.equal(parentsForHistoricalYear(links, 'hist-v:plasa', 1930,
    'historic:documented-perspective')[0].parentVersionId, 'hist-v:county');
  assert.equal(childrenForHistoricalYear(links, 'hist-v:county', 1951,
    'historic:documented-perspective').length, 0);
});

test('cyclic ancestry and competing parents within one administration fail validation', () => {
  const v = ['a', 'b', 'c'].map(id => ({
    id, entityId: 'entity:' + id, period: span(1925, 1950)
  }));
  const a = hierarchy('r1', 'a', 'b');
  const b = hierarchy('r2', 'b', 'c');
  const cycle = hierarchy('r3', 'c', 'a');
  assert.match(validateTemporalHierarchy(v, [a, b, cycle]).errors.join('|'), /cyclic/);
  const doubleParent = hierarchy('r4', 'c', 'b');
  assert.match(validateTemporalHierarchy(v, [a, doubleParent]).errors.join('|'), /multiple administrative parents/);
});

test('different administrative perspectives may coexist without forced merging', () => {
  const versions = ['a', 'b', 'c'].map(id => ({
    id, entityId: 'entity:' + id, period: span(1925, 1950)
  }));
  const parallel = [
    hierarchy('r1', 'a', 'b', 1925, 1950, { perspectiveId: 'historic:legal' }),
    hierarchy('r2', 'c', 'b', 1925, 1950, { perspectiveId: 'historic:defacto' })
  ];
  assert.equal(validateTemporalHierarchy(versions, parallel).ok, true);
  assert.deepEqual(parentsForHistoricalYear(parallel, 'b', 1930,
    'historic:defacto').map(x => x.parentVersionId), ['c']);
});

test('qualified hierarchy cannot extrapolate outside a source-documented interval', () => {
  const versions = [
    { id: 'parent', entityId: 'p', period: span(1930, 1940) },
    { id: 'child', entityId: 'c', period: span(1930, 1940) }
  ];
  const tooWide = hierarchy('h1', 'parent', 'child', 1925, 1950);
  const snapshotLink = hierarchy('h2', 'parent', 'child', 1930, 1930, {
    period: snapshot(1930)
  });
  assert.match(validateTemporalHierarchy(versions, [tooWide]).errors.join('|'), /does not cover/);
  assert.match(validateTemporalHierarchy(versions, [snapshotLink]).errors.join('|'), /bounded interval/);
  assert.deepEqual(childrenForHistoricalYear([snapshotLink], 'parent', 1930,
    'historic:documented-perspective'), []);
});

test('candidate parent/child hypotheses remain in evidence without entering the live tree', () => {
  const versions = [
    { id: 'parent', entityId: 'p', period: span(1925, 1950) },
    { id: 'child', entityId: 'c', period: span(1925, 1950) }
  ];
  const candidate = hierarchy('h1', 'parent', 'child', 1925, 1950, {
    evidenceStatus: 'candidate'
  });
  assert.equal(validateTemporalHierarchy(versions, [candidate]).ok, true);
  assert.deepEqual(childrenForHistoricalYear([candidate], 'parent', 1930,
    'historic:documented-perspective'), []);
});
