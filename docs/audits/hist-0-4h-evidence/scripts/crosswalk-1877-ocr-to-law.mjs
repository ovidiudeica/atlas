import fs from 'node:fs';
import path from 'node:path';
const root=path.join(process.env.USERPROFILE,'Documents','Atlas-OHM-Inventory-2026-11-10');
const dir=path.join(root,'hist-0-4h-research-local');
const pages=JSON.parse(fs.readFileSync(path.join(dir,'1877-secondary-ocr-extracted-local.json'),'utf8'));
const law=JSON.parse(fs.readFileSync(path.join(root,'hist-0-4g-research-local','1877-I-chioar-localities-derived.json'),'utf8'));
const text=(i)=>pages.find(x=>x.page===i).text;
const szatm=text(53).slice(text(53).indexOf('Szatmár megye'))+'\n'+text(54).slice(0,text(54).indexOf('Szeben megye'));
const szol=text(56).slice(text(56).indexOf('Szolnok-Doboka megye'))+'\n'+text(57);
if(szatm.length<1000||szol.length<1000)throw Error('Bad OCR county sections');
const norm=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'').replace(/(.)\1{2,}/g,'$1$1');
const prep=s=>s.replace(/([A-Za-záéíóöőúüűÁÉÍÓÖŐÚÜŰ])-\s*\n\s*([A-Za-záéíóöőúüű])/g,'$1$2').replace(/[\r\n]/g,' ').replace(/\s+/g,' ');
function edit(a,b){const m=a.length,n=b.length;let prev=Array(n+1).fill(0).map((_,i)=>i);for(let i=1;i<=m;i++){let curr=[i];for(let j=1;j<=n;j++)curr[j]=Math.min(curr[j-1]+1,prev[j]+1,prev[j-1]+(a[i-1]===b[j-1]?0:1));prev=curr;}return prev[n]}
function variants(n){
 let x=n.replace(/^(Kis|Nagy|N\.|P\.|Ó|O|Alsó|Felső|Puszta|Erdő|Koltó|Hagymás)-/i,(_,prefix)=>prefix==='N.'?'Nagy-':prefix==='P.'?'Puszta-':prefix);
 const v=[n];const m=x.match(/^([^-]+)-(.+)$/);if(m)v.push(m[2]+' ('+m[1]+'-)');
 const alias={'Szt.':'Szent','N.':'Nagy','P.':'Puszta','Ó':'O'};for(const [f,t] of Object.entries(alias))if(n.startsWith(f))v.push(t+'-'+n.slice(f.length));
 return [...new Set(v)];
}
function context(s,term){
 const n=norm(s), t=norm(term);return n.includes(t);
}
function tokens(section){
 let s=prep(section);
 return s.split(',').map(x=>x.split(/\s+—\s+|[;.]/)[0].trim()).filter(x=>x&&x.length<75&&x.length>2);
}
const lists={Szatmár:tokens(szatm),'Szolnok-Doboka':tokens(szol)};
const out=[];
for(const a of law.localities){
 const county=a.destination_county;
 const section=county==='Szatmár'?szatm:szol;
 const pieces=lists[county];
 const v=[...new Set([...variants(a.name_1877),...(a.alias?[...variants(a.alias)]:[])])];
 let exact=v.some(name=>context(section,name));
 let candidates=pieces.map(n=>({name:n,score:Math.max(...v.map(z=>1-edit(norm(z),norm(n))/Math.max(norm(z).length,norm(n).length,1)))})).filter(x=>x.score>.47).sort((a,b)=>b.score-a.score).slice(0,5);
 const high=candidates[0]?.score>=.83;
 const status=exact?'OCR_EXACT_NORMALIZED_IN_ASSIGNED_COUNTY':high?'OCR_FUZZY_STRONG_CANDIDATE_NOT_VERIFIED':'UNRESOLVED_OCR';
 const sourcePages=county==='Szatmár'?[53,54]:[56,57];
 out.push({name_1877_law:a.name_1877,alias_1877_law:a.alias,destination_county:county,law_section:a.legal_section,gazetteer_1877_OCR_status:status,gazetteer_1877_pages_1_indexed:sourcePages,matched_OCR_token:candidates[0]||null,candidate_OCR_matches:candidates,ocr_exact_across_county_text:exact,gazetteer_1873_status:'ORIGINAL_SCAN_ACQUIRED_NO_PAGE_ENTRY_VERIFIED',edition_relationship:'OCR republication of 1877 official gazetteer, not legally authenticated municipality polygon',modern_locality_id:null,coordinate:null,historical_administrative_boundary:null,approved_match:false});
}
const stats=out.reduce((c,x)=>(c[x.gazetteer_1877_OCR_status]=(c[x.gazetteer_1877_OCR_status]||0)+1,c),{});
const res={phase:'HIST-0.4h',date:'2026-11-11',source_official_gazetteer_1873:'KSH original PDF 1004 image-only pages (no selectable text)',source_official_gazetteer_1877:'KSH original PDF 787 image-only pages',source_ocr_1877:'secondary digitization of 1877 official gazetteer (794 pages), Google OCR, not official KSH OCR',source_ocr_sha256:'f3d32e0f4c6a37fc8d31a63bacc806c9ed36e11beb056c990fa7c6a5faa3d03a',matched_official_1877_county_index_pages:{Szatmár:[53,54],'Szolnok-Doboka':[56,57]},count:out.length,county_counts:law.county_counts,status_counts:stats,county_ocr_lengths:{Szatmár:szatm.length,'Szolnok-Doboka':szol.length},warning:'OCR matches are research leads and require photographic page verification; exact normalized strings may refer to homonymous places. 1873 gazetteer remains unverified; no 19th century commune polygon is derived.',records:out};
const dest=path.join(dir,'chioar-1873-1877-gazetteer-crosswalk-research.json');fs.writeFileSync(dest,JSON.stringify(res,null,2)+'\n');console.log(JSON.stringify({output:dest,counts:stats,candidates:out.filter(x=>x.gazetteer_1877_OCR_status!=='OCR_EXACT_NORMALIZED_IN_ASSIGNED_COUNTY').slice(0,15).map(x=>({name:x.name_1877_law,status:x.gazetteer_1877_OCR_status,best:x.matched_OCR_token}))},null,2));
