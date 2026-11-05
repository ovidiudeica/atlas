export type Locale = 'en' | 'ro';
export type EntityKind = 'nation' | 'statistical' | 'dual-role' | 'administrative';

export interface Entity {
  id: string;
  kind: EntityKind;
  label: Record<Locale, string>;
  official: Record<Locale, string>;
  treeParentId: string | null;
  administrativeParentId?: string | null;
  osmRelationId: number | null;
  adminLevel?: number;
  statisticalCode?: string;
  statisticalLevel?: number;
  geometryId?: 'ro' | 'md';
  children: string[];
}

/**
 * Phase 2 website-navigation subset, NOT a complete administrative/registry release.
 * Hierarchy grouping does not imply a new legal administrative parent.
 */
export const entities: Record<string, Entity> = {
  ro: {
    id: 'ro', kind: 'nation', label: {en:'Romania',ro:'România'}, official:{en:'Romania',ro:'România'},
    treeParentId:null, administrativeParentId:null, osmRelationId:90689, adminLevel:2, geometryId:'ro',
    children:['ro1','ro2','ro3','ro4'],
  },
  ro1: {id:'ro1',kind:'statistical',label:{en:'Macroregion One',ro:'Macroregiunea Unu'},official:{en:'Macroregion One',ro:'Macroregiunea Unu'},treeParentId:'ro',osmRelationId:null,statisticalCode:'RO1',statisticalLevel:1,children:[]},
  ro2: {id:'ro2',kind:'statistical',label:{en:'Macroregion Two',ro:'Macroregiunea Doi'},official:{en:'Macroregion Two',ro:'Macroregiunea Doi'},treeParentId:'ro',osmRelationId:null,statisticalCode:'RO2',statisticalLevel:1,children:[]},
  ro3: {id:'ro3',kind:'statistical',label:{en:'Macroregion Three',ro:'Macroregiunea Trei'},official:{en:'Macroregion Three',ro:'Macroregiunea Trei'},treeParentId:'ro',osmRelationId:null,statisticalCode:'RO3',statisticalLevel:1,children:[]},
  ro4: {id:'ro4',kind:'statistical',label:{en:'Macroregion Four',ro:'Macroregiunea Patru'},official:{en:'Macroregion Four',ro:'Macroregiunea Patru'},treeParentId:'ro',osmRelationId:null,statisticalCode:'RO4',statisticalLevel:1,children:[]},
  md: {
    id:'md',kind:'nation',label:{en:'Republic of Moldova',ro:'Republica Moldova'},official:{en:'Republic of Moldova',ro:'Republica Moldova'},
    treeParentId:null,administrativeParentId:null,osmRelationId:58974,adminLevel:2,statisticalCode:'MD1',statisticalLevel:1,geometryId:'md',children:['md11','md12','nistrenia'],
  },
  md11:{id:'md11',kind:'statistical',label:{en:'West',ro:'Vest'},official:{en:'Western Part (right bank of the Dniester)',ro:'Partea de Vest (partea dreaptă a Nistrului)'},treeParentId:'md',osmRelationId:null,statisticalCode:'MD11',statisticalLevel:2,children:['md111','md112','md113','md114','md115']},
  md111:{id:'md111',kind:'statistical',label:{en:'North',ro:'Nord'},official:{en:'Northern Region',ro:'Regiunea Nord'},treeParentId:'md11',osmRelationId:null,statisticalCode:'MD111',statisticalLevel:3,children:[]},
  md112:{id:'md112',kind:'statistical',label:{en:'Centre',ro:'Centru'},official:{en:'Central Region',ro:'Regiunea Centru'},treeParentId:'md11',osmRelationId:null,statisticalCode:'MD112',statisticalLevel:3,children:[]},
  md113:{id:'md113',kind:'statistical',label:{en:'South',ro:'Sud'},official:{en:'Southern Region',ro:'Regiunea Sud'},treeParentId:'md11',osmRelationId:null,statisticalCode:'MD113',statisticalLevel:3,children:[]},
  md114:{id:'md114',kind:'dual-role',label:{en:'Gagauzia',ro:'Găgăuzia'},official:{en:'Autonomous Territorial Unit of Gagauzia',ro:'Unitatea Teritorială Autonomă Găgăuzia'},treeParentId:'md11',administrativeParentId:'md',osmRelationId:1699032,adminLevel:4,statisticalCode:'MD114',statisticalLevel:3,children:[]},
  md115:{id:'md115',kind:'dual-role',label:{en:'Chișinău',ro:'Chișinău'},official:{en:'Municipality of Chișinău',ro:'Municipiul Chișinău'},treeParentId:'md11',administrativeParentId:'md',osmRelationId:1691801,adminLevel:4,statisticalCode:'MD115',statisticalLevel:3,children:[]},
  md12:{id:'md12',kind:'statistical',label:{en:'East',ro:'Est'},official:{en:'Eastern Part (left bank of the Dniester)',ro:'Partea de Est (partea stângă a Nistrului)'},treeParentId:'md',osmRelationId:null,statisticalCode:'MD12',statisticalLevel:2,children:['md120']},
  md120:{id:'md120',kind:'statistical',label:{en:'Left-bank territorial units',ro:'Unitățile din stânga Nistrului'},official:{en:'Administrative-territorial units on the left bank of the Dniester',ro:'Unitățile administrativ-teritoriale din stânga Nistrului'},treeParentId:'md12',osmRelationId:null,statisticalCode:'MD120',statisticalLevel:3,children:[]},
  nistrenia:{id:'nistrenia',kind:'administrative',label:{en:'Transnistria (OSM)',ro:'Nistrenia (OSM)'},official:{en:'Transnistria (OSM administrative boundary)',ro:'Nistrenia (limită administrativă OSM)'},treeParentId:'md',administrativeParentId:'md',osmRelationId:null,adminLevel:3,children:[]},
};

export const roots = ['ro','md'] as const;
export const previewGeometryIds = new Set(['ro','md']);

// Guarantee that the initial state exposes only actual available national geometries.
export const initialVisible = ['ro','md'];