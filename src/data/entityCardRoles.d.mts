import type {Territory} from './territories';
export interface CardAdministrativeRole {
  readonly level:number|null;
  readonly label:string|null;
  readonly basis:string;
  readonly registrySystem:string|null;
  readonly registryCode:string|null;
  readonly parentRegistryCode:string|null;
  readonly isOsmBoundary:boolean;
}
export interface CardStatisticalRole {
  readonly classification:string;
  readonly label:string;
  readonly level:number;
  readonly code:string;
  readonly version:string;
  readonly parentCode:string|null;
}
export interface CardCartography {
  readonly kind:string;
  readonly osmRelationId:number|null;
  readonly osmAdminLevel:number|null;
  readonly geometryShard:string|null;
  readonly geometrySource:string;
  readonly sourceSnapshotDate:string;
  readonly spatialRelationsAreNotLegalParentage:boolean;
}
export interface EntityCardRoles {
  readonly administrative:readonly CardAdministrativeRole[];
  readonly statistical:readonly CardStatisticalRole[];
  readonly cartographic:Readonly<CardCartography>;
}
export function entityCardRoles(entity:Territory):EntityCardRoles;
export function statisticalCodeIndex(entities:Territory[]):Map<string,Territory>;
export function verifiedStatisticalParent(index:Map<string,Territory>,role:CardStatisticalRole):Territory|null;
