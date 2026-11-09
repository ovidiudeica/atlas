import {readFile,writeFile} from 'node:fs/promises';import {gunzipSync,gzipSync} from 'node:zlib';
import {root,request,parallel,brief,clean,norm} from './network.mjs';
const catalogue=JSON.parse(gunzipSync(await readFile(new URL('public/data/phase4/catalog.json.gz',root)))).entities;
const index=await request('https://armerii.ro/hter06.html');
const start=[...(index.text||'').matchAll(/href=["'](\/judetes06\/judet([A-Z]{1,2})1\.html)["']/g)].map(m=>({url:'https://armerii.ro'+m[1],code:m[2]}));
const pages=[];
await parallel(start,4,async(first)=>{
 const queued=[first.url],seen=new Set();
 while(queued.length&&seen.size<10){
  const url=queued.shift();if(seen.has(url))continue;seen.add(url);
  const result=await request(url);const images=[...(result.text||'').matchAll(/<img\b[^>]*>/gi)].map(m=>{
   const attr=name=>m[0].match(new RegExp('\\b'+name+'=["\x27]([^"\x27]+)["\x27]','i'))?.[1]||'';
   return {src:new URL(attr('src')||'/',url).href,alt:clean(attr('alt'))};
  }).filter(i=>i.alt&&!/el0\d|logo|alfa\/|a2\.gif/.test(i.src));
  pages.push({code:first.code,...brief(result),images,textAvailable:!result.error});
  for(const m of (result.text||'').matchAll(/href=["']([^"']*judet[A-Z]{1,2}\d+\.html)["']/g)){
   const next=new URL(m[1],url).href;if(next.includes('/judetes06/judet'+first.code)&&!seen.has(next))queued.push(next);
  }
 }
 console.log('Armorial county',first.code,seen.size);
});
const president=await request('https://presedinte.md/rom/decrete-9388');
const decrees=[...(president.text||'').matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)]
 .map(m=>({url:new URL(m[1].replaceAll('&amp;','&'),'https://presedinte.md').href,title:clean(m[2])}))
 .filter(l=>/\.pdf(?:\?|$)/i.test(l.url)&&/înregistrarea/.test(l.title)&&/stemei|simboluri teritoriale|drapelului/.test(l.title));
const unique=[...new Map(decrees.map(d=>[d.url,d])).values()];
const documents=await parallel(unique,5,async(d,i)=>{const response=await request(d.url,{binary:true,timeout:25000});if(i%20===0)console.log('Presidential annexes',i,'/',unique.length);return {...d,...brief(response),cacheFile:response.cacheFile};});
const priorityUrls=[
 'https://briceni.md/stema-raionului-briceni/','https://www.legis.md/cautare/getResults?doc_id=155778&lang=ro',
 'https://doc.pmb.ro/legis/acteinterne/2024/45550/h047_24.pdf','https://legislatie.just.ro/Public/DetaliiDocument/311970',
 'https://legislatie.just.ro/Public/DetaliiDocument/309686','https://legislatie.just.ro/public/DetaliiDocument/261236',
 'https://raiontaraclia.md/ro/simbolica-raionului/','https://cnh.prm.md/ziua-drapelului-si-stemei-raionului-taraclia/',
 'https://www.gagauzia.md/ru/ato-gagauziya/simvolika.html','https://presedinte.md/rom/emblem','https://presedinte.md/rom/flag',
 'https://www.president.gospmr.org/gos-gerb-pmr/','https://www.president.gospmr.org/gos-flag-pmr/',
 'https://cnh.prm.md/','https://ciocana.md/simbolurile-sectorului',
 'https://dgect.chisinau.md/simbolica-locala/procedura-de-obtinere-a-dreptului-de-utilizare-a-toponimicului-chisinau/'
];
const priorities=await parallel(priorityUrls,4,async(url)=>{const r=await request(url,{binary:/\.pdf$/.test(url)});return {...brief(r),cacheFile:r.cacheFile,
 text:r.text?clean(r.text).slice(0,90000):undefined,
 images:r.text?[...r.text.matchAll(/<img\b[^>]*src=["']([^"']+)["'][^>]*>/gi)].map(m=>new URL(m[1].replaceAll('&amp;','&'),r.finalUrl).href):[]};});
await writeFile(new URL('docs/audits/sim-r5/documentary-sources.json.gz',root),gzipSync(JSON.stringify({checkedAt:new Date().toISOString(),armorialIndex:brief(index),armorialPages:pages,presidentialIndex:brief(president),decrees:documents,priorities})));
console.log('Documentary checkpoint',pages.length,documents.length);
