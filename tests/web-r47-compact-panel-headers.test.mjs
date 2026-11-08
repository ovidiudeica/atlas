import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';

const app=readFileSync(new URL('../src/App.tsx',import.meta.url),'utf8');
const css=readFileSync(new URL('../src/styles.css',import.meta.url),'utf8');

test('WEB-R4.7: the six module panels have one header, in the toolbar with Reset and Close',()=>{
  assert.match(app,/MODULES\.find\(x=>x\.id===module\)\?\.\[lang\]/);
  assert.match(app,/<span aria-hidden="true">\{MODULES\.find\(x=>x\.id===module\)\?\.\[lang\]\}<\/span>/);
  assert.match(app,/className="module-pane-actions"/);
  assert.match(app,/className="module-reset" aria-label=\{t\.resetModule\}/);
  assert.match(app,/className="pane-close module-pane-close"/);
  assert.match(app,/className=\{drawer==='tree'\?'module-pane-actions':'detail-pane-actions'\}/);
  assert(!app.includes('className="panel-heading"'),'No redundant large heading remains in module or detail content');
  assert.match(app,/const treePanel=<section className="tree-content">\s*<label className="search">/);
  assert.match(app,/className="planned-module-description">\{t\.planned\}/);
  assert.equal((app.match(/className="planned-module-description"/g)||[]).length,2,
    'All five planned modules share the desktop/mobile no-duplicate-title view');
});
test('WEB-R4.7: card header reads Entity or Entitate, with the entity name only in the content',()=>{
  assert.match(app,/visible: 'Display geometry', details: 'Entity', select:/);
  assert.match(app,/visible: 'Afișează geometria', details: 'Entitate', select:/);
  assert.match(app,/<div className="pane-toolbar">\s*<span aria-hidden="true">\{t\.details\}<\/span>\s*<button type="button" className="pane-close"/);
  assert.match(app,/<div className="drawer-toolbar">[\s\S]*?<span aria-hidden="true">\{drawer==='tree'\?[\s\S]*?t\.details\}<\/span>/);
  assert.match(app,/<header className="entity-title">[\s\S]*?<h3 tabIndex=\{-1\}>\{cardNameOf\(currentNode,lang\)\}<\/h3>/);
  assert.match(app,/aria-label=\{t\.details\+': '\+cardNameOf\(currentNode,lang\)\}/);
  assert.match(app,/t\.details\+\(currentNode\?': '\+cardNameOf\(currentNode,lang\):''\)/);
  assert.doesNotMatch(app,/<span aria-hidden="true">\{cardNameOf\(currentNode,lang\)\}<\/span>/);
});
test('WEB-R4.7: compact headings preserve sticky, accessible desktop and mobile toolbars',()=>{
  assert.match(css,/\.pane-toolbar,\.drawer-toolbar\{\s*position:sticky;top:0;/);
  assert.match(css,/\.tree-content > \.search\{margin-top:14px\}/);
  assert.match(app,/className=\{'drawer drawer-'\+drawer\} role="dialog" aria-modal="true"/);
  assert.match(app,/className=\{'drawer-close'\+\(drawer==='tree'\?' module-pane-close':''\)\}/);
});
test('WEB-R4.7: unchanged certified catalogue',()=>{
  const raw=readFileSync(new URL('../public/data/phase4/catalog.json.gz',import.meta.url));
  assert.equal(createHash('sha256').update(raw).digest('hex'),
    '1f930079194c92dc0e02d6e675165dddec6f49db0a62357bcc61be0705125482');
});
