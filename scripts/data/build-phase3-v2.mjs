import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import zlib from 'node:zlib';

const baseline=process.env.PHASE3_BASE_DIR;
const extracts=process.env.PHASE3_EXTRACTS_DIR;
const out=process.env.PHASE3_OUTPUT_V2;
if(!baseline||!extracts||!out)throw Error('PHASE3_BASE_DIR, PHASE3_EXTRACTS_DIR and PHASE3_OUTPUT_V2 are required.');
const load=(f)=>JSON.parse(fs.readFileSync(path.join(baseline,f),'utf8'));
const readExtract=(f)=>JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(extracts,f+'.gz'))).toString('utf8'));
const sha=(b)=>crypto.createHash('sha256').update(b).digest('hex');
fs.mkdirSync(out,{recursive:true});

const cat=load('actual/catalog-v1.json');
const nodes=cat.entities;
const byId=new Map(nodes.map(x=>[x.id,x]));
const md=JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(baseline,'actual/md-administrative-v1.geojson.gz'))));
const ro=JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(baseline,'actual/ro-administrative-v1.geojson.gz'))));
const cuatm=JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(baseline,'sources/cuatm-2025.json.gz'))));
const registry=new Map(cuatm.records.map(r=>[String(r.code),r]));
const mdnew=readExtract('md-admin-additional.geojson');
const rostat=readExtract('rostat-additional.geojson');
const mdstat=readExtract('mdstat-additional.geojson');
const nameKey=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()
  .replace(/[şș]/g,'s').replace(/[ţț]/g,'t')
  .replace(/^(municipiul|orasul|orașul|comuna|satul|raionul)\s+/,'').replace(/[^\p{L}\p{N}]+/gu,' ').trim();
const title=s=>String(s||'').trim().replace(/^(.)/u,(m)=>m.toLocaleUpperCase('ro-RO'));
const short=s=>title(s).replace(/^(raionul|comuna|municipiul|orasul|orașul|satul|sectorul)\s+/iu,'');
const labelFromTags=tags=>{
  const n=String(tags['short_name:ro']||tags['name:ro']||tags.short_name||tags.name||'');
  return n.includes(' / ')?short(n.split(' / ')[0]):short(n);
};
const officialFromRegistry=(record,source)=>{
  const pref=String(source['name:prefix']||'').toLocaleLowerCase('ro-RO');
  const nm=title(record.name);
  if(String(record.status_code)==='3'||source.place==='town')return 'Orașul '+nm;
  if(pref==='comuna')return 'Comuna '+nm;
  if(pref==='satul')return 'Satul '+nm;
  return nm;
};
const childOf=(rec,parentCode)=>{
  const seen=new Set();let code=String(rec.parent_code||'');
  while(code&&!seen.has(code)){if(code===parentCode)return true;seen.add(code);code=String(registry.get(code)?.parent_code||'')}
  return false;
};
const byName=new Map();
for(const r of cuatm.records){const key=nameKey(r.name);if(!byName.has(key))byName.set(key,[]);byName.get(key).push(r)}
const reconciliation=[],ambiguous=[],unresolved=[];let matched=0,notApplicable=0;
for(const ent of nodes.filter(x=>x.country==='MD'&&x.roles.includes('administrative')&&x.adminLevel!==2&&!x.registry)){
 const parent=byId.get(ent.administrativeParentId);
 const parentCode=String(parent?.registry?.code||'');
 const candidates=(byName.get(nameKey(ent.name))||[]).filter(r=>parentCode&&childOf(r,parentCode));
 let match=candidates.length===1?candidates[0]:null;
 let method=match?'unique_name_and_official_parent_chain':null;
 if(!match&&candidates.length>1){
   const kind=String(ent.sourceTags?.place||ent.sourceTags?.['place:ro']||ent.sourceTags?.['name:prefix']||'').toLocaleLowerCase('ro-RO');
   const expected=(kind.includes('town')||kind.includes('oraș')||kind.includes('oras'))?'3':(kind.includes('village')||kind.includes('sat'))?'8':null;
   if(expected){const remaining=candidates.filter(x=>String(x.status_code)===expected);if(remaining.length===1){match=remaining[0];method='unique_name_parent_and_official_status_'+expected}}
 }
 if(match){
   if(ent.osmRelationId==null)throw Error('Never assign CUATM to missing OSM ID without evidence: '+ent.id);
   if(!registry.has(String(match.code)))throw Error('Missing registry source record: '+match.code);
   ent.registry={system:'CUATM',code:String(match.code),matchedSourceRecord:true,record:match};
   ent.registryMatchMethod=method;
   ent.officialName=officialFromRegistry(match,ent.sourceTags||{});
   reconciliation.push({atlasId:ent.id,officialCode:String(match.code),officialName:match.name,sourceOSMRelationId:ent.osmRelationId,parentOfficialCode:parentCode,method,status:'matched'});
   matched++;continue;
 }
 if(ent.id==='osm-r12207955'&&ent.adminLevel===8&&parentCode==='0300'){
   ent.registry=null;ent.registryMatchMethod='no_separate_cuatm_2025_entry_for_balti_component';
   ent.officialName='Bălți';
   reconciliation.push({atlasId:ent.id,officialCode:null,parentOfficialCode:parentCode,method:ent.registryMatchMethod,status:'not_applicable'});
   notApplicable++;continue;
 }
 if(ent.id==='osm-r58512'&&ent.adminLevel===7&&parent?.id==='osm-r1691801'){
   ent.registry=null;ent.registryMatchMethod='not_applicable_osm_sector_not_in_cuatm_2025';
   ent.officialName='Sectorul Centru';
   reconciliation.push({atlasId:ent.id,officialCode:null,parentOfficialCode:parentCode,method:ent.registryMatchMethod,status:'not_applicable'});
   notApplicable++;continue;
 }
 const exception={atlasId:ent.id,name:ent.name,parentOfficialCode:parentCode,sourceLevel:ent.adminLevel,
   candidateOfficialCodes:candidates.map(x=>x.code),reason:'ambiguous_or_unmatched'};
 unresolved.push(exception);ambiguous.push(exception);
}
if(matched!==178||notApplicable!==2||unresolved.length)throw Error('CUATM reconciliation unfinished: '+JSON.stringify({matched,notApplicable,unresolved:unresolved.slice(0,10)}));
const assoc=new Map();
for(const x of nodes.filter(e=>e.country==='MD'&&e.roles.includes('administrative')&&e.registry)){
 const c=x.registry.code; if(!assoc.has(c))assoc.set(c,[]);assoc.get(c).push(x.id);
}
const collision=[...assoc].filter(([_,ids])=>ids.length>1).map(([code,ids])=>({code,ids}));
for(const {code,ids} of collision){for(const id of ids){const node=byId.get(id);node.registryIdentityReviewStatus='duplicate_cuatm_reference_pending_source_geometry_review';node.registryReferenceGroup=code;}}
console.log('REGISTRY_COLLISIONS',JSON.stringify(collision));

const pmap={65335:58974,1702216:65335,944727:65335,1702215:65335,1706978:1699032,1706979:1699032,
 7103068:1699032,1702219:65335,1702218:65335,1702217:65335,1702214:65335};
for(const f of mdnew.features){
 const rel=Number(f.properties.source_relation_id),id='osm-r'+rel,parent='osm-r'+pmap[rel];
 if(!pmap[rel]||!byId.has(parent)||byId.has(id))throw Error('Unexpected missing MD entity or parent '+rel);
 const tags=f.properties.tags;const nm=rel===65335?'Nistrenia':labelFromTags(tags);
 const node={
  id,country:'MD',roles:['administrative'],adminLevel:Number(tags.admin_level),boundary:'administrative',
  name:nm,shortName:{ro:nm,en:tags['name:en']||nm},
  officialName:title(tags['official_name:ro']||tags['name:ro']||nm),
  officialNameAuthority:'OSMB (no CUATM identity established)',
  entityType:rel===65335?'nistrenia_administrative':'subdivision_level_5',
  administrativeParentId:parent,treeParentId:parent,osmRelationId:rel,
  sourceTags:tags,atlasDerivedTags:{},
  registry:null,registryMatchMethod:'not_in_scope_of_cuatm_2025_reconciliation',
  statisticalRoles:[],geometryRef:'md-administrative-v2.geojson.gz#'+id,
  geometrySource:'OSM-Boundaries 2026-10-05; exact original edges and tags verified',
  archiveEdgeVerified:true
 };
 nodes.push(node);byId.set(id,node);
 md.features.push({type:'Feature',id,properties:{atlasId:id,osmRelationId:rel,adminLevel:Number(tags.admin_level)},geometry:f.geometry});
}
const statGeom={RO:[],MD:[]}, statRefs={RO:new Set(),MD:new Set()};
const roNuts=load('sources/nuts-ro-2024.json');
const mdNuts=load('sources/nuts-md-2017.json');
const roCodes=new Set(roNuts.units.filter(x=>x.level<3).map(x=>x.code));
const mdCodes=new Set(mdNuts.units.filter(x=>!['MD1','MD114','MD115'].includes(x.code)).map(x=>x.code));
for(const f of rostat.features){
 const tags=f.properties.tags,code=String(tags['ref:nuts']||'');
 if(!roCodes.has(code))continue;
 const id='stat-'+code,node=byId.get(id);
 if(!node||statRefs.RO.has(code))throw Error('RO statistical entity duplicate/not found '+code);
 node.geometryRef='ro-statistical-v2.geojson.gz#'+id;node.geometryStatus='present';
 node.sourceTags=tags;node.geometrySource='OSM-Boundaries statistical 2026-10-05, exact edges verified';
 node.archiveEdgeVerified=true;
 statGeom.RO.push({type:'Feature',id,properties:{atlasId:id,sourceOsmRelationId:f.properties.source_relation_id,code},geometry:f.geometry});
 statRefs.RO.add(code);
}
for(const f of mdstat.features){
 const tags=f.properties.tags;
 const code=tags.ref==='MD121'?'MD120':String(tags.ref||'');
 if(code==='MD114'||code==='MD115'){
  const adminId=code==='MD114'?'osm-r1699032':'osm-r1691801',node=byId.get(adminId);
  if(!node)throw Error('Missing reused MD stat admin unit '+code);
  node.statisticalSourceTags={...tags};node.statisticalSourceOSMRelationId=f.properties.source_relation_id;
  node.statisticalGeometryReused=true;
  const geometry=md.features.find(x=>x.id===adminId);
  if(!geometry)throw Error('MD stat geometry referenced admin missing '+adminId);
  // The supplied OSMB archives show identical administrative/statistical geometry for these codes.
  geometry.geometry=f.geometry;
  node.geometrySource='OSM-Boundaries administrative/statistical 2026-10-05; verified same border';
  node.geometryRef='md-administrative-v2.geojson.gz#'+adminId;
  continue;
 }
 if(!mdCodes.has(code))continue;
 const id='stat-'+code,node=byId.get(id);
 if(!node||statRefs.MD.has(code))throw Error('MD statistical unit missing or duplicate '+code);
 node.geometryRef='md-statistical-v2.geojson.gz#'+id;node.geometryStatus='present';
 node.sourceTags=tags;node.geometrySource='OSM-Boundaries statistical 2026-10-05, exact edges verified';
 node.archiveEdgeVerified=true;
 node.externalOsmStatisticalCode=tags.ref;
 statGeom.MD.push({type:'Feature',id,properties:{atlasId:id,sourceOsmRelationId:f.properties.source_relation_id,sourceStatisticalCode:tags.ref,officialCode:code},geometry:f.geometry});
 statRefs.MD.add(code);
}
for(const [country,got,exp] of [['RO',statRefs.RO,roCodes],['MD',statRefs.MD,mdCodes]]){
 if(got.size!==exp.size||[...exp].some(x=>!got.has(x)))throw Error('Statistical coverage incomplete '+country+JSON.stringify([...got]));
}
for(const e of nodes){
 if(e.geometryRef?.includes('-v1.geojson.gz'))e.geometryRef=e.geometryRef.replace('-v1.geojson.gz','-v2.geojson.gz');
}
nodes.sort((a,b)=>a.country.localeCompare(b.country)||a.id.localeCompare(b.id));
const ids=new Set(nodes.map(x=>x.id));if(ids.size!==nodes.length)throw Error('Duplicate Atlas IDs');
const invalidParents=nodes.filter(x=>x.treeParentId&&!ids.has(x.treeParentId)).map(x=>x.id);
if(invalidParents.length)throw Error('Missing tree parent: '+invalidParents.slice(0,5));
const cycles=[];for(const n of nodes){let x=n,seen=new Set();while(x?.treeParentId){if(seen.has(x.treeParentId)){cycles.push(n.id);break}seen.add(x.treeParentId);x=byId.get(x.treeParentId)}}if(cycles.length)throw Error('Tree cycle '+cycles[0]);
const files={};
const emit=(p,obj,zip=false)=>{
 const bytes=Buffer.from(JSON.stringify(obj));
 const payload=zip?zlib.gzipSync(bytes,{level:7}):bytes;
 const filename=path.join(out,p);fs.mkdirSync(path.dirname(filename),{recursive:true});fs.writeFileSync(filename,payload);
 files[p]={bytes:payload.length,sha256:sha(payload)};
};
const collections={RO:ro,MD:md};
emit('actual/catalog-v2.json',{schema:'atlas-actual-catalog-v2',status:'candidate',snapshotDate:'2026-10-05',entities:nodes});
emit('actual/ro-administrative-v2.geojson.gz',ro,true);
emit('actual/md-administrative-v2.geojson.gz',md,true);
emit('actual/ro-statistical-v2.geojson.gz',{type:'FeatureCollection',features:statGeom.RO},true);
emit('actual/md-statistical-v2.geojson.gz',{type:'FeatureCollection',features:statGeom.MD},true);
emit('actual/md-cuatm-180-reconciliation.json',{schema:'atlas-cuatm-reconciliation-v1',officialSource:'CUATM 2025',matched,notApplicable,records:reconciliation,collisions:collision});
emit('actual/md-cuatm-source-collisions.json',{schema:'atlas-cuatm-source-collisions-v1',count:collision.length,groups:collision,decision:'Do not automatically merge/delete entities or claim distinct legal identity; preserve OSM relations and review topology and registry roles'});
const counts={
 administrativeRO:nodes.filter(x=>x.country==='RO'&&x.roles.includes('administrative')).length,
 administrativeMD:nodes.filter(x=>x.country==='MD'&&x.roles.includes('administrative')).length,
 statRolesRO:nodes.filter(x=>x.country==='RO').reduce((s,n)=>s+n.statisticalRoles.length,0),
 statRolesMD:nodes.filter(x=>x.country==='MD').reduce((s,n)=>s+n.statisticalRoles.length,0),
 standaloneStatRO:statGeom.RO.length,standaloneStatMD:statGeom.MD.length,
 matchedCUATMPending:matched,notApplicableCUATMPending:notApplicable,unresolvedCUATMPending:unresolved.length
};
if(counts.administrativeRO!==3229||counts.administrativeMD!==1036||counts.standaloneStatRO!==12||counts.standaloneStatMD!==6||counts.statRolesRO!==54||counts.statRolesMD!==9)throw Error('Count regression '+JSON.stringify(counts));
const blockers=[
 {id:'RO_LEVEL8_OVERLAP_2',source:'OSMB exact snapshot 2026-10-05',count:2,areaKm2:1.05776,
  pairs:[[14879493,10624200],[14879461,10624200]],resolution:'not automatically edited'},
 {id:'MD_LEVEL8_OVERLAP_1',source:'OSMB exact snapshot 2026-10-05',count:1,areaKm2:0.23912,pairs:[[19118040,19118596]],resolution:'not automatically edited'},
 {id:'MD_PARENT_OUTSIDE_2',source:'OSMB exact snapshot 2026-10-05',count:2,areaKm2:0.804337,
  children:[12463200,19118596],resolution:'not automatically edited'},
 {id:'MD_CUATM_DUPLICATE_REFERENCE_GROUPS_6',source:'CUATM 2025 and OSMB 2026-10-05',count:collision.length,groups:collision,resolution:'source duplicate references retained pending per-ID identity decisions'}
];
emit('actual/validation-v2.json',{schema:'atlas-geometry-validation-v2',status:'SOURCE_GEOMETRY_COMPLETE_TOPOLOGY_REVIEW_REQUIRED',counts,registryReconciliation:'178 matches plus two entries without distinct CUATM identity (Centru sector and Bălți component)', missingApprovedAdministrativeGeometry:[],missingStandaloneStatisticalGeometry:[],invalidTreeParents:invalidParents,cycleCount:cycles.length,topologyBlockers:blockers,verifiedOriginalSourceArchiveHashes:{
 'OSMB-Romania-2026-10-05.geojson.gz':'cc4fd15940550054d90fcadf907ed98352b68882735680093f77a624e3e04897',
 'OSMB-Moldova-2026-10-05.geojson.gz':'d29b600daa2857bacf8ec7d13369db8fc95353e89f62fe1c762dbc692c216dad'}});
emit('actual/manifest-v2.json',{schema:'atlas-actual-candidate-manifest-v2',status:'GEOMETRY_COMPLETE_NOT_PROMOTABLE',sourceDate:'2026-10-05',counts,files,
 releaseBlockers:blockers.map(x=>x.id),exactSourceEdgesVerified:31,exactSourceTagsVerified:31,
 officialSources:{siruta:'2026',cuatm:'2025',nutsRO:'2024',nutsMD:'2017'}});
console.log(JSON.stringify({status:'GEOMETRY_COMPLETE_NOT_PROMOTABLE',counts,files,blockers:blockers.map(x=>x.id)},null,2));
