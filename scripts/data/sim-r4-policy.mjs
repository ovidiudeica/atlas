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
  const a=row[kind];if(!a||row.status[kind]!=='CANDIDATE')continue;
  const key=kind+':'+a.url;const entries=images.get(key)||[];
  entries.push({row,kind});images.set(key,entries);
 }
 for(const entries of images.values()){
  const ancestor=(a,b)=>{let id=b.parentId;const seen=new Set();while(id&&!seen.has(id)){if(id===a.atlasId)return true;seen.add(id);id=rows[id]?.parentId;}return false;};
  if(entries.some((a,i)=>entries.some((b,j)=>i!==j&&!ancestor(a.row,b.row)&&!ancestor(b.row,a.row))))
   for(const {row,kind} of entries)remove(row,kind,
    'Image reused across unrelated Atlas holders; exact source identity requires review');
 }
}

const SOURCE_IDENTITY_EXCLUSIONS={
 'osm-r19113640:CoA of Leova.gif':'Commons describes Leova, not Cneazevca; Wikidata P94 is a known conflicting source association',
 'osm-r10519773:ROU SV Bunesti CoA.png':'Commons explicitly identifies Suceava County; this Atlas ID has the exact Brașov parent'
};
export function candidateConflict(atlasId,file){
 return SOURCE_IDENTITY_EXCLUSIONS[atlasId+':'+file]||null;
}
