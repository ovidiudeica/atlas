import os,json
from pathlib import Path
os.environ['QT_QPA_PLATFORM']='offscreen'
qt_temp=Path.cwd()/'work/proof5/qgis_temp';qt_temp.mkdir(exist_ok=True);os.environ['TEMP']=str(qt_temp);os.environ['TMP']=str(qt_temp)
from qgis.core import *
from qgis.PyQt.QtCore import QSize
from qgis.PyQt.QtGui import QColor
O=Path.cwd()/'outputs/14_HIST-RASSM_PROOF_5';app=QgsApplication([],False);app.initQgis();p=QgsProject.instance();p.setCrs(QgsCoordinateReferenceSystem('EPSG:3857'));p.setFilePathStorage(Qgis.FilePathType.Relative);model=O/'RASSM_PROOF_5_temporal_C.gpkg'
def add(table,title,color,visible=False,subset=None,path=None):
 if table in ['RASSM_HISTORICAL_CONTINUITY','RASSM_EXTERNAL_ADMITTED','RASSM_INTERNAL_ADMITTED']:
  # GDAL's empty-extent fallback fails on relative paths after project readback on this runtime.
  # Keep real empty tables in the GPKG; these zero-feature display schemas contain no invented data.
  l=QgsVectorLayer('LineString?crs=epsg:4326&field=arc_id:string&field=episode:string&field=certainty:string&field=reason:string',title,'memory');l.setCustomProperty('canonical_gpkg_table',table);l.setCustomProperty('canonical_gpkg_relative_path','../RASSM_PROOF_5_temporal_C.gpkg')
 else:l=QgsVectorLayer(str(path or model)+'|layername='+table,title,'ogr')
 assert l.isValid(),title
 if subset:assert l.setSubsetString(subset)
 if l.geometryType()==Qgis.GeometryType.Line:l.renderer().setSymbol(QgsLineSymbol.createSimple({'line_color':color,'line_width':'.7'}))
 elif l.geometryType()==Qgis.GeometryType.Polygon:l.renderer().setSymbol(QgsFillSymbol.createSimple({'color':'0,0,0,0','outline_color':color,'outline_width':'.45'}))
 p.addMapLayer(l);p.layerTreeRoot().findLayer(l.id()).setItemVisibilityChecked(visible);return l
admitted=[add(x,t,'#15a045') for x,t in [('RASSM_HISTORICAL_CONTINUITY','M1 confirmed continuity - zero admitted'),('RASSM_EXTERNAL_ADMITTED','Exterior A/B - zero admitted'),('RASSM_INTERNAL_ADMITTED','Interior A/B - zero admitted')]]
pilots=add('RASSM_HISTORICAL_CANDIDATES','512 pilot historical candidates C - M2 M3 M4 M5', '#dc3b33',True)
cats=[]
for value,col in [('M1','#009044'),('M2','#187fc1'),('M3','#e69a16'),('M4','#d13b2d'),('M5','#9030b7')]:cats.append(QgsRendererCategory(value,QgsLineSymbol.createSimple({'line_color':col,'line_width':'.8'}),value+' / historical C'))
pilots.setRenderer(QgsCategorizedSymbolRenderer('M_category',cats));modern=add('RASSM_CURRENT_OSMB_ARCS','Exact OSMB2026 source arcs - continuity unproved','#777777');traces=add('RASSM_RECONSTRUCTED_ARCS','MSE undated content -4retained and1new nominal C symbols','#00a1a7',True)
unresolved=add('RASSM_UNRESOLVED_ARCS','Historical continuity unresolved -512C arcs','#d13b2d');events=add('RASSM_TEMPORAL_TRANSITIONS','Administrative events - regional/unit context, not line proof','#000000');sources=add('RASSM_SOURCE_EVIDENCE','Sources and3unlocated target documents D - no invented coordinates','#000000');unc=add('RASSM_UNCERTAINTY','Absolute temporal and legal uncertainty - unknown','#000000');links=add('RASSM_ARC_EVENT_LINKS','Arc to event context links - no geometric admission','#000000')
temporal={}
for ep in ['1927-03-01','1928-08-15','1932-03-20','1932-10-25','1933-04-01','1933-12-15','1934-05-30','1937-01-15']:
 temporal[ep]=add('RASSM_DISTRICT_REFERENCE_8_EPISODES_C','HURI '+ep+' candidate districts C','#aa3344' if ep.startswith('1927') else '#506fc1',ep=='1937-01-15',"snapshot='"+ep+"'")
ras=QgsRasterLayer(str(O/'04_HARTI_SI_ACTE_PRIMARE/MSE5_native_nominal_C.tif'),'MSE1930 original - inherited nominal frame C, datum unknown','gdal');assert ras.isValid();p.addMapLayer(ras);p.layerTreeRoot().findLayer(ras.id()).setItemVisibilityChecked(False)
dub=O/'07_DUBASARI/HIST_RASSM_PROOF_1_C_unchanged.gpkg';hyd=add('hidrografie_noua_C','Dubasari hydrography C - axis and envelopes, NOT legal frontier','#047ac1',path=dub);water=add('apa_istorica_C','Dubasari historical water envelope C','#047ac1',path=dub);dras=QgsRasterLayer(str(O/'07_DUBASARI/Dubasari_1936_diagnostic_NOMINAL_C.tif'),'Dubasari sheet - nominal unknown datum C','gdal');assert dras.isValid();p.addMapLayer(dras);p.layerTreeRoot().findLayer(dras.id()).setItemVisibilityChecked(False)
osm=QgsRasterLayer('type=xyz&url=https://tile.openstreetmap.org/{z}/{x}/{y}.png&zmax=19&zmin=0','OSM Standard - ©OpenStreetMapcontributors/ODbL','wms');assert osm.isValid();p.addMapLayer(osm)
ct=QgsCoordinateTransform(pilots.crs(),p.crs(),p);extent=ct.transformBoundingBox(pilots.extent());extent.scale(1.12);p.viewSettings().setDefaultViewExtent(QgsReferencedRectangle(extent,p.crs()));p.layerTreeRoot().setHasCustomLayerOrder(True);p.layerTreeRoot().setCustomLayerOrder([pilots,traces,modern,unresolved,*admitted,hyd,water,*temporal.values(),events,sources,unc,links,ras,dras,osm]);p.setTitle('HIST-RASSM.PROOF.5-C - partial administrative chains; no A/B admission');qgz=O/'09_QGIS/RASSM_PROOF_5_C.qgz';p.setFileName(str(qgz));assert p.write();assert p.read(str(qgz));assert all(l.isValid() for l in p.mapLayers().values())
def pick(prefix):return next(l for l in p.mapLayers().values() if l.name().startswith(prefix))
pilots=pick('512 pilot');traces=pick('MSE undated');ras=pick('MSE1930 original');osm=pick('OSM Standard');hyd=pick('Dubasari hydrography');water=pick('Dubasari historical water');dras=pick('Dubasari sheet');t27=pick('HURI 1927');t28=pick('HURI 1928')
da=QgsDistanceArea();da.setSourceCrs(pilots.crs(),p.transformContext());da.setEllipsoid('WGS84');lengths={kind:sum(da.measureLength(f.geometry()) for f in pilots.getFeatures() if f['kind']==kind) for kind in ['EXTERNAL','INTERNAL']};new=next(f for f in traces.getFeatures() if f['trace_id']=='P5-MSE30-BALTA-BIRZULA-01');lengths['new_native_nominal_C']=da.measureLength(new.geometry());lengths['Dubasari_axis']=sum(da.measureLength(f.geometry()) for f in hyd.getFeatures() if f['feature_type']=='AXIS_CANDIDATE')
s=QgsMapSettings();s.setDestinationCrs(p.crs());s.setOutputSize(QSize(1300,1100));s.setBackgroundColor(QColor('white'))
for name,box,chosen in [('corridor_overview.png',extent,[pilots,traces,t27,osm]),('native_C_fragment.png',ct.transformBoundingBox(new.geometry().boundingBox()),[traces,ras]),('MSE_1927_1928_comparison.png',ct.transformBoundingBox(QgsRectangle(28.7,47.2,30.4,48.4)),[traces,t27,t28,ras]),('Dubasari_historical_C.png',ct.transformBoundingBox(hyd.extent()),[hyd,water,dras])]:
 box.scale(1.5 if name=='native_C_fragment.png' else 1.12);s.setExtent(box);s.setLayers(chosen);j=QgsMapRendererSequentialJob(s);j.start();j.waitForFinished();assert j.renderedImage().save(str(O/'09_QGIS'/name))
qa=dict(qgis_version=Qgis.QGIS_VERSION,project_reopened=True,relative_paths=True,all_layers_valid=True,display_crs=p.crs().authid(),temporal_reference_layers=8,temporal_layers_are_reference_snapshots_not_proven_validity=True,layers=[dict(name=l.name(),features=l.featureCount() if isinstance(l,QgsVectorLayer) else None,valid=l.isValid()) for l in p.mapLayers().values()],geodesic_lengths_m=lengths,visual_verified=False,extent_3857=[extent.xMinimum(),extent.yMinimum(),extent.xMaximum(),extent.yMaximum()])
qa['empty_admission_display_schemas']='Zero-feature memory schemas avoid this runtime GDALrelativeemptyextentfallback; actual empty canonical tables persist inGPKG and are validated independently.'
(O/'08_VALIDARE/QGIS_readback.json').write_text(json.dumps(qa,indent=2)+'\n');print(json.dumps(qa),flush=True);os._exit(0)
