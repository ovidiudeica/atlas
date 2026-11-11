import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const dir=path.dirname(fileURLToPath(import.meta.url));
const read=(name)=>JSON.parse(fs.readFileSync(path.join(dir,name),'utf8'));
const gate=read('individual-admission-per-id-37.json');
const sources=read('source-register.json');
const overlay=read('chioar-drive-kmz-vs-ohm-geometry.json');
const raster=read('transylvania-1862-geotiff-technical-metadata.json');
const items=gate.records;
assert.equal(items.length,37);
assert.equal(new Set(items.map(x=>x.ohm_relation_id)).size,37);
assert.deepEqual(gate.priority_counts,{P0:3,P1:25,P2:9});
for(const p of ['P0','P1','P2'])assert.equal(items.filter(x=>x.priority===p).length,gate.priority_counts[p]);
const idset=new Set(sources.sources.map(x=>x.id));
assert.equal(idset.size,sources.sources.length);
for(const record of items){
  assert.ok(Array.isArray(record.new_candidate_source_ids));
  assert.ok(record.new_candidate_source_ids.every(x=>idset.has(x)));
  if(record.individual_admission_eligible||record.import_authorized||record.published_in_HISTORIC_module){
    assert.equal(record.documentary_independence_confirmed,true);
    assert.equal(record.validity_period_to_primary_source_proven,true);
    assert.equal(record.geometry_validated_against_historic_admin_border_per_way,true);
    assert.equal(record.cartographic_institutional_rights_for_publication,true);
    assert.equal(record.individual_admission_eligible,true);
  }
}
assert.equal(items.filter(x=>x.import_authorized).length,gate.new_individually_certified_geometries);
assert.equal(overlay.local_source.kmz_sha256,'7b5f799a41bd6e133bb2b61e187e86504d049a929512c90f606966aadeaf427b');
assert.equal(overlay.kml_chioar_instances.length,2);
assert.equal(overlay.duplicate_kml_exact_coordinates,true);
assert.ok(Math.abs(overlay.comparison_wgs84_km2.jaccard_intersection_over_union-0.9344803740635326)<1e-9);
assert.ok(Math.abs(overlay.comparison_wgs84_km2.symmetric_difference_area-70.79152063509403)<1e-6);
assert.equal(overlay.import_authorization,'NO');
assert.equal(raster.file_sha256,'584c02b98939b0d4416babc0fc7fd50da2f8de042e877bc50e8fc1a8da8fe181');
assert.equal(raster.geo_keys.ProjectedCSTypeGeoKey,31700);
assert.equal(raster.geo_referencing_present,true);
assert.equal(raster.width,5472);
assert.equal(raster.height,4369);
console.log(JSON.stringify({ok:true,relations:items.length,new_source_ids:idset.size,candidate_relation_count:items.filter(x=>x.new_candidate_source_ids.length).length,highlighted_ids:gate.feature_candidates,admitted:items.filter(x=>x.import_authorized).length,kmz_vs_ohm_iou:overlay.comparison_wgs84_km2.jaccard_intersection_over_union,geotiff_epsg:raster.geo_keys.ProjectedCSTypeGeoKey},null,2));
