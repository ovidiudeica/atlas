// SIM-R4 source conflicts, applied only to new preliminary assignments.
export function applySymbolConflicts(rows){
 const remove=(row,kind,note)=>{
  if(!row[kind]||row.status[kind]==='REVIEWED_SOURCE')return;
  const url=row[kind].url;
  row.reviewNotes.push(note);
  for(const c of row.candidates.filter(c=>c.symbolType===kind&&c.url===url)){
   c.eligible=false;c.reviewNotes.push(note);
  }
  row[kind]=null;row.source[kind]=null;row.sourceType[kind]=null;
  row.sourceLanguage[kind]=null;row.status[kind]='MISSING';
 };
 const roots=['osm-r90689','osm-r58974','osm-r65335'];
 for(const row of Object.values(rows)){
  for(const kind of ['coat','flag']){
   const asset=row[kind];if(!asset)continue;
   if(roots.some(id=>id!==row.atlasId&&rows[id]?.[kind]?.url===asset.url))
    remove(row,kind,'National/de facto parent symbol is not evidence of an own territorial symbol');
  }
  if(row.coat&&row.flag&&row.coat.url===row.flag.url)
   remove(row,'flag','Identical coat/flag image: flag assignment withheld');
 }
 const images=new Map();
 for(const row of Object.values(rows))for(const kind of ['coat','flag']){
  const a=row[kind];if(a?.kind!=='official'||row.status[kind]!=='CANDIDATE')continue;
  const key=kind+':'+a.url;const entries=images.get(key)||[];
  entries.push({row,kind});images.set(key,entries);
 }
 for(const entries of images.values()){
  if(new Set(entries.map(e=>e.row.parentId)).size>1)
   for(const {row,kind} of entries)remove(row,kind,
    'Institutional image reused across unrelated Atlas holders; exact authority identity requires review');
 }
}
