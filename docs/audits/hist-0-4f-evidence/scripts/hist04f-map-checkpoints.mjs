import fs from 'node:fs';import path from 'node:path';import zlib from 'node:zlib';import proj4 from 'proj4';import {fromFile} from 'geotiff';
const root=process.env.HIST_ROOT||path.join(process.env.USERPROFILE||process.env.HOME,'Documents','Atlas-OHM-Inventory-2026-11-10');
const dir=path.join(root,'hist-0-4e-drive-evidence');
const image=await(await fromFile(path.join(dir,'eharta-Siebenburgen-1862-geotiff.bin'))).getImage();
const [xmin,ymin,xmax,ymax]=image.getBoundingBox();const [rx,ry]=image.getResolution();
proj4.defs('EPSG:31700','+proj=sterea +lat_0=46 +lon_0=25 +k=0.99975 +x_0=500000 +y_0=500000 +ellps=krass +towgs84=28,-121,-77 +units=m +no_defs');
const xy=p=>proj4('EPSG:4326','EPSG:31700',[p.lon,p.lat]);
const pixelToXY=([px,py])=>[xmin+px*rx,ymax+py*ry];
const cut=[450,400],scale=2.5;
const rasterCandidates=[
 {name:'NW-A',xy_crop:[588,258]},
 {name:'NW-B',xy_crop:[589,284]},
 {name:'NW-C',xy_crop:[588,314]},
 {name:'NW-D',xy_crop:[592,347]},
 {name:'NW-E',xy_crop:[592,379]},
 {name:'NW-F',xy_crop:[590,405]}
];
const oldIds=[200503149,200503150,200503151];
function get(id,ids){
 const f=path.join(root,'hist-0-4b-evidence','original-relations','rel-'+id+'.json.gz');
 const j=JSON.parse(zlib.gunzipSync(fs.readFileSync(f)).toString('utf8'));
 const rel=j.members.filter(w=>w.type==='way'&&ids.includes(w.ref));
 if(rel.length!==ids.length)throw Error('Not all ways retrieved '+id);
 return rel.flatMap(w=>w.geometry.slice(1).map((v,i)=>[xy(w.geometry[i]),xy(v)]));
}
const newLine=get(2829384,[200503147]),oldLine=get(2878295,oldIds);
function dist(p,lines){
 let v=Infinity;
 for(const [a,b] of lines){
 const dx=b[0]-a[0],dy=b[1]-a[1],den=dx*dx+dy*dy;
 const t=den?Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/den)):0;
 v=Math.min(v,Math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dy));
 }
 return v;
}
const points=rasterCandidates.map(p=>{
 const pix=[cut[0]+p.xy_crop[0]/scale,cut[1]+p.xy_crop[1]/scale];
 const pp=pixelToXY(pix);
 return {...p,px_full:pix.map(x=>Number(x.toFixed(1))),projected_xy_m:pp.map(x=>Number(x.toFixed(2))),distance_to_1851_1867_way_m:Number(dist(pp,newLine).toFixed(1)),distance_to_1765_1851_way_group_m:Number(dist(pp,oldLine).toFixed(1))};
});
const median=a=>{const v=a.slice().sort((x,y)=>x-y);return (v[2]+v[3])/2};
const result={phase:'HIST-0.4f',audit_date:'2026-11-11',source:'1862 Siebenbürgen georeferenced GeoTIFF (raster; archive identifier EH01)',target:'North-western differing boundary arc between OHM 2829384 and 2878295',new_way:200503147,old_ways:oldIds,method:'Six non-blind manually selected provisional points on a visually identifiable dashed Landes-style line in the 1862 map crop, with prior awareness of both OHM variants. Projected via raster georeference EPSG:31700; point-to-arc shortest planar distances. Subject to observer-selection bias, map symbol width and unknown warp residuals. Screening only, NOT an independent exact boundary trace or historic georeferencing RMSE.',crop_origin_raster_px:cut,crop_display_scale:scale,original_raster_resolution_m_per_pixel:Math.abs(rx),manual_digitization_uncertainty:'Not formally calibrated; map georeferencing residual and symbol line width unknown',sample_points:points,summary:{median_distance_to_1851_1867_arc_m:Number(median(points.map(x=>x.distance_to_1851_1867_way_m)).toFixed(1)),median_distance_to_1765_1851_arc_m:Number(median(points.map(x=>x.distance_to_1765_1851_way_group_m)).toFixed(1)),point_count:points.length,points_closer_to_1851_variant:points.filter(x=>x.distance_to_1851_1867_way_m<x.distance_to_1765_1851_way_group_m).length},historical_admission:false,confidence:'SCREENING_ONLY_NO_CERTIFICATION'};
const out=path.join(dir,'hist04f-1862-nw-manual-screen.json');fs.writeFileSync(out,JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result.summary));console.log(JSON.stringify(points));
