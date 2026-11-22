import type {PilotHistoricalCatalog} from './historicalCatalog.mjs';
import type {HistoricalBoundaryReview} from './historicalBoundaryReview.mjs';
export interface TrialGCP {
 id:string;placeName:string;
 pixelPreview:{x:number;y:number};
 targetWgs84:{lon:number;lat:number};
 role:'FIT'|'HOLDOUT';
 referenceSourceId:string;
 landmarkKind:'historic_town_center_map_symbol_or_label';
 directImageInspection:true;
 pointQuality:'provisional_visual_only_not_ground_survey';
 pixelUncertaintyPreviewPx:number;
 referenceLocationUncertaintyMeters:number;
 fitHoldoutIndependence:'disjoint_coordinates_but_not_blind_selection';
 note:string;
}
export interface OriginalMapTrialSource {
 id:string;year:number;title:string;archiveUrl:string;catalogUrl:string;
 fileType:string;rasterDataset:string;
 rasterNative:{width:number;height:number;pages:number;mapPage:number};
 analysisPreview:{width:number;height:number};
 archiveSha256:string;archiveBytes:number;
 independentOfHistoGIS:true;cartographicImageVerified:true;
 scaleClaim:string;controls:TrialGCP[];
}
export interface OriginalBoundaryTrialCase {
 sourceRelationId:string;childName:string;parentName:string;
 childVersionId:string;parentVersionId:string;
 baselineOutsidePercent:number;baselineDecision:string;
 original1835InventoryEvidence:string;
 independentBoundaryLine1835:'not_traced';
 independentBoundaryLine1841:'not_traced';
 mapToMapLineFitStatus:'blocked_due_to_uncertified_georef';
 administrativeParentReassignment:null;newGeometryId:null;
 decision:'BLOCKED_SOURCE_PARENT'|'HOLD_ORIGINAL_BOUNDARY_RECONCILIATION';
 fullPeriodLegalParentQualified:false;legalBoundaryCertified:false;
}
export interface OriginalMapFitHoldoutRegister {
 schema:'atlas-historical-fit-holdout-review-v1';asOf:string;scope:string;
 historicalArchiveSha256:string;parentageReviewSha256:null;
 originalRasterSources:OriginalMapTrialSource[];
 coordinateReferences:{id:string;url:string;type:string}[];
 transformation:{
 model:'affine_2d_least_squares';targetCRS:'EPSG:3035';
 previewPixelsConvertedToNative:true;
 fitMinimum:6;holdoutMinimum:3;fitAndHoldoutDisjoint:true;
 trialMaximumHoldoutRMSEMeters:5000;trialMaximumHoldoutErrorMeters:10000;
 limits:string;independentControlClassification:string;
 groundSurveyedLandmarks:0;independentGeomorphicHoldouts:0;
 certifiedGeoreferencingAllowed:false;
 };
 boundaryCases:OriginalBoundaryTrialCase[];
 admissions:{
 newCanonicalGeoreferencedRasters:0;newHistoricalGeometryIds:0;
 changedOriginalHistoGISGeometries:0;changedHistoricalParents:0;
 changedACTUAL:0;directlyVerifiedOriginalBoundaryLines:0;
 caseCount:8;blockedSourceParentCount:2;otherBoundaryHoldCount:6;
 };
 uncertaintyNote:string;outcome:null;
}
export interface TrialMapFitHoldout {
 sourceId:string;year:number;archiveSha256:string;sourceFileVerified:true;
 targetCRS:'EPSG:3035';model:string;geotransformNative:number[];
 fitCount:number;holdoutCount:number;fitRMSEMeters:number;
 holdoutRMSEMeters:number;holdoutMaxMeters:number;
 fitHoldoutDisjoint:true;blindIndependentHoldout:false;
 fitReferenceIsIndependentOfHistoGIS:true;
 approvedForBoundaryTracing:false;historicalBoundaryCertified:false;
 certificationDecision:'HOLD';suitableForCanonicalHistoricalGeometry:false;
 passNumericTrialGates:false;limitations:string;
 points:{
  id:string;placeName:string;role:'FIT'|'HOLDOUT';
  pixelNative:number[];errorMeters:number;positionQuality:string;
  referenceSourceId:string;
 }[];
}
export interface OriginalMapFitHoldoutResults {
 schema:'atlas-historical-fit-holdout-results-v1';
 scope:string;independentHistoGISDigitizationUsedInFit:false;
 pointConfidence:'provisional_visual';blindHoldout:false;
 acceptedOriginalMapGeoreferencing:0;acceptedLegalHistoricalBoundaryPolygons:0;
 acceptedReparentings:0;maps:TrialMapFitHoldout[];
 eightCases:{
  sourceRelationId:string;childName:string;parentName:string;
  sourceOutsidePercent:number;sourceBaselineDecision:string;
  original1835LineDigitized:false;original1841LineDigitized:false;
  fitHoldoutGeoreferencingAccepted:false;
  decision:'BLOCKED_SOURCE_PARENT'|'HOLD_ORIGINAL_BOUNDARY_RECONCILIATION';
  legalBoundaryCertified:false;reassignedLegalParent:null;
  newHistoricalGeometryId:null;
 }[];
}
export function validateOriginalMapFitHoldout(
 pilot:PilotHistoricalCatalog,review:HistoricalBoundaryReview,
 register:OriginalMapFitHoldoutRegister,results:OriginalMapFitHoldoutResults
):{ok:boolean;errors:string[]};
export function loadOriginalMapFitHoldout(
 pilot:PilotHistoricalCatalog,review:HistoricalBoundaryReview,baseUrl?:string
):Promise<{register:OriginalMapFitHoldoutRegister;results:OriginalMapFitHoldoutResults}>;
export function fitHoldoutCaseForVersion(
 register:OriginalMapFitHoldoutRegister|null,versionId:string
):OriginalBoundaryTrialCase[];
