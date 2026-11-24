import type {Rohgis1930Catalog} from './historicalRohgis1930.mjs';
export type UrbanSubtype='municipiu'|'oraș';
export type UrbanEvidenceLevel='OFFICIAL_TEXT_OCR_ATTESTATION'|'1930_STATISTICAL_SUBTYPE_ATTESTED_OCR'|'OTHER_OFFICIAL_ATTESTATION_OCR';
export interface UrbanEvidenceItem {source:string;referenceDate:string;locator:string;explicitSubtype:UrbanSubtype|null;level:string;note?:string;title:string;url:string}
export interface UrbanPopulationEvidence {value:number;referenceDate:'1930-12-29';metric:'POPULATIA_STATORNICA';source:string;locator:string;sourceValues:{polygon:number;point:number};suburban:boolean|null;geometryPopulationScopeVerified:false;facsimileVerified:false;canonicalChangeAdmitted:false;title:string;url:string}
export interface UrbanClassification {entityId:string;versionId:string;geometryId:string;name:string;county:string;subtype:UrbanSubtype;evidenceLevel:UrbanEvidenceLevel;pointStatus:UrbanSubtype|null;pointFid:number|null;pointAlias:string|null;evidence:UrbanEvidenceItem[];population:UrbanPopulationEvidence|null;legalSubtypeCertified:false;legalBoundaryCertified:false;canonicalChangeAdmitted:false}
export declare function attachRohgisUrbanClassification(catalog:Rohgis1930Catalog,data:unknown):Rohgis1930Catalog;
