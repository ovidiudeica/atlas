from pathlib import Path
import sys,os,subprocess,sqlite3,json
R=Path.cwd();sys.path.insert(0,str(R/'work/python_deps'))
import geopandas as g,pyogrio
W=R/'work/qgis_current';T=W/'independent_reproduction';assert not T.exists();env=os.environ.copy();env['CURRENT_OUTPUT']=str(T)
subprocess.run([sys.executable,'-X','utf8',str(W/'build_current.py')],env=env,check=True,stdout=subprocess.DEVNULL)
A=T/'RASSM_LATEST_RESEARCH_C.gpkg';B=R/'outputs/00_RASSM_QGIS_CURRENT/RASSM_LATEST_RESEARCH_C.gpkg';features=records=0
for table,typ in pyogrio.list_layers(A):
 if typ is not None:
  x=g.read_file(A,layer=table);y=g.read_file(B,layer=table);assert x.drop(columns='geometry').equals(y.drop(columns='geometry')) and x.geometry.to_wkb().tolist()==y.geometry.to_wkb().tolist(),table;features+=len(x)
 else:
  with sqlite3.connect(A) as a,sqlite3.connect(B) as b:xx=a.execute('SELECT * FROM "'+table+'"').fetchall();yy=b.execute('SELECT * FROM "'+table+'"').fetchall();assert xx==yy,table;records+=len(xx)
result=dict(passed=True,fresh_output=True,network_used=False,all_WKB_and_attributes_identical=True,vector_features_compared=features,attribute_records_compared=records)
(W/'reproduction.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result))
