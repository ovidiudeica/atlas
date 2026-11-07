// WEB-R3.21: levels are derived from separately resolved role domains.
// A national registry role can be displayed without creating an OSM admin_level.
import {resolveTerritorialRoles} from './territoryRoles.mjs';

export function territorialRoleLabels(entity){
  const roles=resolveTerritorialRoles(entity);
  const stat=roles.statistical.map(r=>(r.classification==='NUTS'?'NUTS ':'NTS ')+r.level);
  const administrative=roles.administrative
    .filter(r=>r.level!==null)
    .map(r=>'ADM '+r.level);
  return Object.freeze([...new Set([...stat,...administrative])]);
}
export function territorialRoleLabel(entity){
  return territorialRoleLabels(entity).join(' · ');
}
export function municipalRoleClarification(entity,lang='ro'){
  if(!resolveTerritorialRoles(entity).administrative.some(r=>r.basis==='SIRUTA'))
    return null;
  return lang==='ro'
    ?'ADM 4 este nivelul OSM real; ADM 8 este rolul municipal SIRUTA, fără geometrie OSM ADM 8 distinctă.'
    :'ADM 4 is the actual OSM level; ADM 8 is a SIRUTA municipal role, without a separate OSM ADM 8 geometry.';
}
