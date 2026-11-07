import test from 'node:test';
import assert from 'node:assert/strict';
import {REFERENCE_STYLE,administrativeStyle,statisticalStyle,styleForEntity}
  from '../src/data/cartographicStyle.mjs';
import {buildOsmLevelIndex,matchingCombinedLevelIds,statisticalLevelKey}
  from '../src/data/osmLevelFilter.mjs';
const ro={id:'osm-r90689',country:'RO',adminLevel:2,roles:['administrative'],statisticalRoles:[]};
const md={id:'osm-r58974',country:'MD',adminLevel:2,roles:['administrative'],
  statisticalRoles:[{classification:'NUTS_MOLDOVA',level:1}]};
const mdNts1=statisticalLevelKey('NUTS_MOLDOVA',1);
test('default national roots use only neutral reference outlines regardless of source roles',()=>{
  assert.deepEqual(styleForEntity(ro,[],[],true),REFERENCE_STYLE);
  assert.deepEqual(styleForEntity(md,[],[],true),REFERENCE_STYLE);
  assert.equal(REFERENCE_STYLE.dash,false);
  assert.equal(REFERENCE_STYLE.opacity,0,'Reference national fill is uncolored');
});
test('NTS 1 styles Moldova shared national contour without a duplicate polygon',()=>{
  const input={...md,administrativeParentId:null,treeParentId:null};
  const idx=buildOsmLevelIndex([ro,input]);
  const visible=['osm-r90689','osm-r58974'];
  const targets=matchingCombinedLevelIds(idx,idx.scopes.map(s=>s.id),[2],[mdNts1]);
  assert.deepEqual([...new Set([...visible,...targets])],visible);
  assert.equal(styleForEntity(md,[],[mdNts1],true).key,'NTS 1');
  assert.equal(styleForEntity(md,[2],[mdNts1],true).key,'NTS 1');
  assert.equal(styleForEntity(md,[2],[],true).key,'ADM 2');
  assert.equal(styleForEntity(md,[],[],true).key,'reference');
  assert.equal(styleForEntity(ro,[2],[mdNts1],true).key,'ADM 2');
  assert.equal(styleForEntity(md,[],[mdNts1],true).dash,true);
});
test('every released ADM and statistical level has a unique color; legend matches map tokens',()=>{
  const palette=[...[2,3,4,5,7,8,9].map(administrativeStyle),
    ...[1,2,3].map(n=>statisticalStyle('NUTS',n)),
    ...[1,2,3].map(n=>statisticalStyle('NUTS_MOLDOVA',n))];
  assert.equal(palette.length,13);
  assert.equal(new Set(palette.map(s=>s.color)).size,13);
  assert(palette.every(s=>s.color.startsWith('#')&&s.width>=1.7));
  assert(palette.slice(0,7).every(s=>s.kind==='administrative'&&!s.dash));
  assert(palette.slice(7).every(s=>s.kind==='statistical'&&s.dash));
  assert.notEqual(palette[0].color,REFERENCE_STYLE.color);
});
test('statistical-only and shared non-root entities retain correct natural styling',()=>{
  const shared={...md,adminLevel:4,statisticalRoles:[{classification:'NUTS',level:3}]};
  assert.equal(styleForEntity(shared,[],[]).key,'ADM 4');
  assert.equal(styleForEntity(shared,[],[statisticalLevelKey('NUTS',3)]).key,'NUTS 3');
  const stat={roles:['statistical'],adminLevel:null,statisticalRoles:[{classification:'NUTS',level:2}]};
  assert.equal(styleForEntity(stat,[],[]).key,'NUTS 2');
});
