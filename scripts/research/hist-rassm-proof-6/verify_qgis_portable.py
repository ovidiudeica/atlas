import os,json,zipfile,xml.etree.ElementTree as ET
from pathlib import Path
os.environ['QT_QPA_PLATFORM']='offscreen'
from qgis.core import *
O=Path.cwd()/'outputs/15_HIST-RASSM_PROOF_6';app=QgsApplication([],False);app.initQgis();p=QgsProject.instance();file=O/'10_QGIS/RASSM_PROOF_6_C.qgz';assert p.read(str(file));rows=[]
for l in p.mapLayers().values():
 assert l.isValid(),l.name()
 if isinstance(l,QgsVectorLayer):
  expected=l.featureCount();actual=sum(1 for f in l.getFeatures());rows.append(dict(name=l.name(),expected=expected,actually_iterated=actual,provider=l.providerType()));assert actual==expected,(l.name(),expected,actual)
with zipfile.ZipFile(file) as z:
 q=ET.fromstring(z.read(next(n for n in z.namelist() if n.endswith('.qgs'))));datasources=[x.text or '' for x in q.findall('.//projectlayers/maplayer/datasource')];assert all(not(len(x)>2 and x[1:3]==':/') for x in datasources)
result=dict(passed=True,separate_process_readback=True,all_layer_records_actually_iterated=True,relative_datasources_verified=True,layers=rows)
(O/'09_VALIDARE/QGIS_provider_iteration.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result),flush=True);os._exit(0)

