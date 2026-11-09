import{assessSymbolCandidate,symbolAssetIdentity,isInvalidatedSymbol}from'../../src/data/symbolSelectionPolicy.mjs';
export function guardDiscoveredRows(rows,baseline){
 const quarantine=[],changes=[];const authoritySystem=id=>{const seen=new Set();while(id&&!seen.has(id)){if(id==='osm-r65335')return 'de-facto';seen.add(id);id=baseline[id]?.parentId;}return 'recognized';};const roots=new Set(['osm-r90689','osm-r58974','osm-r65335']);
 const knownOwners=Object.values(baseline).flatMap(row=>['coat','flag'].filter(k=>row[k]).map(kind=>({atlasId:row.atlasId,kind,asset:row[kind],sha1:row.candidates?.find(c=>c.symbolType===kind&&symbolAssetIdentity(c)===symbolAssetIdentity(row[kind]))?.sha1,source:row.source?.[kind]||row[kind].sourceUrl,national:roots.has(row.atlasId)})));
 for(const row of Object.values(rows)){
  const base=baseline[row.atlasId];if(!base)throw Error('Uncertified Atlas ID in discovery: '+row.atlasId);
  const entity={...row,id:row.atlasId,registry:base.registry,jurisdiction:{country:base.country,authoritySystem:authoritySystem(row.atlasId)}};
  for(const candidate of row.candidates||[]){
   const kind=candidate.symbolType;if(!['coat','flag'].includes(kind))continue;
   if(base[kind]&&symbolAssetIdentity(candidate)===symbolAssetIdentity(base[kind])){candidate.semanticDecision={decision:'PRESERVE_EXISTING',reasons:[]};continue;}
   const assessment=assessSymbolCandidate(entity,candidate,{knownOwners});candidate.semanticDecision=assessment;
   if(assessment.decision!=='ALLOW'){candidate.eligible=false;quarantine.push({atlasId:row.atlasId,kind,asset:{file:candidate.file||null,url:candidate.url||null},decision:assessment.decision,reasons:assessment.reasons,existingImagePreserved:true});}
  }
  for(const kind of ['coat','flag']){
   const proposed=row[kind];const same=symbolAssetIdentity(proposed)===symbolAssetIdentity(base[kind]);
   const candidate=(row.candidates||[]).find(c=>c.symbolType===kind&&symbolAssetIdentity(c)===symbolAssetIdentity(proposed));
   const allowed=!same&&proposed&&candidate?.semanticDecision?.decision==='ALLOW'&&!isInvalidatedSymbol(row.atlasId,kind,{...proposed,sha256:candidate.sha256||candidate.imageSHA256});
   if(allowed){row[kind]={...proposed,sha256:candidate.sha256||candidate.imageSHA256};changes.push({atlasId:row.atlasId,kind,previousImage:base[kind],newImage:row[kind],evidence:candidate.semanticDecision.evidence});}
   else{row[kind]=base[kind];for(const field of ['status','source','sourceType','sourceLanguage']){row[field]??={};row[field][kind]=base[field]?.[kind]??null;}}
  }
 }
 return{quarantine,changes};
}
