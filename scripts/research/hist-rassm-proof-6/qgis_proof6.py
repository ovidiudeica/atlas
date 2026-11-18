import os,json
from pathlib import Path
os.environ['QT_QPA_PLATFORM']='offscreen'
from qgis.core import *
from qgis.PyQt.QtCore import QSize
from qgis.PyQt.QtGui import QColor
O=Path.cwd()/'outputs/15_HIST-RASSM_PROOF_6';app=QgsApplication([],False);app.initQgis();p=QgsProject.instance();p.setCrs(QgsCoordinateReferenceSystem('EPSG:3857'));p.setFilePathStorage(Qgis.FilePathType.Relative);model=O/'RASSM_PROOF_6_temporal_C.gpkg'
def add(table,title,color='#bb3322',visible=False,subset=None,path=None):
 if table in ['EXTERNAL_ADMITTED','INTERNAL_ADMITTED']:
  l=QgsVectorLayer('LineString?crs=epsg:4326&field=arc_id:string&field=reason:string',title,'memory');l.setCustomProperty('canonical_gpkg_table',table);l.setCustomProperty('canonical_gpkg_relative_path','../RASSM_PROOF_6_temporal_C.gpkg')
 else:l=QgsVectorLayer(str(path or model)+'|layername='+table,title,'ogr')
 assert l.isValid(),title
 if subset:assert l.setSubsetString(subset)
 if l.geometryType()==Qgis.GeometryType.Line:l.renderer().setSymbol(QgsLineSymbol.createSimple({'line_color':color,'line_width':'.65'}))
 elif l.geometryType()==Qgis.GeometryType.Polygon:l.renderer().setSymbol(QgsFillSymbol.createSimple({'color':'0,0,0,0','outline_color':color,'outline_width':'.35'}))
 p.addMapLayer(l);p.layerTreeRoot().findLayer(l.id()).setItemVisibilityChecked(visible);return l
pilots=add('RASSM_SOURCE_BOUNDARIES','512 unchanged historical pilot candidates C','#d43b32',True)
border=add('MD_UA_SHARED_LEVEL2_REFERENCE_C','Modern MD UA OSMB reference C - no official delimitation','#8040bb',True)
for table in ['C1_CAMENCA','C2_TIRASPOL','C3_GRIGORIOPOL','C4_UKRAINE','UNRESOLVED_BOUNDARIES','EXTERNAL_ADMITTED','INTERNAL_ADMITTED','BOUNDARY_CONTINUITY','ADMINISTRATIVE_EVENTS','SOURCES_AND_DECISIONS','COUNCILS_1988_PRIMARY_REFERENCE','UKRAINE_CENTRE_CODE_CROSSWALK','UKRAINE_PREDECESSOR_TEXT','MD_UA_TREATY_SCOPE']:add(table,table+' - research evidence only')
traces=add('RETAINED_PROOF5_NOMINAL_C_TRACES','Five inherited nominal C traces - zero new','#008e9a');modern=add('CURRENT_OSMB_REFERENCE_C','45 modern OSMB source arcs C','#777777')
temporal=[]
for ep in ['1927-03-01','1928-08-15','1932-03-20','1932-10-25','1933-04-01','1933-12-15','1934-05-30','1937-01-15']:temporal.append(add('DISTRICT_REFERENCE_8_EPISODES_C','HURI '+ep+' reference only','#5074aa',ep=='1937-01-15',"snapshot='"+ep+"'"))
ras=QgsRasterLayer(str(O/'01_ACTE_SI_ANEXE/MSE5_native_nominal_C_RETAINED.tif'),'MSE1930 nominal inherited - datum unknown','gdal');assert ras.isValid();p.addMapLayer(ras);p.layerTreeRoot().findLayer(ras.id()).setItemVisibilityChecked(False)
dub=O/'08_DUBASARI/HIST_RASSM_PROOF_1_C_unchanged.gpkg';hyd=add('hidrografie_noua_C','Dubasari axis and envelopes C - not legal frontier','#087bbb',path=dub);water=add('apa_istorica_C','Dubasari historical water C','#087bbb',path=dub);dras=QgsRasterLayer(str(O/'08_DUBASARI/Dubasari_1936_diagnostic_NOMINAL_C.tif'),'Dubasari inherited nominal raster C','gdal');assert dras.isValid();p.addMapLayer(dras);p.layerTreeRoot().findLayer(dras.id()).setItemVisibilityChecked(False)
osm=QgsRasterLayer('type=xyz&url=https://tile.openstreetmap.org/{z}/{x}/{y}.png&zmax=19&zmin=0','OSM Standard - ©OpenStreetMap contributors ODbL','wms');assert osm.isValid();p.addMapLayer(osm);p.layerTreeRoot().findLayer(osm.id()).setItemVisibilityChecked(False)
ct=QgsCoordinateTransform(pilots.crs(),p.crs(),p);extent=ct.transformBoundingBox(pilots.extent());extent.scale(1.15);p.viewSettings().setDefaultViewExtent(QgsReferencedRectangle(extent,p.crs()));p.setTitle('HIST-RASSM.PROOF.6-C - no historical geometric admission');p.setFileName(str(O/'10_QGIS/RASSM_PROOF_6_C.qgz'));assert p.write()
da=QgsDistanceArea();da.setSourceCrs(pilots.crs(),p.transformContext());da.setEllipsoid('WGS84');lengths={kind:sum(da.measureLength(f.geometry()) for f in pilots.getFeatures() if f['kind']==kind) for kind in ['EXTERNAL','INTERNAL']};lengths['Dubasari_axis']=sum(da.measureLength(f.geometry()) for f in hyd.getFeatures() if f['feature_type']=='AXIS_CANDIDATE')
s=QgsMapSettings();s.setDestinationCrs(p.crs());s.setOutputSize(QSize(1400,1100));s.setBackgroundColor(QColor('white'))
for name,box,layers in [('pilot_scope_overview.png',extent,[pilots,border,temporal[-1]]),('Dubasari_retained_C.png',ct.transformBoundingBox(hyd.extent()),[hyd,water,dras])]:
 box.scale(1.1);s.setExtent(box);s.setLayers(layers);job=QgsMapRendererSequentialJob(s);job.start();job.waitForFinished();assert job.renderedImage().save(str(O/'10_QGIS'/name))
assert p.read(p.fileName());assert all(l.isValid() for l in p.mapLayers().values())
qa=dict(project_reopened=True,all_layers_valid=True,relative_paths=True,temporal_reference_layers=8,display_crs=p.crs().authid(),qgis_version=Qgis.QGIS_VERSION,geodesic_lengths_m=lengths,visual_verified=False,layer_count=len(p.mapLayers()),empty_admission_display_schemas='Zero feature memory schemas; actual empty GPKG tables independently validated; runtime relative empty extent limitation')
(O/'09_VALIDARE/QGIS_readback.json').write_text(json.dumps(qa,indent=2)+'\n');print(json.dumps(qa),flush=True);os._exit(0)
