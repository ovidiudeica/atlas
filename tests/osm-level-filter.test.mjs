import test from 'node:test';
import assert from 'node:assert/strict';
import { buildOsmLevelIndex, availableOsmLevels, matchingOsmLevelIds, updateOsmLevelVisibility,
  availableStatisticalLevels, matchingStatisticalLevelIds, matchingCombinedLevelIds, statisticalLevelKey }
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

const roles=(classification,level,code)=>[{classification,level,code,version:'2026',parentCode:null}];
const sample=[
  {...node('ro','RO',2),statisticalRoles:[]},
  {...node('md','MD',2),statisticalRoles:roles('NUTS_MOLDOVA',1,'MD1')},
  {...node('ro-nuts1','RO',null,'ro',null,['statistical']),statisticalRoles:roles('NUTS',1,'RO1')},
  {...node('ro-nuts2','RO',null,'ro',null,['statistical']),statisticalRoles:roles('NUTS',2,'RO11')},
  {...node('ro-county','RO',4,'ro'),statisticalRoles:roles('NUTS',3,'RO111')},
  {...node('md-region','MD',null,'md',null,['statistical']),statisticalRoles:roles('NUTS_MOLDOVA',2,'MD11')},
  {...node('md-shared','MD',4,'md'),statisticalRoles:roles('NUTS_MOLDOVA',3,'MD111')},
  {...node('ua','UA',2),statisticalRoles:[]},
  {...node('chernivtsi','UA',4,'ua','chernivtsi'),statisticalRoles:[]},
  {...node('chernivtsi-nuts','UA',null,'chernivtsi',null,['statistical']),statisticalRoles:roles('NUTS_UA',2,'UA01')},
  {...node('odesa','UA',4,'ua','odesa'),statisticalRoles:[]},
  {...node('odesa-nuts','UA',null,'odesa',null,['statistical']),statisticalRoles:roles('NUTS_UA',2,'UA02')}
];

test('statistical region levels are discovered from statisticalRoles, including shared admin geometry',()=>{
  const idx=buildOsmLevelIndex(sample);
  const all=availableStatisticalLevels(idx,['ro','md']);
  assert.deepEqual(all.map(({classification,level,count})=>[classification,level,count]),[
    ['NUTS',1,1],['NUTS',2,1],['NUTS',3,1],
    ['NUTS_MOLDOVA',1,1],['NUTS_MOLDOVA',2,1],['NUTS_MOLDOVA',3,1]
  ]);
  assert.deepEqual(matchingStatisticalLevelIds(idx,['ro'],[statisticalLevelKey('NUTS',3)]),['ro-county']);
  assert.deepEqual(matchingStatisticalLevelIds(idx,['md'],[statisticalLevelKey('NUTS_MOLDOVA',1)]),['md']);
  assert(!matchingStatisticalLevelIds(idx,['ro'],[statisticalLevelKey('NUTS',2)]).includes('ro-county'));
});

test('show/hide statistical regions does not execute the default administrative level 8 selection',()=>{
  const idx=buildOsmLevelIndex(sample);
  const selected=[statisticalLevelKey('NUTS',1),statisticalLevelKey('NUTS_MOLDOVA',2)];
  const targets=matchingStatisticalLevelIds(idx,['ro','md'],selected);
  assert.deepEqual(targets,['ro-nuts1','md-region']);
  const initial=['ro','md','ro-county','md-shared','chernivtsi-nuts'];
  const shown=updateOsmLevelVisibility(initial,targets,true);
  assert.deepEqual(shown,['ro','md','ro-county','md-shared','chernivtsi-nuts','ro-nuts1','md-region']);
  assert.deepEqual(updateOsmLevelVisibility(shown,targets,false),initial);
  assert.deepEqual(matchingStatisticalLevelIds(idx,['chernivtsi'],selected),[]);
  assert.deepEqual(matchingStatisticalLevelIds(idx,['odesa'],[statisticalLevelKey('NUTS_UA',2)]),['odesa-nuts']);
});

test('statistical-only future geography remains available even if it has no admin level entries',()=>{
  const cases=[
    {...node('root','UA',null),roles:['statistical'],statisticalRoles:roles('STAT_REGIONS',1,'X')},
    {...node('child','UA',null,'root',null,['statistical']),statisticalRoles:roles('STAT_REGIONS',2,'XX')}
  ];
  const idx=buildOsmLevelIndex(cases);
  assert.deepEqual(idx.scopes.map(x=>x.id),['root']);
  assert.deepEqual(availableOsmLevels(idx,['root']),[]);
  assert.deepEqual(availableStatisticalLevels(idx,['root']).map(x=>x.level),[1,2]);
  assert.deepEqual(matchingStatisticalLevelIds(idx,['root'],[statisticalLevelKey('STAT_REGIONS',2)]),['child']);
});

test('unified levels deduplicate a shared administrative/statistical geometry',()=>{
  const idx=buildOsmLevelIndex(sample);
  const targets=matchingCombinedLevelIds(idx,['ro','md'],[4],[
    statisticalLevelKey('NUTS',1),statisticalLevelKey('NUTS',3),
    statisticalLevelKey('NUTS_MOLDOVA',3)
  ]);
  assert.deepEqual(targets,['ro-county','md-shared','ro-nuts1']);
  assert.equal(new Set(targets).size,targets.length);
  const shown=updateOsmLevelVisibility(['ro','md'],targets,true);
  assert.equal(shown.length,5);
  assert.deepEqual(updateOsmLevelVisibility(shown,targets,false),['ro','md']);
});

test('unified levels support independent future geographic scopes and empty selection',()=>{
  const idx=buildOsmLevelIndex(sample);
  const stat=statisticalLevelKey('NUTS_UA',2);
  assert.deepEqual(matchingCombinedLevelIds(idx,['chernivtsi'],[4],[stat]),[
    'chernivtsi','chernivtsi-nuts'
  ]);
  assert.deepEqual(matchingCombinedLevelIds(idx,['odesa'],[],[stat]),['odesa-nuts']);
  assert.deepEqual(matchingCombinedLevelIds(idx,['ro','md'],[],[]),[]);
});
