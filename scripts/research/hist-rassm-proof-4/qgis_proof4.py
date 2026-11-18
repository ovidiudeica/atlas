import os,pathlib,json
os.environ['QT_QPA_PLATFORM']='offscreen'
from qgis.core import *
from qgis.PyQt.QtCore import QSize
from qgis.PyQt.QtGui import QColor
root=pathlib.Path.cwd()/'outputs/13_HIST-RASSM_PROOF_4';app=QgsApplication([],False);app.initQgis();p=QgsProject.instance();p.setCrs(QgsCoordinateReferenceSystem('EPSG:3857'));p.setFilePathStorage(Qgis.FilePathType.Relative);model=root/'RASSM_PROOF_4_temporal_C.gpkg';layers=[]
def add(table,title,color,width='.5',visible=False):
 l=QgsVectorLayer(str(model)+'|layername='+table,title,'ogr');assert l.isValid(),title
 if l.geometryType()==Qgis.GeometryType.Line:l.renderer().setSymbol(QgsLineSymbol.createSimple({'line_color':color,'line_width':width}))
 elif l.geometryType()==Qgis.GeometryType.Point:l.renderer().setSymbol(QgsMarkerSymbol.createSimple({'color':color,'size':'2'}))
 elif l.geometryType()==Qgis.GeometryType.Polygon:l.renderer().setSymbol(QgsFillSymbol.createSimple({'color':'0,0,0,0','outline_color':color,'outline_width':'.25'}))
 p.addMapLayer(l);p.layerTreeRoot().findLayer(l.id()).setItemVisibilityChecked(visible);layers.append(l);return l
extA=add('RASSM_EXTERNAL_ADMITTED','Exterior A/B - zero admitted','#00a348');intA=add('RASSM_INTERNAL_ADMITTED','Interior A/B - zero admitted','#00a348')
ext=add('RASSM_EXTERNAL_CANDIDATES','Exterior1937 C - original M classes','#9a719c','.4',True);inside=add('RASSM_INTERNAL_CANDIDATES','Shared interior1937 C - counted once','#bb8d63','.3',True)
for l in [ext,inside]:
 cats=[]
 for value,col in [('M1','#009044'),('M2','#187fc1'),('M3','#e69a16'),('M4','#d13b2d'),('M5','#9030b7')]:cats.append(QgsRendererCategory(value,QgsLineSymbol.createSimple({'line_color':col,'line_width':'.4'}),value+' / C'))
 l.setRenderer(QgsCategorizedSymbolRenderer('M_category',cats))
recon=add('RASSM_HISTORICAL_RECONSTRUCTIONS','1930 printed symbols - approximate frame C - undated content','#00a1a7','.8',True);modern=add('RASSM_MODERN_CONTINUITY','Exact OSMB candidate source arcs - continuity unproved','#707070','.3')
unres=add('RASSM_UNRESOLVED_SEGMENTS','Unresolved1937 M4 M5 and divergent M3','#d13b2d');gcps=add('RASSM_GCP_AND_DATUM','Dubasari printed frame only - NO absolute physical GCP','#aa35cc');cases=add('INVESTIGATED_CASES','36 investigated PROOF2 arcs - unchanged C','#ff00aa','1.2',True);districts=add('HURI_1937_DISTRICTS_REFERENCE_C','14 candidate districts - January Tiraspol contradicted','#777777');sources=add('RASSM_SOURCES_AND_DECISIONS','Sources and individual decisions','#000000')
ras=QgsRasterLayer(str(root/'03_GEOREFERENTIERE/MSE5_native_nominal_C.tif'),'1930 source - native MSE volume5 - diagnostic C','gdal');assert ras.isValid();p.addMapLayer(ras);p.layerTreeRoot().findLayer(ras.id()).setItemVisibilityChecked(False)
osm=QgsRasterLayer('type=xyz&url=https://tile.openstreetmap.org/{z}/{x}/{y}.png&zmax=19&zmin=0','OSM Standard - © OpenStreetMap contributors / ODbL','wms');assert osm.isValid();p.addMapLayer(osm)
box=QgsRectangle();box.setMinimal()
for f in ext.getFeatures():box.combineExtentWith(f.geometry().boundingBox())
ct=QgsCoordinateTransform(ext.crs(),p.crs(),p);extent=ct.transformBoundingBox(box);extent.scale(1.08);p.viewSettings().setDefaultViewExtent(QgsReferencedRectangle(extent,p.crs()));p.layerTreeRoot().setHasCustomLayerOrder(True);p.layerTreeRoot().setCustomLayerOrder([cases,recon,ext,inside,extA,intA,gcps,modern,unres,districts,sources,ras,osm]);p.setTitle('HIST-RASSM.PROOF.4-C - no M1 or A/B admitted');qgz=root/'08_QGIS/RASSM_PROOF_4_C.qgz';p.setFileName(str(qgz));assert p.write();assert p.read(str(qgz));ls=list(p.mapLayers().values())
def pick(prefix):return next(l for l in ls if l.name().startswith(prefix))
ext=pick('Exterior1937');inside=pick('Shared interior');cases=pick('36 investigated');recon=pick('1930 printed');osm=pick('OSM Standard');ras=pick('1930 source')
da=QgsDistanceArea();da.setSourceCrs(QgsCoordinateReferenceSystem('EPSG:4326'),p.transformContext());da.setEllipsoid('WGS84');totals={}
for name,l in [('exterior',ext),('internal',inside),('retained_printed_symbols',recon)]:totals[name]=sum(da.measureLength(f.geometry()) for f in l.getFeatures())
s=QgsMapSettings();s.setDestinationCrs(p.crs());s.setOutputSize(QSize(1200,1350));s.setBackgroundColor(QColor('white'))
for name,bounds,chosen in [('overview.png',None,[cases,recon,ext,inside,osm]),('1930_symbols_comparison.png',(28.85,47.35,29.6,47.9),[recon,inside,cases,ras]),('Dubasari_context.png',(29.0,47.1666667,29.25,47.3333333),[cases,recon,ext,inside,osm])]:
 s.setExtent(extent if bounds is None else ct.transformBoundingBox(QgsRectangle(*bounds)));s.setLayers(chosen);j=QgsMapRendererSequentialJob(s);j.start();j.waitForFinished();assert j.renderedImage().save(str(root/'08_QGIS'/name))
qa=dict(qgis_version=Qgis.QGIS_VERSION,project_reopened=True,relative_paths=True,all_layers_valid=all(l.isValid() for l in ls),layers=[dict(name=l.name(),valid=l.isValid(),features=l.featureCount() if isinstance(l,QgsVectorLayer) else None) for l in ls],display_crs=p.crs().authid(),geodesic_lengths_m=totals,extent_3857=[extent.xMinimum(),extent.yMinimum(),extent.xMaximum(),extent.yMaximum()],visual_verified=False)
(root/'07_VALIDARE/QGIS_readback.json').write_text(json.dumps(qa,indent=2)+'\n',encoding='utf-8');print(json.dumps(qa));os._exit(0)
