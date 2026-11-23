import type {GeodataSourceEntry,GeodataSourceIndex} from './historicalGeodata.mjs';
export interface OhmParentageLink {
 id:string;parentSourceGroup:string;childSourceGroup:string;
 start:string;end:string;kind:'direct_administrative_membership';
 evidenceStatus:'qualified_membership_only';boundaryCertified:false;sourceIdentityCertified:false;
 evidence:Array<{url:string;type:string;detail:string}>;note?:string;
}
export interface OhmParentageRegister {
 schema:'atlas-historical-ohm-parentage-v1';asOf:string;status:string;
 links:OhmParentageLink[];
}
export interface OhmTreeNode {
 id:string;group:string;name:{ro:string;en:string};
 category:'regions'|'counties'|'comitates';
 qualification:'provisional_source_identity';
 parentGroup:string|null;parentEvidence:OhmParentageLink|null;
 versions:GeodataSourceEntry[];children:OhmTreeNode[];activeEntries:GeodataSourceEntry[];
}
export interface OhmTree {
 year:number;referenceDate:string;sourceOnly:true;
 roots:{regions:OhmTreeNode[];counties:OhmTreeNode[];comitates:OhmTreeNode[]};
 nodes:Map<string,OhmTreeNode>;activeLinks:OhmParentageLink[];
 assetCount:number;geometryUses:unknown[];sourceVersionCount:number;
 groupCount:number;unresolvedParents:number;
 legalBoundariesCertified:false;qualifiedGeometryBorders:0;
}
export declare const OHM_PARENTAGE_SCHEMA:'atlas-historical-ohm-parentage-v1';
export declare function entityIdFromGroup(group:string):string;
export declare function ohmCategory(group:string):'regions'|'counties'|'comitates';
export declare function groupShortName(group:string):string;
export declare function sourceAtReferenceYear(index:GeodataSourceIndex,year:number):Set<string>;
export declare function validateOhmParentage(index:GeodataSourceIndex,register:OhmParentageRegister):{ok:boolean;errors:string[]};
export declare function buildHistoricalOhmTree(index:GeodataSourceIndex,register:OhmParentageRegister,year:number):OhmTree;
export declare function uniqueSourceVersionAtYear(node:OhmTreeNode|null,year:number):GeodataSourceEntry|null;
