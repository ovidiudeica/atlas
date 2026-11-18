import os,json
from pathlib import Path
os.environ['QT_QPA_PLATFORM']='offscreen'
from qgis.core import *
from qgis.PyQt.QtCore import QSize
from qgis.PyQt.QtGui import QColor
R=Path.cwd();O=R/'outputs/13_HIST-RASSM_PROOF_4';app=QgsApplication([],False);app.initQgis();p=QgsProject.instance();file=O/'08_QGIS/RASSM_PROOF_4_C.qgz';assert p.read(str(file));p.setFilePathStorage(Qgis.FilePathType.Relative)
for old in list(p.mapLayers().values()):
 if old.name().startswith(('Dubasari historical','Dubasari original sheet')):p.removeMapLayer(old.id())
new=[]
for table,title in [('hidrografie_noua_C','Dubasari historical hydrographic axis C - NOT legal frontier'),('apa_istorica_C','Dubasari historical water envelope C')]:
 l=QgsVectorLayer(str(O/'06_DUBASARI/HIST_RASSM_PROOF_1_C_unchanged.gpkg')+'|layername='+table,title,'ogr');assert l.isValid();p.addMapLayer(l);new.append(l)
 if l.geometryType()==Qgis.GeometryType.Line:l.renderer().setSymbol(QgsLineSymbol.createSimple({'line_color':'#047ac1','line_width':'.7'}))
 else:l.renderer().setSymbol(QgsFillSymbol.createSimple({'color':'40,150,220,60','outline_color':'#047ac1'}))
 p.layerTreeRoot().findLayer(l.id()).setItemVisibilityChecked(False)
ras=QgsRasterLayer(str(O/'06_DUBASARI/Dubasari_1936_diagnostic_NOMINAL_C.tif'),'Dubasari original sheet derivative - nominal datum unknown','gdal');assert ras.isValid();p.addMapLayer(ras);p.layerTreeRoot().findLayer(ras.id()).setItemVisibilityChecked(False)
assert p.write(str(file));assert p.read(str(file));ls=list(p.mapLayers().values());assert all(l.isValid() for l in ls)
hyd=next(l for l in ls if l.name().startswith('Dubasari historical hydrographic'));water=next(l for l in ls if l.name().startswith('Dubasari historical water'));ras=next(l for l in ls if l.name().startswith('Dubasari original sheet'))
da=QgsDistanceArea();da.setSourceCrs(hyd.crs(),p.transformContext());da.setEllipsoid('WGS84');length=sum(da.measureLength(f.geometry()) for f in hyd.getFeatures() if f['feature_type']=='AXIS_CANDIDATE');assert abs(length-4346.949848)<.01
box=hyd.extent();box.scale(2.2);ct=QgsCoordinateTransform(hyd.crs(),p.crs(),p);settings=QgsMapSettings();settings.setDestinationCrs(p.crs());settings.setOutputSize(QSize(1200,1000));settings.setBackgroundColor(QColor('white'));settings.setExtent(ct.transformBoundingBox(box));settings.setLayers([hyd,water,ras]);job=QgsMapRendererSequentialJob(settings);job.start();job.waitForFinished();assert job.renderedImage().save(str(O/'08_QGIS/Dubasari_historical_C.png'))
f=O/'07_VALIDARE/QGIS_readback.json';q=json.loads(f.read_text());q['all_layers_valid']=True;q['layers']=[dict(name=l.name(),valid=l.isValid(),features=l.featureCount() if isinstance(l,QgsVectorLayer) else None) for l in ls];q['Dubasari_hydrographic_axis_geodesic_m']=length;q['Dubasari_original_GIS_and_raster_reused']=True;q['Dubasari_historical_overlay_visual_verified']=False;f.write_text(json.dumps(q,indent=2)+'\n');os._exit(0)

