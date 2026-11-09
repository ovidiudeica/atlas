// SIM-R4 presentation adapter. The certified geographic catalog is never mutated.
import {GLOBAL_SYMBOL_SELECTIONS,GLOBAL_SYMBOL_IDS} from './globalSymbolSelections.mjs';
const ids=new Set(GLOBAL_SYMBOL_IDS);
export function globalSymbolsForEntity(node){
 if(!node?.id||!ids.has(node.id))return null;
 const row=GLOBAL_SYMBOL_SELECTIONS[node.id];
 return {name:node.name||node.id,country:node.country,coat:row?.coat||null,flag:row?.flag||null};
}
export function withGlobalSymbols(node,existing){
 const global=globalSymbolsForEntity(node);
 if(!existing)return global;
 return {...existing,coat:existing.coat||global?.coat||null,flag:existing.flag||global?.flag||null};
}
