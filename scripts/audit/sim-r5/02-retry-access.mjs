import {readFile,writeFile} from 'node:fs/promises';
import {gunzipSync,gzipSync} from 'node:zlib';
import {root,request,json,parallel,brief,clean} from './network.mjs';
const previous=JSON.parse(await readFile(new URL('docs/audits/SIM-R4-COVERAGE.json',root),'utf8')).institutionalErrors;
const probe=await json('https://archive.org/wayback/available?url='+encodeURIComponent('https://briceni.md/stema-raionului-briceni/'));
const archiveAvailable=Boolean(probe.json?.archived_snapshots)&&!probe.error;
const cases=await parallel(previous,12,async(old,index)=>{
 const urls=[old.url];try{const url=new URL(old.url);url.protocol='https:';urls.push(url.href);if(url.hostname.startsWith('www.')){url.hostname=url.hostname.slice(4);urls.push(url.href);}else{url.hostname='www.'+url.hostname;urls.push(url.href);}}catch{}
 const row={atlasId:old.atlasId,originalUrl:old.url,previousError:old.error,attempts:[],state:'INACCESSIBLE',symbolPages:[],archive:null};
 for(const url of [...new Set(urls)]){
  const response=await request(url,{timeout:12000});
  row.attempts.push(brief(response));
  if(!response.error){
   row.state='ACCESS_RECOVERED';row.finalUrl=response.finalUrl;
   const links=[...(response.text||'').matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)]
    .filter(m=>/simbol|stem[aă]|drapel|herald|символ|герб|symbol/i.test(m[1]+' '+clean(m[2])));
   for(const m of links.slice(0,2)){
    let target;try{target=new URL(m[1].replaceAll('&amp;','&'),response.finalUrl).href;}catch{continue;}
    if(!/^https?:/.test(target))continue;
    const doc=await request(target,{binary:/\.pdf(?:\?|$)/i.test(target),timeout:12000});
    row.symbolPages.push(brief(doc));
   }
   break;
  }
 }
 if(row.state==='INACCESSIBLE')row.archive=archiveAvailable?{state:'QUEUED'}:{state:'ARCHIVE_SERVICE_UNAVAILABLE',serviceProbe:brief(probe)};
 if(index%50===0)console.log('Institutional cases',index,'/',previous.length);
 return row;
});

const registry=JSON.parse(gunzipSync(await readFile(new URL('public/data/symbols/registry.json.gz',root)))).entities;
const qids=[...new Set(cases.map(c=>registry[c.atlasId]?.wikidata).filter(Boolean))];
const authorities={};const lookup=[];
for(let i=0;i<qids.length;i+=40){
 const result=await json('https://www.wikidata.org/w/api.php?'+new URLSearchParams({action:'wbgetentities',format:'json',ids:qids.slice(i,i+40).join('|'),props:'claims'}));
 lookup.push(brief(result));
 for(const [qid,item] of Object.entries(result.json?.entities||{}))authorities[qid]=(item.claims?.P856||[]).filter(s=>s.rank!=='deprecated'&&!s.qualifiers?.P582).map(s=>s.mainsnak?.datavalue?.value).filter(u=>typeof u==='string'&&/^https?:/.test(u));
}
await parallel(cases.filter(c=>c.state==='INACCESSIBLE'),8,async(row,index)=>{
 const urls=authorities[registry[row.atlasId]?.wikidata]||[];
 row.updatedAuthorities={method:'current exact-Wikidata P856',urls,attempts:[]};
 for(const url of [...new Set(urls)].slice(0,2)){
  if(row.attempts.some(a=>a.url===url))continue;
  const response=await request(url,{timeout:12000});
  row.updatedAuthorities.attempts.push(brief(response));
  if(!response.error){row.state='ACCESS_RECOVERED';row.finalUrl=response.finalUrl;row.archive={state:'NOT_NEEDED_AFTER_UPDATED_AUTHORITY'};break;}
 }
 if(index%100===0)console.log('Updated authority checks',index);
});

const unresolved=cases.filter(c=>c.archive?.state==='QUEUED');
await parallel(unresolved,3,async(row,index)=>{
 await new Promise(r=>setTimeout(r,250));
 const result=await json('https://archive.org/wayback/available?url='+encodeURIComponent(row.originalUrl));
 row.archive={...brief(result),snapshot:result.json?.archived_snapshots?.closest||null,state:result.error?'ERROR':result.json?.archived_snapshots?.closest?'SNAPSHOT_IDENTIFIED':'NO_SNAPSHOT_RETURNED'};
 if(index%50===0)console.log('Archives',index,'/',unresolved.length);
});
const report={schema:'atlas-sim-r5-access-reinvestigation-v1',checkedAt:new Date().toISOString(),previousCases:previous.length,
 recovered:cases.filter(c=>c.state==='ACCESS_RECOVERED').length,stillInaccessible:cases.filter(c=>c.state==='INACCESSIBLE').length,archiveServiceProbe:brief(probe),updatedAuthorityLookups:lookup,cases};
await writeFile(new URL('docs/audits/sim-r5/access-reinvestigation.json.gz',root),gzipSync(JSON.stringify(report)));
console.log(JSON.stringify({...report,cases:cases.length},null,2));
