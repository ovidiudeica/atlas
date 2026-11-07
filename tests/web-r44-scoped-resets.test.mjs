import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {
  MODULE_KEYS,makeModuleVisibility,setModuleGeometry,resetModuleGeometry,
  displayedModuleGeometry,moduleHasSelections
} from '../src/data/moduleReset.mjs';

const app=readFileSync(new URL('../src/App.tsx',import.meta.url),'utf8');
const css=readFileSync(new URL('../src/styles.css',import.meta.url),'utf8');
const catalog=readFileSync(new URL('../public/data/phase4/catalog.json.gz',import.meta.url));
const roots=['osm-r90689','osm-r58974'];

test('WEB-R4.4: local reset changes only its own module (including overlapping geometries)',()=>{
  let state=makeModuleVisibility(roots);
  state=setModuleGeometry(state,'administrative',[...roots,'osm-r377733']);
  state=setModuleGeometry(state,'historical',['osm-r377733','history-a']);
  state=setModuleGeometry(state,'regions',['region-b']);
  const before=JSON.stringify(state);
  const adminReset=resetModuleGeometry(state,'administrative',roots);
  assert.deepEqual(adminReset.administrative,roots);
  assert.deepEqual(adminReset.historical,['osm-r377733','history-a']);
  assert.deepEqual(adminReset.regions,['region-b']);
  assert.equal(JSON.stringify(state),before,'State objects remain immutable');
  const output=displayedModuleGeometry(adminReset,['osm-r377733']);
  assert.deepEqual(output,[...roots,'osm-r377733','history-a','region-b']);
  const historicalReset=resetModuleGeometry(adminReset,'historical',roots);
  assert.deepEqual(historicalReset.historical,[]);
  assert.deepEqual(historicalReset.regions,['region-b'],'Other module untouched');
  assert.deepEqual(historicalReset.administrative,roots,'Reference countries untouched');
});

test('WEB-R4.4: global reset retains just two country geometries',()=>{
  const state=makeModuleVisibility(roots);
  for(const module of MODULE_KEYS.filter(m=>m!=='administrative'))
    assert.deepEqual(state[module],[]);
  const modified=setModuleGeometry(state,'historical',['historic-a']);
  assert.deepEqual(displayedModuleGeometry(modified,['osm-r377733']),
    [...roots,'historic-a','osm-r377733']);
  assert.deepEqual(displayedModuleGeometry(makeModuleVisibility(roots)),roots);
  assert.equal(new Set(displayedModuleGeometry(setModuleGeometry(modified,'regions',
    ['historic-a']),[])).size,3,'Shared geometry is rendered once');
});

test('WEB-R4.4: reset control enabled only when its module has selections',()=>{
  const state=makeModuleVisibility(roots);
  assert(!moduleHasSelections(state,'administrative',roots,[],[],null,null));
  assert(!moduleHasSelections(state,'historical',roots,[],[],null,null));
  assert(moduleHasSelections(state,'administrative',roots,[4],[],null,null));
  assert(moduleHasSelections(state,'administrative',roots,[],['NTS 3'],null,null));
  assert(moduleHasSelections(state,'administrative',roots,[],[],'osm-r377733','administrative'));
  assert(!moduleHasSelections(state,'historical',roots,[],[],'osm-r377733','administrative'),
    'Historical reset cannot clear an Administrative entity card');
  assert(moduleHasSelections(setModuleGeometry(state,'historical',['h1']),
    'historical',roots,[],[],'osm-r377733','administrative'));
  assert(moduleHasSelections(setModuleGeometry(state,'administrative',[]),
    'administrative',roots,[],[],null,null),'Hiding roots is also an active choice');
  assert.throws(()=>resetModuleGeometry(state,'alien',roots),/Unknown module/);
});

test('WEB-R4.4: global and local controls are in the requested locations',()=>{
  assert.match(app,/className="map-action-stack"/);
  assert.match(app,/className="zoom-controls"/);
  assert.match(app,/className="map-reset-global" aria-label=\{t\.resetAll\}/);
  assert.match(app,/className="module-pane-actions"/);
  assert.match(app,/className="module-reset" aria-label=\{t\.resetModule\}/);
  assert.match(app,/disabled=\{!localSelectionActive\}/);
  assert.match(app,/onClick=\{\(\)=>resetLocalModule\(module\)\}/);
  assert.match(app,/className=\{drawer==='tree'\?'module-pane-actions':'detail-pane-actions'\}/);
  assert(!app.includes('atlas-admin-reset'),'Old footer control has been removed');
  assert(!app.includes('Restore initial geometry display'));
  assert(!app.includes('Restabilește afișarea inițială'));
  assert.match(css,/\.map-action-stack\{/);
  assert.match(css,/\.pane-toolbar \.module-reset,\.drawer-toolbar \.module-reset\{/);
  assert.match(css,/\.module-reset:disabled/);
});

test('WEB-R4.4: local preserves camera and other modules, global resets all state',()=>{
  const start=app.indexOf('function resetLocalModule(');
  const end=app.indexOf('const resetAllSelections=',start);
  const local=app.slice(start,end);
  assert(start>0&&end>start);
  assert.match(local,/resetModuleGeometry\(old,id,DEFAULT_VISIBLE\)/);
  assert.match(local,/if\(id==='administrative'\)/);
  assert.match(local,/if\(selectedModule===id\)/);
  assert.match(local,/url\.searchParams\.delete\('entity'\)/);
  for(const forbidden of ['fitBounds(', 'reset();', 'setSearch(', 'setExpanded(', 'setModulePanelOpen(false)', 'setBasemap(', 'setSimplified('])
    assert(!local.includes(forbidden),'Local must not change '+forbidden);
  const global=app.slice(end,app.indexOf('async function fitVisible()',end));
  assert.match(global,/makeModuleVisibility\(DEFAULT_VISIBLE\)/);
  assert.match(global,/setAdminFilters\(\[\]\)/);
  assert.match(global,/setStatFilters\(\[\]\)/);
  assert.match(global,/clearGeometryPermalink/);
  assert.match(global,/reset\(\)/);
  assert.match(app,/const mapVisible=useMemo\(\(\)=>displayedModuleGeometry\(moduleVisible,filterIds\)/);
});

test('WEB-R4.4: ACTUAL catalogue and official identifiers unchanged',()=>{
  assert.equal(createHash('sha256').update(catalog).digest('hex'),
    '1f930079194c92dc0e02d6e675165dddec6f49db0a62357bcc61be0705125482');
});
