export interface ShortTreeEntity {
  id:string;name?:string;shortName?:{en:string;ro:string};
  roles?:readonly string[];statisticalRoles?:readonly {code:string}[];
  sourceTags?:Record<string,string>;
}
export function shortTreeName(node:ShortTreeEntity,lang:'en'|'ro'):string;
/** Full contextual label for standalone cards; the nested tree stays compact. */
export function cardNameOf(node:ShortTreeEntity,lang:'en'|'ro'):string;
