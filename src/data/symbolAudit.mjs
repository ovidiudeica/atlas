import {SYMBOL_AUDIT,SYMBOL_CORRECTIONS} from './symbolAuditSelections.mjs';
export function symbolAuditFor(id,kind){return SYMBOL_AUDIT[id]?.[kind]||null;}
export function symbolIsRemoved(id,kind){
 return Object.hasOwn(SYMBOL_CORRECTIONS[id]||{},kind)&&SYMBOL_CORRECTIONS[id][kind]===null;
}
export function applySymbolAudit(node,symbols){
 if(!symbols)return symbols;
 const changes=SYMBOL_CORRECTIONS[node.id];
 return changes?{...symbols,...changes}:symbols;
}
