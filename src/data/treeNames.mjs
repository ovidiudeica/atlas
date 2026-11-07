// Presentation-only short names for the certified territorial tree.
// Never mutate catalog source, identifiers, parentage, or official names.
const STAT_OVERRIDES = {
  MD11:['Vest','West'], MD12:['Est','East'],
  MD111:['Nord','North'], MD112:['Centru','Centre'], MD113:['Sud','South']
};
const LEFT_BANK = ['Stânga Nistrului','Left Bank'];
const EN_SUFFIX = /\s+(?:District|Municipality|County|Commune|City|Town)$/iu;
const EN_PREFIX = /^(?:District|Municipality|County|Commune|City|Town)\s+of\s+/iu;
const RO_PREFIX = /^(?:Județul|Judetul|Raionul|Municipiul|Municipalitatea|Orașul|Orasul|Comuna|Districtul)\s+(.+)$/iu;
function comparable(value){
  return String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .toLocaleLowerCase('ro-RO').trim();
}
export function shortTreeName(node,lang){
  if(node.id==='osm-r90689')return lang==='en'?'Romania':'România';
  if(node.id==='osm-r58974')return 'Moldova';
  // One administrative relation and one independent NTS3 statistical entity.
  if(node.id==='osm-r2607033'||node.statisticalRoles?.some(x=>x.code==='MD120'))
    return LEFT_BANK[lang==='ro'?0:1];
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
