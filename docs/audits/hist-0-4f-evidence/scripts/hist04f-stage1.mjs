import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import crypto from 'node:crypto';
import {fromFile} from 'geotiff';
import proj4 from 'proj4';
import sharp from 'sharp';
const root=process.env.HIST_ROOT||path.join(process.env.USERPROFILE,'Documents','Atlas-OHM-Inventory-2026-11-10');
const folder=path.join(root,'hist-0-4e-drive-evidence');
const tf=path.join(folder,'eharta-Siebenburgen-1862-geotiff.bin');
const img=await (await fromFile(tf)).getImage();
const box=img.getBoundingBox(),res=img.getResolution(),w=img.getWidth(),h=img.getHeight();
proj4.defs('EPSG:31700','+proj=sterea +lat_0=46 +lon_0=25 +k=0.99975 +x_0=500000 +y_0=500000 +ellps=krass +towgs84=28,-121,-77 +units=m +no_defs');
const tr=ll=>proj4('EPSG:4326','EPSG:31700',ll);
const pix=ll=>{let [x,y]=tr(ll);return [(x-box[0])/res[0],(y-box[3])/res[1]]};
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const ids=[2829384,2878295,2747434,2747435];
const results=[];
let svgs=[];
for(const id of ids){
 let file=path.join(root,'hist-0-4b-evidence','original-relations','rel-'+id+'.json.gz');
 let bytes=fs.readFileSync(file),data=JSON.parse(zlib.gunzipSync(bytes).toString('utf8'));
 const ways=data.members.filter(m=>m.type==='way');
 let records=ways.map(way=>{
  let coords=way.geometry.map(p=>[p.lon,p.lat]),pixel=coords.map(pix);
  let inside=pixel.filter(pt=>pt[0]>=0&&pt[0]<w&&pt[1]>=0&&pt[1]<h).length;
  let lengths=0, lengths_inside=0, n=0;
  for(let i=1;i<coords.length;i++){
   let a=tr(coords[i-1]),b=tr(coords[i]),seg=Math.hypot(b[0]-a[0],b[1]-a[1]);
   if(Number.isFinite(seg)){lengths+=seg; n++;if(pixel[i-1][0]>=0&&pixel[i-1][0]<w&&pixel[i-1][1]>=0&&pixel[i-1][1]<h&&pixel[i][0]>=0&&pixel[i][0]<w&&pixel[i][1]>=0&&pixel[i][1]<h)lengths_inside+=seg;}
  }
  return {way_id:way.ref,role:way.role,vertex_count:coords.length,vertex_inside_raster:inside,projected_length_m:Number(lengths.toFixed(2)),projected_length_inside_raster_approx_m:Number(lengths_inside.toFixed(2)),pixel_start:pixel[0].map(x=>Number(x.toFixed(1))),pixel_end:pixel.at(-1).map(x=>Number(x.toFixed(1))),pixel_bbox:[Math.min(...pixel.map(x=>x[0])),Math.min(...pixel.map(x=>x[1])),Math.max(...pixel.map(x=>x[0])),Math.max(...pixel.map(x=>x[1]))].map(x=>Number(x.toFixed(1))),coordinates_sha256:sha(Buffer.from(JSON.stringify(coords)))};
 });
 const outside=records.filter(r=>r.vertex_inside_raster===0);
 const perc=records.filter(r=>r.vertex_inside_raster===r.vertex_count);
 const total=records.reduce((s,r)=>s+r.projected_length_m,0);
 const out={ohm_relation_id:id,source_gzip_sha256:sha(bytes),way_count:ways.length,geometry_interval:data.tags?.filter?.(t=>['start_date','end_date'].includes(t.key))||null,covered_complete_way_count:perc.length,uncovered_way_count:outside.length,total_projected_length_km:Number((total/1000).toFixed(3)),sum_approx_length_inside_km:Number((records.reduce((s,r)=>s+r.projected_length_inside_raster_approx_m,0)/1000).toFixed(3)),ways:records};
 results.push(out);
 if(id===2829384||id===2747434){
  const strokes=id===2829384?'#e000d0':'#02e0c6';
  const paths=ways.map(way=>{
    const points=way.geometry.map(p=>pix([p.lon,p.lat])).map(q=>q.map(a=>Number((a/w*1200).toFixed(1))));
    // x scales with width, y with same factor
    return '<polyline points="'+way.geometry.map(p=>pix([p.lon,p.lat]).map(a=>Number((a/w*1200).toFixed(2))).join(',')).join(' ')+'" fill="none" stroke="'+strokes+'" stroke-opacity="0.78" stroke-width="2.3"/>';
  });
  svgs.push(...paths);
 }
}
const result={phase:'HIST-0.4f',method:'OHM archived way coordinate projection to georeferenced 1862 historic raster; no historical line matching performed yet',projection_definition:proj4.defs('EPSG:31700'),raster_bbox_projected:box,raster_resolution_m_per_pixel:res,raster_pixels:[w,h],relation_controls:results};
const outpath=path.join(folder,'hist04f-stage1-extent-way.json');fs.writeFileSync(outpath,JSON.stringify(result,null,2)+'\n');
const thumb=fs.readFileSync(path.join(folder,'eharta-Siebenburgen-1862-thumbnail.jpg'));
const thumbMeta=await sharp(thumb).metadata();
const scaledWidth=thumbMeta.width,scaledHeight=thumbMeta.height;
const svg='<svg xmlns="http://www.w3.org/2000/svg" width="'+scaledWidth+'" height="'+scaledHeight+'" viewBox="0 0 1200 '+scaledHeight+'">'+svgs.join('')+'</svg>';
const imgOut=path.join(folder,'hist04f-geometry-diagnostic-1862.jpg');
await sharp(thumb).composite([{input:Buffer.from(svg),left:0,top:0}]).jpeg({quality:89}).toFile(imgOut);
console.log(JSON.stringify({raster:[w,h],bbox:box,output:outpath,preview:imgOut,way:results.map(z=>({id:z.ohm_relation_id,ways:z.way_count,fully_in:z.covered_complete_way_count,none_in:z.uncovered_way_count,len_km:z.total_projected_length_km,ins_km:z.sum_approx_length_inside_km}))},null,2));
