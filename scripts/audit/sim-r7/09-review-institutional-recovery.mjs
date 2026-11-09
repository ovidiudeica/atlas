import {readFile,writeFile} from 'node:fs/promises';
import {gunzipSync,gzipSync} from 'node:zlib';
import {request,parallel,brief,clean,norm} from './network.mjs';
const input=JSON.parse(gunzipSync(await readFile('docs/audits/sim-r7/institutional-recovery.json.gz')));
const cases=await parallel(input.cases,4,async row=>{
 const c=structuredClone(row);c.discoveryState=c.state;c.contentReview={method:'Conservative document-level relevance review; a homepage or navigation label is insufficient',checkedAt:new Date().toISOString()};
 if(c.state==='RECOVERED_RELEVANT'){
  c.state='NO_RELEVANT_DOCUMENT';c.contentReview.finding='Observed PDFs concern cadastral registration, water and energy, not territorial symbols. The substring sistematica was a discovery false positive.';for(const d of c.documents)d.relevance='UNRELATED_CADASTRAL_OR_INFRASTRUCTURE_DOCUMENT';
 }
 if(c.state==='ARCHIVE_ONLY'){
  c.state='NO_RELEVANT_DOCUMENT';c.archivePageRecovered=true;c.contentReview.finding='Archived institutional homepage recovered; a symbol navigation link does not recover the actual heraldic document.';
  const snapshot=c.attempts.find(a=>a.role==='PUBLIC_ARCHIVE_SNAPSHOT'&&a.cacheFile);
  if(snapshot){const html=await readFile('work/sim-r7-cache/'+snapshot.cacheFile,'utf8');const links=[...html.matchAll(/<a\b[^>]*href\s*=\s*["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)].map(m=>{try{return{url:new URL(m[1].replaceAll('&amp;','&'),snapshot.finalUrl).href,label:clean(m[2])};}catch{return null;}}).filter(l=>l&&/\b(stema|heraldica|drapel|armorial)\b/i.test(norm(l.label))&&!/login|facebook|\.js/.test(l.url));
   for(const l of [...new Map(links.map(l=>[l.url,l])).values()].slice(0,2)){
    const r=await request(l.url,{timeout:8000});c.attempts.push({role:'ARCHIVED_SYMBOL_PAGE_FOLLOWUP',label:l.label,...brief(r)});
    const text=clean(r.text);if(!r.error&&text.length>500&&/hot[aă]r[aâ]r|herald|scut|câmp|cimp|aprobat/i.test(text)&&norm(text).includes(norm(c.entity).replace(/^comuna |^orasul |^municipiul /,''))){
     c.state='ARCHIVE_ONLY';c.documents.push({url:r.finalUrl,sha256:r.sha256,bytes:r.bytes,state:'ARCHIVED_HERALDIC_TEXT_RECOVERED',contentExcerpt:text.match(/.{0,100}(?:herald|scut|aprobat|Hotăr).{0,500}/i)?.[0],limitation:'Archived descriptive page, not a recovered normative graphic annex.'});c.contentReview.finding='Followed the archived heraldic page; descriptive content and exact linked holder retained. No symbol selection or legal certification.';
    }
   }
  }
 }
 if(c.state==='RECOVERED_UNRELATED'&&!c.pageTitle?.match(/domain|suspend|sale/i)){c.state='NO_RELEVANT_DOCUMENT';c.contentReview.finding='The returned page did not establish a relevant symbol document; holder mismatch alone is not proof of an unrelated institution.';}
 c.processed=true;c.investigationScope='First-pass original/current-authority/HTTPS, observed relevant links where accessible, available public archive and exact Wikidata claims/sitelinks. Wikipedia article contents and all superior-authority archives not exhaustively searched.';return c;
});const manuallyConfirmed=new Map([['osm-r10520136','b95ffcb253de2b649a2f2c424a1a32a7be9ab2a3d9eb8a8a340f7fbfdf9752a7']]);
for(const c of cases.filter(c=>c.state==='ARCHIVE_ONLY')){const valid=c.documents.find(d=>d.state==='ARCHIVED_HERALDIC_TEXT_RECOVERED'&&d.sha256===manuallyConfirmed.get(c.atlasId));c.contentReview.manualReview=true;if(!valid){c.state='NO_RELEVANT_DOCUMENT';c.contentReview.finding='Manual content review: archived navigation/news widgets or parent-county arms, not the exact commune heraldic document. The automated lexical match is not sufficient.';for(const d of c.documents)if(d.state==='ARCHIVED_HERALDIC_TEXT_RECOVERED')d.relevance='NOT_CONFIRMED_FOR_EXACT_HOLDER';}else{c.contentReview.finding='Manual review confirms the Crizbav article explicitly describes its shield, charges and one-tower mural crown. Archived institutional descriptive source only; no numbered final normative annex recovered.';}}
const states={};for(const c of cases)states[c.state]=(states[c.state]||0)+1;
const result={...input,states,cases,reviewedAt:new Date().toISOString(),exhaustiveAcrossAllMethods:false,actuallyReinvestigated:cases.length,originalHTTPResponses:cases.filter(c=>c.attempts.some(a=>a.role==='ORIGINAL_URL'&&a.status)).length,hostRestrictionSkips:cases.filter(c=>c.attempts.some(a=>a.role==='ORIGINAL_URL'&&a.error==='HOST_ACCESS_RESTRICTION')).length, relevantDocumentsRecovered:cases.filter(c=>['RECOVERED_RELEVANT','ARCHIVE_ONLY'].includes(c.state)).length};
await writeFile('docs/audits/sim-r7/institutional-recovery-reviewed.json.gz',gzipSync(JSON.stringify(result),{level:9}));console.log({states,actuallyReinvestigated:cases.length,relevantDocumentsRecovered:result.relevantDocumentsRecovered});
