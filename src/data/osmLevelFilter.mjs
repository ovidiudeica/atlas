// Catalog-driven administrative AND statistical level bulk visibility, scoped by
// territorial geometry set; neither country codes nor level inventories are fixed.
//
// Today, each entity resolves to the topmost administrative ancestor. A future
// independent geography set (e.g. Cernăuți, Odesa, Transcarpatica)
// may declare "geometrySetRootId" on its root; every descendant inherits that
// scope even when the wider hierarchy has a common Ukraine ancestor.
export function statisticalLevelKey(classification, level) {
  return JSON.stringify([classification, level]);
}

export function buildOsmLevelIndex(entities) {
  const byId = new Map(entities.map(node => [node.id, node]));
  const rootCache = new Map();

  function scopeRoot(node) {
    if (rootCache.has(node.id)) return rootCache.get(node.id);
    const visited = new Set(), path = [];
    let current = node, rootId = null;
    while (current && !visited.has(current.id)) {
      if (rootCache.has(current.id)) { rootId = rootCache.get(current.id); break; }
      path.push(current.id);
      visited.add(current.id);
      if (current.geometrySetRootId && byId.has(current.geometrySetRootId)) {
        rootId = current.geometrySetRootId;
        break;
      }
      const parent = current.administrativeParentId || current.treeParentId;
      if (!parent || !byId.has(parent)) { rootId = current.id; break; }
      current = byId.get(parent);
    }
    rootId ||= current?.id || node.id;
    for (const id of path) rootCache.set(id, rootId);
    return rootId;
  }

  const byScope = new Map();
  const statisticalByScope = new Map();
  for (const node of entities) {
    const admin = node.roles?.includes('administrative') &&
      Number.isInteger(node.adminLevel) && node.adminLevel > 0;
    const statistics = (node.statisticalRoles || []).filter(role =>
      typeof role.classification === 'string' && role.classification.length &&
      Number.isInteger(role.level) && role.level > 0);
    if (!admin && !statistics.length) continue;
    const rootId = scopeRoot(node);
    if (admin) {
      if (!byScope.has(rootId)) byScope.set(rootId, new Map());
      const levels = byScope.get(rootId);
      if (!levels.has(node.adminLevel)) levels.set(node.adminLevel, []);
      levels.get(node.adminLevel).push(node.id);
    }
    // A statistical role can be attached to an administrative entity without
    // a new polygon. Index by statisticalRoles, NOT by node.roles or adminLevel.
    if (statistics.length) {
      if (!statisticalByScope.has(rootId)) statisticalByScope.set(rootId, new Map());
      const levels = statisticalByScope.get(rootId);
      for (const role of statistics) {
        const key = statisticalLevelKey(role.classification, role.level);
        if (!levels.has(key)) levels.set(key, {
          classification:role.classification, level:role.level, ids:new Set()
        });
        levels.get(key).ids.add(node.id);
      }
    }
  }
  // Include scopes with statistical-only data, such as future regional sets.
  const scopeIds = new Set([...byScope.keys(), ...statisticalByScope.keys()]);
  const scopes = [...scopeIds].map(id => {
    const root = byId.get(id);
    const levels = byScope.get(id) || new Map();
    const statistics = statisticalByScope.get(id) || new Map();
    return {
      id,
      names: {
        en: root?.shortName?.en || root?.name || id,
        ro: root?.shortName?.ro || root?.name || id
      },
      levels: [...levels].sort((a,b)=>a[0]-b[0])
        .map(([level, ids])=>({level,count:ids.length})),
      statisticalLevels: [...statistics.values()]
        .sort((a,b)=>a.classification.localeCompare(b.classification)||a.level-b.level)
        .map(({classification,level,ids})=>({
          key:statisticalLevelKey(classification,level),
          classification,level,count:ids.size
        }))
    };
  });
  return { scopes, byScope, statisticalByScope };
}

// Level availability is specific to the selected geography sets, not the entire
// platform; future datasets can introduce new OSM admin_level values at runtime.
export function availableOsmLevels(index, scopeIds) {
  const counts = new Map();
  for (const id of new Set(scopeIds)) {
    for (const [level, ids] of index.byScope.get(id) || []) {
      counts.set(level, (counts.get(level) || 0) + ids.length);
    }
  }
  return [...counts].sort((a,b)=>a[0]-b[0])
    .map(([level,count])=>({level,count}));
}

export function matchingOsmLevelIds(index, scopeIds, levels) {
  const selected = new Set(levels), ids = new Set();
  for (const scopeId of new Set(scopeIds)) {
    for (const [level, members] of index.byScope.get(scopeId) || []) {
      if (selected.has(level)) for (const id of members) ids.add(id);
    }
  }
  return [...ids];
}

// Return levels grouped by official statistical classification: e.g. NUTS 1-3
// for Romania and NUTS_MOLDOVA 1-3 for Moldova (shown as NTS in the UI).
export function availableStatisticalLevels(index, scopeIds) {
  const groups = new Map();
  for (const scopeId of new Set(scopeIds)) {
    for (const [key, group] of index.statisticalByScope.get(scopeId) || []) {
      if (!groups.has(key)) groups.set(key, {
        key, classification:group.classification, level:group.level, ids:new Set()
      });
      for (const id of group.ids) groups.get(key).ids.add(id);
    }
  }
  return [...groups.values()].sort((a,b)=>
    a.classification.localeCompare(b.classification)||a.level-b.level)
    .map(({key,classification,level,ids})=>({key,classification,level,count:ids.size}));
}

// Shared RO/MD geometries must appear once even when the source node has
// multiple statistical roles or is also an administrative entity.
export function matchingStatisticalLevelIds(index, scopeIds, levelKeys) {
  const keys = new Set(levelKeys), ids = new Set();
  for (const scopeId of new Set(scopeIds)) {
    for (const [key, group] of index.statisticalByScope.get(scopeId) || []) {
      if (keys.has(key)) for (const id of group.ids) ids.add(id);
    }
  }
  return [...ids];
}

// Never mutate the previous state; actions preserve all non-target entities,
// including administrative levels outside the current statistical selection.
export function updateOsmLevelVisibility(visible, targets, show) {
  const targetSet = new Set(targets);
  if (!show) return visible.filter(id=>!targetSet.has(id));
  const existing = new Set(visible);
  for (const id of targets) existing.add(id);
  return [...existing];
}
