import { useCallback, useEffect, useMemo, useRef, useState, type SetStateAction } from 'react';
import maplibregl, { type GeoJSONSource, type Map as MapLibreMap } from 'maplibre-gl';
import type { FeatureCollection } from 'geojson';
import { getCountryGeoJSON } from './data/borders';
import { compareTreeSiblings } from './data/treeOrder.mjs';
import { territorialRoleLabel as roleLabel, municipalRoleClarification } from './data/roleLabels.mjs';
import { PMR_CADASTRAL_SOURCE, pmrCadastralSeatCode } from './data/pmrCadastral.mjs';
import { EntityCardSection } from './components/EntityCardSection';
import { TerritorialSymbolImage } from './components/TerritorialSymbolImage';
import { cardNameOf, englishSiblingQualifiers, territorialContextNote } from './data/treeNames.mjs';
import { flagFileForEntity } from './data/entityFlags.mjs';
import { officialSymbolsForEntity } from './data/officialSymbols.mjs';
import { editorialSymbolsForEntity, symbolAssetUrl, symbolSourceUrl } from './data/territorialSymbols.mjs';
import { makeModuleVisibility, setModuleGeometry, resetModuleGeometry,
  displayedModuleGeometry, moduleHasSelections } from './data/moduleReset.mjs';
import { entityCardRoles, statisticalCodeIndex, verifiedStatisticalParent } from './data/entityCardRoles.mjs';
import { presentationParentId } from './data/treeOverlay.mjs';
import { availableOsmLevels, availableStatisticalLevels, buildOsmLevelIndex,
  matchingCombinedLevelIds, matchingOsmLevelIds, matchingStatisticalLevelIds } from './data/osmLevelFilter.mjs';
import { REFERENCE_STYLE, administrativeStyle, statisticalStyle, styleForEntity } from './data/cartographicStyle.mjs';
import { buildPermalink, clearGeometryPermalink, idsForScope, makeDetailedCollection, metadataCsv, readPermalink,
  type ExportScope } from './data/phase5.mjs';
import {
  asDisplayFeatures, bboxOfGeometry, EMPTY_FEATURES, labelOf, loadCatalog,
  loadGeometryShard, lookupKeys, normalize, ROOT_IDS,
  type GeometryMode, type Locale, type Territory, type TerritoryFeature
} from './data/territories';

type Basemap = 'standard' | 'grayscale' | 'dark' | 'none';
type ModuleId = 'administrative' | 'historical' | 'communities' | 'regions' | 'ethnographic' | 'reform';
type TreeView = 'all' | 'administrative' | 'statistical';
type Drawer = 'tree' | 'detail' | null;
type MapToolSection = 'settings' | 'legend' | 'export' | 'about' | null;

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
    tree: 'Territorial tree',
    search: 'Search names, OSM IDs, SIRUTA, CUATM or NUTS codes',
    all: 'All', adminView: 'Administrative', statView: 'Statistical',
    visible: 'Display geometry', details: 'Entity', select: 'Select a territory on the map or in the tree.',
    searchResults: 'Search results', searchLimit: 'Showing the first 80 matches. Refine the search for more.',
    sourceNote: 'Original-source geometry; documented OSMB exceptions are retained.',
    basemap: 'Basemap', standard: 'Standard', grayscale: 'Grayscale', dark: 'Dark', none: 'None',
    simplified: 'Simplified geometries', home: 'Reset map extent',
    resetAll: 'Reset all module selections · Romania + Moldova',
    resetModule: 'Reset selections in this module',
    zoomIn: 'Zoom in', zoomOut: 'Zoom out',
    official: 'Official name', osmId: 'OSM ID', adminLevel: 'OSM administrative level',
    statisticalRole: 'Statistical codes', parentAdmin: 'Administrative parent', parentTree: 'Tree parent',
    source: 'Source', registry: 'Official registry', origin: 'Country',
    pmrCadastralCode: 'PMR cadastral code', pmrCadastralSource: 'PMR cadastral source',
    pmrCadastralCaveat: 'Code of the cadastral unit associated with the administrative seat; not a KLADR PMR identifier or CUATM code, and not proof that the entire OSMB boundary shares the cadastral extent.',
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
    mapLoading: 'Loading map geometry…', referenceOutline: 'Reference outlines',
    referenceCountries: 'Romania, Moldova',
    mapToolMenu: 'Map tools', mapFit: 'Fit map', mapLegend: 'Legend',
    mapAbout: 'About Atlas', mapToolTip: 'Secondary map actions',
    mapToolFitHint: 'Frame all visible territories',
    mapToolSettingsHint: 'Basemap and simplified geometries',
    mapToolLegendHint: 'Reference, administrative and statistical borders',
    mapToolExportHint: 'GeoJSON, CSV and map link',
    mapToolAboutHint: 'Sources, methodology and legal status',
    mapAppearance: 'Map appearance', legendShowAll: 'Show all levels',
    legendOnlyVisible: 'Show only visible boundaries', legendCurrentlyVisible: 'Currently visible',
    mapSwipeHint: 'Swipe down to close',
    cardIdentity: 'Identity', cardAdministration: 'Administrative & registry',
    cardStatistics: 'Statistical roles', cardHierarchy: 'Territorial hierarchy',
    cardCartography: 'Geometry & provenance', cardRecords: 'Original records',
    statVersion: 'Version', statParentCode: 'Statistical parent code',
    cardAdminRole: 'Administrative role', roleOsmGeometry: 'OSM administrative geometry',
    roleRegistryOnly: 'National-register role; no separate OSM boundary',
    roleRegistryParent: 'Register parent code', cardStatParent: 'Statistical parent',
    cardOpenParent: 'Open parent entity',
    cardChildren: 'Subterritories in this tree view', cardChildrenCount: 'subterritories',
    cardMoreChildren: 'Show next 12', cardOpenChild: 'Open child entity'
  },
  ro: {
    title: 'Atlas Teritorial', tagline: 'Geografie · Istorie · Comunități',
    tree: 'Arbore teritorial',
    search: 'Caută nume, ID OSM, coduri SIRUTA, CUATM sau NUTS',
    all: 'Toate', adminView: 'Administrativ', statView: 'Statistic',
    visible: 'Afișează geometria', details: 'Entitate', select: 'Selectează un teritoriu pe hartă sau în arbore.',
    searchResults: 'Rezultatele căutării', searchLimit: 'Sunt afișate primele 80 de rezultate. Rafinează căutarea pentru restul.',
    sourceNote: 'Geometrii din sursa originală; excepțiile OSMB documentate sunt păstrate.',
    basemap: 'Hartă de fundal', standard: 'Standard', grayscale: 'Tonuri de gri', dark: 'Întunecată', none: 'Fără fundal',
    simplified: 'Geometrii simplificate', home: 'Resetează încadrarea hărții',
    resetAll: 'Resetează selecțiile tuturor modulelor · România + Moldova',
    resetModule: 'Resetează selecțiile acestui modul',
    zoomIn: 'Mărește', zoomOut: 'Micșorează',
    official: 'Denumire oficială', osmId: 'ID OSM', adminLevel: 'Nivel administrativ OSM',
    statisticalRole: 'Coduri statistice', parentAdmin: 'Părinte administrativ', parentTree: 'Părinte în arbore',
    source: 'Sursă', registry: 'Registru oficial', origin: 'Țară',
    pmrCadastralCode: 'Cod cadastral PMR', pmrCadastralSource: 'Sursa codului cadastral PMR',
    pmrCadastralCaveat: 'Cod al unității cadastrale asociate reședinței administrative; nu este identificator KLADR PMR sau cod CUATM și nu dovedește că întregul contur OSMB coincide cu unitatea cadastrală.',
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
    mapLoading: 'Se încarcă geometriile hărții…', referenceOutline: 'Contururi de referință',
    referenceCountries: 'România, Moldova',
    mapToolMenu: 'Instrumente hartă', mapFit: 'Încadrare', mapLegend: 'Legendă',
    mapAbout: 'Despre Atlas', mapToolTip: 'Comenzi secundare ale hărții',
    mapToolFitHint: 'Încadrează toate teritoriile vizibile',
    mapToolSettingsHint: 'Fundal cartografic și geometrii simplificate',
    mapToolLegendHint: 'Limite de referință, administrative și statistice',
    mapToolExportHint: 'GeoJSON, CSV și linkul hărții',
    mapToolAboutHint: 'Surse, metodologie și statut juridic',
    mapAppearance: 'Aspectul hărții', legendShowAll: 'Arată toate nivelurile',
    legendOnlyVisible: 'Arată doar contururile vizibile', legendCurrentlyVisible: 'Vizibile acum',
    mapSwipeHint: 'Glisează în jos pentru închidere',
    cardIdentity: 'Identitate', cardAdministration: 'Administrativ și registru',
    cardStatistics: 'Roluri statistice', cardHierarchy: 'Ierarhie teritorială',
    cardCartography: 'Geometrie și proveniență', cardRecords: 'Înregistrări originale',
    statVersion: 'Versiune', statParentCode: 'Cod părinte statistic',
    cardAdminRole: 'Rol administrativ', roleOsmGeometry: 'Geometrie administrativă OSM',
    roleRegistryOnly: 'Rol din registrul național; fără contur OSM separat',
    roleRegistryParent: 'Cod părinte din registru', cardStatParent: 'Părinte statistic',
    cardOpenParent: 'Deschide entitatea părinte',
    cardChildren: 'Subunități în acest arbore', cardChildrenCount: 'subunități',
    cardMoreChildren: 'Afișează încă 12', cardOpenChild: 'Deschide subunitatea'
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
function createHierarchy(nodes: Territory[], view: TreeView, lang: Locale): Map<string, Territory[]> {
  const map = new Map<string, Territory[]>();
  for (const node of nodes) {
    if(view === 'administrative' && !node.roles.includes('administrative')) continue;
    if(view === 'statistical' && !node.statisticalRoles.length && !ROOT_IDS.includes(node.id as typeof ROOT_IDS[number])) continue;
    const parent = presentationParentId(node,view);
    if(!parent) continue;
    const arr=map.get(parent) || [];
    arr.push(node); map.set(parent, arr);
  }
  for(const [parentId,arr] of map)
    arr.sort((a,b)=>compareTreeSiblings(a,b,view,parentId,lang));
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

export default function App() {
  const mapEl = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const toolsOpenerRef = useRef<HTMLButtonElement>(null);
  const toolsDialogRef = useRef<HTMLElement>(null);
  const hadToolsOpenRef = useRef(false);
  const toolsSwipeStart=useRef<{x:number;y:number}|null>(null);
  const loadedRef = useRef<Map<string,TerritoryFeature>>(new Map());
  const [lang,setLang] = useState<Locale>(() => SHARED_STATE.lang || (localStorage.getItem('atlas-lang') === 'ro'?'ro':'en'));
  const [module,setModule] = useState<ModuleId>('administrative');
  const [modulePanelOpen,setModulePanelOpen] = useState(false);
  const [detailPanelOpen,setDetailPanelOpen] = useState(Boolean(SHARED_STATE.entity));
  const [catalog,setCatalog] = useState<Territory[]>([]);
  const [catalogError,setCatalogError] = useState<string | null>(null);
  const [selected,setSelected] = useState<string | null>(SHARED_STATE.entity);
  // A card selection belongs to the module that opened it. The only active
  // selection source in this release is Administrative.
  const [selectedModule,setSelectedModule] = useState<ModuleId|null>(
    SHARED_STATE.entity?'administrative':null);
  // Independent module geometry selections share one map without owning
  // each other's selections; the Administrative array retains persistence.
  const [moduleVisible,setModuleVisible] = useState(()=>makeModuleVisibility(restoreVisible()));
  const visible=moduleVisible.administrative;
  const setVisible=useCallback((update:SetStateAction<string[]>)=>{
    setModuleVisible(old=>setModuleGeometry(old,'administrative',
      typeof update==='function'?update(old.administrative):update));
  },[]);
  const [adminFilters,setAdminFilters] = useState<number[]>([]);
  const [statFilters,setStatFilters] = useState<string[]>([]);
  const [expanded,setExpanded] = useState<string[]>([]);
  const [search,setSearch] = useState('');
  const [treeView,setTreeView] = useState<TreeView>(SHARED_STATE.view || 'all');
  const [simplified,setSimplified] = useState<boolean>(()=>SHARED_STATE.simple ?? (localStorage.getItem('atlas-simple')==='true'));
  const [basemap,setBasemap] = useState<Basemap>(SHARED_STATE.basemap || 'standard');
  const [ready,setReady] = useState(false);
  const [rootsLoaded,setRootsLoaded] = useState(false);
  const [geomLoading,setGeomLoading] = useState(false);
  const [geomError,setGeomError] = useState(false);
  const [drawer,setDrawer] = useState<Drawer>(()=>
    SHARED_STATE.entity&&window.innerWidth<=700?'detail':null);
  const [toolsOpen,setToolsOpen] = useState(false);
  const [toolSection,setToolSection] = useState<MapToolSection>(null);
  const [legendShowAll,setLegendShowAll] = useState(false);
  const [exportScope,setExportScope] = useState<ExportScope>('visible');
  const [exportBusy,setExportBusy] = useState(false);
  const [exportProgress,setExportProgress] = useState('');
  const [shareNotice,setShareNotice] = useState('');
  const [shareFallback,setShareFallback] = useState('');
  const [navBusy,setNavBusy] = useState(false);
  const navigationEpoch = useRef(0);
  const lastDrawerRef = useRef<Drawer>(null);
  const pendingCardNavigationRef = useRef<string|null>(null);
  const pendingChildRevealRef = useRef<number|null>(null);
  // Progressive display keeps large administrative branches lightweight.
  const [cardChildrenPage,setCardChildrenPage] = useState<{id:string;count:number}|null>(null);

  const t=WORDS[lang];
  const mode:GeometryMode=simplified?'simplified':'detailed';
  const nodes = useMemo(()=>new Map(catalog.map(n=>[n.id,n])),[catalog]);
  const englishSiblingHints=useMemo(()=>englishSiblingQualifiers(catalog),[catalog]);
  const statisticalIndex = useMemo(()=>statisticalCodeIndex(catalog),[catalog]);
  // One visibility state shared by tree rows and filter level checkboxes.
  // Filter levels always span every certified territorial set.
  const osmLevelIndex = useMemo(()=>buildOsmLevelIndex(catalog),[catalog]);
  const allLevelScopes = useMemo(()=>osmLevelIndex.scopes.map(scope=>scope.id),[osmLevelIndex]);
  const levelOptions = useMemo(()=>
    availableOsmLevels(osmLevelIndex,allLevelScopes),[osmLevelIndex,allLevelScopes]);
  const statisticalLevelOptions = useMemo(()=>
    availableStatisticalLevels(osmLevelIndex,allLevelScopes),[osmLevelIndex,allLevelScopes]);
  const filterIds=useMemo(()=>matchingCombinedLevelIds(
    osmLevelIndex,allLevelScopes,adminFilters,statFilters),
    [osmLevelIndex,allLevelScopes,adminFilters,statFilters]);
  // Independent module selections render as a deduplicated geometry union.
  const mapVisible=useMemo(()=>displayedModuleGeometry(moduleVisible,filterIds),
    [moduleVisible,filterIds]);
  const mapVisibleSet=useMemo(()=>new Set(mapVisible),[mapVisible]);
  const rootStyles=useMemo(()=>new Map(ROOT_IDS.map(id=>([
    id,nodes.has(id)?styleForEntity(nodes.get(id)!,adminFilters,statFilters,true):REFERENCE_STYLE
  ] as const))),[nodes,adminFilters,statFilters]);
  // Contextual legend is derived from the styles of geometries actually visible
  // (tree checks union filter selections), never solely from checked filter boxes.
  const visibleStyleKeys=useMemo(()=>{
    const keys=new Set<string>();
    for(const id of mapVisible){
      const node=nodes.get(id);
      if(!node)continue;
      keys.add(styleForEntity(node,adminFilters,statFilters,ROOT_IDS.some(root=>root===id)).key);
    }
    return keys;
  },[mapVisible,nodes,adminFilters,statFilters]);
  const hierarchy = useMemo(()=>createHierarchy(catalog,treeView,lang),[catalog,treeView,lang]);
  const visibleSet = useMemo(()=>new Set(visible),[visible]);
  const expandedSet = useMemo(()=>new Set(expanded),[expanded]);
  const currentNode=selected?nodes.get(selected) || null:null;
  const cardRoles=currentNode?entityCardRoles(currentNode):null;
  // These are presentation-tree children for the ACTIVE tree view, never
  // mutations to the canonical administrative/legal parent identifiers.
  const cardChildren=currentNode?(hierarchy.get(currentNode.id)||[]):[];
  const cardChildrenShown=cardChildrenPage?.id===selected?cardChildrenPage.count:12;
  const breadcrumbs = useMemo(()=>{
    const path:Territory[]=[];
    let cursor=selected?nodes.get(selected):undefined;
    const visited=new Set<string>();
    while(cursor && !visited.has(cursor.id) && path.length<32){
      path.unshift(cursor);visited.add(cursor.id);
      const parent=presentationParentId(cursor,treeView);
      cursor=parent?nodes.get(parent):undefined;
    }
    return path;
  },[nodes,selected,treeView]);
  const siblings=useMemo(()=>{
    if(!currentNode)return [];
    const parent=presentationParentId(currentNode,treeView);
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
      setToolsOpen(false);
      setToolSection(null);
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
      if(toolsOpen){
        setToolsOpen(false);
        setToolSection(null);
      }else if(drawer){
        setDrawer(null);
        if(drawer==='tree')setModulePanelOpen(false);
        else setDetailPanelOpen(false);
      }else if(detailPanelOpen){
        // Focus the stable opener before unmounting the panel: no delayed race.
        document.querySelector<HTMLButtonElement>('.header-entity-action')?.focus();
        setDetailPanelOpen(false);
      }else if(modulePanelOpen){
        const opener=document.querySelector<HTMLButtonElement>('.module-rail button[aria-expanded=true]');
        opener?.focus();
        setModulePanelOpen(false);
      }else return;
      event.preventDefault();
    };
    window.addEventListener('keydown',onEscape);
    return ()=>window.removeEventListener('keydown',onEscape);
  },[toolsOpen,drawer,detailPanelOpen,modulePanelOpen]);

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

  // The global tools dialog has its own opener and focus lifecycle, separate
  // from the Administrative module and entity-detail drawers.
  useEffect(()=>{
    const wasOpen=hadToolsOpenRef.current;
    hadToolsOpenRef.current=toolsOpen;
    if(!toolsOpen){
      if(wasOpen)toolsOpenerRef.current?.focus();
      return;
    }
    const dialog=toolsDialogRef.current;
    dialog?.querySelector<HTMLButtonElement>('.atlas-tools-close')?.focus();
    const onTab=(event:KeyboardEvent)=>{
      if(event.key!=='Tab'||event.defaultPrevented||window.innerWidth>700||!dialog)return;
      const controls=Array.from(dialog.querySelectorAll<HTMLElement>(
        'button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'
      )).filter(el=>el.getClientRects().length>0);
      if(!controls.length)return;
      const first=controls[0],last=controls[controls.length-1],active=document.activeElement;
      if(event.shiftKey&&(active===first||!dialog.contains(active))){
        event.preventDefault();last.focus();
      }else if(!event.shiftKey&&(active===last||!dialog.contains(active))){
        event.preventDefault();first.focus();
      }
    };
    document.addEventListener('keydown',onTab);
    return ()=>document.removeEventListener('keydown',onTab);
  },[toolsOpen]);
  useEffect(()=>{localStorage.setItem('atlas-visible-phase4',JSON.stringify(visible));},[visible]);
  useEffect(()=>{
    if(catalog.length && selected && !nodes.has(selected))setSelected(null);
  },[catalog.length,nodes,selected]);
  useEffect(()=>{
    if(!catalog.length || !SHARED_STATE.entity || !nodes.has(SHARED_STATE.entity))return;
    const path:string[]=[];
    let cursor=nodes.get(SHARED_STATE.entity),depth=0;
    while(cursor && depth++<32){
      const parent=presentationParentId(cursor,treeView);
      if(!parent)break;
      path.push(parent);cursor=nodes.get(parent);
    }
    setExpanded(old=>[...new Set([...old,...path])]);
  },[catalog.length,nodes,treeView]);

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
      instance.addLayer({id:'country-fill',type:'fill',source:'borders',
        paint:{'fill-color':'#ffffff','fill-opacity':0},filter:['in',['get','id'],['literal',['ro','md']]]});
      instance.addLayer({id:'country-outline',type:'line',source:'borders',
        paint:{'line-color':REFERENCE_STYLE.color,'line-width':REFERENCE_STYLE.width},
        filter:['in',['get','id'],['literal',['ro','md']]]});
      instance.addLayer({id:'country-admin-outline',type:'line',source:'borders',
        paint:{'line-color':administrativeStyle(2).color,'line-width':administrativeStyle(2).width},
        filter:['in',['get','id'],['literal',[]]]});
      instance.addLayer({id:'country-stat-outline',type:'line',source:'borders',
        paint:{'line-color':statisticalStyle('NUTS_MOLDOVA',1).color,
          'line-width':statisticalStyle('NUTS_MOLDOVA',1).width,'line-dasharray':[3,2]},
        filter:['in',['get','id'],['literal',[]]]});
      instance.addLayer({id:'country-highlight',type:'line',source:'borders',paint:{'line-color':'#e6a636','line-width':3.8},filter:['==',['get','id'],'__none__']});
      instance.addSource('entities',{type:'geojson',data:EMPTY_FEATURES});
      instance.addLayer({id:'entity-fill',type:'fill',source:'entities',
        paint:{'fill-color':['get','atlasFill'],'fill-opacity':['get','atlasFillOpacity']}});
      instance.addLayer({id:'entity-outline',type:'line',source:'entities',
        filter:['!=',['get','atlasStyleKind'],'statistical'],
        paint:{'line-color':['get','atlasStroke'],'line-width':['get','atlasStrokeWidth'],'line-opacity':0.94}});
      instance.addLayer({id:'entity-stat-outline',type:'line',source:'entities',
        filter:['==',['get','atlasStyleKind'],'statistical'],
        paint:{'line-color':['get','atlasStroke'],'line-width':['get','atlasStrokeWidth'],
          'line-opacity':0.94,'line-dasharray':[3,2]}});
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
          setSelected(id);setSelectedModule('administrative');setDetailPanelOpen(true);
          if(window.innerWidth<=700){setModulePanelOpen(false);setDrawer('detail');}
          else if(window.innerWidth<1100)setModulePanelOpen(false);
        }
      });
      for(const boundaryLayer of ['entity-outline','entity-stat-outline'])
        instance.on('click',boundaryLayer,event=>{
        const id=event.features?.[0]?.properties?.atlasId;
        if(typeof id==='string'){
          setSelected(id);setSelectedModule('administrative');setDetailPanelOpen(true);
          if(window.innerWidth<=700){setModulePanelOpen(false);setDrawer('detail');}
          else if(window.innerWidth<1100)setModulePanelOpen(false);
        }
      });
      instance.on('click','country-fill',event=>{
        const country=event.features?.[0]?.properties?.id;
        if(country==='ro'||country==='md'){
          setSelected(country==='ro'?'osm-r90689':'osm-r58974');
          setSelectedModule('administrative');setDetailPanelOpen(true);
          if(window.innerWidth<=700){setModulePanelOpen(false);setDrawer('detail');}
          else if(window.innerWidth<1100)setModulePanelOpen(false);
        }
      });
      for(const layer of ['country-fill','entity-fill','entity-outline','entity-stat-outline']) {
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
    const groups={reference:[] as string[],administrative:[] as string[],statistical:[] as string[]};
    for(const id of ROOT_IDS){
      if(!mapVisibleSet.has(id))continue;
      const kind=rootStyles.get(id)?.kind ?? 'reference';
      groups[kind].push(featureCountryCode(id));
    }
    const byCountry=(codes:string[]):maplibregl.FilterSpecification=>
      ['in',['get','id'],['literal',codes]];
    map.setFilter('country-fill',byCountry(ROOT_IDS.filter(id=>mapVisibleSet.has(id)).map(featureCountryCode)));
    map.setFilter('country-outline',byCountry(groups.reference));
    map.setFilter('country-admin-outline',byCountry(groups.administrative));
    map.setFilter('country-stat-outline',byCountry(groups.statistical));
    const colors=ROOT_IDS.map(id=>rootStyles.get(id)?.fill||REFERENCE_STYLE.fill);
    const opacity=ROOT_IDS.map(id=>rootStyles.get(id)?.opacity??0);
    map.setPaintProperty('country-fill','fill-color',
      ['match',['get','id'],'ro',colors[0],'md',colors[1],'#ffffff']);
    map.setPaintProperty('country-fill','fill-opacity',
      ['match',['get','id'],'ro',opacity[0],'md',opacity[1],0]);
  },[mapVisibleSet,rootStyles,ready]);
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
    const ids=mapVisible.filter(id=>nodes.has(id) && !ROOT_IDS.includes(id as typeof ROOT_IDS[number]));
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
      const displayed=asDisplayFeatures(ids,nodes,features);
      for(const feature of displayed.features){
        const node=nodes.get(String(feature.properties?.atlasId));
        if(!node)continue;
        const chart=styleForEntity(node,adminFilters,statFilters);
        feature.properties={...feature.properties,atlasStroke:chart.color,atlasFill:chart.fill,
          atlasFillOpacity:chart.opacity,atlasStrokeWidth:chart.width,atlasStyleKind:chart.kind};
      }
      source?.setData(displayed);
      setGeomLoading(false);
    }).catch(()=>{if(active){setGeomLoading(false);setGeomError(true);}});
    return ()=>{active=false;};
  },[catalog.length,mode,nodes,ready,mapVisible,adminFilters,statFilters]);

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
    setToolsOpen(false);
    setToolSection(null);
    setSelected(id);setSelectedModule('administrative');setDetailPanelOpen(true);
    if(window.innerWidth<=700){setModulePanelOpen(false);setDrawer('detail');}
    else if(window.innerWidth<1100)setModulePanelOpen(false);
  },[]);
  function chooseRelated(id:string){
    // Only card-internal navigation moves focus to a new card's heading.
    pendingCardNavigationRef.current=id;
    choose(id); // Never toggles visibility or moves the camera.
  }
  useEffect(()=>{
    if(!selected||pendingCardNavigationRef.current!==selected)return;
    const panel=document.querySelector<HTMLElement>(
      window.innerWidth<=700?'.drawer-detail':'.detail-sidebar');
    const heading=panel?.querySelector<HTMLHeadingElement>('.entity-title h3');
    if(!heading)return;
    pendingCardNavigationRef.current=null;
    panel?.scrollTo({top:0,behavior:'auto'});
    heading.focus({preventScroll:true});
  },[selected,drawer,detailPanelOpen]);
  useEffect(()=>{
    const index=pendingChildRevealRef.current;
    if(index===null)return;
    const panel=document.querySelector<HTMLElement>(
      window.innerWidth<=700?'.drawer-detail':'.detail-sidebar');
    const first=panel?.querySelector<HTMLButtonElement>(
      '.entity-child-link[data-child-index="'+index+'"]');
    if(!first)return;
    pendingChildRevealRef.current=null;
    first.focus();
  },[cardChildrenPage,selected,drawer,detailPanelOpen]);
  function toggleModulePanel(id:ModuleId){
    setToolsOpen(false);
    setToolSection(null);
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
  function closeTools(){
    setToolsOpen(false);
    setToolSection(null);
    setLegendShowAll(false);
    toolsSwipeStart.current=null;
  }
  function toggleTools(){
    if(toolsOpen){closeTools();return;}
    setModulePanelOpen(false);
    setDetailPanelOpen(false);
    setDrawer(null);
    setToolSection(null);
    setToolsOpen(true);
  }
  function toggleToolSection(section:Exclude<MapToolSection,null>){
    setToolSection(previous=>previous===section?null:section);
    if(section==='legend')setLegendShowAll(false);
    setExportProgress('');
  }
  function startToolsSwipe(event:React.TouchEvent<HTMLElement>){
    if(window.innerWidth>700||event.touches.length!==1){
      toolsSwipeStart.current=null;return;
    }
    const element=event.target;
    if(element instanceof Element&&element.closest('button,input,select,label,a')){
      toolsSwipeStart.current=null;return;
    }
    if((toolsDialogRef.current?.scrollTop||0)>0){
      toolsSwipeStart.current=null;return;
    }
    const touch=event.touches[0];
    toolsSwipeStart.current={x:touch.clientX,y:touch.clientY};
  }
  function finishToolsSwipe(event:React.TouchEvent<HTMLElement>){
    const start=toolsSwipeStart.current;
    toolsSwipeStart.current=null;
    if(!start||window.innerWidth>700||event.changedTouches.length!==1)return;
    const touch=event.changedTouches[0];
    const dx=touch.clientX-start.x,dy=touch.clientY-start.y;
    if(dy>85&&Math.abs(dx)<Math.abs(dy)*0.6&&
      (toolsDialogRef.current?.scrollTop||0)===0)closeTools();
  }
  function closeDetailPanel(){
    // The opener is stable and already mounted: focus it synchronously.
    // A deferred animation-frame callback can steal focus from a newly
    // opened global-tools dialog during rapid panel transitions.
    if(drawer!=='detail')
      document.querySelector<HTMLButtonElement>('.header-entity-action')?.focus();
    setDetailPanelOpen(false);
    if(drawer==='detail')setDrawer(null);
  }
  // Home moves only the camera; a local reset never touches the camera or
  // selections owned by another module. The global reset restores RO + MD.
  const reset=()=>mapRef.current?.fitBounds(BOUNDS,{padding:45,duration:650});
  const localSelectionActive=moduleHasSelections(moduleVisible,module,DEFAULT_VISIBLE,
    adminFilters,statFilters,selected,selectedModule);
  function resetLocalModule(id:ModuleId){
    if(!moduleHasSelections(moduleVisible,id,DEFAULT_VISIBLE,
      adminFilters,statFilters,selected,selectedModule))return;
    // The reset control becomes disabled when complete; move focus to its
    // stable, visible neighbour before React applies the update.
    const toolbar=window.innerWidth<=700?'.drawer-tree .drawer-toolbar':'.tree-sidebar .pane-toolbar';
    document.querySelector<HTMLButtonElement>(toolbar+' .module-pane-close')?.focus();
    setModuleVisible(old=>resetModuleGeometry(old,id,DEFAULT_VISIBLE));
    if(id==='administrative'){
      setAdminFilters([]);
      setStatFilters([]);
    }
    if(selectedModule===id){
      setSelected(null);
      setSelectedModule(null);
      setDetailPanelOpen(false);
      if(drawer==='detail')setDrawer(null);
      // Local reset clears only the selected entity URL parameter;
      // unlike the global reset, it preserves any camera permalink.
      const url=new URL(window.location.href);
      url.searchParams.delete('entity');
      window.history.replaceState(window.history.state,'',url.toString());
    }
  }
  const resetAllSelections=()=>{
    navigationEpoch.current++; // Cancel stale asynchronous camera movements.
    setNavBusy(false);
    setModuleVisible(makeModuleVisibility(DEFAULT_VISIBLE));
    setAdminFilters([]);
    setStatFilters([]);
    setSelected(null);
    setSelectedModule(null);
    setDetailPanelOpen(false);
    setExpanded([]);
    setSearch('');
    setDrawer(null);
    setModulePanelOpen(false);
    setToolSection(null);
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
    for(const id of mapVisible){
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
    const ids=idsForScope(scope,selected,mapVisible,new Set(nodes.keys()));
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
      const parent=presentationParentId(cursor,treeView);
      if(!parent)break;
      ancestry.push(parent);cursor=nodes.get(parent);
    }
    setExpanded(old=>[...new Set([...old,...ancestry])]);
  }

  const treeItem=(node:Territory,depth:number,searchMatch=false):React.ReactNode=>{
    const childNodes=hierarchy.get(node.id)||[];
    const isExpanded=expandedSet.has(node.id);
    const isChecked=visibleSet.has(node.id);
    const isChisinauCity=node.id==='osm-r1748490';
    const rowLabel=isChisinauCity&&searchMatch
      ?(lang==='ro'?'Orașul Chișinău':'City of Chisinau')
      :labelOf(node,lang);
    // Two separate UATSN ADM8 polygons share the Romanian name Hlinaia.
    // Keep the geographical label identical; disambiguate only in UI metadata.
    const eastHlinaiaCode=lang==='ro'&&
      (node.id==='osm-r9301463'||node.id==='osm-r8291058')
      ?node.registry?.code:null;
    const enHint=lang==='en'?englishSiblingHints.get(node.id)||null:null;
    const baseAccessibleRowLabel=isChisinauCity
      ?(lang==='ro'?'Orașul Chișinău':'City of Chisinau')
      :eastHlinaiaCode?rowLabel+' (CUATM '+eastHlinaiaCode+')':rowLabel;
    const accessibleRowLabel=enHint?baseAccessibleRowLabel+' ('+enHint+')':baseAccessibleRowLabel;
    const stat=node.statisticalRoles.length>0;
    // SIM-R3: one-to-one local coat/flag only; no propagation to siblings or parents.
    const approvedTreeSymbols=officialSymbolsForEntity(node);
    const editorialTreeSymbols=approvedTreeSymbols?null:editorialSymbolsForEntity(node);
    const treeSymbols=approvedTreeSymbols||editorialTreeSymbols;
    const approvedTreeFile=approvedTreeSymbols?.coat||approvedTreeSymbols?.flag;
    const treeSymbolSrc=approvedTreeFile?import.meta.env.BASE_URL+'symbols/'+approvedTreeFile:
      symbolAssetUrl(editorialTreeSymbols?.coat||editorialTreeSymbols?.flag);
    return <div className="territory-branch" key={node.id} role={searchMatch?'none':'none'}>
      <div className={'tree-line'+(selected===node.id?' is-selected':'')} role="treeitem"
           aria-level={searchMatch?1:depth+1} aria-selected={selected===node.id}
           aria-expanded={!searchMatch&&childNodes.length?isExpanded:undefined}
           style={{paddingLeft: Math.min(depth,7)*14+3}}>
        {childNodes.length&&!searchMatch?
          <button className="expand-button" aria-label={(isExpanded?t.collapse:t.expand)+' '+accessibleRowLabel}
            onClick={()=>setExpanded(old=>isExpanded?old.filter(id=>id!==node.id):[...old,node.id])}>
            {isExpanded?'⌄':'›'}</button>:
          <span className="tree-spacer" aria-hidden="true">·</span>}
        <input type="checkbox" checked={isChecked} aria-label={t.visible+': '+accessibleRowLabel}
          onChange={()=>toggleVisible(node.id)} />
        <button className="tree-label" aria-label={accessibleRowLabel} title={lang==='ro'?node.officialName:accessibleRowLabel}
          onClick={()=>searchMatch?chooseSearch(node.id):choose(node.id)}>
          <span className="tree-label-heading">
            {treeSymbols&&<TerritorialSymbolImage key={node.id+'-'+(treeSymbolSrc||'empty')}
              src={treeSymbolSrc} alt="" className="tree-territorial-symbol" />}
            <span className="node-name">{rowLabel}</span>
          </span>
          <span className={'node-level'+(stat?' is-stat':'')} title={municipalRoleClarification(node,lang)||undefined}>{roleLabel(node)}{eastHlinaiaCode?' · CUATM '+eastHlinaiaCode:''}</span>
          {enHint&&<span className="node-disambiguation">{enHint}</span>}
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
              const chart=administrativeStyle(option.level);
              return <label key={'adm-'+option.level} data-level-kind="administrative"
                data-line-color={chart.color}>
                <input type="checkbox" checked={adminFilters.includes(option.level)}
                  aria-label={'OSM '+option.level}
                  onChange={event=>setAdminFilters(old=>event.target.checked?
                    [...new Set([...old,option.level])]:old.filter(x=>x!==option.level))}/>
                <span style={{color:chart.color}}>ADM {option.level}</span>
                <small>{option.count.toLocaleString(lang==='ro'?'ro-RO':'en-US')}</small>
              </label>;
            })}
          </fieldset>
          <fieldset className="osm-level-choices" data-column="statistical">
            <legend>{t.statView}</legend>
            {statisticalLevelOptions.map(option=>{
              const chart=statisticalStyle(option.classification,option.level);
              return <label key={option.key} data-level-kind="statistical" data-line-color={chart.color}>
                <input type="checkbox" checked={statFilters.includes(option.key)}
                  aria-label={(option.classification==='NUTS_MOLDOVA'?'NTS':option.classification)+' '+option.level}
                  onChange={event=>setStatFilters(old=>event.target.checked?
                    [...new Set([...old,option.key])]:old.filter(x=>x!==option.key))}/>
                <span style={{color:chart.color}}>{chart.key}</span>
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
    <div className="tree-footnote"><strong>{catalog.length.toLocaleString(lang==='ro'?'ro-RO':'en-US')} {t.entityCount}</strong>
      <span> · {mapVisible.length.toLocaleString(lang==='ro'?'ro-RO':'en-US')} {t.selectedCount}</span>
    </div>
  </section>;

  // WEB-R4.0: state/callbacks stay in App; the sections are reusable view-only cards.
  // A new entity key resets expanded source records, never map selection/visibility.
  // Presentation-only flag; the certified MD identity of Pridnestrovie remains unchanged.
  const currentFlag=currentNode?flagFileForEntity(currentNode):null;
  // Exact-ID symbols, only if the act, representation, and owner were reviewed.
  const officialSymbols=currentNode?officialSymbolsForEntity(currentNode):null;
  const editorialSymbols=currentNode&&!officialSymbols?editorialSymbolsForEntity(currentNode):null;
  const editorialPreferred=editorialSymbols?.coat||editorialSymbols?.flag;
  const primarySymbolPath=officialSymbols?.coat
    ?'symbols/'+officialSymbols.coat:currentFlag?'flags/'+currentFlag:null;
  const details=<section className="detail-content">
    {currentNode?<div className="entity-card" key={currentNode.id}>
      <header className="entity-title">
        <span className={'flag'+(officialSymbols?.coat||editorialSymbols?.coat?' flag--coat':'')} aria-hidden="true">
          {editorialSymbols?
            <TerritorialSymbolImage key={currentNode.id} className="territorial-symbol-header"
              src={symbolAssetUrl(editorialPreferred)} alt="" loading="eager" />:
            primarySymbolPath&&<img src={import.meta.env.BASE_URL+primarySymbolPath}
              alt="" loading="eager" decoding="async" />}
        </span>
        <div><h3 tabIndex={-1}>{cardNameOf(currentNode,lang)}</h3><small>{roleLabel(currentNode)}</small></div>
      </header>
      {breadcrumbs.length>0&&<nav className="entity-breadcrumbs" aria-label={t.path}>
        {breadcrumbs.map((crumb,index)=><span className="breadcrumb-part" key={crumb.id}>
          {index>0&&<span aria-hidden="true">›</span>}
          <button type="button" aria-current={crumb.id===currentNode.id?'location':undefined}
            onClick={()=>chooseRelated(crumb.id)}>{cardNameOf(crumb,lang)}</button>
        </span>)}
      </nav>}
      <div className="sibling-navigation">
        <button type="button" disabled={siblingIndex<=0}
          onClick={()=>{const n=siblings[siblingIndex-1];if(n)chooseRelated(n.id);}}>‹ {t.previous}</button>
        <button type="button" disabled={siblingIndex<0||siblingIndex>=siblings.length-1}
          onClick={()=>{const n=siblings[siblingIndex+1];if(n)chooseRelated(n.id);}}>{t.next} ›</button>
      </div>
      <div className="entity-actions">
        <button type="button" onClick={()=>toggleVisible(currentNode.id)}>{visibleSet.has(currentNode.id)?t.hide:t.view}</button>
        <button type="button" className="secondary" onClick={()=>void locate(currentNode.id)}>{t.locate}</button>
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
      <EntityCardSection title={t.cardIdentity} kind="identity">
        <dl className="metadata">
          <dt>{t.official}</dt><dd>{currentNode.officialName}</dd>
          <dt>{t.country}</dt><dd>{currentNode.country==='RO'?(lang==='ro'?'România':'Romania'):
            (lang==='ro'?'Republica Moldova':'Republic of Moldova')}</dd>
        </dl>
        {territorialContextNote(currentNode,lang)&&
          <p className="source-caveat">{territorialContextNote(currentNode,lang)}</p>}
      </EntityCardSection>
      {officialSymbols&&
      <EntityCardSection
        title={lang==='ro'?'Simboluri teritoriale':'Territorial symbols'} kind="symbols">
        <div className="territory-symbol-gallery">
          {officialSymbols.coat&&<figure>
            <img src={import.meta.env.BASE_URL+'symbols/'+officialSymbols.coat}
              alt={lang==='ro'?'Stema '+officialSymbols.holder.ro:
                'Coat of arms of '+officialSymbols.holder.en} loading="lazy" />
            <figcaption>{lang==='ro'?'Stemă':'Coat of arms'}</figcaption>
          </figure>}
          {officialSymbols.flag&&<figure>
            <img src={import.meta.env.BASE_URL+'symbols/'+officialSymbols.flag}
              alt={lang==='ro'?'Drapelul '+officialSymbols.holder.ro:
                'Flag of '+officialSymbols.holder.en} loading="lazy" />
            <figcaption>{lang==='ro'?'Drapel':'Flag'}</figcaption>
          </figure>}
        </div>
        <p className="territory-symbol-owner">
          <strong>{lang==='ro'?'Deținător: ':'Holder: '}</strong>
          {officialSymbols.holder[lang]}
        </p>
        <p className="territory-symbol-evidence">{officialSymbols.legal[lang]}</p>
        <a className="territory-symbol-source" href={officialSymbols.legalUrl}
           target="_blank" rel="noopener noreferrer">
          {lang==='ro'?'Actul și sursa oficială':'Official act and source'} ↗
        </a>
        <p className="territory-symbol-disclaimer">
          {lang==='ro'
            ?'Reproducere strict informativă; simbolul nu este sigla atlasului.'
            :'Informational reproduction only; this symbol is not the Atlas logo.'}
        </p>
      </EntityCardSection>}
      {editorialSymbols&&
      <EntityCardSection
        title={lang==='ro'?'Simboluri teritoriale':'Territorial symbols'} kind="symbols">
        <div className="territory-symbol-gallery territory-symbol-gallery--editorial">
          {(['coat','flag'] as const).map(kind=>{
            const asset=editorialSymbols[kind];
            const label=kind==='coat'?(lang==='ro'?'Stemă':'Coat of arms'):(lang==='ro'?'Drapel':'Flag');
            const source=symbolSourceUrl(asset);
            return <figure key={kind}>
              <div className="territory-symbol-frame">
                <TerritorialSymbolImage key={currentNode.id+kind} className="territory-symbol-media"
                  src={symbolAssetUrl(asset)} alt={asset?label+' · '+editorialSymbols.name:label+' — '+(lang==='ro'?'indisponibil':'unavailable')} />
              </div>
              <figcaption>{label}</figcaption>
              {source&&<a className="territory-symbol-source" href={source}
                target="_blank" rel="noopener noreferrer">
                {asset?.tier==='A'?(lang==='ro'?'Sursa instituțională':'Institutional source'):
                  (lang==='ro'?'Sursa și licența':'Source and license')} ↗
              </a>}
            </figure>;
          })}
        </div>
        {editorialSymbols.reference&&<a className="territory-symbol-source"
          href={editorialSymbols.reference} target="_blank" rel="noopener noreferrer">
          {lang==='ro'?'Document de referință':'Reference document'} ↗
        </a>}
        {editorialSymbols.note&&<p className="territory-symbol-evidence">{editorialSymbols.note[lang]}</p>}
        <p className="territory-symbol-disclaimer">
          {lang==='ro'
            ?'Reproduceri ilustrative, atribuite exclusiv acestei entități. Nivelul B indică o imagine documentată, nu un desen-etalon certificat. Imaginile indisponibile au substitut neutru.'
            :'Illustrative reproductions linked only to this entity. Tier B means documented imagery, not a certified official master. Missing images show a neutral placeholder.'}
        </p>
      </EntityCardSection>}
      {(cardRoles?.administrative.length||currentNode.registry||
        pmrCadastralSeatCode(currentNode.id))&&
      <EntityCardSection title={t.cardAdministration} kind="administrative">
        {cardRoles&&cardRoles.administrative.length>0&&
          <ul className="entity-admin-roles" aria-label={t.cardAdminRole}>
            {cardRoles.administrative.map((role,index)=>
              <li key={role.basis+'-'+index}>
                <div className="entity-admin-role-primary">
                  <strong>{role.label||t.noCode}</strong>
                  <small>{role.isOsmBoundary?t.roleOsmGeometry:t.roleRegistryOnly}</small>
                </div>
                {role.registryCode&&<span>{t.registry}: {role.registrySystem} {role.registryCode}</span>}
                {role.parentRegistryCode&&
                  <span>{t.roleRegistryParent}: {role.parentRegistryCode}</span>}
              </li>)}
          </ul>}
        <dl className="metadata">
          {pmrCadastralSeatCode(currentNode.id)&&<>
            <dt>{t.pmrCadastralCode}</dt><dd>{pmrCadastralSeatCode(currentNode.id)}</dd>
            <dt>{t.pmrCadastralSource}</dt><dd>
              <a href={PMR_CADASTRAL_SOURCE.url} target="_blank" rel="noreferrer">
                {lang==='ro'?'Ordinul nr. 361/2015, anexa 2':'Order 361/2015, Annex 2'} ↗
              </a>
            </dd>
          </>}
        </dl>
        {municipalRoleClarification(currentNode,lang)&&
          <p className="source-caveat">{municipalRoleClarification(currentNode,lang)}</p>}
        {pmrCadastralSeatCode(currentNode.id)&&
          <p className="source-caveat">{t.pmrCadastralCaveat}</p>}
        {currentNode.registryIdentityReviewStatus&&
          <p className="source-caveat">{t.relationshipNote}</p>}
      </EntityCardSection>}
      {cardRoles&&cardRoles.statistical.length>0&&
      <EntityCardSection title={t.cardStatistics} kind="statistical">
        <ul className="entity-statistical-roles" aria-label={t.statisticalRole}>
          {cardRoles.statistical.map((role,index)=>
            <li key={role.classification+'-'+role.code+'-'+index}>
              <div className="entity-statistical-primary">
                <strong>{role.label}</strong>
                <span>{role.code}</span>
              </div>
              <small>{t.statVersion}: {role.version}</small>
              {role.parentCode&&<small>{t.statParentCode}: {role.parentCode}</small>}
            </li>)}
        </ul>
      </EntityCardSection>}
      {(currentNode.administrativeParentId||currentNode.treeParentId||
        cardRoles?.statistical.some(role=>verifiedStatisticalParent(statisticalIndex,role)))&&
      <EntityCardSection title={t.cardHierarchy} kind="hierarchy">
        <dl className="metadata">
          {currentNode.administrativeParentId&&<>
            <dt>{t.parentAdmin}</dt>
            <dd>{nodes.get(currentNode.administrativeParentId)?
              <button type="button" className="entity-parent-link"
                aria-label={t.cardOpenParent+': '+cardNameOf(nodes.get(currentNode.administrativeParentId)!,lang)}
                onClick={()=>chooseRelated(currentNode.administrativeParentId!)}>
                {cardNameOf(nodes.get(currentNode.administrativeParentId)!,lang)}
              </button>:null}</dd>
          </>}
          {currentNode.treeParentId&&<>
            <dt>{t.parentTree}</dt>
            <dd>{nodes.get(currentNode.treeParentId)?
              <button type="button" className="entity-parent-link"
                aria-label={t.cardOpenParent+': '+cardNameOf(nodes.get(currentNode.treeParentId)!,lang)}
                onClick={()=>chooseRelated(currentNode.treeParentId!)}>
                {cardNameOf(nodes.get(currentNode.treeParentId)!,lang)}
              </button>:null}</dd>
          </>}
          {cardRoles?.statistical.map(role=>{
            const parent=verifiedStatisticalParent(statisticalIndex,role);
            return parent?<div className="entity-hierarchy-stat" key={role.classification+'-'+role.code}>
              <dt>{t.cardStatParent} ({role.parentCode})</dt>
              <dd><button type="button" className="entity-parent-link"
                aria-label={t.cardOpenParent+': '+cardNameOf(parent,lang)}
                onClick={()=>chooseRelated(parent.id)}>{cardNameOf(parent,lang)}</button></dd>
            </div>:null;
          })}
        </dl>
      </EntityCardSection>}
      {cardChildren.length>0&&
      <EntityCardSection title={t.cardChildren+' ('+cardChildren.length+')'} kind="children">
        <ul className="entity-child-list" aria-label={t.cardChildren}>
          {cardChildren.slice(0,cardChildrenShown).map((child,index)=>
            <li key={child.id}>
              <button type="button" className="entity-child-link"
                data-child-index={index}
                aria-label={t.cardOpenChild+': '+cardNameOf(child,lang)}
                onClick={()=>chooseRelated(child.id)}>
                <span>{cardNameOf(child,lang)}</span>
                <small>{roleLabel(child)}</small>
              </button>
            </li>)}
        </ul>
        {cardChildren.length>cardChildrenShown&&
          <button type="button" className="entity-children-more"
            onClick={()=>{pendingChildRevealRef.current=cardChildrenShown;
              setCardChildrenPage({id:currentNode.id,count:cardChildrenShown+12});}}>
            {t.cardMoreChildren} · {Math.min(cardChildrenShown,cardChildren.length)} / {cardChildren.length}
          </button>}
      </EntityCardSection>}
      <EntityCardSection title={t.cardCartography} kind="cartographic">
        <dl className="metadata">
          <dt>{t.adminLevel}</dt>
          <dd>{currentNode.adminLevel===null?'':currentNode.adminLevel}</dd>
          <dt>{t.osmId}</dt><dd>{currentNode.osmRelationId!==null?
            <a href={'https://www.openstreetmap.org/relation/'+currentNode.osmRelationId}
              target="_blank" rel="noreferrer">{currentNode.osmRelationId} ↗</a>:null}</dd>
          <dt>{t.source}</dt><dd>{t.sourceBoundary}</dd>
          <dt>{t.original}</dt><dd>2026-10-05</dd>
        </dl>
        <p className="note">{t.detailNote}</p>
      </EntityCardSection>
      <EntityCardSection title={t.cardRecords} kind="records" collapsible>
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
      </EntityCardSection>
    </div>:<div className="empty-detail"><span>◇</span><h3>{t.selectEntity}</h3><p>{t.select}</p></div>}
  </section>;

  // WEB-R3.5: three top-level actions, with a contextual legend and a small
  // secondary About link. On mobile the dialog is an adaptive bottom sheet.
  const globalTools=<div className="atlas-tools-overlay" onClick={closeTools}>
    <section id="atlas-global-tools" ref={toolsDialogRef} className="atlas-global-tools-panel" role="dialog"
      aria-label={t.mapToolMenu} aria-modal={window.innerWidth<=700?'true':undefined}
      onTouchStart={startToolsSwipe} onTouchEnd={finishToolsSwipe}
      onClick={e=>e.stopPropagation()}>
      <div className="atlas-tools-grab" aria-hidden="true"><span/></div>
      <div className="atlas-tools-heading">
        <h2>{t.mapToolMenu}</h2>
        <button type="button" className="atlas-tools-close" aria-label={t.close}
          onClick={closeTools}>×</button>
      </div>
      <div className="atlas-tools-list">
        <div className="atlas-tools-item atlas-map-settings">
          <button type="button" className="atlas-tools-entry" aria-expanded={toolSection==='settings'}
            aria-controls="atlas-section-settings" onClick={()=>toggleToolSection('settings')}>
            <span className="atlas-tools-icon" aria-hidden="true">⚙</span>
            <span className="atlas-tools-entry-copy"><strong>{t.mapAppearance}</strong>
              <small>{t.mapToolSettingsHint} · {t.mapToolFitHint}</small></span>
            <span aria-hidden="true">{toolSection==='settings'?'⌄':'›'}</span>
          </button>
          {toolSection==='settings'&&<div id="atlas-section-settings" className="atlas-tools-content">
            <label className="basemap-select"><span aria-hidden="true">▧</span>
              <span className="control-caption">{t.basemap}</span>
              <select value={basemap} onChange={e=>setBasemap(e.target.value as Basemap)}
                aria-label={t.basemap}>
                {(['standard','grayscale','dark','none'] as Basemap[]).map(key=>
                  <option key={key} value={key}>{t[key]}</option>)}
              </select>
            </label>
            <label className="simplify-control">
              <input type="checkbox" checked={simplified} onChange={e=>setSimplified(e.target.checked)}/>
              <span className="toggle-track"/><span className="control-caption">{t.simplified}</span>
            </label>
            <button type="button" className="atlas-tools-fit-button" disabled={!mapVisible.length||navBusy}
              onClick={()=>{closeTools();void fitVisible();}}>
              <span aria-hidden="true">⤢</span> {navBusy?t.navigationLoading:t.fitVisible}
            </button>
          </div>}
        </div>
        <div className="atlas-tools-item atlas-tools-legend">
          <button type="button" className="atlas-tools-entry" aria-expanded={toolSection==='legend'}
            aria-controls="atlas-section-legend" onClick={()=>toggleToolSection('legend')}>
            <span className="atlas-tools-icon" aria-hidden="true">☷</span>
            <span className="atlas-tools-entry-copy"><strong>{t.mapLegend}</strong>
              <small>{t.mapToolLegendHint}</small></span>
            <span aria-hidden="true">{toolSection==='legend'?'⌄':'›'}</span>
          </button>
          {toolSection==='legend'&&<div id="atlas-section-legend" className="atlas-tools-content">
            <div className="atlas-legend-toolbar">
              <span>{legendShowAll?t.dataRole:t.legendCurrentlyVisible}</span>
              <button type="button" className="atlas-legend-expand" aria-expanded={legendShowAll}
                onClick={()=>setLegendShowAll(old=>!old)}>
                {legendShowAll?t.legendOnlyVisible:t.legendShowAll}
              </button>
            </div>
            <div className="map-legend" aria-label={t.dataRole}>
              {(legendShowAll||visibleStyleKeys.has('reference'))&&<div className="legend-section">
                <strong>{t.referenceOutline}</strong>
                <div className="legend-row" data-style-key="reference">
                  <span className="legend-line" style={{borderTopColor:REFERENCE_STYLE.color,
                    borderTopWidth:REFERENCE_STYLE.width}}/>
                  <span>{t.referenceCountries}</span>
                </div>
              </div>}
              {(legendShowAll||levelOptions.some(option=>visibleStyleKeys.has('ADM '+option.level)))&&
                <div className="legend-section">
                <strong>{t.adminView}</strong>
                {levelOptions.filter(option=>legendShowAll||visibleStyleKeys.has('ADM '+option.level)).map(option=>{
                  const chart=administrativeStyle(option.level);
                  return <div className="legend-row" key={chart.key} data-style-key={chart.key}>
                    <span className="legend-line" style={{borderTopColor:chart.color,borderTopWidth:chart.width}}/>
                    <span>{chart.key}</span>
                  </div>;
                })}
              </div>}
              {(legendShowAll||statisticalLevelOptions.some(option=>visibleStyleKeys.has(
                (option.classification==='NUTS_MOLDOVA'?'NTS':'NUTS')+' '+option.level)))&&
                <div className="legend-section">
                <strong>{t.statView}</strong>
                {statisticalLevelOptions.filter(option=>legendShowAll||visibleStyleKeys.has(
                  (option.classification==='NUTS_MOLDOVA'?'NTS':'NUTS')+' '+option.level)).map(option=>{
                  const chart=statisticalStyle(option.classification,option.level);
                  return <div className="legend-row" key={chart.key} data-style-key={chart.key}>
                    <span className="legend-line is-statistical" style={{
                      borderTopColor:chart.color,borderTopWidth:chart.width}}/>
                    <span>{chart.key}</span>
                  </div>;
                })}
              </div>}
            </div>
          </div>}
        </div>
        <div className="atlas-tools-item atlas-tools-export">
          <button type="button" className="atlas-tools-entry" aria-expanded={toolSection==='export'}
            aria-controls="phase5-export-panel" onClick={()=>toggleToolSection('export')}>
            <span className="atlas-tools-icon" aria-hidden="true">⇧</span>
            <span className="atlas-tools-entry-copy"><strong>{t.exportAction}</strong>
              <small>{t.mapToolExportHint}</small></span>
            <span aria-hidden="true">{toolSection==='export'?'⌄':'›'}</span>
          </button>
          {toolSection==='export'&&<section id="phase5-export-panel" className="export-panel atlas-tools-content"
            aria-label={t.exportTitle}>
            <label className="export-scope">{t.exportScope}
              <select value={exportScope} onChange={e=>setExportScope(e.target.value as ExportScope)}>
                <option value="visible">{t.exportVisible} ({mapVisible.filter(id=>nodes.has(id)).length})</option>
                <option value="selected" disabled={!currentNode}>{t.exportSelected}</option>
              </select>
            </label>
            <div className="export-buttons">
              <button type="button" disabled={exportBusy||!idsForScope(exportScope,selected,mapVisible,new Set(nodes.keys())).length}
                onClick={()=>void performExport('geojson')}>{t.exportGeoJSON}</button>
              <button type="button" disabled={exportBusy||!idsForScope(exportScope,selected,mapVisible,new Set(nodes.keys())).length}
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
        </div>
      </div>
      <div className="atlas-tools-footer">
        <button type="button" className="atlas-tools-about-link" aria-expanded={toolSection==='about'}
          aria-controls="atlas-section-about" onClick={()=>toggleToolSection('about')}>
          <span className="atlas-tools-about-symbol" aria-hidden="true">i</span> {t.mapAbout} · {t.mapToolAboutHint}
        </button>
        {toolSection==='about'&&<div id="atlas-section-about" className="atlas-tools-content atlas-tools-about-content">
          <h3>{t.displaySource}</h3>
          <p>{t.sourceNote}</p>
          <p>{t.description}</p>
          <p>{t.detailNote}</p>
        </div>}
      </div>
    </section>
  </div>;

  return <div className="app">
    <header className="site-header">
      <div className="brand-symbol" aria-hidden="true">◎</div>
      <div className="brand"><strong>{t.title}</strong><small>{t.tagline}</small></div>
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
        <div className="pane-toolbar">
          <span aria-hidden="true">{MODULES.find(x=>x.id===module)?.[lang]}</span>
          <div className="module-pane-actions">
            <button type="button" className="module-reset" aria-label={t.resetModule}
              title={t.resetModule} disabled={!localSelectionActive}
              onClick={()=>resetLocalModule(module)}><span aria-hidden="true">↺</span></button>
            <button type="button" className="pane-close module-pane-close"
              aria-label={t.close} title={t.close} onClick={closeModulePanel}>×</button>
          </div>
        </div>
        {module==='administrative'?treePanel:
          <section className="tree-content">
            <p className="planned-module-description">{t.planned}</p>
          </section>}
      </aside>}
      <main className="map-area" data-map-ready={ready&&rootsLoaded?'true':'false'}
        data-map-visible-count={mapVisible.length}
        data-ro-style={rootStyles.get(ROOT_IDS[0])?.key}
        data-md-style={rootStyles.get(ROOT_IDS[1])?.key} onPointerDown={event=>{
        if(event.target instanceof Element && event.target.closest('.maplibregl-canvas-container'))closeModulePanel();
      }}>
        <div className="map-canvas" ref={mapEl} aria-label="Territorial map" />
        {!rootsLoaded&&catalog.length>0&&<span className="map-boot-status" role="status">{t.loadingGeom}</span>}
        <div className="map-action-stack">
          <button ref={toolsOpenerRef} type="button" className="atlas-tools-toggle"
            title={t.mapToolTip} aria-label={t.mapToolMenu} aria-haspopup="dialog"
            aria-controls="atlas-global-tools" aria-expanded={toolsOpen} onClick={toggleTools}>
            <span aria-hidden="true">⚙</span>
          </button>
          <div className="zoom-controls">
            <button aria-label={t.zoomIn} title={t.zoomIn} onClick={()=>mapRef.current?.zoomIn()}>+</button>
            <button aria-label={t.zoomOut} title={t.zoomOut} onClick={()=>mapRef.current?.zoomOut()}>−</button>
            <button aria-label={t.home} title={t.home} onClick={reset}>⌂</button>
          </div>
          <button type="button" className="map-reset-global" aria-label={t.resetAll}
            title={t.resetAll} onClick={resetAllSelections}>
            <span aria-hidden="true">↺</span>
          </button>
        </div>
        {toolsOpen&&globalTools}
        {(geomLoading||geomError)&&<div className="atlas-map-status" role={geomError?'alert':'status'}>
          {geomError?t.dataError:t.mapLoading}
        </div>}
      </main>
      {currentNode&&detailPanelOpen&&<aside className="detail-sidebar"
        aria-label={t.details+': '+cardNameOf(currentNode,lang)}>
        <div className="pane-toolbar">
          <span aria-hidden="true">{t.details}</span>
          <button type="button" className="pane-close" aria-label={t.close} title={t.close}
            onClick={closeDetailPanel}>×</button>
        </div>
        {details}
      </aside>}
    </div>
    {drawer&&<div className="drawer-screen" role="presentation" onClick={()=>{
      if(drawer==='tree')closeModulePanel();else closeDetailPanel();
    }}>
      <div className={'drawer drawer-'+drawer} role="dialog" aria-modal="true"
        aria-label={drawer==='tree'?(MODULES.find(x=>x.id===module)?.[lang]||t.tree):
          t.details+(currentNode?': '+cardNameOf(currentNode,lang):'')}
        onClick={e=>e.stopPropagation()}>
        <div className="drawer-toolbar">
          <span aria-hidden="true">{drawer==='tree'?(MODULES.find(x=>x.id===module)?.[lang]||t.tree):
            t.details}</span>
          <div className={drawer==='tree'?'module-pane-actions':'detail-pane-actions'}>
            {drawer==='tree'&&<button type="button" className="module-reset"
              aria-label={t.resetModule} title={t.resetModule}
              disabled={!localSelectionActive} onClick={()=>resetLocalModule(module)}>
              <span aria-hidden="true">↺</span>
            </button>}
            <button type="button"
              className={'drawer-close'+(drawer==='tree'?' module-pane-close':'')}
              aria-label={t.close} onClick={()=>{
                if(drawer==='tree')closeModulePanel();else closeDetailPanel();
              }}>×</button>
          </div>
        </div>
        {drawer==='tree'?(module==='administrative'?treePanel:
          <section className="tree-content">
            <p className="planned-module-description">{t.planned}</p>
          </section>):details}
      </div>
    </div>}
  </div>;
}
