import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {shortTreeName} from '../src/data/treeNames.mjs';

const entities=JSON.parse(gunzipSync(readFileSync(
  new URL('../public/data/phase4/catalog.json.gz',import.meta.url))).toString('utf8')).entities;
const byId=new Map(entities.map(n=>[n.id,n]));
const reviewed=[
  ['osm-r1702216','Camenca','Kamenka District'],
  ['osm-r1702217','Ribnita','Rybnitsa District'],
  ['osm-r1702215','Dubasari','Dubossary District'],
  ['osm-r1702218','Slobozia','Slobdzeya District'],
  ['osm-r6879649','Chitcani','Kitskany'],
  ['osm-r8291058','Hlinaia','Glinoye']
];
test('EN-R2b: reviewed names match each immutable source identity and previous aliases survive',()=>{
  for(const [id,display,source] of reviewed){
    const node=byId.get(id);
    assert(node,'Verified OSM identity '+id);
    assert.equal(shortTreeName(node,'en'),display,id);
    assert.equal(node.shortName.en,source,id+' native English source is intact');
    assert(node.roles.includes('administrative'));
    assert(node.osmRelationId!==null);
  }
  assert.equal(shortTreeName(byId.get('osm-r65335'),'en'),'Pridnestrovie');
  assert.equal(shortTreeName(byId.get('osm-r2607033'),'en'),'ATULBD');
  assert.equal(shortTreeName(byId.get('stat-MD120'),'en'),'Transnistria');
});
test('EN-R2b: search retains every Russian-derived source alias and the new English display name',()=>{
  const territories=readFileSync(new URL('../src/data/territories.ts',import.meta.url),'utf8');
  assert.match(territories,/node\.shortName\?\.ro, node\.shortName\?\.en, node\.officialName/);
  assert.match(territories,/labelOf\(node,'ro'\), labelOf\(node,'en'\)/);
  assert.match(territories,/tags\['name:ro'\], tags\['name:en'\]/);
});
