import type {ShortTreeEntity} from './treeNames.mjs';
export interface TreeSibling extends ShortTreeEntity {
  id:string;name:string;roles:string[];adminLevel:number|null;
  statisticalRoles:{code:string}[];
}
export const NISTRIAN_PARENT_ID:string;
export const GAGAUZIA_PARENT_ID:string;
export const CHISINAU_PARENT_ID:string;
export const NISTRIAN_CITY_COUNCILS:readonly string[];
export function compareTreeSiblings(a:TreeSibling,b:TreeSibling,
  view:'all'|'administrative'|'statistical',parentId:string,lang:'ro'|'en'):number;
