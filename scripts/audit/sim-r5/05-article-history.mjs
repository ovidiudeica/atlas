import {readFile,writeFile} from 'node:fs/promises';
import {gunzipSync,gzipSync} from 'node:zlib';
import {root,json,api,brief,clean} from './network.mjs';
const meta=JSON.parse(gunzipSync(await readFile(new URL('docs/audits/sim-r5/source-metadata.json.gz',root))));
const registry=JSON.parse(gunzipSync(await readFile(new URL('public/data/symbols/registry.json.gz',root)))).entities;
const queue=Object.values(registry).filter(r=>r.coat||r.flag).map(r=>{
 const linked=(meta.wikipedia[r.atlasId]||[]).filter(w=>w.wikidata===r.wikidata&&w.matchedSymbols.length);
 linked.sort((a,b)=>{const rank=l=>['ro','en','ru','uk','hu','bg'].indexOf(l)<0?9:['ro','en','ru','uk','hu','bg'].indexOf(l);return rank(a.language)-rank(b.language);});
 return {atlasId:r.atlasId,article:linked[0]||null};
});
let previous=[];try{previous=JSON.parse(gunzipSync(await readFile(new URL('docs/audits/sim-r5/article-history.json.gz',root)))).records;}catch{}
const known=new Map(previous.map(r=>[r.atlasId,r]));const records=[];
const retry=process.argv.includes('--retry');const limit=Number(process.argv.find(a=>a.startsWith('--limit='))?.split('=')[1]||100);let attempts=0,stopped=false;
for(const[qindex,q]of queue.entries()){
 if(!q.article){records.push({atlasId:q.atlasId,state:'NO_EXACT_LINKED_MATCHING_ARTICLE'});continue;}
 const old=known.get(q.atlasId);if(old?.state==='RETRIEVED'){records.push(old);continue;}
 if(stopped||attempts>=limit){records.push({...old,atlasId:q.atlasId,state:'DEFERRED_RATE_LIMIT',limitation:'History retry checkpoint; current article/source checks are separate. Not an examined historical diff.'});continue;}
 attempts++;await new Promise(done=>setTimeout(done,1200));
 const url=api(q.article.language+'.wikipedia.org',{action:'query',titles:q.article.title,prop:'revisions',rvprop:'ids|timestamp|comment|user',rvlimit:'5',maxlag:'5'});
 const cached=await json(url);const r=cached.error&&retry?await json(url,{retry:true}):cached;
 if(r.status===429||r.error==='HOST_COOLDOWN_AFTER_429')stopped=true;
 const page=Object.values(r.json?.query?.pages||{})[0];
 if(attempts%10===0)console.log('Article history retries',attempts,'/',limit);
 records.push({atlasId:q.atlasId,language:q.article.language,title:q.article.title,url:q.article.url,state:page?.revisions?'RETRIEVED':stopped?'RATE_LIMITED':'UNAVAILABLE',request:brief(r),revisions:(page?.revisions||[]).map(v=>({...v,comment:clean(v.comment)}))});
 if(attempts%25===0){
  const snapshot=[...records,...queue.slice(qindex+1).map(next=>({...known.get(next.atlasId),atlasId:next.atlasId,state:known.get(next.atlasId)?.state==='RETRIEVED'?'RETRIEVED':'DEFERRED_RETRY_CHECKPOINT'}))];
  await writeFile(new URL('docs/audits/sim-r5/article-history.json.gz',root),gzipSync(JSON.stringify({method:'Resumable history metadata checkpoint; deferred records are not examined diffs.',records:snapshot})));
 }
}
await writeFile(new URL('docs/audits/sim-r5/article-history.json.gz',root),gzipSync(JSON.stringify({method:'Up to five latest revisions of one exact-Wikidata linked, selected-file-matching article per assigned holder. Current article content checked in source-metadata. Not a complete historical diff audit.',records})));
console.log('Histories complete',records.length,records.filter(r=>r.state==='RETRIEVED').length);
