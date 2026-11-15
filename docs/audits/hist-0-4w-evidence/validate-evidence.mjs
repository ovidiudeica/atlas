import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const dir=path.dirname(fileURLToPath(import.meta.url));
const read=(f)=>JSON.parse(fs.readFileSync(path.join(dir,f),'utf8'));
const pages=read('facsimile-page-register.json');
const figures=read('figure-and-metric-crosswalk.json');
const geodesy=read('geodetic-restoration-gates.json');
const manifest=read('manifest.json');
const parent=read('../hist-0-4v-evidence/manifest.json');

assert.equal(parent.phase,'HIST-0.4v');
assert.equal(parent.admission.GCP,0);
assert.equal(manifest.phase,'HIST-0.4w');
assert.equal(pages.phase,'HIST-0.4w');
assert.equal(figures.phase,'HIST-0.4w');
assert.equal(geodesy.phase,'HIST-0.4w');
assert.equal(manifest.base_main_sha,'b85c72aabcb320fd86d4dc30679aef5718b8907b');

assert.equal(pages.pages_710.length,14);
assert.equal(pages.pages_highres.length,5);
assert.equal(pages.pages_710.filter(p=>p.year===1979).length,4);
assert.equal(pages.pages_710.filter(p=>p.year===1983).length,10);
assert.equal(new Set(pages.pages_710.map(p=>p.year+':'+p.page)).size,14);
assert.equal(new Set(pages.pages_highres.map(p=>p.year+':'+p.page)).size,5);
for(const row of [...pages.pages_710,...pages.pages_highres]){
  assert.match(row.sha256,/^[0-9a-f]{64}$/);
  assert.ok(row.bytes>10000);
  assert.ok(row.width_px>=710);
  assert.ok(row.height_px>900);
  assert.ok(row.url.startsWith('https://www.persee.fr/renderPage/'));
}
for(const key of ['1979:337','1983:477','1983:478','1983:479','1983:482']){
  assert.ok(pages.pages_highres.some(p=>p.year+':'+p.page===key),key);
}

assert.equal(figures.conventions.length,4);
assert.deepEqual(figures.conventions.map(x=>x.id),[
 'HOLST_PRINT_LEGEND','IOSIPESCU_1979_DESCRIPTIVE','IOSIPESCU_1979_EXCAVATION','IOSIPESCU_1983_EXCAVATION'
]);
assert.equal(figures.conventions[1].tokens.B,'smaller/interior castle west');
assert.equal(figures.conventions[2].tokens.B,'middle gate and its towers');
assert.equal(figures.conventions[3].tokens.B,'central courtyard and gate with east/west towers');
assert.equal(figures.figures.find(x=>x.id==='ARCH1983_FIG_2').independent_spatial_witness,false);
assert.equal(figures.figures.find(x=>x.id==='ARCH1983_FIG_2').legend_namespace,'HOLST_ENGRAVING_REPRODUCTION_NOT_EXCAVATION_FIELD_CODES');
const f3=figures.figures.find(x=>x.id==='ARCH1983_FIG_3');
const f4=figures.figures.find(x=>x.id==='ARCH1983_FIG_4');
assert.deepEqual(f3.graphical_scale_m,[0,1]);
assert.equal(f3.north_arrow,true);
assert.equal(f3.global_crs,null);
assert.equal(f3.hatched_fill_interpretation,'UNLABELED_IN_FIGURE__DO_NOT_ASSUME_ORIGINAL_OR_RECONSTRUCTION');
assert.equal(f3.source_sha_highres,pages.pages_highres.find(p=>p.year===1983&&p.page===478).sha256);
assert.equal(f4.printed_scale,'1:50');
assert.equal(f4.stratigraphic_labels['7'],'stâncă');
assert.equal(f4.source_sha_highres,pages.pages_highres.find(p=>p.year===1983&&p.page===479).sha256);
assert.equal(figures.locally_metric_constraints.find(x=>x.id==='CENTRAL_GATE_WIDTH').observed_width_m,4.15);
assert.equal(figures.locally_metric_constraints.find(x=>x.id==='LOWER_COURTYARD_GATE_WIDTH').observed_width_m,3.70);

assert.equal(geodesy.candidates.length,6);
assert.ok(geodesy.candidates.every(x=>x.gcp===false&&x.modern_measured_corner===null));
assert.equal(geodesy.candidates.find(x=>x.id==='EXCAVATION_B_EAST_GATE_TOWER').hatch_pattern_phase_certified,false);
assert.equal(geodesy.source_constraints.original_asbuilt_restoration_drawing_recovered,false);
assert.equal(geodesy.source_constraints.independent_post1981_wall_foundation_geodetic_survey_found,false);
assert.equal(geodesy.gates.find(x=>x.id==='LOCAL_METRIC_FIGURE').passed,true);
assert.ok(geodesy.gates.filter(x=>x.id!=='LOCAL_METRIC_FIGURE').every(x=>x.passed===false));
for(const key of ['new_independent_GCP','qualified_holdout','Chioar_segments','Transylvania_segments','OHM_relations','legal_boundary_geometries']){
 assert.equal(manifest.admission[key],0,key);
}
assert.equal(manifest.admission.RMSE_m,null);
assert.equal(manifest.source_gate.total_verified_page_scans,14);
assert.equal(manifest.source_gate.high_resolution_additional_scans,5);
assert.equal(manifest.source_gate.original_vs_restored_hatch_meaning_qualified,false);
assert.equal(manifest.source_gate.original_Austrian_25000_sheet_id,null);
assert.ok(Object.values(manifest.restrictions).every(v=>v===false));
assert.deepEqual(manifest.files,['README.md','facsimile-page-register.json','figure-and-metric-crosswalk.json','geodetic-restoration-gates.json','manifest.json','validate-evidence.mjs']);
console.log('HIST-0.4w PASS: 14 original page scans + 5 hi-res verified; local 1m & 1:50 figures; A/B/C namespaces separated; GCP=0, OHM=0, legal=0');
