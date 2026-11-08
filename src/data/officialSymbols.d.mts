/** Territorial symbol only for exact Atlas IDs with an official graphic. */
export interface ReviewedTerritorialSymbol {
  readonly coat:string|null;
  readonly flag:string|null;
  readonly holder:Readonly<{ro:string;en:string}>;
  readonly legal:Readonly<{ro:string;en:string}>;
  readonly legalUrl:string;
}
export const REVIEWED_SYMBOL_IDS:readonly string[];
export function officialSymbolsForEntity(node:{id:string}|null|undefined):
  ReviewedTerritorialSymbol|null;
