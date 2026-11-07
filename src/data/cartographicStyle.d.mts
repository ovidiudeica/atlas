export interface CartographicStyle {
  key:string; kind:'reference'|'administrative'|'statistical';
  color:string;fill:string;width:number;opacity:number;dash:boolean;
}
export interface CartographicEntity {
  roles?:readonly string[];adminLevel:number|null;
  statisticalRoles:readonly {classification:string;level:number}[];
}
export const REFERENCE_STYLE:Readonly<CartographicStyle>;
export function administrativeStyle(level:number):CartographicStyle;
export function statisticalStyle(classification:string,level:number):CartographicStyle;
export function styleForEntity(node:CartographicEntity,adminLevels?:readonly number[],
  statKeys?:readonly string[],isNationalRoot?:boolean):CartographicStyle;
