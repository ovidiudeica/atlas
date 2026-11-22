/**
 * HIST-INTEGRATE.1 — immutable, source-qualified Geodata GIS geometry index.
 *
 * Administrative/legal boundary acceptance and presentation availability are
 * deliberately orthogonal. Never infer a direct parent, legal boundary,
 * identity continuity or an ACTUAL polygon from this source index.
 */
export const HISTORICAL_GEODATA_SCHEMA='atlas-geodata-historical-source-index-v1';

const present=x=>typeof x==='string'&&x.length>0;
const object=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const validDate=x=>x===null||(present(x)&&/^\d{3,4}(-\d\d(-\d\d)?)?$/.test(x));
const safeShard=x=>present(x)&&/^ohm-[a-z0-9-]+\.geojson$/.test(x);

export function validateGeodataHistoricalIndex(index){
 const errors=[],fail=(b,msg)=>{if(!b)errors.push(msg)};
 if(!object(index))return {ok:false,errors:['Missing Geodata GIS historical index']};
 fail(index.schema===HISTORICAL_GEODATA_SCHEMA,'Unexpected historical source-index schema');
 fail(index.notCanonicalHierarchy===true&&index.notLegalBoundaryCertification===true,
   'Historical source geometries cannot be certified implicitly');
 fail(index.coordinateReferenceSystem==='EPSG:4326','Source coordinate reference system changed');
 fail(Array.isArray(index.shards)&&index.shards.length>0,'Geometry shards missing');
 const files=new Map();
 for(const shard of index.shards||[]){
   fail(safeShard(shard.file)&&Number.isSafeInteger(shard.count)&&shard.count>0,
     'Malformed or unsafe geometry shard');
   fail(!files.has(shard.file),'Duplicate shard');
   files.set(shard.file,shard.count);
 }
 const duplicates=new Map();
 for(const pair of index.geometryDuplicates||[]){
   const [canonical,alias]=pair;
   fail(present(canonical)&&present(alias)&&canonical!==alias&&!duplicates.has(alias),
     'Duplicate geometry mapping is malformed');
   duplicates.set(alias,canonical);
 }
 const ids=new Set(),geometryIds=new Set(),counts=new Map();
 for(const entry of index.entries||[]){
   fail(present(entry.id)&&!ids.has(entry.id),'Unknown or duplicate historical source ID');
   ids.add(entry.id);
   fail(entry.sourceFamily==='OHM'&&entry.status==='source_candidate_not_certified',
     'Unverified OHM source promoted to legal boundary');
   const canonical=duplicates.get(entry.id)||entry.id;
   fail(entry.geometryId==='geom:'+canonical&&entry.featureId===entry.id,
     'Geometry-use reference lost source identity or unverified sharing');
   geometryIds.add(entry.geometryId);
   fail(object(entry.displayName)&&present(entry.displayName.ro)&&present(entry.displayName.en),
     'Missing historical labels');
   fail(object(entry.sourcePeriod)&&entry.sourcePeriod.sourceOnly===true&&
       validDate(entry.sourcePeriod.start)&&validDate(entry.sourcePeriod.end),
     'Unverified historical date interval rewritten');
   fail(present(entry.sourceDriveFileId)&&present(entry.sourceFilename)&&
        Number.isSafeInteger(entry.sourceRelationId),'Original Drive provenance incomplete');
   fail(files.has(entry.geometryShard),'Geometry shard not in inventory');
   counts.set(entry.geometryShard,(counts.get(entry.geometryShard)||0)+1);
 }
 fail(Array.isArray(index.entries)&&index.entries.length>0,'No historical source records');
 fail(Number.isSafeInteger(index.geometryAssets)&&index.geometryAssets===geometryIds.size &&
      geometryIds.size===ids.size-duplicates.size,
   'Logical geometry assets / source uses not reconciled');
 for(const [alias,canonical] of duplicates){
   fail(ids.has(alias)&&ids.has(canonical)&&!duplicates.has(canonical),
     'Shared geometry mapping points to missing source or cyclic alias');
 }
 for(const [file,count] of files)fail(counts.get(file)===count,'Shard index count mismatch '+file);
 return {ok:errors.length===0,errors};
}

const dateLower=x=>x.length===4?x+'-01-01':x.length===7?x+'-01':x;
const dateUpper=x=>x.length===4?x+'-12-31':x.length===7?x+'-31':x;

/** A source date range with an undocumented end is not extrapolated. */
export function geodataSourceAtDate(entry,iso){
 const p=entry?.sourcePeriod;
 if(!p||!p.start||!p.end||!/^\d{4}-\d\d-\d\d$/.test(iso))return false;
 return iso>=dateLower(p.start)&&iso<=dateUpper(p.end);
}
export function geodataSourcesAtYear(index,year){
 if(!Number.isInteger(year)||year<1||year>9999)return [];
 const begin=String(year).padStart(4,'0')+'-01-01';
 const end=String(year).padStart(4,'0')+'-12-31';
 return (index?.entries||[]).filter(e=>e.sourcePeriod?.start&&e.sourcePeriod?.end&&
   dateLower(e.sourcePeriod.start)<=end&&dateUpper(e.sourcePeriod.end)>=begin);
}

export function validateGeodataGeometryShard(shard,index,file){
 const errors=[];
 if(!object(shard)||shard.type!=='FeatureCollection'||!Array.isArray(shard.features))
   return {ok:false,errors:['Missing source FeatureCollection']};
 if(shard.atlasImport?.schema!=='atlas-geodata-ohm-import-v1'||
    shard.atlasImport?.originalCoordinateGeometryUnmodified!==true ||
    shard.atlasImport?.importStatus!=='SOURCE_GEOMETRY_UNCERTIFIED')
   errors.push('Source provenance or geometry immutability missing');
 const indexed=index?.entries?.filter(e=>e.geometryShard===file)||[];
 if(shard.features.length!==indexed.length)errors.push('Source geometry count differs from index');
 const ids=new Set();
 for(const feature of shard.features){
   const id=feature?.id;
   if(!present(id)||ids.has(id))errors.push('Duplicate or missing OHM geometry ID');
   ids.add(id);
   const entity=indexed.find(e=>e.featureId===id);
   if(!entity||feature?.properties?.ohm_relation_id!==entity.sourceRelationId)
     errors.push('Feature identity disagrees with index');
   if(feature?.type!=='Feature'||!['Polygon','MultiPolygon'].includes(feature?.geometry?.type))
     errors.push('Historical source feature is not a polygon');
   if(feature?.properties?.atlas_historical_boundary_certified!==false)
     errors.push('False source boundary certification');
 }
 return {ok:errors.length===0,errors};
}

export async function loadGeodataSourceIndex(base='/'){
 const url=base+'data/historical/v1/geodata/index.json';
 const response=await fetch(url);
 if(!response.ok)throw Error('Historical Geodata GIS index HTTP '+response.status);
 const index=await response.json();
 const review=validateGeodataHistoricalIndex(index);
 if(!review.ok)throw Error(review.errors.join('; '));
 return index;
}

const cached=new Map();
/** Never loads all geographical shards until the user selects an item. */
export async function loadGeodataSourceFeature(index,entry,base='/'){
 if(!entry||!index?.entries?.some(e=>e.id===entry.id))throw Error('Historical source is not indexed');
 if(!safeShard(entry.geometryShard))throw Error('Unsafe historical geometry source path');
 const cacheKey=base+'data/historical/v1/geodata/'+entry.geometryShard;
 let promise=cached.get(cacheKey);
 if(!promise){
   promise=fetch(cacheKey).then(async res=>{
      if(!res.ok)throw Error('Historical geometry HTTP '+res.status);
      const data=await res.json();
      const qa=validateGeodataGeometryShard(data,index,entry.geometryShard);
      if(!qa.ok)throw Error(qa.errors.join('; '));
      return data;
   });
   cached.set(cacheKey,promise);
 }
 try {
   const data=await promise;
   const feature=data.features.find(f=>f.id===entry.featureId);
   if(!feature)throw Error('Historical source geometry ID is missing');
   return feature;
 }catch(err){cached.delete(cacheKey);throw err}
}
