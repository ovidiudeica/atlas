import {R8_AUDIT,R8_CORRECTIONS} from './symbolR8Selections.mjs';
import {SYMBOL_AUDIT,SYMBOL_CORRECTIONS} from './symbolAuditSelections.mjs';
import {R6_AUDIT,R6_CORRECTIONS} from './symbolR6Selections.mjs';
import {R7_AUDIT} from './symbolR7Selections.mjs';
import {isInvalidatedSymbol} from './symbolSelectionPolicy.mjs';
const CURRENT_CORRECTIONS={...SYMBOL_CORRECTIONS,...R6_CORRECTIONS,...R8_CORRECTIONS};
export function symbolAuditFor(id,kind){return R8_AUDIT[id]?.[kind]||R7_AUDIT[id]?.[kind]||R6_AUDIT[id]?.[kind]||SYMBOL_AUDIT[id]?.[kind]||null;}
export function symbolIsRemoved(id,kind){
 return Object.hasOwn(CURRENT_CORRECTIONS[id]||{},kind)&&CURRENT_CORRECTIONS[id][kind]===null;
}
export function applySymbolAudit(node,symbols){
 if(!symbols)return symbols;
 const changes=CURRENT_CORRECTIONS[node.id];
 const current=changes?{...symbols,...changes}:{...symbols};
 for(const kind of ['coat','flag'])if(isInvalidatedSymbol(node.id,kind,current[kind]))current[kind]=null;
 return current;
}
