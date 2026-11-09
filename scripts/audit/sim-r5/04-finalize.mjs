// Deterministic decision layer: discovery never becomes legal certification automatically.
import {readFile,writeFile,readdir} from 'node:fs/promises';
import {gunzipSync,gzipSync} from 'node:zlib';
import {root,sha,clean,norm} from './network.mjs';
const read=async path=>JSON.parse(await readFile(new URL(path,root),'utf8'));
const gz=async path=>JSON.parse(gunzipSync(await readFile(new URL(path,root))));
const save=async(path,value)=>writeFile(new URL(path,root),path.endsWith('.gz')?gzipSync(JSON.stringify(value)):JSON.stringify(value,null,2)+'\n');
const audit=await gz('public/data/symbols/audit-initial.json.gz');
const registry=await gz('public/data/symbols/registry.json.gz');
const nodes=(await gz('public/data/phase4/catalog.json.gz')).entities;
const byId=new Map(nodes.map(n=>[n.id,n]));
const meta=await gz('docs/audits/sim-r5/source-metadata.json.gz');
const docs=await gz('docs/audits/sim-r5/documentary-sources.json.gz');
const hashes=await read('docs/audits/sim-r5/image-checksums.json');
const linked=await gz('docs/audits/sim-r5/primary-linked-sources.json.gz');
const access=await gz('docs/audits/sim-r5/access-reinvestigation.json.gz');
const manual=await read('docs/audits/sim-r5/manual-decisions.json');
const visual=await read('docs/audits/sim-r5/annex-visual-reviews.json');
const history=await gz('docs/audits/sim-r5/article-history.json.gz');
const searches=[];
try{searches.push(...(await gz('docs/audits/sim-r5/document-searches.json.gz')).records);}catch{}
for(const file of (await readdir(new URL('work/',root))).filter(f=>/^sim-r5-search-\d+\.json$/.test(f)).sort())searches.push(...(await read('work/'+file)).records);
const searchById=new Map(searches.map(s=>[s.id,s]));
const required=nodes.filter(n=>registry.entities[n.id].coat||registry.entities[n.id].flag||!n.roles.includes('administrative')||['osm-r377733','osm-r59002'].includes(n.id));
const unsearched=required.filter(n=>!searchById.has(n.id)).map(n=>n.id);
if(unsearched.length&&!process.argv.includes('--checkpoint'))throw Error('Unsearched entities: '+unsearched.length);
await save('docs/audits/sim-r5/document-searches.json.gz',{method:'Public web search tool; four queries per batch; per-ID queries and timestamps retained. Discovery is not legal proof.',records:[...searchById.values()]});
const decisions=new Map(manual.decisions.map(d=>[d.atlasId+':'+d.kind,d]));
const priority=new Map(manual.priorityFindings.map(p=>[p.atlasId,p]));
const approvalDate=text=>{
 const numeric=String(text||'').match(/(\d{1,2})\.(\d{1,2})\.(\d{4})/);
 if(numeric)return numeric[3]+'-'+numeric[2].padStart(2,'0')+'-'+numeric[1].padStart(2,'0');
 const english=String(text||'').match(/(\d{1,2}) (January|February|March|April|May|June|July|August|September|October|November|December) (\d{4})/i);
 if(!english)return null;const months=['january','february','march','april','may','june','july','august','september','october','november','december'];
 return english[3]+'-'+String(months.indexOf(english[2].toLowerCase())+1).padStart(2,'0')+'-'+english[1].padStart(2,'0');
};
const claims=(q,p)=>(q?.claims?.[p]||[]).filter(s=>s.rank!=='deprecated').map(s=>s.mainsnak?.datavalue?.value);
const values=o=>Object.fromEntries(Object.entries(o||{}).map(([k,v])=>[k,clean(v?.value)]));
const selections={},corrections={};
function descendant(id,parent){const seen=new Set();while(id&&!seen.has(id)){if(id===parent)return true;seen.add(id);id=byId.get(id)?.administrativeParentId;}return false;}
function scope(n){return n.country==='RO'?'Romania':descendant(n.id,'osm-r65335')?'Nistrenia_de_facto':'Moldova';}
let graphicVerification=null;
// Simple national flag: verify the actual SVG geometry and every colour against the current legal table.
const roFlag=registry.entities['osm-r90689'].flag;
try{
 const svg=await readFile(new URL('docs/audits/sim-r5/romania-flag-inspected.svg',root),'utf8');
 graphicVerification={atlasId:'osm-r90689',kind:'flag',sha256:sha(svg),viewBox:/viewBox="0 0 3 2"/.test(svg),
  colours:['#002B7F','#FCD116','#CE1126'].every(colour=>svg.includes('fill="'+colour+'"')),
  rectangles:[['3','0'],['2','1'],['1','2']].every(([width,x])=>svg.includes('<rect width="'+width+'" height="2" x="'+x+'" y="0"')),
  legalSource:'https://legislatie.just.ro/Public/DetaliiDocumentAfis/279161',act:'Law 75/1994, annex 1 as amended by Law 176/19 June 2023',
  comparison:'Current primary legislative table gives RGB 0,43,127;252,209,22;206,17,38, three equal bands and 2:3 ratio. Actual SVG rectangles match exactly.',
  retrievalLimitation:'Legal text read through public legislative portal extraction; direct TLS request unavailable. SVG independently downloaded.'};
 if(graphicVerification.viewBox&&graphicVerification.colours&&graphicVerification.rectangles)decisions.set('osm-r90689:flag',{
  atlasId:'osm-r90689',kind:'flag',verdict:'VERIFIED_OFFICIAL',action:'KEEP',act:graphicVerification.act,sources:[graphicVerification.legalSource],
  identity:'Romanian national flag, exact root osm-r90689.',graphicComparison:graphicVerification.comparison,limitations:[graphicVerification.retrievalLimitation]});
}catch(error){graphicVerification={error:String(error)};}
await save('docs/audits/sim-r5/graphic-checks.json',graphicVerification);
for(const n of nodes){
 const row=audit.entities[n.id],original=registry.entities[n.id];row.reportingScope=scope(n);row.gagauzia=descendant(n.id,'osm-r1699032');row.recognizedLeftBank=descendant(n.id,'osm-r2607033');
 for(const kind of ['coat','flag']){
  const item=row.symbols[kind],asset=item.existingImage,key=n.id+':'+kind;
  const search=searchById.get(n.id);const finding=priority.get(n.id);
  item.act=finding?.symbolActs?.[kind]||null;item.approvalDate=approvalDate(item.act);
  item.legalStatus=asset?(row.reportingScope==='Nistrenia_de_facto'?'DE_FACTO_USE_CLAIM':'OFFICIAL_STATUS_UNCONFIRMED'):'NO_ASSIGNED_IMAGE';
  if(asset&&row.recognizedLeftBank){item.legalStatus='RECOGNIZED_UNIT_SYMBOL_AUTHORITY_UNCONFIRMED';item.limitations.push('Certified CUATM unit in the Moldova-recognized left-bank system. A symbol used by a de facto city council or district is not automatically an approved symbol for this distinct identity. Catalog classification and geographic scope remain unchanged.');}
  if(finding){item.evidence.push({type:'PRIORITY_RESEARCH',...finding});item.limitations.push(finding.finding);}
  if(!asset){
   item.investigation={state:'NO_ASSIGNED_IMAGE',stages:{inventory:'COMPLETE',documentSearch:search?.state||'NOT_REQUIRED_FOR_UNASSIGNED_SLOT'}};
   if(!n.roles.includes('administrative')){item.evidence.push({type:'STATISTICAL_RESEARCH',search:search||null,wikipedia:meta.wikipedia[n.id]||[]});item.limitations.push('No own symbol established by this investigation. This is not proof of nonexistence; historical-region, component, national and agency symbols are not substituted.');}
   continue;
  }
  const q=meta.wd[original.wikidata];const file=asset.file;const commons=file?meta.commons[file]:null;const current=commons?.versions?.[0];const ext=values(current?.extmetadata);
  const candidates=original.candidates.filter(c=>c.symbolType===kind&&(file&&c.file===file||c.url===asset.url));
  item.graphicDate=ext.DateTimeOriginal||null;item.imageRevisionDate=current?.timestamp||null;
  const wiki=(meta.wikipedia[n.id]||[]);const matches=wiki.filter(w=>w.wikidata===original.wikidata&&w.matchedSymbols.some(s=>s.kind===kind&&s.file===file));
  const osmMatches=claims(q,'P402').some(v=>String(v)===String(n.osmRelationId));
  const currentClaim=file&&claims(q,kind==='coat'?'P94':'P41').some(v=>norm(String(v).replaceAll('_',' '))===norm(file.replaceAll('_',' ')));
  const codeMatches=claims(q,'P843').some(v=>String(v)===String(n.registry?.code));
  const exactIdentity=osmMatches||codeMatches;
  item.identity={wikidata:original.wikidata,certifiedOSM:n.osmRelationId,certifiedCode:n.registry?.code||null,currentOSMClaims:claims(q,'P402'),currentSIRUTAClaims:claims(q,'P843'),exactIdentifierCorroborated:exactIdentity,selectedFileClaim:!!currentClaim,linkedArticleMatches:matches.length,
   rule:'No name-only transfer. Exact identifier claims corroborate existing mappings; a documented holder contradiction overrides them.'};
  item.imageHashes={download:hashes.images[key]||null,commonsReportedOriginalSHA1:current?.sha1||null,commonsOriginalURL:current?.url||null,
   scope:'Commons SHA1 is source-reported for the original, not an independently calculated SHA256 of a displayed thumbnail.'};
  item.rights={verdict:ext.LicenseShortName?'DOCUMENTED_DECLARATION':'RIGHTS_UNCLEAR',license:ext.LicenseShortName||null,licenseUrl:ext.LicenseUrl||null,
   artist:ext.Artist||null,credit:ext.Credit||null,attributionRequired:ext.AttributionRequired||null,restrictions:ext.Restrictions||null,
   source:commons?.title?'https://commons.wikimedia.org/wiki/'+encodeURIComponent(commons.title.replaceAll(' ','_')):asset.sourceUrl||original.source[kind],
   limitation:ext.LicenseShortName?'Commons uploader declaration recorded; this is not independent legal clearance.':'No explicit reproduction licence established. Existing display retained; no new local copy introduced.'};
  if(n.country==='MD'&&['local','official'].includes(asset.kind))item.rights.displayModeAssessment={mode:'INFORMATIONAL_WITH_HOLDER_ATTRIBUTION',source:'https://ciocana.md/simbolurile-sectorului',basis:'Law on public symbols 86/2011 art.12(3), as transcribed by the territorial authority. Informational use of the symbol and copyright in a particular reproduction are separate questions; no branding permission asserted.'};
  item.investigation={state:search?'COMPLETED_AVAILABLE_RESEARCH':'INCOMPLETE_CHECKPOINT',stages:{inventory:'COMPLETE',identity:'EXACT_ID_AND_SOURCE_CROSSCHECK',wikidata:q?'RETRIEVED':'UNAVAILABLE',commons:current?'RETRIEVED':'UNAVAILABLE_OR_NOT_APPLICABLE',wikipedia:{attempted:wiki.length,retrieved:wiki.filter(w=>w.revision).length,matchingFiles:matches.length},documentSearch:search?.state||'NOT_STARTED',imageDownload:hashes.images[key]?.status===200?'HASHED':'ATTEMPT_FAILED_SOURCE_HASH_SEPARATE',graphicComparison:'NOT_INDEPENDENTLY_COMPLETED'}};
  item.evidence.push({type:'CURRENT_WIKIMEDIA',file:commons?.title||file||null,revision:commons?.revision||null,versions:commons?.versions?.map(v=>({timestamp:v.timestamp,sha1:v.sha1,user:v.user,comment:clean(v.comment)}))||[],description:ext.ImageDescription||null,credit:ext.Credit||null,categories:ext.Categories||null,matchedArticles:matches.map(w=>({language:w.language,title:w.title,url:w.url,revision:w.revision})),sourceMetadata:'docs/audits/sim-r5/source-metadata.json.gz'});
  item.limitations.push('Commons history includes at most five image revisions. Wikipedia article history is separately checkpointed; rate-limited or deferred histories are not represented as examined diffs.');
  const articleHistory=history.records.find(h=>h.atlasId===n.id);
  if(articleHistory){item.evidence.push({type:'ARTICLE_HISTORY',...articleHistory});item.investigation.stages.articleHistory=articleHistory.state;}
  const visualRecords=visual.records.filter(v=>v.atlasId===n.id);
  if(visualRecords.length)item.evidence.push({type:'PRIMARY_ANNEX_VISUAL_REVIEW',records:visualRecords});
  if(search)item.evidence.push({type:'DOCUMENT_DISCOVERY_ONLY',query:search.query,checkedAt:search.checkedAt,state:search.state,results:search.results,exactContextMatches:search.exactContextMatches,limitation:search.limitations});
  for(const source of Object.values(linked.sources||{}).filter(s=>s.linkedSymbolIds?.includes(key)))item.evidence.push({type:'LINKED_PRIMARY_REQUEST',url:source.url,status:source.status,sha256:source.sha256,error:source.error});
  const parent=byId.get(n.administrativeParentId);const countyCode=parent?.sourceTags?.['ISO3166-2']?.replace('RO-','')||parent?.registry?.code;
  const relatedDecrees=docs.decrees.filter(d=>norm(d.title).includes(norm(n.name))&&(!parent?.name||norm(d.title).includes(norm(parent.name))));
  if(relatedDecrees.length)item.evidence.push({type:'PRIMARY_DECREE_DISCOVERY',documents:relatedDecrees.map(d=>({title:d.title,url:d.url,status:d.status,sha256:d.sha256})),limitation:'Potential documents, not automatic holder attribution: village/commune and parent scope must still be checked before legal certification.'});
  const armorial=kind==='coat'&&n.country==='RO'?docs.armorialPages.filter(p=>p.code===countyCode).flatMap(p=>p.images.filter(i=>norm(i.alt.replace(/^(stema\s*)+/i,''))===norm(n.name)).map(i=>({page:p.url,image:i.src,countyCode:p.code,pageSHA256:p.sha256}))):[];
  if(armorial.length)item.evidence.push({type:'COUNTY_CONTEXT_ARMORIAL_DISCOVERY',matches:armorial,limitation:'Context corroboration only; no automatic legal or pixel-fidelity certification.'});
  item.verdict=exactIdentity&&currentClaim&&matches.length&&current?'SOURCE_CORROBORATED':'CANDIDATE_UNVERIFIED';
  item.authenticity=item.verdict==='SOURCE_CORROBORATED'?'IDENTITY_AND_CURRENT_USE_CORROBORATED':'UNCONFIRMED';
  item.graphicVersion='PRIMARY_GRAPHIC_FIDELITY_UNCONFIRMED';
  item.limitations.push('No complete independently verified chain of applicable act, later amendments and official graphic annex established by the automated crosscheck. Wikipedia/Commons alone do not certify legal authenticity.');
  if(hashes.images[key]?.status!==200)item.limitations.push('Direct image retrieval failed: '+(hashes.images[key]?.error||'unavailable')+'. Do not interpret this as an incorrect symbol.');
  const decision=decisions.get(key);
  if(decision){
   item.verdict=decision.verdict;item.act=decision.act||null;item.evidence.push({type:'DOCUMENTED_DECISION',...decision});item.limitations.push(...decision.limitations);
   item.approvalDate=approvalDate(item.act);
   item.legalStatus=decision.verdict==='VERIFIED_OFFICIAL'?'OFFICIAL_CONFIRMED':decision.verdict==='HISTORICAL_ONLY'?'HISTORICAL':row.reportingScope==='Nistrenia_de_facto'?'DE_FACTO_USE_CLAIM':'OFFICIAL_STATUS_UNCONFIRMED';
   if(decision.rightsOverride)item.rights={...item.rights,...decision.rightsOverride};
   item.investigation.stages.graphicComparison='DOCUMENTED_REVIEW_WITH_STATED_LIMITATIONS';
   item.authenticity=decision.verdict==='MISATTRIBUTED'?'WRONG_TERRITORIAL_HOLDER':decision.verdict==='VERIFIED_OFFICIAL'?'OFFICIAL_CONFIRMED':decision.verdict;
   item.graphicVersion=decision.verdict==='VERIFIED_OFFICIAL'?'CURRENT_REPRESENTATION_CONFIRMED':decision.verdict==='MISATTRIBUTED'?'NOT_APPLICABLE_TO_HOLDER':'COMPARISON_WITH_LIMITATIONS';
   if(decision.action==='REMOVE'){item.recommendedImage=null;item.contradictions.push(decision.identity);item.changes.push({action:'REMOVE_ASSIGNMENT',previousImage:asset,reason:decision.identity});(corrections[n.id]||={})[kind]=null;}
   if(decision.action==='REPLACE'){
    item.recommendedImage=decision.replacement;item.recommendedVerdict=decision.replacementVerdict;item.recommendedRights=decision.replacementRights;
    item.recommendedGraphicVersion=decision.replacementVerdict==='VERIFIED_OFFICIAL'?'CURRENT_REPRESENTATION_CONFIRMED':'SOURCE_CORROBORATED_GRAPHIC_VARIANT';
    item.recommendedImageHashes=decision.replacementHashes;item.contradictions.push(decision.graphicComparison);
    item.changes.push({action:'REPLACE_IMAGE',previousImage:asset,replacement:decision.replacement,reason:decision.graphicComparison});
    (corrections[n.id]||={})[kind]=decision.replacement;
   }
  }
  if(n.id==='osm-r1691801') {item.verdict='CANDIDATE_UNVERIFIED';item.authenticity='CITY_VERSUS_MUNICIPALITY_SCOPE_UNRESOLVED';}
  if(visualRecords.some(v=>v.scopeLimitation.startsWith('The decree explicitly names the village'))){item.verdict='CANDIDATE_UNVERIFIED';item.authenticity='VILLAGE_VERSUS_COMMUNE_SCOPE_UNRESOLVED';item.limitations.push('Village-only decree does not establish application to the whole commune. Existing image preserved without certification.');}
  item.manualReviewRequired=(item.recommendedVerdict||item.verdict)!=='VERIFIED_OFFICIAL'||(item.recommendedRights||item.rights).verdict==='RIGHTS_UNCLEAR';
  const displayedRights=item.recommendedRights||item.rights;
  (selections[n.id]||={})[kind]={verdict:item.recommendedVerdict||item.verdict,previousVerdict:item.recommendedVerdict?item.verdict:null,rights:displayedRights.verdict,license:displayedRights.license,artist:displayedRights.artist,licenseUrl:displayedRights.licenseUrl,source:decision?.sources?.[0]||asset.sourceUrl||original.source[kind],graphicVersion:item.recommendedVerdict==='VERIFIED_OFFICIAL'?'CURRENT_REPRESENTATION_CONFIRMED':item.graphicVersion};
 }
}
audit.schema='atlas-sim-r5-audit-v1';audit.completedAt=new Date().toISOString();audit.method={scope:'Exhaustive assignment inventory and available-source investigation; explicit unresolved findings retained.',automaticCertification:false,missingEvidenceDoesNotRemove:true,unsearched,manualDecisions:decisions.size,metadataReference:'docs/audits/sim-r5/source-metadata.json.gz'};
const items=Object.values(audit.entities).flatMap(e=>Object.values(e.symbols));const assigned=items.filter(i=>i.existingImage);
const count=list=>({slots:list.length,examined:list.filter(i=>i.existingImage&&i.investigation.state==='COMPLETED_AVAILABLE_RESEARCH').length,coats:list.filter(i=>i.existingImage&&i.kind==='coat').length,flags:list.filter(i=>i.existingImage&&i.kind==='flag').length,
 verdicts:Object.fromEntries([...new Set(list.map(i=>i.verdict))].map(v=>[v,list.filter(i=>i.verdict===v).length])),verifiedCoats:list.filter(i=>i.kind==='coat'&&i.verdict==='VERIFIED_OFFICIAL').length,verifiedFlags:list.filter(i=>i.kind==='flag'&&i.verdict==='VERIFIED_OFFICIAL').length,
 rightsUnclear:list.filter(i=>i.rights.verdict==='RIGHTS_UNCLEAR').length,needsFurtherReview:list.filter(i=>i.manualReviewRequired).length,removed:list.filter(i=>i.changes.some(c=>c.action==='REMOVE_ASSIGNMENT')).length,replaced:list.filter(i=>i.changes.some(c=>c.action==='REPLACE_IMAGE')).length,
 currentCoats:list.filter(i=>i.kind==='coat'&&i.recommendedImage).length,currentFlags:list.filter(i=>i.kind==='flag'&&i.recommendedImage).length,currentUnconfirmed:list.filter(i=>i.recommendedImage&&(i.recommendedVerdict||i.verdict)!=='VERIFIED_OFFICIAL').length,
 currentVerifiedCoats:list.filter(i=>i.kind==='coat'&&i.recommendedImage&&(i.recommendedVerdict||i.verdict)==='VERIFIED_OFFICIAL').length,currentVerifiedFlags:list.filter(i=>i.kind==='flag'&&i.recommendedImage&&(i.recommendedVerdict||i.verdict)==='VERIFIED_OFFICIAL').length});
const report={schema:audit.schema,baseCommit:audit.baseCommit,catalogSHA256:audit.catalogSHA256,baseline:audit.counts,results:count(items),byScope:{},byCountry:{},byAdministrativeType:{},byAdministrativeLevel:{},gagauzia:count(Object.values(audit.entities).filter(e=>e.gagauzia).flatMap(e=>Object.values(e.symbols))),
 institutionalAccess:{cases:access.previousCases,holders:new Set(access.cases.map(c=>c.atlasId)).size,recovered:access.recovered,stillInaccessible:access.stillInaccessible,archiveServiceProbe:access.archiveServiceProbe},
 sources:{wikidataEntities:Object.keys(meta.wd).length,commonsFiles:Object.keys(meta.commons).length,wikipediaAttempts:Object.values(meta.wikipedia).flat().length,wikipediaRetrieved:Object.values(meta.wikipedia).flat().filter(w=>w.revision).length,documentSearchEntities:searchById.size,armorialPages:docs.armorialPages.length,presidentialDecreePDFs:docs.decrees.filter(d=>d.status===200).length,independentImageSHA256:assigned.filter(i=>i.imageHashes.download?.sha256).length,sourceReportedOriginalSHA1:assigned.filter(i=>i.imageHashes.commonsReportedOriginalSHA1).length},
 statisticalRegions:Object.values(audit.entities).filter(e=>!e.roles.includes('administrative')).map(e=>({atlasId:e.atlasId,name:e.officialName,country:e.country,coat:e.symbols.coat.verdict,flag:e.symbols.flag.verdict,search:e.symbols.coat.evidence.find(v=>v.type==='STATISTICAL_RESEARCH')?.search?.state||'NOT_STARTED',finding:'No own symbol established; both nulls preserved, not a claim of nonexistence.'})),priorityFindings:manual.priorityFindings};
for(const [key,field]of[['byScope','reportingScope'],['byCountry','country'],['byAdministrativeType','entityType'],['byAdministrativeLevel','adminLevel']])for(const value of new Set(Object.values(audit.entities).map(e=>String(e[field]))))report[key][value]=count(Object.values(audit.entities).filter(e=>String(e[field])===value).flatMap(e=>Object.values(e.symbols)));
const current=structuredClone(registry);
for(const[id,changes]of Object.entries(corrections))for(const[kind,value]of Object.entries(changes)){current.entities[id][kind]=value;current.entities[id].status[kind]=value?'REVIEWED_SOURCE':'MISSING';if(value){current.entities[id].source[kind]=value.sourceUrl;current.entities[id].sourceType[kind]=value.kind==='local'?'institutional-annex':'commons';current.entities[id].sourceLanguage[kind]=value.kind==='local'?'ro':'en';}else{current.entities[id].source[kind]=null;current.entities[id].sourceType[kind]=null;current.entities[id].sourceLanguage[kind]=null;}current.entities[id].reviewNotes.push('SIM-R5: '+decisions.get(id+':'+kind).identity);}
report.currentCoverage={entities:Object.keys(current.entities).length,coat:Object.values(current.entities).filter(r=>r.coat).length,flag:Object.values(current.entities).filter(r=>r.flag).length,both:Object.values(current.entities).filter(r=>r.coat&&r.flag).length,withoutImages:Object.values(current.entities).filter(r=>!r.coat&&!r.flag).length};
report.currentVerified={coat:assigned.filter(i=>i.recommendedImage&&(i.recommendedVerdict||i.verdict)==='VERIFIED_OFFICIAL'&&i.kind==='coat').length,flag:assigned.filter(i=>i.recommendedImage&&(i.recommendedVerdict||i.verdict)==='VERIFIED_OFFICIAL'&&i.kind==='flag').length};
report.currentVerdicts=Object.fromEntries([...new Set(items.map(i=>i.recommendedImage?(i.recommendedVerdict||i.verdict):'MISSING'))].map(verdict=>[verdict,items.filter(i=>(i.recommendedImage?(i.recommendedVerdict||i.verdict):'MISSING')===verdict).length]));
report.recognizedLeftBank=count(Object.values(audit.entities).filter(e=>e.recognizedLeftBank).flatMap(e=>Object.values(e.symbols)));
report.articleHistory={total:history.records.length,states:Object.fromEntries([...new Set(history.records.map(r=>r.state))].map(state=>[state,history.records.filter(r=>r.state===state).length])),limitation:history.method};
report.visualReview={sourcePairs:visual.reviewedPairs,documentedSymbolDecisions:decisions.size,scope:'Targeted primary-annex visual comparisons; remaining graphic fidelity is explicitly unconfirmed.'};
await save('public/data/symbols/audit.json.gz',audit);
await save('public/data/symbols/registry-current.json.gz',current);
await save('docs/audits/SIM-R5-RESULTS.json',report);
await writeFile(new URL('src/data/symbolAuditSelections.mjs',root),'// Generated by scripts/audit/sim-r5/04-finalize.mjs. No geographic data.\nexport const SYMBOL_AUDIT='+JSON.stringify(selections)+';\nexport const SYMBOL_CORRECTIONS='+JSON.stringify(corrections)+';\n');
const csv=['atlasId,officialName,country,scope,entityType,parentId,registryCode,kind,originalVerdict,authenticity,graphicVersion,originalRights,originalSHA256,commonsReportedOriginalSHA1,action,currentVerdict,currentImage,currentImageSHA256,currentRights'];
for(const e of Object.values(audit.entities))for(const i of Object.values(e.symbols))csv.push([e.atlasId,e.officialName,e.country,e.reportingScope,e.entityType,e.parentId,e.registryCode||'',i.kind,i.verdict,i.authenticity,i.graphicVersion,i.rights.verdict,i.imageHashes?.download?.sha256||'',i.imageHashes?.commonsReportedOriginalSHA1||'',i.changes.map(c=>c.action).join('|'),i.recommendedImage?(i.recommendedVerdict||i.verdict):'MISSING',i.recommendedImage?.url||'',i.recommendedImage?(i.recommendedImageHashes?.sha256||i.imageHashes?.download?.sha256||''):'',(i.recommendedRights||i.rights).verdict].map(v=>'"'+String(v).replaceAll('"','""')+'"').join(','));
await writeFile(new URL('docs/audits/sim-r5/per-symbol-verdicts.csv',root),csv.join('\n')+'\n');
console.log(JSON.stringify({results:report.results,sources:report.sources,unsearched:unsearched.length},null,2));
