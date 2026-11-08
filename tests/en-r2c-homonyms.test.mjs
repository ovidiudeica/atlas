import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {englishSiblingQualifiers,shortTreeName} from '../src/data/treeNames.mjs';

const nodes=JSON.parse(gunzipSync(readFileSync(
  new URL('../public/data/phase4/catalog.json.gz',import.meta.url))).toString('utf8')).entities;
const byId=new Map(nodes.map(node=>[node.id,node]));
const expectedHomonyms=[
  ['osm-r10624607','osm-r10624608'], // Cornesti: town and village
  ['osm-r12496850','osm-r19090932'], // Tintareni
  ['osm-r19038433','osm-r19038440'], // Ocnita
  ['osm-r19045240','osm-r19045254'], // Varatic
  ['osm-r19055800','osm-r19055801','osm-r19055814'], // Donduseni
  ['osm-r19068255','osm-r19068260'], // Drochia
  ['osm-r19072238','osm-r19072257'], // Ghindesti
  ['osm-r19072254','osm-r19072273'], // Marculesti
  ['osm-r19100165','osm-r19100169','osm-r19100182'], // Recea
  ['osm-r9301463','osm-r8291058'] // Hlinaia - new EN homonym after R2b
];

test('EN-R2c: all ten remaining homonymous sibling groups carry unique contextual identifiers',()=>{
  const before=JSON.stringify(nodes);
  const hints=englishSiblingQualifiers(nodes);
  assert.equal(hints.size,22,'Ten groups, twenty-two sibling name collisions, including restored Hlinaia');
  for(const group of expectedHomonyms){
    const entities=group.map(id=>byId.get(id));
    assert(entities.every(Boolean));
    assert.equal(new Set(entities.map(n=>n.treeParentId)).size,1);
    assert.equal(new Set(entities.map(n=>n.adminLevel)).size,1);
    assert.equal(new Set(entities.map(n=>shortTreeName(n,'en'))).size,1);
    const labels=entities.map(n=>{
      const hint=hints.get(n.id);
      assert(hint, n.id+' must have a contextual type or source ID');
      assert(/^(Town|Village|Commune|Municipality|Administrative unit)(?: · (?:OSM|CUATM|SIRUTA) .+)?$/.test(hint),hint);
      return shortTreeName(n,'en')+' ('+hint+')';
    });
    assert.equal(new Set(labels).size,group.length,'No ambiguous EN child descriptions remain');
  }
  assert(!hints.has('osm-r13799794'),'Stoenesti is distinct after corrected name');
  assert(!hints.has('osm-r13799978'),'Floresti-Stoenesti is distinct after corrected name');
  assert.equal(JSON.stringify(nodes),before,'Never mutate catalog entities or identifiers');
});
test('EN-R2c: qualifiers are presentation-only and remain separate from tree labels',()=>{
  const app=readFileSync(new URL('../src/App.tsx',import.meta.url),'utf8');
  assert.match(app,/englishSiblingHints\.get\(node\.id\)/);
  assert.match(app,/className="node-disambiguation"/);
  assert.match(app,/accessibleRowLabel=enHint\?/);
  assert.equal(shortTreeName(byId.get('osm-r19055800'),'en'),'Donduseni');
});
