// Phase 5 presentation/export utilities. The certified catalog and geometry assets remain read-only.
const SNAPSHOT = '2026-10-05';
const TYPES = ['all', 'administrative', 'statistical'];
const BASEMAPS = ['standard', 'grayscale', 'dark', 'none'];

export function idsForScope(scope, selected, visible, validIds) {
  const candidates = scope === 'selected' ? (selected ? [selected] : []) : visible;
  return [...new Set(candidates)].filter(id => validIds.has(id));
}

function csvCell(value) {
  const raw = value == null ? '' : String(value);
  // A spreadsheet must not interpret source-supplied names/codes as executable formulas.
  const safe = /^\s*[=+\-@]/.test(raw) ? "'" + raw : raw;
  return '"' + safe.replace(/"/g, '""') + '"';
}

export function metadataCsv(ids, nodes) {
  const columns = [
    'atlas_id', 'country', 'official_name', 'osm_relation_id', 'admin_level',
    'roles', 'statistical_codes', 'registry_system', 'registry_code',
    'administrative_parent_id', 'tree_parent_id', 'source_snapshot'
  ];
  const rows = [columns];
  for (const id of ids) {
    const n = nodes.get(id);
    if (!n) throw new Error('Missing territory in CSV export: ' + id);
    rows.push([
      n.id, n.country, n.officialName, n.osmRelationId, n.adminLevel,
      n.roles.join('; '), n.statisticalRoles.map(s => s.code).join('; '),
      n.registry?.system ?? '', n.registry?.code ?? '',
      n.administrativeParentId ?? '', n.treeParentId ?? '', SNAPSHOT
    ]);
  }
  return '\uFEFF' + rows.map(row => row.map(csvCell).join(',')).join('\r\n') + '\r\n';
}

export async function makeDetailedCollection(ids, nodes, load, onProgress = () => {}) {
  const grouped = new Map();
  for (const id of ids) {
    const node = nodes.get(id);
    if (!node) throw new Error('Missing territory in GeoJSON export: ' + id);
    const group = grouped.get(node.geometryShard) || [];
    group.push(id);
    grouped.set(node.geometryShard, group);
  }
  const found = new Map();
  let done = 0;
  for (const [shard, shardIds] of grouped) {
    // Export ALWAYS uses the detailed certified source, never simplified display polygons.
    const shapes = await load(shard, 'detailed');
    for (const id of shardIds) {
      const feature = shapes.get(id);
      if (!feature) throw new Error('Missing detailed geometry in export: ' + id);
      found.set(id, feature);
    }
    onProgress(++done, grouped.size);
  }
  return {
    type: 'FeatureCollection',
    atlasExport: {
      producer: 'Territorial Atlas',
      source: 'OSM-Boundaries',
      sourceSnapshot: SNAPSHOT,
      geometryMode: 'detailed',
      sourceGeometryUnmodified: true,
      legalBoundaryCertification: false,
      count: ids.length,
      note: 'Cartographic source geometry with documented OSMB exceptions; not a legal boundary certification. Observe source data licensing.'
    },
    features: ids.map(id => found.get(id))
  };
}

export function buildPermalink(href, state) {
  const url = new URL(href);
  for (const key of ['entity', 'view', 'lang', 'simple', 'basemap', 'lng', 'lat', 'zoom'])
    url.searchParams.delete(key);
  if (state.entity) url.searchParams.set('entity', state.entity);
  url.searchParams.set('view', state.view);
  url.searchParams.set('lang', state.lang);
  url.searchParams.set('simple', state.simple ? '1' : '0');
  url.searchParams.set('basemap', state.basemap);
  if ([state.lng, state.lat, state.zoom].every(Number.isFinite)) {
    url.searchParams.set('lng', state.lng.toFixed(5));
    url.searchParams.set('lat', state.lat.toFixed(5));
    url.searchParams.set('zoom', state.zoom.toFixed(2));
  }
  return url.toString();
}

export function readPermalink(search) {
  const params = new URLSearchParams(search);
  const rawEntity = params.get('entity');
  const entity = rawEntity && /^[a-z0-9-]{1,80}$/i.test(rawEntity) ? rawEntity : null;
  const rawView = params.get('view');
  const rawLang = params.get('lang');
  const rawSimple = params.get('simple');
  const rawBasemap = params.get('basemap');
  const lng = Number(params.get('lng')), lat = Number(params.get('lat')), zoom = Number(params.get('zoom'));
  const validCamera = params.has('lng') && params.has('lat') && params.has('zoom') &&
    Number.isFinite(lng) && Number.isFinite(lat) && Number.isFinite(zoom) &&
    lng >= -180 && lng <= 180 && lat >= -85 && lat <= 85 && zoom >= 0 && zoom <= 22;
  return {
    entity,
    view: TYPES.includes(rawView) ? rawView : null,
    lang: rawLang === 'ro' || rawLang === 'en' ? rawLang : null,
    simple: rawSimple === '1' ? true : rawSimple === '0' ? false : null,
    basemap: BASEMAPS.includes(rawBasemap) ? rawBasemap : null,
    lng: validCamera ? lng : null,
    lat: validCamera ? lat : null,
    zoom: validCamera ? zoom : null
  };
}
