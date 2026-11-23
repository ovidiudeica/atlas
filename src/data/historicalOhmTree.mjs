/**
 * HIST-OHM-TREE.1 — explicit temporal parentage and shared geometric assets.
 * Identity grouping is provisional; ONLY independently documented, time-
 * bounded edges from the parentage register may create administrative children.
 * Never equate an OHM source directory or polygon overlap with a legal parent.
 */
import {validateGeodataHistoricalIndex,geodataSourcesAtYear} from './historicalGeodata.mjs';
import {projectGeodataHistoricalSourceCatalog} from './historicalGeodataTemporal.mjs';

export const OHM_PARENTAGE_SCHEMA='atlas-historical-ohm-parentage-v1';
const fullDate=x=>typeof x==='string'&&/^\d{4}-\d\d-\d\d$/.test(x)&&
  !Number.isNaN(Date.parse(x+'T00:00:00Z'))&&
  new Date(x+'T00:00:00Z').toISOString().slice(0,10)===x;
const intersects=(a,b)=>a.start<=b.end&&b.start<=a.end;
const pointIn=(link,date)=>date>=link.start&&date<=link.end;
export const entityIdFromGroup=group=>'ohm:provisional-entity:'+encodeURIComponent(group);
export const ohmCategory=group=>group.startsWith('Județe istorice/')?'counties':
  group.startsWith('Comitate istorice/')?'comitates':'regions';
export const groupShortName=group=>group.split('/').at(-1);
export function sourceAtReferenceYear(index,year){
  return new Set(geodataSourcesAtYear(index,year).map(entry=>entry.id));
}

/** Fail closed: only documentary qualified, acyclic, non-conflicting parents. */
export function validateOhmParentage(index,register){
  const errors=[];
  const valid=validateGeodataHistoricalIndex(index);
  if(!valid.ok)return {ok:false,errors:['Invalid OHM index',...valid.errors]};
  if(!register||register.schema!==OHM_PARENTAGE_SCHEMA||!Array.isArray(register.links))
    return {ok:false,errors:['Invalid OHM parentage register']};
  const groups=new Set(index.entries.map(entry=>entry.sourceGroup));
  const seen=new Set();
  for(const link of register.links){
    if(!link||typeof link!=='object'){errors.push('Empty parentage row');continue;}
    if(typeof link.id!=='string'||seen.has(link.id))errors.push('Duplicate or missing parentage ID');
    seen.add(link.id);
    if(!groups.has(link.parentSourceGroup)||!groups.has(link.childSourceGroup)||
        link.parentSourceGroup===link.childSourceGroup)
      errors.push('Unknown or self-parent source group: '+link.id);
    if(!fullDate(link.start)||!fullDate(link.end)||link.start>link.end)
      errors.push('Invalid parentage interval: '+link.id);
    if(link.kind!=='direct_administrative_membership'||
        link.evidenceStatus!=='qualified_membership_only'||
        link.boundaryCertified!==false||link.sourceIdentityCertified!==false)
      errors.push('Parentage cannot certify geometry or source identity: '+link.id);
    if(!Array.isArray(link.evidence)||link.evidence.length===0||
        !link.evidence.every(e=>typeof e.url==='string'&&/^https:\/\//.test(e.url)&&
          typeof e.detail==='string'&&e.detail.length>8))
      errors.push('Independent documentary evidence missing: '+link.id);
  }
  // A child may have one direct administrative parent on a given day only.
  for(let i=0;i<register.links.length;i++){
    const a=register.links[i];
    if(!fullDate(a?.start)||!fullDate(a?.end))continue;
    for(let j=i+1;j<register.links.length;j++){
      const b=register.links[j];
      if(!fullDate(b?.start)||!fullDate(b?.end))continue;
      if(a.childSourceGroup===b.childSourceGroup&&intersects(a,b))
        errors.push('Overlapping direct parentage for '+a.childSourceGroup);
    }
  }
  // Detect cycles at each documented start/end instant (no geometry used).
  const boundaries=[...new Set(register.links.flatMap(x=>[x.start,x.end]))].filter(fullDate);
  for(const date of boundaries){
    const parents=new Map(register.links.filter(e=>pointIn(e,date)).map(e=>[
      e.childSourceGroup,e.parentSourceGroup
    ]));
    for(const group of parents.keys()){
      const trail=new Set();
      let cursor=group;
      while(parents.has(cursor)){
        if(trail.has(cursor)){errors.push('Administrative parentage cycle at '+date);break;}
        trail.add(cursor);cursor=parents.get(cursor);
      }
    }
  }
  return {ok:errors.length===0,errors:[...new Set(errors)]};
}

/**
 * Creates a forest for a reference year. The category root is UI-only;
 *  a child is nested administratively ONLY when a documentary edge is active.
 * All 139 source-version uses remain addressable, even if temporal matching
 * is uncertain; a missing source end-date never means current-year membership.
 */
export function buildHistoricalOhmTree(index,register,year){
  const valid=validateOhmParentage(index,register);
  if(!valid.ok)throw Error('OHM parentage invalid: '+valid.errors.join('; '));
  if(!Number.isInteger(year)||year<1000||year>2100)throw Error('Invalid reference year');
  const projection=projectGeodataHistoricalSourceCatalog(index);
  const activeIds=sourceAtReferenceYear(index,year);
  const nodes=new Map();
  for(const entry of index.entries){
    let node=nodes.get(entry.sourceGroup);
    if(!node){
      node={
        id:entityIdFromGroup(entry.sourceGroup),group:entry.sourceGroup,
        name:{...entry.displayName},category:ohmCategory(entry.sourceGroup),
        qualification:'provisional_source_identity',parentGroup:null,
        parentEvidence:null,versions:[],children:[],activeEntries:[]
      };
      nodes.set(entry.sourceGroup,node);
    }
    node.versions.push(entry);
    if(activeIds.has(entry.id))node.activeEntries.push(entry);
  }
  for(const node of nodes.values())node.versions.sort((a,b)=>
    (a.sourcePeriod.start||'').localeCompare(b.sourcePeriod.start||'')||a.id.localeCompare(b.id));
  const date=String(year).padStart(4,'0')+'-07-01';
  const activeLinks=[];
  for(const link of register.links){
    if(!pointIn(link,date))continue;
    const parent=nodes.get(link.parentSourceGroup),child=nodes.get(link.childSourceGroup);
    // Preserve the hierarchy only where BOTH source groups have a
    // dated version for this reference year. Undated nodes stay unlinked.
    if(!parent?.activeEntries.length||!child?.activeEntries.length)continue;
    child.parentGroup=parent.group;child.parentEvidence=link;
    parent.children.push(child);
    activeLinks.push(link);
  }
  const roots={regions:[],counties:[],comitates:[]};
  for(const node of nodes.values()){
    if(!node.parentGroup)roots[node.category].push(node);
  }
  function sortTree(array){
    array.sort((a,b)=>a.name.ro.localeCompare(b.name.ro,'ro'));
    for(const node of array)sortTree(node.children);
  }
  for(const array of Object.values(roots))sortTree(array);
  return {year,referenceDate:date,sourceOnly:true,roots,nodes,
    activeLinks,assetCount:projection.geometries.length,
    geometryUses:projection.geometryUses,
    sourceVersionCount:projection.versions.length,
    groupCount:projection.entities.length,
    unresolvedParents:[...nodes.values()].filter(n=>!n.parentGroup).length,
    legalBoundariesCertified:false,qualifiedGeometryBorders:0};
}

/** Choose one geometry without fabricating temporal coverage or resolving
 * source-version overlaps by arbitrary sort order. */
export function uniqueSourceVersionAtYear(node,year){
  if(!node)return null;
  const point=String(year).padStart(4,'0')+'-07-01';
  const active=node.activeEntries.filter(e=>{
    const start=e.sourcePeriod.start,end=e.sourcePeriod.end;
    const lower=start&&(start.length===4?start+'-01-01':start.length===7?start+'-01':start);
    const upper=end&&(end.length===4?end+'-12-31':end.length===7?end+'-31':end);
    return lower&&upper&&lower<=point&&point<=upper;
  });
  return active.length===1?active[0]:null;
}
