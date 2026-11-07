import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {NISTRIAN_PARENT_ID,NISTRIAN_CHILD_ORDER,NISTRIAN_CITY_COUNCILS,
  compareTreeSiblings} from '../src/data/treeOrder.mjs';
import {shortTreeName} from '../src/data/treeNames.mjs';
import {presentationParentId} from '../src/data/treeOverlay.mjs';

const records=JSON.parse(gunzipSync(readFileSync(
  new URL('../public/data/phase4/catalog.json.gz',import.meta.url))).toString('utf8')).entities;
const byId=new Map(records.map(node=>[node.id,node]));
const children=(id,view)=>records.filter(node=>
  (view!=='administrative'||node.roles.includes('administrative'))&&
  (view!=='statistical'||node.statisticalRoles.length>0) &&
  presentationParentId(node,view)===id);
const ranked=(parent,view,lang)=>children(parent,view).sort((a,b)=>
  compareTreeSiblings(a,b,view,parent,lang));
const EXPECTED_IDS=[
  'osm-r1702219', // Tiraspol
  'osm-r944727',  // Bender
  'osm-r1702218', // Slobozia
  'osm-r1702214', // Grigoriopol
  'osm-r1702215', // Dubăsari
  'osm-r1702217', // Rîbnița
  'osm-r1702216'  // Camenca
];
const EXPECTED_RO=['Tiraspol','Bender','Slobozia','Grigoriopol','Dubăsari','Rîbnița','Camenca'];
const EXPECTED_EN=['Tiraspol','Bender','Slobdzeya','Grigoriopol','Dubossary','Rybnitsa','Kamenka'];

test('WEB-R3.15: seven Nistrenia ADM5 children exactly match original Atlas IDs and parents',()=>{
  assert.equal(records.length,4283);
  assert.equal(NISTRIAN_PARENT_ID,'osm-r65335');
  assert.deepEqual(NISTRIAN_CHILD_ORDER,EXPECTED_IDS);
  assert.deepEqual(NISTRIAN_CITY_COUNCILS,EXPECTED_IDS.slice(0,2));
  assert.equal(new Set(EXPECTED_IDS).size,7);
  assert.deepEqual(new Set(children(NISTRIAN_PARENT_ID,'all').map(x=>x.id)),
    new Set(EXPECTED_IDS));
  assert.deepEqual(new Set(children(NISTRIAN_PARENT_ID,'administrative').map(x=>x.id)),
    new Set(EXPECTED_IDS));
  for(const id of EXPECTED_IDS){
    const node=byId.get(id);
    assert(node,id+' must be certified');
    assert.equal(node.country,'MD');
    assert.equal(node.adminLevel,5);
    assert(node.roles.includes('administrative'));
    assert.equal(node.administrativeParentId,NISTRIAN_PARENT_ID,id+' canonical ADM parent');
    assert.equal(node.treeParentId,NISTRIAN_PARENT_ID,id+' canonical tree parent');
    assert.equal(node.osmRelationId,Number(id.slice(5)),'Original OSM relation ID unchanged');
  }
  assert.equal(children(NISTRIAN_PARENT_ID,'statistical').length,0,
    'Nistrenia ADM children are not statistical entities');
});

test('WEB-R3.15: fixed Tiraspol, Bender, then five raions south-to-north in BOTH views and languages',()=>{
  for(const view of ['all','administrative'])
    for(const lang of ['ro','en']){
      const nodes=ranked(NISTRIAN_PARENT_ID,view,lang);
      assert.deepEqual(nodes.map(x=>x.id),EXPECTED_IDS,view+' / '+lang+' exact IDs');
      assert.deepEqual(nodes.map(x=>shortTreeName(x,lang)),lang==='ro'?EXPECTED_RO:EXPECTED_EN,
        view+' / '+lang+' localized labels but immutable order');
      assert.equal(nodes.length,7);
    }
});

test('WEB-R3.15: local order does not reparent UATSN, Bender, Căușeni or change other nested trees',()=>{
  for(const id of EXPECTED_IDS)
    assert.equal(presentationParentId(byId.get(id),'administrative'),NISTRIAN_PARENT_ID);
  assert.equal(byId.get('osm-r2607033').administrativeParentId,'osm-r58974');
  assert.equal(byId.get('osm-r9581354').administrativeParentId,'osm-r58974');
  assert.equal(byId.get('osm-r2607033').treeParentId,'stat-MD120');
  assert.equal(byId.get('osm-r9581354').treeParentId,'stat-MD120');
  for(const id of ['osm-r1216706','osm-r12215667','osm-r6879649'])
    assert.equal(byId.get(id).administrativeParentId,'osm-r65343');
  const east=ranked('stat-MD120','all','ro');
  assert.deepEqual(east.map(n=>n.id),['osm-r2607033','osm-r9581354']);
  assert.equal(byId.get('osm-r65335').treeParentId,'osm-r58974');
  assert.equal(shortTreeName(byId.get('osm-r65335'),'ro'),'Nistrenia');
  assert.equal(shortTreeName(byId.get('osm-r65335'),'en'),'Pridnestrovie');
  assert.equal(ranked('osm-r1699032','all','ro')[0].id,'osm-r1706978');
  assert.equal(ranked('osm-r1691801','all','ro')[0].id,'osm-r1748490');
});
