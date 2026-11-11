import fs from 'node:fs';import path from 'node:path';import zlib from 'node:zlib';import crypto from 'node:crypto';
import AdmZip from 'adm-zip';import {XMLParser} from 'fast-xml-parser';import proj4 from 'proj4';
const root=process.env.HIST_ROOT||path.join(process.env.USERPROFILE||process.env.HOME,'Documents','Atlas-OHM-Inventory-2026-11-10');
const kmzFile=process.env.HIST_KMZ||path.join(root,'hist-0-4e-drive-evidence','Transylvania_admin_early19.kmz');
const ohmFile=process.env.HIST_OHM_GZIP||path.join(root,'hist-0-4b-evidence','original-relations','rel-2747435.json.gz');
const out=process.env.HIST_OUTPUT||path.join(root,'hist-0-4e-drive-evidence','hist04f-chioar-per-way-distance.json');
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
proj4.defs('EPSG:31700','+proj=sterea +lat_0=46 +lon_0=25 +k=0.99975 +x_0=500000 +y_0=500000 +ellps=krass +towgs84=28,-121,-77 +units=m +no_defs');
const pj=p=>proj4('EPSG:4326','EPSG:31700',p);
const xml=new AdmZip(fs.readFileSync(kmzFile)).getEntry('doc.kml').getData().toString('utf8');
const doc=new XMLParser({ignoreAttributes:false,trimValues:true,parseTagValue:false}).parse(xml).kml.Document;
const folders=Array.isArray(doc.Folder)?doc.Folder:[doc.Folder];
const placemarks=folders.flatMap(f=>Array.isArray(f.Placemark)?f.Placemark:f.Placemark?[f.Placemark]:[]);
const cho=placemarks.filter(p=>(p.description||'').includes('COMITATE: Chioar')&&p.Polygon?.outerBoundaryIs?.LinearRing?.coordinates);
if(cho.length!==2)throw Error('Expected exactly two Chioar KML polygons');
const getRing=p=>p.Polygon.outerBoundaryIs.LinearRing.coordinates.trim().split(/\s+/).map(t=>t.split(',').slice(0,2).map(Number));
const ring=getRing(cho[0]),other=getRing(cho[1]);
if(JSON.stringify(ring)!==JSON.stringify(other))throw Error('Two KMZ shapes differ');
const kxy=ring.map(pj);
const ohmRaw=fs.readFileSync(ohmFile);
const rel=JSON.parse(zlib.gunzipSync(ohmRaw).toString('utf8'));
const ways=rel.members.filter(x=>x.type==='way'&&x.role==='outer');
const oxy=ways.map(w=>({id:w.ref,pts:w.geometry.map(p=>pj([p.lon,p.lat]))}));
const otherLine=[...kxy],ohmLine=oxy.flatMap(w=>w.pts);
const ksegs=kxy.slice(1).map((v,i)=>[kxy[i],v]);
const osegs=oxy.flatMap(w=>w.pts.slice(1).map((v,i)=>[w.pts[i],v]));
function dSqPointSegment(p,a,b){
 const dx=b[0]-a[0],dy=b[1]-a[1],den=dx*dx+dy*dy;
 const t=den?Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/den)):0;
 const x=p[0]-a[0]-t*dx,y=p[1]-a[1]-t*dy;
 return x*x+y*y;
}
function dist(p,segs){let low=Infinity;for(const [a,b] of segs)low=Math.min(low,dSqPointSegment(p,a,b));return Math.sqrt(low)}
function samples(poly,spacing=150){
 let s=[];for(let i=1;i<poly.length;i++){const a=poly[i-1],b=poly[i],len=Math.hypot(b[0]-a[0],b[1]-a[1]),num=Math.max(1,Math.ceil(len/spacing));for(let j=0;j<num;j++){const f=(j+0.5)/num;s.push([a[0]+f*(b[0]-a[0]),a[1]+f*(b[1]-a[1])]);}}
 return s;
}
function quantile(sorted,p){if(!sorted.length)return null;const f=(sorted.length-1)*p,i=Math.floor(f);return sorted[i]*(1-(f-i))+(sorted[Math.min(i+1,sorted.length-1)])*(f-i)}
const round=(v,d=2)=>Number(v.toFixed(d));
function metrics(points,segs){
 const d=points.map(p=>dist(p,segs)).sort((a,b)=>a-b);
 return {sample_count:d.length,p50_m:round(quantile(d,.5)),p90_m:round(quantile(d,.9)),p95_m:round(quantile(d,.95)),p99_m:round(quantile(d,.99)),max_m:round(d.at(-1)),within_250m_pct:round(100*d.filter(x=>x<=250).length/d.length,2),within_500m_pct:round(100*d.filter(x=>x<=500).length/d.length,2),within_1000m_pct:round(100*d.filter(x=>x<=1000).length/d.length,2),within_2000m_pct:round(100*d.filter(x=>x<=2000).length/d.length,2)};
}
const perWay=oxy.map(w=>({way_id:w.id,projected_length_km:round(w.pts.slice(1).reduce((sum,p,i)=>sum+Math.hypot(p[0]-w.pts[i][0],p[1]-w.pts[i][1]),0)/1000,3),...metrics(samples(w.pts),ksegs)}));
const ohmSamplePoints=oxy.flatMap(w=>samples(w.pts));
const outcome={phase:'HIST-0.4f',audit_date:'2026-11-11',method:'Per-way closest Euclidean line-segment distances in EPSG:31700; independent sample points every up-to-150m; no map-source historical border certification',ohm_primary_id:2747435,also_applicable_to_identical_ohm_geometry_id:2747434,KMZ_scope:'Early-19th-century Transylvania administrative KMZ; historic authorship and boundary dating unverified',kmz_sha256:sha(fs.readFileSync(kmzFile)),ohm_relation_gzip_sha256:sha(ohmRaw),ohm_way_count:ways.length,kmz_polygon_instances:cho.length,kmz_polygon_identical:true,projection:'EPSG:31700',resampling_spacing_m:150,ohm_to_kmz_global:metrics(ohmSamplePoints,ksegs),kmz_to_ohm_global:metrics(samples(kxy),osegs),per_way_results:perWay,certified_historical_boundary:false,import_authorized:false,interpretation:'Geometric discrepancy magnitude only; does not establish historical correctness of either polygon'};
fs.writeFileSync(out,JSON.stringify(outcome,null,2)+'\n');
console.log(JSON.stringify({file:out,ohm_to_kmz_global:outcome.ohm_to_kmz_global,kmz_to_ohm_global:outcome.kmz_to_ohm_global,perway:perWay.length,ranked:perWay.slice().sort((a,b)=>b.p95_m-a.p95_m).slice(0,8)},null,2));
