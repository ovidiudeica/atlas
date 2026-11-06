import type { Territory } from './territories';
export interface OsmLevelScope {
  id: string;
  names: { en: string; ro: string };
  levels: { level: number; count: number }[];
}
export interface OsmLevelIndex {
  scopes: OsmLevelScope[];
  byScope: Map<string, Map<number, string[]>>;
}
export function buildOsmLevelIndex(entities: readonly Territory[]): OsmLevelIndex;
export function availableOsmLevels(index: OsmLevelIndex, scopeIds: readonly string[]): {level:number;count:number}[];
export function matchingOsmLevelIds(index: OsmLevelIndex, scopeIds: readonly string[], levels: readonly number[]): string[];
export function updateOsmLevelVisibility(visible: readonly string[], targets: readonly string[], show: boolean): string[];
