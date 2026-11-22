import type {GeodataSourceIndex} from './historicalGeodata.mjs';
export interface HistoricalGeodataTemporalProjection {
  schema:'atlas-historical-geodata-temporal-projection-v1';
  sourceSchema:string;sourceOnly:true;legalBoundariesCertified:false;
  entities:Array<{id:string;names:{ro:string;en:string};sourceId:string;identityReviewStatus:'in_review'}>;
  versions:Array<{id:string;entityId:string;geometryId:string;period:unknown;evidenceStatus:'in_review';boundaryCertification:'not_certified'}>;
  geometries:Array<{geometryId:string;sourceUseIds:string[];historicalBoundaryCertified:false}>;
  geometryUses:Array<{useId:string;geometryId:string;entityId:string;versionId:string;period:unknown;evidenceStatus:'in_review'}>;
  undatedGeometryReferences:Array<{sourceId:string;entityId:string;geometryId:string;reason:'NO_VALID_HISTORICAL_PERIOD'}>;
  hierarchy:[];bridge:[];events:[];symbols:[];geometryDecisions:[];
  administrativeParentsQualified:0;crossModuleIdentityQualified:0;
}
export declare function projectGeodataHistoricalSourceCatalog(index:GeodataSourceIndex):HistoricalGeodataTemporalProjection;
