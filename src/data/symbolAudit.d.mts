export interface SymbolAuditEntry {
 evidenceStatus?:string; evidenceNote?:string; rightsNote?:string;
 verdict:string;previousVerdict?:string|null;rights:string;license:string|null;artist:string|null;licenseUrl:string|null;source:string|null;graphicVersion:string;
}
export function symbolAuditFor(id:string,kind:'coat'|'flag'):SymbolAuditEntry|null;
export function symbolIsRemoved(id:string,kind:'coat'|'flag'):boolean;
export function applySymbolAudit<T>(node:{id:string},symbols:T):T;
