import type {EditorialEntitySymbols} from './territorialSymbols.mjs';
type Node={id:string;name?:string;country:'RO'|'MD'};
export function globalSymbolsForEntity(node:Node|null|undefined):EditorialEntitySymbols|null;
export function withGlobalSymbols(node:Node,existing:EditorialEntitySymbols|null):EditorialEntitySymbols|null;
