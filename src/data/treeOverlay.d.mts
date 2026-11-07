import type {TreeSibling} from './treeOrder.mjs';
export interface PresentationNode extends TreeSibling {
  administrativeParentId:string|null;treeParentId:string|null;
}
export const GAGAUZIA_ID:string;
export const CHISINAU_ID:string;
export const CHISINAU_CITY_ID:string;
export const COMRAT_RAION_ID:string;
export const RAION_CHILDREN:Readonly<Record<string,readonly string[]>>;
export const SECTOR_IDS:readonly string[];
export function presentationParentId(node:PresentationNode,
  view:'all'|'administrative'|'statistical'):string|null;
export function comparePresentationSiblings(a:TreeSibling,b:TreeSibling,
  view:'all'|'administrative'|'statistical',parentId:string,lang:'ro'|'en'):number|null;
