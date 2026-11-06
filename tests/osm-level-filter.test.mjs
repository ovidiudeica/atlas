import test from 'node:test';
import assert from 'node:assert/strict';
import { buildOsmLevelIndex, availableOsmLevels, matchingOsmLevelIds, updateOsmLevelVisibility }
  from '../src/data/osmLevelFilter.mjs';

function node(id,country,level,parent=null,setRoot=null,role=['administrative']){
  return {
    id,country,adminLevel:level,roles:role,administrativeParentId:parent,treeParentId:parent,
    geometrySetRootId:setRoot,shortName:{en:id,ro:id},name:id
  };
}
const catalog=[
  node('ro','RO',2),
  node('ro-8','RO',8,'ro'),
  node('ro-4','RO',4,'ro'),
  node('md','MD',2),
  node('md-8a','MD',8,'md'),
  node('md-8b','MD',8,'md'),
  node('md-5','MD',5,'md'),
  node('ua','UA',2),
  node('chernivtsi','UA',4,'ua','chernivtsi'),
  node('chernivtsi-8','UA',8,'chernivtsi'),
  node('odesa','UA',4,'ua','odesa'),
  node('odesa-8','UA',8,'odesa'),
  node('zakarpattia','UA',4,'ua','zakarpattia'),
  node('zakarpattia-7','UA',7,'zakarpattia'),
  node('ro-stat','RO',null,'ro',null,['statistical'])
];

test('builds OSM levels and territorial scopes dynamically, including three future Ukrainian sets',()=>{
  const index=buildOsmLevelIndex(catalog);
  assert.deepEqual(index.scopes.map(s=>s.id),['ro','md','ua','chernivtsi','odesa','zakarpattia']);
  assert.deepEqual(availableOsmLevels(index,['ro','md']),[
    {level:2,count:2},{level:4,count:1},{level:5,count:1},{level:8,count:3}
  ]);
  assert.deepEqual(availableOsmLevels(index,['chernivtsi','odesa','zakarpattia']),[
    {level:4,count:3},{level:7,count:1},{level:8,count:2}
  ]);
  assert(!matchingOsmLevelIds(index,['ro','md'],[8]).includes('ro-stat'));
});

test('hides only OSM level 8 in RO and MD; separate future geometry sets remain unaffected',()=>{
  const index=buildOsmLevelIndex(catalog);
  const hiddenIds=matchingOsmLevelIds(index,['ro','md'],[8]);
  assert.deepEqual(hiddenIds,['ro-8','md-8a','md-8b']);
  const initial=['ro','md','ro-8','ro-4','md-8a','md-8b','md-5','chernivtsi-8','odesa-8','zakarpattia-7','ro-stat'];
  const after=updateOsmLevelVisibility(initial,hiddenIds,false);
  assert.deepEqual(after,['ro','md','ro-4','md-5','chernivtsi-8','odesa-8','zakarpattia-7','ro-stat']);
  assert.deepEqual(updateOsmLevelVisibility(after,hiddenIds,true).slice(-3),hiddenIds);
  assert.deepEqual(initial,['ro','md','ro-8','ro-4','md-8a','md-8b','md-5','chernivtsi-8','odesa-8','zakarpattia-7','ro-stat']);
});

test('selection is additive, scoped, idempotent, and does not assume an OSM level inventory',()=>{
  const index=buildOsmLevelIndex(catalog);
  assert.deepEqual(matchingOsmLevelIds(index,['ro','md'],[8,4]),['ro-8','ro-4','md-8a','md-8b']);
  assert.deepEqual(matchingOsmLevelIds(index,['odesa'],[8]),['odesa-8']);
  assert.deepEqual(matchingOsmLevelIds(index,['zakarpattia'],[8]),[]);
  assert.deepEqual(updateOsmLevelVisibility(['ro','ro-8'],['ro-8'],true),['ro','ro-8']);
  assert.deepEqual(updateOsmLevelVisibility(['ro','ro-8'],[],false),['ro','ro-8']);
});
