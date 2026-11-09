import {readFile,writeFile} from 'node:fs/promises';
import {gunzipSync,gzipSync} from 'node:zlib';
import {root,request,json,api,parallel,brief,clean,norm} from './network.mjs';
const registry=JSON.parse(gunzipSync(await readFile(new URL('public/data/symbols/registry.json.gz',root)))).entities;
const nodes=JSON.parse(gunzipSync(await readFile(new URL('public/data/phase4/catalog.json.gz',root)))).entities;
const images=Object.values(registry).flatMap(r=>['coat','flag'].filter(k=>r[k]).map(kind=>({id:r.atlasId,kind,asset:r[kind]})));
const qids=[...new Set(Object.values(registry).filter(r=>r.coat||r.flag||!r.roles.includes('administrative')).map(r=>r.wikidata).filter(Boolean))];
const wd={};const requests=[];
for(let i=0;i<qids.length;i+=40){
 const response=await json(api('www.wikidata.org',{action:'wbgetentities',ids:qids.slice(i,i+40).join('|'),props:'claims|sitelinks|labels|descriptions',languages:'ro|en|ru|uk|hu|bg|gag'}));
 requests.push(brief(response));if(response.json?.entities)Object.assign(wd,response.json.entities);
 console.log('Wikidata',Math.min(i+40,qids.length),'/',qids.length);
}
const files=[...new Set(Object.values(registry).flatMap(r=>[...r.candidates.map(c=>c.file),...['coat','flag'].map(k=>r[k]?.kind==='commons'?r[k]?.file:null)]).filter(Boolean))];
const commons={};
for(let i=0;i<files.length;i+=40){
 const response=await json(api('commons.wikimedia.org',{action:'query',titles:files.slice(i,i+40).map(f=>'File:'+f).join('|'),
  prop:'imageinfo|revisions',iiprop:'url|mime|size|sha1|extmetadata|timestamp|user|comment',iilimit:'5',rvprop:'ids|timestamp',redirects:'1'}));
 requests.push(brief(response));
 const redirects=new Map([...(response.json?.query?.normalized||[]),...(response.json?.query?.redirects||[])].map(r=>[r.from,r.to]));
 const resolve=t=>{const seen=new Set();while(redirects.has(t)&&!seen.has(t)){seen.add(t);t=redirects.get(t);}return t;};
 for(const file of files.slice(i,i+40)){
  const page=Object.values(response.json?.query?.pages||{}).find(p=>p.title===resolve('File:'+file));
  commons[file]={request:brief(response),title:page?.title,pageId:page?.pageid,revision:page?.revisions?.[0],versions:page?.imageinfo||[]};
 }
 console.log('Commons',Math.min(i+40,files.length),'/',files.length);
}
const wikipedia={};const languages=new Map();
for(const [id,row] of Object.entries(registry)){
 if(!row.coat&&!row.flag&&row.roles.includes('administrative'))continue;
 const links=wd[row.wikidata]?.sitelinks||{};
 for(const [site,link] of Object.entries(links)){
  if(!site.endsWith('wiki')||['commonswiki','specieswiki','wikidatawiki'].includes(site))continue;
  const lang=site.slice(0,-4).replaceAll('_','-');if(!languages.has(lang))languages.set(lang,new Map());
  const titles=languages.get(lang);const users=titles.get(link.title)||[];users.push(id);titles.set(link.title,users);
 }
}
for(const [lang,titles] of languages){
 const list=[...titles.keys()];
 for(let i=0;i<list.length;i+=40){
  const response=await json(api(lang+'.wikipedia.org',{action:'query',titles:list.slice(i,i+40).join('|'),prop:'revisions|pageprops',rvprop:'content|ids|timestamp',rvslots:'main',redirects:'1'}));
  const redirects=new Map([...(response.json?.query?.normalized||[]),...(response.json?.query?.redirects||[])].map(r=>[r.from,r.to]));
  const resolve=t=>{const seen=new Set();while(redirects.has(t)&&!seen.has(t)){seen.add(t);t=redirects.get(t);}return t;};
  for(const title of list.slice(i,i+40)){
   const page=Object.values(response.json?.query?.pages||{}).find(p=>p.title===resolve(title));
   const revision=page?.revisions?.[0];const intro=(revision?.slots?.main?.['*']||'').split(/\n==/)[0];
   const matches=[];
   for(const id of titles.get(title)){
    for(const kind of ['coat','flag']){
     const file=registry[id][kind]?.file;
     if(file&&norm(intro.replaceAll('_',' ')).includes(norm(file.replaceAll('_',' '))))
      matches.push({atlasId:id,kind,file,context:intro.split('\n').filter(line=>norm(line.replaceAll('_',' ')).includes(norm(file.replaceAll('_',' ')))).slice(0,3).join('\n')});
    }
    const entry={language:lang,title:page?.title||title,url:'https://'+lang+'.wikipedia.org/wiki/'+encodeURIComponent((page?.title||title).replaceAll(' ','_')),
     revision:revision?.revid,timestamp:revision?.timestamp,wikidata:page?.pageprops?.wikibase_item,
     matchedSymbols:matches.filter(m=>m.atlasId===id),request:brief(response)};
    (wikipedia[id]||=[]).push(entry);
   }
  }
  console.log('Wikipedia',lang,Math.min(i+40,list.length),'/',list.length);
 }
}
await writeFile(new URL('docs/audits/sim-r5/source-metadata.json.gz',root),gzipSync(JSON.stringify({checkedAt:new Date().toISOString(),wd,commons,wikipedia,requests})));
console.log('Metadata checkpoint saved');
const hashes={};
await parallel(images,1,async(image,index)=>{
 const asset=image.asset;let response;
 if(asset.kind==='local'){
  const bytes=await readFile(new URL('public/'+asset.url,root));
  const {sha}=await import('./network.mjs');response={url:asset.url,bytes:bytes.length,sha256:sha(bytes),local:true,status:200,checkedAt:new Date().toISOString()};
 }else {const raw=await request(asset.url,{binary:true,timeout:30000});response=brief(raw);if(!raw.cacheHit)await new Promise(done=>setTimeout(done,1200));}
 hashes[image.id+':'+image.kind]=response;
 if(index%50===0)console.log('Image hashes',index,'/',images.length);
});
await writeFile(new URL('docs/audits/sim-r5/image-checksums.json',root),JSON.stringify({checkedAt:new Date().toISOString(),images:hashes},null,2)+'\n');
console.log('All image downloads attempted',Object.keys(hashes).length);
const official={};const urlIds=new Map();
const officialHost=h=>/(^|\.)(legislatie\.just\.ro|legis\.md|cnh\.prm\.md|presedinte\.md|president\.md|monitorul\.gov\.md|mo\.gov\.md|pmb\.ro|gagauzia\.md|gospmr\.org)$/.test(h);
for(const image of images){
 const row=registry[image.id];const candidates=row.candidates.filter(c=>c.symbolType===image.kind&&(c.file===image.asset.file||c.url===image.asset.url));
 const credits=[...candidates.map(c=>c.attribution?.Credit?.value||''),...candidates.map(c=>commons[c.file]?.versions?.[0]?.extmetadata?.Credit?.value||''),row.source[image.kind]];
 for(const credit of credits){
  for(let url of String(credit||'').match(/https?:[^"<>\s]+/g)||[]){
   url=url.replaceAll('&amp;','&');try{if(!officialHost(new URL(url).hostname))continue;}catch{continue;}
   const ids=urlIds.get(url)||[];ids.push(image.id+':'+image.kind);urlIds.set(url,ids);
  }
 }
 const statements=wd[row.wikidata]?.claims?.[image.kind==='coat'?'P94':'P41']||[];
 for(const statement of statements)for(const reference of statement.references||[])for(const snak of reference.snaks?.P854||[]){
  const url=snak.datavalue?.value;if(typeof url==='string'){try{if(officialHost(new URL(url).hostname)){const ids=urlIds.get(url)||[];ids.push(image.id+':'+image.kind);urlIds.set(url,ids);}}catch{}}
 }
}
await parallel([...urlIds],6,async([url,ids],index)=>{
 const response=await request(url,{binary:/\.pdf(?:\?|$)|downloadpdf/.test(url),timeout:18000});
 official[url]={...brief(response),linkedSymbolIds:[...new Set(ids)],text:response.text?clean(response.text).slice(0,120000):undefined};
 if(index%20===0)console.log('Primary linked sources',index,'/',urlIds.size);
});
await writeFile(new URL('docs/audits/sim-r5/primary-linked-sources.json.gz',root),gzipSync(JSON.stringify({checkedAt:new Date().toISOString(),sources:official})));
console.log('Primary linked sources checked',urlIds.size);
