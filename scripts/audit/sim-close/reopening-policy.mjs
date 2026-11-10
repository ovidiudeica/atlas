/** SIM-CLOSE: eligibility for individual editorial review, never publication/legal approval. */
export const OPERATIONAL_CATEGORIES=Object.freeze(['TECHNICAL','EXTERNAL_EVIDENCE_REQUIRED','RIGHTS_EVIDENCE_REQUIRED','DISPUTED_OR_UNCONFIRMED']);
export function validateReopeningRequest(request,caseRecord,{knownSourceHashes=[],previousMethodIds=[]}={}){
 const errors=[];const required=(ok,message)=>{if(!ok)errors.push(message);};const nonempty=x=>typeof x==='string'&&x.trim().length>0;
 required(request?.caseId===caseRecord?.caseId,'Exact registered case ID required');
 required(request?.atlasId===caseRecord?.atlasId,'Exact Atlas ID required');
 required(['coat','flag'].includes(request?.symbolType)&&request.symbolType===(caseRecord?.symbolType||caseRecord?.kind),'Exact coat/flag scope required');
 required(['NEW_RELEVANT_EVIDENCE','NEW_VERIFIABLE_METHOD'].includes(request?.basis),'New relevant evidence or a concrete new method is required');
 required(!request?.elapsedTimeOnly&&!request?.repeatSameConditions,'Elapsed time and repeating the same conditions do not justify reopening');
 required(request?.scope==='INDIVIDUAL_CASE'&&request?.triggerExhaustiveAudit===false,'Reopening must not trigger a new systematic audit');
 const e=request?.evidence||{};required(nonempty(e.type),'Evidence type required');required(nonempty(e.institutionOrAuthor),'Institution or author required');
 let publicURL=false;try{publicURL=['https:','http:'].includes(new URL(e.url).protocol);}catch{}
 required(publicURL||nonempty(e.archivalReference),'Public URL or exact archival reference required');
 required(/^\d{4}-\d{2}-\d{2}$/.test(e.documentDate||'')&&Number.isFinite(Date.parse(e.documentDate))&&new Date(e.documentDate).toISOString().slice(0,10)===e.documentDate,'Valid document date required');
 required(nonempty(e.version),'Document version required');required(/^[a-f0-9]{64}$/.test(e.sha256||'')||(e.sha256===null&&nonempty(e.hashUnavailableReason)),'Source SHA256 or explicit reason why it cannot be obtained required');
 required(nonempty(request?.differenceFromPriorEvidence)&&Array.isArray(request?.priorEvidenceRefs)&&request.priorEvidenceRefs.length>0,'Difference from specifically referenced prior evidence required');
 required(nonempty(request?.conclusionToReview),'Conclusion eligible for review required');
 required(Array.isArray(request?.requiredChecks)&&request.requiredChecks.length>0&&request.requiredChecks.every(nonempty),'Necessary tests/checks required');
 required(nonempty(request?.possiblePublishedImpact),'Possible impact on published representation required');
 if(request?.basis==='NEW_RELEVANT_EVIDENCE')required(e.sha256===null||!knownSourceHashes.includes(e.sha256),'An already examined identical source is not new evidence');
 if(request?.basis==='NEW_VERIFIABLE_METHOD'){
  const m=request.method||{};required(nonempty(m.id)&&!previousMethodIds.includes(m.id),'Method must differ from previously attempted methods');
  required(nonempty(m.description)&&nonempty(m.addressesBlocker)&&nonempty(m.expectedArtifact),'Concrete method, blocker addressed and expected recoverable artifact required');
  required(Array.isArray(m.verificationSteps)&&m.verificationSteps.length>=2&&m.verificationSteps.every(nonempty),'At least two verifiable method steps required');
 }
 return{eligibleForIndividualReview:errors.length===0,decision:errors.length?'INSUFFICIENT_REOPENING_BASIS':'INDIVIDUAL_EDITORIAL_REVIEW_REQUIRED',errors,legalOrHeraldicVerdictChanged:false,automaticPublicationAllowed:false,systematicAuditTriggered:false};
}
