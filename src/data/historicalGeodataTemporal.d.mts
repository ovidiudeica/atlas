import type {GeodataSourceIndex} from './historicalGeodata.mjs';
export interface HistoricalGeodataTemporalProjection {
 schema:'atlas-historical-geodata-temporal-projection-v1';
 sourceSchema:string;
 sourceFamilies:['OHM'];
 sourceOnly:true;
 legalBoundariesCertified:false;
 entities:Array<{
   id:string;names:{ro:string;en:string};sourceGroup:string;
   sourceFamily:'OHM';groupingBasis:'editorial_directory_only';
   identityReviewStatus:'in_review';institutionalContinuityQualified:false;
   boundaryCertification:'not_certified';
 }>;
 versions:Array<{
   id:string;entityId:string;geometryId:string;sourceFamily:'OHM';
   sourceIds:string[];period:unknown;evidenceStatus:'in_review';
   boundaryCertification:'not_certified';periodQualified:false;
 }>;
 geometries:Array<{geometryId:string;sourceUseIds:string[];historicalBoundaryCertified:false}>;
 geometryUses:Array<{useId:string;geometryId:string;entityId:string;versionId:string;period:unknown;evidenceStatus:'in_review'}>;
 undatedGeometryReferences:Array<{sourceId:string;entityId:string;geometryId:string;reason:'NO_VALID_HISTORICAL_PERIOD'}>;
 hierarchy:[];bridge:[];events:[];symbols:[];geometryDecisions:[];
 administrativeParentsQualified:0;crossModuleIdentityQualified:0;
}
export declare function projectGeodataHistoricalSourceCatalog(index:GeodataSourceIndex):HistoricalGeodataTemporalProjection;
