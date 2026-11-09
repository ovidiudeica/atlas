import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import {flagFileForEntity} from '../src/data/entityFlags.mjs';

const gz=readFileSync(new URL('../public/data/phase4/catalog.json.gz',import.meta.url));
const entities=JSON.parse(gunzipSync(gz).toString('utf8')).entities;
const byId=new Map(entities.map(n=>[n.id,n]));

test('WEB-R4.8 flags are self-contained assets, not OS-dependent Unicode emoji',()=>{
  const app=readFileSync(new URL('../src/App.tsx',import.meta.url),'utf8');
  const css=readFileSync(new URL('../src/styles.css',import.meta.url),'utf8');
  assert.match(app,/import \{ coatImageForEntity \} from '.\/data\/entityCoat\.mjs'/);
  assert.match(app,/const headerCoatSrc=currentNode\?coatImageForEntity\(currentNode,import\.meta\.env\.BASE_URL\):null/);
  assert.match(app,/src=\{headerCoatSrc\}/);
  assert.match(app,/src=\{symbolAssetUrl\(asset\)\}/,
    'National/de facto flags remain in territorial-symbol gallery');
  assert.doesNotMatch(app,/flagFileForEntity\(currentNode\)/,
    'Never revert to a national flag in the card heading');
  assert.match(css,/\.entity-title \.flag img\{[^}]*object-fit:contain/);
  assert(!app.includes('🇷🇴')&&!app.includes('🇲🇩'));
  for(const flag of ['romania','moldova','pridnestrovie']){
    const s=readFileSync(new URL('../public/flags/'+flag+'.svg',import.meta.url),'utf8');
    assert(s.includes('<svg')&&s.includes('</svg>'),flag+' complete SVG');
    assert.doesNotMatch(s,/<script\b|<foreignObject\b|onload\s*=/i,flag+' no executable payload');
  }
});
test('WEB-R4.8 only exact de facto Pridnestrovie receives own flag',()=>{
  const pmr=byId.get('osm-r65335');
  assert(pmr);
  assert.equal(pmr.country,'MD','Do not change certified country');
  assert.equal(flagFileForEntity(pmr),'pridnestrovie.svg');
  for(const id of ['osm-r2607033','stat-MD120','osm-r58974'])
    assert.equal(flagFileForEntity(byId.get(id)),'moldova.svg',id+' distinct from de facto Pridnestrovie');
  assert.equal(flagFileForEntity(byId.get('osm-r90689')),'romania.svg');
  assert.equal(flagFileForEntity(null),null);
  assert.equal(flagFileForEntity({id:'not-a-place',country:'unknown'}),null);
});
test('WEB-R4.8 source catalog, identities and geometries are untouched',()=>{
  assert.equal(entities.length,4283);
  assert.equal(createHash('sha256').update(gz).digest('hex'),
    '1f930079194c92dc0e02d6e675165dddec6f49db0a62357bcc61be0705125482');
});
