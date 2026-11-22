/**
 * HIST-INTEGRATE.1b — source-qualified geometric intake into the Historical model.
 * Not the HistoGIS pilot's legal/admission validator. This projection is deliberately
 * read-only, preserves the original source index, and never creates parentage.
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
function periodFor(entry){
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
 * Same data-contract semantics as HistoricalEntity, HistoricalVersion,
 * GeometryAsset and GeometryUse, but strictly source-only. One source record
 * receives one provisional entity ID to avoid inventing continuity across dates.
 * Undated source polygons are retained as geometry assets with a holdout
 * reference and are NOT given an artificial HistoricalPeriod.
 */
export function projectGeodataHistoricalSourceCatalog(index){
  const qa=validateGeodataHistoricalIndex(index);
  if(!qa.ok)throw Error('Geodata historical source index invalid: '+qa.errors.join('; '));
  const entities=[],versions=[],geometryUses=[],undatedGeometryReferences=[];
  const assetById=new Map();
  for(const entry of index.entries){
    let asset=assetById.get(entry.geometryId);
    if(!asset){
      asset={geometryId:entry.geometryId,sourceUseIds:[],geometryStatus:'source_only_not_certified',
        sourceCoordinateHashStatus:'deduplicated_exactly_within_geodata_index',
        historicalBoundaryCertified:false};
      assetById.set(entry.geometryId,asset);
    }
    asset.sourceUseIds.push(entry.id);
    const entityId='geodata:entity:'+entry.id,versionId='geodata:version:'+entry.id;
    entities.push({id:entityId,names:entry.displayName,
      sourceOriginalName:entry.displayName.ro,
      sourceFamily:entry.sourceFamily,sourceId:entry.id,
      identityReviewStatus:'in_review',institutionalContinuityQualified:false});
    const period=periodFor(entry);
    if(!period){
      undatedGeometryReferences.push({sourceId:entry.id,entityId,geometryId:entry.geometryId,
        sourcePeriod:entry.sourcePeriod,reason:'NO_VALID_HISTORICAL_PERIOD',
        evidenceStatus:'in_review'});
      continue;
    }
    versions.push({id:versionId,entityId,geometryId:entry.geometryId,period,
      sourceIds:[entry.id],sourceOriginalType:entry.sourceType||'unknown',
      sourceFamily:entry.sourceFamily,evidenceStatus:'in_review',
      boundaryCertification:'not_certified',periodQualified:false});
    geometryUses.push({useId:'geodata:use:'+entry.id,entityId,versionId,
      geometryId:entry.geometryId,entityName:entry.displayName,period,
      sourceIds:[entry.id],evidenceStatus:'in_review'});
  }
  return {
    schema:SCHEMA,sourceSchema:index.schema,
    sourceOnly:true,legalBoundariesCertified:false,
    entities,versions,geometries:[...assetById.values()],geometryUses,
    undatedGeometryReferences,hierarchy:[],bridge:[],events:[],symbols:[],
    geometryDecisions:[],administrativeParentsQualified:0,
    crossModuleIdentityQualified:0
  };
}

export function federatedHistoricalSourceOverview(pilot,sourceProjection){
  if(!pilot||pilot.schema!=='atlas-historical-pilot-v1'||
     sourceProjection?.schema!==SCHEMA)throw Error('Incompatible Historical source catalogues');
  const pilotGeom=new Set(pilot.geometries.map(x=>x.geometryId));
  for(const geometry of sourceProjection.geometries)
    if(pilotGeom.has(geometry.geometryId))
      throw Error('Cross-source geometry ID collision');
  return {
    schema:'atlas-historical-federated-source-overview-v1',
    histogisEntities:pilot.entities.length,
    histogisVersions:pilot.versions.length,
    histogisGeometries:pilot.geometries.length,
    geodataProvisionalEntities:sourceProjection.entities.length,
    geodataDatedSourceVersions:sourceProjection.versions.length,
    geodataUndatedGeometryReferences:sourceProjection.undatedGeometryReferences.length,
    geodataGeometryAssets:sourceProjection.geometries.length,
    // Not additive boundary certification or proof of any historical institution.
    qualifiedCrossCatalogueIdentityLinks:0,
    coordinateEquivalenceAcrossSources:'not_assessed',
    historicalHierarchyMerge:'prohibited_without_independent_evidence'
  };
}
