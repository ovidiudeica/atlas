import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import zlib from 'node:zlib';

const src=process.env.PHASE3_SOURCE_DIR;
const out=process.env.PHASE3_OUTPUT_DIR;
if(!src||!out)throw new Error('Set PHASE3_SOURCE_DIR and PHASE3_OUTPUT_DIR');
fs.mkdirSync(out,{recursive:true});
const filename=(p)=>path.join(src,p.replaceAll('/','__'));
const read=(p)=>JSON.parse(fs.readFileSync(filename(p),'utf8'));
const sha=(b)=>crypto.createHash('sha256').update(b).digest('hex');
const sourcePaths=[
'data/current/entities.json','data/sources/ro-siruta-current.json','data/sources/cuatm-current.json',
'data/sources/ro-nuts-2024.json','data/sources/md-nuts-2017.json',
'data/p2/actual-statistical-ro.json','data/p2/actual-statistical-md.json',
'public/geo/current/ro-administrative.geojson','public/geo/current/md-administrative.geojson'];
const original=read('data/current/entities.json').entities;
const oldById=new Map(original.map(e=>[e.id,e]));
const siruta=read('data/sources/ro-siruta-current.json');
const cuatm=read('data/sources/cuatm-current.json');
const sirutaById=new Map(siruta.records.map(e=>[String(e.siruta),e]));
const cuatmById=new Map(cuatm.records.map(e=>[String(e.code),e]));
const roNuts=read('data/sources/ro-nuts-2024.json');
const mdNuts=read('data/sources/md-nuts-2017.json');
const roOverlay=read('data/p2/actual-statistical-ro.json');
const mdOverlay=read('data/p2/actual-statistical-md.json');
const admin={RO:[],MD:[]};
const geometry={RO:[],MD:[]};
const all=new Map();
function titleCase(s){
  if(!s)return '';
  let t=String(s).trim();
  if(t===t.toLocaleUpperCase('ro-RO')){
    t=t.toLocaleLowerCase('ro-RO');
    t=t.replace(/(^|[\s-])(\p{L})/gu,(_m,sep,ch)=>sep+ch.toLocaleUpperCase('ro-RO'));
  }
  return t;
}
function shortName(s){
  const raw=titleCase(s);
  return raw.replace(/^(județul|judetul|comuna|municipiul|orașul|orasul|raionul|regiunea|sectorul)\s+/iu,'').trim();
}
function fullName(legacy,tags,short,country,level){
  if(country==='RO'){
    const legal=legacy?.legal;
    let name=titleCase(legal?.name||legacy?.official_name||short);
    if(!name)return short;
    if(/^(Județul|Municipiul|Comuna|Orașul|Sectorul)\s/u.test(name))return name;
    if(level===4)return name.toLocaleLowerCase('ro-RO').includes('bucurești')?'Municipiul București':'Județul '+name;
    if(legacy?.type==='commune')return 'Comuna '+name;
    if(legacy?.type==='municipality')return 'Municipiul '+name;
    if(legacy?.type==='town')return 'Orașul '+name;
    if(level===9)return name.startsWith('Sector ')?name:'Sectorul '+name;
    return name;
  }
  if(legacy?.official_name)return titleCase(legacy.official_name);
  if(tags.official_name)return titleCase(tags.official_name);
  const pref=tags['name:prefix'];
  if(pref&&!short.toLocaleLowerCase('ro-RO').startsWith(String(pref).toLocaleLowerCase('ro-RO')+' '))return titleCase(pref)+' '+short;
  return short;
}
function add(node){if(all.has(node.id))throw new Error('Duplicate id '+node.id);all.set(node.id,node)}
for(const country of ['RO','MD']){
  const features=read('public/geo/current/'+country.toLowerCase()+'-administrative.geojson').features;
  const allowed=country==='RO'?new Set([2,4,8,9]):new Set([2,3,4,5,7,8]);
  for(const f of features){
    const p=f.properties||{}, tags=p.tags||{};
    const synthetic=country==='RO'&&p.catalog_id==='siruta-u64096';
    const level=synthetic?8:Number(tags.admin_level);
    if(!synthetic&&(tags.boundary!=='administrative'||!allowed.has(level)))continue;
    if(country==='RO'&&level===9&&!/^Sector [1-6]$/.test(tags.name||''))continue;
    const relId=synthetic?null:Number(p.id);
    if(!synthetic&&(!Number.isInteger(relId)||relId<=0))throw new Error('Invalid relation id '+p.id);
    const id=synthetic?'siruta-u64096':'osm-r'+relId;
    const legacy=oldById.get(id);
    const legalRegistry=country==='RO'?'SIRUTA':'CUATM';
    const priorLegalId=synthetic?'64096':String(
      legacy?.legal?.id||legacy?.classification?.official_legal_id||
      (country==='MD'?(tags['ref:cuatm:codunic']||tags['ref:cuatm:1:codunic']):'')||''
    );
    // Legacy county bridge records store the SIRUTA county ordinal, NOT the SIRUTA unit code.
    const countyRecord=(country==='RO'&&level===4)
      ?siruta.records.find(rec=>Number(rec.level)===1&&String(rec.county_code)===priorLegalId)
      :null;
    if(country==='RO'&&level===4&&!countyRecord)throw new Error('Unresolved county code '+priorLegalId+' for '+id);
    const legalId=countyRecord?String(countyRecord.siruta):priorLegalId;
    const record=country==='RO'?sirutaById.get(legalId):cuatmById.get(legalId);
    const rawShort=synthetic?'Brețcu':
      (country==='MD'?(legacy?.name||tags['short_name']||tags['name:ro']||tags.name):
      (legacy?.name||tags['short_name']||tags.name));
    const sh=shortName(rawShort);
    const official=synthetic?'Comuna Brețcu':fullName(legacy,tags,sh,country,level);
    const parentFromOld=legacy?.parent_id;
    let parentId=(parentFromOld==='RO'?'osm-r90689':parentFromOld==='MD'?'osm-r58974':parentFromOld)||null;
    if(!parentId&&level!==2){
      const candidates=(p.relations||[]).map(x=>x.rel).filter(Number.isInteger);
      for(const c of candidates){if(c!==relId){parentId='osm-r'+c;break}}
    }
    const node={
      id,country,roles:['administrative'],adminLevel:level,boundary:'administrative',
      name:sh,shortName:{ro:sh,en:tags['short_name:en']||tags['name:en']||sh},
      officialName:official,entityType:legacy?.type||(synthetic?'commune':'administrative_unit'),
      administrativeParentId:parentId,treeParentId:parentId,
      osmRelationId:relId,
      sourceTags:synthetic?{}:tags,
      atlasDerivedTags:synthetic?{'name':'Brețcu','name:ro':'Brețcu','boundary':'administrative','admin_level':'8','name:prefix':'Comuna'}:{},
      registry:legalId?{system:legalRegistry,code:legalId,matchedSourceRecord:Boolean(record),record:record||null}:null,
      statisticalRoles:[],geometryRef:country.toLowerCase()+'-administrative.geojson.gz#'+id,
      geometrySource:synthetic?'reviewed ANCPI/OSM hybrid partition':'reviewed ACTUAL boundary from 2026-10-05 OSM source',
      provenanceNote:synthetic?'Reviewed hybrid geometry lineage is retained in technical metadata.':undefined
    };
    add(node);admin[country].push(node);
    geometry[country].push({type:'Feature',id,properties:{atlasId:id,osmRelationId:relId,adminLevel:level},geometry:f.geometry});
  }
}
for(const unit of roNuts.units){
  if(unit.level===3){
    const match=admin.RO.filter(x=>x.sourceTags['ref:nuts']===unit.code||x.sourceTags['ref:nuts:3']===unit.code);
    if(match.length===1)match[0].statisticalRoles.push({classification:'NUTS',version:'2024',code:unit.code,level:3,parentCode:unit.parent_code});
    continue;
  }
  const found=roOverlay.statistical_entities.find(x=>x.statistical?.code===unit.code);
  const id='stat-'+unit.code;
  add({id,country:'RO',roles:['statistical'],adminLevel:null,boundary:'statistical',name:shortName(unit.name),shortName:{ro:shortName(unit.name),en:shortName(unit.name)},officialName:titleCase(unit.name),entityType:'statistical_region',administrativeParentId:null,treeParentId:unit.level===1?'osm-r90689':'stat-'+unit.parent_code,osmRelationId:found?.representation?.osm_relation_id||null,sourceTags:{},registry:null,statisticalRoles:[{classification:'NUTS',version:'2024',code:unit.code,level:unit.level,parentCode:unit.parent_code}],geometryRef:null,geometryStatus:'pending_source_geometry'});
}
for(const x of admin.RO.filter(x=>x.adminLevel===4)){
 const st=x.statisticalRoles.find(s=>s.level===3);
 if(st?.parentCode)x.treeParentId='stat-'+st.parentCode;
}
for(const unit of mdNuts.units){
  const reused=unit.code==='MD1'?'osm-r58974':unit.code==='MD114'?'osm-r1699032':unit.code==='MD115'?'osm-r1691801':null;
  const sr={classification:'NUTS_MOLDOVA',version:'2017',code:unit.code,level:unit.level,parentCode:unit.parent_code};
  if(reused){const ent=all.get(reused);if(!ent)throw new Error('Reused MD unit missing '+reused);ent.statisticalRoles.push(sr);if(unit.code!=='MD1')ent.treeParentId='stat-MD11';continue}
  const from=mdOverlay.statistical_entities.find(x=>x.statistical?.code===unit.code);
  if(!from)throw new Error('Statistical entity missing '+unit.code);
  const id='stat-'+unit.code;
  add({id,country:'MD',roles:['statistical'],adminLevel:null,boundary:'statistical',name:shortName(unit.name),shortName:{ro:shortName(unit.name),en:shortName(unit.name)},officialName:titleCase(unit.name),entityType:'statistical_region',administrativeParentId:null,treeParentId:unit.level===2?'osm-r58974':'stat-'+unit.parent_code,osmRelationId:from.representation.osm_relation_id||null,sourceTags:{},registry:null,statisticalRoles:[sr],geometryRef:null,geometryStatus:'pending_source_geometry',externalOsmStatisticalCode:from.representation.osm_statistical_ref||null});
}
for(const bind of mdOverlay.administrative_component_bindings||[]){
 const ent=all.get(bind.entity_id);
 if(ent&&ent.adminLevel===4&&bind.statistical_parent_code){
  const code=bind.statistical_parent_code;
  const parent=code==='MD114'?'osm-r1699032':code==='MD115'?'osm-r1691801':'stat-'+code;
  if(parent!==ent.id&&all.has(parent))ent.treeParentId=parent;
 }
}
const nodes=[...all.values()].sort((a,b)=>a.country.localeCompare(b.country)||a.id.localeCompare(b.id));
const missingParents=nodes.filter(x=>x.treeParentId&&!all.has(x.treeParentId)).map(x=>({id:x.id,parent:x.treeParentId}));
const administrativeMissingParent=nodes.filter(x=>x.administrativeParentId&&!all.has(x.administrativeParentId)).map(x=>({id:x.id,parent:x.administrativeParentId}));
const cycleIssues=[];
for(const x of nodes){
 const seen=new Set(),chain=[x.id];let p=x.treeParentId;
 while(p){if(seen.has(p)||p===x.id){cycleIssues.push({id:x.id,cycle:[...chain,p]});break}seen.add(p);chain.push(p);p=all.get(p)?.treeParentId||null;}
}
const requiredMissingMD=[
 {osmRelationId:65335,level:3,name:'Nistrenia'},
 {osmRelationId:1702216,level:5,name:'Camenca'},
 {osmRelationId:944727,level:5,name:'Bender'},
 {osmRelationId:1702215,level:5,name:'Dubăsari'},
 {osmRelationId:1706978,level:5,name:'Comrat'},
 {osmRelationId:1706979,level:5,name:'Ceadîr-Lunga'},
 {osmRelationId:7103068,level:5,name:'Vulcănești'},
 {osmRelationId:1702219,level:5,name:'Tiraspol'},
 {osmRelationId:1702218,level:5,name:'Slobozia'},
 {osmRelationId:1702217,level:5,name:'Rîbnița'},
 {osmRelationId:1702214,level:5,name:'Grigoriopol'}
];
const shaFile={};
function emit(file,payload,binary=false){
  const loc=path.join(out,file);fs.mkdirSync(path.dirname(loc),{recursive:true});
  const data=binary?payload:Buffer.from(JSON.stringify(payload));
  fs.writeFileSync(loc,data);
  shaFile[file]={sha256:sha(data),bytes:data.length};return loc;
}
emit('actual/catalog-v1.json',{schema:'atlas-actual-catalog-v1',status:'candidate',sourceSnapshotDate:'2026-10-05',entities:nodes});
for(const country of ['RO','MD']){
  const binary=zlib.gzipSync(Buffer.from(JSON.stringify({type:'FeatureCollection',features:geometry[country]})),{level:7});
  emit('actual/'+country.toLowerCase()+'-administrative-v1.geojson.gz',binary,true);
}
emit('sources/siruta-2026.json.gz',zlib.gzipSync(fs.readFileSync(filename('data/sources/ro-siruta-current.json')),{level:7}),true);
emit('sources/cuatm-2025.json.gz',zlib.gzipSync(fs.readFileSync(filename('data/sources/cuatm-current.json')),{level:7}),true);
emit('sources/nuts-ro-2024.json',roNuts);
emit('sources/nuts-md-2017.json',mdNuts);
const issues={
  missingApprovedAdministrativeGeometry:requiredMissingMD.filter(x=>!all.has('osm-r'+x.osmRelationId)),
  missingTreeParent:missingParents,
  missingAdministrativeParent:administrativeMissingParent,
  hierarchyCycles:cycleIssues,
  statisticalOnlyWithoutGeometry:nodes.filter(x=>x.roles.includes('statistical')&&x.geometryRef===null).map(x=>x.id),
  originalOSMBArchivesNotInBuilder:true
};
emit('actual/validation-v1.json',issues);
const counts={
  RO_admin:admin.RO.length,MD_admin:admin.MD.length,
  RO_stats:nodes.filter(x=>x.country==='RO').reduce((n,x)=>n+x.statisticalRoles.length,0),
  MD_stats:nodes.filter(x=>x.country==='MD').reduce((n,x)=>n+x.statisticalRoles.length,0),
  brețcuOSMId:all.get('siruta-u64096')?.osmRelationId,
  ojdulaOSMId:all.get('osm-r14735731')?.osmRelationId,
  unmatchedRORegistry:admin.RO.filter(x=>x.registry&&!x.registry.matchedSourceRecord).length,
  unmatchedMDRegistry:admin.MD.filter(x=>x.registry&&!x.registry.matchedSourceRecord).length
};
const sources=Object.fromEntries(sourcePaths.map(p=>[p,{sha256:sha(fs.readFileSync(filename(p))),bytes:fs.statSync(filename(p)).size}]));
const ready=issues.missingApprovedAdministrativeGeometry.length===0&&issues.missingTreeParent.length===0&&issues.hierarchyCycles.length===0&&issues.statisticalOnlyWithoutGeometry.length===0&&!issues.originalOSMBArchivesNotInBuilder;
emit('actual/manifest-v1.json',{schema:'atlas-actual-candidate-manifest-v1',status:ready?'ready_for_release':'BLOCKED_INCOMPLETE',sourceSnapshotDate:'2026-10-05',geometrySource:'reviewed legacy ACTUAL from reforma-teritoriala; separate exact OSMB archive cross-check still required',officialSources:{siruta:'2026',cuatm:'2025',nutsRO:'2024',nutsMD:'2017'},counts,inputs:sources,outputs:shaFile,blockingIssues:issues});
console.log(JSON.stringify({status:ready?'ready_for_release':'BLOCKED_INCOMPLETE',counts,issues:{missingApprovedAdministrativeGeometry:issues.missingApprovedAdministrativeGeometry,missingTreeParentCount:issues.missingTreeParent.length,missingAdministrativeParentCount:issues.missingAdministrativeParent.length,hierarchyCycleCount:issues.hierarchyCycles.length,statsMissingGeometryCount:issues.statisticalOnlyWithoutGeometry.length},outputs:shaFile},null,2));
