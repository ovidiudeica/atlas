// Documentary subtype is deliberately independent of the source geometry and rank.
const levels=new Set(['OFFICIAL_TEXT_OCR_ATTESTATION','1930_STATISTICAL_SUBTYPE_ATTESTED_OCR','OTHER_OFFICIAL_ATTESTATION_OCR']);
const itemLevels=new Set(['OFFICIAL_TEXT_OCR_ATTESTATION','OFFICIAL_STATISTICAL_OCR','OFFICIAL_PRELIMINARY_STATISTICAL_OCR','OFFICIAL_URBAN_LIST_OCR','PRIOR_NORMATIVE_ACT_OCR','PRIOR_NORMATIVE_URBAN_CATEGORY_OCR']);
const nonempty=x=>typeof x==='string'&&x.trim().length>0;
const safeUrl=x=>{try{return typeof x==='string'&&new URL(x).protocol==='https:'}catch{return false}};
const date=x=>typeof x==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(x);
export function attachRohgisUrbanClassification(catalog,data){
 if(data?.schema!=='hist-ohm-tree9b-urban-classification-v1'||data.referenceYear!==1930||data.status!=='DOCUMENTARY_PROPOSAL_NOT_LEGALLY_CERTIFIED'||!Array.isArray(data.records)||data.records.length!==172||!data.sources||typeof data.sources!=='object')throw Error('Invalid urban evidence register');
 const sources=data.sources,urban=new Map(catalog.versions.filter(v=>v.kind==='urban_unit').map(v=>[v.entityId,v])),joined=new Map();
 for(const r of data.records){
  const v=urban.get(r?.entityId);
  if(!v||joined.has(r.entityId)||r.versionId!==v.versionId||r.geometryId!==v.geometryId||r.name!==v.nameRo||r.county!==v.sourceParentLabel||!['municipiu','oraș'].includes(r.subtype)||!levels.has(r.evidenceLevel)||r.legalSubtypeCertified!==false||r.legalBoundaryCertified!==false||r.canonicalChangeAdmitted!==false||!Array.isArray(r.evidence)||!r.evidence.length)throw Error('Invalid urban classification: '+r?.entityId);
  const evidence=r.evidence.map(e=>{
   const source=Object.hasOwn(sources,e.source)?sources[e.source]:null;
   if(!source||!nonempty(source.title)||!safeUrl(source.url)||!date(e.referenceDate)||!nonempty(e.locator)||!itemLevels.has(e.level)||e.explicitSubtype!==null&&e.explicitSubtype!==r.subtype)throw Error('Invalid urban evidence: '+r.entityId);
   return {...e,title:source.title,url:source.url};
  });
  const p=r.population;
  let population=null;
  if(p!==null){
   const source=Object.hasOwn(sources,p?.source)?sources[p.source]:null;
   if(!source||!nonempty(source.title)||!safeUrl(source.url)||p.referenceDate!=='1930-12-29'||p.metric!=='POPULATIA_STATORNICA'||!Number.isInteger(p.value)||p.value<0||!nonempty(p.locator)||!Number.isInteger(p.sourceValues?.polygon)||!Number.isInteger(p.sourceValues?.point)||![p.sourceValues.polygon,p.sourceValues.point].includes(p.value)||![true,false,null].includes(p.suburban)||p.geometryPopulationScopeVerified!==false||p.facsimileVerified!==false||p.canonicalChangeAdmitted!==false)throw Error('Invalid population evidence: '+r.entityId);
   population={...p,title:source.title,url:source.url};
  }
  joined.set(r.entityId,{...r,evidence,population});
 }
 if(joined.size!==urban.size||[...joined.values()].filter(r=>r.subtype==='municipiu').length!==20||[...joined.values()].filter(r=>r.subtype==='oraș').length!==152||[...joined.values()].filter(r=>r.population!==null).length!==7)throw Error('Urban evidence coverage/count mismatch');
 return {...catalog,versions:catalog.versions.map(v=>joined.has(v.entityId)?{...v,urbanClassification:joined.get(v.entityId)}:v)};
}
