/**
 * HIST-OHM-TREE.1 — explicit temporal parentage and shared geometric assets.
 * Identity grouping is provisional; ONLY independently documented, time-
 * bounded edges from the parentage register may create administrative children.
 * Never equate an OHM source directory or polygon overlap with a legal parent.
 */
import {validateGeodataHistoricalIndex,geodataSourcesAtYear} from './historicalGeodata.mjs';
import {projectGeodataHistoricalSourceCatalog} from './historicalGeodataTemporal.mjs';

export const OHM_PARENTAGE_SCHEMA='atlas-historical-ohm-parentage-v1';
export const DOCUMENTARY_PARENTS_SCHEMA='atlas-historical-documentary-parents-v1';
export const isDocumentaryParentId=id=>typeof id==='string'&&/^doc:[a-z0-9-]+$/.test(id);
const fullDate=x=>typeof x==='string'&&/^\d{4}-\d\d-\d\d$/.test(x)&&
  !Number.isNaN(Date.parse(x+'T00:00:00Z'))&&
  new Date(x+'T00:00:00Z').toISOString().slice(0,10)===x;
const intersects=(a,b)=>a.start<=b.end&&b.start<=a.end;
const pointIn=(link,date)=>date>=link.start&&date<=link.end;
const overlapsCalendarYear=(link,year)=>{
  const yr=String(year).padStart(4,'0');
  return link.start<=yr+'-12-31'&&link.end>=yr+'-01-01';
};
export const entityIdFromGroup=group=>'ohm:provisional-entity:'+encodeURIComponent(group);
export const ohmCategory=group=>group.startsWith('Județe istorice/')?'counties':
  group.startsWith('Comitate istorice/')?'comitates':'regions';
export const groupShortName=group=>group.split('/').at(-1);
export function sourceAtReferenceYear(index,year){
  return new Set(geodataSourcesAtYear(index,year).map(entry=>entry.id));
}

/** Fail closed: documentary nodes are institutions WITHOUT geometries.
 * Their time windows restrict evidence coverage, not legal creation/death.
 */
export function validateDocumentaryParents(registry){
 const errors=[];
 if(!registry||registry.schema!==DOCUMENTARY_PARENTS_SCHEMA||!Array.isArray(registry.nodes))
   return {ok:false,errors:['Invalid documentary parent registry']};
 const ids=new Set();
 for(const node of registry.nodes){
   if(!node||!isDocumentaryParentId(node.id)||ids.has(node.id)){
     errors.push('Documentary parent ID missing, invalid or duplicated');continue;
   }
   ids.add(node.id);
   if(!node.names||typeof node.names.ro!=='string'||!node.names.ro.trim()||
       typeof node.names.en!=='string'||!node.names.en.trim())
     errors.push('Documentary node names missing: '+node.id);
   if(node.geometryId!==null||node.geometryStatus!=='NO_GEOMETRY_DOCUMENTARY_NODE'||
       node.sourceFamily!=='HISTORICAL_DOCUMENTARY_PARENT'||
       node.noLegalBoundaryCertification!==true)
     errors.push('Documentary node cannot contain or certify geometry: '+node.id);
   if(!Array.isArray(node.documentedWindows)||!node.documentedWindows.length||
       !node.documentedWindows.every(w=>fullDate(w.start)&&fullDate(w.end)&&
         w.start<=w.end&&w.dateStatus==='EVIDENCE_SCOPE_NOT_INSTITUTIONAL_BIRTH_OR_DEATH'))
     errors.push('Documentary institution evidence window invalid: '+node.id);
   if(!Array.isArray(node.evidence)||!node.evidence.length||
       !node.evidence.every(e=>typeof e.url==='string'&&e.url.startsWith('https://')&&
         typeof e.detail==='string'&&e.detail.length>12))
     errors.push('Documentary institution evidence missing: '+node.id);
 }
 return {ok:errors.length===0,errors};
}
const documentedAtYear=(node,year)=>node.documentedWindows.some(w=>
  w.start<=String(year).padStart(4,'0')+'-12-31'&&w.end>=String(year).padStart(4,'0')+'-01-01');
const edgeWithinDocumentaryWindow=(node,link)=>node.documentedWindows.some(w=>
  w.start<=link.start&&w.end>=link.end);

/** Fail closed: only documentary qualified, acyclic, non-conflicting parents. */
export function validateOhmParentage(index,register,documentaryParents){
  const errors=[];
  const valid=validateGeodataHistoricalIndex(index);
  if(!valid.ok)return {ok:false,errors:['Invalid OHM index',...valid.errors]};
  if(!register||register.schema!==OHM_PARENTAGE_SCHEMA||!Array.isArray(register.links))
    return {ok:false,errors:['Invalid OHM parentage register']};
  const documentaryQA=validateDocumentaryParents(documentaryParents);
  if(!documentaryQA.ok)return {ok:false,errors:documentaryQA.errors};
  const documentaryMap=new Map(documentaryParents.nodes.map(n=>[n.id,n]));
  const groups=new Set([
    ...index.entries.map(entry=>entry.sourceGroup),
    ...documentaryMap.keys()
  ]);
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
    for(const candidate of [link.parentSourceGroup,link.childSourceGroup]){
      if(isDocumentaryParentId(candidate)){
        const doc=documentaryMap.get(candidate);
        if(!doc||!edgeWithinDocumentaryWindow(doc,link))
          errors.push('Parentage beyond documentary evidence window: '+link.id+' / '+candidate);
      }
    }
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
 * Creates a forest for a selected calendar year. One documentary membership
 * witnessed at ANY time in that year is exposed in the year-level browser,
 * and its exact start/end dates remain on the edge. This does NOT infer
 * membership on 1 July or uninterrupted status throughout that year.
 * Source geometry availability uses the separate OHM year filter and is
 * never certified by a documentary parent edge. The category root is UI-only.
 */
export function buildHistoricalOhmTree(index,register,year,documentaryParents){
  const valid=validateOhmParentage(index,register,documentaryParents);
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
  // Add geometry-free documentary parent institutions. They never enter OHM
  // source index, geometryUses, the map source or checkbox selection.
  // Out-of-period documentary institutions are not shown for this year.
  for(const doc of documentaryParents.nodes){
    if(!documentedAtYear(doc,year))continue;
    if(nodes.has(doc.id))throw Error('Documentary parent collides with an OHM group');
    nodes.set(doc.id,{
      id:doc.id,group:doc.id,name:{...doc.names},category:'regions',
      qualification:'documented_parent_institution_only',
      parentGroup:null,parentEvidence:null,versions:[],children:[],activeEntries:[],
      documentaryOnly:true,geometryId:null,geometryStatus:doc.geometryStatus,
      documentedWindows:doc.documentedWindows,evidence:doc.evidence,
      institutionKind:doc.kind,provenance:doc.provenance
    });
  }
  for(const node of nodes.values())node.versions.sort((a,b)=>
    (a.sourcePeriod.start||'').localeCompare(b.sourcePeriod.start||'')||a.id.localeCompare(b.id));
  const date=String(year).padStart(4,'0')+'-07-01';
  const annualLinks=register.links.filter(l=>overlapsCalendarYear(l,year));
  // An entity that changes direct parent within the same calendar year
  // cannot be assigned unambiguously by a year-only control. Defer it
  // until date-specific navigation is available; never choose arbitrarily.
  const counts=new Map();
  for(const link of annualLinks)
    counts.set(link.childSourceGroup,(counts.get(link.childSourceGroup)||0)+1);
  const ambiguousAnnualParents=[...counts].filter(([,n])=>n>1).map(([g])=>g);
  const activeLinks=[];
  for(const link of annualLinks){
    if(counts.get(link.childSourceGroup)!==1)continue;
    const parent=nodes.get(link.parentSourceGroup),child=nodes.get(link.childSourceGroup);
    if(!parent||!child)continue;
    // Documentary membership is separate from a source polygon's OHM
    // time bounds. End=null never becomes a valid 1865/1890/1925 geometry.
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
  return {year,referenceDate:date,parentageTimeResolution:'calendar_year_documented_at_some_point',
    ambiguousAnnualParents,sourceOnly:true,roots,nodes,
    activeLinks,assetCount:projection.geometries.length,
    documentaryNodeCount:[...nodes.values()].filter(n=>n.documentaryOnly).length,
    documentaryRootCount:roots.regions.filter(n=>n.documentaryOnly).length,
    documentaryOnlyGeometryCount:0,
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
