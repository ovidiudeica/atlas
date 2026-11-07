import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {territorialRoleLabel,territorialRoleLabels,municipalRoleClarification}
  from '../src/data/roleLabels.mjs';
import {resolveTerritorialRoles} from '../src/data/territoryRoles.mjs';
const data=JSON.parse(gunzipSync(readFileSync(
  new URL('../public/data/phase4/catalog.json.gz',import.meta.url))).toString('utf8'));
const byId=new Map(data.entities.map(x=>[x.id,x]));

test('WEB-R3.21: all 4283 labels originate in roles, statistical before administrative',()=>{
 assert.equal(data.entities.length,4283);assert.equal(byId.size,4283);
 for(const entity of data.entities){
  const frozen=JSON.stringify(entity);
  const resolved=resolveTerritorialRoles(entity);
  const expected=[
   ...resolved.statistical.map(r=>(r.classification==='NUTS'?'NUTS ':'NTS ')+r.level),
   ...resolved.administrative.filter(r=>r.level!==null).map(r=>'ADM '+r.level)
  ];
  const labels=territorialRoleLabels(entity);
  assert.deepEqual(labels,[...new Set(expected)],entity.id);
  assert.equal(territorialRoleLabel(entity),labels.join(' · '),entity.id);
  assert.equal(JSON.stringify(entity),frozen,'No canonical mutation '+entity.id);
  assert.equal(resolved.cartographic.osmAdminLevel,entity.adminLevel);
  const firstAdmin=labels.findIndex(x=>x.startsWith('ADM '));
  const lastStat=labels.findLastIndex(x=>x.startsWith('NTS ')||x.startsWith('NUTS '));
  assert(firstAdmin<0||lastStat<firstAdmin,'Statistics must precede administration '+entity.id);
 }
});
test('WEB-R3.21: Bucharest exposes three roles, one real OSM level and one SIRUTA municipality',()=>{
 const b=byId.get('osm-r377733');
 assert.equal(territorialRoleLabel(b),'NUTS 3 · ADM 4 · ADM 8');
 assert.equal(resolveTerritorialRoles(b).cartographic.osmAdminLevel,4);
 assert.equal(resolveTerritorialRoles(b).administrative[1].registryCode,'179132');
 assert.match(municipalRoleClarification(b,'ro'),/fără geometrie OSM ADM 8/);
 assert.match(municipalRoleClarification(b,'en'),/without a separate OSM ADM 8 geometry/);
 const sectors=data.entities.filter(n=>n.treeParentId===b.id);
 assert.equal(sectors.length,6);
 assert(sectors.every(n=>territorialRoleLabel(n)==='ADM 9'));
});
test('WEB-R3.21: Chișinău dual role belongs only to municipality, not ADM8 city',()=>{
 const m=byId.get('osm-r1691801'),city=byId.get('osm-r1748490');
 assert.equal(territorialRoleLabel(m),'NTS 3 · ADM 4');
 assert.equal(territorialRoleLabel(city),'ADM 8');
 assert.equal(municipalRoleClarification(m,'ro'),null);
 assert.equal(municipalRoleClarification(city,'ro'),null);
 assert.notEqual(city.osmRelationId,m.osmRelationId);
 for(const id of ['osm-r944727','osm-r1702219','osm-r1702214'])
  assert.equal(territorialRoleLabel(byId.get(id)),'ADM 5');
});
test('WEB-R3.21: OSM geometric filters remain bound to real adminLevel, not presentation roles',()=>{
 const app=readFileSync(new URL('../src/App.tsx',import.meta.url),'utf8');
 assert.match(app,/territorialRoleLabel as roleLabel/);
 assert.match(app,/municipalRoleClarification\(node,lang\)/);
 assert.match(app,/adminFilters/);
 assert.match(app,/node\.adminLevel/);
 assert(!app.includes("const admin=node.adminLevel===null?'':('ADM ' + node.adminLevel)"));
});
