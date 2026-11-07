import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {shortTreeName} from '../src/data/treeNames.mjs';
import {compareTreeSiblings,NISTRIAN_PARENT_ID,NISTRIAN_CITY_COUNCILS}
  from '../src/data/treeOrder.mjs';
const catalog=JSON.parse(gunzipSync(readFileSync(
  new URL('../public/data/phase4/catalog.json.gz',import.meta.url))).toString('utf8'));
const entries=catalog.entities,byId=new Map(entries.map(e=>[e.id,e]));
const parent=byId.get(NISTRIAN_PARENT_ID);
const children=entries.filter(e=>e.treeParentId===NISTRIAN_PARENT_ID);
const ids=children.map(e=>e.id);
const expectedIds=[
  'osm-r1702219','osm-r944727','osm-r1702218','osm-r1702214',
  'osm-r1702215','osm-r1702217','osm-r1702216'
];
test('Nistrenia is the PMR source parent with exactly five raions and two city councils',()=>{
  assert.equal(entries.length,4283);
  assert.equal(parent.name,'Nistrenia');
  assert.equal(parent.officialName,'Republica Moldovenească Nistreană');
  assert.equal(parent.adminLevel,3);
  assert.equal(children.length,7);
  assert.deepEqual(new Set(ids),new Set(expectedIds));
  assert(children.every(e=>e.administrativeParentId===parent.id));
  assert(children.every(e=>e.adminLevel===5));
  const councils=children.filter(e=>NISTRIAN_CITY_COUNCILS.includes(e.id));
  assert.equal(councils.length,2);
  assert(councils.every(e=>/^Sovetul orășenesc/.test(e.officialName)));
  assert(children.filter(e=>!NISTRIAN_CITY_COUNCILS.includes(e.id))
    .every(e=>/^Raionul /.test(e.officialName)));
});
test('Romanian: Tiraspol and Bender first, then raions south-to-north',()=>{
  for(const view of ['administrative','all']){
    const sorted=[...children].sort((a,b)=>compareTreeSiblings(a,b,view,parent.id,'ro'));
    assert.deepEqual(sorted.map(e=>shortTreeName(e,'ro')),
      ['Tiraspol','Bender','Slobozia','Grigoriopol','Dubăsari','Rîbnița','Camenca']);
    assert.deepEqual(sorted.map(e=>e.id),expectedIds);
  }
});
test('English: same fixed geographical order despite translated raion exonyms',()=>{
  for(const view of ['administrative','all']){
    const sorted=[...children].sort((a,b)=>compareTreeSiblings(a,b,view,parent.id,'en'));
    assert.deepEqual(sorted.map(e=>shortTreeName(e,'en')),
      ['Tiraspol','Bender','Slobdzeya','Grigoriopol','Dubossary','Rybnitsa','Kamenka']);
    assert.deepEqual(sorted.slice(0,2).map(e=>e.id),
      ['osm-r1702219','osm-r944727']);
    assert.deepEqual(sorted.map(e=>e.id),expectedIds);
  }
});
test('sort changes neither identities nor other hierarchy behavior',()=>{
  assert.equal(shortTreeName(parent,'ro'),'Nistrenia');
  assert.equal(shortTreeName(parent,'en'),'Pridnestrovie');
  const bender=byId.get('osm-r944727'),tiraspol=byId.get('osm-r1702219');
  assert.equal(bender.shortName.en,'Bendery City Council');
  assert.equal(tiraspol.shortName.en,'Tiraspol City Council');
  assert.equal(bender.officialName,'Sovetul orășenesc Bender');
  assert.equal(tiraspol.officialName,'Sovetul orășenesc Tiraspol');
  assert.equal(shortTreeName(bender,'en'),'Bender');
  assert.equal(shortTreeName(tiraspol,'en'),'Tiraspol');
  const other=entries.filter(e=>e.administrativeParentId==='osm-r58974'
    &&e.id!=='osm-r65335').slice(0,8);
  const reference=[...other].sort((a,b)=>a.name.localeCompare(b.name,'ro'));
  const actual=[...other].sort((a,b)=>
    compareTreeSiblings(a,b,'administrative','osm-r58974','ro'));
  assert.deepEqual(actual.map(e=>e.id),reference.map(e=>e.id));
});
