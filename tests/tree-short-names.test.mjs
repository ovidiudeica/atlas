import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {shortTreeName} from '../src/data/treeNames.mjs';
const source=readFileSync(new URL('../src/data/territories.ts',import.meta.url),'utf8');
const app=readFileSync(new URL('../src/App.tsx',import.meta.url),'utf8');
test('all tree labels use presentation shortener, without altering official detail names',()=>{
  assert.match(source,/import \{ shortTreeName \} from '.\/treeNames\.mjs'/);
  assert.match(source,/return shortTreeName\(node,lang\)/);
  assert.match(app,/title=\{node\.officialName\}/);
  assert.match(app,/<h3>\{labelOf\(currentNode,lang\)\}<\/h3>/);
  assert.match(app,/<dt>\{t\.official\}<\/dt><dd>\{currentNode\.officialName\}<\/dd>/);
  assert.match(app,/currentNode\.country==='RO'\?'România':'Republica Moldova'/);
  assert.equal(shortTreeName({id:'osm-r58974'},'en'),'Moldova');
});
test('old names remain searchable beside bilingual display names and official source names',()=>{
  assert.match(source,/labelOf\(node,'ro'\), labelOf\(node,'en'\)/);
  for(const phrase of ['Republic of Moldova','Republica Moldova',
    'Unitățile din stânga Nistrului','Left-bank territorial units'])
    assert(source.includes(phrase),'Preserve search alias: '+phrase);
  assert.match(source,/node\.name, node\.shortName\?\.ro, node\.shortName\?\.en, node\.officialName/);
});
