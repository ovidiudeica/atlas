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
  'osm-r944727','osm-r1702219','osm-r1702214','osm-r1702215',
  'osm-r1702217','osm-r1702218','osm-r1702216'
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
test('Romanian: Bender 32, Tiraspol 33, raion seat codes 40–66 ascending',()=>{
  for(const view of ['administrative','all']){
    const sorted=[...children].sort((a,b)=>compareTreeSiblings(a,b,view,parent.id,'ro'));
    assert.deepEqual(sorted.map(e=>shortTreeName(e,'ro')),
      ['Bender','Tiraspol','Grigoriopol','Dubăsari','Rîbnița','Slobozia','Camenca']);
    assert.deepEqual(sorted.map(e=>e.id),expectedIds);
  }
});
test('English: same published cadastral code order despite translated exonyms',()=>{
  for(const view of ['administrative','all']){
    const sorted=[...children].sort((a,b)=>compareTreeSiblings(a,b,view,parent.id,'en'));
    assert.deepEqual(sorted.map(e=>shortTreeName(e,'en')),
      ['Bender','Tiraspol','Grigoriopol','Dubossary','Rybnitsa','Slobdzeya','Kamenka']);
    assert.deepEqual(sorted.slice(0,2).map(e=>e.id),
      ['osm-r944727','osm-r1702219']);
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
  // Nistrenia's seven ADM5 without CUATM use PMR cadastral seat codes,
  // while Moldova's coded direct ADM4 children now use statistical-code
  // precedence where a node has both roles, then CUATM for other children.
  const other=entries.filter(e=>e.administrativeParentId==='osm-r58974'
    &&e.id!=='osm-r65335');
  const reference=[...other].sort((a,b)=>{
    const sa=a.statisticalRoles?.[0]?.code,sb=b.statisticalRoles?.[0]?.code;
    if(sa||sb){
      if(!sa||!sb)return sa?-1:1;
      return sa.localeCompare(sb,'en');
    }
    const ca=a.registry?.code,cb=b.registry?.code;
    if(!ca||!cb)return ca?-1:cb?1:a.id.localeCompare(b.id,'en');
    return ca.localeCompare(cb,'en')||a.id.localeCompare(b.id,'en');
  });
  const actual=[...other].sort((a,b)=>
    compareTreeSiblings(a,b,'administrative','osm-r58974','ro'));
  assert.deepEqual(actual.map(e=>e.id),reference.map(e=>e.id));
});
