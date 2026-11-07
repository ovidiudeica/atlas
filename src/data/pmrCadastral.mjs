// WEB-R3.18: presentation-only associations of Nistrenia's seven ADM5
// OSMB units with the cadastral territorial-unit codes of their seats.
// These are NOT KLADR PMR object IDs, CUATM codes or new Atlas entities.
// Source: Ministry of Agriculture and Natural Resources PMR, Order no. 361,
// 25 Dec 2015, Annex 2 (registered 3 Mar 2016, no. 7368).
// Annex 2 assigns these codes to seat towns; an ADM5 OSMB boundary does
// not thereby become identical to the cadastral unit of the seat.
export const PMR_CADASTRAL_SOURCE=Object.freeze({
  title:'PMR cadastral territorial-unit codes — Order 361/2015, Annex 2',
  url:'https://ulpmr.ru/ul/show/15qmcSyGNzdrq4CHg3YTYT7pZL4prutaleyY%3D',
  order:'361',
  orderDate:'2015-12-25',
  annex:2,
  registeredDate:'2016-03-03',
  registrationNumber:'7368'
});
export const PMR_CADASTRAL_SEAT_CODES=Object.freeze({
  'osm-r944727':Object.freeze({code:'32',seat:'Bender'}),
  'osm-r1702219':Object.freeze({code:'33',seat:'Tiraspol'}),
  'osm-r1702214':Object.freeze({code:'40',seat:'Grigoriopol'}),
  'osm-r1702215':Object.freeze({code:'45',seat:'Dubăsari'}),
  'osm-r1702217':Object.freeze({code:'55',seat:'Rîbnița'}),
  'osm-r1702218':Object.freeze({code:'57',seat:'Slobozia'}),
  'osm-r1702216':Object.freeze({code:'66',seat:'Camenca'})
});
export const PMR_CADASTRAL_ORDER=Object.freeze(
  Object.keys(PMR_CADASTRAL_SEAT_CODES)
    .sort((a,b)=>PMR_CADASTRAL_SEAT_CODES[a].code.localeCompare(
      PMR_CADASTRAL_SEAT_CODES[b].code,'en')||a.localeCompare(b,'en'))
);
export function pmrCadastralSeatCode(atlasId){
  return Object.hasOwn(PMR_CADASTRAL_SEAT_CODES,atlasId)
    ?PMR_CADASTRAL_SEAT_CODES[atlasId].code:null;
}
