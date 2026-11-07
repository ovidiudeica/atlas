import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {shortTreeName,UATSN_RO_SHORT_LABELS} from '../src/data/treeNames.mjs';

const entities=JSON.parse(gunzipSync(readFileSync(
  new URL('../public/data/phase4/catalog.json.gz',import.meta.url))).toString('utf8')).entities;
const byId=new Map(entities.map(x=>[x.id,x]));
const UATSN_ID='osm-r2607033';
const BENDER_ID='osm-r9581354';
const sameName=(a,b)=>String(a||'').replaceAll('ş','ș').replaceAll('ţ','ț')
  .normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('ro');

test('WEB-R3.12: 44 OSM-ID-specific short council names are verified against 2026-10-05 CUATM records',()=>{
  assert.equal(entities.length,4283);
  const children=entities.filter(x=>x.treeParentId===UATSN_ID);
  assert.equal(children.length,79);
  assert.equal(Object.keys(UATSN_RO_SHORT_LABELS).length,44);
  const originalCouncilNodes=children.filter(x=>
    /^(?:Sovetul sătesc|Sovetul orășenesc) /u.test(x.name));
  assert.equal(originalCouncilNodes.length,44);
  assert.deepEqual(new Set(Object.keys(UATSN_RO_SHORT_LABELS)),
    new Set(originalCouncilNodes.map(x=>x.id)));
  for(const n of originalCouncilNodes){
    const short=UATSN_RO_SHORT_LABELS[n.id],original=n.name;
    assert.equal(n.adminLevel,8);
    assert.equal(n.administrativeParentId,UATSN_ID);
    assert.equal(n.treeParentId,UATSN_ID);
    assert.equal(n.registry.system,'CUATM');
    assert(n.registry.code,'Missing CUATM '+n.id);
    assert(n.registry.record?.name,'Missing official CUATM name '+n.id);
    assert.equal(sameName(short),sameName(n.registry.record.name),n.id+' must use documented CUATM');
    assert.equal(sameName(original.replace(/^Sovetul (?:sătesc|orășenesc) /u,'')),
      sameName(short),n.id+' source name must refer to the same territorial identity');
    assert.equal(shortTreeName(n,'ro'),short,n.id);
    assert.equal(n.name,original,'Canonical name cannot be changed');
    assert.equal(n.shortName.ro,original,'Canonical shortName.ro remains source faithful');
    assert(n.geometryRef,'Geometry link retained for '+n.id);
  }
});

test('WEB-R3.12: Popencu English, Pervomaisc RO/EN and two independent Hlinaia identities',()=>{
  const pop=byId.get('osm-r8349338'),perv=byId.get('osm-r8290877');
  assert.equal(pop.shortName.en,'Sovetul sătesc Popencu');
  assert.equal(shortTreeName(pop,'en'),'Popencu');
  assert.equal(shortTreeName(pop,'ro'),'Popencu');
  assert.equal(perv.name,'Slobozia');
  assert.equal(perv.officialName,'Satul Pervomaisc');
  assert.equal(perv.registry.code,'7628');
  assert.equal(perv.registry.record.name,'Pervomaisc');
  assert.equal(perv.sourceTags['short_name:ro'],'Pervomaisc');
  assert.equal(perv.shortName.en,'Slobozia');
  assert.equal(perv.shortName.ro,'Slobozia');
  for(const lang of ['ro','en'])assert.equal(shortTreeName(perv,lang),'Pervomaisc');

  const one=byId.get('osm-r9301463'),two=byId.get('osm-r8291058');
  assert.equal(one.registry.code,'5029');
  assert.equal(two.registry.code,'7625');
  assert.notEqual(one.id,two.id);
  assert.equal(one.treeParentId,UATSN_ID);
  assert.equal(two.treeParentId,UATSN_ID);
  assert.equal(shortTreeName(one,'ro'),'Hlinaia');
  assert.equal(shortTreeName(two,'ro'),'Hlinaia');
  assert.equal(shortTreeName(one,'en'),'Hlinaia');
  assert.equal(shortTreeName(two,'en'),'Glinoye','Existing English exonym is preserved');
});

test('WEB-R3.12: neither east branch identity nor Nistrenia children or statistical nodes are renamed at source',()=>{
  const admin=byId.get(UATSN_ID);
  assert.equal(admin.registry.code,'9800');
  assert.equal(admin.administrativeParentId,'osm-r58974');
  assert.equal(admin.treeParentId,'stat-MD120');
  assert.equal(shortTreeName(admin,'ro'),'Stânga Nistrului');
  assert.equal(shortTreeName(byId.get('stat-MD120'),'en'),'Left Bank');
  assert.equal(shortTreeName(byId.get(BENDER_ID),'ro'),'Bender');
  assert.equal(shortTreeName(byId.get(BENDER_ID),'en'),'Bender');
  assert.equal(byId.get(BENDER_ID).registry.code,'0500');
  assert.equal(entities.filter(x=>x.treeParentId===BENDER_ID).length,2);
  assert.equal(shortTreeName(byId.get('osm-r6879649'),'ro'),'Chițcani');
  const notInEast=entities.filter(x=>x.treeParentId!==UATSN_ID);
  assert(notInEast.every(x=>!(x.id in UATSN_RO_SHORT_LABELS)));
  assert.equal(byId.get('osm-r9288287').officialName,'orașul Dubăsari');
  assert.equal(byId.get('osm-r9288287').registry.code,'3801');
  assert.equal(shortTreeName(byId.get('osm-r9288287'),'ro'),'Dubăsari');
});
