/**
 * HIST-OHM-CORE.1 — read-only OHM projection into Historical entity/version/
 * geometry-use semantics. Folder grouping is only a candidate identity;
 * institutional continuity, parentage and legal borders are NOT certified.
 * HistoGIS is deliberately excluded and reserved for final gap completion.
 */
import {validateHistoricalPeriod} from './historicalAdminBridge.mjs';
import {validateGeodataHistoricalIndex} from './historicalGeodata.mjs';

const SCHEMA='atlas-historical-geodata-temporal-projection-v1';
const parseDate=x=>{
  if(x===null)return null;
  const m=/^(\d{3,4})(?:-(\d\d))?(?:-(\d\d))?$/.exec(x);
  if(!m)return null;
  const d={year:Number(m[1])};
  if(m[2])d.month=Number(m[2]);
  if(m[3])d.day=Number(m[3]);
  return d;
};
function sourcePeriod(entry){
  const p=entry.sourcePeriod;
  if(p.kind==='undated')return null;
  if(p.kind==='snapshot'){
    const at=parseDate(p.start);
    const value=at&&{kind:'snapshot',at};
    return value&&validateHistoricalPeriod(value)?value:null;
  }
  const value={kind:'interval',start:parseDate(p.start),end:parseDate(p.end)};
  return validateHistoricalPeriod(value)?value:null;
}

/**
 * One provisional entity per editorial source directory, NOT per geometry.
 * Source relation IDs remain one-to-one with source HistoricalVersion records.
 * No parent-child relation or documented institutional continuity is inferred
 * from directory grouping.
 */
export function projectGeodataHistoricalSourceCatalog(index){
  const qa=validateGeodataHistoricalIndex(index);
  if(!qa.ok)throw Error('OHM historical index invalid: '+qa.errors.join('; '));
  if(index.entries.some(e=>e.sourceFamily!=='OHM'))
    throw Error('Only OHM may enter HIST-OHM-CORE.1');
  const entities=[],versions=[],geometryUses=[],undatedGeometryReferences=[];
  const groups=new Map(),assets=new Map();
  for(const entry of index.entries){
    const entityId='ohm:provisional-entity:'+encodeURIComponent(entry.sourceGroup);
    if(!groups.has(entry.sourceGroup)){
      const entity={id:entityId,names:entry.displayName,
        sourceOriginalName:entry.displayName.ro,sourceFamily:'OHM',
        sourceGroup:entry.sourceGroup,groupingBasis:'editorial_directory_only',
        identityReviewStatus:'in_review',institutionalContinuityQualified:false,
        boundaryCertification:'not_certified'};
      groups.set(entry.sourceGroup,entity);
      entities.push(entity);
    }
    let asset=assets.get(entry.geometryId);
    if(!asset){
      asset={geometryId:entry.geometryId,sourceUseIds:[],
        geometryStatus:'source_only_not_certified',
        sourceCoordinateHashStatus:'deduplicated_exactly_within_ohm_index',
        historicalBoundaryCertified:false};
      assets.set(entry.geometryId,asset);
    }
    asset.sourceUseIds.push(entry.id);
    const versionId='ohm:version:'+entry.id;
    const period=sourcePeriod(entry);
    if(!period){
      undatedGeometryReferences.push({sourceId:entry.id,entityId,
        geometryId:entry.geometryId,sourcePeriod:entry.sourcePeriod,
        reason:'NO_VALID_HISTORICAL_PERIOD',evidenceStatus:'in_review'});
      continue;
    }
    versions.push({id:versionId,entityId,geometryId:entry.geometryId,
      period,sourceIds:[entry.id],sourceOriginalType:entry.sourceType||'unknown',
      sourceFamily:'OHM',evidenceStatus:'in_review',
      boundaryCertification:'not_certified',periodQualified:false});
    geometryUses.push({useId:'ohm:use:'+entry.id,entityId,versionId,
      geometryId:entry.geometryId,entityName:entry.displayName,period,
      sourceIds:[entry.id],evidenceStatus:'in_review'});
  }
  return {schema:SCHEMA,sourceSchema:index.schema,sourceFamilies:['OHM'],
    sourceOnly:true,legalBoundariesCertified:false,
    entities,versions,geometries:[...assets.values()],geometryUses,
    undatedGeometryReferences,hierarchy:[],bridge:[],events:[],symbols:[],
    geometryDecisions:[],administrativeParentsQualified:0,
    crossModuleIdentityQualified:0};
}
