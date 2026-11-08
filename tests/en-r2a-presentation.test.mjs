import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import {shortTreeName,cardNameOf} from '../src/data/treeNames.mjs';

const compressed=readFileSync(new URL('../public/data/phase4/catalog.json.gz',import.meta.url));
const entities=JSON.parse(gunzipSync(compressed).toString('utf8')).entities;
const byId=new Map(entities.map(e=>[e.id,e]));
test('EN-R2a: every confirmed toponym fix is tied to the correct certified identity',()=>{
  assert.equal(entities.length,4283);
  assert.equal(createHash('sha256').update(compressed).digest('hex'),
    '1f930079194c92dc0e02d6e675165dddec6f49db0a62357bcc61be0705125482');
  assert.equal(shortTreeName(byId.get('stat-RO31'),'en'),'South-Muntenia');
  assert.equal(byId.get('stat-RO31').statisticalRoles[0].code,'RO31');
  assert.equal(shortTreeName(byId.get('osm-r13799978'),'en'),'Floresti-Stoenesti');
  assert.equal(shortTreeName(byId.get('osm-r13799978'),'ro'),'Florești-Stoenești');
  assert.equal(cardNameOf(byId.get('osm-r13799978'),'en'),'Floresti-Stoenesti');
  assert.equal(byId.get('osm-r13799978').officialName,'Comuna Florești-Stoenești');
  assert.equal(shortTreeName(byId.get('osm-r13799794'),'en'),'Stoenesti');
  assert.equal(byId.get('osm-r13799794').officialName,'Comuna Stoenești');
  assert.equal(byId.get('osm-r13799978').administrativeParentId,
    byId.get('osm-r13799794').administrativeParentId);
});
test('EN-R2a: EN interface uses localized names in country metadata and administrative navigation',()=>{
  const app=readFileSync(new URL('../src/App.tsx',import.meta.url),'utf8');
  assert.match(app,/lang==='ro'\?'România':'Romania'/);
  assert.match(app,/lang==='ro'\?'Republica Moldova':'Republic of Moldova'/);
  assert.match(app,/cardNameOf\(nodes\.get\(currentNode\.administrativeParentId\)!,lang\)/);
});
