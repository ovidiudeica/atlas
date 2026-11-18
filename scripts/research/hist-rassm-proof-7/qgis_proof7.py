from pathlib import Path
import os,sys,json,sqlite3
os.environ['QT_QPA_PLATFORM']='offscreen'
from qgis.core import *
from qgis.PyQt.QtCore import QSize
from qgis.PyQt.QtGui import QColor,QFontDatabase
root=Path(sys.argv[1]).resolve();model=root/'RASSM_PROOF_7_temporal_C.gpkg'
with sqlite3.connect(model) as c:c.execute("UPDATE gpkg_contents SET min_x=0,min_y=0,max_x=0,max_y=0 WHERE table_name IN ('RASSM_PROOF7_EXTERNAL_ADMITTED_AB','RASSM_PROOF7_INTERNAL_ADMITTED_AB')")
app=QgsApplication([],False);app.initQgis();QFontDatabase.addApplicationFont('C:/Windows/Fonts/arial.ttf');p=QgsProject.instance();p.setCrs(QgsCoordinateReferenceSystem('EPSG:3857'));p.setFilePathStorage(Qgis.FilePathType.Relative)
def add(t,title,color='#888888',visible=False,subset=None):
 l=QgsVectorLayer(str(model)+'|layername='+t,title,'ogr');assert l.isValid(),t
 if subset:assert l.setSubsetString(subset)
 if l.geometryType()==Qgis.GeometryType.Line:l.renderer().setSymbol(QgsLineSymbol.createSimple({'line_color':color,'line_width':'.6'}))
 elif l.geometryType()==Qgis.GeometryType.Polygon:l.renderer().setSymbol(QgsFillSymbol.createSimple({'color':'0,0,0,0','outline_color':color,'outline_width':'.25'}))
 p.addMapLayer(l);p.layerTreeRoot().findLayer(l.id()).setItemVisibilityChecked(visible);return l
ext=add('RASSM_PROOF7_EXTERNAL_CANDIDATES','158 exterior pilot — candidați C','#c34a2d',True);intr=add('RASSM_PROOF7_INTERNAL_CANDIDATES','354 interior pilot unic — candidați C','#2877ad',True)
with sqlite3.connect(model) as c:tables=[x[0] for x in c.execute('SELECT table_name FROM gpkg_contents')]
for t in tables:
 if t not in ['RASSM_PROOF7_EXTERNAL_CANDIDATES','RASSM_PROOF7_INTERNAL_CANDIDATES','RETAINED_DISTRICT_EPISODES_C']:add(t,t+' — cercetare, fără certificare juridică')
for ep in ['1927-03-01','1928-08-15','1932-03-20','1932-10-25','1933-04-01','1933-12-15','1934-05-30','1937-01-15']:add('RETAINED_DISTRICT_EPISODES_C','HURI '+ep+' — referință C','#6f8b9d',ep=='1937-01-15',"snapshot='"+ep+"'")
ct=QgsCoordinateTransform(ext.crs(),p.crs(),p);box=ct.transformBoundingBox(ext.extent());box.combineExtentWith(ct.transformBoundingBox(intr.extent()));box.scale(1.15);p.viewSettings().setDefaultViewExtent(QgsReferencedRectangle(box,p.crs()));p.setTitle('HIST-RASSM.PROOF.7-C — 0 admiteri A/B; inventare noi, anexe lipsă');p.setFileName(str(root/'10_QGIS/RASSM_PROOF_7_C.qgz'));assert p.write()
print(json.dumps(dict(project_written=True,layers=len(p.mapLayers()))),flush=True);os._exit(0)
