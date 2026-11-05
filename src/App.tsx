import { useEffect, useRef, useState } from 'react';
import maplibregl, { type Map as MapLibreMap, type GeoJSONSource } from 'maplibre-gl';
import { getCountryGeoJSON, type CountryId } from './data/borders';

type Lang = 'en' | 'ro';
type Basemap = 'standard' | 'grayscale' | 'dark' | 'none';
type ModuleId = 'administrative' | 'historical' | 'communities' | 'regions' | 'ethnographic' | 'reform';

const MODULES: { id: ModuleId; symbol: string; en: string; ro: string }[] = [
  { id: 'administrative', symbol: '▤', en: 'Administrative', ro: 'Administrativ' },
  { id: 'historical', symbol: '◷', en: 'Historical', ro: 'Istoric' },
  { id: 'communities', symbol: '♙', en: 'Historical Romanian Communities', ro: 'Comunități istorice românești' },
  { id: 'regions', symbol: '⬡', en: 'Historical Regions', ro: 'Regiuni istorice' },
  { id: 'ethnographic', symbol: '✦', en: 'Ethnographic Areas', ro: 'Zone etnografice' },
  { id: 'reform', symbol: '⇄', en: 'Administrative-Territorial Reform', ro: 'Reformă administrativ-teritorială' }
];

const LANG = {
  en: {
    title: 'Territorial Atlas', tagline: 'Geography · History · Communities', tree: 'Territorial tree',
    find: 'Search the territory tree', visible: 'Show geometry', detail: 'Entity details', select: 'Select a country on the map or in the tree.',
    scope: 'Initial geographic scope', planned: 'Administrative and statistical subdivisions will be integrated in Phase 3.',
    original: 'Detailed preview', simplified: 'Simplified geometries', basemap: 'Basemap', originalNote: 'Display-only outlines from OSMB snapshot 2026-10-05. Full source geometry follows in Phase 3.',
    standard: 'Standard', grayscale: 'Grayscale', dark: 'Dark', none: 'None',
    home: 'Reset map extent', zoomIn: 'Zoom in', zoomOut: 'Zoom out', info: 'Information',
    official: 'Official name', admin: 'OSMB level', country: 'Country', osmId: 'OSM ID', boundary: 'Boundary',
    geometry: 'Geometric data', source: 'Source', date: 'Snapshot', state: 'Administrative unit', role: 'Role',
    boundaryValue: 'Administrative', openTree: 'Open tree', openDetail: 'Open details', close: 'Close',
    comingSoon: 'Module planned for a later development phase.', preview: 'Phase 2 · first functional version',
    dataStatus: 'National outlines are functional. The full hierarchy, SIRUTA/CUATM registers and statistical geometry are not published yet.',
    choose: 'Choose an entity', about: 'About the atlas', screenreader: 'Select module',
    attribution: '© OpenStreetMap contributors · boundary data from OSM-Boundaries'
  },
  ro: {
    title: 'Atlas Teritorial', tagline: 'Geografie · Istorie · Comunități', tree: 'Arbore teritorial',
    find: 'Caută în arborele teritorial', visible: 'Afișează geometria', detail: 'Detaliile entității', select: 'Selectează o țară pe hartă sau în arbore.',
    scope: 'Acoperire geografică inițială', planned: 'Subdiviziunile administrative și statistice vor fi integrate în Etapa 3.',
    original: 'Previzualizare detaliată', simplified: 'Geometrii simplificate', basemap: 'Hartă de fundal', originalNote: 'Contururi reduse din snapshotul OSMB 2026-10-05. Geometriile integrale vor fi introduse în Etapa 3.',
    standard: 'Standard', grayscale: 'Tonuri de gri', dark: 'Întunecată', none: 'Fără fundal',
    home: 'Resetează încadrarea hărții', zoomIn: 'Mărește', zoomOut: 'Micșorează', info: 'Informații',
    official: 'Denumire oficială', admin: 'Nivel OSMB', country: 'Țară', osmId: 'ID OSM', boundary: 'Limită',
    geometry: 'Date geometrice', source: 'Sursă', date: 'Snapshot', state: 'Unitate administrativă', role: 'Rol',
    boundaryValue: 'Administrativă', openTree: 'Deschide arborele', openDetail: 'Deschide detaliile', close: 'Închide',
    comingSoon: 'Modul planificat pentru o etapă ulterioară.', preview: 'Etapa 2 · prima versiune funcțională',
    dataStatus: 'Contururile naționale sunt funcționale. Ierarhia completă, registrele SIRUTA/CUATM și geometriile statistice nu sunt încă publicate.',
    choose: 'Alege o entitate', about: 'Despre atlas', screenreader: 'Selectează modulul',
    attribution: '© contribuabilii OpenStreetMap · limite din OSM-Boundaries'
  }
} as const;
const COUNTRY: Record<CountryId, {short: string; official: Record<Lang,string>; osm: string; flag:string}> = {
  ro: { short: 'România', official: {en:'Romania',ro:'România'}, osm:'90689', flag:'🇷🇴'},
  md: { short: 'Republica Moldova', official: {en:'Republic of Moldova',ro:'Republica Moldova'}, osm:'58974', flag:'🇲🇩'}
};
const BOUNDS: [[number,number],[number,number]] = [[19.8,42.65],[30.8,48.6]];
const style: maplibregl.StyleSpecification = {
  version:8,
  sources: { osm: { type:'raster',tiles:['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],tileSize:256,attribution:'© OpenStreetMap contributors' } },
  layers:[
    {id:'backdrop',type:'background',paint:{'background-color':'#f1f5ef'}},
    {id:'basemap',type:'raster',source:'osm',paint:{'raster-opacity':0.85}}
  ]
};
const INITIAL_VISIBLE: CountryId[] = ['ro','md'];

export default function App() {
  const mapEl=useRef<HTMLDivElement>(null);
  const map=useRef<MapLibreMap|null>(null);
  const [lang,setLang]=useState<Lang>(()=>localStorage.getItem('atlas-lang')==='ro'?'ro':'en');
  const [module,setModule]=useState<ModuleId>('administrative');
  const [selected,setSelected]=useState<CountryId|null>(null);
  const [visible,setVisible]=useState<CountryId[]>(INITIAL_VISIBLE);
  const [simplified,setSimplified]=useState<boolean>(()=>localStorage.getItem('atlas-simple')==='true');
  const [basemap,setBasemap]=useState<Basemap>('standard');
  const [search,setSearch]=useState('');
  const [expanded,setExpanded]=useState<Record<CountryId,boolean>>({ro:false,md:false});
  const [drawer,setDrawer]=useState<'tree'|'detail'|null>(null);
  const [ready,setReady]=useState(false);
  const t=LANG[lang];

  useEffect(()=>{localStorage.setItem('atlas-lang',lang);document.documentElement.lang=lang;document.title=t.title;},[lang,t.title]);
  useEffect(()=>{localStorage.setItem('atlas-simple',String(simplified));},[simplified]);

  useEffect(()=>{
    if(!mapEl.current||map.current)return;
    const instance=new maplibregl.Map({container:mapEl.current,style,center:[25.4,46.05],zoom:5.5,attributionControl:false,dragRotate:false,pitchWithRotate:false});
    map.current=instance;
    instance.addControl(new maplibregl.AttributionControl({compact:true}),'bottom-right');
    instance.on('load',()=>{
      instance.addSource('borders',{type:'geojson',data:getCountryGeoJSON(localStorage.getItem('atlas-simple')==='true'?'simplified':'detailed')});
      instance.addLayer({id:'country-fill',type:'fill',source:'borders',paint:{'fill-color':'#e2ece5','fill-opacity':0.31},filter:['in',['get','id'],['literal',INITIAL_VISIBLE]]});
      instance.addLayer({id:'country-outline',type:'line',source:'borders',paint:{'line-color':'#185440','line-width':2.4,'line-opacity':0.95},filter:['in',['get','id'],['literal',INITIAL_VISIBLE]]});
      instance.addLayer({id:'country-highlight',type:'line',source:'borders',paint:{'line-color':'#dca237','line-width':4},filter:['==',['get','id'],'__none__']});
      instance.on('click','country-fill',(event)=>{
        const id=event.features?.[0]?.properties?.id;
        if(id==='ro'||id==='md'){setSelected(id);setDrawer('detail');}
      });
      instance.on('mouseenter','country-fill',()=>{instance.getCanvas().style.cursor='pointer';});
      instance.on('mouseleave','country-fill',()=>{instance.getCanvas().style.cursor='';});
      instance.fitBounds(BOUNDS,{padding:45,duration:0});
      setReady(true);
    });
    return ()=>{map.current=null;instance.remove();};
  },[]);

  useEffect(()=>{
    if(!ready||!map.current)return;
    const filter: any=['in',['get','id'],['literal',visible]];
    map.current.setFilter('country-fill',filter);
    map.current.setFilter('country-outline',filter);
  },[visible,ready]);

  useEffect(()=>{
    if(!ready||!map.current)return;
    map.current.setFilter('country-highlight',['==',['get','id'],selected??'__none__']);
  },[selected,ready]);

  useEffect(()=>{
    if(!ready||!map.current)return;
    const source=map.current.getSource('borders') as GeoJSONSource;
    source.setData(getCountryGeoJSON(simplified?'simplified':'detailed'));
  },[simplified,ready]);

  useEffect(()=>{
    if(!ready||!map.current)return;
    const m=map.current;
    m.setLayoutProperty('basemap','visibility',basemap==='none'?'none':'visible');
    m.setPaintProperty('basemap','raster-saturation',basemap==='grayscale'?-1:basemap==='dark'?-1:0);
    m.setPaintProperty('basemap','raster-brightness-max',basemap==='dark'?0.40:1);
    m.setPaintProperty('basemap','raster-opacity',basemap==='none'?0:0.85);
    m.setPaintProperty('backdrop','background-color',basemap==='dark'?'#14241e':'#f1f5ef');
  },[basemap,ready]);

  const toggle=(id:CountryId)=>setVisible(old=>old.includes(id)?old.filter(x=>x!==id):[...old,id]);
  const select=(id:CountryId)=>{setSelected(id);setDrawer('detail');};
  const reset=()=>map.current?.fitBounds(BOUNDS,{padding:45,duration:700});
  const tree=<section className="tree-content">
    <div className="panel-heading"><span className="eyebrow">{t.scope}</span><h2>{t.tree}</h2></div>
    <label className="search">
      <span aria-hidden="true">⌕</span>
      <input type="search" placeholder={t.find} aria-label={t.find} value={search} onChange={e=>setSearch(e.target.value)}/>
    </label>
    <div className="tree-list" role="tree" aria-label={t.tree}>
      {(['ro','md'] as CountryId[]).filter(id=>(COUNTRY[id].official[lang]+' '+COUNTRY[id].osm).toLowerCase().includes(search.toLowerCase())||!search.trim()).map(id=><div key={id} className="tree-group">
        <div className={'tree-line'+(selected===id?' is-selected':'')} role="treeitem" aria-selected={selected===id} aria-expanded={expanded[id]}>
          <button className="expand-button" aria-label={(expanded[id]?'Collapse ':'Expand ')+COUNTRY[id].official[lang]} onClick={()=>setExpanded(x=>({...x,[id]:!x[id]}))}>{expanded[id]?'⌄':'›'}</button>
          <input type="checkbox" checked={visible.includes(id)} aria-label={t.visible+': '+COUNTRY[id].official[lang]} onChange={()=>toggle(id)}/>
          <button className="tree-label" onClick={()=>select(id)}>{COUNTRY[id].flag} {COUNTRY[id].official[lang]}</button>
        </div>
        {expanded[id]&&<p className="tree-placeholder">{t.planned}</p>}
      </div>)}
    </div>
    <div className="tree-footnote">{t.dataStatus}</div>
  </section>;

  const details=<section className="detail-content">
    <div className="panel-heading"><span className="eyebrow">{t.info}</span><h2>{t.detail}</h2></div>
    {selected ? <div className="entity-card">
      <div className="entity-title"><span className="flag" aria-hidden="true">{COUNTRY[selected].flag}</span><div><h3>{COUNTRY[selected].official[lang]}</h3><span>{t.state}</span></div></div>
      <div className="detail-section">{t.info}</div>
      <dl className="metadata">
        <dt>{t.official}</dt><dd>{COUNTRY[selected].official[lang]}</dd>
        <dt>{t.admin}</dt><dd>2</dd>
        <dt>{t.osmId}</dt><dd><a href={'https://www.openstreetmap.org/relation/'+COUNTRY[selected].osm} target="_blank" rel="noreferrer">{COUNTRY[selected].osm} ↗</a></dd>
        <dt>{t.boundary}</dt><dd>{t.boundaryValue}</dd>
        <dt>{t.role}</dt><dd>{t.state}</dd>
      </dl>
      <div className="detail-section">{t.geometry}</div>
      <dl className="metadata">
        <dt>{t.source}</dt><dd>OSM-Boundaries</dd>
        <dt>{t.date}</dt><dd>2026-10-05</dd>
      </dl>
      <p className="note">{t.originalNote}</p>
    </div>:<div className="empty-detail"><span>◇</span><h3>{t.choose}</h3><p>{t.select}</p></div>}
  </section>;

  return <div className="app">
    <header className="site-header">
      <div className="brand-symbol" aria-hidden="true">◎</div>
      <div className="brand"><strong>{t.title}</strong><small>{t.tagline}</small></div>
      <span className="version">{t.preview}</span>
      <div className="language" aria-label="Language"><button className={lang==='en'?'active':''} onClick={()=>setLang('en')} aria-pressed={lang==='en'}>EN</button><button className={lang==='ro'?'active':''} onClick={()=>setLang('ro')} aria-pressed={lang==='ro'}>RO</button></div>
    </header>
    <div className="workspace">
      <nav className="module-rail" aria-label={t.screenreader}>
        {MODULES.map(item=><button key={item.id} className={module===item.id?'active':''} onClick={()=>setModule(item.id)} title={item[lang]} aria-label={item[lang]} aria-current={module===item.id?'page':undefined}><span className="module-symbol">{item.symbol}</span><span className="module-short">{item[lang].split(' ')[0].slice(0,8)}</span></button>)}
      </nav>
      <aside className="tree-sidebar">{tree}</aside>
      <main className="map-area">
        <div ref={mapEl} className="map-canvas" aria-label="Territorial map"/>
        <div className="map-controls">
          <label className="basemap-select"><span>▧</span><span className="control-caption">{t.basemap}</span>
            <select value={basemap} onChange={e=>setBasemap(e.target.value as Basemap)} aria-label={t.basemap}>
              {(['standard','grayscale','dark','none'] as Basemap[]).map(key=><option key={key} value={key}>{t[key]}</option>)}
            </select>
          </label>
          <label className="simplify-control"><input type="checkbox" checked={simplified} onChange={e=>setSimplified(e.target.checked)} /><span className="toggle-track"/><span className="control-caption">{t.simplified}</span></label>
        </div>
        <div className="zoom-controls">
          <button aria-label={t.zoomIn} title={t.zoomIn} onClick={()=>map.current?.zoomIn()}>+</button>
          <button aria-label={t.zoomOut} title={t.zoomOut} onClick={()=>map.current?.zoomOut()}>−</button>
          <button aria-label={t.home} title={t.home} onClick={reset}>⌂</button>
        </div>
        {module!=='administrative'&&<div className="module-notice" role="status"><strong>{MODULES.find(item=>item.id===module)?.[lang]}</strong><span>{t.comingSoon}</span></div>}
        <div className="map-note">{t.originalNote}</div>
        <div className="mobile-controls"><button onClick={()=>setDrawer('tree')}>☷ {t.openTree}</button><button onClick={()=>setDrawer('detail')}>▤ {t.openDetail}</button></div>
      </main>
      <aside className="detail-sidebar">{details}</aside>
    </div>
    {drawer&&<div className="drawer-screen" role="presentation" onClick={()=>setDrawer(null)}>
      <div className={'drawer drawer-'+drawer} role="dialog" aria-modal="true" aria-label={drawer==='tree'?t.tree:t.detail} onClick={e=>e.stopPropagation()}>
        <button className="drawer-close" aria-label={t.close} onClick={()=>setDrawer(null)}>×</button>
        {drawer==='tree'?tree:details}
      </div>
    </div>}
  </div>;
}
