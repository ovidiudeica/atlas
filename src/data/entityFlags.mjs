// Presentation-specific image mapping. No change to administrative or source identity.
const ENTITY_FLAG=Object.freeze({'osm-r65335':'pridnestrovie.svg'});
const COUNTRY_FLAG=Object.freeze({RO:'romania.svg',MD:'moldova.svg'});
export function flagFileForEntity(node){
  if(!node)return null;
  return ENTITY_FLAG[node.id]||COUNTRY_FLAG[node.country]||null;
}
