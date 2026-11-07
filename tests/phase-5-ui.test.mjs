import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { idsForScope, metadataCsv, makeDetailedCollection, buildPermalink, clearGeometryPermalink, readPermalink } from '../src/data/phase5.mjs';

const territory = (id, shard, name = 'Test', osm = null) => ({
  id, country: 'RO', officialName: name, osmRelationId: osm, adminLevel: 8,
  roles: ['administrative'], statisticalRoles: [], registry: { system: 'SIRUTA', code: '64096' },
  administrativeParentId: 'root', treeParentId: 'root', geometryShard: shard
});
const nodes = new Map([
  ['a', territory('a', 'ro-adm-00', 'Comuna Brețcu')],
  ['b', territory('b', 'ro-adm-01', '=SUM(1,2)', 143)]
]);

test('export scopes preserve order, exclude unknown IDs and never infer descendants', () => {
  const valid = new Set(nodes.keys());
  assert.deepEqual(idsForScope('visible', 'a', ['a', 'b', 'b', 'missing'], valid), ['a', 'b']);
  assert.deepEqual(idsForScope('selected', 'a', ['b'], valid), ['a']);
  assert.deepEqual(idsForScope('selected', null, ['a'], valid), []);
});

test('metadata CSV preserves blank OSM IDs, UTF-8, spreadsheet safety and documented identity', () => {
  const csv = metadataCsv(['a', 'b'], nodes);
  assert(csv.startsWith('\uFEFF'));
  assert(csv.includes('"Comuna Brețcu","",'));
  assert(csv.includes('"\'=SUM(1,2)"'));
  assert(csv.includes('"64096"'));
  assert(csv.includes('"2026-10-05"'));
  assert.equal(csv.trim().split('\r\n').length, 3);
});

test('GeoJSON export loads full detailed source per shard and retains native feature properties', async () => {
  const seen = [];
  const progress = [];
  const source = new Map([
    ['a', { type: 'Feature', properties: { atlasId: 'a', original: 'OSMB' }, geometry: { type: 'Polygon', coordinates: [[[0,0],[1,0],[0,1],[0,0]]] } }],
    ['b', { type: 'Feature', properties: { atlasId: 'b', ref: 143 }, geometry: { type: 'Polygon', coordinates: [[[1,1],[2,1],[1,2],[1,1]]] } }]
  ]);
  const collection = await makeDetailedCollection(['b', 'a'], nodes, async (shard, mode) => {
    seen.push([shard, mode]);
    return new Map([...source].filter(([id]) => nodes.get(id).geometryShard === shard));
  }, (done,total) => progress.push([done,total]));
  assert.deepEqual(seen, [['ro-adm-01', 'detailed'], ['ro-adm-00', 'detailed']]);
  assert.deepEqual(progress, [[1,2], [2,2]]);
  assert.equal(collection.features[0], source.get('b'));
  assert.equal(collection.features[1], source.get('a'));
  assert.equal(collection.atlasExport.sourceGeometryUnmodified, true);
  assert.equal(collection.atlasExport.legalBoundaryCertification, false);
  await assert.rejects(makeDetailedCollection(['a'], nodes, async () => new Map()), /Missing detailed geometry/);
});

test('permalink roundtrip validates camera, IDs, enum values, keeps site base path', () => {
  const link = buildPermalink('https://example.org/atlas/?utm=1', {
    entity: 'siruta-u64096', view: 'administrative', lang: 'ro', simple: true,
    basemap: 'grayscale', lng: 26.5, lat: 45.99, zoom: 10.25
  });
  const url = new URL(link);
  assert.equal(url.pathname, '/atlas/');
  assert.equal(url.searchParams.get('utm'), '1');
  assert.deepEqual(readPermalink(url.search), {
    entity: 'siruta-u64096', view: 'administrative', lang: 'ro', simple: true,
    basemap: 'grayscale', lng: 26.5, lat: 45.99, zoom: 10.25
  });
  assert.equal(readPermalink('?entity=%3Cscript%3E&lng=999&lat=23&zoom=3').entity, null);
  assert.equal(readPermalink('?lng=999&lat=23&zoom=3').zoom, null);
});


test('geometry reset removes only permalink camera/selection; unrelated filters and URL survive reload', () => {
  const url = new URL(clearGeometryPermalink(
    'https://example.org/atlas/?utm=keep&entity=siruta-u64096&view=statistical&lang=ro&simple=1&basemap=dark&lng=26.4&lat=46.2&zoom=9#map'
  ));
  assert.equal(url.pathname, '/atlas/');
  assert.equal(url.hash, '#map');
  assert.equal(url.searchParams.get('utm'), 'keep');
  for (const key of ['entity', 'lng', 'lat', 'zoom']) assert.equal(url.searchParams.has(key), false);
  assert.equal(url.searchParams.get('view'), 'statistical');
  assert.equal(url.searchParams.get('lang'), 'ro');
  assert.equal(url.searchParams.get('simple'), '1');
  assert.equal(url.searchParams.get('basemap'), 'dark');
  assert.equal(readPermalink(url.search).entity, null);
  assert.equal(readPermalink(url.search).zoom, null);
});

test('Phase 5 integrates map navigation/export without modifying certified Phase 4 assets', () => {
  const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8');
  assert.match(app, /makeDetailedCollection\(/);
  assert.match(app, /metadataCsv\(/);
  assert.match(app, /buildPermalink\(/);
  assert.match(app, /fitVisible/);
  assert.match(app, /breadcrumbs/);
  assert.match(app, /aria-controls="phase5-export-panel"/);
  assert.match(app, /aria-expanded=\{toolSection==='export'\}/);
  assert.match(app, /mode:GeometryMode=simplified/);
});
