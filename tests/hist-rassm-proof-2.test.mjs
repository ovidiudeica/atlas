import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {gunzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
const base=new URL('../docs/research/hist-rassm-proof-2/',import.meta.url);
const j=async f=>JSON.parse(await readFile(new URL(f,base),'utf8'));
test('PROOF.2 examines original exports and all district candidates, including additional admin levels',async()=>{
 const s=await j('summary.json'),a=await j('OSMB_source_audit.json');assert.equal(s.source_snapshots,8);assert.equal(s.district_records_analyzed,91);assert.equal(s.districts_assembled_C,91);assert.equal(s.modern_objects,497);
 assert.equal(a.countries[0].relevant_original_objects,450);assert.equal(a.countries[1].relevant_original_objects,47);assert.equal(a.countries[0].admin_levels['3.0'],1);assert.equal(a.countries[1].admin_levels['10.0'],4);assert.ok(a.original_archives.every(x=>x.gzip_crc_verified&&/^[0-9a-f]{64}$/.test(x.sha256)));
});
test('PROOF.2 does not promote geometric matching into historical continuity or A/B',async()=>{
 const s=await j('summary.json');assert.equal(s.PROOF2,'C');assert.equal(s.historical_boundary_A_B_km,0);assert.equal(s.admitted_OSMB_reuse_km,0);assert.equal(s.independently_reconstructed_legal_boundary_km,0);
 for(const r of [...s.exterior,...s.internal]){assert.equal(r.M1_km,0);assert.equal(r.A_B_certified_km,0);assert.equal(r.historical_continuity_proven_km,0);}
});
test('PROOF.2 category lengths partition each episode without summing different years',async()=>{
 const s=await j('summary.json');assert.equal(s.exterior.length,9);assert.equal(s.internal.length,8);
 for(const r of [...s.exterior,...s.internal]){const total=['M1_km','M2_km','M3_km','M4_km','M5_km'].reduce((a,k)=>a+r[k],0);assert.ok(Math.abs(total-r.total_geodesic_km)<1e-8);assert.ok(Math.abs(r.M3_km-r.M3_coincident_km-r.M3_divergent_km)<1e-8);}
});
test('PROOF.2 shared network and all91 district perimeters conserve boundary length',async()=>{
 const s=await j('summary.json');assert.equal(s.districts.length,91);assert.ok(s.validation.shared_boundaries_stored_once_per_episode);assert.ok(s.validation.max_perimeter_identity_delta_m<.05);
 for(const d of s.districts){assert.ok(Math.abs(d.total_geodesic_km-d.perimeter_geodesic_km)*1000<.1);assert.ok(Math.abs(d.internal_boundary_share_km+d.external_boundary_share_km-d.perimeter_geodesic_km)*1000<.1);}
});
test('PROOF.2 administrative registers do not count source snapshots or repeated acts as new transfers',async()=>{
 const e=await j('administrative_events.json');assert.equal(e.filter(x=>x.entity==='NOVOSELIVSKA'&&x.count_as_distinct_change).length,1);
 assert.equal(e.find(x=>x.event_id==='R5B-EV-1937-JAN-HURI').count_as_distinct_change,false);assert.equal(e.find(x=>x.event_id==='R5B-EV-1933-FEB').count_as_distinct_change,false);
});
test('PROOF.2 Bessel discrimination remains an internal grid test, with zero physical GCP admission',async()=>{
 const d=await j('Dubasari_datum_test.json');assert.equal(d.internal_holdouts,4);assert.equal(d.physical_absolute_GCP,0);assert.equal(d.absolute_uncertainty_m,null);assert.equal(d.boundary_admitted_A_B,false);assert.ok(d.ellipsoid_RMSE_nominal_m.bessel<25);assert.ok(d.ellipsoid_RMSE_nominal_m.krass>600);
});
test('PROOF.2 recomputes independently without the first run cache and reproduces geometry and attributes',async()=>{
 const r=await j('reproducibilitate_izolata.json');assert.equal(r.all_passed,true);assert.equal(r.measurement_cache_reused_from_original_run,false);assert.equal(r.matching_and_noding_recomputed,true);assert.equal(r.deterministic_csv_files,18);assert.ok(r.files.every(x=>x.match));assert.ok(r.temporal_gpkg_layers.every(x=>x.geometry_wkb_identical&&x.attributes_identical));
});
test('PROOF.2 portable QGIS project has a nonempty source-derived extent and independent lengths',async()=>{
 const q=await j('QGIS_readback.json'),s=await j('summary.json');assert.ok(q.all_valid&&q.project_reopened&&q.relative_paths&&q.osm_visual_verified&&q.overview_extent_derived_from_actual_feature);assert.ok(q.extent_3857[2]-q.extent_3857[0]>100000);
 for(const r of q.independent_geodesic_lengths){const a=[...s.exterior,...s.internal].find(x=>x.episode===r.episode&&x.kind===r.kind);assert.ok(a);assert.ok(Math.abs(r.qgis_geodesic_m-a.total_geodesic_km*1000)<.01);}
});
test('PROOF.2 compressed individual arc register is intact and contains all classified records',async()=>{
 const m=await j('segment_register_manifest.json'),b=await readFile(new URL('segment_register.csv.gz',base));assert.equal(createHash('sha256').update(b).digest('hex'),m.gzip_sha256);const raw=gunzipSync(b);assert.equal(createHash('sha256').update(raw).digest('hex'),m.uncompressed_sha256);assert.equal(raw.toString('utf8').trim().split('\n').length-1,m.records);assert.equal(m.records,32722);
});
