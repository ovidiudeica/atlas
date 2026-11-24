import {readFileSync,writeFileSync} from 'node:fs';
import {pathToFileURL} from 'node:url';
// Deterministic projection of documentary registers. Never edits the geometric catalogue.
export function buildUrbanClassification(catalog,a,b){
 const fail=message=>{throw Error('TREE.9b: '+message)};
 const urban=catalog.versions.filter(v=>v.kind==='urban_unit');
 const first=new Map(a.records.map(r=>[r.entityId,r]));
 const later=new Map(b.records.map(r=>[r.entityId,r]));
 const populations=new Map(b.populationReconciliation.map(r=>[r.entityId,r]));
 if(urban.length!==172||first.size!==172||later.size!==84||populations.size!==7)fail('incorrect register coverage');
 const sources={
  MO17bis:{title:'Monitorul Oficial nr. 17 bis, 22 ianuarie 1930',url:a.sources.MO17bis.url},
  ...Object.fromEntries(Object.entries(b.sources).map(([id,s])=>[id,{title:s.title,url:s.url}]))
 };
 const records=urban.map(v=>{
  const r=first.get(v.entityId),s=later.get(v.entityId),p=populations.get(v.entityId);
  if(!r||r.versionId!==v.versionId||r.geometryId!==v.geometryId||r.sourceName!==v.nameRo||r.county!==v.sourceParentLabel||r.legalSubtypeCertified!==false||r.legalBoundaryCertified!==false||r.canonicalChangeAdmitted!==false)fail('identity/certification '+v.entityId);
  if(Boolean(r.primaryLocator)===Boolean(s)||s&&(s.versionId!==v.versionId||s.geometryId!==v.geometryId||s.proposedSubtype!==r.proposedLegalSubtype||s.legalSubtypeCertified!==false||s.legalBoundaryCertified!==false||s.canonicalChangeAdmitted!==false))fail('documentary coverage '+v.entityId);
  const evidence=r.primaryLocator?[{source:'MO17bis',referenceDate:a.sources.MO17bis.date,locator:'Indexed OCR line '+r.primaryLocator.line,explicitSubtype:r.primaryLocator.type,level:'OFFICIAL_TEXT_OCR_ATTESTATION',note:r.primaryLocator.note}]:s.evidence.map(e=>({...e}));
  if(!evidence.length||evidence.some(e=>!sources[e.source]||e.explicitSubtype!==null&&e.explicitSubtype!==r.proposedLegalSubtype))fail('invalid evidence '+v.entityId);
  const level=r.primaryLocator?'OFFICIAL_TEXT_OCR_ATTESTATION':s.status==='1930_STATISTICAL_SUBTYPE_ATTESTED_OCR'?'1930_STATISTICAL_SUBTYPE_ATTESTED_OCR':'OTHER_OFFICIAL_ATTESTATION_OCR';
  const population=p?{value:p.value,referenceDate:p.referenceDate,metric:p.metric,source:p.source,locator:p.locator,sourceValues:p.sourceValues,suburban:p.suburban,geometryPopulationScopeVerified:false,facsimileVerified:false,canonicalChangeAdmitted:false}:null;
  if(p&&(p.geometryPopulationScopeVerified!==false||p.facsimileVerified!==false||p.canonicalChangeAdmitted!==false||!sources[p.source]))fail('population scope '+v.entityId);
  return {entityId:v.entityId,versionId:v.versionId,geometryId:v.geometryId,name:v.nameRo,county:v.sourceParentLabel,subtype:r.proposedLegalSubtype,evidenceLevel:level,pointStatus:r.pointStatus,pointFid:r.pointFid,pointAlias:r.pointAlias,evidence,population,legalSubtypeCertified:false,legalBoundaryCertified:false,canonicalChangeAdmitted:false};
 });
 if(records.filter(r=>r.subtype==='municipiu').length!==20||records.filter(r=>r.subtype==='oraș').length!==152||records.filter(r=>r.population).length!==7)fail('classification counts');
 return {schema:'hist-ohm-tree9b-urban-classification-v1',referenceYear:1930,status:'DOCUMENTARY_PROPOSAL_NOT_LEGALLY_CERTIFIED',sources,records};
}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const read=p=>JSON.parse(readFileSync(new URL('../../'+p,import.meta.url),'utf8'));
 const result=buildUrbanClassification(read('public/data/historical/v1/rohgis/catalog-1930.json'),read('docs/historical/reconciliation/HIST-OHM-TREE.9-URBAN-QUALIFICATION.json'),read('docs/historical/reconciliation/HIST-OHM-TREE.9a-CENSUS-RECONCILIATION.json'));
 const file=new URL('../../public/data/historical/v1/rohgis/urban-classification-1930.json',import.meta.url);
 const content=JSON.stringify(result)+'\n';
 if(process.argv.includes('--check')){if(readFileSync(file,'utf8')!==content)throw Error('Urban evidence projection differs');}else writeFileSync(file,content);
}
