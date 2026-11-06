import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { gunzipSync } from 'node:zlib';
import { join } from 'node:path';

const root = new URL('../data/candidates/phase3/', import.meta.url);
const read = (name) => readFileSync(new URL(name, root));
const json = (name) => JSON.parse(read(name).toString('utf8'));
const manifest = json('actual/manifest-v1.json');
const validation = json('actual/validation-v1.json');
const entries = json('actual/catalog-v1.json').entities;
const byId = new Map(entries.map((e) => [e.id, e]));

test('candidate is explicitly blocked and never misrepresented as a release', () => {
  assert.equal(manifest.status, 'BLOCKED_INCOMPLETE');
  assert.equal(validation.originalOSMBArchivesNotInBuilder, true);
  assert.equal(validation.missingApprovedAdministrativeGeometry.length, 11);
  assert.equal(validation.statisticalOnlyWithoutGeometry.length, 18);
  assert.equal(validation.missingOfficialRegistryAssociation.length, 181);
});

test('candidate files have correct hashes and byte counts', () => {
  for (const [name, expected] of Object.entries(manifest.outputs)) {
    const data = read(name);
    const hash = createHash('sha256').update(data).digest('hex');
    assert.equal(data.length, expected.bytes, name + ' bytes');
    assert.equal(hash, expected.sha256, name + ' sha256');
  }
});

test('all official registries and statistical nomenclatures remain intact', () => {
  const siruta = JSON.parse(gunzipSync(read('sources/siruta-2026.json.gz')));
  const cuatm = JSON.parse(gunzipSync(read('sources/cuatm-2025.json.gz')));
  assert.equal(siruta.records.length, 16978);
  assert.equal(cuatm.records.length, 1721);
  assert.equal(json('sources/nuts-ro-2024.json').units.length, 54);
  assert.equal(json('sources/nuts-md-2017.json').units.length, 9);
  assert.equal(manifest.counts.unmatchedRORegistry, 0);
  assert.equal(manifest.counts.unmatchedMDRegistry, 0);
  assert.equal(manifest.counts.missingRORegistryAssociation, 0);
  assert.equal(manifest.counts.missingMDRegistryAssociation, 181);
});

test('administrative levels, counts and geometry subsets match candidate scope', () => {
  const ro = entries.filter((e) => e.country === 'RO' && e.roles.includes('administrative'));
  const md = entries.filter((e) => e.country === 'MD' && e.roles.includes('administrative'));
  assert.equal(ro.length, 3229);
  assert.equal(md.length, 1025);
  assert(ro.every((e) => [2, 4, 8, 9].includes(e.adminLevel)));
  assert(md.every((e) => [2, 4, 7, 8].includes(e.adminLevel)));
  assert.equal(ro.filter((e) => e.adminLevel === 9).length, 6);
  assert.equal(md.filter((e) => e.adminLevel === 9).length, 0);
  for (const [country, expected] of [['ro', 3229], ['md', 1025]]) {
    const geo = JSON.parse(gunzipSync(read('actual/' + country + '-administrative-v1.geojson.gz')));
    assert.equal(geo.features.length, expected);
  }
});

test('Brețcu has no invented OSM relation and Ojdula retains its authentic ID', () => {
  const b = byId.get('siruta-u64096');
  const o = byId.get('osm-r14735731');
  assert(b && o);
  assert.equal(b.osmRelationId, null);
  assert.equal(b.registry.code, '64096');
  assert.equal(b.atlasDerivedTags.admin_level, '8');
  assert.equal(b.sourceTags && Object.keys(b.sourceTags).length, 0);
  assert.equal(o.osmRelationId, 14735731);
  assert.equal(o.registry.code, '64602');
  assert.equal(b.officialName, 'Comuna Brețcu');
  assert.equal(o.officialName, 'Comuna Ojdula');
});

test('all statistical roles appear once without duplicating administrative identities', () => {
  const roles = (country) => entries.filter((e) => e.country === country).flatMap((e) => e.statisticalRoles.map((s) => s.code));
  const ro = roles('RO'), md = roles('MD');
  assert.equal(ro.length, 54);
  assert.equal(new Set(ro).size, 54);
  assert.equal(md.length, 9);
  assert.equal(new Set(md).size, 9);
  assert(byId.get('osm-r1699032').statisticalRoles.some((x) => x.code === 'MD114'));
  assert(byId.get('osm-r1691801').statisticalRoles.some((x) => x.code === 'MD115'));
  assert(byId.get('osm-r58974').statisticalRoles.some((x) => x.code === 'MD1'));
  const leftBank = byId.get('stat-MD120');
  assert(leftBank);
  assert.equal(leftBank.externalOsmStatisticalCode, 'MD121');
  assert.equal(leftBank.administrativeParentId, null);
  assert(!byId.has('stat-MD114') && !byId.has('stat-MD115'));
});

test('no duplicate IDs, broken tree references or cycles', () => {
  assert.equal(byId.size, entries.length);
  assert.equal(validation.missingTreeParent.length, 0);
  assert.equal(validation.missingAdministrativeParent.length, 0);
  assert.equal(validation.hierarchyCycles.length, 0);
  for (const entry of entries) {
    if (entry.treeParentId) assert(byId.has(entry.treeParentId), entry.id);
    if (entry.administrativeParentId) assert(byId.has(entry.administrativeParentId), entry.id);
  }
});

test('county SIRUTA codes are true registry codes, not county ordinal codes', () => {
  const covasna = byId.get('osm-r2248621');
  assert.equal(covasna.registry.code, '145');
  assert.equal(covasna.registry.record.name, 'JUDEȚUL COVASNA');
  const bucharest = byId.get('osm-r377733');
  assert.equal(bucharest.registry.code, '403');
  assert.equal(bucharest.registry.record.name, 'MUNICIPIUL BUCUREȘTI');
});

test('Bucharest sectors have authentic SIRUTA 2026 identities', () => {
  const codes = ['179141','179150','179169','179178','179187','179196'];
  const rows = entries.filter((e) => e.country === 'RO' && e.adminLevel === 9);
  assert.equal(rows.length, 6);
  assert.deepEqual(rows.map((e) => e.registry?.code).sort(), [...codes].sort());
  assert(rows.every((e) => e.officialName.startsWith('București Sectorul ')));
});
