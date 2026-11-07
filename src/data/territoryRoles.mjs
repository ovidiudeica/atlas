// WEB-R3.19a — read-only presentation roles, never a canonical catalog migration.
// Geometry and OSM admin_level belong to the cartographic role exclusively.
export const BUCHAREST_ATLAS_ID='osm-r377733';
export const BUCHAREST_SIRUTA_ROLES=Object.freeze({
  county:Object.freeze({code:'403',level:4}),
  municipal:Object.freeze({code:'179132',level:8,parentCode:'403'})
});
export function resolveTerritorialRoles(entity){
  const statistical=(entity.statisticalRoles||[]).map(role=>Object.freeze({
    kind:'statistical',classification:role.classification,version:role.version,
    code:role.code,level:role.level,parentCode:role.parentCode??null,
    source:entity.statisticalSourceTags||null
  }));
  const administrative=[];
  if(entity.roles?.includes('administrative')){
    administrative.push(Object.freeze({
      kind:'administrative',basis:'OSM',level:entity.adminLevel??null,
      registrySystem:entity.registry?.system??null,
      registryCode:entity.registry?.code??null,
      parentAtlasId:entity.administrativeParentId??null,
      recordMatched:entity.registry?.matchedSourceRecord??false
    }));
  }
  // National-register *role*, not a new Atlas entity/OSM level/geometry.
  // SIRUTA 403 and 179132 have different administrative register meanings.
  if(entity.id===BUCHAREST_ATLAS_ID){
    administrative.push(Object.freeze({
      kind:'administrative',basis:'SIRUTA',level:BUCHAREST_SIRUTA_ROLES.municipal.level,
      registrySystem:'SIRUTA',registryCode:BUCHAREST_SIRUTA_ROLES.municipal.code,
      parentRegistryCode:BUCHAREST_SIRUTA_ROLES.municipal.parentCode,
      parentAtlasId:null,recordMatched:null
    }));
  }
  return Object.freeze({
    statistical:Object.freeze(statistical),
    administrative:Object.freeze(administrative),
    cartographic:Object.freeze({
      kind:'cartographic',osmRelationId:entity.osmRelationId??null,
      osmAdminLevel:entity.adminLevel??null,geometryShard:entity.geometryShard??null,
      geometrySource:entity.geometrySource??'OSM-Boundaries',
      sourceSnapshotDate:'2026-10-05',
      spatialRelationsAreNotLegalParentage:true
    })
  });
}
