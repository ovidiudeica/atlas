import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import {shortTreeName,cardNameOf} from '../src/data/treeNames.mjs';
import {CHISINAU_ID,CHISINAU_CITY_ID,SECTOR_IDS,presentationParentId}
  from '../src/data/treeOverlay.mjs';
import {compareTreeSiblings} from '../src/data/treeOrder.mjs';

const bytes=readFileSync(new URL('../public/data/phase4/catalog.json.gz',import.meta.url));
const entities=JSON.parse(gunzipSync(bytes).toString('utf8')).entities;
const byId=new Map(entities.map(e=>[e.id,e]));

test('WEB-R4.5: the Chișinău ADM8 node has an actual place name in RO and EN',()=>{
  const municipality=byId.get(CHISINAU_ID);
  const city=byId.get(CHISINAU_CITY_ID);
  assert(municipality&&city);
  assert.equal(municipality.adminLevel,4);
  assert.equal(city.adminLevel,8);
  assert.notEqual(municipality.osmRelationId,city.osmRelationId);
  assert.equal(city.name,'Chișinău');
  assert(city.officialName.includes('Chișinău'));
  for(const lang of ['ro','en']){
    assert.equal(shortTreeName(municipality,lang),lang==='ro'?'Chișinău':'Chisinau');
    assert.equal(shortTreeName(city,lang),lang==='ro'?'Chișinău':'Chisinau',
      'ADM8 label must identify a place, not generic Oraș or City');
    assert.equal(cardNameOf(city,lang),lang==='ro'?'Orașul Chișinău':'City of Chisinau',
      'Standalone details retain their unambiguous city context');
  }
});

test('WEB-R4.5: city remains first ADM8 child and retains its five sectors',()=>{
  const city=byId.get(CHISINAU_CITY_ID);
  assert.equal(city.administrativeParentId,CHISINAU_ID);
  assert.equal(city.treeParentId,CHISINAU_ID);
  for(const view of ['all','administrative']){
    const siblings=entities.filter(e=>presentationParentId(e,view)===CHISINAU_ID)
      .sort((a,b)=>compareTreeSiblings(a,b,view,CHISINAU_ID,'ro'));
    assert.equal(siblings.length,19);
    assert.equal(siblings[0].id,CHISINAU_CITY_ID);
    for(const lang of ['ro','en']){
      assert.equal(shortTreeName(siblings[0],lang),lang==='ro'?'Chișinău':'Chisinau');
    }
    const sectors=entities.filter(e=>presentationParentId(e,view)===city.id);
    assert.equal(sectors.length,5);
    assert.deepEqual(new Set(sectors.map(e=>e.id)),new Set(SECTOR_IDS));
    for(const sector of sectors){
      assert.equal(sector.adminLevel,7);
      assert.equal(sector.administrativeParentId,CHISINAU_ID,
        'Presentation nesting must never silently change administrative parentage');
    }
  }
});

test('WEB-R4.5: correction affects presentation only; frozen ACTUAL unchanged',()=>{
  assert.equal(entities.length,4283);
  assert.equal(createHash('sha256').update(bytes).digest('hex'),
    '1f930079194c92dc0e02d6e675165dddec6f49db0a62357bcc61be0705125482');
  const app=readFileSync(new URL('../src/App.tsx',import.meta.url),'utf8');
  assert.match(app,/const isChisinauCity/);
  assert.match(app,/className="node-name"/);
  assert.match(app,/cardNameOf\(currentNode,lang\)/);
});
