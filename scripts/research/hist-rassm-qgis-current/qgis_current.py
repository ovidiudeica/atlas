from pathlib import Path
import os,json,sqlite3
os.environ['QT_QPA_PLATFORM']='offscreen'
from qgis.core import *
from qgis.PyQt.QtCore import QSize,Qt
from qgis.PyQt.QtGui import QColor,QFont,QPainter,QFontDatabase
R=Path.cwd();W=R/'work/qgis_current';O=Path(os.environ.get('CURRENT_OUTPUT',str(R/'outputs/00_RASSM_QGIS_CURRENT')));model=O/'RASSM_LATEST_RESEARCH_C.gpkg'
# Give empty admission layers a finite empty extent in metadata; no geometry is inserted.
with sqlite3.connect(model) as c:
 c.execute("UPDATE gpkg_contents SET min_x=0,min_y=0,max_x=0,max_y=0 WHERE table_name IN ('RASSM_EXTERNAL_ADMITTED_AB','RASSM_INTERNAL_ADMITTED_AB')")
app=QgsApplication([],False);app.initQgis();QFontDatabase.addApplicationFont('C:/Windows/Fonts/arial.ttf');QFontDatabase.addApplicationFont('C:/Windows/Fonts/arialbd.ttf');p=QgsProject.instance();p.setCrs(QgsCoordinateReferenceSystem('EPSG:3857'));p.setFilePathStorage(Qgis.FilePathType.Relative)
titles=['01 — RASSM: contur exterior','02 — RASSM: raioane','03 — Hotare interne','04 — Episoade istorice HURI','05 — Geometria ICR','06 — Corespondențe OSMB','07 — Trasări istorice independente','08 — Segmente istorice admise A/B','09 — Incertitudini și surse'];groups=[p.layerTreeRoot().addGroup(t) for t in titles]
def add(table,title,group,color,visible=False,width='.45',polygon=False):
 l=QgsVectorLayer(str(model)+'|layername='+table,title,'ogr');assert l.isValid(),table
 if l.geometryType()==Qgis.GeometryType.Line:l.renderer().setSymbol(QgsLineSymbol.createSimple({'line_color':color,'line_width':width,'line_style':'dash' if group==6 else 'solid'}))
 elif l.geometryType()==Qgis.GeometryType.Polygon:l.renderer().setSymbol(QgsFillSymbol.createSimple({'color':'0,0,0,0','outline_color':color,'outline_width':width}))
 p.addMapLayer(l,False);node=groups[group].addLayer(l);node.setItemVisibilityChecked(visible);l.setAbstract('Geometrie de cercetare clasa C. Data instantaneului nu este perioadă de valabilitate juridică.');return l
ext=add('RASSM_EXTERNAL_1937_C','RASSM exterior complet — HURI1937 candidat C',0,'#7a3528',True,'.95')
dist=add('RASSM_DISTRICTS_1937_C','14 poligoane candidate — Tiraspol: contradicție temporală',1,'#748899',True,'.12')
categories=[]
for i,f in enumerate(dist.getFeatures()):
 col=['#f1e2c5','#e3e9cf','#d8e8e6','#e7deee'][i%4];sym=QgsFillSymbol.createSimple({'color':col,'outline_color':'#8b9598','outline_width':'.15'});categories.append(QgsRendererCategory(f['huri_name'],sym,f['display_name']))
dist.setRenderer(QgsCategorizedSymbolRenderer('huri_name',categories))
settings=QgsPalLayerSettings();settings.fieldName='display_name';settings.placement=Qgis.LabelPlacement.OverPoint;fmt=QgsTextFormat();fmt.setFont(QFont('Arial',10));fmt.setSize(10);fmt.setColor(QColor('#26363e'));buffer=QgsTextBufferSettings();buffer.setEnabled(True);buffer.setSize(.7);buffer.setColor(QColor('white'));fmt.setBuffer(buffer);settings.setFormat(fmt);dist.setLabeling(QgsVectorLayerSimpleLabeling(settings));dist.setLabelsEnabled(True)
internal=add('RASSM_INTERNAL_BOUNDARIES_1937_C','Hotare interioare unice1937 — C',2,'#566a78',True,'.4')
for ep in ['19270301','19280815','19320320','19321025','19330401','19331215','19340530','19370115']:add('HURI_DISTRICTS_'+ep+'_C','HURI '+ep+' — instantaneu-sursă C',3,'#7b70a5')
add('HURI_EXTERNAL_8_SNAPSHOTS_C','Contururile celor8instantanee HURI',3,'#7b70a5')
add('RASSM_ICR_UNDATED_C','ICR nedatat — contur separat C',4,'#c07714',width='.8')
add('RASSM_OSMB_CANDIDATE_ARCS','OSMB MD/UA actual — corespondențe geometrice C',5,'#889c5a')
add('RASSM_PILOT_512_UNCHANGED_C','512cazuri pilot PROOF.6 — C neschimbate',5,'#c37041')
add('RASSM_HISTORICAL_TRACES_C','5trasări nominale moștenite — datum/pereche incerte',6,'#138d95',width='.7')
add('RASSM_DUBASARI_HYDROGRAPHY_C','Dubăsari — axă/anvelope hidrografice C, fără hotar juridic',6,'#1885aa')
for table in ['RASSM_EXTERNAL_ADMITTED_AB','RASSM_INTERNAL_ADMITTED_AB']:add(table,table+' — 0km admise',7,'#218854')
with sqlite3.connect(model) as c:tables=[r[0] for r in c.execute("SELECT table_name FROM gpkg_contents WHERE data_type='attributes'")]
for table in tables:add(table,table,8,'#000000')
for i,group in enumerate(groups):group.setExpanded(i<3)
ct=QgsCoordinateTransform(ext.crs(),p.crs(),p);box=ct.transformBoundingBox(ext.extent());box.scale(1.18);p.viewSettings().setDefaultViewExtent(QgsReferencedRectangle(box,p.crs()))
p.layerTreeRoot().setHasCustomLayerOrder(True);p.layerTreeRoot().setCustomLayerOrder([internal,ext,dist]+[l for l in p.mapLayers().values() if l.id() not in [internal.id(),ext.id(),dist.id()]])
title='RASSM — geometrie istorică de cercetare, clasa C; referință HURI 1937; limitele nu sunt certificate juridic.';p.setTitle(title);meta=p.metadata();meta.setTitle(title);meta.setAbstract(title+' Tiraspol: raionul desființat în1933 și reînființat la27august1937; reprezentarea în ianuarie1937 este contradictorie. ICR nedatat separat. A/B=0km.');p.setMetadata(meta)
file=O/'RASSM_LATEST_RESEARCH_C.qgz';p.setFileName(str(file));assert p.write()
s=QgsMapSettings();s.setDestinationCrs(p.crs());s.setOutputSize(QSize(1500,1250));s.setBackgroundColor(QColor('#fbfaf7'));s.setExtent(box);s.setLayers([internal,ext,dist]);job=QgsMapRendererSequentialJob(s);job.start();job.waitForFinished();im=job.renderedImage();paint=QPainter(im);paint.fillRect(20,15,1460,77,QColor('#ffffff'));paint.setPen(QColor('#283b45'));paint.setFont(QFont('Arial',15,QFont.Weight.Bold));paint.drawText(35,45,'RASSM — referință HURI 15 ianuarie1937, clasa C');paint.setFont(QFont('Arial',10));paint.drawText(35,72,'14 poligoane candidate • exterior941,310km • interior unic525,400km • A/B0km • Tiraspol: contradicție temporală');paint.end();assert im.save(str(W/'QGIS_initial_view.png'))
assert p.read(str(file));rows=[]
for l in p.mapLayers().values():
 assert l.isValid(),l.name();actual=sum(1 for _ in l.getFeatures());expected=l.featureCount();assert actual==expected,(l.name(),actual,expected);rows.append(dict(name=l.name(),provider=l.providerType(),features=actual,source=l.source()))
qa=dict(passed=True,project_reopened=True,all_vectors_from_single_central_GPKG=True,display_crs=p.crs().authid(),layers=len(rows),layer_records=rows,default_visible=['RASSM_EXTERNAL_1937_C','RASSM_DISTRICTS_1937_C','RASSM_INTERNAL_BOUNDARIES_1937_C'],no_online_basemap_dependency=True,visual_verified=False)
(W/'QGIS_validation.json').write_text(json.dumps(qa,ensure_ascii=False,indent=2)+'\n',encoding='utf-8');print(json.dumps(dict(passed=True,layers=len(rows))),flush=True);os._exit(0)
