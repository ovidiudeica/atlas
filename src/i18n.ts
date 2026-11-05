import type { Locale } from './catalog';

const strings = {
  en: {
    product:'Territorial Atlas',tagline:'Geography · History · Communities',modules:'Atlas modules',
    administrative:'Administrative', historical:'Historical',communities:'Historical Romanian Communities',regions:'Historical Regions',ethnographic:'Ethnographic Areas',reform:'Administrative-Territorial Reform',
    tree:'Territories',search:'Search territories or codes…',basemap:'Basemap',geometry:'Simplified geometries',standard:'Standard',grayscale:'Grayscale',dark:'Dark',none:'None',
    home:'Home — reset map extent',zoomIn:'Zoom in',zoomOut:'Zoom out',treeToggle:'Territory tree',details:'Entity details',close:'Close',
    status:'First functional release · country outlines',selected:'Entity details',noSelection:'Select a territory in the tree or on the map.',
    source:'Source',official:'Official name',osmId:'OSM ID',adminLevel:'OSM administrative level',statCode:'Statistical code',statLevel:'Statistical level',treeParent:'Tree parent',adminParent:'Administrative parent',geometryAvailable:'Geometry',available:'Available',planned:'Coming in data integration',
    outline:'Nation boundaries · OSM-Boundaries 2026-10-05',countries:'Country borders',future:'Module planned for a later stage',preview:'Statistical navigation preview — geometry not yet loaded',show:'Show geometry',expand:'Expand',collapse:'Collapse',lang:'Language',
  },
  ro: {
    product:'Atlas Teritorial',tagline:'Geografie · Istorie · Comunități',modules:'Modulele Atlasului',
    administrative:'Administrativ',historical:'Istoric',communities:'Comunități istorice românești',regions:'Regiuni istorice',ethnographic:'Zone etnografice',reform:'Reformă administrativ-teritorială',
    tree:'Teritorii',search:'Caută teritorii sau coduri…',basemap:'Hartă de fundal',geometry:'Geometrii simplificate',standard:'Standard',grayscale:'Tonuri de gri',dark:'Întunecată',none:'Fără fundal',
    home:'Acasă — resetează întinderea hărții',zoomIn:'Mărește',zoomOut:'Micșorează',treeToggle:'Arbore teritorial',details:'Detalii entitate',close:'Închide',
    status:'Prima versiune funcțională · contururi naționale',selected:'Detalii entitate',noSelection:'Selectează un teritoriu din arbore sau de pe hartă.',
    source:'Sursă',official:'Denumire oficială',osmId:'ID OSM',adminLevel:'Nivel administrativ OSM',statCode:'Cod statistic',statLevel:'Nivel statistic',treeParent:'Părinte în arbore',adminParent:'Părinte administrativ',geometryAvailable:'Geometrie',available:'Disponibilă',planned:'În etapa integrării datelor',
    outline:'Contururi naționale · OSM-Boundaries 2026-10-05',countries:'Frontiere naționale',future:'Modul planificat pentru o etapă ulterioară',preview:'Previzualizare a arborelui statistic — geometriile nu sunt încă încărcate',show:'Afișează geometria',expand:'Extinde',collapse:'Restrânge',lang:'Limbă',
  },
} as const;
export type Strings = typeof strings['en'];
export const t = (locale: Locale) => strings[locale] as Strings;