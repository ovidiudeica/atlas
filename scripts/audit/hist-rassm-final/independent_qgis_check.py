import os,pathlib,json,sys
os.environ['QT_QPA_PLATFORM']='offscreen'
from qgis.core import *
app=QgsApplication([],False);app.initQgis();root=pathlib.Path.cwd()/'outputs/09_HIST-RASSM_FINAL';p=QgsProject.instance();assert p.read(str(root/'06_QGIS/RASSM_lucru_C.qgz'))
ref=QgsVectorLayer(str(root/'01_GEOMETRII_FINALE/RASSM_contur_referinta.gpkg')+'|layername=contur_lucru_C','ref','ogr');assert ref.isValid()
da=QgsDistanceArea();da.setSourceCrs(ref.crs(),p.transformContext());da.setEllipsoid('WGS84');geometry=next(ref.getFeatures()).geometry();qarea=da.measureArea(geometry)/1e6
summary=json.loads((root/'05_VALIDARE/rezumat_calculat.json').read_text(encoding='utf-8'));delta=abs(qarea-summary['reference_area_km2']);assert delta<1e-6
paths=['01_GEOMETRII_FINALE/RASSM_contur_referinta.gpkg','01_GEOMETRII_FINALE/RASSM_etape_teritoriale_1924_1940.gpkg','02_ADMINISTRATIE_ISTORICA/RASSM_raioane_context_C.gpkg','05_VALIDARE/RASSM_514_componente.gpkg']
checks=[]
for rel in paths:
 sublayers=QgsProviderRegistry.instance().querySublayers(str(root/rel))
 for item in sublayers:
  layer=QgsVectorLayer(item.uri(),item.name(),'ogr');assert layer.isValid();invalid=sum(not f.geometry().isGeosValid() for f in layer.getFeatures() if f.hasGeometry());assert invalid==0
  checks.append(dict(file=rel,layer=item.name(),features=layer.featureCount(),invalid=invalid))
result=dict(qgis_version=Qgis.QGIS_VERSION,method='QgsDistanceArea WGS84 ellipsoid independent of PyProj calling code',reference_area_km2=qarea,delta_vs_pyproj_km2=delta,tolerance_km2=1e-6,layers=checks,all_passed=True)
(root/'05_VALIDARE/QGIS_audit_independent.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8');print(json.dumps(result),flush=True);os._exit(0)
