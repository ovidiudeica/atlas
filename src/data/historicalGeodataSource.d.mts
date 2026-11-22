import type {Feature} from 'geojson';
export interface GeodataSourceVersion {
 id:string; sourceFile:string; featureIndex:number; geometryAssetId:string;
 name:{ro:string;en:string}; sourceCollection:string; sourceIdentity:string;
 period:{kind:'snapshot';at:string;precision:string}|{kind:'source_interval';start:string|null;end:string|null};
 sourceTags:{originalType:string|null;region:string|null;circles:string|null;sourceName:string|null};
 sourceStatus:'SOURCE_GEOMETRY_DISPLAY_ONLY';boundaryCertification:'NOT_CERTIFIED';
 administrativeParentStatus:'NOT_QUALIFIED';sourceUrl:string|null;
}
export interface GeodataSourceCatalog {
 schema:'atlas-historical-geodata-source-import-v1';status:'SOURCE_INTEGRATION_UNCERTIFIED';
 assets:Array<{id:string;originalFile:string;featureIndex:number;geometryType:string}>;
 versions:GeodataSourceVersion[];sourcePolygonOccurrences:number;uniqueGeometryAssets:number;
 historicalPolygonSourcesCount:number;policies:Record<string,boolean>;
}
export declare const GEODATA_SOURCE_SCHEMA:string;
export declare function validateGeodataSourceCatalog(catalog:GeodataSourceCatalog):{ok:boolean;errors:string[]};
export declare function geodataVersionAttestedAtYear(v:GeodataSourceVersion,year:number):boolean;
export declare function geodataPeriodLabel(v:GeodataSourceVersion,lang?:'ro'|'en'):string;
export declare function loadGeodataSourceCatalog(base?:string):Promise<GeodataSourceCatalog>;
export declare function loadGeodataSourceFeature(catalog:GeodataSourceCatalog,entry:GeodataSourceVersion,base?:string):Promise<Feature>;
