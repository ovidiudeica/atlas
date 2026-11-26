import os,pathlib,json,shutil
os.environ['QT_QPA_PLATFORM']='offscreen'
from qgis.core import *
from qgis.PyQt.QtCore import QSize
from qgis.PyQt.QtGui import QColor
root=pathlib.Path.cwd()/'outputs/11_HIST-RASSM_PROOF_2';app=QgsApplication([],False);app.initQgis();p=QgsProject.instance();p.setCrs(QgsCoordinateReferenceSystem('EPSG:3857'));p.setFilePathStorage(Qgis.FilePathType.Relative);model=root/'RASSM_PROOF_2_temporal_C.gpkg';layers=[]
def add(file,table,title,color,visible=True,subset=None):
 l=QgsVectorLayer(str(root/file)+'|layername='+table,title,'ogr');assert l.isValid(),title
 if subset:l.setSubsetString(subset)
 if l.geometryType()==Qgis.GeometryType.Polygon:sym=QgsFillSymbol.createSimple({'color':'0,0,0,0','outline_color':color,'outline_width':'.35'})
 elif l.geometryType()==Qgis.GeometryType.Line:sym=QgsLineSymbol.createSimple({'line_color':color,'line_width':'.4'})
 else:sym=None
 if sym:l.renderer().setSymbol(sym)
 p.addMapLayer(l);p.layerTreeRoot().findLayer(l.id()).setItemVisibilityChecked(visible);layers.append(l);return l
external=add('RASSM_PROOF_2_temporal_C.gpkg','RASSM_EXTERNAL_BOUNDARIES','HURI exterior1937 - sursa C','#662a7f',False,"snapshot='1937-01-15'")
district=add('RASSM_PROOF_2_temporal_C.gpkg','RASSM_DISTRICTS','14 raioane candidate1937 - C - Tiraspol temporal contestat','#715f49',False,"snapshot='1937-01-15'")
arcs=add('RASSM_PROOF_2_temporal_C.gpkg','RASSM_BOUNDARY_ARCS','Arce1937 M1-M5 - corespondenta geometrica; toate C','#c94032',True,"episode='1937-01-15'")
categories=[]
for value,label,color in [('M1','M1 continuitate demonstrata - zero','#009044'),('M2','M2 geometric puternic, istoric necertificat','#187fc1'),('M3','M3 partial, partitionat','#e69a16'),('M4','M4 fara corespondent verificat','#d13b2d'),('M5','M5 contradictii/temporal','#9030b7')]:categories.append(QgsRendererCategory(value,QgsLineSymbol.createSimple({'line_color':color,'line_width':'.6'}),label))
arcs.setRenderer(QgsCategorizedSymbolRenderer('M_category',categories))
modern=add('RASSM_PROOF_2_temporal_C.gpkg','OSMB_MODERN_ARCS_C','OSMB497 obiecte actuale, arce unice - snapshoturi2026','#666666',True)
hydro=add('RASSM_PROOF_2_temporal_C.gpkg','RASSM_RECONSTRUCTED_ARCS','Dubasari hidro4.347km - C - nu frontiera','#00a7b5',False)
unc=add('RASSM_PROOF_2_temporal_C.gpkg','RASSM_UNCERTAINTY','Incertitudini - temporal si geometric C','#9b35a1',False,"episode='1937-01-15'")
icr=add('08_COD_SI_REPRODUCIBILITATE/inputs/HURI_ICR.gpkg','icr_referinta','ICR nedatat - C','#11a7b7',False)
raw=add('03_RAIOANE/RASSM_raioane_candidate.gpkg','RASSM_DISTRICTS','91 raioane sursa nemodificate - 8 instantanee C','#cccccc',False)
context=add('01_OSMB_RECONCILIERE/OSMB_historic_statistical_context.gpkg','context_not_current_administration','OSMB historic/statistical - piste C, nu administratia actuala','#aa7e39',False)
for table,title in [('RASSM_ADMIN_EVENTS','Evenimente administrative - fara poligoane inventate'),('RASSM_COUNCILS','66 inregistrari consilii/obiecte - geometrii D'),('RASSM_SOURCES','Provenienta si drepturi')]:add('RASSM_PROOF_2_temporal_C.gpkg',table,title,'#777777',False)
osm=QgsRasterLayer('type=xyz&url=https://tile.openstreetmap.org/{z}/{x}/{y}.png&zmax=19&zmin=0','OSM Standard - © OpenStreetMap contributors - context actual','wms');assert osm.isValid();p.addMapLayer(osm)
metadata=osm.metadata();metadata.setRights(['© OpenStreetMap contributors, ODbL https://www.openstreetmap.org/copyright']);osm.setMetadata(metadata)
source_feature=next(external.getFeatures());source_bbox=source_feature.geometry().boundingBox();assert not source_bbox.isEmpty()
extent=QgsCoordinateTransform(external.crs(),p.crs(),p).transformBoundingBox(source_bbox);extent.scale(1.08);p.viewSettings().setDefaultViewExtent(QgsReferencedRectangle(extent,p.crs()));p.layerTreeRoot().setHasCustomLayerOrder(True);p.layerTreeRoot().setCustomLayerOrder([arcs,hydro,external,district,icr,context,raw,unc,modern]+[l for l in layers if l.geometryType()==Qgis.GeometryType.Unknown]+[osm]);p.setTitle('HIST-RASSM.PROOF.2a - reconciliere tehnica; PROOF.2-C');p.setFileName(str(root/'07_QGIS/RASSM_PROOF_2_C.qgz'));assert p.write()
assert p.read(str(root/'07_QGIS/RASSM_PROOF_2_C.qgz'))
current=list(p.mapLayers().values())
arcs=next(l for l in current if l.name().startswith('Arce1937'));modern=next(l for l in current if l.name().startswith('OSMB497'));hydro=next(l for l in current if l.name().startswith('Dubasari hidro'));osm=next(l for l in current if l.name().startswith('OSM Standard'))
s=QgsMapSettings();s.setDestinationCrs(p.crs());s.setOutputSize(QSize(1300,1500));s.setBackgroundColor(QColor('white'))
def render(name,ex,ls):
 s.setExtent(ex);s.setLayers(ls);j=QgsMapRendererParallelJob(s);j.start();j.waitForFinished();assert j.renderedImage().save(str(root/'07_QGIS'/name));print('rendered',name,flush=True)
render('RASSM_OSMB_overview.png',extent,[arcs,modern,osm]);ct=QgsCoordinateTransform(QgsCoordinateReferenceSystem('EPSG:4326'),p.crs(),p)
render('Dubasari_OSMB_control.png',ct.transformBoundingBox(QgsRectangle(29.03,47.23,29.21,47.34)),[hydro,modern,osm]);render('NE_OSMB_control.png',ct.transformBoundingBox(QgsRectangle(29.5,47.75,30.13,48.25)),[arcs,modern,osm])
measurement=QgsDistanceArea();measurement.setSourceCrs(QgsCoordinateReferenceSystem('EPSG:4326'),p.transformContext());measurement.setEllipsoid('WGS84');all_ext=QgsVectorLayer(str(model)+'|layername=RASSM_EXTERNAL_BOUNDARIES','lengths','ogr');all_arcs=QgsVectorLayer(str(model)+'|layername=RASSM_BOUNDARY_ARCS','arc lengths','ogr');lengths=[]
for f in all_ext.getFeatures():lengths.append(dict(episode=f['snapshot'],kind='EXTERNAL',qgis_geodesic_m=measurement.measureLength(f.geometry().convertToType(Qgis.GeometryType.Line))))
internal={}
for f in all_arcs.getFeatures():
 if f['kind']=='INTERNAL':internal[f['episode']]=internal.get(f['episode'],0)+measurement.measureLength(f.geometry())
lengths.extend(dict(episode=d,kind='INTERNAL',qgis_geodesic_m=v) for d,v in sorted(internal.items()))
assert p.read(str(root/'07_QGIS/RASSM_PROOF_2_C.qgz'));checks=[dict(name=l.name(),valid=l.isValid(),features=l.featureCount() if isinstance(l,QgsVectorLayer) else None) for l in p.mapLayers().values()];assert all(x['valid'] for x in checks)
(root/'06_VALIDARE/QGIS_readback.json').write_text(json.dumps(dict(qgis_version=Qgis.QGIS_VERSION,project_reopened=True,relative_paths=True,layers=checks,all_valid=True,independent_geodesic_lengths=lengths,osm_rendered=True,osm_visual_verified=False,OSM_is_historical_proof=False),ensure_ascii=False,indent=2)+'\n',encoding='utf-8');shutil.copy2(__file__,root/'08_COD_SI_REPRODUCIBILITATE/qgis_proof2.py');print('QGIS valid',len(checks),flush=True);os._exit(0)
