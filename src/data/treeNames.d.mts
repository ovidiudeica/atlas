export interface ShortTreeEntity {
  id:string;name?:string;shortName?:{en:string;ro:string};
  roles?:readonly string[];statisticalRoles?:readonly {code:string;classification?:string}[];
  country?:string;adminLevel?:number|null;treeParentId?:string|null;
  officialName?:string;entityType?:string;osmRelationId?:number|null;
  registry?:{system:string;code:string}|null;
  sourceTags?:Record<string,string>;
}
export function shortTreeName(node:ShortTreeEntity,lang:'en'|'ro'):string;
/** Full contextual label for standalone cards; the nested tree stays compact. */
export function cardNameOf(node:ShortTreeEntity,lang:'en'|'ro'):string;
/** English display rendering of officialName; source name is never changed. */
export function officialNameForLocale(node:ShortTreeEntity,lang:'en'|'ro'):string;
/** EN-only secondary labels to distinguish otherwise identical sibling toponyms. */
export function englishSiblingQualifiers(entities:readonly ShortTreeEntity[]):Map<string,string>;
/** Role-sensitive explanatory text; null for ordinary territory identities. */
export function territorialContextNote(node:ShortTreeEntity,lang:'en'|'ro'):string|null;
