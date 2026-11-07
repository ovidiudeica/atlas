import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const app=readFileSync(new URL('../src/App.tsx',import.meta.url),'utf8');
const css=readFileSync(new URL('../src/styles.css',import.meta.url),'utf8');
test('Administrative module owns only tree, filters and geometry reset',()=>{
  const start=app.indexOf('const treePanel='),end=app.indexOf('const globalTools=',start);
  assert(start>=0&&end>start);
  const tree=app.slice(start,end);
  assert.match(tree,/className="osm-level-filter"/);
  assert.match(tree,/className="tree-filters"/);
  assert.match(tree,/className="tree-list"/);
  assert.match(tree,/className="reset-geometries atlas-admin-reset"/);
  for(const moved of ['atlas-map-tools','atlas-map-settings','atlas-tools-export','atlas-map-information','basemap-select','map-legend'])
    assert(!tree.includes('className="'+moved),'Administrative tree must not own '+moved);
  assert(!tree.includes('t.description'),'Repeated global source paragraphs do not belong in the tree');
});
test('Exactly one global map-tool menu is mounted independently of the module rail',()=>{
  assert.match(app,/className="atlas-tools-toggle"/);
  assert.match(app,/className="atlas-global-tools-panel" role="dialog"/);
  assert.match(app,/const globalTools=/);
  assert.match(app,/\{toolsOpen&&globalTools\}/);
  assert.match(app,/setToolsOpen\(false\)/);
  assert.match(app,/setToolSection\(previous=>previous===section\?null:section\)/);
  assert.match(css,/\.atlas-global-tools-panel/);
  assert.match(css,/\.atlas-tools-overlay/);
});
test('Settings, fit, legend, export and sources remain complete and independent',()=>{
  for(const id of ['atlas-section-settings','atlas-section-legend','phase5-export-panel','atlas-section-about'])
    assert(app.includes('id="'+id+'"'));
  assert.match(app,/void fitVisible\(\)/);
  assert.match(app,/makeDetailedCollection\(/);
  assert.match(app,/metadataCsv\(/);
  assert.match(app,/mapVisible\.filter/);
  assert.match(app,/className="atlas-tools-legend"/);
  assert.match(app,/t\.sourceNote/);
  assert.match(app,/t\.detailNote/);
});
