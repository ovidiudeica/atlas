import { useCallback, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import MapCanvas, {type BasemapMode,type MapController} from './MapCanvas';
import {entities,roots,initialVisible,previewGeometryIds,type Entity,type Locale} from './catalog';
import {t} from './i18n';

const modules=[
  {id:'administrative',icon:'▤'},
  {id:'historical',icon:'◷'},
  {id:'communities',icon:'♧'},
  {id:'regions',icon:'◇'},
  {id:'ethnographic',icon:'✺'},
  {id:'reform',icon:'⇄'},
] as const;
type ModuleId=typeof modules[number]['id'];

function asSavedLocale():Locale {
  try{return localStorage.getItem('atlas-locale')==='ro'?'ro':'en';}catch{return 'en';}
}
function asSavedSimplified():boolean{
  try{return localStorage.getItem('atlas-simplified')==='true';}catch{return false;}
}

export default function App(){
  const [locale,setLocale]=useState<Locale>(asSavedLocale);
  const [moduleId,setModuleId]=useState<ModuleId>('administrative');
  const [selected,setSelected]=useState<string|null>(null);
  const [expanded,setExpanded]=useState<string[]>([]);
  const [visible,setVisible]=useState<string[]>(initialVisible);
  const [simplified,setSimplified]=useState(asSavedSimplified);
  const [basemap,setBasemap]=useState<BasemapMode>('standard');
  const [search,setSearch]=useState('');
  const [panel,setPanel]=useState<'tree'|'details'|null>(null);
  const [detailsOnDesktop,setDetailsOnDesktop]=useState(true);
  const controller=useRef<MapController|null>(null);
  const tr=t(locale);

  useEffect(()=>{document.documentElement.lang=locale;document.title=`${tr.product} · ${tr.tagline}`;
    try{localStorage.setItem('atlas-locale',locale);}catch{/* storage disabled */}
  },[locale,tr.product,tr.tagline]);
  useEffect(()=>{try{localStorage.setItem('atlas-simplified',String(simplified));}catch{/* storage disabled */}},[simplified]);
  useEffect(()=>{const dismiss=(e:KeyboardEvent)=>{if(e.key==='Escape'){setPanel(null);}};
    window.addEventListener('keydown',dismiss);return ()=>window.removeEventListener('keydown',dismiss);
  },[]);

  const expand=(id:string)=>setExpanded(prev=>prev.includes(id)?prev.filter(x=>x!==id):[...prev,id]);
  const toggleVisibility=(id:string)=>setVisible(prev=>prev.includes(id)?prev.filter(x=>x!==id):[...prev,id]);
  const select=(id:string)=>{setSelected(id);setPanel('details');setDetailsOnDesktop(true);};
  const registerController=useCallback((api:MapController|null)=>{controller.current=api;},[]);

  function node(id:string,depth:number=0):ReactNode{
    const e=entities[id];
    const isExpanded=expanded.includes(id);
    const query=search.toLocaleLowerCase();
    const matches=!query||[e.label.en,e.label.ro,e.official.en,e.official.ro,e.statisticalCode??'',String(e.osmRelationId??'')].some(x=>x.toLocaleLowerCase().includes(query));
    const childList=e.children.filter(child=>hasMatchingDescendant(child,query));
    if(query&&!matches&&childList.length===0)return null;
    const open=query?true:isExpanded;
    const available=previewGeometryIds.has(e.id);
    return <div key={id} className="node-group">
      <div className={`tree-row ${selected===id?'selected':''}`} style={{paddingLeft:`${8+depth*17}px`}}>
        <button type="button" className={`branch-toggle ${e.children.length===0?'empty':''}`} disabled={!e.children.length}
          aria-label={`${open?tr.collapse:tr.expand} ${e.label[locale]}`} aria-expanded={e.children.length?open:undefined}
          onClick={()=>expand(id)}>{e.children.length?(open?'⌄':'›'):'·'}</button>
        <input type="checkbox" aria-label={`${tr.show}: ${e.label[locale]}`} checked={visible.includes(id)}
          disabled={!available} onChange={()=>toggleVisibility(id)}/>
        <button type="button" className="tree-name" aria-current={selected===id?'true':undefined}
          onClick={()=>select(id)}>{depth===0?<span className="flag" aria-hidden="true">{id==='ro'?'🇷🇴':'🇲🇩'}</span>:null}
          <span>{e.label[locale]}</span>
          {e.statisticalCode&&<small className="tree-code">{e.statisticalCode}</small>}
        </button>
      </div>
      {open&&childList.map(child=>node(child,depth+1))}
    </div>;
  }

  const current=selected?entities[selected]:null;
  const selectedModule=modules.find(m=>m.id===moduleId)!;
  const activeModuleName=tr[selectedModule.id];
  return <div className="app">
    <header className="app-header">
      <div className="brand-mark" aria-hidden="true">◈</div>
      <div className="brand-copy"><strong>{tr.product}</strong><span>{tr.tagline}</span></div>
      <span className="beta-mark">BETA</span>
      <div className="header-spacer"/>
      <div className="language" role="group" aria-label={tr.lang}>
        <button type="button" className={locale==='en'?'active':''} onClick={()=>setLocale('en')} aria-pressed={locale==='en'}>EN</button>
        <button type="button" className={locale==='ro'?'active':''} onClick={()=>setLocale('ro')} aria-pressed={locale==='ro'}>RO</button>
      </div>
    </header>

    <div className="body-layout">
      <nav className="module-rail" aria-label={tr.modules}>
        {modules.map(m=><button type="button" key={m.id} className={`module-button ${moduleId===m.id?'active':''}`}
          title={tr[m.id]} aria-label={tr[m.id]} aria-current={moduleId===m.id?'page':undefined}
          onClick={()=>{setModuleId(m.id);setPanel(null);}}><span className="module-icon" aria-hidden="true">{m.icon}</span><small>{tr[m.id]}</small></button>)}
      </nav>

      <aside className={`tree-panel ${panel==='tree'?'drawer-open':''}`} aria-label={tr.tree}>
        <div className="panel-header"><h2>{tr.tree}</h2><button type="button" className="mobile-close" aria-label={tr.close} onClick={()=>setPanel(null)}>×</button></div>
        <div className="search"><span aria-hidden="true">⌕</span><input value={search} onChange={e=>setSearch(e.target.value)} aria-label={tr.search} placeholder={tr.search}/></div>
        <div className="tree-content" role="tree" aria-label={tr.tree}>
          {roots.map(id=>node(id))}
        </div>
        <div className="tree-note">{tr.preview}</div>
      </aside>

      <main className="map-area">
        <MapCanvas locale={locale} basemap={basemap} simplified={simplified} visible={visible} selected={selected} onSelect={select} onController={registerController}/>
        <div className="map-top">
          <div className="map-option-bar">
            <label className="map-control-label"><span className="label-icon">▧</span><span>{tr.basemap}</span>
              <select value={basemap} onChange={e=>setBasemap(e.target.value as BasemapMode)} aria-label={tr.basemap}>
                {(['standard','grayscale','dark','none'] as const).map(x=><option key={x} value={x}>{tr[x]}</option>)}
              </select></label>
            <label className="toggle-label"><input type="checkbox" role="switch" checked={simplified} onChange={e=>setSimplified(e.target.checked)}/><span>{tr.geometry}</span><i aria-hidden="true" className="switch-track"/></label>
          </div>
          <div className="map-zoom">
            <button type="button" aria-label={tr.zoomIn} title={tr.zoomIn} onClick={()=>controller.current?.zoomIn()}>+</button>
            <button type="button" aria-label={tr.zoomOut} title={tr.zoomOut} onClick={()=>controller.current?.zoomOut()}>−</button>
            <button type="button" aria-label={tr.home} title={tr.home} onClick={()=>controller.current?.home()}>⌂</button>
          </div>
        </div>
        <div className="map-floating mobile-only"><button type="button" onClick={()=>setPanel(p=>p==='tree'?null:'tree')}>☷ {tr.treeToggle}</button><button type="button" onClick={()=>{setDetailsOnDesktop(true);setPanel(p=>p==='details'?null:'details');}}>ⓘ {tr.details}</button></div>
        <div className="map-bottom-left"><span className="outline-dot"/>{tr.outline}</div>
        {moduleId!=='administrative'&&<div className="future-module" role="status"><span>{activeModuleName}</span><p>{tr.future}</p></div>}
      </main>

      {detailsOnDesktop&&<aside className={`details-panel ${panel==='details'?'drawer-open':''}`} aria-label={tr.details}>
        <div className="panel-header"><h2>{tr.selected}</h2><button type="button" aria-label={tr.close} className="close-detail" onClick={()=>{setDetailsOnDesktop(false);setPanel(null);}}>×</button></div>
        {current?<div className="detail-content">
          <div className="detail-identity"><span className="detail-emblem">{current.id==='ro'?'🇷🇴':current.id==='md'?'🇲🇩':'◇'}</span>
            <div><h3>{current.official[locale]}</h3><p>{current.kind==='statistical'?tr.preview:tr.countries}</p></div></div>
          <dl>
            <dt>{tr.official}</dt><dd>{current.official[locale]}</dd>
            <dt>{tr.osmId}</dt><dd className="osmid" data-testid="osm-id">{current.osmRelationId??''}</dd>
            {current.adminLevel&&<><dt>{tr.adminLevel}</dt><dd>{current.adminLevel}</dd></>}
            {current.statisticalCode&&<><dt>{tr.statCode}</dt><dd>{current.statisticalCode}</dd><dt>{tr.statLevel}</dt><dd>{current.statisticalLevel}</dd></>}
            {current.treeParentId&&<><dt>{tr.treeParent}</dt><dd>{entities[current.treeParentId]?.label[locale]}</dd></>}
            {current.administrativeParentId&&<><dt>{tr.adminParent}</dt><dd>{entities[current.administrativeParentId]?.label[locale]}</dd></>}
            <dt>{tr.geometryAvailable}</dt><dd>{current.geometryId?tr.available:tr.planned}</dd>
            {current.geometryId&&<><dt>{tr.source}</dt><dd>OSM-Boundaries · 2026-10-05</dd></>}
          </dl>
        </div>:<div className="detail-empty"><span>◇</span><p>{tr.noSelection}</p></div>}
      </aside>}
    </div>
    <div className="screen-overlay" hidden={!panel} onClick={()=>setPanel(null)} aria-hidden="true"/>
    <footer className="mobile-module-bar" aria-label={tr.modules}>
      {modules.map(m=><button key={m.id} type="button" aria-label={tr[m.id]} className={moduleId===m.id?'active':''} onClick={()=>{setModuleId(m.id);setPanel(null);}}><span aria-hidden="true">{m.icon}</span><small>{tr[m.id]}</small></button>)}
    </footer>
  </div>;
}

function hasMatchingDescendant(id:string,query:string):boolean{
  if(!query)return true;
  const e:Entity=entities[id];
  return [e.label.en,e.label.ro,e.official.en,e.official.ro,e.statisticalCode??'',String(e.osmRelationId??'')].some(x=>x.toLocaleLowerCase().includes(query))
    ||e.children.some(x=>hasMatchingDescendant(x,query));
}