// Presentation-only short names for the certified territorial tree.
// Never mutate catalog source, identifiers, parentage, or official names.
const STAT_OVERRIDES = {
  MD11:['Vest','West'], MD12:['Est','East'],
  MD111:['Nord','North'], MD112:['Centru','Centre'], MD113:['Sud','South']
};
// NTS3 shows the geographical name. CUATM 9800 uses OSM's UATSN in
// Romanian, the English government-report abbreviation ATULBD in English.
// The separate de-facto Nistrenia/Pridnestrovie is never relabeled.
const EAST_STAT_LABEL='Transnistria';
const EAST_ADMIN_LABELS=Object.freeze({ro:'UATSN',en:'ATULBD'});
// WEB-R3.12: 44 individually verified UATSN ADM8 council names.
// Key by authentic OSM ID; never rewrite the certified OSMB or CUATM fields.
// One city council (Dubăsari), forty-three village councils. The strings
// were matched to CUATM official records in the frozen 2026-10-05 catalogue.
export const UATSN_RO_SHORT_LABELS=Object.freeze({
  'osm-r7427669':'Vladimirovca', // CUATM 7631
  'osm-r7427680':'Frunză', // 7618
  'osm-r7431238':'Bîcioc', // 5011
  'osm-r7431263':'Parcani', // 7627
  'osm-r7432661':'Crasnogorca', // 5022
  'osm-r7432662':'Teiu', // 5036
  'osm-r7468724':'Blijnii Hutor', // 7610
  'osm-r7468791':'Sucleia', // 7629
  'osm-r8289594':'Caragaș', // 7611
  'osm-r8289727':'Cioburciu', // 7615
  'osm-r8290934':'Nezavertailovca', // 7626
  'osm-r8291057':'Corotna', // 7617
  'osm-r8291058':'Hlinaia', // 7625; homonym of CUATM 5029
  'osm-r8292878':'Tîrnauca', // 7630
  'osm-r8292891':'Mălăiești', // 5030
  'osm-r8292898':'Hruşca', // 1925
  'osm-r8292909':'Ocnița', // 1931
  'osm-r8348605':'Tașlîc', // 5035
  'osm-r8348625':'Butor', // 5013
  'osm-r8348646':'Speia', // 5032
  'osm-r8348909':'Mihailovca', // 6931
  'osm-r8348920':'Harmațca', // 3834
  'osm-r8349002':'Dubău', // 3829
  'osm-r8349059':'Lenin', // 6927
  'osm-r8349093':'Butuceni', // 6915
  'osm-r8349094':'Jura', // 6926
  'osm-r8349307':'Mocra', // 6932
  'osm-r8349338':'Popencu', // 6940
  'osm-r8539525':'Colosova', // 5019
  'osm-r8688504':'Broșteni', // 6914
  'osm-r8710724':'Slobozia-Rașcov', // 1941
  'osm-r8726395':'Șipca', // 5033
  'osm-r9288026':'Carmanova', // 5015
  'osm-r9288110':'Hîrtop', // 5025
  'osm-r9288158':'Dzerjinscoe', // 3831
  'osm-r9288287':'Dubăsari', // 3801; city council
  'osm-r9288722':'Comisarovca Nouă', // 3812
  'osm-r9288756':'Crasnîi Vinogradari', // 3820
  'osm-r9294122':'Ghidirim', // 6921
  'osm-r9656364':'Crasnencoe', // 6918
  'osm-r9656413':'Molochișul Mare', // 6936
  'osm-r9659709':'Cobasna', // 6916
  'osm-r9659794':'Hîrjău', // 6923
  'osm-r9660049':'Ofatinți' // 6937
});
// The Pervomaisc CUATM 7628 source contains the inconsistent "Slobozia"
// name:ro, but official_name and short_name:ro agree on Pervomaisc.
const PERVOMAISC_ID='osm-r8290877';
const POPENCU_ID='osm-r8349338';

const EN_SUFFIX = /\s+(?:District|Municipality|County|Commune|City|Town|Sector)$/iu;
const EN_PREFIX = /^(?:District|Municipality|County|Commune|City|Town)\s+of\s+/iu;
const RO_PREFIX = /^(?:Județul|Judetul|Raionul|Municipiul|Municipalitatea|Orașul|Orasul|Comuna|Districtul)\s+(.+)$/iu;
function comparable(value){
  return String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .toLocaleLowerCase('ro-RO').trim();
}
// WEB-R4.3: the tree intentionally shows «Oraș»/«City» under Chișinău.
// Outside that context, a card, breadcrumb or dialog must name the city
// unambiguously. Source names, OSM IDs and the compact tree are unchanged.
export function cardNameOf(node,lang){
  return node.id==='osm-r1748490'
    ?(lang==='ro'?'Orașul Chișinău':'Chișinău city')
    :shortTreeName(node,lang);
}

export function shortTreeName(node,lang){
  if(node.id==='osm-r90689')return lang==='en'?'Romania':'România';
  if(node.id==='osm-r58974')return 'Moldova';
  // WEB-R3.20: under ADM4 municipality the already-existing ADM8 city
  // is shown as «Oraș» / «City», without repeating «Chișinău» twice.
  // Canonical city identity, names, geometry and lookup aliases remain intact.
  if(node.id==='osm-r1748490')return lang==='ro'?'Oraș':'City';
  if(node.id===PERVOMAISC_ID)return 'Pervomaisc';
  if(lang==='ro'&&Object.hasOwn(UATSN_RO_SHORT_LABELS,node.id))
    return UATSN_RO_SHORT_LABELS[node.id];
  if(lang==='en'&&node.id===POPENCU_ID)return 'Popencu';
  // Căușeni ADM8: show the Romanian geographical name, not the OSMB
  // de-facto council descriptor. English 'Kitskany' and source fields stay intact.
  if(node.id==='osm-r6879649'&&lang==='ro')return 'Chițcani';
  // Two separate city-council relations under Nistrenia have descriptive
  // administrative qualifiers in English; the geographical tree names do not.
  if(node.id==='osm-r1702219'||node.id==='osm-r944727')
    return node.name;
  // One administrative relation and one independent NTS3 statistical entity.
  if(node.id==='osm-r2607033')return EAST_ADMIN_LABELS[lang==='ro'?'ro':'en'];
  if(node.id==='stat-MD120')return EAST_STAT_LABEL;
  const stat=node.statisticalRoles?.[0]?.code;
  if(stat&&STAT_OVERRIDES[stat])return STAT_OVERRIDES[stat][lang==='ro'?0:1];
  const preferred=node.roles?.includes('statistical')&&node.sourceTags?.short_name
    ?node.sourceTags.short_name:(node.shortName?.[lang]||node.name);
  const value=String(preferred||'').trim();
  if(node.roles?.includes('administrative')){
    if(lang==='en'){
      const compact=value.replace(EN_SUFFIX,'').replace(EN_PREFIX,'').trim();
      if(compact)return compact;
    }
    if(lang==='ro'){
      // Only remove a generic administrative type if the remainder matches
      // the separately recorded geographical name. "Satul Nou" is untouched.
      const match=value.match(RO_PREFIX);
      if(match&&comparable(match[1])===comparable(node.name))return match[1];
    }
  }
  return value;
}
