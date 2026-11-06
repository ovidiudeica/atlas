import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { createHash } from 'node:crypto';

const source=new URL('../public/data/phase4/',import.meta.url);
const file=name=>readFileSync(new URL(name,source));
const json=name=>JSON.parse(file(name).toString('utf8'));
const gz=name=>JSON.parse(gunzipSync(file(name)).toString('utf8'));
const hash=b=>createHash('sha256').update(b).digest('hex');
const manifest=json('manifest.json');
const catalog=gz('catalog.json.gz');
const nodes=catalog.entities;
const byId=new Map(nodes.map(x=>[x.id,x]));

test('Phase 4 assets are pinned to certified Phase 3 and contain 4283 entities',()=>{
  const certificate=readFileSync(new URL('../data/candidates/phase3/actual/manifest-v3.json',import.meta.url));
  assert.equal(manifest.certifiedManifestSha256,hash(certificate));
  assert.equal(catalog.certificate,'CERTIFIED_CARTOGRAPHIC_SOURCE_WITH_ACCEPTED_EXCEPTIONS');
  assert.equal(manifest.legalCertification,false);
  assert.equal(manifest.sourceSnapshotDate,'2026-10-05');
  assert.equal(nodes.length,4283);
  assert.equal(byId.size,4283);
  assert.equal(manifest.totals.administrativeRO,3229);
  assert.equal(manifest.totals.administrativeMD,1036);
});

test('administrative levels are exactly approved and every node has valid tree and legal parents',()=>{
  const ro=nodes.filter(x=>x.country==='RO'&&x.roles.includes('administrative'));
  const md=nodes.filter(x=>x.country==='MD'&&x.roles.includes('administrative'));
  assert(ro.every(x=>[2,4,8,9].includes(x.adminLevel)));
  assert(md.every(x=>[2,3,4,5,7,8].includes(x.adminLevel)));
  assert.equal(ro.filter(x=>x.adminLevel===9).length,6);
  assert.equal(md.filter(x=>x.adminLevel===9).length,0);
  assert.equal(nodes.filter(x=>x.treeParentId===null).length,2);
  for(const n of nodes){
    if(n.treeParentId)assert(byId.has(n.treeParentId),'missing tree parent of '+n.id);
    if(n.administrativeParentId)assert(byId.has(n.administrativeParentId),'missing administrative parent of '+n.id);
    assert(/^roots$|^(ro|md)-(adm-\d{2}|stat)$/.test(n.geometryShard),'invalid shape shard '+n.id);
    const checked=new Set([n.id]); let current=n;
    while(current.treeParentId){
      assert(!checked.has(current.treeParentId),'tree cycle at '+n.id);
      checked.add(current.treeParentId);
      current=byId.get(current.treeParentId);
    }
  }
});

test('Romanian and Moldovan official statistical roles are navigable and not duplicated',()=>{
  const roles=country=>nodes.filter(n=>n.country===country).flatMap(n=>n.statisticalRoles.map(s=>s.code));
  const ro=roles('RO'),md=roles('MD');
  assert.equal(ro.length,54);
  assert.equal(new Set(ro).size,54);
  assert.equal(md.length,9);
  assert.equal(new Set(md).size,9);
  for(const code of ['MD1','MD11','MD12','MD111','MD112','MD113','MD114','MD115','MD120'])assert(md.includes(code));
  assert.equal(byId.get('osm-r1699032').statisticalRoles[0].code,'MD114');
  assert.equal(byId.get('osm-r1691801').statisticalRoles[0].code,'MD115');
  assert.equal(byId.get('osm-r58974').statisticalRoles[0].code,'MD1');
  assert.equal(byId.get('stat-MD120').sourceTags.ref,'MD121');
  assert(byId.get('osm-r65335'));
  assert.notEqual(byId.get('osm-r65335').id,byId.get('stat-MD120').id);
  assert.equal(byId.get('osm-r2248621').treeParentId,'stat-RO12');
  assert.equal(byId.get('osm-r2248621').administrativeParentId,'osm-r90689');
});

test('Brețcu has blank OSM identity; Ojdula retains authentic relation',()=>{
  const b=byId.get('siruta-u64096'),o=byId.get('osm-r14735731');
  assert(b&&o);
  assert.equal(b.osmRelationId,null);
  assert.equal(b.registry.code,'64096');
  assert.equal(b.officialName,'Comuna Brețcu');
  assert.deepEqual(b.sourceTags,{});
  assert.equal(o.osmRelationId,14735731);
  assert.equal(o.registry.code,'64602');
});

test('each compressed geometry asset has a certified hash and correct feature identity',()=>{
  const expected=new Set(nodes.map(x=>x.id));
  for(const mode of ['detailed','simplified']){
    const seen=new Set();
    for(const [group,modes] of Object.entries(manifest.geometry)){
      const entry=modes[mode];
      assert(entry,'no '+mode+' asset in '+group);
      const content=file(entry.file);
      const check=manifest.artifacts[entry.file];
      assert(check,'no SHA for '+entry.file);
      assert.equal(hash(content),check.sha256,entry.file);
      assert.equal(content.length,check.bytes,entry.file);
      const fc=JSON.parse(gunzipSync(content));
      assert.equal(fc.type,'FeatureCollection');
      assert.equal(fc.features.length,entry.count);
      for(const f of fc.features){
        const id=f.properties.atlasId;
        const node=byId.get(id);
        assert(node,'unknown Atlas geometry '+id);
        assert.equal(node.geometryShard,group,'incorrect shard for '+id);
        assert(!seen.has(id),'duplicate shape '+id+' in '+mode);
        assert(['Polygon','MultiPolygon'].includes(f.geometry.type));
        seen.add(id);
      }
    }
    assert.equal(seen.size,expected.size);
    for(const id of expected)assert(seen.has(id),mode+' omitted '+id);
  }
  const catalogBlob=file('catalog.json.gz');
  assert.equal(hash(catalogBlob),manifest.artifacts['catalog.json.gz'].sha256);
});

test('UI connects live data without coupling expansion, visibility and selection',()=>{
  const app=readFileSync(new URL('../src/App.tsx',import.meta.url),'utf8');
  assert.match(app,/loadCatalog\(\)/);
  assert.match(app,/loadGeometryShard\(/);
  assert.match(app,/toggleVisible/);
  assert.match(app,/setExpanded/);
  assert.match(app,/setSelected/);
  assert.match(app,/statistical/);
  assert.match(app,/administrative/);
  assert.match(app,/currentNode\.osmRelationId!==null/);
  assert.match(app,/ROOT_IDS/);
  assert.match(app,/atlas-visible-phase4/);
});
