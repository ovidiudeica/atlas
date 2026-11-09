import {SYMBOL_AUDIT,SYMBOL_CORRECTIONS} from './symbolAuditSelections.mjs';
import {R6_AUDIT,R6_CORRECTIONS} from './symbolR6Selections.mjs';
const CURRENT_CORRECTIONS={...SYMBOL_CORRECTIONS,...R6_CORRECTIONS};
export function symbolAuditFor(id,kind){return R6_AUDIT[id]?.[kind]||SYMBOL_AUDIT[id]?.[kind]||null;}
export function symbolIsRemoved(id,kind){
 return Object.hasOwn(CURRENT_CORRECTIONS[id]||{},kind)&&CURRENT_CORRECTIONS[id][kind]===null;
}
export function applySymbolAudit(node,symbols){
 if(!symbols)return symbols;
 const changes=CURRENT_CORRECTIONS[node.id];
 return changes?{...symbols,...changes}:symbols;
}
