/**
 * HIST-MODULE.3 — independent documentary attestation and cartographic bridge.
 * The HistoGIS catalogue remains an immutable source archive.
 *
 * "qualified" here is scoped narrowly: dated existence/label, territorial
 * membership in one law, or measured intersection of two SOURCE polygons.
 * It never means legally certified boundaries, full-duration certification,
 * identity, succession or direct administrative parentage.
 */
import { validateHistoricalPeriod, validateHistoricalAdminBridge } from './historicalAdminBridge.mjs';
import { historicalDateInPeriod } from './historicalQualification.mjs';

const SCHEMA='atlas-historical-independent-admissions-v1';
const ATTESTATIONS=new Set(['qualified','in_review','candidate']);
const INDEPENDENT_KINDS=new Set([
  'contemporary_primary_normative_text',
  'official_gazette_bibliographic_entry',
  'historical_map_archival_presentation',
  'independent_peer_reviewed_historical_study',
  'certified_cartographic_snapshot_not_legal_boundaries'
]);

const nonempty=x=>typeof x==='string'&&x.trim().length>0;
const plain=x=>!!x&&typeof x==='object'&&!Array.isArray(x);
function requireArray(value,name,errors) {
  if(!Array.isArray(value)){errors.push(name+' must be array');return [];}
  return value;
}
function unique(rows,name,errors) {
  const ids=new Set();
  for(const r of rows){
    if(!plain(r)||!nonempty(r.id)||ids.has(r.id))errors.push('invalid/duplicate '+name+' ID '+r?.id);
    else ids.add(r.id);
  }
}
function atIso(period) {
  if(!validateHistoricalPeriod(period)||period.kind!=='snapshot')return null;
  const d=period.at;
  return String(d.year).padStart(4,'0')+'-'+String(d.month??7).padStart(2,'0')+
    '-'+String(d.day??1).padStart(2,'0');
}
function sourcesValid(ids,available) {
  return Array.isArray(ids)&&ids.length>0&&ids.every(id=>available.has(id));
}
function normalizeSnapshot(isoDate) {
  if(!/^\d{4}-\d{2}-\d{2}$/.test(isoDate))return null;
  const [year,month,day]=isoDate.split('-').map(Number);
  return {kind:'snapshot',at:{year,month,day}};
}

export function validateIndependentHistoricalAdmissions(catalog,admissions,actualCatalog,
  {requireActualCatalog=true}={}) {
  const errors=[];
  if(!plain(admissions)||admissions.schema!==SCHEMA)
    return {ok:false,errors:['Unsupported independent admission register']};
  if(!catalog||!Array.isArray(catalog.versions)||
      catalog.sourceArchiveSha256!==admissions.sourceArchiveSha256)
    errors.push('HistoGIS source archive mismatch');
  if(admissions.coverage?.complete!==false ||
     admissions.coverage?.independentIdentitySnapshotsOnly!==true ||
     admissions.coverage?.administrativeDirectParentageQualified!==false ||
     admissions.coverage?.historicalBoundariesLegallyCertified!==false ||
     admissions.coverage?.primaryHistoricalGeometryAdmitted!==false ||
     admissions.coverage?.notAllPeriodsCertified!==true)
    errors.push('Missing limited-admission and non-certification guards');
  if(!/^[a-f0-9]{64}$/.test(admissions.historicalGeometryGeojsonSha256||'') ||
     !/^[a-f0-9]{64}$/.test(admissions.actualCatalogSha256||'') ||
     !/^[a-f0-9]{64}$/.test(admissions.actualGeometryShardSha256||''))
    errors.push('Missing source-geometry SHA256 fingerprints');
  if(admissions.actualGeometryShard!=='ro-adm-09' ||
     admissions.actualSnapshotDate!=='2026-10-05')
    errors.push('Wrong immutable ACTUAL snapshot/shard');
  const sources=requireArray(admissions.sources,'sources',errors);
  const identities=requireArray(admissions.identityAttestations,'identityAttestations',errors);
  const relations=requireArray(admissions.relationAttestations,'relationAttestations',errors);
  const bridges=requireArray(admissions.bridges,'bridges',errors);
  const geometryDecisions=requireArray(admissions.geometryDecisions,'geometryDecisions',errors);
  const unresolved=requireArray(admissions.unresolved,'unresolved',errors);
  for(const [k,v] of Object.entries({sources,identityAttestations:identities,
    relationAttestations:relations,bridges,unresolved}))unique(v,k,errors);
  if(geometryDecisions.length)errors.push('Pilot cannot admit a primary historical boundary');
  const src=new Map(sources.map(s=>[s.id,s]));
  for(const s of sources)
    if(!nonempty(s.title)||!nonempty(s.url)||!/^https:\/\//.test(s.url) ||
      !INDEPENDENT_KINDS.has(s.kind)||s.independentOfHistogis!==true ||
      s.originalFacsimileInspected!==true&&s.originalFacsimileInspected!==false)
      errors.push('Unqualified or non-independent source '+s.id);
  const v=new Map(catalog?.versions?.map(x=>[x.id,x])||[]);
  const entity=new Set(catalog?.entities?.map(x=>x.id)||[]);
  const hier=new Map(catalog?.hierarchy?.map(x=>[x.id,x])||[]);
  const qaStatus=new Map((catalog?.hierarchy||[]).map(r=>[r.id,r]));
  const mismatchDeclared=unresolved.some(x=>x.kind==='type_mismatch'&&
    x.versionId==='histogis-v9:version:9936');
  const dateMismatchDeclared=unresolved.some(x=>x.kind==='date_mismatch'&&
    x.versionId==='histogis-v9:version:9936');
  if(!mismatchDeclared||!dateMismatchDeclared)
    errors.push('Bukovina source/type/date discrepancy must remain documented');

  for(const a of identities){
    const row=v.get(a.historicalVersionId),iso=atIso(a.attestedAt);
    if(!row||!entity.has(a.historicalEntityId)||
       row.entityId!==a.historicalEntityId||!iso||
       !historicalDateInPeriod(row.period,iso))
      errors.push('Identity attestation outside historical version: '+a.id);
    if(!ATTESTATIONS.has(a.evidenceStatus)||!nonempty(a.verifiedHistoricalType)||
       !sourcesValid(a.sourceIds,src)||a.scope!=='identity_and_type_at_document_date_only'||
       a.boundaryCertified!==false||a.wholeVersionIntervalCertified!==false)
      errors.push('Unqualified/overclaimed independent identity '+a.id);
    // Never silently treat even an accepted historical type as a rewrite of
    // the HistoGIS original attribute.
    if(row?.sourceOriginalType!==a.verifiedHistoricalType &&
       row?.sourceShapeId===9936&&!mismatchDeclared)
      errors.push('Bucovina kingdom/duchy conflict lost');
  }
  for(const r of relations){
    const row=hier.get(r.sourceRelationId);
    const iso=atIso(r.attestedAt);
    if(!row||r.childVersionId!==row.childVersionId||
      r.parentVersionId!==row.parentVersionId||!iso||
      !historicalDateInPeriod(row.period,iso))
      errors.push('Relation attestation does not match source and date '+r.id);
    if(r.evidenceStatus!=='qualified'||
      r.kind!=='territorial_membership_not_direct_parentage'||
      !sourcesValid(r.sourceIds,src)||
      r.boundaryCertified!==false||r.fullIntervalCertified!==false||
      r.directAdministrativeParentCertified!==false)
      errors.push('Unqualified/overclaimed territorial membership '+r.id);
    if(row?.outsideParentPercent>=99.99)
      errors.push('Cannot admit blocked HistoGIS source relation '+r.id);
  }
  const actualEntities=actualCatalog?.entities || [];
  const knownActual=new Map(actualEntities.map(x=>[x.id,x]));
  if(requireActualCatalog&&(!actualCatalog||
      actualCatalog.certificate!=='CERTIFIED_CARTOGRAPHIC_SOURCE_WITH_ACCEPTED_EXCEPTIONS'||
      actualCatalog.sourceSnapshotDate!==admissions.actualSnapshotDate||
      actualEntities.length!==4283))
    errors.push('Must verify immutable certified ACTUAL catalogue');
  for(const b of bridges){
    const row=v.get(b.historicalVersionId),iso=atIso(b.historicalPeriod);
    const current=knownActual.get(b.actualId);
    if(!row||row.entityId!==b.historicalEntityId||
       b.historicalSourceName!==row.name.ro||
       b.historicalSourceType!==row.sourceOriginalType||
       !iso||!historicalDateInPeriod(row.period,iso))
      errors.push('Bridge historical version/date mismatch '+b.id);
    if(requireActualCatalog&&(!current||current.geometryShard!==admissions.actualGeometryShard||
       !current.roles?.includes('administrative')))
      errors.push('Bridge ACTUAL entity missing/not administrative '+b.id);
    const comparison=b.geometryComparison;
    if(b.kind!=='territorial_overlap'||b.evidenceStatus!=='qualified'||
       b.actualSnapshotDate!==admissions.actualSnapshotDate||
       !sourcesValid(b.sourceIds,src)||
       b.referenceScope!=='verified_intersection_between_source_polygons_only'||
       b.institutionalContinuityCertified!==false||
       b.administrativeSuccessionCertified!==false||
       b.identicalBoundaryCertified!==false||
       b.legalBoundaryCertified!==false||
       !plain(comparison)||
       comparison.historicalGeometryId!==row?.geometryId||
       comparison.actualGeometryId!==b.actualId||
       comparison.crs!=='EPSG:3035'||
       !nonempty(comparison.method)||
       !Number.isFinite(comparison.historicalCoveragePercent)||
       !Number.isFinite(comparison.actualCoveragePercent)||
       comparison.historicalCoveragePercent<=0||
       comparison.actualCoveragePercent<=0||
       comparison.historicalCoveragePercent>100||
       comparison.actualCoveragePercent>100)
      errors.push('Invalid spatial-only bridge '+b.id);
  }
  const bridgeGate=validateHistoricalAdminBridge(bridges,{
    actualIds:requireActualCatalog?[...knownActual.keys()]:bridges.map(b=>b.actualId),
    historicalEntityIds:[...entity],historicalVersionIds:[...v.keys()],
    actualSnapshotDate:admissions.actualSnapshotDate
  });
  if(!bridgeGate.ok)errors.push(...bridgeGate.errors.map(e=>'bridge: '+e));
  if(bridges.some(x=>x.kind==='institutional_continuity'||
    x.kind==='administrative_succession'||x.kind==='identical_boundary'))
    errors.push('Only measured territorial overlap is admitted');
  if(!unresolved.every(x=>nonempty(x.id)&&nonempty(x.kind)&&nonempty(x.status)))
    errors.push('Unresolved issue register invalid');
  return {ok:errors.length===0,errors:[...new Set(errors)]};
}

export async function loadIndependentHistoricalAdmissions(catalog,
  baseUrl=import.meta.env?.BASE_URL??'/') {
  const prefix=baseUrl.replace(/\/?$/,'/')+'data/historical/v1/';
  const response=await fetch(prefix+'admissions.json');
  if(!response.ok)throw Error('Independent admission register HTTP '+response.status);
  const admissions=await response.json();
  const gate=validateIndependentHistoricalAdmissions(catalog,admissions,null,
    {requireActualCatalog:false});
  if(!gate.ok)throw Error('Independent admission register invalid: '+gate.errors.join('; '));
  return admissions;
}

export function independentAttestationsForVersion(admissions,versionId,
  {qualifiedOnly=false}={}) {
  return (admissions?.identityAttestations||[]).filter(x=>
    x.historicalVersionId===versionId&&
    (!qualifiedOnly||x.evidenceStatus==='qualified'));
}

export function independentMembershipsForVersion(admissions,versionId) {
  return (admissions?.relationAttestations||[]).filter(x=>
    x.childVersionId===versionId||x.parentVersionId===versionId);
}

export function independentBridgesForActual(admissions,actualId) {
  return (admissions?.bridges||[]).filter(x=>x.actualId===actualId &&
    x.evidenceStatus==='qualified'&&x.kind==='territorial_overlap');
}

export function independentBridgesForHistorical(admissions,entityId) {
  return (admissions?.bridges||[]).filter(x=>
    x.historicalEntityId===entityId && x.evidenceStatus==='qualified' &&
    x.kind==='territorial_overlap');
}
