import fs from 'node:fs';import path from 'node:path';
const root=process.env.HIST_ROOT||path.join(process.env.USERPROFILE||process.env.HOME,'Documents','Atlas-OHM-Inventory-2026-11-10');
const dir=path.join(root,'hist-0-4e-drive-evidence'),read=f=>JSON.parse(fs.readFileSync(path.join(dir,f),'utf8'));
const cover=read('hist04f-stage1-extent-way.json').relation_controls;
const temporal=read('hist04f-transylvania-temporal-geometry.json');
const chioar=read('hist04f-chioar-per-way-distance.json');
const points=read('hist04f-1862-nw-manual-screen.json');
const earlier=temporal.way_overlap;
const oldSet=new Set(temporal.source.find(x=>x.relation_id===2878295).tags?.map?.(x=>x.key)||[]);
const curr=cover.find(x=>x.ohm_relation_id===2829384),previous=cover.find(x=>x.ohm_relation_id===2878295);
const shared=new Set(temporal.source?.[0]?.tags?.map?.(x=>x.key)||[]);
if(curr.way_count!==82||previous.way_count!==84||earlier.common_way_ids!==81||earlier.only_1851_1867.length!==1||points.sample_points.length!==6)throw Error('Transylvania source invariants');
const commonOld=new Set(previous.ways.map(x=>x.way_id));
const vWay=curr.ways.map(w=>({way_id:w.way_id,vertex_count:w.vertex_count,length_projected_km:Number((w.projected_length_m/1000).toFixed(3)),inside_1862_geotiff:w.vertex_inside_raster===w.vertex_count,older_1765_1851_way_identical:commonOld.has(w.way_id),change_arc_on_nw_border:w.way_id===earlier.only_1851_1867[0],historical_1862_land_border_identified_and_traced:false,provisional_manual_1862_screen:w.way_id===earlier.only_1851_1867[0]?'SIX_VISUAL_PIXELS_ON_LANDES_STYLE_LINE_NON_CERTIFYING':'NOT_YET_SEGMENT_TRACED',historical_boundary_approved:false}));
if(vWay.filter(x=>x.inside_1862_geotiff).length!==82||vWay.filter(x=>x.older_1765_1851_way_identical).length!==81)throw Error('Coverage/share failure');
const pWay=chioar.per_way_results.map(x=>({...x,applicable_to:[2747434,2747435],historical_exact_boundary_approved:false}));
if(pWay.length!==15)throw Error('Chioar missing ways');
const out={
phase:'HIST-0.4f',audit_date:'2026-11-11',scope:'All 82 Transylvania 1851-1867 OHM ways screen and all 15 Chioar line distances. Raster extent control is NOT cartographic line validation.',map_1862_source_sha256:'584c02b98939b0d4416babc0fc7fd50da2f8de042e877bc50e8fc1a8da8fe181',
transylvania:{id:2829384,year_of_reference_map:1862,ways_total:82,ways_spatially_covered:82,ways_not_certified:82,ways_common_with_older_variant:81,changed_way_id:earlier.only_1851_1867[0],old_3_way_alternative:earlier.only_1765_1851,projected_length_km:curr.total_projected_length_km,source_tagged_way_count_from_HIST04b:8,independent_legal_documentation_of_all_82_border_ways:false,ways:vWay},
chioar:{ids:[2747434,2747435],shared_ways_total:15,ways_with_geometric_KMZ_distance_sample:15,KMZ_source_authorship_verified:false,KMZ_historical_border_date_verified:false,KMZ_provenance_verified:false,KMZ_line_distance_sampling_m:150,global_distance:chioar.ohm_to_kmz_global,ways:pWay},
manual_provisional_screen:points.summary,
outcome:{transylvania_admitted:0,chioar_admitted:0,site_changes_authorized:false,focus_requires_independent_primary_border_trace:true}
};
const dest=path.join(dir,'hist04f-per-way-gate.json');fs.writeFileSync(dest,JSON.stringify(out,null,2)+'\n');
console.log(JSON.stringify({file:dest,transylvania_way_records:vWay.length,old_shared:out.transylvania.ways_common_with_older_variant,inside:vWay.filter(x=>x.inside_1862_geotiff).length,chioar_distance_way_records:pWay.length,no_admissions:true,bytes:fs.statSync(dest).size},null,2));
