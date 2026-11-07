import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const app=readFileSync(new URL('../src/App.tsx',import.meta.url),'utf8');
const css=readFileSync(new URL('../src/styles.css',import.meta.url),'utf8');
test('WEB-R3.5 exactly three primary map sections and one subdued About footer',()=>{
  assert.equal((app.match(/className="atlas-tools-entry"/g)||[]).length,3);
  assert(!app.includes('atlas-tools-item atlas-map-fit'));
  assert(!app.includes('atlas-tools-item atlas-tools-about'));
  assert.match(app,/className="atlas-tools-fit-button"/);
  assert.match(app,/className="atlas-tools-about-link"/);
  assert.match(app,/t\.mapAppearance/);
  assert.match(app,/t\.mapLegend/);
  assert.match(app,/t\.exportAction/);
});
test('Legend is derived from actual rendered roles with explicit show-all toggle',()=>{
  assert.match(app,/const visibleStyleKeys=useMemo/);
  assert.match(app,/for\(const id of mapVisible\)/);
  assert.match(app,/styleForEntity\(node,adminFilters,statFilters,ROOT_IDS\.some/);
  assert.match(app,/legendShowAll\|\|visibleStyleKeys\.has\('reference'\)/);
  assert.match(app,/levelOptions\.filter\(option=>legendShowAll\|\|visibleStyleKeys\.has/);
  assert.match(app,/statisticalLevelOptions\.filter\(option=>legendShowAll\|\|visibleStyleKeys\.has/);
  assert.match(app,/className="atlas-legend-expand"/);
});
test('Mobile adaptive bottom sheet reserves module rail and supports swipe / reduced motion',()=>{
  assert.match(css,/\.atlas-global-tools-panel\{[\s\S]*?max-height:min\(78dvh/);
  assert.match(css,/\.atlas-tools-overlay\{display:flex;flex-direction:column;justify-content:flex-end\}/);
  assert.match(css,/\.atlas-tools-grab/);
  assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
  assert.match(app,/onTouchStart=\{startToolsSwipe\} onTouchEnd=\{finishToolsSwipe\}/);
  assert.match(app,/dy>85/);
  assert.match(app,/toolsOpenerRef\.current\?\.focus\(\)/);
});
