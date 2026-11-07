import type { Territory } from './territories';
export interface OsmLevelScope {
  id: string;
  names: { en: string; ro: string };
  levels: { level: number; count: number }[];
  statisticalLevels: StatisticalLevelOption[];
}
export interface StatisticalLevelOption {
  key: string;
  classification: string;
  level: number;
  count: number;
}
export interface StatisticalLevelGroup {
  classification: string;
  level: number;
  ids: Set<string>;
}
export interface OsmLevelIndex {
  scopes: OsmLevelScope[];
  byScope: Map<string, Map<number, string[]>>;
  statisticalByScope: Map<string, Map<string, StatisticalLevelGroup>>;
}
export function buildOsmLevelIndex(entities: readonly Territory[]): OsmLevelIndex;
export function availableOsmLevels(index: OsmLevelIndex, scopeIds: readonly string[]): {level:number;count:number}[];
export function matchingOsmLevelIds(index: OsmLevelIndex, scopeIds: readonly string[], levels: readonly number[]): string[];
export function updateOsmLevelVisibility(visible: readonly string[], targets: readonly string[], show: boolean): string[];
export function statisticalLevelKey(classification: string, level: number): string;
export function availableStatisticalLevels(index: OsmLevelIndex, scopeIds: readonly string[]): StatisticalLevelOption[];
export function matchingStatisticalLevelIds(index: OsmLevelIndex, scopeIds: readonly string[], levelKeys: readonly string[]): string[];
export function matchingCombinedLevelIds(index: OsmLevelIndex, scopeIds: readonly string[], administrativeLevels: readonly number[], statisticalKeys: readonly string[]): string[];
export function orderTerritorialScopes(scopes: readonly OsmLevelScope[], preferredRootIds: readonly string[]): OsmLevelScope[];
export function levelVisibilityState(visible: ReadonlySet<string> | readonly string[], targets: readonly string[]): {checked:boolean; mixed:boolean};
