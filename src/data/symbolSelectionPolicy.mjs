import {R8_INVALIDATIONS} from './symbolR8Invalidations.mjs';
import {INVALIDATED_SYMBOL_REPRODUCTIONS} from './symbolInvalidations.mjs';
export const SYMBOL_EXCLUSION_CATEGORIES=Object.freeze(['LANGUAGE_ICON','NATIONAL_SYMBOL_LEAKAGE','PARENT_ADMIN_SYMBOL','INSTITUTIONAL_WORDMARK','DECORATIVE_GRAPHIC','PHOTOGRAPH','UNRELATED_ENTITY','HOMONYM_COLLISION','INSUFFICIENT_IDENTITY_EVIDENCE','GRAPHIC_VERSION_CONTRADICTION']);
const normalize=s=>String(s||'').normalize('NFC').replaceAll('_',' ').trim().replace(/^./u,c=>c.toUpperCase());
export function symbolAssetIdentity(asset){
 if(!asset)return null;
 const raw=asset.url||'';
 try{
  const u=new URL(raw,'https://atlas.invalid/');
  const path=decodeURIComponent(u.pathname);
  if(/^(?:commons|upload)\.wikimedia\.org$/.test(u.hostname)){
   const parts=path.split('/');const file=asset.file||(parts.includes('thumb')?parts.at(-2):parts.at(-1));
   return 'file:'+normalize(file.replace(/^File:/i,''));
  }
  if(!raw&&asset.file)return 'file:'+normalize(asset.file.replace(/^File:/i,''));
  for(const key of [...u.searchParams.keys()])if(key.startsWith('utm_'))u.searchParams.delete(key);
  return 'url:'+u.hostname.toLowerCase()+path+u.search;
 }catch{return 'url:'+raw;}
}
export function isInvalidatedSymbol(atlasId,kind,asset){
 if(!asset)return false;const identity=symbolAssetIdentity(asset);
 return !![...INVALIDATED_SYMBOL_REPRODUCTIONS,...R8_INVALIDATIONS].find(r=>r.atlasId===atlasId&&r.kind===kind&&((r.sha256&&(asset.sha256||asset.imageSHA256)?r.sha256===(asset.sha256||asset.imageSHA256):symbolAssetIdentity(r.asset)===identity)));
}
const sourceURL=s=>{try{return ['https:','http:'].includes(new URL(s).protocol);}catch{return false;}};
const sameJurisdiction=(a,b)=>a?.country===b?.country&&a?.authoritySystem===b?.authoritySystem;
export function assessSymbolCandidate(entity,candidate,{knownOwners=[]}={}){
 const reasons=[];const add=(code,detail,evidence)=>reasons.push({code,detail,source:evidence?.source||candidate.sourceUrl||candidate.source||null});
 const kind=candidate.symbolType||candidate.kind;
 if(!['coat','flag'].includes(kind)){add('INSUFFICIENT_IDENTITY_EVIDENCE','Separate coat/flag kind is required');return{decision:'QUARANTINE',reasons};}
 if(isInvalidatedSymbol(entity.id||entity.atlasId,kind,candidate)){const prior=[...INVALIDATED_SYMBOL_REPRODUCTIONS,...R8_INVALIDATIONS].find(r=>r.atlasId===(entity.id||entity.atlasId)&&r.kind===kind&&(symbolAssetIdentity(r.asset)===symbolAssetIdentity(candidate)||(r.sha256&&r.sha256===(candidate.sha256||candidate.imageSHA256))));add(prior?.category||'INSUFFICIENT_IDENTITY_EVIDENCE','Exact-ID historical invalidation cannot be regenerated: '+prior?.reason,{source:prior?.source});return{decision:'REJECT',reasons};}
 const id=entity.id||entity.atlasId,holder=candidate.territorialHolder;
 const scope=candidate.scopeEvidence;
 const legitimateShared=scope?.reviewed===true&&scope.kind===kind&&sourceURL(scope.source)&&scope.atlasIds?.includes(id)&&scope.imageSHA256&&scope.imageSHA256===(candidate.sha256||candidate.imageSHA256);
 for(const review of candidate.visualEvidence||[]){
  if(!SYMBOL_EXCLUSION_CATEGORIES.includes(review.category))continue;
  if(review.reviewed===true&&review.sha256&&(candidate.sha256||candidate.imageSHA256)===review.sha256&&sourceURL(review.source))add(review.category,review.finding||'Hash-bound visual evidence identifies non-territorial content',review);
 }
 if(reasons.length)return{decision:'REJECT',reasons};
 const owners=knownOwners.filter(o=>o.atlasId!==id&&((o.sha256&&o.sha256===(candidate.sha256||candidate.imageSHA256))||(o.sha1&&o.sha1===candidate.sha1)||symbolAssetIdentity(o.asset)===symbolAssetIdentity(candidate)));
 if(owners.length&&(!legitimateShared||owners.some(owner=>!scope.atlasIds.includes(owner.atlasId)))){
  for(const owner of owners)add(owner.national?'NATIONAL_SYMBOL_LEAKAGE':owner.atlasId===(entity.administrativeParentId||entity.parentId)?'PARENT_ADMIN_SYMBOL':'UNRELATED_ENTITY','Identical reproduction is attributed to another exact holder; documented shared scope is required',{source:owner.source});
  return{decision:'QUARANTINE',reasons};
 }
 if(holder?.atlasId&&holder.atlasId!==id&&(!legitimateShared||!scope.atlasIds.includes(holder.atlasId)))add('HOMONYM_COLLISION','Named or linked holder has a different Atlas ID');
 if(holder?.jurisdiction&&!sameJurisdiction(entity.jurisdiction||{country:entity.country,authoritySystem:entity.authoritySystem||'recognized'},holder.jurisdiction))add('UNRELATED_ENTITY','Jurisdiction/recognized versus de-facto authority system differs');
 if(holder?.entityType&&entity.entityType&&holder.entityType!==entity.entityType&&!legitimateShared)add('HOMONYM_COLLISION','Administrative holder type differs');
 if(holder?.registryCode&&entity.registry?.code&&holder.registryCode!==entity.registry.code)add('HOMONYM_COLLISION','Certified administrative code differs');
 if(holder?.parentId&&(entity.administrativeParentId||entity.parentId)&&holder.parentId!==(entity.administrativeParentId||entity.parentId))add('HOMONYM_COLLISION','Administrative parent differs');
 if(reasons.length)return{decision:'QUARANTINE',reasons};
 const identity=(candidate.identityEvidenceRecords||[]).some(e=>e.reviewed===true&&e.holderAtlasId===id&&sourceURL(e.source)&&['CERTIFIED_ADMINISTRATIVE_CODE','DOCUMENT_EXACT_HOLDER','EXACT_AUTHORITY_AND_EXPLICIT_CAPTION'].includes(e.type));
 const symbol=candidate.territorialDeclaration;
 const explicit=!!(symbol?.reviewed&&symbol.kind===kind&&symbol.holderAtlasId===id&&sourceURL(symbol.source)&&symbol.excerpt&&['body','caption','normative-annex'].includes(symbol.context));
 const approved=candidate.editorialApproval;
 const approvedImage=!!(approved?.reviewed&&approved.atlasId===id&&approved.kind===kind&&approved.imageSHA256&&(candidate.sha256||candidate.imageSHA256)===approved.imageSHA256&&sourceURL(approved.source));
 if(!identity||!explicit||!approvedImage){
  const hints=[candidate.file,candidate.url,candidate.context?.caption].join(' ');
  if(/(?:accessibility|plugins?\/).*?(?:english|language)|(?:lang|language)[-_]?icon/i.test(hints))add('LANGUAGE_ICON','Language/plugin context is suspicious; filename alone is not a definitive rejection');
  if(/wordmark|primaria.{0,30}logo|logo.{0,30}primaria/i.test(hints))add('INSTITUTIONAL_WORDMARK','Institutional branding context requires review');
  add('INSUFFICIENT_IDENTITY_EVIDENCE','Exact identity, explicit territorial declaration and hash-bound editorial review are required; header/domain/infobox/filename/QID alone do not suffice');
  return{decision:'QUARANTINE',reasons};
 }
 return{decision:'ALLOW',reasons:[],evidence:{identity:true,territorialDeclaration:true,hashBoundEditorialApproval:true,sharedScope:legitimateShared}};
}
export function selectTerritorialCandidate(entity,candidates,options){
 const assessed=candidates.map(candidate=>({candidate,assessment:assessSymbolCandidate(entity,candidate,options)}));
 return{selected:assessed.find(r=>r.assessment.decision==='ALLOW')?.candidate||null,quarantine:assessed.filter(r=>r.assessment.decision!=='ALLOW')};
}
