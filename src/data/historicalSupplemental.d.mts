import type {GeodataSourceEntry,GeodataSourceFeature} from './historicalGeodata.mjs';
export interface SupplementalCitation {
 license:'CC BY 4.0';licenseUrl:string;creator:string;title:string;url:string;basis:string;adaptation:string;
}
export interface SupplementalEntry extends GeodataSourceEntry {
 sourceAdapter:'supplemental';entityId:string;collectionId:string;region:string;
 sourceCitation:SupplementalCitation&{sourceUrls:string[]};
}
export interface SupplementalCollection {
 id:string;sourceFamily:string;name:{ro:string;en:string};citation:SupplementalCitation;
 regions:Record<string,{ro:string;en:string}>;
}
export interface SupplementalRelation {
 id:string;parentId:string;childId:string;start:string;end:string;sourceOnly:true;
 qualifiedHistoricalParentage:false;topologicalReviewRequired:boolean;outsideParentPercent:number;sourceUrls:string[];
}
export interface SupplementalCatalog {
 schema:'atlas-historical-supplemental-v1';sourceOnly:true;legalBoundariesCertified:false;crs:'EPSG:4326';
 collections:SupplementalCollection[];geometryShards:{file:string;count:number;sourceGitBlob?:string}[];
 assets:{id:string;featureId:string;shard:string;canonicalHash:string;sourceOnly:true}[];
 entries:SupplementalEntry[];relations:SupplementalRelation[];
}
export interface SupplementalNode {entry:SupplementalEntry;children:SupplementalNode[];parent:SupplementalRelation|null;}
export interface SupplementalTree {collection:SupplementalCollection;groups:{id:string;name:{ro:string;en:string};roots:SupplementalNode[]}[];}
export declare const SUPPLEMENTAL_SCHEMA:string;
export declare function supplementalEntryAtYear(entry:GeodataSourceEntry,year:number):boolean;
export declare function validateSupplementalCatalog(data:unknown):{ok:boolean;errors:string[]};
export declare function validateSupplementalShard(data:unknown,catalog:SupplementalCatalog,file:string):{ok:boolean;errors:string[]};
export declare function loadSupplementalCatalog(base?:string):Promise<SupplementalCatalog>;
export declare function loadSupplementalFeature(catalog:SupplementalCatalog,entry:SupplementalEntry,base?:string):Promise<GeodataSourceFeature>;
export declare function buildSupplementalTree(catalog:SupplementalCatalog|null,year:number,yearOnly?:boolean,query?:string):SupplementalTree[];
