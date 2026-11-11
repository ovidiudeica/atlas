import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
const root=process.env.HIST_ROOT||path.join(process.env.USERPROFILE||process.env.HOME,'Documents','Atlas-OHM-Inventory-2026-11-10');
const dir=path.join(root,'hist-0-4g-research-local');await fs.mkdir(dir,{recursive:true});
const u='https://net.jogtar.hu/ezer-ev-torveny?docid=87700001.TV';
const buf=Buffer.from(await (await fetch(u,{signal:AbortSignal.timeout(65000)})).arrayBuffer());
const html=buf.toString('utf8');
const sha=x=>crypto.createHash('sha256').update(x).digest('hex');
if(!html.includes('Szolnok-Doboka')||!html.includes('Szatmár'))throw Error('Source text not found');
function para(id){let m=html.match(new RegExp('<p[^>]*id="'+id+'"[^>]*>([\\s\\S]*?)<\\/p>','i'));if(!m)throw Error('No '+id);return m[1].replace(/<[^>]*>/g,' ').replace(/&nbsp;/g,' ').replace(/\s+/g,' ').trim()}
function list(id){
 const p=para(id);
 const i=p.indexOf('községei:');
 if(i<0 && id!=='pr17id')throw Error('No legal community clause '+id+' '+p.slice(0,80));
 const body=(i>=0?p.slice(i+'községei:'.length):p).replace(/[;.]+$/,'').replace(/\s+és\s+/g,', ');
 const a=body.split(',').map(x=>x.trim()).filter(Boolean);
 const out=[];
 for(const item of a){if(/^\([^)]+\)$/.test(item) && out.length){out.at(-1).alias=item.slice(1,-1)}else{out.push({name_1877:item,alias:null})}}
 return {clause_paragraph_id:id,original_clause_prefix:i>=0?p.slice(0,i+'községei:'.length):para('pr16id'),communities:out,raw_body:body};
}
const dests=[
 {county:'Szolnok-Doboka',section:'1877:I §2, point 2(c)',...list('pr13id')},
 {county:'Szatmár',section:'1877:I §2, point 3',...list('pr17id')}
];
const all=dests.flatMap(x=>x.communities.map((c,i)=>({...c,order_in_clause:i+1,destination_county:x.county,legal_section:x.section,source_url:u,coordinate:null,match_to_modern_locality:null,land_parcel_border_verified:false})));
const names=all.map(x=>x.name_1877.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase());
if(new Set(names).size!==names.length)console.log('WARNING_DUPLICATE_RAW_NAMES',names.length-new Set(names).size);
const obj={phase:'HIST-0.4g',date:'2026-11-11',source_type:'DIGITAL_LEGAL_TRANSCRIPTION_NOT_AUTHENTICATED_ORIGINAL_PRINT',source_url:u,source_html_sha256:sha(buf),source_date:'1877',law:'1877:I',legal_authority:'Law §2 final county allocation of former Kővár district communes',record_count:all.length,county_counts:Object.fromEntries(dests.map(x=>[x.county,x.communities.length])),localities:all,limitations:['Spelling kept exactly from the digital legal transcription','Law provides named administrative allocations, NOT village polygon geometries','No position or independent toponym mapping is inferred','Source is a digitized law transcription, not the official 1877 paper original','Do not infer effective dissolution date of district solely from 1877 ratification or 1876 law'],administrative_border_certification:false};
const output=path.join(dir,'1877-I-chioar-localities-derived.json');
await fs.writeFile(output,JSON.stringify(obj,null,2)+'\n');
console.log(JSON.stringify({output,counts:obj.county_counts,total:obj.record_count,aliases:all.filter(x=>x.alias),first:all.slice(0,3),last:all.slice(-3),sha256:sha(Buffer.from(JSON.stringify(obj,null,2)+'\n'))},null,2));
