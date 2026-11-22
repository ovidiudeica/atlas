import type {HistoricalPeriod} from './historicalAdminBridge.mjs';
import type {PilotHistoricalCatalog} from './historicalCatalog.mjs';
import type {HistoricalQualification} from './historicalQualification.mjs';

export interface Historical1851District {
  id:string;originalName:string;lawOfficeType:'politischer Bezirk / Bezirkshauptmannschaft';
  parentId:string;sourceHistoricalVersionId:null;geometryMissingInHistoGIS:true;
  qualifiedDirectParentNormativelyAtPublication:true;
  activeAdministrationVerified:false;boundaryQualified:false;rowOrdinal:number;
}
export interface Historical1851Kreis {
  id:string;originalName:string;lawOfficeType:'Kreis';lawParentId:string;
  sourceHistoricalVersionId:string|null;
  sourceHistoricalShapeId:number|null;sourceCatalogType:'County'|null;
  existence:'normative_organization_as_published_not_verified_activated';
  qualifiesDirectParentFromCrownlandOnGazetteDate:true;
  boundaryQualified:false;geometryMissingInHistoGIS:boolean;
  annexSection:'§2–§3; Beilage A/B';
  children:Historical1851District[];
}
export interface HistoricalBoundaryDispute {
  sourceRelationId:string;childVersionId:string;parentVersionId:string;
  childName:string;parentName:string;outsidePercentEqualArea:number;
  sourceTopologyVerdict:'blocked_spatial_contradiction'|'requires_boundary_reconciliation';
  independentBoundaryStatus:'on_hold_pending_contemporary_raster_gcp_fit_holdout';
  earlierPeriodAdministrativeParentStatus:'blocked_invalid_source_parent'|'unproven_direct_parent';
  qualitativeOriginalEvidence:string;checkedAgainst:string[];checkLimit:string;
  independentGcpFit:[];independentGcpHoldout:[];
  boundaryLineIndependentlyVectorized:false;legalBoundaryQualified:false;
  originalGeometryKept:true;proposedReplacementParentId:null;
  proposedReplacementGeometryId:null;
}
export interface HistoricalBoundaryReview {
  schema:'atlas-historical-boundary-parentage-review-v1';
  report:'HIST-MODULE.3b';asOf:string;
  pilotArchiveSha256:string;
  originalHierarchiesCount:number;originalGeometriesCount:number;
  originalQualificationCounts:Record<string,number>;
  sources:{
    id:string;kind:string;title:string;date:string;url:string;
    originalDownloadedAndHashed:boolean;independentOfHistoGIS:boolean;
    originalRasterUrl?:string|null;sourceScaleDenominator?:number;
    archiveSha256?:string;archiveBytes?:number;published?:string;
    originalFacsimileVisuallyChecked?:boolean;
    independentlyGeoreferenced?:boolean;limitation:string;
    [key:string]:unknown;
  }[];
  legalHierarchy:{
    evidenceId:string;sourceSection:string;
    attestedAt:Extract<HistoricalPeriod,{kind:'snapshot'}>;
    perspectiveId:'austria-1851-published-normative-organization';
    claimStatus:'qualified_normative_structure_at_publication_only';
    legalNormDate:'1851-05-12';
    firstGazettePublicationDate:'1851-05-16';
    effectiveOperationConfirmed:false;completeDurationConfirmed:false;
    historicalBoundariesQualified:false;
    directParentClaimScope:string;
    crownlandHistoricalVersionId:string;
    regionCount:5;districtCount:36;regions:Historical1851Kreis[];
  };
  boundaryDisputes:HistoricalBoundaryDispute[];
  independentGeoreferencing:{
    controlCandidates:[];fit:[];holdout:[];
    targetSourceId:string;minimumFitCount:number;minimumHoldoutCount:number;
    distinctPhysicalObjectsRequired:true;fitHoldoutIndependent:true;
    georeferencingProduced:false;holdoutPassed:false;
    independentBoundaryVectorizationCompleted:false;
    selectedNewHistoricalGeometryIds:[];boundaryPromotionsPermitted:false;
  };
  admissions:{
    directParentsAtNormativePublication:41;
    historicalDirectParentsForFullPeriods:0;
    earlier1815To1849ParentCorrections:0;
    newlyCertifiedLegalBoundaryPolygons:0;
    newlyGeneratedPolygons:0;
  };
  caveats:string[];
}
export interface HistoricalLawTreeNode {
 id:string;name:string;historicalVersionId:string|null;
 children:{id:string;name:string;historicalVersionId:null}[];
}
export const HIST3B_SCHEMA:'atlas-historical-boundary-parentage-review-v1';
export function validateHistoricalBoundaryReview(
 catalog:PilotHistoricalCatalog,
 qualification:HistoricalQualification,
 review:HistoricalBoundaryReview
):{ok:boolean;errors:string[]};
export function loadHistoricalBoundaryReview(
 catalog:PilotHistoricalCatalog,qualification:HistoricalQualification,baseUrl?:string
):Promise<HistoricalBoundaryReview>;
export function historicalLawHierarchyAtYear(
 review:HistoricalBoundaryReview|null,year:number
):HistoricalLawTreeNode[];
export function historicalBoundaryIssueForVersion(
 review:HistoricalBoundaryReview|null,versionId:string
):HistoricalBoundaryDispute[];
