export interface ShortTreeEntity {
  id:string;name?:string;shortName?:{en:string;ro:string};
  roles?:readonly string[];statisticalRoles?:readonly {code:string}[];
  sourceTags?:Record<string,string>;
}
export function shortTreeName(node:ShortTreeEntity,lang:'en'|'ro'):string;
