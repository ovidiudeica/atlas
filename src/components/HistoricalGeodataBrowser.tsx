import {useEffect,useMemo,useRef,useState} from 'react';
import {EntityCardSection} from './EntityCardSection';
import {
  buildHistoricalOhmTree,validateOhmParentage,uniqueSourceVersionAtYear,
  groupShortName,type OhmParentageLink,type OhmParentageRegister,type OhmTreeNode,
  type HistoricalDocumentaryParentRegistry
} from '../data/historicalOhmTree.mjs';
import {
  geodataSourceAtDate,loadGeodataSharedAsset,loadGeodataSourceIndex,
  type GeodataSourceEntry,type GeodataSourceFeature,type GeodataSourceIndex
} from '../data/historicalGeodata.mjs';

import {
  loadRohgis1930Catalog,loadRohgis1930Feature,
  toRohgisGeodataEntry,type Rohgis1930Catalog,type Rohgis1930Version
} from '../data/historicalRohgis1930.mjs';

type Locale='ro'|'en';
export interface HistoricalGeodataSelection {
  entry:GeodataSourceEntry;
  feature:GeodataSourceFeature;
  parentEvidence?:OhmParentageLink|null;
  sourceReportedParent?:string;
}
export interface HistoricalVisibilityChange {
  entry:GeodataSourceEntry;
  feature?:GeodataSourceFeature;
}

const labels={
  ro:{
    title:'OpenHistoricalMap — catalog istoric',subtitle:'139 de versiuni-sursă OHM. Geometriile și perioadele provin din OpenHistoricalMap; hotarele și ierarhiile nu sunt certificate independent.',
    search:'Caută entitate sau perioadă',onlyYear:'Numai versiunile cu interval-sursă care intersectează anul selectat',
    loading:'Se încarcă inventarul istoric…',loadGeom:'Se încarcă geometria originală…',
    empty:'Nu există versiuni ale sursei pentru acest filtru.',warning:'Geometrie-sursă necertificată',
    period:'Perioada declarată de sursă',source:'Sursă și proveniență',
    kind:'Tip sursă',geometry:'Geometrie',recenter:'Încadrează pe hartă',
    notes:'Observații ale sursei',sourceName:'Colecție',uncertain:'Interval incert / sursă necalificată',
    identity:'Identitate istorică (sursă)',sourceId:'ID sursă',original:'Fișierul original din Drive',
    noHierarchy:'Apartenența la un grup de colecție nu este o relație părinte–copil certificată.',
    indexed:'versiuni OHM'
  },
  en:{
    title:'OpenHistoricalMap — historical catalogue',subtitle:'139 OHM source versions. Geometries and periods come from OpenHistoricalMap; boundaries and hierarchies are not independently certified.',
    search:'Find entity or period',onlyYear:'Only source versions whose dates intersect the selected year',
    loading:'Loading historical source inventory…',loadGeom:'Loading original source geometry…',
    empty:'No source version matches this filter.',warning:'Uncertified source geometry',
    period:'Source-reported period',source:'Source and provenance',
    kind:'Source classification',geometry:'Geometry',recenter:'Zoom to boundary',
    notes:'Source observations',sourceName:'Collection',uncertain:'Unverified source interval',
    identity:'Historical identity (source)',sourceId:'Source ID',original:'Original Drive file',
    noHierarchy:'A source collection group is not a certified administrative parent–child relationship.',
    indexed:'OHM versions'
  }
};
const foldedSearch=(value:string)=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase();

const dateLabel=(e:GeodataSourceEntry,lang:Locale)=>
  e.sourcePeriod.kind==='undated'?(lang==='ro'?'Datare neverificată':'Undated / unverified'):
  e.sourcePeriod.kind==='snapshot'?
    (lang==='ro'?'Atestat în ':'Attested in ')+e.sourcePeriod.start?.slice(0,4):
  (e.sourcePeriod.start?.slice(0,4)||'?')+'–'+(e.sourcePeriod.end?.slice(0,4)||'?');

type FilteredOhmNode=OhmTreeNode&{
 shownVersions:GeodataSourceEntry[];
 shownChildren:FilteredOhmNode[];
};
const searchWords=(entry:GeodataSourceEntry)=>[
 entry.displayName.ro,entry.displayName.en,entry.sourceGroup,
 entry.sourcePeriod.start||'',entry.sourcePeriod.end||'',
 String(entry.sourceRelationId),entry.id
];

export function HistoricalGeodataBrowser({
  year,onYear,lang,onSelect,selectedId,onFiltersActiveChange,
  onYearFilterChange,visibleIds,onVisibilityChange
}:{
 year:number;onYear:(year:number)=>void;lang:Locale;
 onSelect:(selection:HistoricalGeodataSelection)=>void;
 selectedId:string|null;onFiltersActiveChange:(active:boolean)=>void;
 onYearFilterChange:(active:boolean)=>void;
 visibleIds:string[];
 onVisibilityChange:(changes:HistoricalVisibilityChange[],visible:boolean)=>void;
}){
 const [index,setIndex]=useState<GeodataSourceIndex|null>(null);
 const [parentage,setParentage]=useState<OhmParentageRegister|null>(null);
 const [documentaryParents,setDocumentaryParents]=useState<HistoricalDocumentaryParentRegistry|null>(null);
 const [rohgis,setRohgis]=useState<Rohgis1930Catalog|null>(null);
 const [error,setError]=useState<string|null>(null);
 const [busy,setBusy]=useState<string|null>(null);
 const [query,setQuery]=useState('');
 const [yearOnly,setYearOnly]=useState(false);
 const [expanded,setExpanded]=useState<Set<string>>(()=>new Set());
 const [openCategories,setOpenCategories]=useState<Set<string>>(()=>new Set(['regions']));
 const mounted=useRef(true);
 const t=labels[lang];
 const term=foldedSearch(query.trim());
 const filtering=Boolean(term)||yearOnly;
 const visibleSet=useMemo(()=>new Set(visibleIds),[visibleIds]);
 const headings=lang==='ro'?{
   title:'Entități istorice',search:'Caută în arbore',searchHint:'Denumire, perioadă sau ID OHM',
   clear:'Șterge căutarea',year:'An',yearFilter:'Filtrează după an',
   groups:'grupuri-sursă',versions:'versiuni',results:'rezultate',
   documentary:'părinți fără geometrie',noGeometry:'Fără geometrie · doar documentar',
   documentation:'Dovezi istorice',documentWindow:'Perioadă documentată (nu dată de înființare/desființare)',
   methodological:'Despre ierarhie și limite',
   methodologicalBody:'Arborele folosește doar relații administrative cu documente și perioade definite. Unitățile fără părinte verificat rămân separate. Geometriile și intervalele OHM sunt surse de lucru, nu hotare juridice certificate.',
   independent:'Legături documentate pentru anul ales',
   version:'Versiune OHM',versionsPlural:'Versiuni geometrice',
   notDated:'Apartenența administrativă este documentată, dar valabilitatea geometriei OHM în acest an nu este verificată. Dezactivează filtrul temporal pentru a examina versiunea-sursă.',
   show:'Afișează geometria',hide:'Ascunde geometria',
   sourceParent:'Părinte documentat, fără certificarea geometriei',
   pending:'Fără părinte administrativ calificat în anul ales',
   visible:'bife active'
 }:{
   title:'Historical entities',search:'Search tree',searchHint:'Name, period or OHM ID',
   clear:'Clear search',year:'Year',yearFilter:'Filter by year',
   groups:'source groups',versions:'versions',results:'matches',
   documentary:'geometry-free parents',noGeometry:'No geometry · documentary only',
   documentation:'Historical sources',documentWindow:'Documented window (not institutional birth/death)',
   methodological:'About hierarchy and limitations',
   methodologicalBody:'The tree uses only documented and time-scoped administrative links. Entities without verified parents remain separate. OHM geometry and dates remain working source data, not certified legal borders.',
   independent:'Documented links for reference year',
   version:'OHM version',versionsPlural:'Geometry versions',
   notDated:'Administrative membership is documented, but the OHM geometry is not dated reliably for this year. Turn off the temporal filter to inspect the source version.',
   show:'Show geometry',hide:'Hide geometry',
   sourceParent:'Documented parent, without boundary certification',
   pending:'No qualified administrative parent for reference year',
   visible:'checked geometries'
 };
 useEffect(()=>{onFiltersActiveChange(filtering);},
   [filtering,onFiltersActiveChange]);
 useEffect(()=>{onYearFilterChange(yearOnly);},
   [yearOnly,onYearFilterChange]);
 useEffect(()=>{
   mounted.current=true;
   let active=true;
   const base=import.meta.env.BASE_URL;
   Promise.all([
     loadGeodataSourceIndex(base),
     fetch(base+'data/historical/v1/ohm-parentage.json').then(async response=>{
       if(!response.ok)throw Error('Parentage register HTTP '+response.status);
       return response.json() as Promise<OhmParentageRegister>;
     }),
     fetch(base+'data/historical/v1/documentary-parents.json').then(async response=>{
       if(!response.ok)throw Error('Documentary parents HTTP '+response.status);
       return response.json() as Promise<HistoricalDocumentaryParentRegistry>;
     }),
     loadRohgis1930Catalog(base),
     fetch(base+'data/historical/v1/documentary-parents-extensions.json').then(async response=>{
       if(!response.ok)throw Error('Documentary extensions HTTP '+response.status);
       return response.json() as Promise<HistoricalDocumentaryParentRegistry>;
     }),
     fetch(base+'data/historical/v1/ohm-parentage-extensions.json').then(async response=>{
       if(!response.ok)throw Error('Parentage extensions HTTP '+response.status);
       return response.json() as Promise<OhmParentageRegister>;
     })
   ]).then(([sources,register,parents,rohgis1930,docExt,linkExt])=>{
     const mergedParents={...parents,nodes:[...parents.nodes,...docExt.nodes]};
     const mergedRegister={...register,links:[...register.links,...linkExt.links]};
     const gate=validateOhmParentage(sources,mergedRegister,mergedParents);
     if(!gate.ok)throw Error('OHM parentage: '+gate.errors.join('; '));
     if(active){setIndex(sources);setParentage(mergedRegister);setDocumentaryParents(mergedParents);setRohgis(rohgis1930);}
   }).catch(err=>{if(active)setError(String(err));});
   return ()=>{active=false;mounted.current=false;};
 },[]);
 const tree=useMemo(()=>index&&parentage&&documentaryParents?
   buildHistoricalOhmTree(index,parentage,year,documentaryParents):
   null,[index,parentage,documentaryParents,year]);
 const rohgisCounties=useMemo(()=>{
   if(year!==1930||!rohgis)return [] as {county:Rohgis1930Version;plasi:Rohgis1930Version[]}[];
   const map=new Map<string,{county:Rohgis1930Version;plasi:Rohgis1930Version[]}>();
   for(const version of rohgis.versions.filter(v=>v.kind==='judet'))
     map.set(version.entityId,{county:version,plasi:[]});
   for(const version of rohgis.versions.filter(v=>v.kind==='plasa'))
     map.get(version.parentId)?.plasi.push(version);
   for(const group of map.values())
     group.plasi.sort((a,b)=>a.nameRo.localeCompare(b.nameRo,'ro'));
   return [...map.values()].sort((a,b)=>a.county.nameRo.localeCompare(b.county.nameRo,'ro'));
 },[rohgis,year]);
 const matchesRohgis=(x:string)=>!term||foldedSearch(x).includes(term);
 const hasRohgisMatch=rohgisCounties.some(group=>
   matchesRohgis(group.county.nameRo)||group.plasi.some(v=>matchesRohgis(v.nameRo)));
 const filteredRoots=useMemo(()=>{
   if(!tree)return {regions:[],counties:[],comitates:[]} as {
     regions:FilteredOhmNode[];counties:FilteredOhmNode[];comitates:FilteredOhmNode[];
   };
   function filterNode(node:OhmTreeNode,inheritedMatch=false):FilteredOhmNode|null{
     // Institutional hierarchy is documentary. Source geometry date
     // qualification remains separate, including for undated OHM children.
     const available=yearOnly?
       (node.activeEntries.length?node.activeEntries:
         node.parentEvidence?node.versions:[]):node.versions;
     const groupMatch=Boolean(term)&&foldedSearch(
       node.group+' '+node.name.ro+' '+node.name.en).includes(term);
     const matches=inheritedMatch||groupMatch;
     const shownVersions=!term||matches?available:
       available.filter(entry=>searchWords(entry).some(word=>foldedSearch(word).includes(term)));
     const shownChildren=node.children.map(child=>filterNode(child,matches))
       .filter((child):child is FilteredOhmNode=>child!==null);
     // Geometry-free documentary parents can appear as root institutions
     // during their evidenced dates, even without an OHM geometry/child.
     const sourceChild=node.group==='Regatul României'&&hasRohgisMatch;
     if(!shownVersions.length&&!shownChildren.length&&!sourceChild&&
         (!node.documentaryOnly||(Boolean(term)&&!matches)))return null;
     return {...node,shownVersions,shownChildren};
   }
   return {
     regions:tree.roots.regions.map(node=>filterNode(node)).filter((n):n is FilteredOhmNode=>n!==null),
     counties:tree.roots.counties.map(node=>filterNode(node)).filter((n):n is FilteredOhmNode=>n!==null),
     comitates:tree.roots.comitates.map(node=>filterNode(node)).filter((n):n is FilteredOhmNode=>n!==null)
   };
 },[tree,term,yearOnly,hasRohgisMatch]);
 const matchedCount=useMemo(()=>{
   const ids=new Set<string>();
   const visit=(node:FilteredOhmNode)=>{
     for(const entry of node.shownVersions)ids.add(entry.id);
     for(const child of node.shownChildren)visit(child);
   };
   for(const section of Object.values(filteredRoots))for(const root of section)visit(root);
   for(const group of rohgisCounties){
     const parentMatch=matchesRohgis(group.county.nameRo);
     if(parentMatch)ids.add(group.county.versionId);
     for(const v of group.plasi)if(parentMatch||matchesRohgis(v.nameRo))ids.add(v.versionId);
   }
   return ids.size;
 },[filteredRoots,rohgisCounties,term]);
 const sections=[
   {key:'regions' as const,ro:'State și regiuni',en:'States and regions'},
   {key:'counties' as const,ro:'Județe fără părinte calificat',en:'Counties without qualified parent'},
   {key:'comitates' as const,ro:'Comitate fără părinte calificat',en:'Comitates without qualified parent'}
 ];
 async function selectEntry(entry:GeodataSourceEntry){
   if(!index||busy)return;
   setBusy(entry.id);setError(null);
   try{
     const feature=await loadGeodataSharedAsset(index,entry,import.meta.env.BASE_URL);
     if(!mounted.current)return;
     const parentEvidence=tree?.nodes.get(entry.sourceGroup)?.parentEvidence||null;
     onSelect({entry,feature,parentEvidence});
   }catch(e){if(mounted.current)setError(String(e));}
   finally{if(mounted.current)setBusy(null);}
 }
 async function changeVisibility(entries:GeodataSourceEntry[],enable:boolean){
   if(!index||busy)return;
   const targets=entries.filter(entry=>enable?!visibleSet.has(entry.id):visibleSet.has(entry.id));
   if(!targets.length)return;
   setBusy(targets[0].id);setError(null);
   try{
     const changes=enable?
       await Promise.all(targets.map(async entry=>({
         entry,feature:await loadGeodataSharedAsset(index,entry,import.meta.env.BASE_URL)
       }))):targets.map(entry=>({entry}));
     if(mounted.current)onVisibilityChange(changes,enable);
   }catch(e){if(mounted.current)setError(String(e));}
   finally{if(mounted.current)setBusy(null);}
 }
 async function selectRohgisVersion(version:Rohgis1930Version){
   if(!rohgis||busy)return;
   setBusy(version.versionId);setError(null);
   try{
     const feature=await loadRohgis1930Feature(rohgis,version,import.meta.env.BASE_URL);
     const parent=version.kind==='plasa'?
       rohgis.versions.find(v=>v.entityId===version.parentId)?.nameRo:null;
     if(mounted.current)onSelect({
       entry:toRohgisGeodataEntry(version),feature,
       sourceReportedParent:version.kind==='plasa'?
         (lang==='ro'?'Județul ':'County ')+(parent||'?'):
         (lang==='ro'?'Regatul României':'Kingdom of Romania')
     });
   }catch(e){if(mounted.current)setError(String(e));}
   finally{if(mounted.current)setBusy(null);}
 }
 async function toggleRohgisVersion(version:Rohgis1930Version,enable:boolean){
   if(!rohgis||busy)return;
   setBusy(version.versionId);setError(null);
   try{
     const entry=toRohgisGeodataEntry(version);
     const changes=enable?[{entry,feature:await loadRohgis1930Feature(
       rohgis,version,import.meta.env.BASE_URL)}]:[{entry}];
     if(mounted.current)onVisibilityChange(changes,enable);
   }catch(e){if(mounted.current)setError(String(e));}
   finally{if(mounted.current)setBusy(null);}
 }
 function renderRohgisTree(){
   const groups=rohgisCounties.filter(group=>
     matchesRohgis(group.county.nameRo)||group.plasi.some(v=>matchesRohgis(v.nameRo)));
   return <div className="history-tree-children history-rohgis-tree" role="group">
     <p className="history-documentary-label">
       {lang==='ro'?'Județe și plăși (1930) · RoHGIS · hotare-sursă necertificate':
         'Counties and plăși (1930) · RoHGIS · uncertified source boundaries'}
       {' · '}{groups.length} / 71
     </p>
     {groups.map(({county,plasi})=>{
       const parentMatch=matchesRohgis(county.nameRo);
       const shownPlasi=parentMatch?plasi:plasi.filter(v=>matchesRohgis(v.nameRo));
       const open=expanded.has(county.entityId)||Boolean(term);
       const isSelected=selectedId===county.versionId;
       return <div key={county.entityId} className="history-tree-node" role="treeitem" aria-level={2}>
         <div className="history-tree-row" style={{paddingLeft:10}}>
           <button type="button" className="history-tree-expand" aria-expanded={open}
             aria-label={(open?'Collapse ':'Expand ')+county.nameRo}
             onClick={()=>toggleExpansion(county.entityId)}>
             <span aria-hidden="true">{open?'▾':'▸'}</span>
           </button>
           <input type="checkbox" checked={visibleSet.has(county.versionId)} disabled={busy!==null}
             aria-label={(lang==='ro'?'Afișează județul ':'Show county ')+county.nameRo}
             onChange={e=>void toggleRohgisVersion(county,e.target.checked)}/>
           <button type="button" className={'history-tree-name'+(isSelected?' is-selected':'')}
             onClick={()=>void selectRohgisVersion(county)}>{county.nameRo}</button>
           <span className="history-source-version-count">{plasi.length}</span>
         </div>
         {open&&<div className="history-tree-children" role="group">
           {shownPlasi.map(plasa=><div key={plasa.entityId} className="history-tree-row"
             role="treeitem" aria-level={3} style={{paddingLeft:25}}>
             <span className="history-tree-leaf" aria-hidden="true"/>
             <input type="checkbox" checked={visibleSet.has(plasa.versionId)} disabled={busy!==null}
               aria-label={(lang==='ro'?'Afișează plasa ':'Show plasa ')+plasa.nameRo}
               onChange={e=>void toggleRohgisVersion(plasa,e.target.checked)}/>
             <button type="button" className={'history-tree-name'+
               (selectedId===plasa.versionId?' is-selected':'')}
               onClick={()=>void selectRohgisVersion(plasa)}>{plasa.nameRo}</button>
           </div>)}
         </div>}
       </div>;
     })}
   </div>;
 }
 function setYearFilter(active:boolean){setYearOnly(active);}
 function toggleExpansion(id:string){
   setExpanded(old=>{
     const next=new Set(old);
     if(next.has(id))next.delete(id);else next.add(id);
     return next;
   });
 }
 function renderVersion(entry:GeodataSourceEntry){
   const checked=visibleSet.has(entry.id);
   const isSourceDated=geodataSourceAtDate(entry,String(year).padStart(4,'0')+'-07-01');
   const blockedByUnqualifiedGeometry=yearOnly&&!isSourceDated;
   return <div key={entry.id} className="history-tree-version-row" role="treeitem"
     aria-selected={selectedId===entry.id}>
     <input type="checkbox" checked={checked} disabled={busy!==null||blockedByUnqualifiedGeometry}
       title={blockedByUnqualifiedGeometry?headings.notDated:undefined}
       aria-label={(checked?headings.hide:headings.show)+' · '+entry.displayName[lang]+' '+dateLabel(entry,lang)}
       onChange={event=>void changeVisibility([entry],event.target.checked)}/>
     <button type="button" className={'history-version-button'+(selectedId===entry.id?' is-selected':'')}
       onClick={()=>void selectEntry(entry)} disabled={busy!==null}
       aria-current={selectedId===entry.id?'true':undefined}
       title={entry.displayName[lang]+' · OHM '+entry.sourceRelationId}>
       <span className="history-version-details">
         <span className="history-version-period">{dateLabel(entry,lang)}</span>
         <span className="history-version-id">OHM {entry.sourceRelationId}</span>
       </span>
     </button>
   </div>;
 }
 function renderNode(node:FilteredOhmNode,depth:number):React.ReactNode{
   const key=node.id;
   const active=uniqueSourceVersionAtYear(node,year);
   const temporallyUnqualified=yearOnly&&!active&&node.shownVersions.length>0;
   const hasRohgisChildren=node.group==='Regatul României'&&hasRohgisMatch;
   const hasDetails=Boolean(node.documentaryOnly)||node.shownVersions.length>1||
     node.shownChildren.length>0||temporallyUnqualified||hasRohgisChildren;
   const isExpanded=expanded.has(key)||Boolean(term);
   const quickEntry=(active&&node.shownVersions.some(e=>e.id===active.id)?active:null)||
     (!yearOnly&&node.shownVersions.length===1?node.shownVersions[0]:null);
   const activeChecked=Boolean(quickEntry&&visibleSet.has(quickEntry.id));
   const title=node.documentaryOnly?node.name[lang]:groupShortName(node.group);
   return <div key={key} className="history-tree-node" role="treeitem"
     aria-level={depth+1} aria-expanded={hasDetails?isExpanded:undefined}>
     <div className={'history-tree-row'+(node.parentEvidence?' has-qualified-parent':'')}
       style={{paddingLeft:Math.min(depth,10)*10}}>
       {hasDetails?<button type="button" className="history-tree-expand"
         aria-label={(isExpanded?(lang==='ro'?'Restrânge ':'Collapse '):(lang==='ro'?'Extinde ':'Expand '))+title}
         aria-expanded={isExpanded} onClick={()=>toggleExpansion(key)}>
         <span aria-hidden="true">{isExpanded?'▾':'▸'}</span>
       </button>:<span className="history-tree-leaf" aria-hidden="true"/>}
       {node.documentaryOnly?
         <span className="history-documentary-no-checkbox"
           aria-label={headings.noGeometry} title={headings.noGeometry}>—</span>:
         <input type="checkbox" disabled={!quickEntry||busy!==null}
           checked={activeChecked}
           aria-label={(activeChecked?headings.hide:headings.show)+' · '+title}
           title={quickEntry?dateLabel(quickEntry,lang):headings.notDated}
           onChange={event=>{if(quickEntry)void changeVisibility([quickEntry],event.target.checked);}}/>}
       <button type="button" className="history-tree-name"
         title={node.parentEvidence?headings.sourceParent:headings.pending}
         onClick={()=>{
           if(quickEntry)void selectEntry(quickEntry);
           else if(hasDetails)toggleExpansion(key);
         }}>
         <span>{title}</span>
         {node.parentEvidence&&<span className="history-qualified-link" title={headings.sourceParent}>✓</span>}
       </button>
       {temporallyUnqualified&&<span className="history-source-unqualified"
         title={headings.notDated} aria-label={headings.notDated}>?</span>}
       {node.documentaryOnly?
         <span className="history-documentary-mark" title={headings.noGeometry}>DOC</span>:
         <span className="history-source-version-count" title={headings.versionsPlural}>
           {node.shownVersions.length}
         </span>}
     </div>
     {hasDetails&&isExpanded&&<div className="history-tree-children" role="group">
       {node.documentaryOnly&&<div className="history-documentary-details">
         <p>{headings.noGeometry}</p>
         <p className="history-documentary-label">{headings.documentWindow}</p>
         {node.documentedWindows?.map(w=><p key={w.start+'-'+w.end}
           className="history-documentary-period">{w.start} — {w.end}</p>)}
         <p className="history-documentary-label">{headings.documentation}</p>
         <ul>{node.evidence?.map(item=><li key={item.url}>
           <a href={item.url} target="_blank" rel="noopener noreferrer">
             {item.type.replaceAll('_',' ')}
           </a>
           <span> — {item.detail}</span>
         </li>)}</ul>
       </div>}
       {(node.shownVersions.length>1||temporallyUnqualified)&&
         <div className="history-source-versions" role="group" aria-label={title+' — '+headings.versionsPlural}>
           {node.shownVersions.map(renderVersion)}
         </div>}
       {node.shownChildren.map(child=>renderNode(child,depth+1))}
       {hasRohgisChildren&&renderRohgisTree()}
     </div>}
   </div>;
 }
 return <section className="tree-content history-geodata-pane" aria-label={headings.title}>
   <header className="history-catalog-heading">
     <div className="history-catalog-heading-row">
       <h3>{headings.title}</h3>
       <span className="history-catalog-mark" title="OpenHistoricalMap">OHM</span>
     </div>
     <p className="history-catalog-stat" role="status">
       {tree?<>{tree.groupCount} {headings.groups} · {tree.sourceVersionCount} {headings.versions}
         {' · '}{tree.documentaryNodeCount} {headings.documentary}
         {' · '}{visibleIds.length} {headings.visible}
       {rohgis&&' · RoHGIS 1930: 71 / 494'}</>:t.loading}
     </p>
   </header>
   <div className="history-catalog-filters">
     <label className="history-filter-label" htmlFor="history-catalog-search">{headings.search}</label>
     <div className="history-filter-search">
       <span className="history-search-symbol" aria-hidden="true">⌕</span>
       <input id="history-catalog-search" type="search" value={query}
         placeholder={headings.searchHint} autoComplete="off"
         onChange={event=>setQuery(event.target.value)}/>
       {query&&<button type="button" className="history-search-clear"
         onClick={()=>setQuery('')} aria-label={headings.clear} title={headings.clear}>×</button>}
     </div>
     <div className="history-filter-row">
       <label className="history-filter-year">{headings.year}
         <input type="number" min={1000} max={2100} value={year}
           onChange={event=>{
             const value=Number(event.target.value);
             if(Number.isInteger(value)&&value>=1000&&value<=2100){
               onYear(value);setYearFilter(true);
             }
           }}/>
       </label>
       <label className="history-filter-checkbox">
         <input type="checkbox" checked={yearOnly}
           onChange={event=>setYearFilter(event.target.checked)}/>
         <span>{headings.yearFilter}</span>
       </label>
     </div>
     {filtering&&tree&&<p className="history-filter-count" role="status">
       {matchedCount} {headings.results}
     </p>}
   </div>
   {error&&<p className="history-catalog-error" role="alert">{error}</p>}
   {busy&&<p className="history-catalog-loading" role="status">{t.loadGeom}</p>}
   {tree&&matchedCount===0&&<p className="history-catalog-empty">{t.empty}</p>}
   {tree&&<div className="history-geodata-groups" role="group" aria-label={headings.title}>
     {sections.filter(s=>filteredRoots[s.key].length>0).map(section=>
       <details key={section.key+(term?':search':':browse')}
         className="history-geodata-category"
         open={Boolean(term)||openCategories.has(section.key)}
         onToggle={event=>{
           if(term)return;
           const isOpen=event.currentTarget.open;
           setOpenCategories(previous=>{
             if(previous.has(section.key)===isOpen)return previous;
             const next=new Set(previous);
             if(isOpen)next.add(section.key);else next.delete(section.key);
             return next;
           });
         }}>
         <summary>
           <span className="history-category-name">{lang==='ro'?section.ro:section.en}</span>
           <span className="history-group-count">{filteredRoots[section.key].length}</span>
         </summary>
         <div className="history-tree-forest" role="tree">
           {filteredRoots[section.key].map(root=>renderNode(root,0))}
         </div>
       </details>)}
   </div>}
   {tree&&<details className="history-catalog-method">
     <summary>{headings.methodological}</summary>
     <p>{headings.methodologicalBody}</p>
     <p>{headings.independent}: {tree.activeLinks.length} ({year}).</p>
   </details>}
 </section>;
}

export function HistoricalGeodataEntityCard({selection,lang,onLocate}:{
 selection:HistoricalGeodataSelection;
 lang:Locale;
 onLocate:()=>void;
}){
 const {entry,parentEvidence,sourceReportedParent}=selection,t=labels[lang];
 return <section className="detail-content history-entity-detail">
   <div className="entity-card" key={entry.id}>
     <header className="entity-title">
       <span className="flag flag--coat" aria-hidden="true">◇</span>
       <div><h3>{entry.displayName[lang]}</h3><small>{dateLabel(entry,lang)}</small></div>
     </header>
     <p className="source-caveat"><strong>{t.warning}</strong></p>
     <div className="entity-actions">
       <button type="button" onClick={onLocate}>{t.recenter}</button>
     </div>
     <EntityCardSection title={t.identity} kind="identity">
       <dl className="metadata">
         <dt>{t.sourceId}</dt><dd>{entry.sourceFamily==='OHM'? 'OHM relation '+entry.sourceRelationId : entry.sourceExternalId??entry.id}</dd>
         <dt>{t.kind}</dt><dd>{entry.sourceType||'—'}</dd>
         <dt>{t.period}</dt><dd>{dateLabel(entry,lang)} ({t.uncertain})</dd>
         <dt>{t.geometry}</dt><dd>{entry.geometryId}</dd>
         {sourceReportedParent&&<>
           <dt>{lang==='ro'?'Părinte declarat de RoHGIS':'RoHGIS-reported parent'}</dt>
           <dd>{sourceReportedParent}<small> ({lang==='ro'?'din atributele sursei, fără certificarea juridică a hotarului':'source attribute only, without legal boundary certification'})</small></dd>
         </>}
         {parentEvidence&&<>
           <dt>{lang==='ro'?'Părinte administrativ':'Administrative parent'}</dt>
           <dd>{parentEvidence.parentSourceGroup}
             <small> ({parentEvidence.start}–{parentEvidence.end}; {lang==='ro'?
               'apartenență documentată, nu hotar certificat':'documented membership, not certified boundary'})</small>
           </dd>
         </>}
       </dl>
     </EntityCardSection>
     <EntityCardSection title={t.source} kind="cartographic">
       <dl className="metadata">
         <dt>{t.sourceName}</dt><dd>{entry.sourceGroup} · {entry.sourceFamily}</dd>
         {entry.sourceFamily==='ROHGIS'&&<>
           <dt>{lang==='ro'?'Autori și drepturi':'Authors and reuse rights'}</dt>
           <dd><a href="https://rohgis.ro/despre/" target="_blank" rel="noopener noreferrer">
             RoHGIS · CC BY 4.0</a>
             <small> · {entry.sourceType==='plasă'?'Cezar Buterez':'Andrei Nacu, Cezar Buterez'}
             {' · '}{lang==='ro'?'vizualizare reproiectată, cu atribuire':'reprojected visualization with attribution'}</small>
           </dd>
         </>}
         <dt>{t.original}</dt>
         <dd>{entry.sourceDriveFileId ?
           <a href={'https://drive.google.com/file/d/'+entry.sourceDriveFileId+'/view'}
             target="_blank" rel="noopener noreferrer">{entry.sourceFilename}</a> :
           <a href={'https://www.openhistoricalmap.org/relation/'+entry.sourceRelationId}
             target="_blank" rel="noopener noreferrer">{entry.sourceFilename}</a>}
             <small> · {entry.sourcePath}</small></dd>
       </dl>
       {entry.sourcePeriod.notes&&<p className="source-caveat">{entry.sourcePeriod.notes}</p>}
       {entry.sourceTagWarnings.length>0&&
         <details><summary>{t.notes}</summary><ul>{entry.sourceTagWarnings.map(x=><li key={x}>{x}</li>)}</ul></details>}
       {parentEvidence&&<details className="history-parentage-sources">
         <summary>{lang==='ro'?'Dovezi pentru apartenența administrativă':'Administrative membership evidence'}</summary>
         <ul>{parentEvidence.evidence.map(item=><li key={item.url}>
           <a href={item.url} target="_blank" rel="noopener noreferrer">{item.type.replaceAll('_',' ')}</a>
           <span> — {item.detail}</span>
         </li>)}</ul>
       </details>}
     </EntityCardSection>
   </div>
 </section>;
}
