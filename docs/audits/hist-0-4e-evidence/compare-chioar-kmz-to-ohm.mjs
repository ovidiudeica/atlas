import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import zlib from 'node:zlib';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const AdmZip=require('adm-zip');
const {XMLParser}=require('fast-xml-parser');
const pc=require('polygon-clipping');
const geo=require('geographiclib-geodesic').Geodesic.WGS84;
const turfArea=require('@turf/area').area;
const root=process.env.HIST04E_ROOT||path.join(process.env.USERPROFILE||process.env.HOME,'Documents','Atlas-OHM-Inventory-2026-11-10');
const kmz=process.env.HIST04E_KMZ_FILE||path.join(root,'hist-0-4e-drive-evidence','Transylvania_admin_early19.kmz');
const rel=process.env.HIST04E_OHM_RELATION_GZ||path.join(root,'hist-0-4b-evidence','original-relations','rel-2747435.json.gz');
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const gb=fs.readFileSync(kmz),rb=fs.readFileSync(rel);
const xml=new AdmZip(gb).getEntry('doc.kml').getData().toString('utf8');
const kml=new XMLParser({ignoreAttributes:false,trimValues:true,parseTagValue:false}).parse(xml);
const doc=kml.kml.Document;
const folders=Array.isArray(doc.Folder)?doc.Folder:[doc.Folder];
const all=folders.flatMap(f=>Array.isArray(f.Placemark)?f.Placemark:f.Placemark?[f.Placemark]:[]);
function normRing(a){
 const b=a.map(([lon,lat])=>[Number(lon),Number(lat)]);
 if(b.length&&!((b.at(-1)[0]===b[0][0])&&(b.at(-1)[1]===b[0][1])))b.push(b[0]);return b;
}
function parseKmlPoly(p){
 if(p.Polygon?.outerBoundaryIs?.LinearRing?.coordinates){
   const s=p.Polygon.outerBoundaryIs.LinearRing.coordinates;
   return normRing(s.trim().split(/\s+/).map(q=>q.split(',').slice(0,2).map(Number)));
 }
 return null;
}
const targets=all.map((x,i)=>({i,x,outer:parseKmlPoly(x)})).filter(t=>String(t.x.ExtendedData?.Data?.find?.(d=>d['@_name']==='COMITATE')?.value||t.x.description||'').includes('Chioar'));
if(targets.length!==2)throw Error('Expected 2 KML Chioar polygons, got '+targets.length);
const ohm=JSON.parse(zlib.gunzipSync(rb).toString('utf8'));
const ways=ohm.members.filter(x=>x.type==='way'&&x.role==='outer').map(x=>({id:x.ref,pts:x.geometry.map(p=>[p.lon,p.lat])}));
const eq=(a,b)=>a[0]===b[0]&&a[1]===b[1];
let pending=ways.slice(),rings=[];
while(pending.length){
 const first=pending.pop();let points=first.pts.slice();const ids=[first.id];
 while(!eq(points[0],points.at(-1))){
  const j=pending.findIndex(w=>eq(w.pts[0],points.at(-1))||eq(w.pts.at(-1),points.at(-1)));
  if(j<0)throw Error('OPEN_RING');
  const w=pending.splice(j,1)[0];const rr=eq(w.pts[0],points.at(-1))?w.pts:w.pts.slice().reverse();
  points.push(...rr.slice(1)); ids.push(w.id);
 }
 rings.push({ids,points});
}
if(rings.length!==1)throw Error('Expected single outer ring');
const original=normRing(rings[0].points);
const candidate=targets[0].outer;
const candidate2=targets[1].outer;
const area=coords=>Math.abs(polyArea(coords))/1e6;
function polyArea(coords){
 const poly=geo.Polygon(false); for(const pt of coords)poly.AddPoint(pt[1],pt[0]);return poly.Compute(false,true).area;
}
function sumArea(raw){
 if(!raw.length)return 0;
 let sum=0;for(const poly of raw){for(let i=0;i<poly.length;i++)sum+=(i===0?1:-1)*area(poly[i]);} return sum;
}
const origClipping=[original],kmzClipping=[candidate];
const inter=pc.intersection(origClipping,kmzClipping);
const uni=pc.union(origClipping,kmzClipping);
const difA=pc.difference(origClipping,kmzClipping);
const difB=pc.difference(kmzClipping,origClipping);
const xorr=pc.xor(origClipping,kmzClipping);
const A=area(original),B=area(candidate),I=sumArea(inter),U=sumArea(uni),X=sumArea(xorr);
const bbox=ring=>[Math.min(...ring.map(p=>p[0])),Math.min(...ring.map(p=>p[1])),Math.max(...ring.map(p=>p[0])),Math.max(...ring.map(p=>p[1]))];
const result={
phase:'HIST-0.4e',audit_date:'2026-11-11',operation:'Independent geometrical comparison of Drive KML district Chioar vs immutable OHM 2747435',local_source:{drive_id:'PRIVATE_DRIVE_FILE_ID_REDACTED',name:'Drive KMZ — Transylvania administrative divisions, early nineteenth century',kmz_sha256:sha(gb),kml_bytes:Buffer.byteLength(xml),placemarks_total:all.length,history_date_claim:'beginning of 19th century, not precise',primary_historical_source_in_file:false,license_in_file:false,coordinates_crs:'KML WGS84 longitude latitude'},
ohm_source:{id:2747435,gzip_sha256:sha(rb),member_way_count:ways.length,geom_sha256:sha(Buffer.from(JSON.stringify(original)))},
kml_chioar_instances:targets.map(t=>({placemark_index:t.i,vertices:t.outer.length,bbox:bbox(t.outer),wgs84_area_km2:area(t.outer),coordinate_sha256:sha(Buffer.from(JSON.stringify(t.outer))),administrative_text:t.x.description})),
duplicate_kml_exact_coordinates:JSON.stringify(candidate)===JSON.stringify(candidate2),
comparison_wgs84_km2:{ohm_area:A,kml_area:B,intersection_area:I,union_area:U,ohm_only_area:sumArea(difA),kmz_only_area:sumArea(difB),symmetric_difference_area:X,net_area_difference:B-A,jaccard_intersection_over_union:I/U,percentage_symdiff_vs_union:100*X/U},
geometry_validity:'Clipping completed, requires independent reproduction if admitted',
interpretation:'Documentary independence and historical date/scale NOT demonstrated, numerical comparison is not certification',original_boundary_certified:false,import_authorization:'NO'
};
const outfile=process.env.HIST04E_OUTPUT_FILE||path.join(root,'hist-0-4e-drive-evidence','chioar-drive-kmz-vs-ohm-2747435.json'); fs.writeFileSync(outfile,JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({file:outfile,kml:result.kml_chioar_instances,dup:result.duplicate_kml_exact_coordinates,compare:result.comparison_wgs84_km2,geohash:result.ohm_source.geom_sha256},null,2));
