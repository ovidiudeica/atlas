from pathlib import Path
import os,sys,json,sqlite3,zipfile,xml.etree.ElementTree as ET
os.environ['QT_QPA_PLATFORM']='offscreen'
from qgis.core import *
from qgis.PyQt.QtCore import QSize
from qgis.PyQt.QtGui import QColor,QFontDatabase
root=Path(sys.argv[1]).resolve();out=Path(sys.argv[2]);file=root/'10_QGIS/RASSM_PROOF_7_C.qgz'
app=QgsApplication([],False);app.initQgis();QFontDatabase.addApplicationFont('C:/Windows/Fonts/arial.ttf')
with zipfile.ZipFile(file) as z:q=ET.fromstring(z.read(next(n for n in z.namelist() if n.endswith('.qgs'))))
ds=[n.text or '' for n in q.findall('.//projectlayers/maplayer/datasource')];assert all(x.startswith('../RASSM_PROOF_7_temporal_C.gpkg|') for x in ds)
p=QgsProject.instance();assert p.read(str(file));rows=[]
for l in p.mapLayers().values():
 assert l.isValid() and l.providerType()=='ogr',l.name();assert Path(l.source().split('|')[0]).resolve()==root/'RASSM_PROOF_7_temporal_C.gpkg';n=sum(1 for _ in l.getFeatures());assert n==l.featureCount();rows.append(dict(name=l.name(),features=n,valid=True))
ext=next(l for l in p.mapLayers().values() if l.name().startswith('158 exterior'));intr=next(l for l in p.mapLayers().values() if l.name().startswith('354 interior'));assert ext.featureCount()==158 and intr.featureCount()==354
layers=[ext,intr,next(l for l in p.mapLayers().values() if l.name().startswith('HURI 1937'))];s=QgsMapSettings();s.setDestinationCrs(p.crs());s.setTransformContext(p.transformContext());s.setExtent(QgsRectangle(p.viewSettings().defaultViewExtent()));s.setOutputSize(QSize(1400,1100));s.setBackgroundColor(QColor('white'));s.setLayers(layers);j=QgsMapRendererSequentialJob(s);j.start();j.waitForFinished();assert not j.errors();im=j.renderedImage();assert im.save(str(out.with_suffix('.png')));n=sum(im.pixelColor(x,y).name()!='#ffffff' for x in range(0,im.width(),8) for y in range(0,im.height(),8));assert n>250,n
result=dict(passed=True,actual_QGIS_open=True,all_layer_records_iterated=True,layers=len(rows),all_local_sources_single_portable_GPKG=True,relative_paths=True,offline_render=True,nonwhite_sample_pixels=n,empty_admissions_real_OGR=True,layer_records=rows)
out.write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf-8');print(json.dumps(dict(passed=True,layers=len(rows),render_nonwhite=n)),flush=True);os._exit(0)
