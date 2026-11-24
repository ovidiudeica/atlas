/**
 * HIST-OHM-TREE.4 — verified source-only RoHGIS 1930 adapter.
 * OHM source versions, institutional identity and legal boundaries remain distinct.
 */
export const ROHGIS_1930_SCHEMA='hist-ohm-tree4-rohgis-1930-catalog-v1';
const safeShard=path=>typeof path==='string'&&/^geom\/(judete|plasi)-\d{2}\.geojson$/.test(path);
const isObject=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const sha=x=>typeof x==='string'&&/^[0-9a-f]{64}$/.test(x);
export function validateRohgis1930Catalog(data){
  const errors=[];
  if(!isObject(data)||data.schema!==ROHGIS_1930_SCHEMA||
     data.sourceFamily!=='ROHGIS'||data.admittedSnapshot!=='1930'||
     data.yearFilterRestriction!=='ONLY_1930'||
     data.historicalLegalBoundariesCertified!==false)
    return {ok:false,errors:['Invalid or uncertified RoHGIS catalogue']};
  if(!Array.isArray(data.versions)||data.versions.length!==565)
    errors.push('RoHGIS source version count is not 565');
  if(!Array.isArray(data.geometryShards)||data.geometryShards.length<1)
    errors.push('RoHGIS geometry shards not indexed');
  const counts=new Map(),hashes=new Map();
  for(const part of data.geometryShards||[]){
    if(!safeShard(part.path)||counts.has(part.path)||!Number.isInteger(part.count)||
       part.count<1||!sha(part.sha256)) errors.push('Malformed or duplicate RoHGIS shard');
    counts.set(part.path,part.count);hashes.set(part.path,part.sha256);
  }
  const ids=new Set(),assets=new Set(),counted=new Map(),countKind=new Map();
  const counties=new Set((data.versions||[]).filter(v=>v.kind==='judet').map(v=>v.entityId));
  for(const v of data.versions||[]){
    if(!v||typeof v.entityId!=='string'||ids.has(v.entityId))
      errors.push('Missing or duplicate RoHGIS entity ID');
    ids.add(v?.entityId);
    if(!((v.kind==='judet'&&v.sourceRank===undefined)||(v.kind==='plasa'&&v.sourceRank==='II')||(v.kind==='urban_unit'&&v.sourceRank==='III')))errors.push('Invalid RoHGIS kind/source rank');
    countKind.set(v.kind,(countKind.get(v.kind)||0)+1);
    if(typeof v.geometryId!=='string'||!/^rohgis:geom:[0-9a-f]{24}$/.test(v.geometryId))
      errors.push('Bad RoHGIS shared-geometry identifier');
    assets.add(v.geometryId);
    if(typeof v.versionId!=='string'||v.versionId!==v.entityId+':version:1930'||
       v.start!=='1930-01-01'||v.end!=='1930-12-31'||
       v.temporalStatus!=='DOCUMENTARY_1930_SNAPSHOT_ONLY')
      errors.push('RoHGIS geometry may be presented only for reference year 1930');
    if(v.boundaryCertified!==false||v.crossFamilyIdentityCertified!==false)
      errors.push('RoHGIS source falsely certified');
    if(!safeShard(v.geometryShard)||!counts.has(v.geometryShard))
      errors.push('Version references an unindexed RoHGIS shard');
    counted.set(v.geometryShard,(counted.get(v.geometryShard)||0)+1);
    if(v.kind!=='judet'&&!counties.has(v.parentId))
      errors.push('Subunit without source-reported county parent: '+v.entityId);
    if(v.kind==='judet'&&v.parentId!==data.documentaryStateRoot)
      errors.push('County parent must be the documented state root');
    if(!sha(v.sourceHashSha256)||typeof v.sourceDriveFileId!=='string')
      errors.push('Missing source hash or source identifier');
  }
  if(countKind.get('judet')!==71||countKind.get('plasa')!==322||countKind.get('urban_unit')!==172)
    errors.push('Incorrect number of RoHGIS county or plasa entities');
  if(assets.size!==data.geometryAssetCount||assets.size!==565||
     data.duplicateGeometryUses?.length!==0)
    errors.push('Unverified or inexact RoHGIS geometry sharing');
  for(const [path,count] of counts)if(counted.get(path)!==count)
    errors.push('RoHGIS shard count mismatch: '+path);
  return {ok:errors.length===0,errors:[...new Set(errors)]};
}
export function rohgis1930VersionsAtYear(catalog,year){
  return year===1930?catalog.versions:[];
}
export function toRohgisGeodataEntry(v){
  const isCounty=v.kind==='judet';
  const isUrban=v.kind==='urban_unit';
  return {
    id:v.versionId,sourceFamily:'ROHGIS',sourceGroup:'RoHGIS/'+(isCounty?'Județe':isUrban?'Unități urbane':'Plăși')+' 1930/'+v.nameRo,
    displayName:{ro:v.nameRo,en:v.nameRo},
    sourcePeriod:{start:v.start,end:v.end,kind:'snapshot',sourceOnly:true,notes:'RoHGIS 1930 only; boundaries unverified independently'},
    sourceType:isCounty?'județ':isUrban?'unitate urbană':'plasă',...(isCounty?{}:{sourceRank:v.sourceRank}),geometryId:v.geometryId,
    featureId:v.entityId,geometryShard:v.geometryShard,
    sourceDriveFileId:v.sourceDriveFileId,
    sourcePath:'Geodata GIS/RoHGIS/'+(isCounty?'Limitele județelor existente între anii 1929-1938':'Limitele plășilor din perioada 1929-1933'),
    sourceFileSha256:v.sourceHashSha256,
    geometryValidSource:true,
    sourceFilename:isCounty?'rohgis_judete_1930.gpkg':'rohgis_plasi_1929_1933.gpkg',
    sourceRelationId:null,sourceExternalId:v.sourceRecordId,provenance:'RoHGIS; derived EPSG:4326 web view from EPSG:3844 source',
    status:'source_candidate_not_certified',sourceTagWarnings:[]
  };
}
export async function loadRohgis1930Catalog(base='/'){
  const response=await fetch(base+'data/historical/v1/rohgis/catalog-1930.json');
  if(!response.ok)throw Error('RoHGIS 1930 catalogue HTTP '+response.status);
  const data=await response.json();
  const result=validateRohgis1930Catalog(data);
  if(!result.ok)throw Error('RoHGIS 1930 catalogue invalid: '+result.errors.join('; '));
  return data;
}
const cached=new Map();
export async function loadRohgis1930Feature(catalog,version,base='/'){
  if(!catalog||!version||!catalog.versions.some(v=>v.versionId===version.versionId))
    throw Error('RoHGIS entity is not indexed');
  if(!safeShard(version.geometryShard))throw Error('Unsafe RoHGIS geometry filename');
  const url=base+'data/historical/v1/rohgis/'+version.geometryShard;
  let task=cached.get(url);
  if(!task){
    task=fetch(url).then(async res=>{
      if(!res.ok)throw Error('RoHGIS geometry HTTP '+res.status);
      const coll=await res.json();
      if(coll?.type!=='FeatureCollection'||coll?.metadata?.schema!=='hist-ohm-tree4-rohgis-geometry-shard-v1'||
         coll?.metadata?.crs!=='EPSG:4326'||coll?.metadata?.sourceCRS!=='EPSG:3844'||
         coll?.metadata?.legalBoundariesCertified!==false||
         !Array.isArray(coll.features))throw Error('RoHGIS geometry lacks source/CRS guarantees');
      const shard=catalog.geometryShards.find(s=>s.path===version.geometryShard);
      if(coll.features.length!==shard?.count)throw Error('RoHGIS shard count mismatch');
      const indexed=new Map(catalog.versions.filter(v=>v.geometryShard===version.geometryShard)
        .map(v=>[v.entityId,v]));
      for(const f of coll.features){
        const v=indexed.get(f?.id);
        if(!v||f?.type!=='Feature'||!['Polygon','MultiPolygon'].includes(f?.geometry?.type)||
           f.properties?.atlasHistoricalBoundaryCertified!==false||
           f.properties?.atlasHistoricalGeometryId!==v.geometryId||
           f.properties?.parentEntityId!==v.parentId)
          throw Error('RoHGIS feature, geometry alias or parent evidence differs from catalogue');
      }
      return coll;
    });
    cached.set(url,task);
  }
  try{
    const data=await task;
    const feature=data.features.find(f=>f.id===version.entityId);
    if(!feature)throw Error('RoHGIS 1930 feature missing from shard');
    return feature;
  }catch(err){cached.delete(url);throw err}
}
