import type {Territory} from './territories';
export const BUCHAREST_ATLAS_ID:string;
export const BUCHAREST_SIRUTA_ROLES:Readonly<{
  county:Readonly<{code:string;level:number}>;
  municipal:Readonly<{code:string;level:number;parentCode:string}>;
}>;
export interface ResolvedAdministrativeRole {
  kind:string;basis:string;level:number|null;registrySystem:string|null;
  registryCode:string|null;parentAtlasId:string|null;
  recordMatched:boolean|null;parentRegistryCode?:string;
}
export interface ResolvedStatisticalRole {
  kind:string;classification:string;version:string;code:string;
  level:number;parentCode:string|null;source:Record<string,string>|null;
}
export interface TerritorialRoles {
  statistical:readonly ResolvedStatisticalRole[];
  administrative:readonly ResolvedAdministrativeRole[];
  cartographic:Readonly<{
    kind:string;osmRelationId:number|null;osmAdminLevel:number|null;
    geometryShard:string|null;geometrySource:string;
    sourceSnapshotDate:string;spatialRelationsAreNotLegalParentage:boolean;
  }>;
}
export function resolveTerritorialRoles(entity:Territory):TerritorialRoles;
