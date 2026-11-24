import type {Feature,Polygon,MultiPolygon} from 'geojson';
import type {UrbanClassification} from './historicalRohgisUrban1930.mjs';
import type {GeodataSourceEntry} from './historicalGeodata.mjs';
export interface Rohgis1930Version {
 entityId:string; versionId:string; geometryId:string; geometryShard:string;
 parentId:string;nameRo:string;kind:'judet'|'plasa'|'urban_unit';sourceRank?:'II'|'III';
 start:'1930-01-01';end:'1930-12-31';
 sourceDriveFileId:string;sourceRecordId:string;sourceHashSha256:string;
 boundaryCertified:false;crossFamilyIdentityCertified:false;
 temporalStatus:'DOCUMENTARY_1930_SNAPSHOT_ONLY';
 sourceCollectionPeriod:string;
 urbanClassification?:UrbanClassification;
}
export interface Rohgis1930Catalog {
 schema:'hist-ohm-tree4-rohgis-1930-catalog-v1';
 sourceFamily:'ROHGIS';admittedSnapshot:'1930';yearFilterRestriction:'ONLY_1930';
 historicalLegalBoundariesCertified:false;documentaryStateRoot:string;
 versions:Rohgis1930Version[];
 geometryShards:{path:string;count:number;bytes:number;sha256:string}[];
 geometryAssetCount:number;duplicateGeometryUses:unknown[];
}
export declare const ROHGIS_1930_SCHEMA:string;
export declare function validateRohgis1930Catalog(data:unknown):{ok:boolean;errors:string[]};
export declare function rohgis1930VersionsAtYear(catalog:Rohgis1930Catalog,year:number):Rohgis1930Version[];
export declare function toRohgisGeodataEntry(v:Rohgis1930Version):GeodataSourceEntry;
export declare function loadRohgis1930Catalog(base?:string):Promise<Rohgis1930Catalog>;
export declare function loadRohgis1930Feature(catalog:Rohgis1930Catalog,version:Rohgis1930Version,base?:string):Promise<Feature<Polygon|MultiPolygon>>;
