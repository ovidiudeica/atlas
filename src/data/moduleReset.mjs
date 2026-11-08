// Module-scoped map visibility. All modules share one map, but never each
// other's selection ownership. The only currently populated module is
// Administrative; planned modules start with no selected geometries.
export const MODULE_KEYS=Object.freeze([
  'administrative','historical','communities','regions','ethnographic','reform'
]);

export function makeModuleVisibility(administrative=[]){
  return {
    administrative:[...administrative],
    historical:[],communities:[],regions:[],ethnographic:[],reform:[]
  };
}

export function setModuleGeometry(state,module,ids){
  if(!MODULE_KEYS.includes(module))throw Error('Unknown module: '+module);
  return {...state,[module]:[...new Set(ids)]};
}

export function resetModuleGeometry(state,module,defaultVisible){
  return setModuleGeometry(state,module,module==='administrative'?defaultVisible:[]);
}

export function displayedModuleGeometry(state,administrativeFilterIds=[]){
  return [...new Set([...Object.values(state).flat(),...administrativeFilterIds])];
}

export function moduleHasSelections(state,module,defaultVisible,adminFilters=[],statFilters=[],
  selectedId=null,selectedOwner=null){
  if(!MODULE_KEYS.includes(module))throw Error('Unknown module: '+module);
  const ids=state[module];
  const active=selectedId!==null&&selectedOwner===module;
  if(module==='administrative'){
    return active||adminFilters.length>0||statFilters.length>0||
      ids.length!==defaultVisible.length||defaultVisible.some(id=>!ids.includes(id));
  }
  return active||ids.length>0;
}
