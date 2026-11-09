import {symbolAuditFor} from '../data/symbolAudit.mjs';
const labels:Record<string,[string,string]>={
 VERIFIED_OFFICIAL:['Identitate, act și reprezentare confirmate','Identity, act and representation confirmed'],
 SOURCE_CORROBORATED:['Surse coroborate · certificare incompletă','Corroborated sources · incomplete certification'],
 CANDIDATE_UNVERIFIED:['Imagine neconfirmată','Unconfirmed image'],
 MISATTRIBUTED:['Atribuire greșită eliminată','Misattribution removed'],
 HISTORICAL_ONLY:['Simbol istoric','Historical symbol'],OUTDATED_VERSION:['Versiune depășită','Outdated version'],
 DISPUTED:['Surse contradictorii','Conflicting sources'],RIGHTS_UNCLEAR:['Drepturi neclarificate','Rights unclear']
};
export function SymbolAuditSummary({id,kind,lang}:{id:string;kind:'coat'|'flag';lang:'ro'|'en'}){
 const audit=symbolAuditFor(id,kind);if(!audit)return null;
 const index=lang==='ro'?0:1;
 return <details className="symbol-audit" data-symbol-verdict={audit.verdict}>
  <summary>{labels[audit.verdict]?.[index]||audit.verdict}</summary>
  {audit.previousVerdict&&<p>{lang==='ro'?'Versiunea anterioară a fost înlocuită pe baza surselor documentate.':'The previous version was replaced using documented sources.'}</p>}
  <p>{audit.graphicVersion==='CURRENT_REPRESENTATION_CONFIRMED'
    ?(lang==='ro'?'Reprezentare actuală confirmată prin comparația documentată.':'Current representation confirmed by documented comparison.')
    :(lang==='ro'?'Fidelitatea grafică are limite de verificare; consultați registrul auditului.':'Graphic fidelity has verification limits; consult the audit register.')}</p>
  <p>{audit.rights==='RIGHTS_UNCLEAR'
    ?(lang==='ro'?'Drepturile reproducerii rămân neclarificate.':'Reproduction rights remain unclear.')
    :(lang==='ro'?'Declarația licenței sursei: ':'Source licence declaration: ')}
    {audit.rights!=='RIGHTS_UNCLEAR'&&(audit.licenseUrl?<a href={audit.licenseUrl} target="_blank" rel="noopener noreferrer">{audit.license}</a>:audit.license)}
    {audit.artist&&<> · {audit.artist}</>}
  </p>
  {audit.source&&<a href={audit.source} target="_blank" rel="noopener noreferrer">{lang==='ro'?'Dovada / sursa examinată':'Evidence / examined source'} ↗</a>}
  <a href={import.meta.env.BASE_URL+'data/symbols/audit.json.gz'} download>{lang==='ro'?'Registrul SIM-R5 (JSON gzip)':'SIM-R5 register (gzip JSON)'}</a>
 </details>;
}
