import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
import {readFileSync} from 'node:fs';
import {entityCardRoles, statisticalCodeIndex, verifiedStatisticalParent}
  from '../src/data/entityCardRoles.mjs';
import {presentationParentId} from '../src/data/treeOverlay.mjs';
import {shortTreeName,cardNameOf} from '../src/data/treeNames.mjs';

const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const css=read('src/styles.css'),app=read('src/App.tsx');
const source=readFileSync(new URL('../public/data/phase4/catalog.json.gz',import.meta.url));
const entities=JSON.parse(gunzipSync(source).toString('utf8')).entities;
const index=new Map(entities.map(e=>[e.id,e]));
const byCode=statisticalCodeIndex(entities);

function rgb(hex){
  assert.match(hex,/^#[0-9a-f]{6}$/i);
  return [1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255);
}
function luminance(hex){
  const [r,g,b]=rgb(hex).map(c=>c<=0.04045?c/12.92:((c+0.055)/1.055)**2.4);
  return r*0.2126+g*0.7152+b*0.0722;
}
function contrast(a,b){
  const [lighter,darker]=[luminance(a),luminance(b)].sort((a,b)=>b-a);
  return (lighter+0.05)/(darker+0.05);
}
function cssColor(regex,label){
  const match=css.match(regex);
  assert(match,'Missing explicit CSS color for '+label);
  return match[1];
}

test('WEB-R4.3 acceptance: canonical ACTUAL unchanged, 4,283 entities in two countries',()=>{
  assert.equal(entities.length,4283);
  assert.equal(createHash('sha256').update(source).digest('hex'),
    '1f930079194c92dc0e02d6e675165dddec6f49db0a62357bcc61be0705125482');
  const ro=entities.filter(e=>e.country==='RO').length;
  assert.deepEqual({ro,md:entities.length-ro},{ro:3241,md:1042});
  assert(index.has('osm-r377733')&&index.has('osm-r1691801')&&
    index.has('osm-r1699032')&&index.has('osm-r944727')&&
    index.has('stat-MD120')&&index.has('siruta-u64096'));
});

test('WEB-R4.3 acceptance: WCAG 2.2 AA small-text contrast >=4.5:1',()=>{
  const children=cssColor(/\.entity-child-link>small\{[^}]*color:(#[0-9a-f]{6})/i,'children');
  const statistics=cssColor(/\.entity-statistical-roles small\{[^}]*color:(#[0-9a-f]{6})/i,'statistics');
  assert(contrast(children,'#f9fcf9')>=4.5,
    'Child role contrast '+contrast(children,'#f9fcf9').toFixed(2)+' < 4.5');
  assert(contrast(statistics,'#f8fbf9')>=4.5,
    'Statistical label contrast '+contrast(statistics,'#f8fbf9').toFixed(2)+' < 4.5');
});

test('WEB-R4.3 acceptance: focus indicators >=3:1 against white/section background',()=>{
  const selectors=[
    /\.entity-parent-link:focus-visible\{outline:3px solid (#[0-9a-f]{6})/i,
    /\.entity-card-section>summary:focus-visible\{outline:3px solid (#[0-9a-f]{6})/i,
    /\.entity-card \.entity-title h3:focus\{outline:3px solid (#[0-9a-f]{6})/i,
    /\.pane-toolbar \.pane-close:focus-visible,\.drawer-toolbar \.drawer-close:focus-visible\{\s*outline:3px solid (#[0-9a-f]{6})/i
  ];
  for(const [i,regex] of selectors.entries()){
    const ring=cssColor(regex,'focus ring '+i);
    assert(contrast(ring,'#ffffff')>=3,'Focus ring '+i+' on white');
    assert(contrast(ring,'#f3f8f4')>=3,'Focus ring '+i+' on section background');
  }
  assert.match(css,/\.entity-card \.entity-child-link:focus-visible/);
  assert.match(css,/\.entity-card \.entity-children-more:focus-visible/);
});

test('WEB-R4.3 acceptance: Romanian and Moldovan identities stay source-faithful',()=>{
  const b=entityCardRoles(index.get('osm-r377733'));
  assert.deepEqual(b.administrative.map(x=>[x.label,x.basis,x.registryCode]),
    [['ADM 4','OSM','403'],['ADM 8','SIRUTA','179132']]);
  assert.equal(b.cartographic.osmRelationId,377733);
  assert.equal(b.statistical[0].label,'NUTS 3');
  const ch=entityCardRoles(index.get('osm-r1691801'));
  const city=entityCardRoles(index.get('osm-r1748490'));
  assert.equal(ch.cartographic.osmAdminLevel,4);
  assert.equal(city.cartographic.osmAdminLevel,8);
  assert.notEqual(ch.cartographic.osmRelationId,city.cartographic.osmRelationId);
  assert.equal(entityCardRoles(index.get('osm-r1699032')).statistical[0].label,'NTS 3');
  assert.equal(entityCardRoles(index.get('stat-MD120')).cartographic.osmAdminLevel,null);
  assert.equal(index.get('siruta-u64096').osmRelationId,null,'Never fabricate Brețcu OSM ID');
  assert.equal(index.get('osm-r944727').registry,null,'Do not fabricate PMR CUATM code');
});

test('WEB-R4.3 acceptance: no hidden legal reparenting in card navigation',()=>{
  const municipality=index.get('osm-r1691801');
  const city=index.get('osm-r1748490');
  assert.equal(presentationParentId(city,'all'),municipality.id);
  const sectors=entities.filter(e=>presentationParentId(e,'all')===city.id);
  assert.equal(sectors.length,5);
  for(const e of sectors)assert.notEqual(e.administrativeParentId,city.id,
    'Presentation nesting is not a legal administrative parent');
  for(const e of [index.get('osm-r377733'),index.get('osm-r1699032'),municipality]){
    const roles=entityCardRoles(e);
    for(const role of roles.statistical){
      const p=verifiedStatisticalParent(byCode,role);
      if(p)assert(p.statisticalRoles.some(r=>
        r.classification===role.classification&&r.code===role.parentCode));
    }
  }
  const scope=app.slice(app.indexOf('function chooseRelated('),app.indexOf('function toggleModulePanel'));
  assert(!scope.includes('setVisible(')&&!scope.includes('fitBounds('));
  assert(scope.includes('heading.focus({preventScroll:true})'));
  assert(scope.includes('first.focus()'));
});

test('WEB-R4.3 acceptance: accessible, bilingual and retractable card contract remains',()=>{
  assert(app.includes("aria-label={t.details+': '+cardNameOf(currentNode,lang)}"));
  assert(app.includes("t.details+(currentNode?': '+cardNameOf(currentNode,lang):'')"));
  assert.match(app,/aria-modal="true"/);
  assert.match(app,/<h3 tabIndex=\{-1\}>\{cardNameOf\(currentNode,lang\)\}<\/h3>/);
  assert.match(app,/aria-label=\{t\.cardOpenChild\+': '\+cardNameOf\(child,lang\)\}/);
  assert.match(app,/aria-label=\{t\.cardOpenParent\+': '\+cardNameOf\(parent,lang\)\}/);
  assert.match(app,/kind="records" collapsible/);
  assert.match(app,/aria-label=\{t\.statisticalRole\}/);
  assert.match(app,/t\.pmrCadastralCaveat/);
  assert.match(app,/currentNode\.osmRelationId!==null/);
  assert.match(app,/exportGeoJSON/);
  assert.match(app,/exportCSV/);
  assert.match(app,/copyPermalink/);
  assert.match(app,/cardChildren\.slice\(0,cardChildrenShown\)/);
});

test('WEB-R4.3 and R4.5: Chișinău card remains contextual and tree names the ADM8 city',()=>{
  const city=index.get('osm-r1748490');
  assert.equal(shortTreeName(city,'ro'),'Chișinău');
  assert.equal(shortTreeName(city,'en'),'Chisinau');
  assert.equal(cardNameOf(city,'ro'),'Orașul Chișinău');
  assert.equal(cardNameOf(city,'en'),'City of Chisinau');
  for(const other of ['osm-r1691801','osm-r377733','osm-r944727']){
    const entity=index.get(other);
    for(const lang of ['ro','en'])
      assert.equal(cardNameOf(entity,lang),shortTreeName(entity,lang));
  }
  assert.match(app,/import \{ cardNameOf \} from '.\/data\/treeNames\.mjs'/);
  assert.match(app,/<h3 tabIndex=\{-1\}>\{cardNameOf\(currentNode,lang\)\}<\/h3>/);
});
