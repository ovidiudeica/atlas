/**
 * HIST-OHM-TREE.12a — source-neutral extension contract.
 * Existing OHM and RoHGIS remain protected source-specific catalogs.
 * This loader adds independently identified, attributed source views;
 * it never asserts legal boundaries or cross-family identity.
 */
export const SUPPLEMENTAL_SCHEMA='atlas-historical-supplemental-v1';
const BASE='data/historical/v1/supplemental/';
const text=x=>typeof x==='string'&&x.trim().length>0;
const obj=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const sha=x=>typeof x==='string'&&/^[0-9a-f]{64}$/.test(x);
const safe=x=>typeof x==='string'&&/^[a-z0-9][a-z0-9-]*\.geojson$/.test(x);
const https=x=>typeof x==='string'&&/^https:\/\//.test(x);
const date=x=>typeof x==='string'&&/^\d{4}-\d\d-\d\d$/.test(x)&&
  !Number.isNaN(Date.parse(x+'T00:00:00Z'))&&new Date(x+'T00:00:00Z').toISOString().slice(0,10)===x;
const names=x=>obj(x)&&text(x.ro)&&text(x.en);
const rights=c=>obj(c)&&c.license==='CC BY 4.0'&&
  c.licenseUrl==='https://creativecommons.org/licenses/by/4.0/'&&
  text(c.creator)&&text(c.title)&&https(c.url)&&text(c.basis)&&text(c.adaptation);
const yearRange=y=>[String(y).padStart(4,'0')+'-01-01',String(y).padStart(4,'0')+'-12-31'];
const overlap=(s,e,a,b)=>date(s)&&date(e)&&s<=b&&e>=a;
function validPeriod(p){
  if(!obj(p)||p.sourceOnly!==true)return false;
  if(p.kind==='undated')return p.start===null&&p.end===null;
  if(p.kind==='snapshot')return date(p.start)&&p.start===p.end;
  return (p.kind===undefined||p.kind==='interval')&&(p.start===null||date(p.start))&&
    (p.end===null||date(p.end))&&(p.start!==null||p.end!==null)&&
    (p.start===null||p.end===null||p.start<=p.end);
}
export function supplementalEntryAtYear(entry,year){
  if(!Number.isInteger(year)||year<1||year>9999||!validPeriod(entry?.sourcePeriod))return false;
  const [a,b]=yearRange(year),p=entry.sourcePeriod;
  return overlap(p.start,p.end,a,b);
}
export function validateSupplementalCatalog(data){
  const errors=[],bad=m=>errors.push(m);
  if(!obj(data)||data.schema!==SUPPLEMENTAL_SCHEMA||data.sourceOnly!==true||
    data.legalBoundariesCertified!==false||data.crs!=='EPSG:4326')
    return {ok:false,errors:['Invalid supplemental source catalogue']};
  for(const key of ['collections','geometryShards','assets','entries','relations'])
    if(!Array.isArray(data[key]))bad('Missing '+key);
  if(errors.length)return {ok:false,errors};
  const unique=(rows,key,label)=>{
    const m=new Map();
    for(const x of rows){
      if(!obj(x)||!text(x[key])||m.has(x[key]))bad('Duplicate or missing '+label);
      else m.set(x[key],x);
    }
    return m;
  };
  const collections=unique(data.collections,'id','collection'),shards=unique(data.geometryShards,'file','shard'),
    assets=unique(data.assets,'id','asset'),entries=unique(data.entries,'id','version');
  unique(data.relations,'id','relation');
  for(const c of collections.values()){
    if(!/^[a-z0-9-]+$/.test(c.id)||!text(c.sourceFamily)||['OHM','ROHGIS'].includes(c.sourceFamily)||
      !names(c.name)||!rights(c.citation)||!obj(c.regions)||!Object.keys(c.regions).length||
      !Object.values(c.regions).every(names))bad('Invalid source or reuse attribution: '+c.id);
  }
  const counts=new Map(),used=new Set(),hashes=new Set(),featureKeys=new Set();
  for(const a of assets.values()){
    if(!safe(a.shard)||!shards.has(a.shard)||!text(a.featureId)||!sha(a.canonicalHash)||a.sourceOnly!==true)
      bad('Invalid asset '+a.id);
    if(hashes.has(a.canonicalHash))bad('Exact asset hash repeated: '+a.id);
    hashes.add(a.canonicalHash);
    const featureKey=a.shard+'|'+a.featureId;
    if(featureKeys.has(featureKey))bad('Duplicate asset feature');
    featureKeys.add(featureKey);
    counts.set(a.shard,(counts.get(a.shard)||0)+1);
  }
  for(const s of shards.values()){
    if(!safe(s.file)||!Number.isInteger(s.count)||s.count<1||s.count!==counts.get(s.file))
      bad('Shard inventory mismatch: '+s.file);
  }
  for(const e of entries.values()){
    const c=collections.get(e.collectionId),a=assets.get(e.geometryId);
    if(!c||e.sourceFamily!==c.sourceFamily||!Object.hasOwn(c.regions,e.region)||
      e.sourceAdapter!=='supplemental'||e.status!=='source_candidate_not_certified'||
      !text(e.entityId)||!text(e.sourceGroup)||!names(e.displayName)||!validPeriod(e.sourcePeriod)||
      !text(e.sourceType)||!text(e.sourceExternalId)||!text(e.sourcePath)||!text(e.sourceFilename)||
      !sha(e.sourceFileSha256)||e.geometryValidSource!==true||e.sourceRelationId!==null||
      !text(e.provenance)||!Array.isArray(e.sourceTagWarnings)||
      !rights(e.sourceCitation)||e.sourceCitation.url!==c.citation.url||
      e.sourceCitation.creator!==c.citation.creator||!Array.isArray(e.sourceCitation.sourceUrls)||
      !e.sourceCitation.sourceUrls.length||!e.sourceCitation.sourceUrls.every(https))
      bad('Invalid source version or rights: '+e.id);
    if(!a||a.featureId!==e.featureId||a.shard!==e.geometryShard)
      bad('Version asset reference invalid: '+e.id);
    used.add(e.geometryId);
  }
  if(used.size!==assets.size||!data.entries.length)bad('Unused or missing geometry assets');
  for(const r of data.relations){
    const p=entries.get(r.parentId),c=entries.get(r.childId);
    if(!p||!c||p.id===c.id||p.collectionId!==c.collectionId||p.region!==c.region||
      r.sourceOnly!==true||r.qualifiedHistoricalParentage!==false||
      typeof r.topologicalReviewRequired!=='boolean'||!date(r.start)||!date(r.end)||r.start>r.end||
      !Number.isFinite(r.outsideParentPercent)||r.outsideParentPercent<0||r.outsideParentPercent>100||
      !Array.isArray(r.sourceUrls)||!r.sourceUrls.length||!r.sourceUrls.every(https)||
      ![p,c].every(v=>validPeriod(v.sourcePeriod)&&date(v.sourcePeriod.start)&&date(v.sourcePeriod.end)&&
        v.sourcePeriod.start<=r.start&&v.sourcePeriod.end>=r.end))
      bad('Invalid source relation: '+r.id);
  }
  return {ok:errors.length===0,errors:[...new Set(errors)]};
}
export function validateSupplementalShard(data,catalog,file){
  const errors=[];
  if(!safe(file)||!catalog.geometryShards.some(s=>s.file===file)||
    data?.type!=='FeatureCollection'||!Array.isArray(data.features))
    return {ok:false,errors:['Invalid supplemental geometry shard']};
  const assets=catalog.assets.filter(a=>a.shard===file);
  const byFeature=new Map(assets.map(a=>[a.featureId,a])),seen=new Set();
  if(assets.length!==data.features.length)errors.push('Geometry asset count mismatch');
  for(const f of data.features){
    const a=byFeature.get(f?.id);
    if(!a||seen.has(f.id)||f.type!=='Feature'||!['Polygon','MultiPolygon'].includes(f.geometry?.type)||
      f.properties?.geometryId!==a.id||f.properties?.canonicalHash!==a.canonicalHash||
      f.properties?.boundaryCertification!=='not_certified')
      errors.push('Unindexed, repeated or falsely certified geometry: '+f?.id);
    seen.add(f?.id);
  }
  return {ok:errors.length===0,errors};
}
export async function loadSupplementalCatalog(base='/'){
  const response=await fetch(base+BASE+'index.json');
  if(!response.ok)throw Error('Supplemental historical catalogue HTTP '+response.status);
  const data=await response.json(),qa=validateSupplementalCatalog(data);
  if(!qa.ok)throw Error(qa.errors.join('; '));
  return data;
}
const cache=new Map();
export async function loadSupplementalFeature(catalog,entry,base='/'){
  const canonical=catalog?.entries.find(e=>e.id===entry?.id);
  if(!canonical||canonical.geometryId!==entry.geometryId||!safe(canonical.geometryShard))
    throw Error('Supplemental version not indexed');
  const url=base+BASE+canonical.geometryShard;
  let task=cache.get(url);
  if(!task){
    task=fetch(url).then(async r=>{
      if(!r.ok)throw Error('Supplemental geometry HTTP '+r.status);
      const d=await r.json(),qa=validateSupplementalShard(d,catalog,canonical.geometryShard);
      if(!qa.ok)throw Error(qa.errors.join('; '));
      return d;
    });
    cache.set(url,task);
  }
  try{
    const data=await task,f=data.features.find(f=>f.id===canonical.featureId);
    if(!f)throw Error('Supplemental source asset missing');
    return f;
  }catch(e){cache.delete(url);throw e;}
}
/**
 * Browse source associations only. A candidate edge is displayed if it
 * intersects the selected calendar year, is unique for its child in
 * that year, and has passed the source spatial sanity check. Uncertain
 * parents, cyclic edges and conflicts stay in the register, not the tree.
 * No folder name, parent overlap or ancestor list establishes legal membership.
 */
export function buildSupplementalTree(catalog,year,yearOnly=false,query=''){
  if(!catalog||!Number.isInteger(year)||year<1||year>9999)return [];
  const [a,b]=yearRange(year);
  const fold=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase();
  const term=fold(query.trim());
  const selected=catalog.entries.filter(e=>!yearOnly||supplementalEntryAtYear(e,year));
  const nodes=new Map(selected.map(entry=>[entry.id,{entry,children:[],parent:null}]));
  const annual=catalog.relations.filter(r=>overlap(r.start,r.end,a,b));
  const byChild=new Map();
  for(const r of annual){
    const list=byChild.get(r.childId)||[];list.push(r);byChild.set(r.childId,list);
  }
  const links=new Map();
  for(const [child,list] of byChild){
    if(list.length!==1)continue;
    const r=list[0];
    if(r.topologicalReviewRequired||r.outsideParentPercent>0.1||
       !nodes.has(child)||!nodes.has(r.parentId))continue;
    links.set(child,r);
  }
  for(const [child,r] of links){
    const seen=new Set([child]);
    let cursor=r.parentId,cyclic=false;
    while(links.has(cursor)){
      if(seen.has(cursor)){cyclic=true;break;}
      seen.add(cursor);cursor=links.get(cursor).parentId;
    }
    if(!cyclic){nodes.get(child).parent=r;nodes.get(r.parentId).children.push(nodes.get(child));}
  }
  const order=(x,y)=>x.entry.displayName.ro.localeCompare(y.entry.displayName.ro,'ro')||
    String(x.entry.sourcePeriod.start).localeCompare(String(y.entry.sourcePeriod.start))||
    x.entry.id.localeCompare(y.entry.id);
  function filter(node,inherited){
    const e=node.entry;
    const matches=inherited||!term||[e.displayName.ro,e.displayName.en,e.sourceType,e.sourceGroup,
      e.sourceExternalId,e.sourcePeriod.start,e.sourcePeriod.end,e.id].some(x=>fold(x).includes(term));
    const children=node.children.map(n=>filter(n,matches)).filter(Boolean).sort(order);
    return matches||children.length?{...node,children}:null;
  }
  return catalog.collections.map(collection=>{
    const groups=Object.entries(collection.regions).map(([id,name])=>{
      const inherited=!!term&&[collection.name.ro,collection.name.en,name.ro,name.en].some(s=>fold(s).includes(term));
      const roots=[...nodes.values()].filter(n=>!n.parent&&n.entry.collectionId===collection.id&&n.entry.region===id)
        .map(n=>filter(n,inherited)).filter(Boolean).sort(order);
      return {id,name,roots};
    }).filter(g=>g.roots.length);
    return {collection,groups};
  }).filter(x=>x.groups.length);
}
