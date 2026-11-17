import os,json,pathlib,shutil
os.environ['QT_QPA_PLATFORM']='offscreen'
from qgis.core import *
from qgis.PyQt.QtCore import QSize
from qgis.PyQt.QtGui import QColor,QPainter,QFont
root=pathlib.Path.cwd()/'outputs/10_HIST-RASSM_PROOF_1';a=root/'04_VALIDARE';app=QgsApplication([],False);app.initQgis();p=QgsProject.instance();p.setCrs(QgsCoordinateReferenceSystem(3857));p.setFilePathStorage(Qgis.FilePathType.Relative)
gpkg=root/'03_RECONSTRUCTIE_SECTOR/HIST_RASSM_PROOF_1_C.gpkg';ls=[]
def vector(table,title,color,visible=True,polygon=False):
 l=QgsVectorLayer(str(gpkg)+'|layername='+table,title,'ogr');assert l.isValid(),table
 sym=QgsFillSymbol.createSimple({'color':'0,0,0,0','outline_color':color,'outline_width':'0.5'}) if polygon else QgsMarkerSymbol.createSimple({'color':color,'size':'2'}) if l.geometryType()==Qgis.GeometryType.Point else QgsLineSymbol.createSimple({'line_color':color,'line_width':'0.65'})
 l.renderer().setSymbol(sym);l.setAbstract('Clasa C. Georeferentiere nominala, datum istoric necunoscut; hotar juridic neadmis.');p.addMapLayer(l);p.layerTreeRoot().findLayer(l.id()).setItemVisibilityChecked(visible);ls.append(l);return l
gcp=vector('gcp_cadru_nominal','22 GCP cadru nominal - fara admitere absoluta','#8b3ad0',False)
study=vector('sector_studiu_MC','Sector MC-DUB36-01 - cercetare C','#999999',False,True)
diff=vector('diferente_locale_C','2 componente locale mostenite - nerezolvate C','#e59922',False,True)
refs=vector('limite_sursa_decupate_C','HURI 1934/1937 si ICR - limite sursa C','#d92376',True)
conn=vector('vectori_distanta_HURI_C','Distante axa-HURI - diagnostic C','#aaaaaa',False)
water=vector('apa_istorica_C','Anvelopa apei istorice - C','#00a6b0',False,True)
hydro=vector('hidrografie_noua_C','Hidrografie noua din scan - C - NU hotar juridic','#159ca6',True)
cats=[]
for name,col,width in [('WEST_ENVELOPE','#e03b24','0.45'),('AXIS_CANDIDATE','#00bde0','0.8'),('EAST_ENVELOPE','#e03b24','0.45')]:cats.append(QgsRendererCategory(name,QgsLineSymbol.createSimple({'line_color':col,'line_width':width}),name+' C'))
hydro.setRenderer(QgsCategorizedSymbolRenderer('feature_type',cats))
raster=QgsRasterLayer(str(root/'02_GCP_SI_GEOREFERENTIERE/Dubasari_1936_diagnostic_NOMINAL_C.tif'),'Dubasari catalog1936 / recunoastere1933 - raster diagnostic C');assert raster.isValid();p.addMapLayer(raster);p.layerTreeRoot().findLayer(raster.id()).setItemVisibilityChecked(False)
osm=QgsRasterLayer('type=xyz&url=https://tile.openstreetmap.org/{z}/{x}/{y}.png&zmax=19&zmin=0','OSM Standard - geografie moderna - nu proba istorica','wms');assert osm.isValid();p.addMapLayer(osm);metadata=osm.metadata();metadata.setRights(['© OpenStreetMap contributors, ODbL. https://www.openstreetmap.org/copyright']);osm.setMetadata(metadata)
extent=QgsCoordinateTransform(study.crs(),p.crs(),p).transformBoundingBox(study.extent());p.viewSettings().setDefaultViewExtent(QgsReferencedRectangle(extent,p.crs()));p.setTitle('HIST-RASSM.PROOF.1-C | hidrografie noua, hotar neadmis')
p.layerTreeRoot().setHasCustomLayerOrder(True);p.layerTreeRoot().setCustomLayerOrder([hydro,refs,conn,gcp,water,diff,study,raster,osm]);p.setFileName(str(root/'03_RECONSTRUCTIE_SECTOR/HIST_RASSM_PROOF_1_C.qgz'));assert p.write()
settings=QgsMapSettings();settings.setDestinationCrs(p.crs());settings.setExtent(extent);settings.setOutputSize(QSize(1200,1300));settings.setBackgroundColor(QColor('white'))
def render(name,layers,title):
 settings.setLayers(layers);job=QgsMapRendererParallelJob(settings);job.start();job.waitForFinished();im=job.renderedImage();qp=QPainter(im);qp.fillRect(0,0,1200,42,QColor(255,255,255,240));qp.setPen(QColor('black'));qp.setFont(QFont('Arial',11));qp.drawText(12,28,title);qp.fillRect(0,1260,1200,40,QColor(255,255,255,240));qp.setFont(QFont('Arial',9));qp.drawText(12,1285,'C | datum necunoscut | nu hotar certificat | © OpenStreetMap contributors - openstreetmap.org/copyright');qp.end();assert im.save(str(a/name));print('rendered',name,flush=True)
render('QGIS_OSM_sector.png',[hydro,refs,osm],'MC-DUB36-01: hidrografie istorica nominala (rosu/cyan); limite HURI/ICR (roz)')
render('QGIS_scan_sector.png',[hydro,raster],'Control digitizare: scan topografic; nicio limita HURI folosita la trasare')
dist=QgsDistanceArea();dist.setSourceCrs(hydro.crs(),p.transformContext());dist.setEllipsoid('WGS84');lengths=[]
for f in hydro.getFeatures():lengths.append(dict(feature=f['feature_type'],qgis_geodesic_length_m=dist.measureLength(f.geometry()),valid=f.geometry().isGeosValid()))
assert p.read(str(root/'03_RECONSTRUCTIE_SECTOR/HIST_RASSM_PROOF_1_C.qgz'))
checks=[dict(name=l.name(),valid=l.isValid(),provider=l.providerType(),features=l.featureCount() if isinstance(l,QgsVectorLayer) else None) for l in p.mapLayers().values()]
assert all(x['valid'] for x in checks)
dump=dict(qgis_version=Qgis.QGIS_VERSION,project_reopened=True,relative_paths=True,all_layers_valid=True,layers=checks,independent_lengths=lengths,osm_render_produced=True,osm_visual_verified=False,osm_role='Modern geography only, no GCP, no boundary certification')
(a/'QGIS_readback.json').write_text(json.dumps(dump,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
shutil.copy2(__file__,root/'06_REPRODUCIBILITATE/qgis_proof.py');print(json.dumps(dict(layers=len(checks),lengths=lengths)),flush=True);os._exit(0)
