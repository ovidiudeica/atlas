import {useEffect,useMemo,useRef,useState} from 'react';
import {EntityCardSection} from './EntityCardSection';
import {
  buildHistoricalOhmTree,validateOhmParentage,uniqueSourceVersionAtYear,
  groupShortName,type OhmParentageLink,type OhmParentageRegister,type OhmTreeNode
} from '../data/historicalOhmTree.mjs';
import {
  loadGeodataSharedAsset,loadGeodataSourceIndex,
  type GeodataSourceEntry,type GeodataSourceFeature,type GeodataSourceIndex
} from '../data/historicalGeodata.mjs';

type Locale='ro'|'en';
export interface HistoricalGeodataSelection {
  entry:GeodataSourceEntry;
  feature:GeodataSourceFeature;
  parentEvidence?:OhmParentageLink|null;
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
   methodological:'Despre ierarhie și limite',
   methodologicalBody:'Arborele folosește doar relații administrative cu documente și perioade definite. Unitățile fără părinte verificat rămân separate. Geometriile și intervalele OHM sunt surse de lucru, nu hotare juridice certificate.',
   independent:'Legături documentate pentru anul ales',
   version:'Versiune OHM',versionsPlural:'Versiuni geometrice',
   notDated:'Nu există o singură versiune temporală confirmată pentru acest an. Alege explicit o versiune din lista de mai jos.',
   show:'Afișează geometria',hide:'Ascunde geometria',
   sourceParent:'Părinte documentat, fără certificarea geometriei',
   pending:'Fără părinte administrativ calificat în anul ales',
   visible:'bife active'
 }:{
   title:'Historical entities',search:'Search tree',searchHint:'Name, period or OHM ID',
   clear:'Clear search',year:'Year',yearFilter:'Filter by year',
   groups:'source groups',versions:'versions',results:'matches',
   methodological:'About hierarchy and limitations',
   methodologicalBody:'The tree uses only documented and time-scoped administrative links. Entities without verified parents remain separate. OHM geometry and dates remain working source data, not certified legal borders.',
   independent:'Documented links for reference year',
   version:'OHM version',versionsPlural:'Geometry versions',
   notDated:'There is no single temporally confirmed version for this year. Select a source version explicitly below.',
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
     })
   ]).then(([sources,register])=>{
     const gate=validateOhmParentage(sources,register);
     if(!gate.ok)throw Error('OHM parentage: '+gate.errors.join('; '));
     if(active){setIndex(sources);setParentage(register);}
   }).catch(err=>{if(active)setError(String(err));});
   return ()=>{active=false;mounted.current=false;};
 },[]);
 const tree=useMemo(()=>index&&parentage?
   buildHistoricalOhmTree(index,parentage,year):null,[index,parentage,year]);
 const filteredRoots=useMemo(()=>{
   if(!tree)return {regions:[],counties:[],comitates:[]} as {
     regions:FilteredOhmNode[];counties:FilteredOhmNode[];comitates:FilteredOhmNode[];
   };
   function filterNode(node:OhmTreeNode):FilteredOhmNode|null{
     // Documentary membership and OHM polygon time-validity are separate:
     // preserve a qualified child in the time-filtered tree even when its
     // OHM geometry has no end_date. Its entity checkbox stays disabled.
     const available=yearOnly?
       (node.activeEntries.length?node.activeEntries:
         node.parentEvidence?node.versions:[]):node.versions;
     const groupMatch=Boolean(term)&&foldedSearch(node.group+' '+node.name.ro+' '+node.name.en).includes(term);
     const shownVersions=!term||groupMatch?available:
       available.filter(entry=>searchWords(entry).some(word=>foldedSearch(word).includes(term)));
     const shownChildren=node.children.map(child=>filterNode(child))
       .filter((child):child is FilteredOhmNode=>child!==null);
     if(!shownVersions.length&&!shownChildren.length)return null;
     return {...node,shownVersions,shownChildren};
   }
   return {
     regions:tree.roots.regions.map(filterNode).filter((n):n is FilteredOhmNode=>n!==null),
     counties:tree.roots.counties.map(filterNode).filter((n):n is FilteredOhmNode=>n!==null),
     comitates:tree.roots.comitates.map(filterNode).filter((n):n is FilteredOhmNode=>n!==null)
   };
 },[tree,term,yearOnly]);
 const matchedCount=useMemo(()=>{
   const ids=new Set<string>();
   const visit=(node:FilteredOhmNode)=>{
     for(const entry of node.shownVersions)ids.add(entry.id);
     for(const child of node.shownChildren)visit(child);
   };
   for(const section of Object.values(filteredRoots))for(const root of section)visit(root);
   return ids.size;
 },[filteredRoots]);
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
   return <div key={entry.id} className="history-tree-version-row" role="treeitem"
     aria-selected={selectedId===entry.id}>
     <input type="checkbox" checked={checked} disabled={busy!==null}
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
   const hasDetails=node.shownVersions.length>1||node.shownChildren.length>0||
     temporallyUnqualified;
   const isExpanded=expanded.has(key)||Boolean(term);
   const quickEntry=(active&&node.shownVersions.some(e=>e.id===active.id)?active:null)||
     (!yearOnly&&node.shownVersions.length===1?node.shownVersions[0]:null);
   const activeChecked=Boolean(quickEntry&&visibleSet.has(quickEntry.id));
   const title=groupShortName(node.group);
   return <div key={key} className="history-tree-node" role="treeitem"
     aria-level={depth+1} aria-expanded={hasDetails?isExpanded:undefined}>
     <div className={'history-tree-row'+(node.parentEvidence?' has-qualified-parent':'')}
       style={{paddingLeft:Math.min(depth,10)*10}}>
       {hasDetails?<button type="button" className="history-tree-expand"
         aria-label={(isExpanded?(lang==='ro'?'Restrânge ':'Collapse '):(lang==='ro'?'Extinde ':'Expand '))+title}
         aria-expanded={isExpanded} onClick={()=>toggleExpansion(key)}>
         <span aria-hidden="true">{isExpanded?'▾':'▸'}</span>
       </button>:<span className="history-tree-leaf" aria-hidden="true"/>}
       <input type="checkbox" disabled={!quickEntry||busy!==null}
         checked={activeChecked}
         aria-label={(activeChecked?headings.hide:headings.show)+' · '+title}
         title={quickEntry?dateLabel(quickEntry,lang):headings.notDated}
         onChange={event=>{if(quickEntry)void changeVisibility([quickEntry],event.target.checked);}}/>
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
       <span className="history-source-version-count" title={headings.versionsPlural}>
         {node.shownVersions.length}
       </span>
     </div>
     {hasDetails&&isExpanded&&<div className="history-tree-children" role="group">
       {(node.shownVersions.length>1||temporallyUnqualified)&&
         <div className="history-source-versions" role="group" aria-label={title+' — '+headings.versionsPlural}>
           {node.shownVersions.map(renderVersion)}
         </div>}
       {node.shownChildren.map(child=>renderNode(child,depth+1))}
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
         {' · '}{visibleIds.length} {headings.visible}</>:t.loading}
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
 const {entry,parentEvidence}=selection,t=labels[lang];
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
