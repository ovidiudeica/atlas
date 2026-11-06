// Catalog-driven OSM administrative level bulk visibility. This module is deliberately
// unaware of any specific country code or hard-coded list of administrative levels.
//
// Today, each entity resolves to the topmost administrative ancestor. A future
// independent geography set (e.g. Chernihiv? / Cernăuți, Odesa, Transcarpatica)
// may declare "geometrySetRootId" on its root; every descendant inherits that
// scope even when the wider hierarchy has a common Ukraine ancestor.
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
  for (const node of entities) {
    if (!node.roles?.includes('administrative') ||
        !Number.isInteger(node.adminLevel) || node.adminLevel < 1) continue;
    const rootId = scopeRoot(node);
    if (!byScope.has(rootId)) byScope.set(rootId, new Map());
    const levels = byScope.get(rootId);
    if (!levels.has(node.adminLevel)) levels.set(node.adminLevel, []);
    levels.get(node.adminLevel).push(node.id);
  }
  const scopes = [...byScope].map(([id, levels]) => {
    const root = byId.get(id);
    return {
      id,
      names: {
        en: root?.shortName?.en || root?.name || id,
        ro: root?.shortName?.ro || root?.name || id
      },
      levels: [...levels].sort((a,b)=>a[0]-b[0])
        .map(([level, ids])=>({level,count:ids.length}))
    };
  });
  return { scopes, byScope };
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

// Never mutate the previous state; an individual level action preserves all
// non-target levels, including independent statistical-only entities.
export function updateOsmLevelVisibility(visible, targets, show) {
  const targetSet = new Set(targets);
  if (!show) return visible.filter(id=>!targetSet.has(id));
  const existing = new Set(visible);
  for (const id of targets) existing.add(id);
  return [...existing];
}
