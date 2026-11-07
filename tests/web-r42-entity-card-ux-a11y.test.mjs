import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {presentationParentId} from '../src/data/treeOverlay.mjs';
import {compareTreeSiblings} from '../src/data/treeOrder.mjs';

const read = path => readFileSync(new URL('../'+path,import.meta.url),'utf8');
const app=read('src/App.tsx');
const styles=read('src/styles.css');
const section=read('src/components/EntityCardSection.tsx');
const catalogBytes=readFileSync(new URL('../public/data/phase4/catalog.json.gz',import.meta.url));
const entities=JSON.parse(gunzipSync(catalogBytes).toString('utf8')).entities;

test('WEB-R4.2: certified ACTUAL remains untouched by UX/a11y changes',()=>{
  assert.equal(entities.length,4283);
  assert.equal(createHash('sha256').update(catalogBytes).digest('hex'),
    '1f930079194c92dc0e02d6e675165dddec6f49db0a62357bcc61be0705125482');
});

test('WEB-R4.2: child links are based on presentation tree ordering, not inferred legal hierarchy',()=>{
  const bucharest=entities.find(x=>x.id==='osm-r377733');
  const sourceBefore=JSON.stringify(entities);
  const children=entities.filter(x=>presentationParentId(x,'all')===bucharest.id)
    .sort((a,b)=>compareTreeSiblings(a,b,'all',bucharest.id,'ro'));
  assert.equal(children.length,6);
  assert.equal(new Set(children.map(x=>x.id)).size,6);
  assert(children.every(x=>x.adminLevel===9));
  assert.equal(JSON.stringify(entities),sourceBefore);
  assert.match(app,/const cardChildren=currentNode\?\(hierarchy\.get\(currentNode\.id\)\|\|\[\]\):\[\]/);
  assert.match(app,/cardChildren\.slice\(0,cardChildrenShown\)/);
  assert.match(app,/className="entity-child-list"/);
  assert.match(app,/className="entity-child-link"/);
  assert.match(app,/cardChildrenShown\+12/);
  assert.match(app,/cardChildrenPage\?\.id===selected/);
  assert.match(section,/\| 'children'/);
});

test('WEB-R4.2: card-local navigation transfers focus and resets its own scroll position',()=>{
  const start=app.indexOf('function chooseRelated(id:string)');
  const end=app.indexOf('function toggleModulePanel',start);
  assert(start>=0&&end>start);
  const flow=app.slice(start,end);
  assert.match(flow,/pendingCardNavigationRef\.current=id/);
  assert.match(flow,/choose\(id\)/);
  assert.match(flow,/heading\.focus\(\{preventScroll:true\}\)/);
  assert.match(flow,/panel\?\.scrollTo\(\{top:0,behavior:'auto'\}\)/);
  assert.match(flow,/\[selected,drawer,detailPanelOpen\]/);
  assert.doesNotMatch(flow,/setVisible\(|fitBounds\(|resetGeometries\(/);
  assert.match(app,/<h3 tabIndex=\{-1\}>\{labelOf\(currentNode,lang\)\}<\/h3>/);
  assert.match(app,/onClick=\{\(\)=>chooseRelated\(parent\.id\)\}/);
  assert.match(app,/onClick=\{\(\)=>chooseRelated\(child\.id\)\}/);
  assert.match(app,/onClick=\{\(\)=>chooseRelated\(crumb\.id\)\}/);
});

test('WEB-R4.2: closing controls occupy a sticky toolbar and name the selected dialog',()=>{
  assert.match(app,/className="pane-toolbar"/);
  assert.match(app,/className="drawer-toolbar"/);
  assert(app.includes("aria-label={t.details+': '+labelOf(currentNode,lang)}"));
  assert(app.includes("t.details+(currentNode?': '+labelOf(currentNode,lang):'')"));
  assert.match(app,/document\.querySelector<HTMLButtonElement>\('\.header-entity-action'\)\?\.focus\(\)/);
  assert.match(styles,/\.pane-toolbar,\.drawer-toolbar\{/);
  assert.match(styles,/\.pane-toolbar \.pane-close,\.drawer-toolbar \.drawer-close\{/);
  assert.match(styles,/position:static;float:none/);
  assert.match(styles,/scroll-padding-top:66px/);
  assert.match(styles,/\.entity-card \.entity-title h3:focus-visible/);
});

test('WEB-R4.2: statistical codes displayed once, source records remain retractable',()=>{
  const card=app.slice(app.indexOf('const details=<section'),app.indexOf('// WEB-R3.5:'));
  assert.match(card,/className="entity-statistical-roles" aria-label=\{t\.statisticalRole\}/);
  assert(!card.includes('<dt>{t.statisticalRole}</dt>'));
  assert.match(card,/kind="records" collapsible/);
  assert.match(card,/t\.pmrCadastralCaveat/);
  assert.match(card,/t\.detailNote/);
  assert.match(card,/currentNode\.osmRelationId!==null/);
});
