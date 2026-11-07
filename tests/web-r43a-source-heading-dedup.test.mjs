import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';

const app=readFileSync(new URL('../src/App.tsx',import.meta.url),'utf8');
const catalog=readFileSync(new URL('../public/data/phase4/catalog.json.gz',import.meta.url));

test('WEB-R4.3a: module tree heading no longer duplicates OSMB snapshot',()=>{
  assert.match(app,/<div className="panel-heading"><h2>\{t\.tree\}<\/h2><\/div>/);
  assert.doesNotMatch(app,/<span className="eyebrow">\{t\.sourceSnapshot\}<\/span>/);
  assert(!app.includes('sourceSnapshot:'),'No unused duplicate header translations');
});

test('WEB-R4.3a: entity card heading no longer duplicates the snapshot',()=>{
  const details=app.slice(app.indexOf('const details=<section'),app.indexOf('// WEB-R3.5:'));
  assert.match(details,/<div className="panel-heading"><h2>\{t\.details\}<\/h2><\/div>/);
  assert.doesNotMatch(details,/sourceSnapshot/);
  assert.match(details,/className="entity-title"/);
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
