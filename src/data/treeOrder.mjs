// Stable, presentation-only order of sibling territorial entities.
// WEB-R3.17: Moldova siblings use statistical code first (including dual-role
// units), then CUATM code for administrative entities. No cross-parent moves.
// WEB-R3.18: Nistrenia's seven uncoded ADM5 children follow published PMR
// cadastral codes associated with their seats.
// WEB-R3.19b: Romania siblings use NUTS1/2/3 first, then numeric SIRUTA.
import {shortTreeName} from './treeNames.mjs';
import {comparePresentationSiblings} from './treeOverlay.mjs';
import {PMR_CADASTRAL_ORDER,pmrCadastralSeatCode} from './pmrCadastral.mjs';
export const NISTRIAN_PARENT_ID='osm-r65335';
export const GAGAUZIA_PARENT_ID='osm-r1699032';
export const CHISINAU_PARENT_ID='osm-r1691801';
export const WEST_STAT_PARENT_ID='stat-MD11'; // NTS2 West; presentation sibling order only
export const EAST_STAT_PARENT_ID='stat-MD120'; // Statistical, not administrative
export const EAST_BENDER_ADM4_ID='osm-r9581354'; // CUATM 0500
export const EAST_UATSN_ADM4_ID='osm-r2607033'; // CUATM 9800
export const EAST_BENDER_ADM8_CITY_ID='osm-r12463379';

export const NISTRIAN_CITY_COUNCILS=Object.freeze(['osm-r944727','osm-r1702219']);
// The exact seven ADM5 child IDs, ordered by their associated cadastral
// seat-code (32,33,40,45,55,57,66), not by technical OSM relation ID.
// Source and matching limitations live in pmrCadastral.mjs.
export const NISTRIAN_CHILD_ORDER=PMR_CADASTRAL_ORDER;

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

// Returns null only when BOTH nodes have neither a statistical code nor a
// CUATM code. A coded node sorts before an uncoded administrative sibling.
// This works with mixed statistical/admin siblings: MD114/MD115 have both,
// and must be ordered by MD114/MD115, NOT their CUATM 9600/0100.
// Code collisions are resolved deterministically using the next code, then ID.
export function compareMoldovaSiblingCodes(a,b){
  const statA=a.statisticalRoles?.[0]?.code||null;
  const statB=b.statisticalRoles?.[0]?.code||null;
  const cuatmA=a.registry?.system==='CUATM'&&a.registry.code?a.registry.code:null;
  const cuatmB=b.registry?.system==='CUATM'&&b.registry.code?b.registry.code:null;
  if(statA||statB){
    if(!statA||!statB)return statA?-1:1;
    const byStat=statA.localeCompare(statB,'en');
    if(byStat)return byStat;
    if(cuatmA||cuatmB){
      if(!cuatmA||!cuatmB)return cuatmA?-1:1;
      const byCu=cuatmA.localeCompare(cuatmB,'en');
      if(byCu)return byCu;
    }
    return a.id.localeCompare(b.id,'en');
  }
  if(cuatmA||cuatmB){
    if(!cuatmA||!cuatmB)return cuatmA?-1:1;
    return cuatmA.localeCompare(cuatmB,'en')||a.id.localeCompare(b.id,'en');
  }
  return null;
}

// Compare only within the already supplied sibling group. NUTS precedes
// SIRUTA, including dual-role RO321 (București) and the counties. Never
// compare the OSM relation IDs or infer a classification from OSM admin_level.
export function compareRomaniaSiblingCodes(a,b){
  const nutsA=a.statisticalRoles?.find(r=>r.classification==='NUTS')?.code||null;
  const nutsB=b.statisticalRoles?.find(r=>r.classification==='NUTS')?.code||null;
  const sirA=a.registry?.system==='SIRUTA'&&a.registry?.code?a.registry.code:null;
  const sirB=b.registry?.system==='SIRUTA'&&b.registry?.code?b.registry.code:null;
  if(nutsA||nutsB){
    if(!nutsA||!nutsB)return nutsA?-1:1;
    const n=nutsA.localeCompare(nutsB,'en',{numeric:true});
    if(n)return n;
  }
  if(sirA||sirB){
    if(!sirA||!sirB)return sirA?-1:1;
    const numeric=/^[0-9]+$/;
    const n=numeric.test(sirA)&&numeric.test(sirB)
      ?(BigInt(sirA)<BigInt(sirB)?-1:BigInt(sirA)>BigInt(sirB)?1:0)
      :sirA.localeCompare(sirB,'en',{numeric:true});
    if(n)return n;
  }
  return nutsA||nutsB||sirA||sirB?a.id.localeCompare(b.id,'en'):null;
}

export function compareTreeSiblings(a,b,view,parentId,lang='ro'){
  if(a.country==='RO'&&b.country==='RO'){
    const byOfficialCodes=compareRomaniaSiblingCodes(a,b);
    if(byOfficialCodes!==null)return byOfficialCodes;
  }
  if(a.country==='MD'&&b.country==='MD'){
    const byOfficialCodes=compareMoldovaSiblingCodes(a,b);
    if(byOfficialCodes!==null)return byOfficialCodes;
  }
  const presented=comparePresentationSiblings(a,b,view,parentId,lang);
  if(presented!==null)return presented;
  if(parentId===NISTRIAN_PARENT_ID&&view!=='statistical'){
    const aCode=pmrCadastralSeatCode(a.id);
    const bCode=pmrCadastralSeatCode(b.id);
    if(aCode&&bCode)return aCode.localeCompare(bCode,'en')||a.id.localeCompare(b.id,'en');
    if(aCode||bCode)return aCode?-1:1;
    // No invented codes for unexpected future Nistrenia children.
    return sortedByLocalizedShortName(a,b,lang);
  }
  // Fallback only for uncoded siblings: prior seat/raion presentation rules
  // remain available where no statistical or CUATM code can distinguish them.
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
