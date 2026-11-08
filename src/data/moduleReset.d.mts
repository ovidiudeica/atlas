export type AtlasModuleId='administrative'|'historical'|'communities'|'regions'|'ethnographic'|'reform';
export type ModuleVisibility=Record<AtlasModuleId,string[]>;
export const MODULE_KEYS:readonly AtlasModuleId[];
export function makeModuleVisibility(administrative?:string[]):ModuleVisibility;
export function setModuleGeometry(state:ModuleVisibility,module:AtlasModuleId,ids:string[]):ModuleVisibility;
export function resetModuleGeometry(state:ModuleVisibility,module:AtlasModuleId,defaultVisible:string[]):ModuleVisibility;
export function displayedModuleGeometry(state:ModuleVisibility,administrativeFilterIds?:string[]):string[];
export function moduleHasSelections(state:ModuleVisibility,module:AtlasModuleId,defaultVisible:string[],
  adminFilters?:number[],statFilters?:string[],selectedId?:string|null,selectedOwner?:AtlasModuleId|null):boolean;
