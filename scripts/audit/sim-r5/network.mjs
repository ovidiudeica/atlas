import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
export const root=new URL('../../../',import.meta.url);
export const cache=new URL('work/sim-r5-cache/',root);
await mkdir(cache,{recursive:true});
export const sha=b=>createHash('sha256').update(b).digest('hex');
export const clean=s=>String(s||'').replace(/&(icirc|Icirc|acirc|Acirc|scedil|Scedil|tcedil|Tcedil);/g,(_,e)=>({icirc:'î',Icirc:'Î',acirc:'â',Acirc:'Â',scedil:'ș',Scedil:'Ș',tcedil:'ț',Tcedil:'Ț'})[e]).replace(/&#(\d+);?/g,(_,n)=>String.fromCodePoint(Number(n))).replace(/&nbsp;/g,' ').replace(/&quot;/g,'"').replace(/<[^>]*>/g,' ').replace(/&amp;/g,'&').replace(/\s+/g,' ').trim();
export const norm=s=>clean(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
export const api=(host,args)=>'https://'+host+'/w/api.php?'+new URLSearchParams({format:'json',...args});
const cooldowns=new Map();
export async function request(url,{binary=false,timeout=18000,retry=false}={}){
 const key=sha(url);const file=new URL(key+'.json',cache);
 if(!retry)try{return {...JSON.parse(await readFile(file,'utf8')),cacheHit:true};}catch{}
 const result={url,checkedAt:new Date().toISOString()};
 try{
  const host=new URL(url).hostname;
  if((cooldowns.get(host)||0)>Date.now())return {...result,error:'HOST_COOLDOWN_AFTER_429'};
  const response=await fetch(url,{headers:{'User-Agent':'TerritorialAtlas-SIM-R5/1.0 (https://github.com/ovidiudeica/atlas)'},signal:AbortSignal.timeout(timeout)});
  result.status=response.status;result.finalUrl=response.url;result.contentType=response.headers.get('content-type');
  result.retryAfter=response.headers.get('retry-after');
  if(response.status===429)cooldowns.set(host,Date.now()+Math.max(60000,Number(result.retryAfter||60)*1000));
  if(!response.ok)throw Error('HTTP '+response.status);
  const buffer=Buffer.from(await response.arrayBuffer());result.bytes=buffer.length;result.sha256=sha(buffer);
  if(binary){await writeFile(new URL(key+'.bin',cache),buffer);result.cacheFile=key+'.bin';}
  else result.text=buffer.toString('utf8');
 }catch(e){result.error=String(e);}
 await writeFile(file,JSON.stringify(result));return result;
}
export async function json(url,options){
 const result=await request(url,options);if(result.error)return result;
 try{result.json=JSON.parse(result.text);if(result.json.error)result.error='API error: '+JSON.stringify(result.json.error);delete result.text;}catch(e){result.error='Invalid JSON: '+e;}
 return result;
}
export async function parallel(list,n,fn){
 let cursor=0;const results=new Array(list.length);
 await Promise.all(Array.from({length:n},async()=>{while(cursor<list.length){const index=cursor++;results[index]=await fn(list[index],index);}}));
 return results;
}
export const brief=r=>({url:r.url,finalUrl:r.finalUrl,status:r.status,checkedAt:r.checkedAt,sha256:r.sha256,bytes:r.bytes,contentType:r.contentType,error:r.error});
