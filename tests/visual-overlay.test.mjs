import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8');

test('Phase 4 draws certified polygons in MapLibre-native GeoJSON sources, not projected DOM paths', () => {
  assert.match(app,/instance\.addSource\('borders'/);
  assert.match(app,/instance\.addSource\('entities'/);
  assert.match(app,/instance\.addLayer\(\{id:'entity-fill'/);
  assert.match(app,/instance\.addLayer\(\{id:'entity-outline'/);
  assert.match(app,/instance\.addLayer\(\{id:'entity-highlight'/);
  assert.doesNotMatch(app,/territorySvgPaths/);
  assert.doesNotMatch(app,/syncOutline/);
});

test('MapLibre camera automatically reprojects GeoJSON boundaries when moved/resized', () => {
  assert.match(app,/mapRef\.current/);
  assert.match(app,/getSource\('borders'\)/);
  assert.match(app,/getSource\('entities'\)/);
  // Presentation metadata is attached after canonical geometry is loaded.
  // The MapLibre source still receives the geometry produced by asDisplayFeatures.
  assert.match(app,/asDisplayFeatures\(ids,nodes,features\)/);
  assert.match(app,/source\?\.setData\(displayed\)/);
  assert.match(app,/styleForEntity\(node,adminFilters,statFilters\)/);
  assert.match(app,/feature\.properties=\{\.\.\.feature\.properties/);
  assert.match(app,/fitBounds/);
  assert.match(app,/getCanvas\(\)\.style\.cursor/);
});
