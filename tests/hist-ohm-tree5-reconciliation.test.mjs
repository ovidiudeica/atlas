import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';

const root = new URL('../public/data/historical/v1/', import.meta.url);
const evidenceUrl = new URL('../docs/historical/reconciliation/HIST-OHM-TREE.5-16-COUNTY-PAIRS.csv', import.meta.url);
const json = p => JSON.parse(readFileSync(new URL(p, root), 'utf8'));
const ohm = json('geodata/index.json');
const rohgis = json('rohgis/catalog-1930.json');
const pairs = readFileSync(evidenceUrl, 'utf8').trim().split(/\r?\n/).slice(1).map(line => {
  const parts = line.split(',');
  assert.equal(parts.length, 12);
  return {
    name: parts[0], ohmId: parts[1], rohgisId: parts[2],
    iou: Number(parts[3]), difference: Number(parts[4]), hausdorff: Number(parts[5]),
    period: parts[6], temporal: parts[7],
    geometryEqual: parts[8] === 'true', reused: parts[9] === 'true',
    ohmOnly: Number(parts[10]), rohgisOnly: Number(parts[11]),
  };
});
const fold = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .replace(/ș|ş/g, 's').replace(/ț|ţ/g, 't').toLowerCase();
const bbox = coords => {
  const out = [Infinity, Infinity, -Infinity, -Infinity];
  const walk = value => {
    if (Array.isArray(value) && typeof value[0] === 'number' && typeof value[1] === 'number') {
      out[0] = Math.min(out[0], value[0]); out[1] = Math.min(out[1], value[1]);
      out[2] = Math.max(out[2], value[0]); out[3] = Math.max(out[3], value[1]);
    } else if (Array.isArray(value)) for (const child of value) walk(child);
  };
  walk(coords);
  assert.ok(out.every(Number.isFinite));
  return out.map(value => value.toFixed(8)).join('|');
};
const sourceBoxMap = (relativeDir, expected) => {
  const dir = new URL(relativeDir, root);
  const all = new Map();
  for (const file of readdirSync(dir).filter(p => p.endsWith('.geojson'))) {
    const collection = JSON.parse(readFileSync(new URL(file, dir), 'utf8'));
    assert.equal(collection.type, 'FeatureCollection');
    for (const feature of collection.features) {
      assert.ok(!all.has(feature.id), 'Duplicate source feature '+feature.id);
      all.set(feature.id, bbox(feature.geometry.coordinates));
    }
  }
  assert.equal(all.size, expected);
  return all;
};

test('HIST-OHM-TREE.5 individually qualifies all 704 source versions and 16 county candidate pairs', () => {
  assert.equal(ohm.entries.length, 139);
  assert.equal(new Set(ohm.entries.map(v => v.geometryId)).size, 125);
  assert.equal(rohgis.versions.length, 565);
  assert.equal(new Set(rohgis.versions.map(v => v.geometryId)).size, 565);
  assert.equal(rohgis.versions.filter(v => v.kind === 'judet').length, 71);
  assert.equal(rohgis.versions.filter(v => v.kind === 'plasa').length, 322);
  assert.equal(rohgis.versions.filter(v => v.kind === 'urban_unit').length, 172);
  assert.equal(rohgis.yearFilterRestriction, 'ONLY_1930');
  assert.ok(rohgis.versions.every(v => v.start === '1930-01-01' && v.end === '1930-12-31'));
  assert.ok(rohgis.versions.every(v => !v.boundaryCertified && !v.crossFamilyIdentityCertified));
  const ohmCounties = ohm.entries.filter(v => v.sourceGroup.startsWith('Județe istorice/Județul '));
  assert.equal(ohmCounties.length, 19);
  assert.equal(pairs.length, 16);
  const ohmById = new Map(ohm.entries.map(v => [v.id, v]));
  const rohgisById = new Map(rohgis.versions.map(v => [v.entityId, v]));
  const pairedOHM = new Set(), pairedRo = new Set();
  for (const row of pairs) {
    const a = ohmById.get(row.ohmId), b = rohgisById.get(row.rohgisId);
    assert.ok(a && b, 'Unknown pair '+row.name);
    assert.ok(a.sourceGroup.startsWith('Județe istorice/Județul '));
    assert.equal(b.kind, 'judet');
    assert.equal(fold(a.sourceGroup.split('Județul ')[1]), fold(b.nameRo));
    assert.equal(fold(row.name), fold(b.nameRo));
    assert.ok(row.iou >= 0 && row.iou < 1 && row.difference > 0 && row.hausdorff > 0);
    assert.ok(Math.abs(row.difference - row.ohmOnly - row.rohgisOnly) < 0.000002);
    assert.equal(row.geometryEqual, false);
    assert.equal(row.reused, false);
    assert.notEqual(a.geometryId, b.geometryId);
    assert.ok(!pairedOHM.has(a.id) && !pairedRo.has(b.entityId));
    pairedOHM.add(a.id); pairedRo.add(b.entityId);
    assert.equal(row.temporal,
      a.sourcePeriod.end && a.sourcePeriod.start && a.sourcePeriod.start.slice(0, 4) <= '1930' && a.sourcePeriod.end.slice(0, 4) >= '1930'
        ? 'CONTAINS_1930_NOT_CERTIFIED' : 'END_UNKNOWN');
  }
  assert.equal(pairs.filter(p => p.temporal === 'CONTAINS_1930_NOT_CERTIFIED').length, 3);
  assert.equal(pairs.filter(p => p.temporal === 'END_UNKNOWN').length, 13);
  assert.equal(ohmCounties.filter(c => !pairedOHM.has(c.id)).length, 3);
  assert.equal(rohgis.versions.filter(c => c.kind === 'judet' && !pairedRo.has(c.entityId)).length, 55);
  assert.equal(rohgis.versions.filter(c => c.kind !== 'judet' && !pairedRo.has(c.entityId)).length, 494);
  assert.ok(rohgis.versions.filter(c => c.kind !== 'judet').every(c =>
    rohgisById.get(c.parentId)?.kind === 'judet'));
  const suceava = pairs.find(p => p.name === 'Suceava');
  assert.ok(suceava && suceava.iou < 0.001);
});

test('HIST-OHM-TREE.5 screens all OHM/RoHGIS version pairs for exact geometry using bounds', () => {
  const ohmBounds = sourceBoxMap('geodata/', 139);
  const roBounds = sourceBoxMap('rohgis/geom/', 565);
  const roBboxCounts = new Map();
  for (const v of rohgis.versions) {
    const box = roBounds.get(v.entityId);
    assert.ok(box);
    roBboxCounts.set(box, (roBboxCounts.get(box) || 0) + 1);
  }
  let checked = 0, equalBounds = 0;
  for (const entry of ohm.entries) {
    const box = ohmBounds.get(entry.featureId);
    assert.ok(box);
    equalBounds += roBboxCounts.get(box) || 0;
    checked += rohgis.versions.length;
  }
  assert.equal(checked, 78535);
  assert.equal(equalBounds, 0, 'Exactly equal geometry would necessarily share the same bbox');
  assert.equal(new Set([...ohm.entries.map(v => v.geometryId), ...rohgis.versions.map(v => v.geometryId)]).size, 690);
});
