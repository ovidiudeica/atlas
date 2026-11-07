// Stable, presentation-only order of sibling territorial entities.
// Nistrenia has five raions and two independently administered city councils.
// Show the five raions first and the two cities last, alphabetically in the
// currently selected UI language within each group.
import {shortTreeName} from './treeNames.mjs';
export const NISTRIAN_PARENT_ID='osm-r65335';
export const NISTRIAN_CITY_COUNCILS=Object.freeze(['osm-r944727','osm-r1702219']);
const cityCouncilIds=new Set(NISTRIAN_CITY_COUNCILS);

export function compareTreeSiblings(a,b,view,parentId,lang='ro'){
  if(parentId===NISTRIAN_PARENT_ID){
    const aRank=cityCouncilIds.has(a.id)?1:0;
    const bRank=cityCouncilIds.has(b.id)?1:0;
    if(aRank!==bRank)return aRank-bRank;
    const byShortName=shortTreeName(a,lang).localeCompare(shortTreeName(b,lang),lang);
    return byShortName||a.id.localeCompare(b.id,'en');
  }
  // Original, already-accepted hierarchy ordering is unchanged everywhere else.
  const aStat=a.roles.includes('statistical')&&!a.roles.includes('administrative')?0:1;
  const bStat=b.roles.includes('statistical')&&!b.roles.includes('administrative')?0:1;
  if(aStat!==bStat)return aStat-bStat;
  const aCode=a.statisticalRoles[0]?.code,bCode=b.statisticalRoles[0]?.code;
  if(view!=='administrative'&&aCode&&bCode)
    return aCode.localeCompare(bCode,'en',{numeric:true});
  if((a.adminLevel??0)!==(b.adminLevel??0)&&view==='administrative')
    return (a.adminLevel??0)-(b.adminLevel??0);
  return a.name.localeCompare(b.name,'ro');
}
