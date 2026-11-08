// SIM-R2a: one-to-one reviewed territorial imagery. Never inherit from a
// parent, a same-name entity, Wikidata candidates or statistical overlays.
const GAGAUZIA_SOURCE='https://www.gagauzia.md/ato-gagauziya/simvolika.html';
const CHISINAU_SOURCE='https://dgect.chisinau.md/simbolica-locala/procedura-de-obtinere-a-dreptului-de-utilizare-a-toponimicului-chisinau/';
const CHISINAU_MUNICIPAL_RULE='Decizia CMC nr. 5/2 din 19.12.2019; Decretul nr. 1475-VIII din 02.03.2020';
const CHISINAU_EN_RULE='Municipal Council Decision 5/2 of 19 Dec 2019; Presidential Decree 1475-VIII of 2 Mar 2020';
function chisSector(nameRo,nameEn,coat){
  return Object.freeze({
    coat,flag:null,
    holder:Object.freeze({ro:'Municipiul Chișinău — sectorul '+nameRo,en:'Chisinau municipality — '+nameEn+' sector'}),
    legal:Object.freeze({ro:CHISINAU_MUNICIPAL_RULE,en:CHISINAU_EN_RULE}),
    legalUrl:CHISINAU_SOURCE
  });
}
const REVIEWED=Object.freeze({
  'osm-r1699032':Object.freeze({
    coat:'gagauzia-coat.png',flag:'gagauzia-flag.svg',
    holder:Object.freeze({ro:'Unitatea Teritorială Autonomă Găgăuzia',en:'Autonomous Territorial Unit of Gagauzia'}),
    legal:Object.freeze({
      ro:'Legile locale nr. 2-IV/I din 31.10.1995 (drapel) și nr. 13-X/I din 28.06.1996 (stemă).',
      en:'Local Law 2-IV/I of 31 Oct 1995 (flag) and 13-X/I of 28 Jun 1996 (coat of arms).'
    }),
    legalUrl:GAGAUZIA_SOURCE
  }),
  'osm-r1748490':Object.freeze({
    coat:'chisinau-coat.jpg',flag:null,
    holder:Object.freeze({ro:'Municipiul Chișinău',en:'Chisinau municipality'}),
    legal:Object.freeze({ro:CHISINAU_MUNICIPAL_RULE,en:CHISINAU_EN_RULE}),
    legalUrl:'https://cnh.prm.md/'
  }),
  'osm-r1813306':chisSector('Botanica','Botanica','chisinau-botanica-coat.png'),
  'osm-r1813297':chisSector('Buiucani','Buiucani','chisinau-buiucani-coat.png'),
  'osm-r58512':chisSector('Centru','Centru','chisinau-centru-coat.png'),
  'osm-r1813315':chisSector('Ciocana','Ciocana','chisinau-ciocana-coat.png'),
  'osm-r1813316':chisSector('Rîșcani','Riscani','chisinau-riscani-coat.png')
});
export const REVIEWED_SYMBOL_IDS=Object.freeze(Object.keys(REVIEWED));
export function officialSymbolsForEntity(node){
  return node?.id&&Object.hasOwn(REVIEWED,node.id)?REVIEWED[node.id]:null;
}
