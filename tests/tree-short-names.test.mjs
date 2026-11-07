import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../src/data/territories.ts',import.meta.url),'utf8');
const app=readFileSync(new URL('../src/App.tsx',import.meta.url),'utf8');

test('tree names are short while official metadata stays unchanged',()=>{
  assert.match(source,/node\.id === 'osm-r58974'\) return 'Moldova'/);
  assert.match(source,/MD120: \['Stânga Nistrului', 'Left Bank'\]/);
  assert.match(source,/return node\.shortName\?\.\[lang\] \|\| node\.name/);
  assert.match(app,/title=\{node\.officialName\}/);
  assert.match(app,/<h3>\{currentNode\.officialName\}<\/h3>/);
  assert.match(app,/currentNode\.country==='RO'\?'România':'Republica Moldova'/);
});
test('official and bilingual short names remain searchable',()=>{
  assert.match(source,/labelOf\(node,'ro'\), labelOf\(node,'en'\)/);
  for(const phrase of ['Republic of Moldova','Republica Moldova',
    'Unitățile din stânga Nistrului','Left-bank territorial units'])
    assert(source.includes(phrase),'Preserve search alias: '+phrase);
  assert.match(source,/node\.statisticalRoles\.some\(role => role\.code === 'MD120'\)/);
});
