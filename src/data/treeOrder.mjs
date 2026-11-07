// Stable, presentation-only order of sibling territorial entities.
// Nistrenia has five raions and two independently administered city councils.
// Show the five raions first and the two cities last, alphabetically in the
// currently selected UI language within each group.
import {shortTreeName} from './treeNames.mjs';
import {comparePresentationSiblings} from './treeOverlay.mjs';
export const NISTRIAN_PARENT_ID='osm-r65335';
export const GAGAUZIA_PARENT_ID='osm-r1699032';
export const CHISINAU_PARENT_ID='osm-r1691801';
export const EAST_STAT_PARENT_ID='stat-MD120'; // Statistical, not administrative
export const EAST_BENDER_ADM4_ID='osm-r9581354'; // CUATM 0500
export const EAST_UATSN_ADM4_ID='osm-r2607033'; // CUATM 9800
export const EAST_BENDER_ADM8_CITY_ID='osm-r12463379';

export const NISTRIAN_CITY_COUNCILS=Object.freeze(['osm-r944727','osm-r1702219']);
const cityCouncilIds=new Set(NISTRIAN_CITY_COUNCILS);

// WEB-R3.10 — only display ordering; the three NTS3 regions are NOT
// administrative superiors. Their first item is the seat of the regional
// development agency, not an administrative "regional capital".
export const REGIONAL_SEATS=Object.freeze({
  'stat-MD111':'osm-r58983',    // Nord — Bălți
  'stat-MD112':'osm-r1691800', // Centru — Ialoveni
  'stat-MD113':'osm-r1211126'  // Sud — Cimișlia
});
// Each ADM4 parent already owns its ADM8 children. Priority is an explicitly
// reviewed Atlas ID, never a name match (three districts have homonyms).
// Dubăsari uses Coșnița, the documented seat of its district council,
// distinct from the OSMB admin_centre point located in Cocieri.
export const DISTRICT_SEATS=Object.freeze({
  // Nord — 12 ADM4 units / 315 ADM8 children
  'osm-r59002':'osm-r19034096',   // Briceni
  'osm-r58983':'osm-r12207955',   // Bălți
  'osm-r59007':'osm-r19055801',   // Dondușeni
  'osm-r1693907':'osm-r19068255', // Drochia
  'osm-r59000':'osm-r19038972',   // Edineț
  'osm-r1693560':'osm-r19072252', // Florești
  'osm-r58984':'osm-r10628594',   // Fălești
  'osm-r1693874':'osm-r5736380',  // Glodeni
  'osm-r59005':'osm-r19038433',   // Ocnița
  'osm-r1693908':'osm-r19045242', // Rîșcani
  'osm-r1693523':'osm-r19068370', // Soroca
  'osm-r58996':'osm-r19076878',   // Sîngerei
  // Centru — 13 ADM4 units / 357 ADM8 children
  'osm-r1692078':'osm-r12496849', // Anenii Noi
  'osm-r1692126':'osm-r19090913', // Criuleni
  'osm-r58988':'osm-r19095394',   // Călărași
  'osm-r1692123':'osm-r19013515', // Dubăsari → Coșnița
  'osm-r58991':'osm-r19110250',   // Hîncești
  'osm-r1691800':'osm-r5736377',  // Ialoveni
  'osm-r58990':'osm-r19105113',   // Nisporeni
  'osm-r1692172':'osm-r19082513', // Orhei
  'osm-r1435790':'osm-r19080849', // Rezina
  'osm-r85827':'osm-r19100179',   // Strășeni
  'osm-r58993':'osm-r19082833',   // Telenești
  'osm-r58985':'osm-r7446674',    // Ungheni
  'osm-r1693561':'osm-r19080647', // Șoldănești
  // Sud — 8 ADM4 units / 181 ADM8 children
  'osm-r1104136':'osm-r19113736', // Basarabeasca
  'osm-r1699034':'osm-r19115707', // Cahul
  'osm-r1699022':'osm-r19114022', // Cantemir
  'osm-r1211126':'osm-r19112351', // Cimișlia
  'osm-r65343':'osm-r12459799',   // Căușeni
  'osm-r1699023':'osm-r19314570', // Leova
  'osm-r1699033':'osm-r19118037', // Taraclia
  'osm-r65344':'osm-r1706633'    // Ștefan Vodă
});
const sortedByLocalizedShortName=(a,b,lang)=>
  shortTreeName(a,lang).localeCompare(shortTreeName(b,lang),lang)
  ||a.id.localeCompare(b.id,'en');
const seatFirst=(a,b,seatId,lang)=>
  Number(b.id===seatId)-Number(a.id===seatId)
  ||sortedByLocalizedShortName(a,b,lang);

export function compareTreeSiblings(a,b,view,parentId,lang='ro'){
  const presented=comparePresentationSiblings(a,b,view,parentId,lang);
  if(presented!==null)return presented;
  if(parentId===NISTRIAN_PARENT_ID){
    const aRank=cityCouncilIds.has(a.id)?1:0;
    const bRank=cityCouncilIds.has(b.id)?1:0;
    if(aRank!==bRank)return aRank-bRank;
    const byShortName=shortTreeName(a,lang).localeCompare(shortTreeName(b,lang),lang);
    return byShortName||a.id.localeCompare(b.id,'en');
  }
  // WEB-R3.14 — EAST: the MD120 statistical node groups the existing
  // UATSN (9800) first, Bender (0500) second in the All view. Their
  // canonical parents under Moldova are untouched in Administrative view.
  if(view!=='statistical'){
    if(parentId===EAST_STAT_PARENT_ID){
      const aRank=a.id===EAST_UATSN_ADM4_ID?0:1;
      const bRank=b.id===EAST_UATSN_ADM4_ID?0:1;
      return aRank-bRank||sortedByLocalizedShortName(a,b,lang);
    }
    if(parentId===EAST_BENDER_ADM4_ID)
      return seatFirst(a,b,EAST_BENDER_ADM8_CITY_ID,lang);
    if(parentId===EAST_UATSN_ADM4_ID)
      return sortedByLocalizedShortName(a,b,lang);
  }
  // No statistical-mode changes: geography displayed under a statistical NTS3
  // region in "all", or under canonical ADM4 in "administrative".
  if(view!=='statistical'){
    if(Object.hasOwn(REGIONAL_SEATS,parentId))
      return seatFirst(a,b,REGIONAL_SEATS[parentId],lang);
    if(Object.hasOwn(DISTRICT_SEATS,parentId))
      return seatFirst(a,b,DISTRICT_SEATS[parentId],lang);
  }
  // Original, already-accepted hierarchy ordering is unchanged everywhere else.
  const aStat=a.roles.includes('statistical')&&!a.roles.includes('administrative')?0:1;
  const bStat=b.roles.includes('statistical')&&!b.roles.includes('administrative')?0:1;
  if(aStat!==bStat)return aStat-bStat;
  const aCode=a.statisticalRoles[0]?.code,bCode=b.statisticalRoles[0]?.code;
  if(view!=='administrative'&&aCode&&bCode)
    return aCode.localeCompare(bCode,'en',{numeric:true});
  if((a.adminLevel??0)!==(b.adminLevel??0)&&view==='administrative')
    return (a.adminLevel??0)-(b.adminLevel??0);
  return a.name.localeCompare(b.name,'ro');
}
