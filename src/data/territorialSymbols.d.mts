export interface EditorialSymbolAsset {
 readonly kind:'commons'|'official';
 readonly tier:'A'|'B';
 readonly file?:string;
 readonly url?:string;
 readonly sourceUrl?:string;
}
export interface EditorialEntitySymbols {
 readonly name:string;
 readonly country:'RO'|'MD';
 readonly coat:EditorialSymbolAsset|null;
 readonly flag:EditorialSymbolAsset|null;
 readonly reference?:string;
 readonly note?:Readonly<{ro:string;en:string}>;
}
export const SIM_R3_ENTITY_IDS:readonly string[];
export const SIM_R3_COUNTS:Readonly<{
 entities:number;coat:number;flag:number;both:number;neutral:number;
}>;
export function editorialSymbolsForEntity(node:{id:string}|null|undefined):EditorialEntitySymbols|null;
export function symbolAssetUrl(asset:EditorialSymbolAsset|null|undefined):string|null;
export function symbolSourceUrl(asset:EditorialSymbolAsset|null|undefined):string|null;
