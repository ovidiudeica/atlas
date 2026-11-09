import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import {officialNameForLocale,shortTreeName} from '../src/data/treeNames.mjs';

const bytes=readFileSync(new URL('../public/data/phase4/catalog.json.gz',import.meta.url));
const nodes=JSON.parse(gunzipSync(bytes).toString('utf8')).entities;
const byId=new Map(nodes.map(n=>[n.id,n]));
const full=(id,lang)=>officialNameForLocale(byId.get(id),lang);

test('WEB-EN-OFFICIAL: all 4,283 official source names remain unchanged in RO and the catalog is immutable',()=>{
 assert.equal(nodes.length,4283);
 assert.equal(byId.size,4283);
 assert.equal(createHash('sha256').update(bytes).digest('hex'),
  '1f930079194c92dc0e02d6e675165dddec6f49db0a62357bcc61be0705125482');
 const before=JSON.stringify(nodes);
 for(const node of nodes){
  assert.equal(officialNameForLocale(node,'ro'),node.officialName,node.id+' must preserve canonical officialName');
  const en=officialNameForLocale(node,'en');
  assert(typeof en==='string'&&en.trim()===en&&en.length>0,node.id+' empty EN rendering');
  assert(en===en.trim(),node.id+' EN rendering not trimmed');
 }
 assert.equal(JSON.stringify(nodes),before,'Locale switching cannot mutate source identities');
});

test('WEB-EN-OFFICIAL: reviewed national, municipal, county and statistical English names',()=>{
 assert.equal(full('osm-r90689','en'),'Romania');
 assert.equal(full('osm-r58974','en'),'Republic of Moldova');
 assert.equal(full('osm-r1748490','en'),'Municipality of Chisinau');
 assert.equal(full('osm-r1748490','ro'),'municipiul Chișinău');
 assert.equal(full('osm-r194271','en'),'Alba County');
 assert.equal(full('osm-r2607033','en'),'Administrative-Territorial Units of the Left Bank of the Dniester');
 assert.equal(full('stat-MD120','en'),'Administrative-Territorial Units of the Left Bank of the Dniester');
 assert.equal(full('stat-MD11','en'),'Western Part (Right Bank of the Dniester)');
 assert.equal(full('stat-MD12','en'),'Eastern Part (Left Bank of the Dniester)');
 assert.equal(full('stat-RO1','en'),'Macroregion One');
 assert.equal(full('stat-RO11','en'),'North-West');
 assert.equal(shortTreeName(byId.get('osm-r1748490'),'en'),'Chisinau',
  'Tree labels remain compact; official-name field gives the complete form');
});

test('WEB-EN-OFFICIAL: qualified names translate types; nonverified legal descriptors retain originals',()=>{
 const node=(id,officialName,english,name='Loc')=>({
  id,officialName,name,roles:['administrative'],
  shortName:{en:english,ro:name},sourceTags:{}
 });
 const examples=[
  ['Judeţul Braşov','Brasov County','Brasov'],
  ['Raionul Cahul','Cahul District','Cahul'],
  ['Municipiul Bălți','Municipality of Balti','Balti'],
  ['Oraşul Băicoi','Town of Baicoi','Baicoi'],
  ['Comuna Brețcu','Bretcu Commune','Bretcu'],
  ['Satul Nou','Nou Village','Nou'],
  ['Sovetul sătesc Chițcani','Chitcani Village Council','Chitcani'],
  ['Sovetul orășenesc Tiraspol','Tiraspol Town Council','Tiraspol'],
  ['Sectorul Buiucani','Buiucani Sector','Buiucani'],
  ['Regiunea Nord','North Region','North'],
  ['Unitatea teritorială autonomă Găgăuzia','Autonomous Territorial Unit of Gagauzia','Gagauzia']
 ];
 for(const [source,expected,english] of examples){
  const entry=node('test-'+examples.indexOf(examples.find(e=>e[0]===source)),source,english);
  assert.equal(officialNameForLocale(entry,'en'),expected,source);
  assert.equal(officialNameForLocale(entry,'ro'),source);
 }
 const unknown=node('unknown','Consiliul administrativ al unei regiuni','Region');
 assert.equal(officialNameForLocale(unknown,'en'),unknown.officialName,
  'An unattested legal form must not be invented');
});

test('WEB-EN-OFFICIAL: bilingual card display is presentation-only with original official name recoverable',()=>{
 const app=readFileSync(new URL('../src/App.tsx',import.meta.url),'utf8');
 assert.match(app,/import \{ cardNameOf, englishSiblingQualifiers, officialNameForLocale, territorialContextNote \} from '.\/data\/treeNames\.mjs'/);
 assert.match(app,/<dt>\{t\.official\}<\/dt><dd title=\{lang==='en'\?currentNode\.officialName:undefined\}>\{officialNameForLocale\(currentNode,lang\)\}<\/dd>/);
});
