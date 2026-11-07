// WEB-R4.1 — pure, source-faithful card presentation.
// OSM admin_level, national-register roles and statistical classifications remain independent.
import {resolveTerritorialRoles} from './territoryRoles.mjs';

export function entityCardRoles(entity){
  const resolved=resolveTerritorialRoles(entity);
  const administrative=resolved.administrative.map(role=>Object.freeze({
    level:role.level,
    label:role.level===null?null:'ADM '+role.level,
    basis:role.basis,
    registrySystem:role.registrySystem,
    registryCode:role.registryCode,
    parentRegistryCode:role.parentRegistryCode??null,
    // The only role that describes the actual OSM administrative level.
    isOsmBoundary:role.basis==='OSM'&&role.level!==null&&
      role.level===resolved.cartographic.osmAdminLevel
  }));
  const statistical=resolved.statistical.map(role=>Object.freeze({
    classification:role.classification,
    label:(role.classification==='NUTS'?'NUTS ':'NTS ')+role.level,
    level:role.level,
    code:role.code,
    version:role.version,
    parentCode:role.parentCode
  }));
  return Object.freeze({
    administrative:Object.freeze(administrative),
    statistical:Object.freeze(statistical),
    cartographic:resolved.cartographic
  });
}

// Index by the actual statistical classification AND code.
// Do not infer legal parentage from this lookup; it is used only for
// explicitly recorded statistical parentCode relationships.
export function statisticalCodeIndex(entities){
  const found=new Map(),ambiguous=new Set();
  for(const entity of entities)for(const role of entity.statisticalRoles||[]){
    const key=role.classification+':'+role.code;
    if(found.has(key)){ambiguous.add(key);found.delete(key);}
    else if(!ambiguous.has(key))found.set(key,entity);
  }
  return found;
}
export function verifiedStatisticalParent(index,role){
  if(!role.parentCode)return null;
  return index.get(role.classification+':'+role.parentCode)||null;
}
