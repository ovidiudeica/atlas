import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';

const app=readFileSync(new URL('../src/App.tsx',import.meta.url),'utf8');
const catalog=readFileSync(new URL('../public/data/phase4/catalog.json.gz',import.meta.url));

test('WEB-R4.3a/R4.7: module title exists only in toolbar, never alongside OSMB snapshot',()=>{
  assert.match(app,/<div className="pane-toolbar">\s*<span aria-hidden="true">\{MODULES\.find\(x=>x\.id===module\)\?\.\[lang\]\}<\/span>/);
  assert.doesNotMatch(app,/<div className="panel-heading">/);
  assert.doesNotMatch(app,/<span className="eyebrow">\{t\.sourceSnapshot\}<\/span>/);
  assert(!app.includes('sourceSnapshot:'),'No unused duplicate header translations');
});

test('WEB-R4.3a/R4.7: Entity detail heading moves into toolbar without losing entity name',()=>{
  const details=app.slice(app.indexOf('const details=<section'),app.indexOf('// WEB-R3.5:'));
  assert.doesNotMatch(details,/panel-heading|sourceSnapshot/);
  assert.match(details,/className="entity-title"/);
  assert.match(details,/<h3 tabIndex=\{-1\}>\{cardNameOf\(currentNode,lang\)\}<\/h3>/);
  assert.match(app,/<div className="pane-toolbar">\s*<span aria-hidden="true">\{t\.details\}<\/span>/);
  assert.match(app,/details: 'Entity'/);
  assert.match(app,/details: 'Entitate'/);
});

test('WEB-R4.3a: geometry provenance and its source date remain visible in card',()=>{
  assert.match(app,/<EntityCardSection title=\{t\.cardCartography\} kind="cartographic">/);
  assert.match(app,/<dt>\{t\.source\}<\/dt><dd>\{t\.sourceBoundary\}<\/dd>/);
  assert.match(app,/<dt>\{t\.original\}<\/dt><dd>2026-10-05<\/dd>/);
  assert.equal((app.match(/sourceBoundary: 'OSM-Boundaries'/g)||[]).length,2,
    'Source remains correctly translated through both language dictionaries');
  assert(app.includes("cardCartography: 'Geometrie și proveniență'"));
  assert(app.includes("cardCartography: 'Geometry & provenance'"));
});

test('WEB-R4.3a: canonical ACTUAL catalog SHA is unchanged',()=>{
  assert.equal(createHash('sha256').update(catalog).digest('hex'),
    '1f930079194c92dc0e02d6e675165dddec6f49db0a62357bcc61be0705125482');
});
