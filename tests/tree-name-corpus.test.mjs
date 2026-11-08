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
test('English presentation is localized and the 48 original Romanian shortened names are preserved',()=>{
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
  assert(changed.en.length>51,'EN must correct more than the 51 legacy short names');
  assert.equal(changed.ro.length,48,JSON.stringify(changed.ro));
  assert(changed.ro.some(x=>x.id==='osm-r2607033'));
  assert(changed.ro.some(x=>x.id==='osm-r6879649'));
  assert(changed.ro.some(x=>x.id==='osm-r8290877'));
  assert(changed.ro.some(x=>x.id==='stat-MD120'));
  assert.equal(new Set(changed.ro.map(x=>x.id)).size,48);
  assert(changed.en.some(x=>x.id==='stat-MD120'));
  assert.equal(new Set(changed.en.map(x=>x.id)).size,changed.en.length);
});
test('both left-bank entities and district/municipality names are concise',()=>{
  const get=(id,lang)=>shortTreeName(byId.get(id),lang);
  assert.equal(get('osm-r2607033','ro'),'UATSN');
  assert.equal(get('osm-r2607033','en'),'ATULBD');
  assert.equal(get('stat-MD120','ro'),'Transnistria');
  assert.equal(get('stat-MD120','en'),'Transnistria');
  assert.equal(get('osm-r1691801','en'),'Chisinau');
  assert.equal(get('osm-r1748490','ro'),'Chișinău');
  assert.equal(get('osm-r1748490','en'),'Chisinau');
  assert.equal(get('osm-r58983','en'),'Balti');
  assert.equal(get('osm-r1104136','en'),'Basarabeasca');
  assert.equal(get('osm-r1702216','en'),'Camenca');
  assert.equal(get('osm-r1702216','ro'),'Camenca');
  assert.equal(get('osm-r90689','en'),'Romania');
  assert.equal(get('osm-r58974','ro'),'Moldova');
  assert.equal(get('osm-r19112364','ro'),'Satul Nou');
  assert.equal(get('stat-RO1','ro'),'Macroregiunea Unu');
  assert.equal(get('stat-RO1','en'),'Macroregion One');
  assert.equal(get('stat-RO3','en'),'Macroregion Three');
  assert.equal(get('stat-RO32','en'),'Bucharest-Ilfov');
  assert.equal(get('osm-r377733','en'),'Bucharest');
  assert.equal(get('osm-r1702219','en'),'Tiraspol');
  assert.equal(get('osm-r1813297','en'),'Buiucani');
  assert.equal(get('osm-r1813316','en'),'Riscani');
  assert.equal(get('osm-r944727','en'),'Bender');
});
test('canonical catalog names and official identities remain unchanged',()=>{
  const admin=byId.get('osm-r2607033');
  assert.equal(admin.officialName,'Unitățile administrativ-teritoriale din stînga Nistrului');
  assert.equal(admin.shortName.en,'Administrative-territorial units of the left bank of Nistru');
  assert.equal(admin.shortName.ro,'Unitățile administrativ-teritoriale din stînga Nistrului');
  assert.equal(shortTreeName(admin,'ro'),'UATSN');
  assert.equal(shortTreeName(admin,'en'),'ATULBD');
  const statistical=byId.get('stat-MD120');
  assert.equal(statistical.statisticalRoles[0].code,'MD120');
  assert.equal(statistical.sourceTags['ref:nuts'],'MD121','Conflicting OSMB provenance retained');
  assert.equal(statistical.sourceTags.alt_name,'Regiunea Transnistria');
  assert.equal(statistical.officialName,'Unitățile administrativ-teritoriale din stînga Nistrului');
  assert.equal(shortTreeName(statistical,'ro'),'Transnistria');
  assert.equal(shortTreeName(statistical,'en'),'Transnistria');
});

test('Chițcani shows the short Romanian name without changing certified OSMB/CUATM records',()=>{
  const n=byId.get('osm-r6879649');
  assert(n,'Original OSM ID must remain present');
  assert(n.roles.includes('administrative'));
  assert.equal(n.adminLevel,8);
  assert.equal(n.osmRelationId,6879649);
  assert.equal(n.administrativeParentId,'osm-r65343');
  assert.equal(n.treeParentId,'osm-r65343');
  assert.equal(n.registry.system,'CUATM');
  assert.equal(n.registry.code,'7612');
  assert.equal(n.name,'Sovetul sătesc Chițcani');
  assert.equal(n.officialName,'Sovetul sătesc Chițcani');
  assert.equal(n.shortName.ro,'Sovetul sătesc Chițcani');
  assert.equal(n.sourceTags['name:ro'],'Sovetul sătesc Chițcani');
  assert.equal(n.shortName.en,'Kitskany');
  assert.equal(shortTreeName(n,'ro'),'Chițcani');
  assert.equal(shortTreeName(n,'en'),'Chitcani');
});
