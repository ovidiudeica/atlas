from pathlib import Path
import os,sys,json,zipfile,xml.etree.ElementTree as ET,sqlite3
os.environ['QT_QPA_PLATFORM']='offscreen'
from qgis.core import *
from qgis.PyQt.QtCore import QSize
from qgis.PyQt.QtGui import QColor,QFontDatabase
root=Path(sys.argv[1]).resolve();output=Path(sys.argv[2]).resolve();file=root/'RASSM_LATEST_RESEARCH_C.qgz';gpkg=root/'RASSM_LATEST_RESEARCH_C.gpkg'
app=QgsApplication([],False);app.initQgis()
if os.name=='nt':QFontDatabase.addApplicationFont('C:/Windows/Fonts/arial.ttf')
with zipfile.ZipFile(file) as z:q=ET.fromstring(z.read(next(n for n in z.namelist() if n.endswith('.qgs'))))
datasources=[n.text or '' for n in q.findall('.//projectlayers/maplayer/datasource')]
assert datasources and all(x.startswith('./RASSM_LATEST_RESEARCH_C.gpkg|') for x in datasources),datasources
assert not any('C:/Users/' in x or 'C:\\Users\\' in x or '../' in x for x in datasources)
p=QgsProject.instance();assert p.read(str(file));rows=[]
for l in p.mapLayers().values():
 assert isinstance(l,QgsVectorLayer) and l.isValid() and l.providerType()=='ogr',l.name()
 actual_path=Path(l.source().split('|')[0]).resolve();assert actual_path==gpkg,(l.name(),actual_path,gpkg)
 actual=sum(1 for _ in l.getFeatures());assert actual==l.featureCount(),l.name();rows.append(dict(name=l.name(),features=actual,provider=l.providerType()))
pick=lambda table:next(l for l in p.mapLayers().values() if '|layername='+table==l.source()[len(str(gpkg).replace('\\','/')):] or l.source().endswith('|layername='+table))
ext=pick('RASSM_EXTERNAL_1937_C');dist=pick('RASSM_DISTRICTS_1937_C');inside=pick('RASSM_INTERNAL_BOUNDARIES_1937_C')
assert dist.featureCount()==14 and dist.labelsEnabled() and ext.featureCount()==1
for l in [ext,dist,inside]:assert p.layerTreeRoot().findLayer(l.id()).isVisible()
for table in ['RASSM_ICR_UNDATED_C','RASSM_OSMB_CANDIDATE_ARCS','HURI_DISTRICTS_19270301_C']:assert not p.layerTreeRoot().findLayer(pick(table).id()).isVisible()
with sqlite3.connect(gpkg) as c:
 assert c.execute('PRAGMA integrity_check').fetchone()[0]=='ok';assert not c.execute('PRAGMA foreign_key_check').fetchall()
 for table in ['RASSM_EXTERNAL_ADMITTED_AB','RASSM_INTERNAL_ADMITTED_AB']:assert c.execute('SELECT COUNT(*) FROM '+table).fetchone()[0]==0
saved_extent=p.viewSettings().defaultViewExtent();transform=QgsCoordinateTransform(ext.crs(),p.crs(),p);expected_extent=transform.transformBoundingBox(ext.extent());print('Saved extent',saved_extent.toString(),'CRS',saved_extent.crs().authid(),'expected',expected_extent.toString(),flush=True)
s=QgsMapSettings();s.setDestinationCrs(p.crs());s.setTransformContext(p.transformContext());s.setOutputSize(QSize(1500,1250));s.setBackgroundColor(QColor('#fbfaf7'));s.setExtent(QgsRectangle(saved_extent));s.setLayers([inside,ext,dist]);job=QgsMapRendererSequentialJob(s);job.start();job.waitForFinished();print('Render errors',[(e.layerID,e.message) for e in job.errors()],flush=True);print('Scale',s.scale(),'extent',s.extent().toString(),'CRS',s.destinationCrs().authid(),flush=True);assert job.renderedImage().save(str(output.with_suffix('.png')))
assert not job.errors();assert QgsRectangle(saved_extent).contains(expected_extent)
rendered=job.renderedImage();nonbackground=sum(rendered.pixelColor(x,y).name()!='#fbfaf7' for x in range(0,rendered.width(),10) for y in range(0,rendered.height(),10));assert nonbackground>500,'Blank or incomplete rendered map'
result=dict(passed=True,project_actually_opened_in_QGIS=True,all_layers_valid=True,all_features_actually_iterated=True,no_original_workspace_dependency=True,all_datasources_relative_to_extracted_central_GPKG=True,offline_no_network_layers=True,default_visibility_checked=True,district_labels_enabled=True,district_polygons=14,layer_count=len(rows),integrity_check='ok',render_errors=0,nonbackground_sample_pixels=nonbackground,full_reference_extent_contains_external_boundary=True,layers=rows)
output.write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf-8');print(json.dumps(dict(passed=True,layers=len(rows))),flush=True);os._exit(0)
