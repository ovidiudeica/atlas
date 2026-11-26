import type {Feature,Polygon,MultiPolygon} from 'geojson';
import type {UrbanClassification} from './historicalRohgisUrban1930.mjs';
export interface GeodataSourceEntry {
  id:string;
  sourceFamily:string;
  sourceAdapter?:'supplemental';
  sourceCitation?:{license:string;licenseUrl:string;creator:string;title:string;url:string;basis:string;adaptation:string;sourceUrls:string[]};
  sourceGroup:string;
  displayName:{ro:string;en:string};
  sourcePeriod:{start:string|null;end:string|null;sourceOnly:true;kind?:'interval'|'snapshot'|'undated';notes?:string|null};
  sourceType:string|null;
  sourceRank?:'II'|'III';
  urbanClassification?:UrbanClassification;
  geometryId:string;
  featureId:string;
  geometryShard:string;
  sourceDriveFileId:string|null;
  sourcePath:string;
  sourceFileSha256:string;
  geometryValidSource:boolean;
  sourceFilename:string;
  sourceRelationId:number|null;
  sourceFeatureIndex?:number;
  sourceExternalId?:string;
  sourceRightsStatus?:'HOLD_PENDING_REUSE_CONFIRMATION';
  provenance:string;
  status:'source_candidate_not_certified';
  sourceTagWarnings:string[];
}
export interface GeodataSourceIndex {
  schema:'atlas-geodata-historical-source-index-v1';
  asOf:string;
  status:string;
  sourceDomain:string;
  collection:string;
  notCanonicalHierarchy:true;
  notLegalBoundaryCertification:true;
  coordinateReferenceSystem:'EPSG:4326';
  geometryDuplicates:[string,string][];
  shards:{file:string;count:number}[];
  entries:GeodataSourceEntry[];
  sourceFamilies?:string[];
  sourceRightsReviewRequired?:boolean;
  missingSources:string;
}
export type GeodataSourceFeature=Feature<Polygon|MultiPolygon>;
export declare const HISTORICAL_GEODATA_SCHEMA:string;
export declare function validateGeodataHistoricalIndex(index:unknown):{ok:boolean;errors:string[]};
export declare function geodataSourceAtDate(entry:GeodataSourceEntry,iso:string):boolean;
export declare function geodataSourcesAtYear(index:GeodataSourceIndex,year:number):GeodataSourceEntry[];
export declare function validateGeodataGeometryShard(shard:unknown,index:GeodataSourceIndex,file:string):{ok:boolean;errors:string[]};
export declare function loadGeodataSourceIndex(base?:string):Promise<GeodataSourceIndex>;
export declare function loadGeodataSourceFeature(index:GeodataSourceIndex,entry:GeodataSourceEntry,base?:string):Promise<GeodataSourceFeature>;

export declare function loadGeodataSharedAsset(index:GeodataSourceIndex,entry:GeodataSourceEntry,base?:string):Promise<GeodataSourceFeature>;
