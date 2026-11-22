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
    title:'Geodata GIS — geometrii istorice',subtitle:'Poligoane istorice din colecțiile existente, păstrate ca versiuni ale surselor. Afișarea nu certifică juridic hotarele sau ierarhia.',
    search:'Caută entitate sau perioadă',onlyYear:'Numai versiunile cu interval-sursă care intersectează anul selectat',
    loading:'Se încarcă inventarul istoric…',loadGeom:'Se încarcă geometria originală…',
    empty:'Nu există versiuni ale sursei pentru acest filtru.',warning:'Geometrie-sursă necertificată',
    period:'Perioada declarată de sursă',source:'Sursă și proveniență',
    kind:'Tip sursă',geometry:'Geometrie',recenter:'Încadrează pe hartă',
    notes:'Observații ale sursei',sourceName:'Colecție',uncertain:'Interval incert / sursă necalificată',
    identity:'Identitate istorică (sursă)',sourceId:'ID sursă',original:'Fișierul original din Drive',
    noHierarchy:'Apartenența la un grup de colecție nu este o relație părinte–copil certificată.',
    indexed:'versiuni importate'
  },
  en:{
    title:'Geodata GIS — historical source geometries',subtitle:'Existing historical polygons are preserved as source versions. Display does not certify legal boundaries or hierarchy.',
    search:'Find entity or period',onlyYear:'Only source versions whose dates intersect the selected year',
    loading:'Loading historical source inventory…',loadGeom:'Loading original source geometry…',
    empty:'No source version matches this filter.',warning:'Uncertified source geometry',
    period:'Source-reported period',source:'Source and provenance',
    kind:'Source classification',geometry:'Geometry',recenter:'Zoom to boundary',
    notes:'Source observations',sourceName:'Collection',uncertain:'Unverified source interval',
    identity:'Historical identity (source)',sourceId:'Source ID',original:'Original Drive file',
    noHierarchy:'A source collection group is not a certified administrative parent–child relationship.',
    indexed:'imported versions'
  }
};
const dateLabel=(e:GeodataSourceEntry,lang:Locale)=>
  e.sourcePeriod.kind==='undated'?(lang==='ro'?'Datare neverificată':'Undated / unverified'):
  e.sourcePeriod.kind==='snapshot'?
    (lang==='ro'?'Atestat în ':'Attested in ')+e.sourcePeriod.start?.slice(0,4):
  (e.sourcePeriod.start?.slice(0,4)||'?')+'–'+(e.sourcePeriod.end?.slice(0,4)||'?');

export function HistoricalGeodataBrowser({year,lang,onSelect,selectedId}:{
 year:number;lang:Locale;
 onSelect:(selection:HistoricalGeodataSelection)=>void;
 selectedId:string|null;
}){
 const [index,setIndex]=useState<GeodataSourceIndex|null>(null);
 const [error,setError]=useState<string|null>(null);
 const [busy,setBusy]=useState<string|null>(null);
 const [query,setQuery]=useState('');
 const [yearOnly,setYearOnly]=useState(false);
 const t=labels[lang];
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
   const term=query.trim().toLocaleLowerCase();
   const groups=new Map<string,GeodataSourceEntry[]>();
   for(const e of index.entries){
     if(dateIds&&!dateIds.has(e.id))continue;
     if(term&&!([e.displayName.ro,e.displayName.en,e.sourceGroup,
       e.sourcePeriod.start||'',e.sourcePeriod.end||'',String(e.sourceRelationId??e.sourceExternalId??e.id)]
       .some(s=>s.toLocaleLowerCase().includes(term))))continue;
     const list=groups.get(e.sourceGroup)||[];list.push(e);groups.set(e.sourceGroup,list);
   }
   return [...groups].sort((a,b)=>a[0].localeCompare(b[0],'ro')).map(([group,entries])=>
     ({group,entries:entries.sort((a,b)=>((a.sourcePeriod.start||'')< (b.sourcePeriod.start||'')?-1:1))}));
 },[index,year,yearOnly,query]);
 async function selectEntry(entry:GeodataSourceEntry){
   if(!index||busy)return;
   setBusy(entry.id);setError(null);
   try{
     const feature=await loadGeodataSourceFeature(index,entry,import.meta.env.BASE_URL);
     onSelect({entry,feature});
   }catch(e){setError(String(e));}
   finally{setBusy(null);}
 }
 return <section className="tree-content history-geodata-pane" aria-label={t.title}>
   <h3>{t.title}</h3>
   <p className="source-caveat">{t.subtitle}</p>
   <p className="note">{index?.entries.length||0} {t.indexed} · {index?.sourceFamilies?.join(' / ')||'OHM-Boundaries'}
     {sourceProjection&&<> · {sourceProjection.versions.length} {lang==='ro'?'versiuni datate':'dated versions'}
       {' · '}{sourceProjection.undatedGeometryReferences.length} {lang==='ro'?'surse fără dată certă':'undated sources'}</>}</p>
   {!index&&!error&&<p role="status">{t.loading}</p>}
   <label className="history-source-search">{t.search}
     <input type="search" value={query} onChange={e=>setQuery(e.target.value)} />
   </label>
   <label className="history-pilot-option">
     <input type="checkbox" checked={yearOnly} onChange={e=>setYearOnly(e.target.checked)}/>
     {t.onlyYear}: {year}
   </label>
   {error&&<p role="alert">{error}</p>}
   {busy&&<p role="status">{t.loadGeom}</p>}
   {index&&grouped.length===0&&<p>{t.empty}</p>}
   <div className="history-geodata-groups">
     {grouped.map(({group,entries})=><details key={group} open={grouped.length<4}>
       <summary>{group} ({entries.length})</summary>
       <div className="tree-list" role="tree" aria-label={group}>
         {entries.map(e=><div className="tree-line" key={e.id} role="treeitem"
           aria-selected={selectedId===e.id}>
           <button type="button" className="tree-label" onClick={()=>void selectEntry(e)}
             disabled={busy!==null} aria-current={selectedId===e.id?'true':undefined}>
             <span className="tree-label-heading"><span className="node-name">{e.displayName[lang]}</span></span>
             <span className="node-level">{dateLabel(e,lang)} · {e.sourceRelationId??e.sourceExternalId??e.id}</span>
           </button>
         </div>)}
       </div>
     </details>)}
   </div>
   <p className="note">{t.noHierarchy}</p>
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
