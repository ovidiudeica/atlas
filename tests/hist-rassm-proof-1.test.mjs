import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const base=new URL('../docs/research/hist-rassm-proof-1/',import.meta.url);
const json=async name=>JSON.parse(await readFile(new URL(name,base),'utf8'));
const csv=async name=>(await readFile(new URL(name,base),'utf8')).trim().split(/\r?\n/);
test('PROOF.1 blocks boundary admission while datum and absolute accuracy are unknown',async()=>{
 const a=await json('audit_GIS.json'), t=await json('transformari.json');
 assert.equal(a.verdict,'PROOF.1-C');assert.equal(a.boundary_admitted_A_or_B,0);assert.equal(a.gcp_absolute_admitted_n,0);
 assert.equal(a.absolute_positional_uncertainty_m,null);assert.equal(a.territorial_area_correction_km2,null);assert.equal(t.admissible_for_certified_boundary,false);
});
test('PROOF.1 holdout controls are disjoint and never used twice',async()=>{
 const rows=await csv('GCP_independente.csv');const header=rows.shift().split(',');const id=header.indexOf('gcp_id'),role=header.indexOf('role');
 const fit=[],hold=[];for(const row of rows){const x=row.split(',');(x[role]==='FIT'?fit:hold).push(x[id]);}
 assert.equal(new Set([...fit,...hold]).size,22);assert.equal(fit.length,14);assert.equal(hold.length,8);assert.ok(fit.every(x=>!hold.includes(x)));
});
test('PROOF.1 publishes new image geometry as hydrography, never as a legal border',async()=>{
 const j=await json('hidrografie_noua_C.geojson');assert.equal(j.features.length,3);
 for(const f of j.features){assert.equal(f.properties.certainty,'C');assert.equal(f.properties.historical_boundary_admitted,false);assert.equal(f.geometry.type,'LineString');assert.equal(f.geometry.coordinates.length,47);}
 const a=j.features.find(f=>f.properties.feature_type==='AXIS_CANDIDATE');assert.ok(a.geometry.coordinates.every(([x,y])=>x>29&&x<29.25&&y>47.16&&y<47.34));
});
test('PROOF.1 legal transfers stay separate from unproved council polygons',async()=>{
 const rows=await csv('reconciliere_1926_12_obiecte.csv');assert.equal(rows.length,13);
 assert.equal(rows.filter(x=>x.includes(',TRANSFER,')).length,11);assert.equal(rows.filter(x=>x.includes('RECOGNITION_ALREADY_INCLUDED')).length,1);
 assert.ok(rows.slice(1).every(x=>x.includes('NO_POLYGON_CREATED')));
});
test('PROOF.1 isolated regeneration and independent QGIS readback pass',async()=>{
 const r=await json('verificari_reproducibilitate.json'),q=await json('QGIS_readback.json');
 assert.equal(r.isolated_cwd,true);assert.equal(r.prior_package_needed,false);assert.equal(r.network_needed,false);assert.ok(r.files.length>10);assert.ok(r.files.every(x=>x.match));
 assert.ok(r.gpkg_layers.every(x=>x.geometry_identical&&x.attributes_identical&&x.crs==='EPSG:4326'));
 assert.equal(q.project_reopened,true);assert.equal(q.all_layers_valid,true);assert.equal(q.osm_visual_verified,true);
});
test('PROOF.1 records reproduction rights and unresolved map-source limitations',async()=>{
 const m=await json('manifest_surse.json');assert.equal(m.length,10);assert.ok(m.every(x=>/^[0-9a-f]{64}$/.test(x.sha256)&&x.width>0&&x.height>0));
 const map=m.find(x=>x.file.startsWith('Dubasari'));assert.match(map.rights,/not established/);assert.match(map.limitations,/datum/);
});
