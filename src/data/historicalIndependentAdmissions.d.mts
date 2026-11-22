import type { HistoricalPeriod, HistoricalAdminLink, EvidenceStatus } from './historicalAdminBridge.mjs';
import type { PilotHistoricalCatalog } from './historicalCatalog.mjs';

export interface IndependentSource {
 id:string;title:string;publisher:string;originalDate:string;
 kind:string;url:string;section:string;independentOfHistogis:true;
 originalFacsimileInspected:boolean;scope:string;
}
export interface IdentityAttestation {
 id:string;historicalEntityId:string;historicalVersionId:string;
 evidenceStatus:EvidenceStatus;scope:'identity_and_type_at_document_date_only';
 attestedAt:Extract<HistoricalPeriod,{kind:'snapshot'}>;
 verifiedHistoricalType:string;sourceIds:string[];
 boundaryCertified:false;wholeVersionIntervalCertified:false;note:string;
}
export interface MembershipAttestation {
 id:string;sourceRelationId:string;childVersionId:string;parentVersionId:string;
 evidenceStatus:'qualified';kind:'territorial_membership_not_direct_parentage';
 attestedAt:Extract<HistoricalPeriod,{kind:'snapshot'}>;sourceIds:string[];
 boundaryCertified:false;fullIntervalCertified:false;
 directAdministrativeParentCertified:false;note:string;
}
export interface SourceOverlapBridge extends HistoricalAdminLink {
 kind:'territorial_overlap';evidenceStatus:'qualified';
 referenceScope:'verified_intersection_between_source_polygons_only';
 historicalSourceName:string;historicalSourceType:string;
 historicalSourcePeriod:HistoricalPeriod;
 institutionalContinuityCertified:false;administrativeSuccessionCertified:false;
 identicalBoundaryCertified:false;legalBoundaryCertified:false;
 geometryComparison:NonNullable<HistoricalAdminLink['geometryComparison']>;
 note:string;
}
export interface HistoricalIndependentAdmissions {
 schema:'atlas-historical-independent-admissions-v1';
 sourceArchiveSha256:string;
 actualSnapshotDate:'2026-10-05';
 actualCatalogSha256:string;
 historicalGeometryGeojsonSha256:string;
 actualGeometryShard:'ro-adm-09';
 actualGeometryShardSha256:string;
 coverage:{
 complete:false;independentIdentitySnapshotsOnly:true;
 administrativeDirectParentageQualified:false;
 historicalBoundariesLegallyCertified:false;
 primaryHistoricalGeometryAdmitted:false;notAllPeriodsCertified:true;
 };
 sources:IndependentSource[];
 identityAttestations:IdentityAttestation[];
 relationAttestations:MembershipAttestation[];
 bridges:SourceOverlapBridge[];
 geometryDecisions:[];
 unresolved:{id:string;versionId?:string;kind:string;status:string;note:string;[key:string]:unknown}[];
}
export function validateIndependentHistoricalAdmissions(
 catalog:PilotHistoricalCatalog,
 admissions:HistoricalIndependentAdmissions,
 actualCatalog:{certificate:string;sourceSnapshotDate:string;entities:{
  id:string;geometryShard:string;roles:string[]}[]} | null,
 options?:{requireActualCatalog?:boolean}
):{ok:boolean;errors:string[]};
export function loadIndependentHistoricalAdmissions(
 catalog:PilotHistoricalCatalog,baseUrl?:string
):Promise<HistoricalIndependentAdmissions>;
export function independentAttestationsForVersion(
 admissions:HistoricalIndependentAdmissions | null,versionId:string,
 options?:{qualifiedOnly?:boolean}
):IdentityAttestation[];
export function independentMembershipsForVersion(
 admissions:HistoricalIndependentAdmissions | null,versionId:string
):MembershipAttestation[];
export function independentBridgesForActual(
 admissions:HistoricalIndependentAdmissions | null,actualId:string
):SourceOverlapBridge[];
export function independentBridgesForHistorical(
 admissions:HistoricalIndependentAdmissions | null,entityId:string
):SourceOverlapBridge[];
