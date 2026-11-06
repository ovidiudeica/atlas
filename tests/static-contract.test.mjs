import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (name) => readFileSync(new URL('../' + name, import.meta.url), 'utf8');
const app = read('src/App.tsx');
const territory = read('src/data/territories.ts');
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

test('Phase 2 root previews remain valid as interim outlines before Phase 3 polygons load', () => {
  const matches = [...borders.matchAll(/(?:detailed|simplified):\s*\[("(?:\\.|[^"\\])*")\]/g)];
  assert.equal(matches.length, 4);
  for (const [, raw] of matches) {
    const points = decode(JSON.parse(raw));
    assert(points.length >= 12);
    assert(points.every(([lon,lat])=>lon>=19&&lon<=32&&lat>=42&&lat<=49));
    const [a,b]=[points[0],points.at(-1)];
    assert(Math.abs(a[0]-b[0])<.00002 && Math.abs(a[1]-b[1])<.00002);
  }
});

test('Two verified root OSM identities are preserved and replaced with certified polygons', () => {
  assert.match(borders,/90689/);
  assert.match(borders,/58974/);
  assert.match(territory,/osm-r90689/);
  assert.match(territory,/osm-r58974/);
  assert.match(app,/loadGeometryShard\('roots',mode\)/);
  assert.match(app,/source\?\.setData\(mapCountryFeatures\(shapes\)\)/);
});

test('Six modules, EN/RO languages, global controls and zoom tools are available', () => {
  for(const id of ['administrative','historical','communities','regions','ethnographic','reform'])
    assert(app.includes("id: '"+id+"'"));
  for(const label of ['Simplified geometries','Geometrii simplificate','Reset map extent',
    'Resetează încadrarea hărții','loadCatalog()', 'loadGeometryShard(', 'setFilter', 'setData'])
    assert(app.includes(label),label);
  assert.match(read('vite.config.ts'),/base: '\/atlas\/'/);
});

test('Production UI shows actual administrative/statistical records and distinguishes later modules', () => {
  assert.match(app,/4,283|catalog\.length/);
  assert.match(app,/officialName/);
  assert.match(app,/statisticalRoles/);
  assert.match(app,/currentNode\.osmRelationId!==null/);
  assert.match(app,/t\.planned/);
  assert.match(app,/treeView===/);
  assert.match(territory,/raw|sourceTags/);
});

test('Map container retains explicit full height across browsers',()=>{
  assert.match(read('src/styles.css'),/\.map-area > \.map-canvas\{position:absolute;inset:0;width:100%;height:100%\}/);
});
