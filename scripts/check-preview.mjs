import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const root=new URL('../public/data/',import.meta.url);
const manifest=JSON.parse(readFileSync(new URL('manifest.json',root),'utf8'));
const original=JSON.parse(readFileSync(new URL('countries-original.geojson',root),'utf8'));
const simplified=JSON.parse(readFileSync(new URL('countries-simplified.geojson',root),'utf8'));

test('Only the two approved national OSM relations are included in Phase 2',()=>{
 assert.deepEqual(original.features.map(f=>f.properties.osmRelationId),[90689,58974]);
 assert.deepEqual(original.features.map(f=>f.properties.id),['ro','md']);
 assert.deepEqual(original.features.map(f=>f.properties.adminLevel),[2,2]);
 assert.equal(manifest.snapshotDate,'2026-10-05');
});
test('Simplified mode preserves feature identity and geometry types',()=>{
 assert.deepEqual(simplified.features.map(f=>f.properties),original.features.map(f=>f.properties));
 assert.ok(simplified.features.every(f=>f.geometry.type==='MultiPolygon'||f.geometry.type==='Polygon'));
});
test('Source manifest hashes agree with shipping files',()=>{
 for(const key of ['original','simplified']){
  const bytes=readFileSync(new URL(manifest[key].file,root));
  assert.equal(createHash('sha256').update(bytes).digest('hex'),manifest[key].sha256);
 }
 for(const key of ['ro','md'])assert.match(manifest.sourceRecords[key].sha256,/^[0-9a-f]{64}$/);
});
test('Baseline previews are not mistaken for full canonical catalogue',()=>{
 assert.equal(manifest.renderingOnly,true);
 assert.equal(original.features.length,2);
});