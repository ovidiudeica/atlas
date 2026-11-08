import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import {shortTreeName,cardNameOf} from '../src/data/treeNames.mjs';

const bytes=readFileSync(new URL('../public/data/phase4/catalog.json.gz',import.meta.url));
const nodes=JSON.parse(gunzipSync(bytes).toString('utf8')).entities;
const byId=new Map(nodes.map(n=>[n.id,n]));
const name=(id,lang='en')=>shortTreeName(byId.get(id),lang);

test('EN-R1: every one of 4,283 source identities gets a concise ASCII EN display name',()=>{
  assert.equal(nodes.length,4283);
  assert.equal(byId.size,4283);
  const original=createHash('sha256').update(bytes).digest('hex');
  assert.equal(original,'1f930079194c92dc0e02d6e675165dddec6f49db0a62357bcc61be0705125482');
  const before=JSON.stringify(nodes);
  for(const node of nodes){
    const english=shortTreeName(node,'en');
    assert(english&&english===english.trim(),node.id+' has an empty/untrimmed EN label');
    assert(/^[\x20-\x7E]+$/.test(english),node.id+' not ASCII: '+english);
    assert(english.length<46,node.id+' EN label overlong: '+english);
    assert(!/^(?:Macroregiunea|Judetul|Raionul|Municipiul|Orasul|Sovetul)\b/i.test(english),
      node.id+' untranslated Romanian administrative qualifier: '+english);
    assert(/^[\x20-\x7E]+$/.test(cardNameOf(node,'en')),
      node.id+' detail card must share ASCII EN presentation');
  }
  assert.equal(JSON.stringify(nodes),before,'Display functions must never mutate ACTUAL entities');
});

test('EN-R1: reviewed exonyms and NUTS display translations do not replace native source names',()=>{
  for(const [id,english] of Object.entries({
    'osm-r90689':'Romania',
    'osm-r58974':'Moldova',
    'osm-r377733':'Bucharest',
    'stat-RO1':'Macroregion One',
    'stat-RO2':'Macroregion Two',
    'stat-RO3':'Macroregion Three',
    'stat-RO4':'Macroregion Four',
    'stat-RO11':'North-West',
    'stat-RO12':'Centre',
    'stat-RO21':'North-East',
    'stat-RO22':'South-East',
    'stat-RO31':'South Muntenia',
    'stat-RO32':'Bucharest-Ilfov',
    'stat-RO41':'South-West Oltenia',
    'stat-RO42':'West',
    'osm-r1699032':'Gagauzia',
    'osm-r1691801':'Chisinau',
    'osm-r1748490':'Chisinau',
    'osm-r2607033':'ATULBD',
    'stat-MD120':'Transnistria',
    'osm-r6879649':'Kitskany',
    'osm-r1702216':'Kamenka',
    'osm-r8291058':'Glinoye',
    'osm-r8290877':'Pervomaisc'
  })){
    assert(byId.has(id),'Missing canonical entity: '+id);
    assert.equal(name(id),english,id);
  }
  assert.equal(cardNameOf(byId.get('osm-r1748490'),'en'),'Chisinau city');
  assert.equal(name('stat-RO3','ro'),'Macroregiunea Trei');
  assert.equal(name('osm-r1699032','ro'),'Găgăuzia');
  assert.equal(name('osm-r1748490','ro'),'Chișinău');
  assert.equal(name('osm-r1813316','ro'),'Rîșcani');
  assert.equal(name('osm-r1813316','en'),'Riscani');
  assert.equal(name('osm-r58983','en'),'Balti');
  assert.equal(name('osm-r65335','en'),'Pridnestrovie');
});

test('EN-R1: native official records and search aliases are maintained alongside translated labels',()=>{
  const city=byId.get('osm-r1748490');
  assert.equal(city.name,'Chișinău');
  assert.equal(city.officialName,'Orașul Chișinău');
  assert.equal(city.osmRelationId,1748490);
  const municipality=byId.get('osm-r1691801');
  assert.equal(municipality.sourceTags['name:en'],'Chișinău Municipality');
  assert.equal(name(municipality.id),'Chisinau');
  const territories=readFileSync(new URL('../src/data/territories.ts',import.meta.url),'utf8');
  assert.match(territories,/labelOf\(node,'ro'\), labelOf\(node,'en'\)/,
    'Search must index local and English presentation names');
  assert.match(territories,/node\.name, node\.shortName\?\.ro, node\.shortName\?\.en, node\.officialName/);
});
