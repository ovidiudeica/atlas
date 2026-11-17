import os,pathlib,json,shutil
os.environ['QT_QPA_PLATFORM']='offscreen'
from qgis.core import *
from qgis.PyQt.QtCore import QSize
from qgis.PyQt.QtGui import QColor
root=pathlib.Path.cwd()/'outputs/11_HIST-RASSM_PROOF_2';app=QgsApplication([],False);app.initQgis();p=QgsProject.instance();assert p.read(str(root/'07_QGIS/RASSM_PROOF_2_C.qgz'));ls=list(p.mapLayers().values())
def pick(prefix):return next(x for x in ls if x.name().startswith(prefix))
ext=pick('HURI exterior');arcs=pick('Arce1937');modern=pick('OSMB497');osm=pick('OSM Standard');features=list(ext.getFeatures());assert len(features)==1 and not features[0].geometry().isEmpty();bbox=features[0].geometry().boundingBox();extent=QgsCoordinateTransform(ext.crs(),p.crs(),p).transformBoundingBox(bbox);extent.scale(1.08);assert extent.width()>100000 and extent.height()>100000
p.viewSettings().setDefaultViewExtent(QgsReferencedRectangle(extent,p.crs()));assert p.write()
s=QgsMapSettings();s.setDestinationCrs(p.crs());s.setOutputSize(QSize(1300,1500));s.setBackgroundColor(QColor('white'));s.setExtent(extent);s.setLayers([arcs,modern,osm]);j=QgsMapRendererSequentialJob(s);j.start();j.waitForFinished();assert j.renderedImage().save(str(root/'07_QGIS/RASSM_OSMB_overview.png'))
ct=QgsCoordinateTransform(QgsCoordinateReferenceSystem('EPSG:4326'),p.crs(),p);hydro=pick('Dubasari hidro');icr=pick('ICR nedatat');icr.renderer().setSymbol(QgsFillSymbol.createSimple({'color':'0,0,0,0','outline_color':'#333388','outline_width':'.5','outline_style':'dash'}));assert p.write()
for name,bbox,chosen in [('Dubasari_OSMB_control.png',QgsRectangle(29.03,47.23,29.21,47.34),[hydro,arcs,icr,modern,osm]),('NE_OSMB_control.png',QgsRectangle(29.5,47.75,30.13,48.25),[arcs,icr,modern,osm])]:
 s.setExtent(ct.transformBoundingBox(bbox));s.setLayers(chosen);j=QgsMapRendererSequentialJob(s);j.start();j.waitForFinished();assert j.renderedImage().save(str(root/'07_QGIS'/name))
qa=json.loads((root/'06_VALIDARE/QGIS_readback.json').read_text(encoding='utf-8'));qa.update(overview_extent_derived_from_actual_feature=True,extent_3857=[extent.xMinimum(),extent.yMinimum(),extent.xMaximum(),extent.yMaximum()]);(root/'06_VALIDARE/QGIS_readback.json').write_text(json.dumps(qa,ensure_ascii=False,indent=2)+'\n',encoding='utf-8');shutil.copy2(__file__,root/'08_COD_SI_REPRODUCIBILITATE/finish_qgis.py');shutil.copy2(pathlib.Path('work/proof2/qgis_proof2.py'),root/'08_COD_SI_REPRODUCIBILITATE/qgis_proof2.py');print('Overview extent and render verified',flush=True);os._exit(0)
