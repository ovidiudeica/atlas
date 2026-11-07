import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {entityCardRoles,statisticalCodeIndex,verifiedStatisticalParent}
  from '../src/data/entityCardRoles.mjs';
import {pmrCadastralSeatCode} from '../src/data/pmrCadastral.mjs';
const bytes=readFileSync(new URL('../public/data/phase4/catalog.json.gz',import.meta.url));
const catalog=JSON.parse(gunzipSync(bytes).toString('utf8')).entities;
const byId=new Map(catalog.map(e=>[e.id,e]));
const app=readFileSync(new URL('../src/App.tsx',import.meta.url),'utf8');
const css=readFileSync(new URL('../src/styles.css',import.meta.url),'utf8');
const statIndex=statisticalCodeIndex(catalog);

test('WEB-R4.1: all 4,283 entities have read-only typed card role presentations',()=>{
  assert.equal(catalog.length,4283);
  assert.equal(createHash('sha256').update(bytes).digest('hex'),
    '1f930079194c92dc0e02d6e675165dddec6f49db0a62357bcc61be0705125482');
  for(const entity of catalog){
    const original=JSON.stringify(entity);
    const roles=entityCardRoles(entity);
    assert.equal(roles.administrative.length,entity.roles.includes('administrative')
      ?(entity.id==='osm-r377733'?2:1):0,entity.id);
    assert.equal(roles.statistical.length,entity.statisticalRoles.length,entity.id);
    assert.equal(roles.cartographic.osmAdminLevel,entity.adminLevel,entity.id);
    assert.equal(roles.cartographic.osmRelationId,entity.osmRelationId,entity.id);
    assert.equal(JSON.stringify(entity),original,'read-only: '+entity.id);
    for(const role of roles.statistical){
      assert.match(role.label,/^(NUTS|NTS) [1-9]$/);
      assert.equal(role.label,(role.classification==='NUTS'?'NUTS ':'NTS ')+role.level);
      if(role.parentCode){
        const parent=verifiedStatisticalParent(statIndex,role);
        if(parent)assert(parent.statisticalRoles.some(p=>
          p.classification===role.classification&&p.code===role.parentCode));
      }
    }
  }
});

test('WEB-R4.1: București has one OSM ADM4 geometry plus a presentation-only SIRUTA ADM8 role',()=>{
  const roles=entityCardRoles(byId.get('osm-r377733'));
  assert.deepEqual(roles.administrative.map(r=>r.label),['ADM 4','ADM 8']);
  assert.deepEqual(roles.administrative.map(r=>r.basis),['OSM','SIRUTA']);
  assert.deepEqual(roles.administrative.map(r=>r.registryCode),['403','179132']);
  assert.deepEqual(roles.administrative.map(r=>r.isOsmBoundary),[true,false]);
  assert.equal(roles.administrative[1].parentRegistryCode,'403');
  assert.equal(roles.cartographic.osmRelationId,377733);
  assert.equal(roles.statistical[0].label,'NUTS 3');
  assert.equal(verifiedStatisticalParent(statIndex,roles.statistical[0]).id,'stat-RO32');
});

test('WEB-R4.1: Moldova uses NTS in UI while its source classification stays NUTS_MOLDOVA',()=>{
  const country=byId.get('osm-r58974');
  const roles=entityCardRoles(country);
  assert.equal(roles.statistical[0].label,'NTS 1');
  assert.equal(roles.statistical[0].classification,'NUTS_MOLDOVA');
  const chisinau=entityCardRoles(byId.get('osm-r1691801'));
  const city=entityCardRoles(byId.get('osm-r1748490'));
  assert.equal(chisinau.statistical[0].label,'NTS 3');
  assert.equal(chisinau.statistical[0].code,'MD115');
  assert.equal(city.statistical.length,0);
  assert.equal(chisinau.cartographic.osmAdminLevel,4);
  assert.equal(city.cartographic.osmAdminLevel,8);
  assert.notEqual(chisinau.cartographic.osmRelationId,city.cartographic.osmRelationId);
  assert.equal(entityCardRoles(byId.get('stat-MD120')).statistical[0].label,'NTS 3');
  assert.equal(entityCardRoles(byId.get('stat-MD120')).cartographic.osmAdminLevel,null);
});

test('WEB-R4.1: Găgăuzia, Nistrenia and missing OSM IDs retain their source semantics',()=>{
  const gagauzia=entityCardRoles(byId.get('osm-r1699032'));
  assert.equal(gagauzia.administrative[0].registrySystem,'CUATM');
  assert.equal(gagauzia.administrative[0].registryCode,'9600');
  assert.equal(gagauzia.administrative[0].isOsmBoundary,true);
  for(const [id,code] of [['osm-r944727','32'],['osm-r1702219','33']]){
    const record=byId.get(id);
    assert.equal(record.registry,null);
    assert.equal(entityCardRoles(record).administrative[0].registryCode,null);
    assert.equal(pmrCadastralSeatCode(id),code);
  }
  const bretcu=byId.get('siruta-u64096');
  assert.equal(bretcu.osmRelationId,null);
  assert.equal(entityCardRoles(bretcu).cartographic.osmRelationId,null);
});

test('WEB-R4.1: UI shows short heading, typed roles, verified hierarchy, legal caveat and mobile permalinks',()=>{
  assert.match(app,/<h3 tabIndex=\{-1\}>\{cardNameOf\(currentNode,lang\)\}<\/h3>/);
  assert.match(app,/<dt>\{t\.official\}<\/dt><dd>\{currentNode\.officialName\}<\/dd>/);
  assert.match(app,/entityCardRoles\(currentNode\)/);
  assert.match(app,/cardRoles\.administrative\.map/);
  assert.match(app,/role\.isOsmBoundary\?t\.roleOsmGeometry:t\.roleRegistryOnly/);
  assert.match(app,/role\.registryCode/);
  assert.match(app,/cardRoles\.statistical\.map/);
  assert.match(app,/<strong>\{role\.label\}<\/strong>/);
  assert.match(app,/verifiedStatisticalParent\(statisticalIndex,role\)/);
  assert.match(app,/onClick=\{\(\)=>chooseRelated\(parent\.id\)\}/);
  assert.match(app,/className="entity-parent-link"/);
  assert.match(app,/SHARED_STATE\.entity&&window\.innerWidth<=700\?'detail':null/);
  assert.match(app,/currentNode\.osmRelationId!==null/);
  assert.match(app,/municipalRoleClarification\(currentNode,lang\)/);
  assert.match(app,/t\.pmrCadastralCaveat/);
  assert.match(app,/t\.detailNote/);
  assert.match(css,/\.entity-admin-roles/);
  assert.match(css,/\.entity-parent-link:focus-visible/);
});
