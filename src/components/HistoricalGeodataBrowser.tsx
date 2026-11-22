import {useEffect,useMemo,useState} from 'react';
import {EntityCardSection} from './EntityCardSection';
import {projectGeodataHistoricalSourceCatalog} from '../data/historicalGeodataTemporal.mjs';
import {
  geodataSourcesAtYear,loadGeodataSourceFeature,loadGeodataSourceIndex,
  type GeodataSourceEntry,type GeodataSourceFeature,type GeodataSourceIndex
} from '../data/historicalGeodata.mjs';

type Locale='ro'|'en';
export interface HistoricalGeodataSelection {
  entry:GeodataSourceEntry;
  feature:GeodataSourceFeature;
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
const dateLabel=(e:GeodataSourceEntry,lang:Locale)=>
  e.sourcePeriod.kind==='undated'?(lang==='ro'?'Datare neverificată':'Undated / unverified'):
  e.sourcePeriod.kind==='snapshot'?
    (lang==='ro'?'Atestat în ':'Attested in ')+e.sourcePeriod.start?.slice(0,4):
  (e.sourcePeriod.start?.slice(0,4)||'?')+'–'+(e.sourcePeriod.end?.slice(0,4)||'?');

export function HistoricalGeodataBrowser({year,onYear,lang,onSelect,selectedId,onFiltersActiveChange}:{
 year:number;onYear:(year:number)=>void;lang:Locale;
 onSelect:(selection:HistoricalGeodataSelection)=>void;
 selectedId:string|null;
 onFiltersActiveChange:(active:boolean)=>void;
}){
 const [index,setIndex]=useState<GeodataSourceIndex|null>(null);
 const [error,setError]=useState<string|null>(null);
 const [busy,setBusy]=useState<string|null>(null);
 const [query,setQuery]=useState('');
 const [yearOnly,setYearOnly]=useState(false);
 const t=labels[lang];
 const term=query.trim().toLocaleLowerCase();
 const filtering=Boolean(term)||yearOnly;
 const headings=lang==='ro'?{
   title:'Entități istorice',search:'Caută în catalog',searchHint:'Denumire, perioadă sau ID OHM',
   clear:'Șterge căutarea',year:'An',yearFilter:'Filtrează după an',
   groups:'grupuri-sursă',versions:'versiuni',results:'rezultate',
   methodological:'Despre sursă și limite',
   methodologicalBody:'Versiunile provin din OpenHistoricalMap. Grupele și perioadele reprezintă informații ale sursei, nu o ierarhie administrativă sau hotare certificate independent.',
   version:'versiune',versionsPlural:'versiuni',unknown:'Neconfirmat'
 }:{
   title:'Historical entities',search:'Search catalogue',searchHint:'Name, period or OHM ID',
   clear:'Clear search',year:'Year',yearFilter:'Filter by year',
   groups:'source groups',versions:'versions',results:'matches',
   methodological:'About the source and limitations',
   methodologicalBody:'Versions come from OpenHistoricalMap. Grouping and dates are source information, not independently certified administrative hierarchy or legal boundaries.',
   version:'version',versionsPlural:'versions',unknown:'Unverified'
 };
 useEffect(()=>{onFiltersActiveChange(filtering);},
   [filtering,onFiltersActiveChange]);
 useEffect(()=>{
   let active=true;
   loadGeodataSourceIndex(import.meta.env.BASE_URL).then(data=>{if(active)setIndex(data);})
     .catch(err=>{if(active)setError(String(err));});
   return ()=>{active=false;};
 },[]);
 const sourceProjection=useMemo(()=>index?projectGeodataHistoricalSourceCatalog(index):null,[index]);
 const grouped=useMemo(()=>{
   if(!index)return [];
   const dateIds=yearOnly?new Set(geodataSourcesAtYear(index,year).map(e=>e.id)):null;
   const groups=new Map<string,GeodataSourceEntry[]>();
   for(const entry of index.entries){
     if(dateIds&&!dateIds.has(entry.id))continue;
     if(term&&!([entry.displayName.ro,entry.displayName.en,entry.sourceGroup,
       entry.sourcePeriod.start||'',entry.sourcePeriod.end||'',
       String(entry.sourceRelationId??entry.sourceExternalId??entry.id)]
       .some(value=>value.toLocaleLowerCase().includes(term))))continue;
     const list=groups.get(entry.sourceGroup)||[];
     list.push(entry);groups.set(entry.sourceGroup,list);
   }
   return [...groups].sort((a,b)=>a[0].localeCompare(b[0],'ro')).map(([group,entries])=>({
     group,
     entries:entries.sort((a,b)=>(a.sourcePeriod.start||'').localeCompare(b.sourcePeriod.start||'')||a.id.localeCompare(b.id))
   }));
 },[index,year,yearOnly,term]);
 type SourceCategory={id:'regions'|'judete'|'comitate';ro:string;en:string;count:number;
   groups:Array<{group:string;entries:GeodataSourceEntry[]}>};
 const categories=useMemo(()=>{
   const sections:SourceCategory[]=[
     {id:'regions',ro:'State și regiuni',en:'States and regions',count:0,groups:[]},
     {id:'judete',ro:'Județe',en:'Counties',count:0,groups:[]},
     {id:'comitate',ro:'Comitate',en:'Comitates',count:0,groups:[]}
   ];
   for(const item of grouped){
     const target=item.group.startsWith('Județe istorice/')?sections[1]:
       item.group.startsWith('Comitate istorice/')?sections[2]:sections[0];
     target.groups.push(item);
     target.count+=item.entries.length;
   }
   return sections.filter(section=>section.count>0);
 },[grouped]);
 const shownCount=categories.reduce((sum,category)=>sum+category.count,0);
 async function selectEntry(entry:GeodataSourceEntry){
   if(!index||busy)return;
   setBusy(entry.id);setError(null);
   try{
     const feature=await loadGeodataSourceFeature(index,entry,import.meta.env.BASE_URL);
     onSelect({entry,feature});
   }catch(e){setError(String(e));}
   finally{setBusy(null);}
 }
 const versionButton=(entry:GeodataSourceEntry,withName:boolean)=>(
   <button key={entry.id} type="button"
     className={'history-version-button'+(selectedId===entry.id?' is-selected':'')}
     onClick={()=>void selectEntry(entry)} disabled={busy!==null}
     aria-pressed={selectedId===entry.id}
     title={entry.displayName[lang]+' · OHM '+entry.sourceRelationId}>
     {withName&&<span className="history-version-name">{entry.displayName[lang]}</span>}
     <span className="history-version-details">
       <span className="history-version-period">{dateLabel(entry,lang)}</span>
       <span className="history-version-id">OHM {entry.sourceRelationId}</span>
     </span>
   </button>
 );
 return <section className="tree-content history-geodata-pane" aria-label={headings.title}>
   <header className="history-catalog-heading">
     <div className="history-catalog-heading-row">
       <h3>{headings.title}</h3>
       <span className="history-catalog-mark" title="OpenHistoricalMap">OHM</span>
     </div>
     <p className="history-catalog-stat" role="status">
       {index&&sourceProjection?
         <>{sourceProjection.entities.length} {headings.groups}
           <span aria-hidden="true"> · </span>
           {index.entries.length} {headings.versions}</>:
         !error?t.loading:''}
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
               onYear(value);
               setYearOnly(true);
             }
           }}/>
       </label>
       <label className="history-filter-checkbox">
         <input type="checkbox" checked={yearOnly}
           onChange={event=>setYearOnly(event.target.checked)}/>
         <span>{headings.yearFilter}</span>
       </label>
     </div>
     {filtering&&index&&<p className="history-filter-count" role="status">
       {shownCount} {headings.results}
     </p>}
   </div>
   {error&&<p className="history-catalog-error" role="alert">{error}</p>}
   {busy&&<p className="history-catalog-loading" role="status">{t.loadGeom}</p>}
   {index&&shownCount===0&&<p className="history-catalog-empty">{t.empty}</p>}
   <div className="history-geodata-groups" aria-label={headings.title}>
     {categories.map(category=><details key={category.id+(term?':search':':browse')}
       className="history-geodata-category" defaultOpen={Boolean(term)||category.id==='regions'}>
       <summary>
         <span className="history-category-name">{lang==='ro'?category.ro:category.en}</span>
         <span className="history-group-count">{category.count}</span>
       </summary>
       <div className="history-geodata-category-entries">
         {category.groups.map(({group,entries})=>{
           const name=group.split('/').pop()||group;
           return entries.length===1?
             <div className="history-entity-single" key={group}>
               {versionButton(entries[0],true)}
             </div>:
             <details key={group+(term?':search':':browse')}
               className="history-geodata-entity" defaultOpen={Boolean(term)}>
               <summary title={name}>
                 <span className="history-source-entity-name">{name}</span>
                 <span className="history-source-version-count">{entries.length}</span>
               </summary>
               <div className="history-source-versions"
                 aria-label={name+' — '+headings.versionsPlural}>
                 {entries.map(entry=>versionButton(entry,false))}
               </div>
             </details>;
         })}
       </div>
     </details>)}
   </div>
   <details className="history-catalog-method">
     <summary>{headings.methodological}</summary>
     <p>{headings.methodologicalBody}</p>
   </details>
 </section>;
}

export function HistoricalGeodataEntityCard({selection,lang,onLocate}:{
 selection:HistoricalGeodataSelection;
 lang:Locale;
 onLocate:()=>void;
}){
 const {entry}=selection,t=labels[lang];
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
     </EntityCardSection>
   </div>
 </section>;
}
