// SIM-R4.1: the exact same coat source is used in the territorial tree and card heading.
// A flag is never substituted when a coat is absent. Missing coats render neutrally.
import {officialSymbolsForEntity} from './officialSymbols.mjs';
import {editorialSymbolsForEntity,symbolAssetUrl} from './territorialSymbols.mjs';
import {withGlobalSymbols} from './globalSymbols.mjs';

export function coatImageForEntity(node,basePath='/'){
  if(!node?.id)return null;
  const reviewed=officialSymbolsForEntity(node);
  if(reviewed?.coat)return basePath+'symbols/'+reviewed.coat;
  const symbols=withGlobalSymbols(node,editorialSymbolsForEntity(node));
  return symbolAssetUrl(symbols?.coat);
}
