import type { HistoricalPeriod, EvidenceStatus } from './historicalAdminBridge.mjs';
import type { HistoricalGeometryUse, HistoricalGeometryRecord } from './historicalGeometryUses.mjs';
import type { HistoricalHierarchyLink } from './historicalTemporalHierarchy.mjs';
import type { HistoricalEvent, HistoricalSymbolUse, HistoricalGeometryDecision } from './historicalLifeCycle.mjs';

export interface HistoricalIdentity {
  id: string;
  sourceName: string;
  names: { ro: string; en: string };
  sourceLanguage: string;
  untranslatedSourceLabel: boolean;
  wikidataId: string | null;
  identityReviewStatus: EvidenceStatus;
  sourceShapeIds: number[];
  startDate: string;
  endDate: string;
}
export interface HistoricalVersion {
  id: string;
  entityId: string;
  geometryId: string;
  sourceShapeId: number;
  sourceFile: string;
  name: {ro:string;en:string};
  sourceOriginalType: string;
  period: HistoricalPeriod;
  sourceIds: string[];
  evidenceStatus: EvidenceStatus;
  boundaryCertification: 'not_certified';
}
export interface PilotHistoricalGeometry extends HistoricalGeometryRecord {
  hashMethod: 'sha256:canonical-json-object:source-crs';
  crs: string;
  sourceShapeIds: number[];
  evidenceStatus: EvidenceStatus;
  boundaryCertification: 'not_certified';
  geometryAvailable: true;
}
export interface PilotHistoricalCatalog {
  schema: 'atlas-historical-pilot-v1';
  release: string;
  sourceRelease: string;
  sourceArchiveSha256: string;
  citation: {
    creator:string;title:string;doi:string;license:'CC-BY-4.0';
    licenseUrl:string;adaptation:string;
  };
  coverage: {
    regions:string[]; complete:false; historicalBoundariesCertified:false;
    actualInteroperabilityCoverage:string; hierarchyQualified:false; notes:string;
  };
  geometryFile: string;
  sources: {id:string;name:string;url:string;rights:string}[];
  entities: HistoricalIdentity[];
  versions: HistoricalVersion[];
  geometries: PilotHistoricalGeometry[];
  geometryUses: HistoricalGeometryUse[];
  hierarchy: (HistoricalHierarchyLink & {
    outsideParentPercent:number;topologicalReviewRequired:boolean;
    qualifiedHistoricalParentage:false;
  })[];
  bridge: [];
  events: HistoricalEvent[];
  symbols: HistoricalSymbolUse[];
  geometryDecisions: HistoricalGeometryDecision[];
  qa: {
    topologicallyValidSourcePolygons:number;sourcePolygons:number;
    distinctGeometryAssets:number;geometryReuseCount:number;
    hierarchyLinks:number;hierarchyLinksOutsideParentOver0_1pct:number;
    maxOutsideParentPercent:number;sourceTypeCounts:Record<string,number>;
    status:string;
  };
}
export function validateHistoricalPilotCatalog(
  catalog: PilotHistoricalCatalog, geometryCollection?: unknown
): {ok:boolean; errors:string[]};
export function versionsForHistoricalEntity(
  catalog: PilotHistoricalCatalog, entityId: string
): HistoricalVersion[];
export function historicalChildrenAtDate(
  catalog:PilotHistoricalCatalog,parentVersionId:string,isoDate:string,
  perspectiveId:string, options?:{includeCandidates?:boolean}
): {childVersionId:string;relationId:string;evidenceStatus:EvidenceStatus;topologicalReviewRequired:boolean}[];
export function historicalParentAtDate(
  catalog:PilotHistoricalCatalog,childVersionId:string,isoDate:string,
  perspectiveId:string,options?:{includeCandidates?:boolean}
): {parentVersionId:string;relationId:string;evidenceStatus:EvidenceStatus}[];
export function geometryUsesInHistoricalCatalog(
  catalog:PilotHistoricalCatalog,geometryId:string
): HistoricalGeometryUse[];
export function loadHistoricalPilotCatalog(baseUrl?:string):Promise<PilotHistoricalCatalog>;
