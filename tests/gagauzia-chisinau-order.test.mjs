import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {shortTreeName} from '../src/data/treeNames.mjs';
import {presentationParentId,comparePresentationSiblings,GAGAUZIA_ID,CHISINAU_ID,
  CHISINAU_CITY_ID,COMRAT_RAION_ID,RAION_CHILDREN,SECTOR_IDS} from '../src/data/treeOverlay.mjs';
import {compareTreeSiblings} from '../src/data/treeOrder.mjs';
const all=JSON.parse(gunzipSync(readFileSync(
  new URL('../public/data/phase4/catalog.json.gz',import.meta.url))).toString('utf8')).entities;
const byId=new Map(all.map(e=>[e.id,e]));
const children=(pid,view='administrative')=>all.filter(
  x=>presentationParentId(x,view)===pid);
const sorted=(pid,lang='ro',view='administrative')=>[...children(pid,view)]
  .sort((a,b)=>compareTreeSiblings(a,b,view,pid,lang));
const names=(pid,lang='ro',view='administrative')=>sorted(pid,lang,view)
  .map(x=>shortTreeName(x,lang));
test('certified catalog remains intact, and all OSMB Gagauzia ADM8 memberships have unique raions',()=>{
  assert.equal(all.length,4283);
  assert.equal(byId.size,4283);
  assert.equal(byId.get(GAGAUZIA_ID).name,'Găgăuzia');
  assert.equal(byId.get(CHISINAU_ID).name,'Chișinău');
  assert.equal(byId.get(CHISINAU_CITY_ID).name,'Chișinău');
  assert.equal(byId.get(CHISINAU_CITY_ID).adminLevel,8);
  assert.equal(shortTreeName(byId.get(CHISINAU_CITY_ID),'ro'),'Oraș');
  assert.equal(shortTreeName(byId.get(CHISINAU_CITY_ID),'en'),'City');
  const mapping=Object.entries(RAION_CHILDREN);
  assert.deepEqual(mapping.map(([pid,ids])=>[pid,ids.length]),
    [['osm-r1706978',13],['osm-r1706979',9],['osm-r7103068',4]]);
  assert.equal(new Set(mapping.flatMap(([,ids])=>ids)).size,26);
  for(const [pid,ids] of mapping){
    const raion=byId.get(pid);
    assert.equal(raion.administrativeParentId,GAGAUZIA_ID);
    assert.equal(raion.adminLevel,5);
    for(const id of ids){
      const child=byId.get(id);
      assert(child,'Unknown Gagauzia source unit '+id);
      assert.equal(child.adminLevel,8);
      assert.equal(child.administrativeParentId,GAGAUZIA_ID);
      assert.equal(child.treeParentId,GAGAUZIA_ID);
      assert.equal(presentationParentId(child,'statistical'),GAGAUZIA_ID);
      for(const view of ['administrative','all'])
        assert.equal(presentationParentId(child,view),pid);
    }
  }
});
test('Comrat uncoded raion keeps inherited order; Găgăuzia ADM8 localities sort by CUATM in both locales',()=>{
  for(const view of ['administrative','all']){
    const raions=sorted(GAGAUZIA_ID,'ro',view);
    assert.deepEqual(raions.map(x=>x.id),
      [COMRAT_RAION_ID,'osm-r1706979','osm-r7103068']);
    assert.deepEqual(raions.map(x=>shortTreeName(x,'ro')),
      ['Comrat','Ceadîr-Lunga','Vulcănești']);
    assert.equal(raions.length,3);
    for(const [raion,ids] of Object.entries(RAION_CHILDREN)){
      for(const lang of ['ro','en']){
        const kids=sorted(raion,lang,view);
        assert.deepEqual(new Set(kids.map(x=>x.id)),new Set(ids));
        assert.equal(kids.length,ids.length);
        assert(kids.every(x=>x.adminLevel===8));
        assert.deepEqual(kids.map(x=>x.id),
          [...kids].sort((a,b)=>a.registry.code.localeCompare(b.registry.code,'en')
            ||a.id.localeCompare(b.id,'en')).map(x=>x.id),
          'Găgăuzia ADM8 CUATM sorted within '+raion+' / '+lang+' / '+view);
      }
    }
  }
  assert.equal(byId.get('osm-r19118615').name,'Comrat');
  assert.equal(byId.get(COMRAT_RAION_ID).name,'Comrat');
  assert.notEqual(byId.get('osm-r19118615').adminLevel,byId.get(COMRAT_RAION_ID).adminLevel);
});
test('Chișinău code 0100 first; sectors nested under city and sorted by available CUATM',()=>{
  assert.equal(SECTOR_IDS.length,5);
  for(const view of ['administrative','all']){
    for(const lang of ['ro','en']){
      const roots=sorted(CHISINAU_ID,lang,view);
      assert.equal(roots.length,19); // ADM8 city + 18 localities
      assert.equal(roots[0].id,CHISINAU_CITY_ID);
      assert(roots.every(x=>x.adminLevel===8));
      assert.deepEqual(roots.map(x=>x.id),
        [...roots].sort((a,b)=>a.registry.code.localeCompare(b.registry.code,'en')
          ||a.id.localeCompare(b.id,'en')).map(x=>x.id),
        'Chișinău ADM8 siblings sorted by CUATM, not by localized name');
      const sectors=sorted(CHISINAU_CITY_ID,lang,view);
      assert.equal(sectors.length,5);
      assert.deepEqual(new Set(sectors.map(x=>x.id)),new Set(SECTOR_IDS));
      assert.deepEqual(sectors.map(x=>shortTreeName(x,lang)),
        ['Botanica','Buiucani','Ciocana','Rîșcani','Centru']);
      for(const s of sectors){
        assert.equal(s.adminLevel,7);
        assert.equal(s.administrativeParentId,CHISINAU_ID); // actual source parent
        assert.equal(s.treeParentId,CHISINAU_ID);
        assert.equal(presentationParentId(s,view),CHISINAU_CITY_ID);
        assert.equal(presentationParentId(s,'statistical'),CHISINAU_ID);
      }
    }
  }
});
test('hierarchical presentation retains all 53 source children and has no cycles/duplicate nodes',()=>{
  for(const view of ['all','administrative']){
    for(const root of [GAGAUZIA_ID,CHISINAU_ID]){
      const direct=all.filter(x=>x.administrativeParentId===root);
      const discovered=new Set(),visit=(id,depth)=>{
        assert(depth<5,'Unexpected presentation cycle');
        for(const node of children(id,view)){
          assert(!discovered.has(node.id),'Duplicate display node '+node.id);
          discovered.add(node.id);
          visit(node.id,depth+1);
        }
      };
      visit(root,0);
      assert.deepEqual(discovered,new Set(direct.map(x=>x.id)),
        'All original direct children must occur exactly once after indentation');
      assert.equal(discovered.size,root===GAGAUZIA_ID?29:24);
    }
  }
});
test('canonical details and parent IDs remain unchanged; accepted Nistrenia order applies',()=>{
  assert.equal(byId.get(CHISINAU_CITY_ID).administrativeParentId,CHISINAU_ID);
  assert.equal(byId.get('osm-r1813297').officialName,'Sectorul Buiucani');
  assert.equal(presentationParentId(byId.get('osm-r1813297'),'statistical'),CHISINAU_ID);
  for(const node of all){
    if(!['osm-r1699032','osm-r1691801'].includes(node.administrativeParentId))
      assert.equal(presentationParentId(node,'administrative'),node.administrativeParentId,
        'Unrelated administrative parent must not be overridden: '+node.id);
  }
  const nistrenia=all.filter(x=>x.treeParentId==='osm-r65335');
  assert.deepEqual([...nistrenia].sort((a,b)=>
    compareTreeSiblings(a,b,'all','osm-r65335','ro')).map(x=>shortTreeName(x,'ro')),
    ['Bender','Tiraspol','Grigoriopol','Dubăsari','Rîbnița','Slobozia','Camenca']);
});
test('visible breadcrumbs, search expansion and sibling navigation use presentation hierarchy',()=>{
  const app=readFileSync(new URL('../src/App.tsx',import.meta.url),'utf8');
  assert.match(app,/const parent = presentationParentId\(node,view\)/);
  assert.equal((app.match(/const parent=presentationParentId\(cursor,treeView\)/g)||[]).length,3);
  assert.match(app,/const parent=presentationParentId\(currentNode,treeView\)/);
  assert.match(app,/treeView==='administrative'\s*&&\s*x\.node\.roles\.includes\('administrative'\)/);
  assert.match(app,/<dt>\{t.parentAdmin\}<\/dt>/);
});
