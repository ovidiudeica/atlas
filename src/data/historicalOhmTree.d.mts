import type {GeodataSourceEntry,GeodataSourceIndex} from './historicalGeodata.mjs';
export interface HistoricalDocumentaryParent {
 id:string;names:{ro:string;en:string};kind:string;
 documentedWindows:Array<{start:string;end:string;
  dateStatus:'EVIDENCE_SCOPE_NOT_INSTITUTIONAL_BIRTH_OR_DEATH'}>;
 geometryId:null;geometryStatus:'NO_GEOMETRY_DOCUMENTARY_NODE';
 sourceFamily:'HISTORICAL_DOCUMENTARY_PARENT';
 identityReviewStatus:'DOCUMENTED_PARENT_INSTITUTION_NOT_CERTIFIED_BOUNDARY';
 evidence:Array<{url:string;type:string;detail:string}>;
 provenance:string;noLegalBoundaryCertification:true;
}
export interface HistoricalDocumentaryParentRegistry {
 schema:'atlas-historical-documentary-parents-v1';asOf:string;
 sourceOnly:true;legalBoundariesCertified:false;
 nodes:HistoricalDocumentaryParent[];
}
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
 qualification:'provisional_source_identity'|'documented_parent_institution_only';
 documentaryOnly?:boolean;geometryId?:null;
 geometryStatus?:'NO_GEOMETRY_DOCUMENTARY_NODE';
 documentedWindows?:HistoricalDocumentaryParent['documentedWindows'];
 evidence?:HistoricalDocumentaryParent['evidence'];
 institutionKind?:string;provenance?:string;
 parentGroup:string|null;parentEvidence:OhmParentageLink|null;
 versions:GeodataSourceEntry[];children:OhmTreeNode[];activeEntries:GeodataSourceEntry[];
}
export interface OhmTree {
 year:number;referenceDate:string;
 parentageTimeResolution:'calendar_year_documented_at_some_point';
 ambiguousAnnualParents:string[];sourceOnly:true;
 roots:{regions:OhmTreeNode[];counties:OhmTreeNode[];comitates:OhmTreeNode[]};
 nodes:Map<string,OhmTreeNode>;activeLinks:OhmParentageLink[];
 assetCount:number;documentaryNodeCount:number;documentaryRootCount:number;
 documentaryOnlyGeometryCount:0;geometryUses:unknown[];sourceVersionCount:number;
 groupCount:number;unresolvedParents:number;
 legalBoundariesCertified:false;qualifiedGeometryBorders:0;
}
export declare const OHM_PARENTAGE_SCHEMA:'atlas-historical-ohm-parentage-v1';
export declare const DOCUMENTARY_PARENTS_SCHEMA:'atlas-historical-documentary-parents-v1';
export declare function isDocumentaryParentId(id:unknown):boolean;
export declare function validateDocumentaryParents(registry:HistoricalDocumentaryParentRegistry):{ok:boolean;errors:string[]};
export declare function entityIdFromGroup(group:string):string;
export declare function ohmCategory(group:string):'regions'|'counties'|'comitates';
export declare function groupShortName(group:string):string;
export declare function sourceAtReferenceYear(index:GeodataSourceIndex,year:number):Set<string>;
export declare function validateOhmParentage(index:GeodataSourceIndex,register:OhmParentageRegister,documentaryParents:HistoricalDocumentaryParentRegistry):{ok:boolean;errors:string[]};
export declare function buildHistoricalOhmTree(index:GeodataSourceIndex,register:OhmParentageRegister,year:number,documentaryParents:HistoricalDocumentaryParentRegistry):OhmTree;
export declare function uniqueSourceVersionAtYear(node:OhmTreeNode|null,year:number):GeodataSourceEntry|null;
