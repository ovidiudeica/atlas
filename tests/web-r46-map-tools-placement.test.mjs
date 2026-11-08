import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const app=readFileSync(new URL('../src/App.tsx',import.meta.url),'utf8');
const css=readFileSync(new URL('../src/styles.css',import.meta.url),'utf8');
test('WEB-R4.6: one map tool icon belongs above Zoom/Home and Reset in the map stack',()=>{
  const start=app.indexOf('<div className="map-action-stack">');
  const end=app.indexOf('{toolsOpen&&globalTools}',start);
  assert(start>0&&end>start);
  const stack=app.slice(start,end);
  const gear=stack.indexOf('className="atlas-tools-toggle"');
  const zoom=stack.indexOf('className="zoom-controls"');
  const reset=stack.indexOf('className="map-reset-global"');
  assert(gear>=0&&zoom>gear&&reset>zoom);
  assert.equal((app.match(/className="atlas-tools-toggle"/g)||[]).length,1);
  assert.match(stack,/ref=\{toolsOpenerRef\}/);
  assert.match(css,/\.atlas-tools-toggle\{position:relative;z-index:auto;/);
});
test('WEB-R4.6: desktop panel opens left and Close button occupies the trigger row',()=>{
  assert.match(css,/\.atlas-global-tools-panel\{[^}]*right:72px;top:17px;/);
  assert.match(css,/\.atlas-tools-heading\{[^}]*min-height:44px\}/);
  assert.match(css,/\.atlas-tools-close\{width:44px;height:44px;min-width:44px/);
  assert.match(app,/className="atlas-tools-close" aria-label=\{t\.close\}/);
});
test('WEB-R4.6: mobile modal and focus return are preserved',()=>{
  assert.match(css,/\.atlas-global-tools-panel\{\s*position:relative;top:auto;bottom:auto;left:auto;right:auto;/);
  assert.match(css,/\.atlas-tools-overlay\{display:flex;flex-direction:column;justify-content:flex-end\}/);
  assert.match(app,/toolsOpenerRef\.current\?\.focus\(\)/);
  assert.match(app,/onTouchStart=\{startToolsSwipe\} onTouchEnd=\{finishToolsSwipe\}/);
});
test('WEB-R4.6: certified ACTUAL catalog is unchanged',()=>{
  const catalog=readFileSync(new URL('../public/data/phase4/catalog.json.gz',import.meta.url));
  assert.equal(createHash('sha256').update(catalog).digest('hex'),
    '1f930079194c92dc0e02d6e675165dddec6f49db0a62357bcc61be0705125482');
});
