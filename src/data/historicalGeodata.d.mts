import type {Feature,Polygon,MultiPolygon} from 'geojson';
export interface GeodataSourceEntry {
  id:string;
  sourceFamily:'OHM';
  sourceGroup:string;
  displayName:{ro:string;en:string};
  sourcePeriod:{start:string|null;end:string|null;sourceOnly:true;notes?:string|null};
  sourceType:string|null;
  geometryId:string;
  featureId:string;
  geometryShard:string;
  sourceDriveFileId:string;
  sourceFilename:string;
  sourceRelationId:number;
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
