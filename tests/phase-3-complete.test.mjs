import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { createHash } from 'node:crypto';

const base = new URL('../data/candidates/phase3/', import.meta.url);
const read = (name) => readFileSync(new URL(name, base));
const json = (name) => JSON.parse(read(name).toString('utf8'));
const ungzip = (name) => JSON.parse(gunzipSync(read(name)));
const manifest = json('actual/manifest-v2.json');
const validation = json('actual/validation-v2.json');
const catalog = json('actual/catalog-v2.json');
const nodes = catalog.entities;
const byId = new Map(nodes.map(e => [e.id, e]));
const roAdmin = ungzip('actual/ro-administrative-v2.geojson.gz').features;
const mdAdmin = ungzip('actual/md-administrative-v2.geojson.gz').features;
const roStat = ungzip('actual/ro-statistical-v2.geojson.gz').features;
const mdStat = ungzip('actual/md-statistical-v2.geojson.gz').features;
const byGeometryId = new Map([...roAdmin, ...mdAdmin, ...roStat, ...mdStat].map(f => [f.id, f]));

const extraSources = [
  ['MD', ungzip('sources/md-admin-additional.geojson.gz').features],
  ['ROSTAT', ungzip('sources/rostat-additional.geojson.gz').features],
  ['MDSTAT', ungzip('sources/mdstat-additional.geojson.gz').features]
];
const edgeEvidence = json('sources/edge-match-evidence.json');

function edgesOf(geometry) {
  const polygons = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates;
  assert(['Polygon', 'MultiPolygon'].includes(geometry.type), geometry.type);
  const edges = [];
  for (const polygon of polygons) {
    for (const ring of polygon) {
      assert(ring.length >= 4);
      assert.deepEqual(ring[0], ring[ring.length - 1], 'unclosed ring');
      for (let i = 0; i < ring.length - 1; i++) {
        const a = ring[i].map(x => Number(x).toFixed(7)).join(',');
        const b = ring[i + 1].map(x => Number(x).toFixed(7)).join(',');
        edges.push(a < b ? a + '|' + b : b + '|' + a);
      }
    }
  }
  edges.sort();
  return {
    length: edges.length,
    sha256: createHash('sha256').update(edges.join('\n')).digest('hex')
  };
}

test('phase 3 v2 is complete in geometry but remains BLOCKED for release', () => {
  assert.equal(manifest.status, 'GEOMETRY_COMPLETE_NOT_PROMOTABLE');
  assert.equal(validation.status, 'SOURCE_GEOMETRY_COMPLETE_TOPOLOGY_REVIEW_REQUIRED');
  assert.deepEqual(validation.missingApprovedAdministrativeGeometry, []);
  assert.deepEqual(validation.missingStandaloneStatisticalGeometry, []);
  assert.equal(validation.cycleCount, 0);
  assert.deepEqual(validation.invalidTreeParents, []);
  assert.equal(manifest.exactSourceEdgesVerified, 31);
  assert.equal(manifest.exactSourceTagsVerified, 31);
  assert.equal(manifest.releaseBlockers.length, 4);
});

test('manifest enumerates all eight candidate files with correct SHA-256 and bytes', () => {
  for (const [name, record] of Object.entries(manifest.files)) {
    const bytes = read(name);
    assert.equal(bytes.length, record.bytes, name + ' byte count');
    assert.equal(createHash('sha256').update(bytes).digest('hex'), record.sha256, name + ' sha256');
  }
  assert.equal(Object.keys(manifest.files).length, 8);
});

test('all selected admin levels and standalone statistical polygons are present', () => {
  assert.equal(roAdmin.length, 3229);
  assert.equal(mdAdmin.length, 1036);
  assert.equal(roStat.length, 12);
  assert.equal(mdStat.length, 6);
  assert.equal(nodes.filter(x => x.country === 'RO' && x.roles.includes('administrative')).length, 3229);
  assert.equal(nodes.filter(x => x.country === 'MD' && x.roles.includes('administrative')).length, 1036);
  const countLevel = (items, level) => items.filter(f => f.properties.adminLevel === level).length;
  assert.equal(countLevel(roAdmin, 9), 6);
  assert.equal(countLevel(mdAdmin, 3), 1);
  assert.equal(countLevel(mdAdmin, 5), 10);
  assert.equal(countLevel(mdAdmin, 8), 982);
  assert(!mdAdmin.some(f => f.properties.adminLevel === 9));
  for (const e of nodes) if (e.geometryRef) assert(byGeometryId.has(e.id), e.id + ' missing geometry');
});

test('all 31 reconstructed source outlines match the exact audited edge hashes', () => {
  const expected = new Map(edgeEvidence.map(e => [e.key, e]));
  assert.equal(expected.size, 31);
  let seen = 0;
  for (const [kind, sourceFeatures] of extraSources) {
    for (const feature of sourceFeatures) {
      const relationId = feature.properties.source_relation_id;
      const key = kind + ':' + relationId;
      const reference = expected.get(key);
      assert(reference?.matched, 'missing independent reference '+key);
      const edges = edgesOf(feature.geometry);
      assert.equal(edges.length, reference.edges, key+' edge count');
      assert.equal(edges.sha256, reference.expected, key+' original source edge hash');
      seen++;
    }
  }
  assert.equal(seen, 31);
});

test('every newly selected administrative and statistical source is in the candidate', () => {
  for (const [kind, sourceFeatures] of extraSources) {
    for (const feature of sourceFeatures) {
      const id = feature.properties.source_relation_id;
      const tags = feature.properties.tags;
      if (kind === 'MD') {
        const e = byId.get('osm-r'+id);
        assert(e, 'missing MD admin '+id);
        assert.equal(e.osmRelationId, id);
        assert.deepEqual(e.sourceTags, tags);
        assert.deepEqual(byGeometryId.get(e.id).geometry, feature.geometry, 'MD geometry '+id);
      } else if (kind === 'ROSTAT') {
        const code = tags['ref:nuts'];
        if (!code || !byId.has('stat-'+code)) continue;
        const e = byId.get('stat-'+code);
        assert.deepEqual(e.sourceTags, tags);
        assert.deepEqual(byGeometryId.get(e.id).geometry, feature.geometry);
      } else {
        const code = tags.ref === 'MD121' ? 'MD120' : tags.ref;
        const e = (code === 'MD114') ? byId.get('osm-r1699032') :
          (code === 'MD115') ? byId.get('osm-r1691801') : byId.get('stat-'+code);
        assert(e, 'missing MD stat '+code);
        if (code === 'MD114' || code === 'MD115') {
          assert.deepEqual(e.statisticalSourceTags, tags);
          assert.equal(e.statisticalSourceOSMRelationId, id);
          assert.deepEqual(byGeometryId.get(e.id).geometry, feature.geometry);
        } else {
          assert.deepEqual(e.sourceTags, tags);
          assert.deepEqual(byGeometryId.get(e.id).geometry, feature.geometry);
          assert.equal(e.externalOsmStatisticalCode, tags.ref);
        }
      }
    }
  }
});

test('preserve all 54 RO and 9 MD statistical roles, without identity duplication', () => {
  const statRoles = country => nodes.filter(x => x.country===country).flatMap(x => x.statisticalRoles || []);
  const ro = statRoles('RO'), md = statRoles('MD');
  assert.equal(ro.length, 54);
  assert.equal(md.length, 9);
  assert.equal(new Set(ro.map(x=>x.code)).size,54);
  assert.equal(new Set(md.map(x=>x.code)).size,9);
  assert.equal(byId.get('osm-r1699032').statisticalRoles.find(x=>x.code==='MD114').level,3);
  assert.equal(byId.get('osm-r1691801').statisticalRoles.find(x=>x.code==='MD115').level,3);
  assert.equal(byId.get('osm-r58974').statisticalRoles.find(x=>x.code==='MD1').level,1);
  assert(!byId.has('stat-MD114') && !byId.has('stat-MD115'));
  assert.equal(byId.get('stat-MD120').externalOsmStatisticalCode, 'MD121');
  assert.equal(byId.get('stat-MD120').statisticalRoles[0].code,'MD120');
});

test('all 180 CUATM associations are explicitly reconciled, without invented identifiers', () => {
  const result = json('actual/md-cuatm-180-reconciliation.json');
  assert.equal(result.records.length, 180);
  assert.equal(result.matched, 178);
  assert.equal(result.notApplicable, 2);
  assert.equal(result.records.filter(x => x.status === 'matched').length,178);
  assert.equal(result.records.filter(x => x.status === 'not_applicable').length,2);
  for (const r of result.records) {
    const e=byId.get(r.atlasId);
    assert(e);
    if (r.status === 'matched') {
      assert.equal(e.registry.code, r.officialCode);
      assert(e.registry.matchedSourceRecord);
      assert.equal(e.registry.record.code, r.officialCode);
    } else {
      assert.equal(r.officialCode,null);
      assert.equal(e.registry,null);
    }
  }
  assert.equal(byId.get('osm-r58512').registry, null);
  assert.equal(byId.get('osm-r12207955').registry, null);
});

test('six duplicate CUATM reference groups are explicitly reported, not suppressed', () => {
  const conflicts = json('actual/md-cuatm-source-collisions.json');
  assert.equal(conflicts.count, 6);
  assert.equal(conflicts.groups.length, 6);
  for (const group of conflicts.groups) {
    assert(group.ids.length >=2);
    for (const id of group.ids) {
      const e=byId.get(id);
      assert.equal(e.registry.code, group.code);
      assert.equal(e.registryIdentityReviewStatus, 'duplicate_cuatm_reference_pending_source_geometry_review');
    }
  }
});

test('Brețcu and Ojdula follow the approved identity and public card policy', () => {
  const b=byId.get('siruta-u64096'), o=byId.get('osm-r14735731');
  assert(b && o);
  assert.equal(b.osmRelationId,null);
  assert.equal(b.registry.code,'64096');
  assert.equal(b.officialName,'Comuna Brețcu');
  assert.deepEqual(b.sourceTags,{});
  assert.equal(o.osmRelationId,14735731);
  assert.equal(o.registry.code,'64602');
  assert.equal(o.officialName,'Comuna Ojdula');
});

test('tree and administrative parents are resolved and hierarchy has no cycles', () => {
  assert.equal(byId.size,nodes.length);
  for(const e of nodes) {
    if (e.treeParentId) assert(byId.has(e.treeParentId),e.id+' bad tree parent');
    if (e.administrativeParentId) assert(byId.has(e.administrativeParentId),e.id+' bad administrative parent');
    const seen=new Set([e.id]);let p=e.treeParentId;
    while(p) { assert(!seen.has(p),'cycle from '+e.id+' to '+p);seen.add(p);p=byId.get(p)?.treeParentId||null;}
  }
});

test('topological discrepancies remain recorded and block promotion', () => {
  const ids = new Set(validation.topologyBlockers.map(x=>x.id));
  assert(ids.has('RO_LEVEL8_OVERLAP_2'));
  assert(ids.has('MD_LEVEL8_OVERLAP_1'));
  assert(ids.has('MD_PARENT_OUTSIDE_2'));
  assert(ids.has('MD_CUATM_DUPLICATE_REFERENCE_GROUPS_6'));
  assert.equal(validation.topologyBlockers.find(x=>x.id==='RO_LEVEL8_OVERLAP_2').count,2);
  assert.equal(validation.topologyBlockers.find(x=>x.id==='MD_LEVEL8_OVERLAP_1').count,1);
  assert.equal(validation.topologyBlockers.find(x=>x.id==='MD_PARENT_OUTSIDE_2').count,2);
});
