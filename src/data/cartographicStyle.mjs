// Cartographic presentation only: original OSMB geometries are never modified.
// A shared administrative/statistical geometry is assigned one active style.
export const REFERENCE_STYLE=Object.freeze({
  key:'reference',kind:'reference',color:'#46554f',fill:'#ffffff',
  width:2.4,opacity:0,dash:false
});
const ADMIN={
  2:['#344b64','#c7d5e0',3.4],3:['#58758d','#d3e0e8',3],
  4:['#886d56','#e7d8c9',2.7],5:['#b08b61','#eedfca',2.4],
  7:['#a86b58','#ead3cb',2.2],8:['#718b67','#d4e4cf',1.9],
  9:['#568b83','#cce6df',1.7]
};
const STAT={
  NUTS:{1:['#7766ac','#ded6f0',3.1],2:['#9484bd','#e5ddf4',2.7],3:['#a293c8','#eae4f6',2.3]},
  NUTS_MOLDOVA:{1:['#68589e','#d9d0ef',3.1],2:['#8e76bc','#e3d9f3',2.7],3:['#ad98d0','#ece4f7',2.3]}
};
export function administrativeStyle(level){
  const [color,fill,width]=ADMIN[level]||['#526a79','#d6dfe5',1.8];
  return {key:'ADM '+level,kind:'administrative',color,fill,width,opacity:0.08,dash:false};
}
export function statisticalStyle(classification,level){
  const [color,fill,width]=(STAT[classification]||{})[level]||['#897bb0','#e5dff0',2.1];
  return {key:(classification==='NUTS_MOLDOVA'?'NTS':classification)+' '+level,
    kind:'statistical',color,fill,width,opacity:0.1,dash:true};
}
export function styleForEntity(node,adminLevels=[],statKeys=[],isNationalRoot=false){
  const stat=(node.statisticalRoles||[]).find(role=>
    statKeys.includes(JSON.stringify([role.classification,role.level])));
  if(stat)return statisticalStyle(stat.classification,stat.level);
  if(node.roles?.includes('administrative')&&adminLevels.includes(node.adminLevel))
    return administrativeStyle(node.adminLevel);
  if(isNationalRoot)return REFERENCE_STYLE;
  if(node.roles?.includes('administrative')&&Number.isInteger(node.adminLevel))
    return administrativeStyle(node.adminLevel);
  const defaultStat=node.statisticalRoles?.[0];
  return defaultStat?statisticalStyle(defaultStat.classification,defaultStat.level):REFERENCE_STYLE;
}
