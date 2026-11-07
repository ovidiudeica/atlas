import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { resolveTerritorialRoles } from '../src/data/territoryRoles.mjs';

const read = path => readFileSync(new URL('../'+path,import.meta.url),'utf8');
const app = read('src/App.tsx');
const css = read('src/styles.css');
const card = read('src/components/EntityCardSection.tsx');
const compressed = readFileSync(new URL('../public/data/phase4/catalog.json.gz',import.meta.url));
const catalog = JSON.parse(gunzipSync(compressed).toString('utf8')).entities;
const byId = new Map(catalog.map(node=>[node.id,node]));

test('WEB-R4.0: reusable presentation-only component exposes semantic sections and accessible disclosure',()=>{
  assert.match(app,/import \{ EntityCardSection \} from '\.\/components\/EntityCardSection'/);
  assert.match(card,/import type \{ ReactNode \} from 'react'/);
  assert.match(card,/<section className=\{className\} aria-label=\{title\}>/);
  assert.match(card,/<details className=\{className \+ ' entity-card-section--collapsible'\}>/);
  assert.match(card,/<summary>\{title\}<\/summary>/);
  for(const kind of ['identity','administrative','statistical','hierarchy','cartographic','records'])
    assert(app.includes('kind="'+kind+'"'),'Missing card section: '+kind);
  assert.match(app,/kind="records" collapsible/);
  assert.match(app,/className="entity-card" key=\{currentNode\.id\}/);
  assert.match(css,/\/\* WEB-R4\.0/);
  assert.match(css,/\.entity-statistical-roles/);
  assert.match(css,/@media\(max-width:700px\)/);
});

test('WEB-R4.0: card sections keep independent semantics and truthfully empty source IDs',()=>{
  assert.match(app,/currentNode\.osmRelationId!==null/);
  assert.match(app,/<dt>\{t\.osmId\}<\/dt>/);
  assert.match(app,/currentNode\.adminLevel===null\?'':currentNode\.adminLevel/);
  assert.match(app,/municipalRoleClarification\(currentNode,lang\)/);
  assert.match(app,/cardRoles\.statistical\.map\(\(role,index\)=>/);
  assert.match(app,/role\.parentCode&&<small>/);
  assert.match(app,/t\.statVersion/);
  assert.match(app,/currentNode\.administrativeParentId/);
  assert.match(app,/currentNode\.treeParentId/);
  assert.match(app,/t\.detailNote/);
  assert.match(app,/t\.pmrCadastralCaveat/);
  assert.match(app,/t\.relationshipNote/);
  assert.match(app,/<dt>\{t\.pmrCadastralCode\}<\/dt><dd>\{pmrCadastralSeatCode\(currentNode\.id\)\}<\/dd>/);
  assert.match(app,/PMR_CADASTRAL_SOURCE\.url/);
  assert.match(app,/currentNode\.registry\?\.record&&<details className="raw-details">/);
  assert.match(app,/t\.raw/);
});

test('WEB-R4.0: actions and mobile/desktop panels remain controlled by App, not cards',()=>{
  assert.match(app,/currentNode&&detailPanelOpen&&<aside className="detail-sidebar"/);
  assert.match(app,/drawer==='tree'\?/);
  assert.match(app,/const details=<section className="detail-content">/);
  assert.match(app,/onClick=\{\(\)=>toggleVisible\(currentNode\.id\)\}/);
  assert.match(app,/void locate\(currentNode\.id\)/);
  assert.match(app,/performExport\('geojson','selected'\)/);
  assert.match(app,/performExport\('csv','selected'\)/);
  assert.match(app,/copyPermalink\(\)/);
  assert.doesNotMatch(card,/loadGeometryShard|setVisible|setSelected|fetch\(/);
});

test('WEB-R4.0: certified ACTUAL bytes and critical role distinctions are unchanged',()=>{
  assert.equal(createHash('sha256').update(compressed).digest('hex'),
    '1f930079194c92dc0e02d6e675165dddec6f49db0a62357bcc61be0705125482');
  assert.equal(catalog.length,4283);
  const bucharest=byId.get('osm-r377733');
  const bucharestRoles=resolveTerritorialRoles(bucharest);
  assert.equal(bucharestRoles.cartographic.osmAdminLevel,4);
  assert.equal(bucharestRoles.administrative.length,2);
  assert.equal(bucharestRoles.administrative[1].registryCode,'179132');
  assert.equal(byId.get('osm-r1691801').adminLevel,4);
  assert.equal(byId.get('osm-r1748490').adminLevel,8);
  assert.notEqual(byId.get('osm-r1691801').osmRelationId,byId.get('osm-r1748490').osmRelationId);
  assert.equal(byId.get('osm-r944727').registry,null);
});
