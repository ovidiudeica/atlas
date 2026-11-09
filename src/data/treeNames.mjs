// Presentation-only short names for the certified territorial tree.
// Never mutate catalog source, identifiers, parentage, or official names.
const STAT_OVERRIDES = {
  MD11:['Vest','West'], MD12:['Est','East'],
  MD111:['Nord','North'], MD112:['Centru','Centre'], MD113:['Sud','South']
};
// Reviewed English display labels for the Romanian NUTS 1/2 regions.
// These are presentation translations, NOT replacements for Eurostat names,
// OSM tags or Romanian official identities. NUTS 3 counties remain toponyms.
const EN_NUTS_DISPLAY=Object.freeze({
  RO1:'Macroregion One',RO2:'Macroregion Two',
  RO3:'Macroregion Three',RO4:'Macroregion Four',
  RO11:'North-West',RO12:'Centre',
  RO21:'North-East',RO22:'South-East',
  RO31:'South-Muntenia',RO32:'Bucharest-Ilfov',
  RO41:'South-West Oltenia',RO42:'West'
});
// Reviewed English exonyms / Atlas editorial exceptions, keyed by stable ID.
// Everywhere else use the source English form where available, then the
// unchanged local toponym with Romanian diacritics removed for EN display.
const EN_ENTITY_DISPLAY=Object.freeze({
  'osm-r377733':'Bucharest',
  'osm-r1699032':'Gagauzia',
  'osm-r1691801':'Chisinau',
  'osm-r13799978':'Floresti-Stoenesti',
  // EN-R2b: authoritative Romanian toponyms take precedence over
  // Russian-derived OSM English aliases (which remain searchable as source).
  'osm-r1702216':'Camenca',
  'osm-r1702217':'Ribnita',
  'osm-r1702215':'Dubasari',
  'osm-r1702218':'Slobozia',
  'osm-r6879649':'Chitcani',
  'osm-r8291058':'Hlinaia'
});
// Correct the display of the same commune in RO without changing source fields.
const RO_ENTITY_DISPLAY=Object.freeze({'osm-r13799978':'Florești-Stoenești'});
const ROMANIAN_TYPE_PREFIX_EN=/^(?:Judetul|Raionul|Municipiul|Municipalitatea|Orasul|Comuna|Districtul|Sectorul|Sovetul (?:satesc|orasenesc))\s+/iu;
function asciiEnglish(value){
  return String(value||'').normalize('NFD')
    .replace(/[\u0300-\u036f]/g,'')
    .replace(/[șş]/g,'s').replace(/[ȘŞ]/g,'S')
    .replace(/[țţ]/g,'t').replace(/[ȚŢ]/g,'T');
}
function englishTerritorialName(node){
  const nuts=node.statisticalRoles?.find(x=>x.classification==='NUTS')?.code;
  if(nuts&&Object.hasOwn(EN_NUTS_DISPLAY,nuts))return EN_NUTS_DISPLAY[nuts];
  if(Object.hasOwn(EN_ENTITY_DISPLAY,node.id))return EN_ENTITY_DISPLAY[node.id];
  // The catalog's shortName.en already prefers OSM short_name:en/name:en.
  // Never let unlocalized sourceTags.short_name override it in EN.
  let name=asciiEnglish(node.shortName?.en||node.sourceTags?.['short_name:en']
    ||node.sourceTags?.['name:en']||node.name).trim();
  if(node.roles?.includes('administrative')){
    name=name.replace(EN_SUFFIX,'').replace(EN_PREFIX,'')
      .replace(ROMANIAN_TYPE_PREFIX_EN,'').trim();
  }
  return name;
}
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
// WEB-EN-OFFICIAL: full English *presentation* renderings of source official
// names. These do not replace a legally authoritative name or mutate OSM/registry
// data. Only established geographic exonyms and explicit administrative terms
// are translated; original source wording stays available in the entity card.
const EN_OFFICIAL_EXACT=Object.freeze({
  'osm-r90689':'Romania',
  'osm-r58974':'Republic of Moldova',
  'osm-r2607033':'Administrative-Territorial Units of the Left Bank of the Dniester',
  'stat-MD120':'Administrative-Territorial Units of the Left Bank of the Dniester',
  'stat-MD11':'Western Part (Right Bank of the Dniester)',
  'stat-MD12':'Eastern Part (Left Bank of the Dniester)'
});
const EN_OFFICIAL_PREFIXES=Object.freeze([
  [/^Judetul\s+/i,name=>name+' County'],
  [/^Raionul\s+/i,name=>name+' District'],
  [/^Municipiul\s+/i,name=>'Municipality of '+name],
  [/^Municipalitatea\s+/i,name=>'Municipality of '+name],
  [/^Orasul\s+/i,name=>'Town of '+name],
  [/^Comuna\s+/i,name=>name+' Commune'],
  [/^Satul\s+/i,name=>name+' Village'],
  [/^Sovetul satesc\s+/i,name=>name+' Village Council'],
  [/^Sovetul orasenesc\s+/i,name=>name+' Town Council'],
  [/^Sectorul\s+/i,name=>/^Sector\b/i.test(name)?name:name+' Sector'],
  [/^Districtul\s+/i,name=>name+' District'],
  [/^Unitatea teritoriala autonoma\s+/i,name=>'Autonomous Territorial Unit of '+name],
  [/^Regiunea de dezvoltare\s+/i,name=>name+' Development Region'],
  [/^Regiunea\s+/i,name=>name+' Region'],
  [/^Macroregiunea\s+/i,name=>name]
]);

export function officialNameForLocale(node,lang){
  const original=String(node?.officialName||node?.name||'').trim();
  if(lang==='ro')return original;
  if(!original)return shortTreeName(node,'en');
  if(Object.hasOwn(EN_OFFICIAL_EXACT,node.id))
    return EN_OFFICIAL_EXACT[node.id];
  const normalized=asciiEnglish(original);
  if(/^Republica Moldoveneasca Nistreana$/i.test(normalized))
    return 'Pridnestrovian Moldavian Republic';
  const englishName=shortTreeName(node,'en');
  for(const [prefix,format] of EN_OFFICIAL_PREFIXES){
    if(prefix.test(normalized))return format(englishName);
  }
  // An unqualified name is a toponym; reuse the reviewed English tree label.
  // For an otherwise unrecognized institutional descriptor, retain source
  // wording rather than invent an official English legal designation.
  if(!/^(?:Unitatile|Unitatea|Administratia|Consiliul|Republica|Teritoriul|Zona)\b/i.test(normalized))
    return englishName;
  return original;
}

// Standalone cards and dialogs use a context-complete city label; tree rows
// show the actual geographic name together with their ADM level.
// No catalog source name, OSM ID, or administrative parentage is modified.
export function cardNameOf(node,lang){
  return node.id==='osm-r1748490'
    ?(lang==='ro'?'Orașul Chișinău':'City of Chisinau')
    :shortTreeName(node,lang);
}

export function shortTreeName(node,lang){
  if(node.id==='osm-r90689')return lang==='en'?'Romania':'România';
  if(node.id==='osm-r58974')return 'Moldova';
  // WEB-R4.5: the ADM8 city must keep its geographical name in the tree.
  // A generic type-only label ('Oraș'/'City') was ambiguous and incorrect.
  // The ADM4 municipality and ADM8 city remain distinct via their levels.
  if(node.id==='osm-r1748490')return lang==='en'?'Chisinau':'Chișinău';
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
    return lang==='en'?asciiEnglish(node.name):node.name;
  // One administrative relation and one independent NTS3 statistical entity.
  if(node.id==='osm-r2607033')return EAST_ADMIN_LABELS[lang==='ro'?'ro':'en'];
  if(node.id==='stat-MD120')return EAST_STAT_LABEL;
  const stat=node.statisticalRoles?.[0]?.code;
  if(stat&&STAT_OVERRIDES[stat])return STAT_OVERRIDES[stat][lang==='ro'?0:1];
  if(lang==='en')return englishTerritorialName(node);
  if(Object.hasOwn(RO_ENTITY_DISPLAY,node.id))return RO_ENTITY_DISPLAY[node.id];
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

// EN-R2c: qualifiers for *homonymous siblings* are separate UI metadata,
// never suffixes to the toponym or changes to the certified identity.
function englishAdministrativeKind(node){
  const official=asciiEnglish(node.officialName||'').trim();
  if(/^orasul\s/iu.test(official))return 'Town';
  if(/^municipiul\s/iu.test(official))return 'Municipality';
  if(/^comuna\s/iu.test(official))return 'Commune';
  if(/^satul\s/iu.test(official))return 'Village';
  if(/^sectorul\s/iu.test(official))return 'Sector';
  if(node.entityType==='town_uat')return 'Town';
  if(node.entityType==='commune')return 'Commune';
  return 'Administrative unit';
}

export function englishSiblingQualifiers(entities){
  const grouped=new Map();
  for(const node of entities){
    if(!node.roles?.includes('administrative')||!node.treeParentId)continue;
    const key=[node.country,node.treeParentId,node.adminLevel,
      shortTreeName(node,'en').toLowerCase()].join('|');
    if(!grouped.has(key))grouped.set(key,[]);
    grouped.get(key).push(node);
  }
  const result=new Map();
  for(const group of grouped.values()){
    if(group.length<2)continue;
    for(const node of group){
      const kind=englishAdministrativeKind(node);
      const sameKind=group.filter(other=>englishAdministrativeKind(other)===kind);
      if(sameKind.length===1){
        result.set(node.id,kind);
        continue;
      }
      const system=node.registry?.system;
      const code=node.registry?.code;
      if(system&&code&&sameKind.filter(other=>
        other.registry?.system===system&&other.registry?.code===code).length===1){
        result.set(node.id,kind+' · '+system+' '+code);
        continue;
      }
      // Every source OSM relation has an immutable numeric ID. Use it for
      // unresolved same-kind homonyms, never invent a place name or legal type.
      result.set(node.id,kind+' · '+(node.osmRelationId!==null&&node.osmRelationId!==undefined
        ?'OSM '+node.osmRelationId:node.id));
    }
  }
  return result;
}

// EN-R2d: role-specific context is separate from geographic names.
const TERRITORIAL_CONTEXT=Object.freeze({
  'osm-r65335':Object.freeze({
    ro:'Entitate teritorială de facto administrată separat; distinctă de UATSN/ATULBD și de regiunea statistică. Eticheta nu implică recunoașterea statalității.',
    en:"Separately administered de facto territory; distinct from Moldova's ATULBD administrative units and the statistical region. The label does not imply recognition of statehood."
  }),
  'osm-r2607033':Object.freeze({
    ro:'UATSN / ATULBD: unitățile administrativ-teritoriale din stânga Nistrului în administrația Republicii Moldova, distincte de entitatea de facto.',
    en:"ATULBD: Administrative-Territorial Units of the Left Bank of the Dniester in Moldova's administration, distinct from the de facto territorial entity."
  }),
  'stat-MD120':Object.freeze({
    ro:'Regiune statistică pentru unitățile din stânga Nistrului; nu constituie o entitate administrativă independentă și nu trebuie confundată cu Nistrenia de facto.',
    en:"Statistical region for Moldova's left-bank units; not a separate administrative jurisdiction and not interchangeable with de facto Pridnestrovie."
  })
});
export function territorialContextNote(node,lang){
  return TERRITORIAL_CONTEXT[node.id]?.[lang==='ro'?'ro':'en']||null;
}
