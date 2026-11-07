import test from 'node:test';
import assert from 'node:assert/strict';
import {gunzipSync} from 'node:zlib';
import {readFileSync} from 'node:fs';
import {resolveTerritorialRoles,BUCHAREST_ATLAS_ID,BUCHAREST_SIRUTA_ROLES}
  from '../src/data/territoryRoles.mjs';
const catalog=JSON.parse(gunzipSync(readFileSync(
  new URL('../public/data/phase4/catalog.json.gz',import.meta.url))).toString('utf8'));
const nodes=new Map(catalog.entities.map(n=>[n.id,n]));
test('WEB-R3.19a: role resolution preserves all certified identities and separates three domains',()=>{
  assert.equal(catalog.entities.length,4283);
  assert.equal(nodes.size,4283);
  let ro=0,md=0;
  for(const node of catalog.entities){
    if(node.country==='RO')ro++;else if(node.country==='MD')md++;
    const before=JSON.stringify(node),roles=resolveTerritorialRoles(node);
    assert.equal(JSON.stringify(node),before,'Role read must not mutate canonical entity');
    assert.equal(roles.statistical.length,node.statisticalRoles.length);
    assert.equal(roles.cartographic.osmRelationId,node.osmRelationId);
    assert.equal(roles.cartographic.osmAdminLevel,node.adminLevel);
    assert.equal(roles.cartographic.geometryShard,node.geometryShard);
    assert(roles.cartographic.spatialRelationsAreNotLegalParentage);
    assert.equal(roles.administrative.filter(r=>r.basis==='OSM').length,
      Number(node.roles.includes('administrative')));
    for(const stat of roles.statistical)
      assert(stat.code&&stat.classification&&stat.version);
  }
  assert.equal(ro,3241);assert.equal(md,1042);
});
test('WEB-R3.19a: Bucharest municipal SIRUTA role does not manufacture ADM8 OSM geometry',()=>{
  const b=nodes.get(BUCHAREST_ATLAS_ID),roles=resolveTerritorialRoles(b);
  assert(b);assert.equal(b.osmRelationId,377733);assert.equal(b.adminLevel,4);
  assert.equal(roles.cartographic.osmAdminLevel,4);
  assert.equal(roles.administrative.length,2);
  assert.equal(roles.administrative[0].registryCode,BUCHAREST_SIRUTA_ROLES.county.code);
  assert.equal(roles.administrative[1].registryCode,'179132');
  assert.equal(roles.administrative[1].level,8);
  assert.equal(roles.administrative[1].basis,'SIRUTA');
  assert.equal(roles.administrative[1].parentRegistryCode,'403');
  assert.equal(roles.administrative[1].parentAtlasId,null);
  assert(!catalog.entities.some(n=>n.country==='RO'&&n.osmRelationId===377733&&n.adminLevel===8));
});
test('WEB-R3.19a: Moldova city, municipality and PMR are not conflated',()=>{
  const municipality=nodes.get('osm-r1691801'),city=nodes.get('osm-r1748490');
  assert.equal(resolveTerritorialRoles(municipality).cartographic.osmAdminLevel,4);
  assert.equal(resolveTerritorialRoles(city).cartographic.osmAdminLevel,8);
  assert.notEqual(municipality.id,city.id);
  assert.notEqual(municipality.osmRelationId,city.osmRelationId);
  for(const n of catalog.entities.filter(x=>x.country==='MD')){
    assert.equal(resolveTerritorialRoles(n).administrative.some(x=>x.basis==='SIRUTA'),false);
  }
  for(const id of ['osm-r944727','osm-r1702219']){
    assert(nodes.get(id).roles.includes('administrative'));
    assert.notEqual(resolveTerritorialRoles(nodes.get(id)).administrative[0]?.registrySystem,'SIRUTA');
  }
});
