import type { FeatureCollection } from 'geojson';
import type { Territory, TerritoryFeature } from './territories';

export type ExportScope = 'selected' | 'visible';
export type TreeView = 'all' | 'administrative' | 'statistical';
export type Basemap = 'standard' | 'grayscale' | 'dark' | 'none';
export type Locale = 'en' | 'ro';
export interface ShareState {
  entity: string | null;
  view: TreeView;
  lang: Locale;
  simple: boolean;
  basemap: Basemap;
  lng: number;
  lat: number;
  zoom: number;
}
export interface LoadedShareState {
  entity: string | null;
  view: TreeView | null;
  lang: Locale | null;
  simple: boolean | null;
  basemap: Basemap | null;
  lng: number | null;
  lat: number | null;
  zoom: number | null;
}
export function idsForScope(scope: ExportScope, selected: string | null, visible: readonly string[], validIds: ReadonlySet<string>): string[];
export function metadataCsv(ids: readonly string[], nodes: ReadonlyMap<string, Territory>): string;
export function makeDetailedCollection(
  ids: readonly string[],
  nodes: ReadonlyMap<string, Territory>,
  load: (shard: string, mode: 'detailed') => Promise<Map<string, TerritoryFeature>>,
  onProgress?: (completed: number, total: number) => void
): Promise<FeatureCollection & {
  atlasExport: {
    producer: string; source: string; sourceSnapshot: string;
    geometryMode: string; sourceGeometryUnmodified: boolean;
    legalBoundaryCertification: boolean; count: number; note: string;
  };
}>;
export function clearGeometryPermalink(href: string): string;
export function buildPermalink(href: string, state: ShareState): string;
export function readPermalink(search: string): LoadedShareState;
