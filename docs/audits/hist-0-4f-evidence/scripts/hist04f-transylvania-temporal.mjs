import fs from 'node:fs';import path from 'node:path';import zlib from 'node:zlib';import crypto from 'node:crypto';import proj4 from 'proj4';import pc from 'polygon-clipping';
const root=process.env.HIST_ROOT||path.join(process.env.USERPROFILE||process.env.HOME,'Documents','Atlas-OHM-Inventory-2026-11-10');
const out=process.env.HIST_OUTPUT||path.join(root,'hist-0-4e-drive-evidence','hist04f-transylvania-temporal-geometry.json');
const ids=[2829384,2878295],sha=b=>crypto.createHash('sha256').update(b).digest('hex');
proj4.defs('EPSG:31700','+proj=sterea +lat_0=46 +lon_0=25 +k=0.99975 +x_0=500000 +y_0=500000 +ellps=krass +towgs84=28,-121,-77 +units=m +no_defs');
const project=p=>proj4('EPSG:4326','EPSG:31700',p);
const eq=(a,b)=>a[0]===b[0]&&a[1]===b[1];
function ringArea(p){let a=0;for(let i=1;i<p.length;i++)a+=p[i-1][0]*p[i][1]-p[i][0]*p[i-1][1];return Math.abs(a)/2/1e6;}
function area(polygons){return polygons.reduce((acc,p)=>acc+p.reduce((s,r,i)=>s+(i===0?1:-1)*ringArea(r),0),0)}
const recs=[];
for(const id of ids){
 const f=path.join(root,'hist-0-4b-evidence','original-relations','rel-'+id+'.json.gz'),g=fs.readFileSync(f);
 const obj=JSON.parse(zlib.gunzipSync(g).toString('utf8'));
 const ways=obj.members.filter(w=>w.type==='way'&&w.role==='outer').map(w=>({id:w.ref,geo:w.geometry.map(p=>[p.lon,p.lat])}));
 const pending=ways.map(w=>({...w})),rings=[];
 while(pending.length){
  const first=pending.pop();let pts=first.geo.slice(),ids=[first.id];
  while(!eq(pts[0],pts.at(-1))){
   const i=pending.findIndex(w=>eq(pts.at(-1),w.geo[0])||eq(pts.at(-1),w.geo.at(-1)));
   if(i<0)throw Error('Unclosed boundary in '+id+' '+ids);
   const n=pending.splice(i,1)[0],arr=eq(pts.at(-1),n.geo[0])?n.geo:n.geo.slice().reverse();
   pts.push(...arr.slice(1));ids.push(n.id);
  }
  rings.push({way_ids:ids,vertices:pts.length,pts:pts.map(project)});
 }
 if(rings.length!==1)throw Error(id+' unexpected '+rings.length+' rings');
 const sig=Object.fromEntries(ways.map(w=>[w.id,sha(Buffer.from(JSON.stringify(w.geo)))]));
 recs.push({id,bytes:g.length,gzip_sha256:sha(g),tags:obj.tags,ways:ways.length,way_ids:ways.map(w=>w.id).sort((a,b)=>a-b),way_signatures:sig,rings:rings.map(r=>({ways:r.way_ids.length,vertices:r.vertices})),projected_area_km2:ringArea(rings[0].pts),coords:rings[0].pts});
}
const A=recs[0],B=recs[1],sA=new Set(A.way_ids),sB=new Set(B.way_ids);
const common=A.way_ids.filter(x=>sB.has(x)),oldOnly=B.way_ids.filter(x=>!sA.has(x)),newOnly=A.way_ids.filter(x=>!sB.has(x));
const changedCoord=common.filter(x=>A.way_signatures[x]!==B.way_signatures[x]);
const a=[A.coords],b=[B.coords];
const overlap=pc.intersection(a,b),uni=pc.union(a,b),xorr=pc.xor(a,b);
const rounded=n=>Number(n.toFixed(6));
const outObj={phase:'HIST-0.4f',audit_date:'2026-11-11',method:'Exact way-ID and coordinate signatures plus polygon-clipping projected planar EPSG:31700 areas; temporal comparison not a historical border truth oracle',reference_1862_claim:'2829384 interval 1851–1867, earlier comparator 2878295 interval 1765–1851',source:[A,B].map(x=>({relation_id:x.id,gzip_sha256:x.gzip_sha256,way_count:x.ways,rings:x.rings,projected_area_km2:rounded(x.projected_area_km2),tags:x.tags})),way_overlap:{common_way_ids:common.length,common_coordinate_identical:common.length-changedCoord.length,common_but_coordinate_changed:changedCoord,only_1851_1867:newOnly,only_1765_1851:oldOnly},polygon_overlap_km2:{intersection:rounded(area(overlap)),union:rounded(area(uni)),symmetric_difference:rounded(area(xorr)),iou:rounded(area(overlap)/area(uni))},historic_boundary_per_way_validation:false};
fs.writeFileSync(out,JSON.stringify(outObj,null,2)+'\n');
console.log(JSON.stringify({way_overlap:outObj.way_overlap,polygon_overlap_km2:outObj.polygon_overlap_km2,source:outObj.source.map(x=>({id:x.relation_id,ways:x.way_count,rings:x.rings,area:x.projected_area_km2})),file:out},null,2));
