import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {shortTreeName} from '../src/data/treeNames.mjs';
const catalog=JSON.parse(gunzipSync(readFileSync(
  new URL('../public/data/phase4/catalog.json.gz',import.meta.url))).toString('utf8'));
const entities=catalog.entities,byId=new Map(entities.map(x=>[x.id,x]));
test('all 4283 certified tree names are concise in both languages',()=>{
  assert.equal(entities.length,4283);
  assert.equal(byId.size,4283);
  const forbiddenEnglish=/\s(?:District|Municipality|County|Commune|City|Town|Sector)$/iu;
  const forbiddenRomanian=/^(?:Județul|Raionul|Municipiul|Municipalitatea|Orașul|Comuna|Districtul)\s+/iu;
  for(const node of entities)for(const lang of ['ro','en']){
    const name=shortTreeName(node,lang);
    assert(name&&name===name.trim(),node.id+': nonempty and trimmed');
    assert(!forbiddenEnglish.test(name),'Unnecessary EN qualifier '+node.id+': '+name);
    if(node.roles.includes('administrative')&&lang==='ro'&&forbiddenRomanian.test(name))
      assert(!node.name||!name.endsWith(' '+node.name),
        'Redundant RO qualifier '+node.id+': '+name);
    assert(name.length<46,'Overlong label '+node.id+'/'+lang+': '+name);
  }
});
test('all 48 previously long English names and the 1 Romanian counterpart are shortened',()=>{
  const changed={en:[],ro:[]};
  function legacy(node,lang){
    if(node.id==='osm-r90689')return lang==='en'?'Romania':'România';
    if(node.id==='osm-r58974')return 'Moldova';
    const overrides={MD11:['Vest','West'],MD12:['Est','East'],
      MD111:['Nord','North'],MD112:['Centru','Centre'],MD113:['Sud','South'],
      MD120:['Stânga Nistrului','Left Bank']};
    const stat=node.statisticalRoles[0]?.code;
    if(stat&&overrides[stat])return overrides[stat][lang==='ro'?0:1];
    if(node.roles.includes('statistical')&&node.sourceTags?.short_name)
      return node.sourceTags.short_name;
    return node.shortName?.[lang]||node.name;
  }
  for(const node of entities)for(const lang of ['ro','en']){
    const before=legacy(node,lang),after=shortTreeName(node,lang);
    if(before!==after)changed[lang].push({id:node.id,before,after});
  }
  assert.equal(changed.en.length,48,JSON.stringify(changed.en));
  assert.equal(changed.ro.length,1,JSON.stringify(changed.ro));
  assert.equal(changed.ro[0].id,'osm-r2607033');
  assert.equal(new Set(changed.en.map(x=>x.id)).size,48);
});
test('both left-bank entities and district/municipality names are concise',()=>{
  const get=(id,lang)=>shortTreeName(byId.get(id),lang);
  for(const id of ['osm-r2607033','stat-MD120']){
    assert.equal(get(id,'ro'),'Stânga Nistrului');
    assert.equal(get(id,'en'),'Left Bank');
  }
  assert.equal(get('osm-r1691801','en'),'Chișinău');
  assert.equal(get('osm-r58983','en'),'Bălți');
  assert.equal(get('osm-r1104136','en'),'Basarabeasca');
  assert.equal(get('osm-r1702216','en'),'Kamenka');
  assert.equal(get('osm-r1702216','ro'),'Camenca');
  assert.equal(get('osm-r90689','en'),'Romania');
  assert.equal(get('osm-r58974','ro'),'Moldova');
  assert.equal(get('osm-r19112364','ro'),'Satul Nou');
  assert.equal(get('stat-RO1','ro'),'Macroregiunea Unu');
  assert.equal(get('osm-r1702219','en'),'Tiraspol');
  assert.equal(get('osm-r1813297','en'),'Buiucani');
  assert.equal(get('osm-r1813316','en'),'Rîșcani');
  assert.equal(get('osm-r944727','en'),'Bender');
});
test('canonical catalog names and official identities remain unchanged',()=>{
  const admin=byId.get('osm-r2607033');
  assert.equal(admin.officialName,'Unitățile administrativ-teritoriale din stînga Nistrului');
  assert.equal(admin.shortName.en,'Administrative-territorial units of the left bank of Nistru');
  assert.equal(admin.shortName.ro,'Unitățile administrativ-teritoriale din stînga Nistrului');
  assert.equal(shortTreeName(admin,'ro'),'Stânga Nistrului');
});
