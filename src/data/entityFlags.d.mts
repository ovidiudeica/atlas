/** Presentation-only flags, with no effect on legal recognition or certified country. */
export function flagFileForEntity(node:{id:string;country:string}|null|undefined):
  'romania.svg'|'moldova.svg'|'pridnestrovie.svg'|null;
