import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import sharp from 'sharp';
const root=process.env.HIST_ROOT||path.join(process.env.USERPROFILE||process.env.HOME,'Documents','Atlas-OHM-Inventory-2026-11-10');
const dir=path.join(root,'hist-0-4g-research-local');await fs.mkdir(dir,{recursive:true});
const url='https://mnl.gov.hu/mnl/ol/hirek/erdely_terkep_amely_a_kormanyra_nezve_valosagos_kincset_kepezett';
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
async function download(u,name,maxBytes=40000000){
 const response=await fetch(u,{signal:AbortSignal.timeout(90000)});
 if(!response.ok)throw Error(response.status+' '+u);
 const b=Buffer.from(await response.arrayBuffer());
 if(b.length>maxBytes)throw Error('OVER_LIMIT '+b.length);
 const f=path.join(dir,name);await fs.writeFile(f,b);
 return {url:u,local_file:name,bytes:b.length,sha256:sha(b),content_type:response.headers.get('content-type')};
}
const article=await download(url,'mnl-1861-map-article.html',4000000);
const html=await fs.readFile(path.join(dir,article.local_file),'utf8');
const links=[...html.matchAll(/<a[^>]+href="([^"]+\.jpg)"[^>]+rel="gallery"/g)].map(x=>x[1]);
const scans=[...new Set(links.filter(x=>x.includes('hu_mnl_ol_s_0075_no_0082')))];
if(scans.length!==14)throw Error('Expected 14 archived 1861 illustrations, found '+scans.length);
let records=[];
for(let i=0;i<scans.length;i+=3){
 const group=scans.slice(i,i+3);
 const batch=await Promise.all(group.map(async (u,j)=>{
  const file=path.basename(new URL(u).pathname);
  const record=await download(u,file,85000000);
  if(!(await fs.readFile(path.join(dir,file))).subarray(0,2).equals(Buffer.from([0xff,0xd8])))throw Error('Not JPEG '+file);
  const meta=await sharp(path.join(dir,file)).metadata();
  return {...record,width:meta.width,height:meta.height,format:meta.format};
 }));
 records.push(...batch);console.log('BATCH',i+batch.length,'/',scans.length,records.map(x=>x.bytes).reduce((a,b)=>a+b,0));
}
const sources=[
['https://net.jogtar.hu/ezer-ev-torveny?docid=87600033.TV','1876-XXXIII-law.html',3000000],
['https://net.jogtar.hu/ezer-ev-torveny?docid=87700001.TV','1877-I-law.html',3000000],
['https://epa.oszk.hu/04300/04359/00039/pdf/EPA04359_catastrum_2024_01.pdf','janko-catastrum-2024.pdf',12000000]
];
let documents=[];for(const [u,n,max] of sources){const x=await download(u,n,max);documents.push(x);console.log('DOC',n,x.bytes,x.sha256)}
const output={phase:'HIST-0.4g',research_date:'2026-11-11',publication_source:url,institutional_inventory:'MNL OL, Térképtár, Nyomtatott térképek (S 75), No. 82',historic_map:'Administrativ Karte des Grossfürstenthums Siebenbürgen, 1861 based on 1859 classification',observed_gallery_count:records.length,scans:records,article:article,documents,rights:'LOCAL_SCHOLARLY_INSPECTION_ONLY_NO_REPUBLICATION_LICENSE_CLAIM',archival_original_direct_authenticated:false,all_24_sheets_acquired:false};
await fs.writeFile(path.join(dir,'acquisition-manifest-local.json'),JSON.stringify(output,null,2)+'\n');console.log('COMPLETE',JSON.stringify({scans:records.length,total_bytes:records.reduce((x,y)=>x+y.bytes,0),sizes:records.map(x=>({file:x.local_file,px:[x.width,x.height],mb:Math.round(x.bytes/1024/1024*100)/100})),documents:documents.map(d=>({file:d.local_file,sha:d.sha256}))}));
