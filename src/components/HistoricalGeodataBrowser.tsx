import {useEffect,useMemo,useState} from 'react';
import type {Feature} from 'geojson';
import {
 geodataVersionAttestedAtYear,geodataPeriodLabel,loadGeodataSourceCatalog,
 loadGeodataSourceFeature,
 type GeodataSourceVersion,type GeodataSourceCatalog
} from '../data/historicalGeodataSource.mjs';

/** Geodata GIS is a source-library within Historical, not a separate module. */
export function HistoricalGeodataBrowser({
 lang,year,selectedId,onSelect,onClear
}:{
 lang:'ro'|'en';year:number;selectedId:string|null;
 onSelect:(entry:GeodataSourceVersion,feature:Feature)=>void;onClear:()=>void;
}) {
 const [catalog,setCatalog]=useState<GeodataSourceCatalog|null>(null);
 const [error,setError]=useState<string|null>(null);
 const [pending,setPending]=useState<string|null>(null);
 const [filter,setFilter]=useState('');
 const [collection,setCollection]=useState('all');
 const [onlyAtYear,setOnlyAtYear]=useState(true);
 useEffect(()=>{
  let active=true;
  loadGeodataSourceCatalog(import.meta.env.BASE_URL).then(x=>{if(active)setCatalog(x);})
    .catch(e=>{if(active)setError(String(e));});
  return ()=>{active=false;};
 },[]);
 const versions=useMemo(()=>{
  return (catalog?.versions||[]).filter(v=>
    (collection==='all'||v.sourceCollection===collection)&&
    (!onlyAtYear||geodataVersionAttestedAtYear(v,year))&&
    (!filter||[v.name.ro,v.name.en,v.sourceIdentity,v.sourceCollection]
      .join(' ').toLocaleLowerCase().includes(filter.toLocaleLowerCase()))
  ).sort((a,b)=>a.name[lang].localeCompare(b.name[lang],lang==='ro'?'ro':'en'));
 },[catalog,collection,onlyAtYear,year,filter,lang]);
 const collections=Array.from(new Set((catalog?.versions||[]).map(v=>v.sourceCollection))).sort();
 async function choose(entry:GeodataSourceVersion){
  if(!catalog||pending)return;
  setPending(entry.id);setError(null);
  try{
   const feature=await loadGeodataSourceFeature(catalog,entry,import.meta.env.BASE_URL);
   onSelect(entry,feature);
  }catch(e){setError(String(e));}finally{setPending(null);}
 }
 return <section className="tree-content history-pilot-pane" aria-label={lang==='ro'?'Geodata GIS — geometrii existente':'Geodata GIS — existing geometries'}>
  <h3>{lang==='ro'?'Geodata GIS — geometrii existente':'Geodata GIS — existing geometries'}</h3>
  <p className="note">{lang==='ro'?
   'Poligoane preluate ca reprezentări de sursă, fără modificarea conturului. Afișarea nu certifică hotarul sau părintele administrativ.':
   'Source polygons imported without changing their outlines. Display does not certify boundaries or administrative parentage.'}</p>
  {catalog&&<p className="tree-hint">
    {catalog.sourcePolygonOccurrences} {lang==='ro'?'utilizări':'uses'} ·
    {' '}{catalog.uniqueGeometryAssets} {lang==='ro'?'geometrii distincte':'distinct geometries'} ·
    {' '}{catalog.historicalPolygonSourcesCount} {lang==='ro'?'fișiere-sursă':'source files'}
  </p>}
  {!catalog&&!error&&<p role="status">{lang==='ro'?'Se încarcă inventarul…':'Loading inventory…'}</p>}
  {error&&<p role="alert">{error}</p>}
  {catalog&&<>
    <div className="history-pilot-controls">
      <label>{lang==='ro'?'Colecția':'Collection'}
        <select value={collection} onChange={e=>setCollection(e.target.value)}>
          <option value="all">{lang==='ro'?'Toate sursele':'All sources'}</option>
          {collections.map(x=><option key={x} value={x}>{x}</option>)}
        </select>
      </label>
      <label>{lang==='ro'?'Caută entitatea':'Find entity'}
        <input type="search" value={filter} onChange={e=>setFilter(e.target.value)}
          placeholder={lang==='ro'?'Denumire sau identificator':'Name or identifier'}/>
      </label>
      <label className="history-pilot-option">
        <input type="checkbox" checked={onlyAtYear} onChange={e=>setOnlyAtYear(e.target.checked)}/>
        {lang==='ro'?('Filtrează după anul '+year):('Filter for year '+year)}
      </label>
    </div>
    <div className="tree-list" role="list" aria-label={lang==='ro'?'Poligoane existente':'Existing polygons'}>
      {versions.map(v=><div role="listitem" key={v.id} className="territory-branch">
        <div className={'tree-line'+(selectedId===v.id?' is-selected':'')}>
          <button className="tree-label" type="button" aria-current={selectedId===v.id?'true':undefined}
            disabled={pending!==null} onClick={()=>void choose(v)}>
            <span className="node-name">{v.name[lang]}</span>
            <span className="node-level">{geodataPeriodLabel(v,lang)} · {v.sourceCollection} ·
              {' '}{v.sourceTags.originalType||'—'}</span>
          </button>
        </div>
      </div>)}
    </div>
    {versions.length===0&&<p className="tree-empty">{lang==='ro'?'Nu există corespondențe pentru filtrul selectat.':'No matches for the selected filter.'}</p>}
    {selectedId&&<button type="button" onClick={onClear}>{lang==='ro'?'Ascunde poligonul selectat':'Hide selected polygon'}</button>}
    <p className="source-caveat">{lang==='ro'?
      'Date de sursă, nu limite juridice certificate. Cronologia din etichetele sursei nu implică validare independentă; nu se deduc ierarhii din contururi.':
      'Source evidence only, not certified legal boundaries. Source dates are unverified; hierarchy is not inferred from shapes.'}</p>
  </>}
 </section>;
}
