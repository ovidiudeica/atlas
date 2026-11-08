import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
import {officialSymbolsForEntity,REVIEWED_SYMBOL_IDS} from '../src/data/officialSymbols.mjs';
import {flagFileForEntity} from '../src/data/entityFlags.mjs';
import {shortTreeName} from '../src/data/treeNames.mjs';

const file=readFileSync(new URL('../public/data/phase4/catalog.json.gz',import.meta.url));
const entities=JSON.parse(gunzipSync(file).toString('utf8')).entities;
const byId=new Map(entities.map(n=>[n.id,n]));
const manifest=JSON.parse(readFileSync(
  new URL('../docs/audits/SIM-R2A-EVIDENCE.json',import.meta.url),'utf8'));
const expected=[
  ['osm-r1699032','gagauzia-coat.png','gagauzia-flag.svg','Unitatea Teritorială Autonomă Găgăuzia'],
  ['osm-r1748490','chisinau-coat.jpg',null,'municipiul Chișinău'],
  ['osm-r1813306','chisinau-botanica-coat.png',null,'sectorul Botanica'],
  ['osm-r1813297','chisinau-buiucani-coat.png',null,'Sectorul Buiucani'],
  ['osm-r58512','chisinau-centru-coat.png',null,'Sectorul Centru'],
  ['osm-r1813315','chisinau-ciocana-coat.png',null,'sectorul Ciocana'],
  ['osm-r1813316','chisinau-riscani-coat.png',null,'sectorul Rîșcani']
];

test('SIM-R2a: exact-seven official graphic assignments match the immutable Atlas identities',()=>{
  assert.equal(entities.length,4283);
  assert.equal(REVIEWED_SYMBOL_IDS.length,7);
  assert.deepEqual(new Set(REVIEWED_SYMBOL_IDS),new Set(expected.map(x=>x[0])));
  assert.equal(manifest.exactIds.length,7);
  for(const [id,coat,flag,official] of expected){
    const entity=byId.get(id);
    assert(entity,'Unknown Atlas ID '+id);
    assert.equal(entity.country,'MD');
    assert.equal(entity.officialName,official,id+' official identity mismatch');
    const reviewed=officialSymbolsForEntity(entity);
    assert(reviewed,id+' is reviewed');
    assert.equal(reviewed.coat,coat);
    assert.equal(reviewed.flag,flag);
    assert(reviewed.holder.ro&&reviewed.holder.en);
    assert(reviewed.legal.ro&&reviewed.legal.en);
    assert(reviewed.legalUrl.startsWith('https://'));
    assert(Object.isFrozen(reviewed),id+' stable config');
  }
});

test('SIM-R2a: no speculative symbol inheritance or wrongly reused place-name match',()=>{
  for(const id of [
    'osm-r1691801', // Municipality-level Chișinău ADM4, distinct from city ADM8
    'osm-r2607033', // ATULBD
    'stat-MD120',   // distinct statistical region
    'osm-r65335',  // separately administered de facto Pridnestrovie
    'osm-r1706978', // Gagauzia's Comrat district
    'osm-r19118615', // Comrat UAT
    'osm-r19118611', // Gaidar: its act exists but no image imported in this pilot
    'osm-r377733',  // Bucharest: amended 2024 graphic not yet verified
    'osm-r90689',  // Romania
    'osm-r58974'  // Moldova
  ]){
    assert(byId.has(id),'Atlas ID expected '+id);
    assert.equal(officialSymbolsForEntity(byId.get(id)),null,
      id+' must not receive a guessed or inherited local official symbol');
  }
  assert.equal(flagFileForEntity(byId.get('osm-r65335')),'pridnestrovie.svg');
  assert.equal(flagFileForEntity(byId.get('osm-r2607033')),'moldova.svg');
  assert.equal(flagFileForEntity(byId.get('osm-r90689')),'romania.svg');
  assert.equal(officialSymbolsForEntity(null),null);
  assert.equal(officialSymbolsForEntity({id:'osm-r0'}),null);
});

test('SIM-R2a: official image hashes and retained original CNH plate match the evidence registry',()=>{
  assert.equal(manifest.assets.length,8);
  for(const evidence of manifest.assets){
    const image=readFileSync(new URL('../public/symbols/'+evidence.file,import.meta.url));
    assert(image.length>100,'Nonempty official symbol: '+evidence.file);
    assert.equal(createHash('sha256').update(image).digest('hex'),
      evidence.sha256,evidence.file+' must be reproducible and source-proven');
    assert(evidence.source.startsWith('https://'),'Source citation required');
    assert(evidence.holder,'Identified source holder required');
  }
  const sourceImage=readFileSync(new URL('../docs/audits/assets/chisinau-sectors-cnh-2020.jpg',import.meta.url));
  assert.equal(createHash('sha256').update(sourceImage).digest('hex'),manifest.composite.sha256);
  assert.deepEqual(manifest.composite.nameOrder,['Botanica','Buiucani','Centru','Ciocana','Rîșcani']);
  const flag=readFileSync(new URL('../public/symbols/gagauzia-flag.svg',import.meta.url),'utf8');
  assert(flag.includes('<svg')&&flag.includes('</svg>'));
  assert.doesNotMatch(flag,/<script\b|<foreignObject\b|onload\s*=/i);
});

test('SIM-R2a: card visibly distinguishes verified coats from country flags and cites official act',()=>{
  const app=readFileSync(new URL('../src/App.tsx',import.meta.url),'utf8');
  const css=readFileSync(new URL('../src/styles.css',import.meta.url),'utf8');
  const component=readFileSync(new URL('../src/components/EntityCardSection.tsx',import.meta.url),'utf8');
  assert.match(app,/officialSymbolsForEntity\(currentNode\)/);
  assert.match(app,/officialSymbols\?\.coat/);
  assert.match(app,/kind="symbols"/);
  assert.match(app,/officialSymbols\.holder\[lang\]/);
  assert.match(app,/officialSymbols\.legalUrl/);
  assert.match(app,/Reproducere strict informativă/);
  assert.match(app,/Simboluri teritoriale/);
  assert.match(css,/\.territory-symbol-gallery img\{/);
  assert.match(component,/\| 'symbols'/);
});

test('SIM-R2a: canonical geometry and catalog remain completely unchanged',()=>{
  assert.equal(createHash('sha256').update(file).digest('hex'),
    '1f930079194c92dc0e02d6e675165dddec6f49db0a62357bcc61be0705125482');
  assert.equal(shortTreeName(byId.get('osm-r1699032'),'en'),'Gagauzia');
  assert.equal(byId.get('osm-r1699032').country,'MD');
});
