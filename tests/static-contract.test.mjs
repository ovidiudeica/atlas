import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (name) => readFileSync(new URL('../' + name, import.meta.url), 'utf8');
const app = read('src/App.tsx');
const borders = read('src/data/borders.ts');

function decode(encoded) {
  let index = 0, lat = 0, lon = 0;
  const points = [];
  while (index < encoded.length) {
    const result = [];
    for (let part = 0; part < 2; part++) {
      let shift = 0, accum = 0, byte;
      do {
        if (index >= encoded.length) throw new Error('Truncated coordinate');
        byte = encoded.charCodeAt(index++) - 63;
        accum |= (byte & 0x1f) << shift;
        shift += 5;
      } while (byte >= 0x20);
      result.push(accum & 1 ? ~(accum >> 1) : accum >> 1);
    }
    lat += result[0];
    lon += result[1];
    points.push([lon / 1e5, lat / 1e5]);
  }
  return points;
}

test('Phase 2 source exposes two national polygons in two render resolutions', () => {
  const matches = [...borders.matchAll(/(?:detailed|simplified):\s*\[("(?:\\.|[^"\\])*")\]/g)];
  assert.equal(matches.length, 4, 'two borders × two modes');
  for (const [, raw] of matches) {
    const points = decode(JSON.parse(raw));
    assert.ok(points.length >= 12, 'outline has sufficient vertices');
    assert.ok(points.every(([lon, lat]) => lon >= 19 && lon <= 32 && lat >= 42 && lat <= 49), 'points stay within known geographic region');
    const [start, finish] = [points[0], points.at(-1)];
    assert.ok(Math.abs(start[0] - finish[0]) < 0.00002 && Math.abs(start[1] - finish[1]) < 0.00002, 'polygon ring is closed');
  }
});

test('The two root OSM identifiers and intentional source resolution limits are documented', () => {
  assert.match(borders, /90689/);
  assert.match(borders, /58974/);
  assert.match(borders, /NOT the complete original polygons/);
});

test('The six agreed modules, languages, global controls and map tools exist', () => {
  for (const label of ['administrative','historical','communities','regions','ethnographic','reform']) {
    assert.ok(app.includes("id: '" + label + "'"), label);
  }
  for (const key of ["Simplified geometries", "Geometrii simplificate", "Reset map extent", "Resetează încadrarea hărții", "const INITIAL_VISIBLE: CountryId[] = ['ro','md']", 'setFilter', 'setData']) {
    assert.ok(app.includes(key), key);
  }
  assert.match(read('vite.config.ts'), /base: '\/atlas\/'/);
});

test('Phase 2 honestly distinguishes functional borders from unimplemented registries and modules', () => {
  assert.match(app, /statistical geometry are not published yet/);
  assert.match(app, /Module planned for a later development phase/);
});

test('MapLibre container has explicit full height',()=>{
  assert.match(read('src/styles.css'),/\.map-area > \.map-canvas\{position:absolute;inset:0;width:100%;height:100%\}/);
});

test('Territory SVG outlines are synchronized with the MapLibre camera',()=>{
  assert.match(read('src/App.tsx'),/territorySvgPaths/);
  assert.match(read('src/App.tsx'),/instance.on\('move',syncOutline\)/);
  assert.match(read('src/App.tsx'),/className="territory-overlay"/);
  assert.match(read('src/styles.css'),/\.territory-overlay/);
});
