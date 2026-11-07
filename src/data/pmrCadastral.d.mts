// TypeScript surface of the read-only PMR cadastral seat-code overlay.
// Cadastral codes are not CUATM registry values or KLADR PMR object IDs.
export interface PmrCadastralSeatEntry {
  readonly code:string;
  readonly seat:string;
}
export const PMR_CADASTRAL_SOURCE:Readonly<{
  title:string;
  url:string;
  order:string;
  orderDate:string;
  annex:number;
  registeredDate:string;
  registrationNumber:string;
}>;
export const PMR_CADASTRAL_SEAT_CODES:Readonly<Record<string,PmrCadastralSeatEntry>>;
export const PMR_CADASTRAL_ORDER:readonly string[];
export function pmrCadastralSeatCode(atlasId:string):string|null;
