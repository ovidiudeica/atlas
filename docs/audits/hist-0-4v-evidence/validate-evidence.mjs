import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
const read=(p)=>JSON.parse(fs.readFileSync(path.join(here,p),'utf8'));
const sources=read('source-register.json');
const cross=read('architectural-geodetic-crosswalk.json');
const manifest=read('manifest.json');
const parent=read('../hist-0-4u-evidence/manifest.json');
const primary=read('../hist-0-4u-evidence/primary-evidence.json');

assert.equal(parent.phase,'HIST-0.4u');
assert.equal(parent.verified.qualified_GCP,0);
assert.equal(primary.primary.sha256,'4d035db75c147ce2ec56118577ae3747287edf268de98cabb68be406df3c7b8f');
assert.equal(sources.phase,'HIST-0.4v');
assert.equal(cross.phase,'HIST-0.4v');
assert.equal(manifest.phase,'HIST-0.4v');
assert.equal(manifest.main_base_sha,'53cbca412cfd76b46b7399f885fa59e2fc803f0c');
assert.equal(sources.base_main_sha,manifest.main_base_sha);

const Kacso=sources.sources.find(x=>x.id==='KACSO_2011');
assert.ok(Kacso);
assert.equal(Kacso.pdf_bytes,4389941);
assert.equal(Kacso.pdf_sha256,'ef1eae89c3fc45ff5e7c2e212b57a35753e36ed508dfe254c822f4afc8e187da');
assert.deepEqual(Kacso.printed_pages,[436,437,438]);
assert.equal(Kacso.measured_same_corner_coordinate,false);

for(const id of ['HOLST_BNF_GE_D_14179','ARCH_1979','ARCH_1983','MUSEUM_HISTORY','RAN_108525_01','LECHINTAN_1988']) {
 assert.ok(sources.sources.some(x=>x.id===id),id);
}
assert.equal(sources.sources.find(x=>x.id==='LECHINTAN_1988').independent_geodetic_witness,false);
assert.equal(sources.no_surveyed_gate_corner_found_in_screened_sources,true);
assert.equal(sources.not_a_claim_that_no_survey_exists_anywhere,true);
assert.equal(sources.no_source_binaries_committed,true);

assert.equal(cross.terminology.distinct_reference_alphabets,true);
assert.match(cross.terminology.Holst_B,/not archaeology Sector B/);
assert.equal(cross.features.length,10);
assert.deepEqual(cross.features.filter(x=>x.id.startsWith('HOLST_')).map(x=>x.id),['HOLST_G','HOLST_H']);
assert.ok(cross.features.every(x=>x.gcp===false),'All architectural objects must remain unadmitted');

const central=cross.features.find(x=>x.id==='ARCH_B_CENTRAL_GATE');
assert.equal(central.same_excavation_complex_across_1979_1983,true);
assert.equal(central.individual_wall_vertex_correspondence_verified,false);
assert.equal(central.Holst_G_or_H_equivalence_proven,false);

const east=cross.features.find(x=>x.id==='ARCH_B_EAST_TOWER');
assert.equal(east.two_construction_phases,true);
assert.equal(east.foundation_displaced_relative_to_later_wall,true);
assert.equal(east.original_foundation_vertex_measured,false);

const restored=cross.features.find(x=>x.id==='MODERN_RESTORED_GATE_TOWER');
assert.equal(restored.reconstruction_confirmed,true);
assert.equal(restored.which_east_west_tower_rebuilt,null);
assert.equal(restored.modern_rebuilt_facade_disallowed_as_original_GCP,true);
assert.ok(cross.gcp_gate_checks.length>=7 && cross.gcp_gate_checks.every(x=>x.passed===false));

assert.equal(manifest.new_evidence.sector_B_same_courtyard_gate_complex_1979_1983,true);
assert.equal(manifest.new_evidence.sector_B_same_specific_gate_corner_1979_1983,false);
assert.equal(manifest.new_evidence.Holst_G_to_excavated_wall_vertex,false);
assert.equal(manifest.new_evidence.Holst_H_to_excavated_wall_vertex,false);
assert.equal(manifest.new_evidence.original_Austrian_25000_sheet_found,false);

for(const key of ['GCP','independent_holdout','legal_boundary_segments','OHM_approved','Chioar_segments','Transylvania_segments']) assert.equal(manifest.admission[key],0,key);
assert.equal(manifest.admission.rmse_m,null);
assert.equal(cross.totals.RMSE_m,null);
assert.equal(cross.totals.qualified_independent_GCP,0);
assert.equal(cross.totals.admitted_OHM_relations,0);
assert.ok(Object.values(manifest.restrictions).every(v=>v===false));
assert.deepEqual(manifest.files,['README.md','source-register.json','architectural-geodetic-crosswalk.json','manifest.json','validate-evidence.mjs']);
console.log('HIST-0.4v PASS — 1979/1983 sector-B gate family reconciled; Holst alphabet distinct; 1981 restoration risk; 0 original wall-corner surveys, 0 GCP, 0 OHM, 0 legal borders.');
