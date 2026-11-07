// WEB-R3.9 — presentation-only hierarchy. Never mutate canonical parent IDs.
// OSMB-Moldova 2026-10-05 parents_administrative explicitly records all
// 26 Găgăuzia ADM8 -> ADM5 ancestors (13/9/4).
import {shortTreeName} from './treeNames.mjs';
export const GAGAUZIA_ID='osm-r1699032';
export const CHISINAU_ID='osm-r1691801';
export const CHISINAU_CITY_ID='osm-r1748490';
export const COMRAT_RAION_ID='osm-r1706978';
export const RAION_CHILDREN=Object.freeze({
  'osm-r1706978':Object.freeze([
    'osm-r19118596','osm-r19118598','osm-r19118599','osm-r19118601',
    'osm-r19118602','osm-r19118603','osm-r19118604','osm-r19118606',
    'osm-r19118607','osm-r19118609','osm-r19118610','osm-r19118613','osm-r19118615'
  ]),
  'osm-r1706979':Object.freeze([
    'osm-r19118032','osm-r19118597','osm-r19118600','osm-r19118605',
    'osm-r19118608','osm-r19118611','osm-r19118612','osm-r19118614','osm-r19118616'
  ]),
  'osm-r7103068':Object.freeze([
    'osm-r19117342','osm-r19117343','osm-r19117344','osm-r19117345'
  ])
});
export const SECTOR_IDS=Object.freeze([
  'osm-r1813306','osm-r1813297','osm-r58512','osm-r1813315','osm-r1813316'
]);
const raionIds=new Set(Object.keys(RAION_CHILDREN));
const sectorIds=new Set(SECTOR_IDS);
const raionParent=new Map(Object.entries(RAION_CHILDREN).flatMap(
  ([parent,children])=>children.map(id=>[id,parent])
));

// Chișinău's 5 sector polygons precisely partition the ADM8 city; OSMB
// canonical parents_administrative nevertheless points to ADM4 municipality.
// Their visual nesting under the city is cartographic, NOT legal reparenting.
export function presentationParentId(node,view){
  const source=view==='administrative'?node.administrativeParentId:node.treeParentId;
  if(view==='statistical'||!node.roles.includes('administrative'))return source;
  if(source===GAGAUZIA_ID&&node.adminLevel===8)
    return raionParent.get(node.id)||source;
  if(source===CHISINAU_ID&&node.adminLevel===7&&sectorIds.has(node.id))
    return CHISINAU_CITY_ID;
  return source;
}
function byName(a,b,lang){
  return shortTreeName(a,lang).localeCompare(shortTreeName(b,lang),lang)
    ||a.id.localeCompare(b.id,'en');
}
// null means the existing generic sibling comparator remains authoritative.
export function comparePresentationSiblings(a,b,view,parentId,lang='ro'){
  if(view==='statistical')return null;
  if(parentId===GAGAUZIA_ID){
    const rank=x=>x.id===COMRAT_RAION_ID?0:raionIds.has(x.id)?1:2;
    return rank(a)-rank(b)||byName(a,b,lang);
  }
  if(parentId===CHISINAU_ID){
    const rank=x=>x.id===CHISINAU_CITY_ID?0:1;
    return rank(a)-rank(b)||byName(a,b,lang);
  }
  if(raionIds.has(parentId)||parentId===CHISINAU_CITY_ID)
    return byName(a,b,lang);
  return null;
}
