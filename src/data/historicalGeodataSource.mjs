/**
 * Read-only adapter for polygons already held in Geodata GIS.
 * Unlike a legal admission, a source-only version may be displayed but never
 * becomes an inferred administrative parent or certified historical boundary.
 */
export const GEODATA_SOURCE_SCHEMA='atlas-historical-geodata-source-import-v1';
export function validateGeodataSourceCatalog(catalog){
 const errors=[];
 const check=(p,m)=>{if(!p)errors.push(m)};
 check(catalog?.schema===GEODATA_SOURCE_SCHEMA,'Wrong Geodata GIS import schema');
 check(catalog?.status==='SOURCE_INTEGRATION_UNCERTIFIED','Unverified source treated as certified');
 const versions=catalog?.versions,assets=catalog?.assets;
 check(Array.isArray(versions)&&Array.isArray(assets),'Geometry versions/assets must exist');
 if(Array.isArray(versions)&&Array.isArray(assets)){
  check(versions.length===catalog.sourcePolygonOccurrences,'Incorrect source version count');
  check(assets.length===catalog.uniqueGeometryAssets,'Incorrect distinct asset count');
  const unique=new Set(assets.map(a=>a.id));
  check(unique.size===assets.length,'Duplicate geometry asset');
  check(new Set(versions.map(v=>v.id)).size===versions.length,'Duplicate version ID');
  for(const v of versions){
   check(unique.has(v.geometryAssetId),'Unknown geometry asset');
   check(v.boundaryCertification==='NOT_CERTIFIED'&&v.sourceStatus==='SOURCE_GEOMETRY_DISPLAY_ONLY','Promoted unverified polygon');
   check(v.administrativeParentStatus==='NOT_QUALIFIED','Inferred administrative parent');
   check(v.sourceFile?.startsWith('ohm/')||v.sourceFile?.startsWith('transilvania-1860/'),'Unexpected source path');
   check(Number.isInteger(v.featureIndex)&&v.featureIndex>=0,'Missing source feature index');
   check(v.period?.kind==='snapshot'||v.period?.kind==='source_interval','Invalid period type');
  }
  for(const a of assets)check(versions.some(v=>v.geometryAssetId===a.id),'Unused physical asset');
 }
 check(catalog?.policies?.legalCertificationNeverInferred===true&&catalog?.policies?.bridgesNotInferred===true
       &&catalog?.policies?.parentHierarchyNotInferred===true,'Missing fail-closed controls');
 return {ok:errors.length===0,errors};
}
export function geodataVersionAttestedAtYear(v,year){
 if(!Number.isInteger(year))return false;
 const p=v.period;
 if(!p)return false;
 if(p.kind==='snapshot')return Number(p.at?.slice(0,4))===year;
 if(p.kind!=='source_interval')return false;
 const start=p.start==null?null:Number(String(p.start).slice(0,4));
 const end=p.end==null?null:Number(String(p.end).slice(0,4));
 // An unbounded source range is not treated as a historically qualified
 // interval; the year filter is a SOURCE-tag selector only.
 return (start===null||year>=start)&&(end===null||year<=end);
}
export function geodataPeriodLabel(v,lang='ro'){
 const p=v.period;
 if(p?.kind==='snapshot')return lang==='ro'?'Atestat în '+p.at.slice(0,4):'Attested in '+p.at.slice(0,4);
 return (p?.start||'?').slice(0,4)+'–'+(p?.end||'?').slice(0,4);
}
export async function loadGeodataSourceCatalog(base='/'){
 const url=base.replace(/\/?$/,'/')+'data/historical/geodata-source/v1/catalog.json';
 const response=await fetch(url);if(!response.ok)throw Error('Geodata catalog HTTP '+response.status);
 const data=await response.json();const qa=validateGeodataSourceCatalog(data);
 if(!qa.ok)throw Error(qa.errors.join('; '));return data;
}
export async function loadGeodataSourceFeature(catalog,entry,base='/'){
 const prefix=base.replace(/\/?$/,'/')+'data/historical/geodata-source/v1/';
 const url=prefix+entry.sourceFile;
 if(!entry.sourceFile||entry.sourceFile.includes('..')||entry.sourceFile.startsWith('/'))throw Error('Unsafe source path');
 const r=await fetch(url);if(!r.ok)throw Error('Geodata source HTTP '+r.status);
 const doc=await r.json();const f=doc?.features?.[entry.featureIndex];
 if(doc.type!=='FeatureCollection'||!['Polygon','MultiPolygon'].includes(f?.geometry?.type))throw Error('Invalid source polygon');
 return {type:'Feature',properties:{...f.properties,atlasHistoricalSourceVersionId:entry.id,
   atlasHistoricalSourceName:entry.name.ro,atlasHistoricalEvidence:'SOURCE_ONLY_NOT_CERTIFIED'},geometry:f.geometry};
}
