/**
 * SIM-R4: reproducible exact-identity discovery. Never match symbols by names.
 * Network responses are cached; errors remain distinct from empty results.
 */
import {applySymbolConflicts,candidateConflict} from './sim-r4-policy.mjs';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {gunzipSync,gzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import {editorialSymbolsForEntity,symbolAssetUrl,symbolSourceUrl} from '../../src/data/territorialSymbols.mjs';
import {officialSymbolsForEntity} from '../../src/data/officialSymbols.mjs';
const root=new URL('../../',import.meta.url);
const catalogBytes=await readFile(new URL('public/data/phase4/catalog.json.gz',root));
const entities=JSON.parse(gunzipSync(catalogBytes)).entities;
if(entities.length!==4283||new Set(entities.map(e=>e.id)).size!==4283)throw Error('Invalid certified inventory');
const cache=new URL('work/sim-r4-cache/',root);
await mkdir(cache,{recursive:true});
const headers={'User-Agent':'TerritorialAtlas-SIM-R4/1.0 (https://github.com/ovidiudeica/atlas)'};
const delay=ms=>new Promise(r=>setTimeout(r,ms));
async function json(url){
 const key=createHash('sha256').update(url).digest('hex');
 const file=new URL(key+'.json',cache);
 try{return JSON.parse(await readFile(file,'utf8'));}catch{}
 let error;
 for(let attempt=0;attempt<3;attempt++){
  try{
   const res=await fetch(url,{headers,signal:AbortSignal.timeout(45000)});
   if(!res.ok)throw Error('HTTP '+res.status);
   const value=await res.json();if(value.error)throw Error(JSON.stringify(value.error));
   await writeFile(file,JSON.stringify(value));return value;
  }catch(e){error=e;await delay(1000*(attempt+1));}
 }
 throw error;
}
const api=(host,params)=>'https://'+host+'/w/api.php?'+new URLSearchParams({format:'json',...params});
const identities=JSON.parse(await readFile(new URL('docs/audits/SIM-R4-IDENTITIES.json',root),'utf8')).identities;
const qidOf=e=>e.sourceTags?.wikidata||identities[e.id]?.qid||null;
const qids=[...new Set(entities.map(qidOf).filter(q=>/^Q\d+$/.test(q)))];
const wd={};const errors=[];
for(let i=0;i<qids.length;i+=40){
 try{Object.assign(wd,(await json(api('www.wikidata.org',{action:'wbgetentities',ids:qids.slice(i,i+40).join('|'),props:'claims|sitelinks'}))).entities);}
 catch(e){errors.push({stage:'wikidata',ids:qids.slice(i,i+40),error:String(e)});}
 console.log('Wikidata',Math.min(i+40,qids.length),'/',qids.length);
}
const excluded=new Set(['osm-r377733:coat','osm-r377733:flag','osm-r2248660:coat','osm-r59002:coat','osm-r59002:flag']);
const rows={};
const qidOwners=new Map();
for(const e of entities){const q=qidOf(e);if(q){const a=qidOwners.get(q)||[];a.push(e.id);qidOwners.set(q,a);}}
const current=s=>s.rank!=='deprecated'&&!s.qualifiers?.P582;
for(const e of entities){
 const qid=qidOf(e);const item=wd[qid];
 const official=officialSymbolsForEntity(e),legacy=editorialSymbolsForEntity(e);
 const row=rows[e.id]={atlasId:e.id,osmRelationId:e.osmRelationId,country:e.country,
  officialName:e.officialName,shortName:e.shortName,name:e.name,entityType:e.entityType||null,
  roles:e.roles,adminLevel:e.adminLevel,registry:e.registry?{system:e.registry.system,code:e.registry.code}:null,
  statisticalRoles:e.statisticalRoles,parentId:e.administrativeParentId,treeParentId:e.treeParentId,
  wikidata:qid,coat:null,flag:null,source:{coat:null,flag:null},sourceLanguage:{coat:null,flag:null},
  sourceType:{coat:null,flag:null},status:{coat:'MISSING',flag:'MISSING'},reviewNotes:[],
  candidates:[],discovery:{state:item?'PROCESSED':'UNPROCESSED',method:identities[e.id]?.method||(qid?'catalog-wikidata':'no-exact-external-identity'),errors:[]}};
 if(qid&&!item)row.discovery.errors.push('Wikidata unavailable');
 const links=Object.entries(item?.sitelinks||{}).filter(([k])=>/wiki$/.test(k)&&!k.includes('commons')).map(([site,v])=>({language:site.slice(0,-4),title:v.title,url:'https://'+site.slice(0,-4).replaceAll('_','-')+'.wikipedia.org/wiki/'+encodeURIComponent(v.title.replaceAll(' ','_'))}));
 row.wikipedia=links;
 const osmClaims=(item?.claims?.P402||[]).filter(current).map(s=>s.mainsnak?.datavalue?.value);
 const codeClaims=(item?.claims?.P843||[]).filter(current).map(s=>s.mainsnak?.datavalue?.value);
 row.identityConflict=(osmClaims.length>0&&!osmClaims.includes(String(e.osmRelationId)))||
  (e.registry?.system==='SIRUTA'&&codeClaims.length>0&&!codeClaims.includes(e.registry.code));
 if(row.identityConflict)row.reviewNotes.push('Conflicting exact external identifier; new automatic assignments blocked');
 for(const kind of ['coat','flag']){
  const old=official?.[kind],asset=legacy?.[kind];
  if(old){row[kind]={kind:'local',file:old,url:'symbols/'+old,sourceUrl:official.legalUrl};row.source[kind]=official.legalUrl;row.sourceType[kind]='institutional';row.status[kind]='REVIEWED_SOURCE';}
  else if(asset){row[kind]={...asset,url:symbolAssetUrl(asset),sourceUrl:symbolSourceUrl(asset)};row.source[kind]=symbolSourceUrl(asset);row.sourceType[kind]=asset.kind==='commons'?'commons':'institutional';row.status[kind]='REVIEWED_SOURCE';}
  const claims=item?.claims?.[kind==='coat'?'P94':'P41']||[];
  for(const claim of claims){
   const file=claim.mainsnak?.datavalue?.value;if(typeof file!=='string')continue;
   const notes=[];
   if(row.identityConflict)notes.push('Conflicting exact external identifier');
   if(/\b(old|historical|former|soviet|proposed|logo)\b/i.test(file))notes.push('Potential historical version or institutional logo');
   if(!current(claim))notes.push('Historical/end-dated or deprecated claim');
   if(qidOwners.get(qid)?.length>1)notes.push('Wikidata item shared by multiple Atlas entities; manual identity review required');
   if(!e.roles.includes('administrative'))notes.push('Statistical entity: separate holder review required');
   if(excluded.has(e.id+':'+kind))notes.push('Known SIM-R3.1 exclusion');
   row.candidates.push({atlasId:e.id,symbolType:kind,file,wikidata:qid,statementId:claim.id,
    source:'https://www.wikidata.org/wiki/'+qid,sourceType:'wikidata',
    sourceLanguage:null,wikipedia:links,identityEvidence:identities[e.id]||{type:'certified-catalog-sourceTags.wikidata',value:qid},
    holder:e.officialName,entityType:e.entityType||null,status:'CANDIDATE',reviewNotes:notes,eligible:notes.length===0});
  }
 }
}

const preferredLanguages=['ro','en','ru','uk','hu','bg','gag'];
const batches=new Map();
for(const row of Object.values(rows)){
 const articles=row.wikipedia.filter(a=>preferredLanguages.includes(a.language));
 if(!articles.length&&row.wikipedia.length)articles.push(row.wikipedia[0]);
 const original=entities.find(e=>e.id===row.atlasId)?.sourceTags?.wikipedia;
 if(original){const colon=original.indexOf(':');const language=original.slice(0,colon),title=original.slice(colon+1);
  if(/^[a-z-]+$/.test(language)&&!articles.some(a=>a.language===language&&a.title===title))articles.push({language,title});}
 row.discovery.wikipedia={state:articles.length?'PENDING':'NO_LINKED_ARTICLE',pages:0};
 for(const a of articles){
  if(!batches.has(a.language))batches.set(a.language,new Map());
  const map=batches.get(a.language);if(!map.has(a.title))map.set(a.title,[]);map.get(a.title).push(row);
 }
}
const fieldKinds={
 image_shield:'coat',image_coat:'coat',image_coat_of_arms:'coat',coat_of_arms:'coat',
 stemă:'coat',stema:'coat',герб:'coat',címer:'coat',cimer:'coat',герб_изображение:'coat',
 image_flag:'flag',flag_image:'flag',flag:'flag',drapel:'flag',флаг:'flag',знаме:'flag',zászló:'flag'
};
for(const [language,titlesMap] of batches){
 const titles=[...titlesMap.keys()];
 for(let offset=0;offset<titles.length;offset+=40){
  const slice=titles.slice(offset,offset+40);
  try{
   const result=await json(api(language+'.wikipedia.org',{action:'query',titles:slice.join('|'),
    prop:'revisions',rvprop:'content|ids|timestamp',rvslots:'main',redirects:'1'}));
   const redirects=new Map([...(result.query?.normalized||[]),...(result.query?.redirects||[])].map(r=>[r.from,r.to]));
   const resolved=t=>{const seen=new Set();while(redirects.has(t)&&!seen.has(t)){seen.add(t);t=redirects.get(t);}return t;};
   const pages=Object.values(result.query?.pages||{});
   for(const title of slice){
    const page=pages.find(p=>p.title===resolved(title));
    const revision=page?.revisions?.[0],text=revision?.slots?.main?.['*'];
    for(const row of titlesMap.get(title)){
     row.discovery.wikipedia.pages++;
     if(typeof text!=='string')continue;
     row.discovery.state='PROCESSED';
     for(const line of text.split(/\n==/)[0].split('\n')){
      const match=line.match(/^\s*\|\s*([^=]+?)\s*=\s*(.*?)\s*$/u);
      if(!match)continue;const key=match[1].trim().toLowerCase().replaceAll(' ','_');
      const kind=fieldKinds[key];if(!kind)continue;
      let file=match[2].replace(/<!--.*?-->/g,'').trim();
      file=file.replace(/^\[\[(?:File|Image|Fișier|Fichier|Файл):/i,'').replace(/\]\]$/,'').split('|')[0].trim();
      if(!/^[^{}<>\[\]\n]+\.(svg|png|webp|jpe?g|gif)$/i.test(file))continue;
      if(row.candidates.some(c=>c.symbolType===kind&&c.file.replaceAll('_',' ')===file.replaceAll('_',' '))){
       const c=row.candidates.find(c=>c.symbolType===kind&&c.file.replaceAll('_',' ')===file.replaceAll('_',' '));
       (c.discoveredIn||=[]).push({language,title:page.title,revision:revision.revid});
       c.sourceLanguage ||= language;c.article ||= page.title;continue;
      }
      const notes=[];
      if(row.identityConflict)notes.push('Conflicting exact external identifier');
      if(qidOwners.get(row.wikidata)?.length>1)notes.push('Shared Wikidata identity requires review');
      if(!row.roles.includes('administrative'))notes.push('Statistical holder review required');
      if(excluded.has(row.atlasId+':'+kind))notes.push('Known SIM-R3.1 exclusion');
      if(/\b(old|historical|former|soviet|proposed|logo)\b/i.test(file))notes.push('Potential historical version or institutional logo');
      row.candidates.push({atlasId:row.atlasId,symbolType:kind,file,wikidata:row.wikidata,
       source:'https://'+language+'.wikipedia.org/w/index.php?oldid='+revision.revid,
       sourceType:'wikipedia-infobox',sourceLanguage:language,
       article:page.title,revision:revision.revid,holder:row.officialName,entityType:row.entityType,
       identityEvidence:identities[row.atlasId]||{type:'certified-catalog-linked-article-or-wikidata',value:row.wikidata||row.atlasId},
       status:'CANDIDATE',reviewNotes:notes,eligible:notes.length===0});
     }
    }
   }
  }catch(e){errors.push({stage:'wikipedia',language,titles:slice,error:String(e)});
   for(const title of slice)for(const row of titlesMap.get(title))row.discovery.errors.push(language+': '+String(e));}
  console.log('Wikipedia',language,Math.min(offset+40,titles.length),'/',titles.length);
 }
}
for(const row of Object.values(rows)){
 row.discovery.wikipedia.state=row.discovery.errors.length?'PARTIAL_OR_ERROR':row.discovery.wikipedia.pages?'PROCESSED':'NO_LINKED_ARTICLE';
}


const files=[...new Set(Object.values(rows).flatMap(r=>r.candidates.map(c=>c.file).filter(Boolean)))];const media={};
for(let i=0;i<files.length;i+=40){
 try{
  const pages=(await json(api('commons.wikimedia.org',{action:'query',titles:files.slice(i,i+40).map(f=>'File:'+f).join('|'),prop:'imageinfo',iiprop:'url|mime|size|sha1|extmetadata',redirects:'1'}))).query?.pages||{};
  for(const p of Object.values(pages)){if(p.imageinfo?.[0])media[p.title.slice(5).replaceAll('_',' ')]=p.imageinfo[0];}
 }catch(e){errors.push({stage:'commons',files:files.slice(i,i+40),error:String(e)});}
 console.log('Commons',Math.min(i+40,files.length),'/',files.length);
}
for(const row of Object.values(rows)){
 for(const candidate of row.candidates){
  const conflict=candidateConflict(row.atlasId,candidate.file);
  if(conflict){candidate.eligible=false;candidate.reviewNotes.push(conflict);}
  const info=media[candidate.file.replaceAll('_',' ')];
  if(info&&['image/svg+xml','image/png','image/jpeg','image/gif','image/webp','image/avif'].includes(info.mime)){
   Object.assign(candidate,{url:info.url,sourceUrl:info.descriptionurl,mime:info.mime,sha1:info.sha1,
    width:info.width,height:info.height,attribution:info.extmetadata||{}});
  }else{candidate.eligible=false;candidate.reviewNotes.push('Commons image metadata unavailable');}
 }
 for(const kind of ['coat','flag']){
  const usable=row.candidates.filter(c=>c.symbolType===kind&&c.eligible);
  if(!row[kind]&&usable.length){
   const wikipediaCount=c=>(c.discoveredIn?.length||0)+(c.sourceType==='wikipedia-infobox'?1:0);
   usable.sort((a,b)=>wikipediaCount(b)-wikipediaCount(a)||
    Number(/\.svg$/i.test(b.file))-Number(/\.svg$/i.test(a.file))||
    preferredLanguages.indexOf(a.sourceLanguage||'zz')-preferredLanguages.indexOf(b.sourceLanguage||'zz')||
    a.file.localeCompare(b.file));
   const c=usable[0];
   if(usable.length>1)row.reviewNotes.push('Multiple source renderings: selected by Wikipedia corroboration and SVG preference; alternatives retained for SIM-R5');row[kind]={kind:'commons',file:c.file,url:c.url,sourceUrl:c.sourceUrl,tier:'B'};
   row.source[kind]=c.sourceUrl;row.sourceLanguage[kind]=c.sourceLanguage;row.sourceType[kind]=c.sourceType+'-commons';row.status[kind]='CANDIDATE';
  }
 }
}
const institutionalJobs=[];
for(const row of Object.values(rows)){
 const node=entities.find(e=>e.id===row.atlasId);
 const urls=[node.sourceTags?.website,node.sourceTags?.['contact:website'],
  ...(wd[row.wikidata]?.claims?.P856||[]).filter(current).map(s=>s.mainsnak?.datavalue?.value)]
  .filter(u=>typeof u==='string'&&/^https?:\/\//.test(u));
 row.discovery.institutional={state:urls.length?'PENDING':'NO_LINKED_AUTHORITY',urls:[...new Set(urls)]};
 if(urls.length&&['coat','flag'].some(k=>!row[k]&&!row.candidates.some(c=>c.symbolType===k&&c.eligible)))
  institutionalJobs.push(row);
 else if(urls.length)row.discovery.institutional.state='NOT_NEEDED';
}
console.log('Institutional pages',institutionalJobs.length);
async function institution(row){
 if(row.identityConflict||!row.roles.includes('administrative')){
  row.discovery.institutional.state='IDENTITY_REVIEW_REQUIRED';return;
 }
 row.discovery.institutional.pages=[];
 for(const url of row.discovery.institutional.urls.slice(0,2)){
  const cacheFile=new URL('institution-'+createHash('sha256').update(url).digest('hex')+'.json',cache);
  let result;
  try{result=JSON.parse(await readFile(cacheFile,'utf8'));}catch{}
  if(!result){
   result={url,candidates:[]};
   try{
    const response=await fetch(url,{headers,signal:AbortSignal.timeout(12000)});
    if(!response.url.startsWith('https://'))throw Error('HTTPS source unavailable');
    if(!response.ok)throw Error('HTTP '+response.status);
    result.sourceUrl=response.url;
    const html=await response.text();
    if(html.length>5000000)throw Error('Authority page exceeds 5 MB');
    for(const tag of html.match(/<img\b[^>]*>/gi)||[]){
     const attr=name=>tag.match(new RegExp('\\b'+name+'=["\x27]([^"\x27]+)["\x27]','i'))?.[1]||'';
     const label=(attr('alt')+' '+attr('title')).trim();
     if(/logo|sigl[ăa]|histor|vechi|soviet|sponsor|partener/i.test(label))continue;
     const kind=/stem[ăa]|coat.of.arms|герб|címer/i.test(label)?'coat':/drapel|steag|flag|флаг|zászló/i.test(label)?'flag':null;
     if(!kind)continue;
     const src=attr('src');if(!src||src.startsWith('data:'))continue;
     const image=new URL(src.replaceAll('&amp;','&'),response.url).href;
     if(!/^https:\/\//.test(image))continue;
     const check=await fetch(image,{headers,signal:AbortSignal.timeout(12000)});
     const mime=check.headers.get('content-type')?.split(';')[0];await check.body?.cancel();
     if(check.ok&&['image/svg+xml','image/png','image/jpeg','image/gif','image/webp','image/avif'].includes(mime))
      result.candidates.push({symbolType:kind,url:image,mime,label});
    }
   }catch(e){result.error=String(e);}
   await writeFile(cacheFile,JSON.stringify(result));
  }
  if(result.candidates.length&&!result.sourceUrl){
   try{const response=await fetch(url,{method:'HEAD',headers,signal:AbortSignal.timeout(12000)});if(response.ok&&response.url.startsWith('https://'))result.sourceUrl=response.url;else throw Error('HTTPS source not confirmed');}
   catch(e){result.error=String(e);result.candidates=[];}
   await writeFile(cacheFile,JSON.stringify(result));
  }
  const sourceUrl=result.sourceUrl||url;
  row.discovery.institutional.pages.push({url,error:result.error||null,candidates:result.candidates.length});
  for(const candidate of result.candidates){
   const kind=candidate.symbolType;
   if(row[kind]||row.candidates.some(c=>c.symbolType===kind&&c.eligible))continue;
   const c={...candidate,atlasId:row.atlasId,source:sourceUrl,sourceUrl,sourceType:'institutional',
    sourceLanguage:null,holder:row.officialName,entityType:row.entityType,wikidata:row.wikidata,
    identityEvidence:{type:'exact-entity-linked-website',value:url},status:'CANDIDATE',
    reviewNotes:['Explicit image alt/title on linked authority page; legal authenticity deferred'],eligible:true};
   row.candidates.push(c);
   if(!excluded.has(row.atlasId+':'+kind)){
    row[kind]={kind:'official',url:c.url,sourceUrl,tier:'A'};
    row.source[kind]=sourceUrl;row.sourceType[kind]='institutional';row.status[kind]='CANDIDATE';
   }
  }
 }
 row.discovery.institutional.state=row.discovery.institutional.pages.some(p=>p.error)?'PARTIAL_OR_ERROR':'PROCESSED';
}
let institutionCursor=0;
await Promise.all(Array.from({length:16},async()=>{
 while(institutionCursor<institutionalJobs.length){
  const row=institutionalJobs[institutionCursor++];await institution(row);
  if(institutionCursor%25===0)console.log('Institutional',institutionCursor,'/',institutionalJobs.length);
 }
}));


for(const row of Object.values(rows)){
 if(row.coat&&row.flag&&row.coat.url===row.flag.url){
  row.reviewNotes.push('Identical coat/flag image: flag assignment withheld');
  for(const candidate of row.candidates.filter(c=>c.symbolType==='flag'&&c.url===row.flag.url)){candidate.eligible=false;candidate.reviewNotes.push('Image conflated with coat');}
  row.flag=null;row.source.flag=null;row.sourceType.flag=null;row.sourceLanguage.flag=null;row.status.flag='MISSING';
 }
}
applySymbolConflicts(rows);
const stats=list=>({entities:list.length,coat:list.filter(r=>r.coat).length,flag:list.filter(r=>r.flag).length,
 both:list.filter(r=>r.coat&&r.flag).length,withoutImages:list.filter(r=>!r.coat&&!r.flag).length,
 candidates:list.reduce((n,r)=>n+['coat','flag'].filter(k=>r[k]&&r.status[k]==='CANDIDATE').length,0),
 processed:list.filter(r=>r.discovery.state==='PROCESSED').length,
 coveragePercent:list.length?Number((100*list.filter(r=>r.coat||r.flag).length/list.length).toFixed(2)):0,
 coatCoveragePercent:list.length?Number((100*list.filter(r=>r.coat).length/list.length).toFixed(2)):0,
 flagCoveragePercent:list.length?Number((100*list.filter(r=>r.flag).length/list.length).toFixed(2)):0});
const all=Object.values(rows),index=new Map(entities.map(e=>[e.id,e]));
function isEast(r){let e=index.get(r.atlasId),seen=new Set();while(e&&!seen.has(e.id)){if(e.id==='osm-r65335')return true;seen.add(e.id);e=index.get(e.administrativeParentId);}return false;}
const group=fn=>Object.fromEntries([...new Set(all.map(fn))].sort().map(k=>[k,stats(all.filter(r=>fn(r)===k))]));
rows['osm-r19068253'].discovery.state='PROCESSED';
rows['osm-r19068253'].discovery.manualSearch={query:'Comuna Pelinia Drochia stemă drapel',source:'https://www.pelinia.md/',outcome:'Village/commune holder ambiguity: no name-only assignment',searchedOn:'2026-11-09'};
for(const id of ['stat-MD11','stat-MD12','stat-MD120']){
 rows[id].discovery.state='PROCESSED';rows[id].discovery.manualSearch={
  method:'Targeted web queries using statistical code/name and symbol type',
  queries:{'stat-MD11':'"MD11" "flag" Moldova statistical','stat-MD12':'"MD12" "coat of arms" statistical','stat-MD120':'"Regiunea de Dezvoltare Transnistria" "simboluri"'}[id],
  outcome:'No usable own symbol identified; PMR and historical symbols excluded',searchedOn:'2026-11-09'};
}
const report={schema:'atlas-sim-r4-coverage-v1',catalogSHA256:createHash('sha256').update(catalogBytes).digest('hex'),
 total:stats(all),byCountry:group(r=>r.country),byTerritory:group(r=>r.country==='RO'?'Romania':isEast(r)?'Nistrenia':'Moldova'),
 byLevel:group(r=>String(r.adminLevel)),byType:group(r=>r.entityType||'unspecified'),
 statisticalOnly:stats(all.filter(r=>!r.roles.includes('administrative'))),
 statisticalOwnSymbols:all.filter(r=>!r.roles.includes('administrative')&&(r.coat||r.flag)).map(r=>r.atlasId),
 institutionalErrors:all.flatMap(r=>(r.discovery.institutional?.pages||[]).filter(p=>p.error).map(p=>({atlasId:r.atlasId,...p}))),
 unprocessed:all.filter(r=>r.discovery.state==='UNPROCESSED').map(r=>r.atlasId),
 withoutImages:all.filter(r=>!r.coat&&!r.flag).map(r=>r.atlasId),
 missingCoat:all.filter(r=>!r.coat).map(r=>r.atlasId),missingFlag:all.filter(r=>!r.flag).map(r=>r.atlasId),
 candidateRecords:all.reduce((sum,r)=>sum+r.candidates.length,0),
 sourceLanguageCounts:Object.fromEntries([...new Set(all.flatMap(r=>Object.values(r.sourceLanguage).filter(Boolean)))].sort().map(language=>[language,all.reduce((sum,r)=>sum+Object.values(r.sourceLanguage).filter(l=>l===language).length,0)])),
 errors,
 sourceTypes:group(r=>[...new Set(Object.values(r.sourceType).filter(Boolean))].sort().join('+')||'none'),
 inventoryComplete:all.length===4283,allEntitiesAttempted:all.every(r=>r.discovery.state==='PROCESSED'),releaseStatus:'PENDING_PROTECTED_CI_AND_PUBLICATION',limitation:'Wikidata exact-identity and multilingual Wikipedia infobox passes; Ambiguous identities, multiple current candidates and authority-page access errors are recorded separately; institutional discovery scans linked homepages only. No legal authentication is asserted.'};
await mkdir(new URL('public/data/symbols/',root),{recursive:true});
await writeFile(new URL('public/data/symbols/registry.json.gz',root),gzipSync(JSON.stringify({schema:'atlas-sim-r4-symbols-v1',entities:rows})+'\n'));
await writeFile(new URL('docs/audits/SIM-R4-COVERAGE.json',root),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({...report,unprocessed:report.unprocessed.length,withoutImages:report.withoutImages.length},null,2));

const display={};
for(const row of all){
 const assets={};
 for(const kind of ['coat','flag']){
  const a=row[kind];
  if(a&&a.kind!=='local')assets[kind]={kind:a.kind,file:a.file,url:a.url,sourceUrl:a.sourceUrl,tier:a.tier||'B',status:row.status[kind]};
 }
 if(Object.keys(assets).length)display[row.atlasId]=assets;
}
await writeFile(new URL('src/data/globalSymbolSelections.mjs',root),
 '// Generated by collect-sim-r4-symbols.mjs; exact IDs only.\nexport const GLOBAL_SYMBOL_IDS='+JSON.stringify(all.map(r=>r.atlasId))+';\nexport const GLOBAL_SYMBOL_SELECTIONS='+JSON.stringify(display)+';\n');
