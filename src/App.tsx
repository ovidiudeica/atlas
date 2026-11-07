import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import maplibregl, { type GeoJSONSource, type Map as MapLibreMap } from 'maplibre-gl';
import type { FeatureCollection } from 'geojson';
import { getCountryGeoJSON } from './data/borders';
import { availableOsmLevels, availableStatisticalLevels, buildOsmLevelIndex,
  matchingOsmLevelIds, matchingStatisticalLevelIds, levelVisibilityState,
  updateOsmLevelVisibility } from './data/osmLevelFilter.mjs';
import { buildPermalink, clearGeometryPermalink, idsForScope, makeDetailedCollection, metadataCsv, readPermalink,
  type ExportScope } from './data/phase5.mjs';
import {
  asDisplayFeatures, bboxOfGeometry, codeOf, EMPTY_FEATURES, labelOf, loadCatalog,
  loadGeometryShard, lookupKeys, normalize, ROOT_IDS,
  type GeometryMode, type Locale, type Territory, type TerritoryFeature
} from './data/territories';

type Basemap = 'standard' | 'grayscale' | 'dark' | 'none';
type ModuleId = 'administrative' | 'historical' | 'communities' | 'regions' | 'ethnographic' | 'reform';
type TreeView = 'all' | 'administrative' | 'statistical';
type Drawer = 'tree' | 'detail' | null;

const MODULES: { id: ModuleId; symbol: string; en: string; ro: string }[] = [
  { id: 'administrative', symbol: '▤', en: 'Administrative', ro: 'Administrativ' },
  { id: 'historical', symbol: '◷', en: 'Historical', ro: 'Istoric' },
  { id: 'communities', symbol: '♙', en: 'Historical Romanian Communities', ro: 'Comunități istorice românești' },
  { id: 'regions', symbol: '⬡', en: 'Historical Regions', ro: 'Regiuni istorice' },
  { id: 'ethnographic', symbol: '✦', en: 'Ethnographic Areas', ro: 'Zone etnografice' },
  { id: 'reform', symbol: '⇄', en: 'Administrative-Territorial Reform', ro: 'Reformă administrativ-teritorială' }
];
const WORDS = {
  en: {
    title: 'Territorial Atlas', tagline: 'Geography · History · Communities',
    version: 'Administrative & statistical atlas · Phase 5', tree: 'Territorial tree',
    search: 'Search names, OSM IDs, SIRUTA, CUATM or NUTS codes',
    all: 'All', adminView: 'Administrative', statView: 'Statistical',
    visible: 'Display geometry', details: 'Entity details', select: 'Select a territory on the map or in the tree.',
    searchResults: 'Search results', searchLimit: 'Showing the first 80 matches. Refine the search for more.',
    sourceSnapshot: 'OSM-Boundaries · 5 October 2026', sourceNote: 'Original-source geometry; documented OSMB exceptions are retained.',
    basemap: 'Basemap', standard: 'Standard', grayscale: 'Grayscale', dark: 'Dark', none: 'None',
    simplified: 'Simplified geometries', home: 'Reset map extent', resetGeometries: 'Reset geometries', zoomIn: 'Zoom in', zoomOut: 'Zoom out',
    official: 'Official name', osmId: 'OSM ID', adminLevel: 'OSM administrative level',
    statisticalRole: 'Statistical codes', parentAdmin: 'Administrative parent', parentTree: 'Tree parent',
    source: 'Source', registry: 'Official registry', origin: 'Country',
    raw: 'Original OSM tags', officialRecord: 'Full official registry record',
    view: 'Show on map', hide: 'Hide on map', locate: 'Zoom to territory',
    childrenShow: 'Show children', childrenHide: 'Hide children',
    levelFilter: 'Filters', levelScope: 'Territorial sets',
    levelChoose: 'Administrative and statistical levels', statChoose: 'Statistical regions (NUTS / NTS)',
    statRoleNote: 'A shared administrative/statistical boundary is one geometry.',
    levelShow: 'Show', levelHide: 'Hide',
    levelMatch: 'matching geometries', levelShownOne: 'geometry shown', levelShownMany: 'geometries shown',
    levelHiddenOne: 'geometry hidden', levelHiddenMany: 'geometries hidden',
    about: 'About', description: 'The atlas uses official reference codes and OSM-Boundaries contours. Source discrepancies are documented, not presented as legally certified borders.',
    planned: 'This module is planned for a later phase.', noResults: 'No matching entities.',
    loading: 'Loading the certified catalogue…', loadingGeom: 'Loading selected geometries…',
    loadFailed: 'Unable to load the territorial data. Check your connection and reload the page.',
    retry: 'Reload', selectEntity: 'Choose an entity', close: 'Close',
    openTree: 'Territories', openDetail: 'Details', country: 'Country',
    original: 'Original', selectedCount: 'visible outlines', entityCount: 'entities',
    dataRole: 'Administrative and statistical roles', noCode: 'Not available in the verified source',
    sourceBoundary: 'OSM-Boundaries', detailNote: 'Source records are preserved unchanged. Spatial correspondence with OpenStreetMap does not establish legal boundary status.',
    relationshipNote: 'This OSM geometry shares a CUATM reference with another source representation; it does not imply a second independent legal unit.',
    dataError: 'Geometry loading failed. Retry by toggling the entity.',
    expand: 'Expand', collapse: 'Collapse',
    path: 'Territorial path', previous: 'Previous sibling', next: 'Next sibling',
    fitVisible: 'Fit visible territories', fitSelected: 'Fit selected territory', navigationLoading: 'Fitting…',
    exportAction: 'Export & share', exportTitle: 'Export territory data', exportScope: 'Export scope',
    exportSelected: 'Selected entity', exportVisible: 'Visible entities', exportGeoJSON: 'GeoJSON · full geometry',
    exportCSV: 'CSV · metadata', exportHelp: 'GeoJSON always contains original detailed source geometry even when the map is simplified. CSV contains metadata only. Source limitations and licensing apply.',
    exportEmpty: 'Select or display an entity to export.', exportBusy: 'Preparing export…',
    exportDone: 'Download prepared.', exportFailed: 'Unable to prepare export. Check your connection and retry.',
    copyLink: 'Copy map link', linkCopied: 'Link copied.', linkManual: 'Copy this link manually:',
    searchShortcut: 'Press / to search. Enter selects the first match.',
    mapTools: 'Map tools', mapSettings: 'Map display settings',
    geometryActions: 'Geometry actions', mapInformation: 'Information & legend',
    entityExport: 'Export this entity', displaySource: 'Source and legal status',
    mapLoading: 'Loading map geometry…'
  },
  ro: {
    title: 'Atlas Teritorial', tagline: 'Geografie · Istorie · Comunități',
    version: 'Atlas administrativ și statistic · Etapa 5', tree: 'Arbore teritorial',
    search: 'Caută nume, ID OSM, coduri SIRUTA, CUATM sau NUTS',
    all: 'Toate', adminView: 'Administrativ', statView: 'Statistic',
    visible: 'Afișează geometria', details: 'Detaliile entității', select: 'Selectează un teritoriu pe hartă sau în arbore.',
    searchResults: 'Rezultatele căutării', searchLimit: 'Sunt afișate primele 80 de rezultate. Rafinează căutarea pentru restul.',
    sourceSnapshot: 'OSM-Boundaries · 5 octombrie 2026', sourceNote: 'Geometrii din sursa originală; excepțiile OSMB documentate sunt păstrate.',
    basemap: 'Hartă de fundal', standard: 'Standard', grayscale: 'Tonuri de gri', dark: 'Întunecată', none: 'Fără fundal',
    simplified: 'Geometrii simplificate', home: 'Resetează încadrarea hărții', resetGeometries: 'Resetează geometriile', zoomIn: 'Mărește', zoomOut: 'Micșorează',
    official: 'Denumire oficială', osmId: 'ID OSM', adminLevel: 'Nivel administrativ OSM',
    statisticalRole: 'Coduri statistice', parentAdmin: 'Părinte administrativ', parentTree: 'Părinte în arbore',
    source: 'Sursă', registry: 'Registru oficial', origin: 'Țară',
    raw: 'Tag-uri OSM originale', officialRecord: 'Fișa integrală din registrul oficial',
    view: 'Afișează pe hartă', hide: 'Ascunde de pe hartă', locate: 'Încadrează teritoriul',
    childrenShow: 'Afișează copiii', childrenHide: 'Ascunde copiii',
    levelFilter: 'Filtre', levelScope: 'Seturi teritoriale',
    levelChoose: 'Niveluri administrative și statistice', statChoose: 'Regiuni statistice (NUTS / NTS)',
    statRoleNote: 'Un contur administrativ și statistic comun reprezintă o singură geometrie.',
    levelShow: 'Afișează', levelHide: 'Ascunde',
    levelMatch: 'geometrii corespunzătoare', levelShownOne: 'geometrie afișată', levelShownMany: 'geometrii afișate',
    levelHiddenOne: 'geometrie ascunsă', levelHiddenMany: 'geometrii ascunse',
    about: 'Despre Atlas', description: 'Atlasul folosește coduri oficiale și contururi OSM-Boundaries. Neconcordanțele sursei sunt documentate, fără a prezenta limitele ca fiind certificate juridic.',
    planned: 'Acest modul va fi dezvoltat într-o etapă ulterioară.', noResults: 'Nicio entitate găsită.',
    loading: 'Se încarcă catalogul certificat…', loadingGeom: 'Se încarcă geometriile selectate…',
    loadFailed: 'Nu s-au putut încărca datele teritoriale. Verifică conexiunea și reîncarcă pagina.',
    retry: 'Reîncarcă', selectEntity: 'Alege o entitate', close: 'Închide',
    openTree: 'Teritorii', openDetail: 'Detalii', country: 'Țară',
    original: 'Original', selectedCount: 'contururi vizibile', entityCount: 'entități',
    dataRole: 'Roluri administrative și statistice', noCode: 'Nedisponibil în sursa verificată',
    sourceBoundary: 'OSM-Boundaries', detailNote: 'Înregistrările-sursă sunt păstrate nemodificate. Concordanța cu OpenStreetMap nu dovedește statutul juridic al limitelor.',
    relationshipNote: 'Această geometrie OSM reutilizează un cod CUATM asociat altei reprezentări. Nu rezultă că există două unități juridice independente.',
    dataError: 'Încărcarea geometriei a eșuat. Reîncearcă schimbând vizibilitatea entității.',
    expand: 'Extinde', collapse: 'Restrânge',
    path: 'Traseu teritorial', previous: 'Entitatea precedentă', next: 'Entitatea următoare',
    fitVisible: 'Încadrează teritoriile vizibile', fitSelected: 'Încadrează entitatea selectată', navigationLoading: 'Se încadrează…',
    exportAction: 'Export și partajare', exportTitle: 'Export de date teritoriale', exportScope: 'Ce exportăm',
    exportSelected: 'Entitatea selectată', exportVisible: 'Entitățile vizibile', exportGeoJSON: 'GeoJSON · geometrie completă',
    exportCSV: 'CSV · metadate', exportHelp: 'GeoJSON conține întotdeauna geometria detaliată a sursei, chiar dacă harta este simplificată. CSV conține doar metadate. Se aplică limitările sursei și condițiile de licențiere.',
    exportEmpty: 'Selectează sau afișează o entitate pentru export.', exportBusy: 'Se pregătește exportul…',
    exportDone: 'Fișier pregătit pentru descărcare.', exportFailed: 'Exportul nu a reușit. Verifică conexiunea și reîncearcă.',
    copyLink: 'Copiază linkul hărții', linkCopied: 'Link copiat.', linkManual: 'Copiază manual acest link:',
    searchShortcut: 'Apasă / pentru căutare. Enter selectează primul rezultat.',
    mapTools: 'Instrumente hartă', mapSettings: 'Setări hartă',
    geometryActions: 'Acțiuni geometrii', mapInformation: 'Informații și legendă',
    entityExport: 'Exportă entitatea', displaySource: 'Sursa și statutul juridic',
    mapLoading: 'Se încarcă geometriile hărții…'
  }
} as const;
const BOUNDS: [[number,number],[number,number]] = [[19.8,42.65],[30.8,48.6]];
const DEFAULT_VISIBLE = [...ROOT_IDS];
const SHARED_STATE = readPermalink(window.location.search);
const style: maplibregl.StyleSpecification = {
  version:8,
  sources:{osm:{type:'raster',tiles:['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],tileSize:256,attribution:'© OpenStreetMap contributors'}},
  layers:[
    {id:'backdrop',type:'background',paint:{'background-color':'#f1f5ef'}},
    {id:'basemap',type:'raster',source:'osm',paint:{'raster-opacity':0.85}}
  ]
};

function restoreVisible(): string[] {
  try {
    const saved = JSON.parse(localStorage.getItem('atlas-visible-phase4') || 'null');
    if(Array.isArray(saved) && saved.every(s => typeof s === 'string')) return [...new Set(saved)];
  } catch { /* Use safe defaults if an older preference cannot be read. */ }
  return DEFAULT_VISIBLE;
}
function createHierarchy(nodes: Territory[], view: TreeView): Map<string, Territory[]> {
  const map = new Map<string, Territory[]>();
  for (const node of nodes) {
    if(view === 'administrative' && !node.roles.includes('administrative')) continue;
    if(view === 'statistical' && !node.statisticalRoles.length && !ROOT_IDS.includes(node.id as typeof ROOT_IDS[number])) continue;
    const parent = view === 'administrative' ? node.administrativeParentId : node.treeParentId;
    if(!parent) continue;
    const arr=map.get(parent) || [];
    arr.push(node); map.set(parent, arr);
  }
  for(const arr of map.values())arr.sort((a,b) => {
    const aStat=a.roles.includes('statistical')&&!a.roles.includes('administrative')?0:1;
    const bStat=b.roles.includes('statistical')&&!b.roles.includes('administrative')?0:1;
    if(aStat!==bStat)return aStat-bStat;
    const aCode=a.statisticalRoles[0]?.code,bCode=b.statisticalRoles[0]?.code;
    if(view!=='administrative' && aCode && bCode)return aCode.localeCompare(bCode,'en',{numeric:true});
    if((a.adminLevel??0)!==(b.adminLevel??0) && view==='administrative')return (a.adminLevel??0)-(b.adminLevel??0);
    return a.name.localeCompare(b.name,'ro');
  });
  return map;
}
function featureCountryCode(id: string): string {
  return id === 'osm-r90689' ? 'ro' : id === 'osm-r58974' ? 'md' : '';
}
function mapCountryFeatures(features: Map<string, TerritoryFeature>): FeatureCollection {
  return {
    type:'FeatureCollection',
    features:ROOT_IDS.map(id => features.get(id)).filter((x): x is TerritoryFeature => Boolean(x))
      .map(feature => ({
        type:'Feature', id:featureCountryCode(feature.properties.atlasId),
        properties:{...feature.properties,id:featureCountryCode(feature.properties.atlasId)},
        geometry:feature.geometry
      }))
  };
}
function roleLabel(node: Territory): string {
  const admin=node.adminLevel===null?'':('ADM ' + node.adminLevel);
  const stat=node.statisticalRoles.map(r=> (r.classification==='NUTS'?'NUTS ': 'NTS ') + r.level).join(' · ');
  return [admin,stat].filter(Boolean).join(' · ');
}

export default function App() {
  const mapEl = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const loadedRef = useRef<Map<string,TerritoryFeature>>(new Map());
  const [lang,setLang] = useState<Locale>(() => SHARED_STATE.lang || (localStorage.getItem('atlas-lang') === 'ro'?'ro':'en'));
  const [module,setModule] = useState<ModuleId>('administrative');
  const [modulePanelOpen,setModulePanelOpen] = useState(false);
  const [detailPanelOpen,setDetailPanelOpen] = useState(Boolean(SHARED_STATE.entity));
  const [catalog,setCatalog] = useState<Territory[]>([]);
  const [catalogError,setCatalogError] = useState<string | null>(null);
  const [selected,setSelected] = useState<string | null>(SHARED_STATE.entity);
  const [visible,setVisible] = useState<string[]>(restoreVisible);
  const [expanded,setExpanded] = useState<string[]>([]);
  const [search,setSearch] = useState('');
  const [treeView,setTreeView] = useState<TreeView>(SHARED_STATE.view || 'all');
  const [simplified,setSimplified] = useState<boolean>(()=>SHARED_STATE.simple ?? (localStorage.getItem('atlas-simple')==='true'));
  const [basemap,setBasemap] = useState<Basemap>(SHARED_STATE.basemap || 'standard');
  const [ready,setReady] = useState(false);
  const [rootsLoaded,setRootsLoaded] = useState(false);
  const [geomLoading,setGeomLoading] = useState(false);
  const [geomError,setGeomError] = useState(false);
  const [drawer,setDrawer] = useState<Drawer>(null);
  const [exportOpen,setExportOpen] = useState(false);
  const [exportScope,setExportScope] = useState<ExportScope>('visible');
  const [exportBusy,setExportBusy] = useState(false);
  const [exportProgress,setExportProgress] = useState('');
  const [shareNotice,setShareNotice] = useState('');
  const [shareFallback,setShareFallback] = useState('');
  const [navBusy,setNavBusy] = useState(false);
  const navigationEpoch = useRef(0);
  const lastDrawerRef = useRef<Drawer>(null);

  const t=WORDS[lang];
  const mode:GeometryMode=simplified?'simplified':'detailed';
  const nodes = useMemo(()=>new Map(catalog.map(n=>[n.id,n])),[catalog]);
  // One visibility state shared by tree rows and filter level checkboxes.
  // Filter levels always span every certified territorial set.
  const osmLevelIndex = useMemo(()=>buildOsmLevelIndex(catalog),[catalog]);
  const allLevelScopes = useMemo(()=>osmLevelIndex.scopes.map(scope=>scope.id),[osmLevelIndex]);
  const levelOptions = useMemo(()=>
    availableOsmLevels(osmLevelIndex,allLevelScopes),[osmLevelIndex,allLevelScopes]);
  const statisticalLevelOptions = useMemo(()=>
    availableStatisticalLevels(osmLevelIndex,allLevelScopes),[osmLevelIndex,allLevelScopes]);
  const hierarchy = useMemo(()=>createHierarchy(catalog,treeView),[catalog,treeView]);
  const visibleSet = useMemo(()=>new Set(visible),[visible]);
  const expandedSet = useMemo(()=>new Set(expanded),[expanded]);
  const currentNode=selected?nodes.get(selected) || null:null;
  const breadcrumbs = useMemo(()=>{
    const path:Territory[]=[];
    let cursor=selected?nodes.get(selected):undefined;
    const visited=new Set<string>();
    while(cursor && !visited.has(cursor.id) && path.length<32){
      path.unshift(cursor);visited.add(cursor.id);
      const parent=treeView==='administrative'?cursor.administrativeParentId:cursor.treeParentId;
      cursor=parent?nodes.get(parent):undefined;
    }
    return path;
  },[nodes,selected,treeView]);
  const siblings=useMemo(()=>{
    if(!currentNode)return [];
    const parent=treeView==='administrative'?currentNode.administrativeParentId:currentNode.treeParentId;
    return parent?(hierarchy.get(parent)||[]):ROOT_IDS.map(id=>nodes.get(id)).filter((n):n is Territory=>Boolean(n));
  },[currentNode,hierarchy,nodes,treeView]);
  const siblingIndex=siblings.findIndex(n=>n.id===selected);
  const searchIndex = useMemo(()=>catalog.map(node=>({node,text:lookupKeys(node)})),[catalog]);
  const matches = useMemo(()=>{
    if(!search.trim())return [];
    const query=normalize(search);
    return searchIndex.filter(x=>x.text.includes(query) && (
      treeView==='all' || (treeView==='administrative' && x.node.roles.includes('administrative')) ||
      (treeView==='statistical' && x.node.statisticalRoles.length>0)
    )).slice(0,81).map(x=>x.node);
  },[search,searchIndex,treeView]);

  useEffect(()=>{
    let active=true;
    loadCatalog().then(d => {if(active)setCatalog(d.entities);})
      .catch(e=>{if(active)setCatalogError(String(e));});
    return ()=>{active=false;};
  },[]);
  useEffect(()=>{document.documentElement.lang=lang;document.title=t.title;localStorage.setItem('atlas-lang',lang);},[lang,t.title]);
  useEffect(()=>{localStorage.setItem('atlas-simple',String(simplified));},[simplified]);
  useEffect(()=>{
    const onShortcut=(event:KeyboardEvent)=>{
      const target=event.target;
      if(event.key!=='/' || event.ctrlKey || event.metaKey || event.altKey || event.defaultPrevented ||
        (target instanceof HTMLElement && (target.isContentEditable || ['INPUT','TEXTAREA','SELECT'].includes(target.tagName))))return;
      event.preventDefault();
      setModule('administrative');
      setModulePanelOpen(true);
      if(window.matchMedia('(max-width:700px)').matches)setDrawer('tree');
      window.setTimeout(()=>searchRef.current?.focus(),0);
    };
    window.addEventListener('keydown',onShortcut);
    return ()=>window.removeEventListener('keydown',onShortcut);
  },[]);
  // WEB-R3.3: Escape closes the foremost panel and restores keyboard focus
  // without clearing selected or visible entities.
  useEffect(()=>{
    const onEscape=(event:KeyboardEvent)=>{
      if(event.key!=='Escape'||event.defaultPrevented)return;
      if(drawer){
        setDrawer(null);
        if(drawer==='tree')setModulePanelOpen(false);
        else setDetailPanelOpen(false);
      }else if(detailPanelOpen){
        setDetailPanelOpen(false);
        window.requestAnimationFrame(()=>
          document.querySelector<HTMLButtonElement>('.header-entity-action')?.focus());
      }else if(modulePanelOpen){
        const opener=document.querySelector<HTMLButtonElement>('.module-rail button[aria-expanded=true]');
        setModulePanelOpen(false);
        window.requestAnimationFrame(()=>opener?.focus());
      }else return;
      event.preventDefault();
    };
    window.addEventListener('keydown',onEscape);
    return ()=>window.removeEventListener('keydown',onEscape);
  },[drawer,detailPanelOpen,modulePanelOpen]);

  // The mobile drawer is a modal dialog: focus its Close control on entry,
  // contain keyboard Tab navigation, and return focus to the correct opener.
  // This does not block pointer/touch interactions with the module bar below.
  useEffect(()=>{
    const previous=lastDrawerRef.current;
    lastDrawerRef.current=drawer;
    if(!drawer){
      if(previous==='detail')
        document.querySelector<HTMLButtonElement>('.header-entity-action')?.focus();
      else if(previous==='tree')
        document.querySelector<HTMLButtonElement>('.module-rail button:first-child')?.focus();
      return;
    }
    const dialog=document.querySelector<HTMLElement>('.drawer-screen .drawer');
    if(!dialog)return;
    dialog.querySelector<HTMLButtonElement>('.drawer-close')?.focus();
    const onTab=(event:KeyboardEvent)=>{
      if(event.key!=='Tab'||event.defaultPrevented)return;
      const focusables=Array.from(dialog.querySelectorAll<HTMLElement>(
        'button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),summary,[tabindex]:not([tabindex="-1"])'
      )).filter(el=>{
        const closed=el.closest('details:not([open])');
        return el.getClientRects().length>0&&!el.closest('[inert]')&&
          (!closed||(el.tagName==='SUMMARY'&&el.parentElement===closed&&
            !closed.parentElement?.closest('details:not([open])')));
      });
      if(!focusables.length)return;
      const first=focusables[0],last=focusables[focusables.length-1];
      const active=document.activeElement;
      if(event.shiftKey&&(active===first||!dialog.contains(active))){
        event.preventDefault();last.focus();
      }else if(!event.shiftKey&&(active===last||!dialog.contains(active))){
        event.preventDefault();first.focus();
      }
    };
    document.addEventListener('keydown',onTab);
    return ()=>document.removeEventListener('keydown',onTab);
  },[drawer]);
  useEffect(()=>{localStorage.setItem('atlas-visible-phase4',JSON.stringify(visible));},[visible]);
  useEffect(()=>{
    if(catalog.length && selected && !nodes.has(selected))setSelected(null);
  },[catalog.length,nodes,selected]);
  useEffect(()=>{
    if(!catalog.length || !SHARED_STATE.entity || !nodes.has(SHARED_STATE.entity))return;
    const path:string[]=[];
    let cursor=nodes.get(SHARED_STATE.entity),depth=0;
    while(cursor && depth++<32){
      const parent=treeView==='administrative'?cursor.administrativeParentId:cursor.treeParentId;
      if(!parent)break;
      path.push(parent);cursor=nodes.get(parent);
    }
    setExpanded(old=>[...new Set([...old,...path])]);
  },[catalog.length,nodes]);

  useEffect(()=>{
    if(!catalog.length)return;
    const set=new Set(catalog.map(x=>x.id));
    setVisible(old=>old.filter(id=>set.has(id)));
  },[catalog]);

  useEffect(()=>{
    if(!mapEl.current || mapRef.current)return;
    const instance=new maplibregl.Map({
      container:mapEl.current,style,
      center:SHARED_STATE.lng!==null && SHARED_STATE.lat!==null?[SHARED_STATE.lng,SHARED_STATE.lat]:[25.4,46.05],
      zoom:SHARED_STATE.zoom ?? 5.5,
      attributionControl:false,dragRotate:false,pitchWithRotate:false
    });
    mapRef.current=instance;
    instance.addControl(new maplibregl.AttributionControl({compact:true}),'bottom-right');
    instance.addControl(new maplibregl.ScaleControl({maxWidth:100,unit:'metric'}),'bottom-left');
    instance.on('load',()=>{
      instance.addSource('borders',{type:'geojson',data:getCountryGeoJSON('simplified')});
      instance.addLayer({id:'country-fill',type:'fill',source:'borders',paint:{'fill-color':'#dce9dd','fill-opacity':0.31},filter:['in',['get','id'],['literal',['ro','md']]]});
      instance.addLayer({id:'country-outline',type:'line',source:'borders',paint:{'line-color':'#185440','line-width':2.3},filter:['in',['get','id'],['literal',['ro','md']]]});
      instance.addLayer({id:'country-highlight',type:'line',source:'borders',paint:{'line-color':'#e6a636','line-width':3.8},filter:['==',['get','id'],'__none__']});
      instance.addSource('entities',{type:'geojson',data:EMPTY_FEATURES});
      instance.addLayer({id:'entity-fill',type:'fill',source:'entities',paint:{
        'fill-color':['case',['==',['get','roleKind'],'statistical'],'#a6a6e6','#6ea983'],
        'fill-opacity':['case',['==',['get','roleKind'],'statistical'],0.32,0.25]
      }});
      instance.addLayer({id:'entity-outline',type:'line',source:'entities',paint:{
        'line-color':['case',['==',['get','roleKind'],'statistical'],'#7066b3','#15533e'],
        'line-width':['case',['==',['get','roleKind'],'statistical'],1.8,1.6],
        'line-opacity':0.94
      }});
      instance.addLayer({id:'entity-hover',type:'line',source:'entities',paint:{'line-color':'#1d7e65','line-width':3},filter:['==',['get','atlasId'],'__none__']});
      instance.addLayer({id:'entity-highlight',type:'line',source:'entities',paint:{'line-color':'#e3a12f','line-width':4},filter:['==',['get','atlasId'],'__none__']});
      instance.on('mousemove','entity-fill',event=>{
        const id=event.features?.[0]?.properties?.atlasId;
        instance.setFilter('entity-hover',['==',['get','atlasId'],typeof id==='string'?id:'__none__']);
      });
      instance.on('mouseleave','entity-fill',()=>{
        instance.setFilter('entity-hover',['==',['get','atlasId'],'__none__']);
      });
      instance.on('click','entity-fill',event=>{
        const id=event.features?.[0]?.properties?.atlasId;
        if(typeof id==='string'){
          setSelected(id);setDetailPanelOpen(true);
          if(window.innerWidth<=700){setModulePanelOpen(false);setDrawer('detail');}
          else if(window.innerWidth<1100)setModulePanelOpen(false);
        }
      });
      instance.on('click','entity-outline',event=>{
        const id=event.features?.[0]?.properties?.atlasId;
        if(typeof id==='string'){
          setSelected(id);setDetailPanelOpen(true);
          if(window.innerWidth<=700){setModulePanelOpen(false);setDrawer('detail');}
          else if(window.innerWidth<1100)setModulePanelOpen(false);
        }
      });
      instance.on('click','country-fill',event=>{
        const country=event.features?.[0]?.properties?.id;
        if(country==='ro'||country==='md'){
          setSelected(country==='ro'?'osm-r90689':'osm-r58974');
          setDetailPanelOpen(true);
          if(window.innerWidth<=700){setModulePanelOpen(false);setDrawer('detail');}
          else if(window.innerWidth<1100)setModulePanelOpen(false);
        }
      });
      for(const layer of ['country-fill','entity-fill','entity-outline']) {
        instance.on('mouseenter',layer,()=>{instance.getCanvas().style.cursor='pointer';});
        instance.on('mouseleave',layer,()=>{instance.getCanvas().style.cursor='';});
      }
      if(SHARED_STATE.zoom===null)instance.fitBounds(BOUNDS,{padding:45,duration:0});
      setReady(true);
    });
    return ()=>{mapRef.current=null;instance.remove();};
  },[]);

  useEffect(()=>{
    if(!ready||!mapRef.current)return;
    const map=mapRef.current;
    const roots=visible.filter(id=>ROOT_IDS.includes(id as typeof ROOT_IDS[number])).map(featureCountryCode);
    const filter: maplibregl.FilterSpecification=['in',['get','id'],['literal',roots]];
    map.setFilter('country-fill',filter);
    map.setFilter('country-outline',filter);
  },[visible,ready]);
  useEffect(()=>{
    if(!ready||!mapRef.current)return;
    const map=mapRef.current;
    map.setFilter('country-highlight',['==',['get','id'],featureCountryCode(selected||'') || '__none__']);
    map.setFilter('entity-highlight',['==',['get','atlasId'],selected || '__none__']);
  },[selected,ready]);

  useEffect(()=>{
    if(!ready||!catalog.length||!mapRef.current)return;
    let active=true;
    setRootsLoaded(false);
    loadGeometryShard('roots',mode).then(shapes=>{
      if(!active||!mapRef.current)return;
      const source=mapRef.current.getSource('borders') as GeoJSONSource | undefined;
      source?.setData(mapCountryFeatures(shapes));
      setRootsLoaded(true);
    }).catch(()=>{if(active)setGeomError(true);});
    return ()=>{active=false;};
  },[catalog.length,mode,ready]);

  useEffect(()=>{
    if(!ready||!catalog.length||!mapRef.current)return;
    let active=true;
    const ids=visible.filter(id=>nodes.has(id) && !ROOT_IDS.includes(id as typeof ROOT_IDS[number]));
    const shards=[...new Set(ids.map(id=>nodes.get(id)!.geometryShard))];
    if(!shards.length){
      const source=mapRef.current.getSource('entities') as GeoJSONSource | undefined;
      source?.setData(EMPTY_FEATURES);
      setGeomLoading(false);return;
    }
    setGeomLoading(true);setGeomError(false);
    Promise.all(shards.map(shard=>loadGeometryShard(shard,mode))).then(collections=>{
      if(!active||!mapRef.current)return;
      const features=new Map<string,TerritoryFeature>();
      for(const collection of collections)for(const [id,feature] of collection)features.set(id,feature);
      loadedRef.current=features;
      const source=mapRef.current.getSource('entities') as GeoJSONSource | undefined;
      source?.setData(asDisplayFeatures(ids,nodes,features));
      setGeomLoading(false);
    }).catch(()=>{if(active){setGeomLoading(false);setGeomError(true);}});
    return ()=>{active=false;};
  },[catalog.length,mode,nodes,ready,visible]);

  useEffect(()=>{
    if(!ready||!mapRef.current)return;
    const m=mapRef.current;
    m.setLayoutProperty('basemap','visibility',basemap==='none'?'none':'visible');
    m.setPaintProperty('basemap','raster-saturation',basemap==='grayscale'||basemap==='dark'?-1:0);
    m.setPaintProperty('basemap','raster-brightness-max',basemap==='dark'?0.4:1);
    m.setPaintProperty('basemap','raster-opacity',basemap==='none'?0:0.85);
    m.setPaintProperty('backdrop','background-color',basemap==='dark'?'#14241e':'#f1f5ef');
  },[basemap,ready]);

  const toggleVisible = useCallback((id:string)=>setVisible(old=>old.includes(id)?old.filter(x=>x!==id):[...old,id]),[]);
  const toggleChildren = useCallback((ids:string[],show:boolean)=>setVisible(old=>{
    const s=new Set(old);for(const id of ids)if(show)s.add(id);else s.delete(id);return [...s];
  }),[]);
  const choose = useCallback((id:string)=>{
    setSelected(id);setDetailPanelOpen(true);
    if(window.innerWidth<=700){setModulePanelOpen(false);setDrawer('detail');}
    else if(window.innerWidth<1100)setModulePanelOpen(false);
  },[]);
  function toggleModulePanel(id:ModuleId){
    const shouldOpen=id!==module||!modulePanelOpen;
    setModule(id);setModulePanelOpen(shouldOpen);
    if(window.innerWidth<1100&&shouldOpen)setDetailPanelOpen(false);
    if(window.innerWidth<=700)setDrawer(shouldOpen?'tree':null);
    else setDrawer(null);
  }
  function closeModulePanel(){
    setModulePanelOpen(false);
    if(drawer==='tree')setDrawer(null);
  }
  function closeDetailPanel(){
    setDetailPanelOpen(false);
    if(drawer==='detail')setDrawer(null);
  }
  // Home restores only the camera. Reset geometries returns to the initial
  // RO/MD outline preview without changing map language, basemap or simplification.
  const reset=()=>mapRef.current?.fitBounds(BOUNDS,{padding:45,duration:650});
  const resetGeometries=()=>{
    navigationEpoch.current++; // Cancel stale asynchronous camera movements.
    setNavBusy(false);
    setVisible([...DEFAULT_VISIBLE]);
    setSelected(null);
    setDetailPanelOpen(false);
    setExpanded([]);
    setSearch('');
    setDrawer(null);
    setModulePanelOpen(false);
    setExportOpen(false);
    setExportScope('visible');
    setExportProgress('');
    setShareNotice('');
    setShareFallback('');
    setGeomError(false);
    window.history.replaceState(window.history.state,'',clearGeometryPermalink(window.location.href));
    reset();
  };
  async function fitVisible(){
    const groups=new Map<string,string[]>();
    for(const id of visible){
      const node=nodes.get(id);if(!node)continue;
      const list=groups.get(node.geometryShard)||[];list.push(id);groups.set(node.geometryShard,list);
    }
    if(!groups.size || !mapRef.current)return;
    const request=++navigationEpoch.current;
    setNavBusy(true);setGeomError(false);
    try{
      let left=Infinity,bottom=Infinity,right=-Infinity,top=-Infinity;
      for(const [shard,ids] of groups){
        const shapes=await loadGeometryShard(shard,mode);
        for(const id of ids){
          const shape=shapes.get(id);
          if(!shape)throw Error('Missing visible polygon: '+id);
          const [[w,s],[e,n]]=bboxOfGeometry(shape.geometry);
          left=Math.min(left,w);bottom=Math.min(bottom,s);right=Math.max(right,e);top=Math.max(top,n);
        }
      }
      if(request!==navigationEpoch.current)return;
      if(Number.isFinite(left))mapRef.current?.fitBounds([[left,bottom],[right,top]],{
        padding:window.innerWidth<700?38:85,duration:650,maxZoom:11
      });
    }catch{if(request===navigationEpoch.current)setGeomError(true);}
    finally{if(request===navigationEpoch.current)setNavBusy(false);}
  }
  function downloadText(content:string,filename:string,mime:string){
    const blob=new Blob([content],{type:mime});
    const url=URL.createObjectURL(blob);
    const anchor=document.createElement('a');
    anchor.href=url;anchor.download=filename;
    document.body.appendChild(anchor);anchor.click();anchor.remove();
    window.setTimeout(()=>URL.revokeObjectURL(url),3000);
  }
  async function performExport(format:'geojson'|'csv',scope:ExportScope=exportScope){
    if(exportBusy)return;
    const ids=idsForScope(scope,selected,visible,new Set(nodes.keys()));
    if(!ids.length)return;
    setExportBusy(true);setExportProgress(t.exportBusy);
    try{
      const content=format==='csv'?
        metadataCsv(ids,nodes):
        JSON.stringify(await makeDetailedCollection(ids,nodes,loadGeometryShard,
          (done,total)=>setExportProgress(done+' / '+total)),null,2);
      const filename='territorial-atlas-2026-10-05-'+scope+'.'+format;
      downloadText(content,filename,format==='csv'?'text/csv;charset=utf-8':'application/geo+json;charset=utf-8');
      setExportProgress(t.exportDone);
    }catch{setExportProgress(t.exportFailed);}
    finally{setExportBusy(false);}
  }
  async function copyPermalink(){
    const map=mapRef.current,center=map?.getCenter();
    const url=buildPermalink(window.location.href,{
      entity:selected,view:treeView,lang,simple:simplified,basemap,
      lng:center?.lng??25.4,lat:center?.lat??46.05,zoom:map?.getZoom()??5.5
    });
    setShareFallback('');setShareNotice('');
    try{
      if(!navigator.clipboard?.writeText)throw Error('Clipboard unavailable');
      await navigator.clipboard.writeText(url);
      setShareNotice(t.linkCopied);
    }catch{setShareFallback(url);setShareNotice(t.linkManual);}
  }
  async function locate(id:string){
    const node=nodes.get(id);
    if(!node||!mapRef.current)return;
    const request=++navigationEpoch.current;
    setNavBusy(false);
    try{
      const features=await loadGeometryShard(node.geometryShard,mode);
      if(request!==navigationEpoch.current)return;
      const feature=features.get(id);
      if(!feature)throw Error('Missing Atlas geometry for '+id);
      mapRef.current.fitBounds(bboxOfGeometry(feature.geometry),{padding:window.innerWidth<700?36:85,duration:650,maxZoom:10});
    }catch{if(request===navigationEpoch.current)setGeomError(true);}
  }
  function chooseSearch(id:string){
    choose(id);setSearch('');
    let cursor=nodes.get(id),depth=0;
    const ancestry:string[]=[];
    while(cursor&&depth++<24){
      const parent=treeView==='administrative'?cursor.administrativeParentId:cursor.treeParentId;
      if(!parent)break;
      ancestry.push(parent);cursor=nodes.get(parent);
    }
    setExpanded(old=>[...new Set([...old,...ancestry])]);
  }

  const treeItem=(node:Territory,depth:number,searchMatch=false):React.ReactNode=>{
    const childNodes=hierarchy.get(node.id)||[];
    const isExpanded=expandedSet.has(node.id);
    const isChecked=visibleSet.has(node.id);
    const rowLabel=labelOf(node,lang);
    const stat=node.statisticalRoles.length>0;
    return <div className="territory-branch" key={node.id} role={searchMatch?'none':'none'}>
      <div className={'tree-line'+(selected===node.id?' is-selected':'')} role="treeitem"
           aria-level={searchMatch?1:depth+1} aria-selected={selected===node.id}
           aria-expanded={!searchMatch&&childNodes.length?isExpanded:undefined}
           style={{paddingLeft: Math.min(depth,7)*14+3}}>
        {childNodes.length&&!searchMatch?
          <button className="expand-button" aria-label={(isExpanded?t.collapse:t.expand)+' '+rowLabel}
            onClick={()=>setExpanded(old=>isExpanded?old.filter(id=>id!==node.id):[...old,node.id])}>
            {isExpanded?'⌄':'›'}</button>:
          <span className="tree-spacer" aria-hidden="true">·</span>}
        <input type="checkbox" checked={isChecked} aria-label={t.visible+': '+rowLabel}
          onChange={()=>toggleVisible(node.id)} />
        <button className="tree-label" aria-label={rowLabel} title={node.officialName}
          onClick={()=>searchMatch?chooseSearch(node.id):choose(node.id)}>
          <span className="node-name">{rowLabel}</span>
          <span className={'node-level'+(stat?' is-stat':'')}>{roleLabel(node)}</span>
        </button>
        {searchMatch&&<span className="search-country">{node.country}</span>}
      </div>
      {!searchMatch&&isExpanded&&childNodes.length>0&&<div className="tree-children" role="group">
        {childNodes.length>1&&<div className="children-actions" style={{paddingLeft:Math.min(depth,7)*14+31}}>
          <button onClick={()=>toggleChildren(childNodes.map(n=>n.id),true)}>{t.childrenShow}</button>
          <button onClick={()=>toggleChildren(childNodes.map(n=>n.id),false)}>{t.childrenHide}</button>
        </div>}
        {childNodes.map(child=>treeItem(child,depth+1))}
      </div>}
    </div>;
  };

  const treePanel=<section className="tree-content">
    <div className="panel-heading"><span className="eyebrow">{t.sourceSnapshot}</span><h2>{t.tree}</h2></div>
    <label className="search"><span aria-hidden="true">⌕</span>
      <input ref={searchRef} type="search" placeholder={t.search} aria-label={t.search} value={search}
        onChange={e=>setSearch(e.target.value)}
        onKeyDown={e=>{
          if(e.key==='Enter' && matches.length){e.preventDefault();chooseSearch(matches[0].id);}
          if(e.key==='Escape')setSearch('');
        }} />
    </label>
    <p className="search-tip">{t.searchShortcut}</p>
    <details className="osm-level-filter">
      <summary>{t.levelFilter}</summary>
      <div className="osm-level-filter-body">
        <div className="osm-level-columns">
          <fieldset className="osm-level-choices" data-column="administrative">
            <legend>{t.adminView}</legend>
            {levelOptions.map(option=>{
              const ids=matchingOsmLevelIds(osmLevelIndex,allLevelScopes,[option.level]);
              const state=levelVisibilityState(visibleSet,ids);
              return <label key={'adm-'+option.level} data-level-kind="administrative">
                <input type="checkbox" checked={state.checked} aria-checked={state.mixed?'mixed':state.checked}
                  ref={el=>{if(el)el.indeterminate=state.mixed;}}
                  aria-label={'OSM '+option.level}
                  onChange={event=>setVisible(old=>updateOsmLevelVisibility(old,ids,event.target.checked))}/>
                <span>ADM {option.level}</span>
                <small>{option.count.toLocaleString(lang==='ro'?'ro-RO':'en-US')}</small>
              </label>;
            })}
          </fieldset>
          <fieldset className="osm-level-choices" data-column="statistical">
            <legend>{t.statView}</legend>
            {statisticalLevelOptions.map(option=>{
              const ids=matchingStatisticalLevelIds(osmLevelIndex,allLevelScopes,[option.key]);
              const state=levelVisibilityState(visibleSet,ids);
              return <label key={option.key} data-level-kind="statistical">
                <input type="checkbox" checked={state.checked} aria-checked={state.mixed?'mixed':state.checked}
                  ref={el=>{if(el)el.indeterminate=state.mixed;}}
                  aria-label={(option.classification==='NUTS_MOLDOVA'?'NTS':option.classification)+' '+option.level}
                  onChange={event=>setVisible(old=>updateOsmLevelVisibility(old,ids,event.target.checked))}/>
                <span>{option.classification==='NUTS_MOLDOVA'?'NTS':option.classification} {option.level}</span>
                <small>{option.count.toLocaleString(lang==='ro'?'ro-RO':'en-US')}</small>
              </label>;
            })}
          </fieldset>
        </div>
        <p className="osm-stat-hint">{t.statRoleNote}</p>
      </div>
    </details>
    <div className="tree-filters" role="group" aria-label={t.dataRole}>
      {(['all','administrative','statistical'] as TreeView[]).map(key=><button key={key}
        aria-pressed={treeView===key} className={treeView===key?'active':''} onClick={()=>setTreeView(key)}>
        {key==='all'?t.all:key==='administrative'?t.adminView:t.statView}</button>)}
    </div>
    {catalogError?<div className="loading-msg" role="alert">{t.loadFailed}<button onClick={()=>window.location.reload()}>{t.retry}</button></div>:
      catalog.length===0?<p className="loading-msg" role="status">{t.loading}</p>:
      <div className="tree-list" role="tree" aria-label={t.tree}>
        {search.trim()?<>
          <div className="results-heading">{t.searchResults} · {Math.min(matches.length,80)}</div>
          {matches.length?matches.slice(0,80).map(n=>treeItem(n,0,true)):<p className="tree-empty">{t.noResults}</p>}
          {matches.length>80&&<p className="tree-hint">{t.searchLimit}</p>}
        </>:ROOT_IDS.map(id=>{const n=nodes.get(id);return n?treeItem(n,0):null;})}
      </div>}
    <details className="atlas-map-tools">
      <summary>{t.mapTools}</summary>
      <div className="atlas-map-tool-groups">
        <details className="atlas-tool-section atlas-map-settings">
          <summary>{t.mapSettings}</summary>
          <div className="atlas-tool-body">
            <label className="basemap-select"><span aria-hidden="true">▧</span><span className="control-caption">{t.basemap}</span>
              <select value={basemap} onChange={e=>setBasemap(e.target.value as Basemap)} aria-label={t.basemap}>
                {(['standard','grayscale','dark','none'] as Basemap[]).map(key=>
                  <option key={key} value={key}>{t[key]}</option>)}
              </select>
            </label>
            <label className="simplify-control"><input type="checkbox" checked={simplified}
              onChange={e=>setSimplified(e.target.checked)}/>
              <span className="toggle-track"/><span className="control-caption">{t.simplified}</span>
            </label>
          </div>
        </details>
        <details className="atlas-tool-section atlas-geometry-actions">
          <summary>{t.geometryActions}</summary>
          <div className="atlas-tool-body">
            <button type="button" disabled={!visible.length||navBusy}
              onClick={()=>void fitVisible()}>{navBusy?t.navigationLoading:t.fitVisible}</button>
            <button type="button" className="reset-geometries" onClick={resetGeometries}
              aria-label={t.resetGeometries} title={t.resetGeometries}>{t.resetGeometries}</button>
          </div>
        </details>
        <details className="atlas-tool-section atlas-export-tools" open={exportOpen}>
          <summary aria-expanded={exportOpen} aria-controls="phase5-export-panel"
            onClick={e=>{e.preventDefault();setExportOpen(old=>!old);setExportProgress('');}}>
            {t.exportAction}
          </summary>
          {exportOpen&&<section id="phase5-export-panel" className="export-panel" aria-label={t.exportTitle}>
            <label className="export-scope">{t.exportScope}
              <select value={exportScope} onChange={e=>setExportScope(e.target.value as ExportScope)}>
                <option value="visible">{t.exportVisible} ({visible.filter(id=>nodes.has(id)).length})</option>
                <option value="selected" disabled={!currentNode}>{t.exportSelected}</option>
              </select>
            </label>
            <div className="export-buttons">
              <button type="button" disabled={exportBusy||!idsForScope(exportScope,selected,visible,new Set(nodes.keys())).length}
                onClick={()=>void performExport('geojson')}>{t.exportGeoJSON}</button>
              <button type="button" disabled={exportBusy||!idsForScope(exportScope,selected,visible,new Set(nodes.keys())).length}
                onClick={()=>void performExport('csv')}>{t.exportCSV}</button>
              <button type="button" className="secondary" onClick={()=>void copyPermalink()}>{t.copyLink}</button>
            </div>
            <p className="export-help">{t.exportHelp}</p>
            {exportProgress&&<p className="export-status" role="status">{exportProgress}</p>}
            {shareNotice&&<p className="export-status" role="status">{shareNotice}</p>}
            {shareFallback&&<input className="share-url" aria-label={t.copyLink} readOnly
              value={shareFallback} onFocus={e=>e.currentTarget.select()} />}
            {!nodes.size&&<p className="export-help">{t.exportEmpty}</p>}
          </section>}
        </details>
        <details className="atlas-tool-section atlas-map-information">
          <summary>{t.mapInformation}</summary>
          <div className="atlas-tool-body">
            <div className="map-legend" aria-label={t.dataRole}>
              <span className="legend-admin"/> {t.adminView}
              <span className="legend-stat"/> {t.statView}
            </div>
            <h3>{t.displaySource}</h3>
            <p>{t.sourceNote}</p>
            <p>{t.description}</p>
            <p>{t.detailNote}</p>
          </div>
        </details>
      </div>
    </details>
    <div className="tree-footnote"><strong>{catalog.length.toLocaleString(lang==='ro'?'ro-RO':'en-US')} {t.entityCount}</strong>
      <span> · {visible.length.toLocaleString(lang==='ro'?'ro-RO':'en-US')} {t.selectedCount}</span>
      <p>{t.description}</p>
    </div>
  </section>;

  const details=<section className="detail-content">
    <div className="panel-heading"><span className="eyebrow">{t.sourceSnapshot}</span><h2>{t.details}</h2></div>
    {currentNode?<div className="entity-card">
      <div className="entity-title">
        <span className="flag" aria-hidden="true">{currentNode.country==='RO'?'🇷🇴':'🇲🇩'}</span>
        <div><h3>{currentNode.officialName}</h3><small>{roleLabel(currentNode)}</small></div>
      </div>
      {breadcrumbs.length>0&&<nav className="entity-breadcrumbs" aria-label={t.path}>
        {breadcrumbs.map((crumb,index)=><span className="breadcrumb-part" key={crumb.id}>
          {index>0&&<span aria-hidden="true">›</span>}
          <button type="button" aria-current={crumb.id===currentNode.id?'location':undefined}
            onClick={()=>choose(crumb.id)}>{labelOf(crumb,lang)}</button>
        </span>)}
      </nav>}
      <div className="sibling-navigation">
        <button type="button" disabled={siblingIndex<=0}
          onClick={()=>{const n=siblings[siblingIndex-1];if(n)choose(n.id);}}>‹ {t.previous}</button>
        <button type="button" disabled={siblingIndex<0||siblingIndex>=siblings.length-1}
          onClick={()=>{const n=siblings[siblingIndex+1];if(n)choose(n.id);}}>{t.next} ›</button>
      </div>
      <div className="entity-actions">
        <button onClick={()=>toggleVisible(currentNode.id)}>{visibleSet.has(currentNode.id)?t.hide:t.view}</button>
        <button className="secondary" onClick={()=>void locate(currentNode.id)}>{t.locate}</button>
      </div>
      <details className="atlas-detail-export">
        <summary>{t.entityExport}</summary>
        <div className="atlas-detail-export-actions">
          <button type="button" disabled={exportBusy}
            onClick={()=>void performExport('geojson','selected')}>{t.exportGeoJSON}</button>
          <button type="button" disabled={exportBusy}
            onClick={()=>void performExport('csv','selected')}>{t.exportCSV}</button>
          <button type="button" onClick={()=>void copyPermalink()}>{t.copyLink}</button>
          {exportProgress&&<p role="status">{exportProgress}</p>}
          {shareNotice&&<p role="status">{shareNotice}</p>}
          {shareFallback&&<input aria-label={t.copyLink} readOnly value={shareFallback}
            onFocus={e=>e.currentTarget.select()} />}
        </div>
      </details>
      <div className="detail-section">{t.details}</div>
      <dl className="metadata">
        <dt>{t.official}</dt><dd>{currentNode.officialName}</dd>
        <dt>{t.country}</dt><dd>{currentNode.country==='RO'?'România':'Republica Moldova'}</dd>
        <dt>{t.adminLevel}</dt><dd>{currentNode.adminLevel===null?'':currentNode.adminLevel}</dd>
        <dt>{t.osmId}</dt><dd>{currentNode.osmRelationId!==null?
          <a href={'https://www.openstreetmap.org/relation/'+currentNode.osmRelationId} target="_blank" rel="noreferrer">{currentNode.osmRelationId} ↗</a>:null}</dd>
        <dt>{t.registry}</dt><dd>{currentNode.registry?currentNode.registry.system+' '+currentNode.registry.code:null}</dd>
        <dt>{t.statisticalRole}</dt><dd>{codeOf(currentNode)||null}</dd>
        <dt>{t.parentAdmin}</dt><dd>{currentNode.administrativeParentId?nodes.get(currentNode.administrativeParentId)?.officialName:null}</dd>
        <dt>{t.parentTree}</dt><dd>{currentNode.treeParentId?labelOf(nodes.get(currentNode.treeParentId)!,lang):null}</dd>
      </dl>
      {currentNode.registryIdentityReviewStatus&&<p className="source-caveat">{t.relationshipNote}</p>}
      {currentNode.registry?.record&&<details className="raw-details">
        <summary>{t.officialRecord}</summary>
        <dl className="raw-tags">{Object.entries(currentNode.registry.record).map(([key,value])=>
          <div key={key}><dt>{key}</dt><dd>{value===null?'':String(value)}</dd></div>)}</dl>
      </details>}
      <details className="raw-details">
        <summary>{t.raw} ({Object.keys(currentNode.sourceTags||{}).length})</summary>
        <dl className="raw-tags">{Object.entries(currentNode.sourceTags||{}).sort(([a],[b])=>a.localeCompare(b)).map(([key,value])=>
          <div key={key}><dt>{key}</dt><dd>{value}</dd></div>)}</dl>
      </details>
      <div className="detail-section">{t.source}</div>
      <dl className="metadata">
        <dt>{t.source}</dt><dd>{t.sourceBoundary}</dd>
        <dt>{t.original}</dt><dd>2026-10-05</dd>
      </dl>
      <p className="note">{t.detailNote}</p>
    </div>:<div className="empty-detail"><span>◇</span><h3>{t.selectEntity}</h3><p>{t.select}</p></div>}
  </section>;

  return <div className="app">
    <header className="site-header">
      <div className="brand-symbol" aria-hidden="true">◎</div>
      <div className="brand"><strong>{t.title}</strong><small>{t.tagline}</small></div>
      <span className="version">{t.version}</span>
      {currentNode&&<button type="button" className="header-entity-action" aria-label={t.openDetail}
        title={t.openDetail} aria-expanded={detailPanelOpen}
        onClick={()=>{
          if(detailPanelOpen){closeDetailPanel();return;}
          setDetailPanelOpen(true);
          if(window.innerWidth<=700){setModulePanelOpen(false);setDrawer('detail');}
          else if(window.innerWidth<1100)setModulePanelOpen(false);
        }}><span className="detail-info-glyph" aria-hidden="true">i</span></button>}
      <div className="language" aria-label="Language">
        <button className={lang==='en'?'active':''} aria-pressed={lang==='en'} onClick={()=>setLang('en')}>EN</button>
        <button className={lang==='ro'?'active':''} aria-pressed={lang==='ro'} onClick={()=>setLang('ro')}>RO</button>
      </div>
    </header>
    <div className="workspace">
      <nav className="module-rail" aria-label="Modules">{MODULES.map(item=>
        <button key={item.id} type="button" title={item[lang]} aria-label={item[lang]}
          aria-expanded={module===item.id&&modulePanelOpen} aria-controls="atlas-module-panel"
          className={module===item.id&&modulePanelOpen?'active':''}
          onClick={()=>toggleModulePanel(item.id)}>
          <span className="module-symbol" aria-hidden="true">{item.symbol}</span>
          <span className="module-short">{item[lang].split(' ')[0].slice(0,8)}</span>
        </button>)}</nav>
      {modulePanelOpen&&<aside id="atlas-module-panel" className="tree-sidebar" aria-label={MODULES.find(x=>x.id===module)?.[lang]}>
        <button type="button" className="pane-close" aria-label={t.close} title={t.close}
          onClick={closeModulePanel}>×</button>
        {module==='administrative'?treePanel:
          <section className="tree-content">
            <div className="panel-heading"><h2>{MODULES.find(x=>x.id===module)?.[lang]}</h2></div>
            <p className="planned-module-description">{t.planned}</p>
          </section>}
      </aside>}
      <main className="map-area" data-map-ready={ready&&rootsLoaded?'true':'false'} onPointerDown={event=>{
        if(event.target instanceof Element && event.target.closest('.maplibregl-canvas-container'))closeModulePanel();
      }}>
        <div className="map-canvas" ref={mapEl} aria-label="Territorial map" />
        {!rootsLoaded&&catalog.length>0&&<span className="map-boot-status" role="status">{t.loadingGeom}</span>}
        <div className="zoom-controls">
          <button aria-label={t.zoomIn} title={t.zoomIn} onClick={()=>mapRef.current?.zoomIn()}>+</button>
          <button aria-label={t.zoomOut} title={t.zoomOut} onClick={()=>mapRef.current?.zoomOut()}>−</button>
          <button aria-label={t.home} title={t.home} onClick={reset}>⌂</button>
        </div>
        {(geomLoading||geomError)&&<div className="atlas-map-status" role={geomError?'alert':'status'}>
          {geomError?t.dataError:t.mapLoading}
        </div>}
      </main>
      {currentNode&&detailPanelOpen&&<aside className="detail-sidebar" aria-label={t.details}>
        <button type="button" className="pane-close" aria-label={t.close} title={t.close}
          onClick={closeDetailPanel}>×</button>
        {details}
      </aside>}
    </div>
    {drawer&&<div className="drawer-screen" role="presentation" onClick={()=>{
      if(drawer==='tree')closeModulePanel();else closeDetailPanel();
    }}>
      <div className={'drawer drawer-'+drawer} role="dialog" aria-modal="true"
        aria-label={drawer==='tree'?(MODULES.find(x=>x.id===module)?.[lang]||t.tree):t.details}
        onClick={e=>e.stopPropagation()}>
        <button className="drawer-close" aria-label={t.close} onClick={()=>{
          if(drawer==='tree')closeModulePanel();else closeDetailPanel();
        }}>×</button>
        {drawer==='tree'?(module==='administrative'?treePanel:
          <section className="tree-content">
            <div className="panel-heading"><h2>{MODULES.find(x=>x.id===module)?.[lang]}</h2></div>
            <p className="planned-module-description">{t.planned}</p>
          </section>):details}
      </div>
    </div>}
  </div>;
}
