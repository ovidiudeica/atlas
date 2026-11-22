import test from 'node:test';
import assert from 'node:assert/strict';
import { validateHistoricalLifeCycle, HISTORICAL_EVENT_TYPES } from '../src/data/historicalLifeCycle.mjs';

const span=(a,b)=>({kind:'interval',start:{year:a},end:{year:b}});
const refs={
  entities:[{id:'h-root'},{id:'h-old'},{id:'h-new-a'},{id:'h-new-b'}],
  versions:[{id:'v1',entityId:'h-root',period:span(1925,1950)}],
  geometries:[{geometryId:'g1'},{geometryId:'g2'}],
  sources:[{id:'doc:law'},{id:'doc:map'}],
  events:[],symbols:[],geometryDecisions:[]
};

test('all approved historical reform and life-cycle event classes are represented',()=>{
  for(const name of ['establishment','abolition','rename','status_change',
    'administrative_reform','parent_change','boundary_change',
    'territorial_transfer','division','merger','capital_change','symbol_change'])
    assert.ok(HISTORICAL_EVENT_TYPES.includes(name),name);
});

test('many-to-many succession and overlapping event participation are preserved',()=>{
  const obj=structuredClone(refs);
  obj.events=[{
    id:'e1', kind:'division', when:{kind:'snapshot',at:{year:1950}},
    entityIds:['h-old'], predecessorEntityIds:['h-old'],
    successorEntityIds:['h-new-a','h-new-b'],
    relatedGeometryIds:['g1'],
    description:{ro:'Divizare documentată',en:'Documented division'},
    evidenceStatus:'candidate',sourceIds:['doc:law']
  }];
  assert.deepEqual(validateHistoricalLifeCycle(obj),{ok:true,errors:[]});
  obj.events[0].successorEntityIds.push('h-missing');
  assert.equal(validateHistoricalLifeCycle(obj).ok,false);
});

test('symbols are not published without cleared rights and qualified evidence',()=>{
  const obj=structuredClone(refs);
  obj.symbols=[{
    id:'symbol1',entityId:'h-old',kind:'coat',
    period:span(1925,1950),evidenceStatus:'candidate',
    rightsStatus:'unknown',sourceIds:['doc:map'],official:false
  }];
  assert.equal(validateHistoricalLifeCycle(obj).ok,true);
  obj.symbols[0].assetPath='/symbols/reproduction.svg';
  assert.match(validateHistoricalLifeCycle(obj).errors.join(';'),/uncleared/);
  obj.symbols[0].evidenceStatus='qualified';
  obj.symbols[0].rightsStatus='cleared';
  obj.symbols[0].official=true;
  obj.symbols[0].approvalSourceIds=['doc:law'];
  assert.equal(validateHistoricalLifeCycle(obj).ok,true);
});

test('geometry verdict supports alternatives but only one admitted primary at one moment',()=>{
  const obj=structuredClone(refs);
  obj.geometryDecisions=[{
    id:'gdec1',versionId:'v1',period:span(1925,1930),
    status:'admitted',evidenceStatus:'qualified',
    selectedGeometryId:'g1',alternativeGeometryIds:['g2'],
    rationale:'Two sources independently reviewed',sourceIds:['doc:law','doc:map']
  }];
  assert.equal(validateHistoricalLifeCycle(obj).ok,true);
  obj.geometryDecisions.push({
    ...obj.geometryDecisions[0],id:'gdec2',
    period:span(1930,1950),selectedGeometryId:'g2',
    alternativeGeometryIds:['g1']
  });
  assert.match(validateHistoricalLifeCycle(obj).errors.join(';'),/overlapping admitted/);
  obj.geometryDecisions[1].period=span(1931,1950);
  assert.equal(validateHistoricalLifeCycle(obj).ok,true);
});

test('geometry verdict cannot fabricate proof or point to missing polygons',()=>{
  const obj=structuredClone(refs);
  obj.geometryDecisions=[{
    id:'u1',versionId:'v1',period:span(1920,1930),
    status:'undecided',evidenceStatus:'candidate',
    selectedGeometryId:null,alternativeGeometryIds:['g2'],
    rationale:'Insufficient evidence',sourceIds:['doc:map']
  }];
  assert.equal(validateHistoricalLifeCycle(obj).ok,false);
  obj.geometryDecisions[0].period=span(1925,1930);
  assert.equal(validateHistoricalLifeCycle(obj).ok,true);
  obj.geometryDecisions[0].status='admitted';
  assert.match(validateHistoricalLifeCycle(obj).errors.join(';'),/qualified primary|primary geometry required/);
});
