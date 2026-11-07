import { gunzipSync, strFromU8 } from 'fflate';
import { shortTreeName } from './treeNames.mjs';
import type { Feature, FeatureCollection, Geometry } from 'geojson';

export type Country = 'RO' | 'MD';
export type Locale = 'en' | 'ro';
export type GeometryMode = 'detailed' | 'simplified';

export interface RegistryRecord {
  system: 'SIRUTA' | 'CUATM';
  code: string;
  matchedSourceRecord: boolean;
  record: Record<string, string | number | null> | null;
}
export interface StatisticalRole {
  classification: string;
  version: string;
  code: string;
  level: number;
  parentCode: string | null;
}
export interface Territory {
  id: string;
  country: Country;
  roles: string[];
  adminLevel: number | null;
  name: string;
  shortName: { en: string; ro: string };
  officialName: string;
  administrativeParentId: string | null;
  treeParentId: string | null;
  osmRelationId: number | null;
  registry: RegistryRecord | null;
  statisticalRoles: StatisticalRole[];
  sourceTags: Record<string, string>;
  atlasDerivedTags?: Record<string, string>;
  geometryShard: string;
  /** Optional root entity for an independent geographical dataset (future UA regions). */
  geometrySetRootId?: string;
  geometrySource?: string;
  officialNameAuthority?: string;
  statisticalSourceTags?: Record<string, string>;
  registryIdentityReviewStatus?: string;
}
interface TerritoryCatalog {
  schema: string;
  sourceSnapshotDate: string;
  certificate: string;
  entities: Territory[];
}
export type TerritoryFeature = Feature<Geometry, {
  atlasId: string;
  country: string;
  roleKind?: string;
  adminLevel?: number | null;
  [key: string]: unknown;
}>;
type FeatureSet = FeatureCollection<Geometry, TerritoryFeature['properties']>;

const base = import.meta.env.BASE_URL + 'data/phase4/';
const shardCache = new Map<string, Promise<Map<string, TerritoryFeature>>>();

export async function readGzipJSON<T>(file: string): Promise<T> {
  const response = await fetch(base + file, { cache: 'force-cache' });
  if (!response.ok) throw new Error('HTTP ' + response.status + ': ' + file);
  const bytes = new Uint8Array(await response.arrayBuffer());
  // Browsers transparently decompress Content-Encoding: gzip. GitHub Pages and
  // local Vite servers may differ, so accept both the gzip file and decoded JSON.
  const jsonBytes = bytes[0] === 0x1f && bytes[1] === 0x8b ? gunzipSync(bytes) : bytes;
  return JSON.parse(strFromU8(jsonBytes)) as T;
}

export function loadCatalog(): Promise<TerritoryCatalog> {
  return readGzipJSON<TerritoryCatalog>('catalog.json.gz').then(catalog => {
    if (catalog.schema !== 'atlas-territory-browser-v1' ||
        catalog.certificate !== 'CERTIFIED_CARTOGRAPHIC_SOURCE_WITH_ACCEPTED_EXCEPTIONS' ||
        catalog.entities.length !== 4283) {
      throw new Error('Atlas catalogue does not match the certified Phase 3 release');
    }
    return catalog;
  });
}

export function loadGeometryShard(shard: string, mode: GeometryMode): Promise<Map<string, TerritoryFeature>> {
  if (!/^(roots|(?:ro|md)-(?:stat|adm-\d{2}))$/.test(shard)) {
    return Promise.reject(new Error('Invalid geometry shard'));
  }
  const key = shard + '-' + mode;
  const cached = shardCache.get(key);
  if (cached) return cached;
  const promise = readGzipJSON<FeatureSet>('geometry/' + key + '.geojson.gz')
    .then(collection => {
      if (collection.type !== 'FeatureCollection') throw new Error('Invalid GeoJSON collection');
      const features = new Map<string, TerritoryFeature>();
      for (const feature of collection.features) {
        if (!feature.properties?.atlasId ||
          !['Polygon', 'MultiPolygon'].includes(feature.geometry?.type)) throw new Error('Invalid Atlas polygon');
        if (features.has(feature.properties.atlasId)) throw new Error('Duplicate Atlas polygon ID');
        features.set(feature.properties.atlasId, feature as TerritoryFeature);
      }
      return features;
    })
    .catch(err => {
      shardCache.delete(key);
      throw err;
    });
  shardCache.set(key, promise);
  return promise;
}

export function normalize(value: string): string {
  return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('ro-RO').replace(/ș/g, 's').replace(/ț/g, 't').trim();
}
export function codeOf(node: Territory): string {
  return node.statisticalRoles.map(role => role.code).join(', ');
}
export function labelOf(node: Territory, lang: Locale): string {
  return shortTreeName(node,lang);
}
export function lookupKeys(node: Territory): string {
  const tags = node.sourceTags || {};
  return normalize([
    node.id, node.name, node.shortName?.ro, node.shortName?.en, node.officialName,
    labelOf(node,'ro'), labelOf(node,'en'),
    // The official phrases remain valid search aliases; only tree labels shorten.
    ...(node.id === 'osm-r58974' ? ['Republic of Moldova','Republica Moldova'] : []),
    ...(node.statisticalRoles.some(role => role.code === 'MD120')
      ? ['Unitățile din stânga Nistrului','Left-bank territorial units'] : []),
    node.osmRelationId, node.registry?.code, codeOf(node),
    tags['name:ro'], tags['name:en'], tags.alt_name, tags.old_name,
    tags['ref:nuts'], tags['ref:cuatm:codunic'], tags.wikidata,
  ].filter(Boolean).join(' '));
}

export function bboxOfGeometry(geometry: Geometry): [[number, number], [number, number]] {
  let minLng = Infinity, minLat = Infinity, maxLng = -Infinity, maxLat = -Infinity;
  function walk(coords: unknown): void {
    if (!Array.isArray(coords)) return;
    if (typeof coords[0] === 'number' && typeof coords[1] === 'number') {
      minLng = Math.min(minLng, coords[0]);
      minLat = Math.min(minLat, coords[1]);
      maxLng = Math.max(maxLng, coords[0]);
      maxLat = Math.max(maxLat, coords[1]);
    } else {
      for (const child of coords) walk(child);
    }
  }
  if ('coordinates' in geometry) walk(geometry.coordinates);
  if (!Number.isFinite(minLng)) throw new Error('Geometry has no coordinates');
  return [[minLng, minLat], [maxLng, maxLat]];
}

export function asDisplayFeatures(selected: Iterable<string>, nodes: Map<string, Territory>,
  loaded: Map<string, TerritoryFeature>): FeatureCollection {
  const features: TerritoryFeature[] = [];
  for (const id of selected) {
    const node = nodes.get(id);
    const f = loaded.get(id);
    if (!node || !f) continue;
    features.push({
      type: 'Feature', id,
      properties: { ...f.properties, atlasId: id, country: node.country,
        roleKind: node.roles.includes('administrative') ? 'administrative' : 'statistical',
        adminLevel: node.adminLevel },
      geometry: f.geometry
    });
  }
  return { type: 'FeatureCollection', features };
}

export const ROOT_IDS = ['osm-r90689', 'osm-r58974'] as const;
export const EMPTY_FEATURES: FeatureCollection = { type: 'FeatureCollection', features: [] };
