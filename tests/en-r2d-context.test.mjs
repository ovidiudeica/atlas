import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {shortTreeName,cardNameOf,territorialContextNote} from '../src/data/treeNames.mjs';

const nodes=JSON.parse(gunzipSync(readFileSync(
  new URL('../public/data/phase4/catalog.json.gz',import.meta.url))).toString('utf8')).entities;
const byId=new Map(nodes.map(n=>[n.id,n]));
test('EN-R2d: three distinct left-bank jurisdiction identities have separate labels and notes',()=>{
  const cases=[
    ['osm-r65335','Pridnestrovie','de facto'],
    ['osm-r2607033','ATULBD','Administrative-Territorial Units of the Left Bank of the Dniester'],
    ['stat-MD120','Transnistria','Statistical region']
  ];
  for(const [id,label,expectedNote] of cases){
    const node=byId.get(id);
    assert(node,'Missing immutable entity '+id);
    assert.equal(shortTreeName(node,'en'),label);
    assert.match(territorialContextNote(node,'en'),new RegExp(expectedNote,'i'));
    assert(territorialContextNote(node,'ro'));
  }
  assert.equal(new Set(cases.map(([id])=>byId.get(id).id)).size,3);
  assert.equal(territorialContextNote(byId.get('osm-r90689'),'en'),null);
});
test('EN-R2d: Chisinau detail is grammatical while original sources remain unchanged',()=>{
  const city=byId.get('osm-r1748490');
  assert.equal(shortTreeName(city,'en'),'Chisinau');
  assert.equal(cardNameOf(city,'en'),'City of Chisinau');
  assert.equal(cardNameOf(city,'ro'),'Orașul Chișinău');
  assert.equal(city.officialName,'municipiul Chișinău');
});
test('EN-R2d: contextual notes and tooltips respect the UI locale',()=>{
  const app=readFileSync(new URL('../src/App.tsx',import.meta.url),'utf8');
  assert.match(app,/territorialContextNote\(currentNode,lang\)/);
  assert.match(app,/title=\{lang==='ro'\?node\.officialName:accessibleRowLabel\}/);
});
