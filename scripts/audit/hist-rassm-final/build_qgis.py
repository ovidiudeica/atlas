import os,sys,pathlib,json
os.environ['QT_QPA_PLATFORM']='offscreen'
from qgis.core import *
from qgis.PyQt.QtGui import QColor
from qgis.PyQt.QtCore import QSize
ROOT=pathlib.Path.cwd();OUT=ROOT/'outputs/09_HIST-RASSM_FINAL';app=QgsApplication([],False);app.initQgis()
project=QgsProject.instance();project.setCrs(QgsCoordinateReferenceSystem(3857));project.setFilePathStorage(Qgis.FilePathType.Relative)
layers=[]
def vector(rel,table,title,color,visible=True,subset=None):
 layer=QgsVectorLayer(str(OUT/rel)+'|layername='+table,title,'ogr');assert layer.isValid(),title
 if subset:layer.setSubsetString(subset)
 if layer.geometryType()==Qgis.GeometryType.Polygon:symbol=QgsFillSymbol.createSimple({'color':'0,0,0,0','outline_color':color,'outline_width':'0.55'})
 else:symbol=QgsLineSymbol.createSimple({'line_color':color,'line_width':'0.7'})
 layer.renderer().setSymbol(symbol);layer.setAbstract('Clasa C. Sursa cartografica de lucru, fara certificare istorica.');project.addMapLayer(layer);project.layerTreeRoot().findLayer(layer.id()).setItemVisibilityChecked(visible);layers.append(layer);return layer
md=vector('05_VALIDARE/OSMB_referinte_moderne.gpkg','moldova_20261005','OSMB Moldova 2026-10-05 - geografie moderna','#80a9bb',False)
ua=vector('05_VALIDARE/OSMB_referinte_moderne.gpkg','ukraine_20261109','OSMB Ucraina 2026-11-09 - geografie moderna','#80a9bb',False)
snap=vector('01_GEOMETRII_FINALE/RASSM_etape_teritoriale_1924_1940.gpkg','instantanee_sursa_C','HURI 8 instantanee - C - fara interval certificat','#7638ab',False)
cats=[]
for date in ['1927-03-01','1928-08-15','1932-03-20','1932-10-25','1933-04-01','1933-12-15','1934-05-30','1937-01-15']:
 symbol=QgsFillSymbol.createSimple({'color':'0,0,0,0','outline_color':'#aa4433' if date<'1932' else '#7638ab','outline_width':'0.65'});cats.append(QgsRendererCategory(date,symbol,date+' (sursa C)'))
snap.setRenderer(QgsCategorizedSymbolRenderer('snapshot',cats))
ray=vector('02_ADMINISTRATIE_ISTORICA/RASSM_raioane_context_C.gpkg','raioane_context','HURI raioane 1937 - Tiraspol corectat semantic - C','#677282',False,"snapshot = '1937-01-15'")
diff=vector('05_VALIDARE/RASSM_514_componente.gpkg','componente_C','514 diferente HURI-ICR - nerezolvate istoric','#f39a26',False)
seg=vector('04_REGISTRE_PROBATORII/RASSM_registru_segmente.gpkg','segmente_C','95 segmente de control - C','#e8a420',False)
icr=QgsVectorLayer(str(OUT/'07_REPRODUCIBILITATE/inputs/HIST-RASSM_4_GIS_HURI_ICR_NECERTIFICAT.gpkg')+'|layername=icr_referinta','ICR - contur nedatat - C','ogr');assert icr.isValid();icr.renderer().setSymbol(QgsFillSymbol.createSimple({'color':'0,0,0,0','outline_color':'#167d96','outline_width':'0.55'}));project.addMapLayer(icr);project.layerTreeRoot().findLayer(icr.id()).setItemVisibilityChecked(False)
ref=vector('01_GEOMETRII_FINALE/RASSM_contur_referinta.gpkg','contur_lucru_C','RASSM HURI 1937-01-15 - REFERINTA DE LUCRU C','#a43675',True)
ref.saveNamedStyle(str(OUT/'06_QGIS/certitudine_C.qml'));snap.saveNamedStyle(str(OUT/'06_QGIS/instantanee_sursa.qml'))
osm=QgsRasterLayer('type=xyz&url=https://tile.openstreetmap.org/{z}/{x}/{y}.png&zmax=19&zmin=0','OpenStreetMap Standard - © OpenStreetMap contributors','wms');project.addMapLayer(osm);project.layerTreeRoot().findLayer(osm.id()).setItemVisibilityChecked(False)
metadata=osm.metadata();metadata.setRights(['© OpenStreetMap contributors, ODbL. https://www.openstreetmap.org/copyright']);osm.setMetadata(metadata)
extent=QgsCoordinateTransform(ref.crs(),project.crs(),project).transformBoundingBox(ref.extent());extent.scale(1.12)
project.viewSettings().setDefaultViewExtent(QgsReferencedRectangle(extent,project.crs()));project.setTitle('HIST-RASSM.FINAL - C - rezultat partial verificabil')
project.setFileName(str(OUT/'06_QGIS/RASSM_lucru_C.qgz'));assert project.write()
checks=[]
assert project.read(str(OUT/'06_QGIS/RASSM_lucru_C.qgz'))
for layer in project.mapLayers().values():checks.append(dict(name=layer.name(),valid=layer.isValid(),source=layer.source(),features=layer.featureCount() if isinstance(layer,QgsVectorLayer) else None))
assert all(x['valid'] for x in checks)
settings=QgsMapSettings();settings.setDestinationCrs(project.crs());settings.setOutputSize(QSize(1250,1450));settings.setBackgroundColor(QColor('white'));settings.setExtent(extent)
vl=list(project.mapLayers().values());chosen=[x for x in vl if x.name().startswith(('RASSM HURI','ICR -','HURI raioane','OSMB '))];settings.setLayers(chosen)
job=QgsMapRendererParallelJob(settings);job.start();job.waitForFinished();assert job.renderedImage().save(str(OUT/'06_QGIS/controle_superpozitie.png'))
(OUT/'05_VALIDARE/QGIS_readback.json').write_text(json.dumps(dict(qgis=Qgis.QGIS_VERSION,layers=checks,project_reopened=True,relative_paths=True,osm_configured=True,osm_tiles_visual_verified=False,offline_overlay_rendered=True),ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(dict(qgis=Qgis.QGIS_VERSION,layers=len(checks),all_valid=True,project_reopened=True)),flush=True)
os._exit(0)
