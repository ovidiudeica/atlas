import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const geolib=require('geographiclib-geodesic');
const turfArea=require('@turf/area').area;
const geo=geolib.Geodesic.WGS84;
const home=process.env.USERPROFILE||process.env.HOME;
const histDir=process.env.HIST04D_BASE_DIR || path.join(home,'Documents','Atlas-OHM-Inventory-2026-11-10');
const sourceBase=process.env.HIST04D_RELATION_DIR || path.join(histDir,'hist-0-4b-evidence','original-relations');
const ids=[2747433,2747434,2747435];
const coverage=JSON.parse(fs.readFileSync(process.env.HIST04D_COVERAGE_FILE || path.join(histDir,'hist-0-4b-evidence','way-source-coverage.json'),'utf8')).relations;
const hex=x=>crypto.createHash('sha256').update(x).digest('hex');
const round=(x,n=6)=>Number(x.toFixed(n));
const eq=(a,b)=>Math.abs(a.lat-b.lat)<1e-8&&Math.abs(a.lon-b.lon)<1e-8;
function assemble(members){
  const edges=members.filter(x=>x.type==='way'&&x.geometry?.length>1);
  const rings=[],unclosed=[],extra=[];
  for(const role of ['outer','inner']){
    const pending=edges.filter(x=>x.role===role).map(x=>({ref:x.ref,pts:x.geometry.map(p=>({lat:p.lat,lon:p.lon}))}));
    while(pending.length){
      const start=pending.pop(); const ids=[start.ref]; const pts=[...start.pts];
      for(let i=0;i<edges.length+3;i++){
        if(eq(pts[0],pts.at(-1))) break;
        let j=pending.findIndex(w=>eq(w.pts[0],pts.at(-1))||eq(w.pts.at(-1),pts.at(-1)));
        if(j<0)break;
        const w=pending.splice(j,1)[0]; ids.push(w.ref);
        const arr=eq(w.pts[0],pts.at(-1))?w.pts:w.pts.slice().reverse();
        pts.push(...arr.slice(1));
      }
      const closed=eq(pts[0],pts.at(-1));
      if(!closed)unclosed.push(ids);
      const p=geo.Polygon(false);
      for(const q of pts)p.AddPoint(q.lat,q.lon);
      const s=p.Compute(false,true); // WGS84 signed area
      rings.push({role,closed,way_ids:ids,vertex_count:pts.length,area_sq_m:s.area,perimeter_m:s.perimeter,coordinates:pts});
    }
  }
  return {rings,unclosed,extra};
}
const out=[];
for(const id of ids){
 const file=path.join(sourceBase,`rel-${id}.json.gz`);
 const gz=fs.readFileSync(file);const doc=JSON.parse(zlib.gunzipSync(gz).toString('utf8'));
 const ways=doc.members.filter(x=>x.type==='way');
 const assembled=assemble(doc.members);
 const all=ways.flatMap(w=>w.geometry);
 const hashSource=hex(JSON.stringify(ways.map(w=>({id:w.ref,role:w.role,pts:w.geometry.map(p=>[p.lat,p.lon])})).sort((a,b)=>a.id-b.id)));
 const countByRole=ways.reduce((x,w)=>{x[w.role]=(x[w.role]||0)+1;return x},{});
 const sourceCover=coverage.find(x=>x.id===id);
 if(!sourceCover||sourceCover.member_ways!==ways.length)throw Error('Invalid source coverage for '+id);
 const area=assembled.rings.reduce((s,r)=>s+(r.role==='inner'?-1:1)*Math.abs(r.area_sq_m),0)/1e6;
 const per=assembled.rings.reduce((s,r)=>s+r.perimeter_m,0)/1000;
 const sphericalArea=assembled.rings.reduce((s,r)=>{
   const geojson={type:'Polygon',coordinates:[r.coordinates.map(p=>[p.lon,p.lat])]};
   return s+(r.role==='inner'?-1:1)*turfArea(geojson);
 },0)/1e6;
 const r={id,source_file:path.basename(file),source_file_sha256:hex(gz),source_snapshot:doc.osm3s_timestamp,relation_member_sha256_from_archive:doc.relation_member_sha256,relation_full_response_sha256_from_archive:doc.full_response_sha256,member_ways:ways.length,role_counts:countByRole,way_ids:ways.map(w=>w.ref).sort((a,b)=>a-b),way_geometry_signature_sha256:hashSource,way_vertex_counts:ways.map(w=>({ref:w.ref,n:w.geometry.length})),points_in_way_arrays:all.length,unique_vertices:new Set(all.map(p=>p.lat+','+p.lon)).size,source_tags_present_on_relation:Array.isArray(sourceCover.relation_source_keys)?sourceCover.relation_source_keys.length:0,source_tagged_way_count:sourceCover.way_source_tags_count,closed_rings:assembled.rings.filter(r=>r.closed).length,unclosed_rings:assembled.unclosed.length,outer_rings:assembled.rings.filter(r=>r.role==='outer').length,inner_rings:assembled.rings.filter(r=>r.role==='inner').length,wgs84_ellipsoid_area_km2:round(area,6),spherical_area_km2:round(sphericalArea,6),perimeter_km:round(per,6),bbox:[round(Math.min(...all.map(p=>p.lon)),7),round(Math.min(...all.map(p=>p.lat)),7),round(Math.max(...all.map(p=>p.lon)),7),round(Math.max(...all.map(p=>p.lat)),7)],geometry_topologically_closed:assembled.unclosed.length===0};
 out.push(r);
}
const v1=out.find(x=>x.id===2747434),v2=out.find(x=>x.id===2747435);
const comparison={same_way_ids:JSON.stringify(v1.way_ids)===JSON.stringify(v2.way_ids),same_order_independent_geometry_sha256:v1.way_geometry_signature_sha256===v2.way_geometry_signature_sha256,area_difference_km2:round(v1.wgs84_ellipsoid_area_km2-v2.wgs84_ellipsoid_area_km2,9),perimeter_difference_km:round(v1.perimeter_km-v2.perimeter_km,9),relevance:'same OHM shape across two chronological claims does not demonstrate historic persistence'};
const result={phase:'HIST-0.4d',operation:'INDEPENDENT_RECOMPUTE_GEOMETRIC_TOPOLOGY_FROM_IMMUTABLE_OHM_WAY_COORDINATES',input:'Local HIST-0.4b original relations; no remote OHM edits',geodesic_method:'GeographicLib WGS84 geodesic PolygonArea; double precision; positions from way members',script_engine:process.version,software:'geographiclib-geodesic 2.2.0; @turf/area 7.4.0 (local research only)',audit_date:'2026-11-11',three_cases:out,chioar_comparison:comparison,qualification:'GEOMETRIC_REPRODUCTION_ONLY_NOT_HISTORIC_BOUNDARY_CERTIFICATION'};
const dest=path.resolve(process.env.HIST04D_OUTPUT || path.join(path.dirname(process.argv[1]),'hist-0-4d-independent-geometry-check.json'));
fs.writeFileSync(dest,JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({output:dest,comparison,summary:out.map(x=>({id:x.id,ways:x.member_ways,vertices:x.unique_vertices,rings:x.closed_rings,unclosed:x.unclosed_rings,area_km2:x.wgs84_ellipsoid_area_km2,spherical_km2:x.spherical_area_km2,perimeter_km:x.perimeter_km,geom_sha:x.way_geometry_signature_sha256,source_file_sha256:x.source_file_sha256}))},null,2));
