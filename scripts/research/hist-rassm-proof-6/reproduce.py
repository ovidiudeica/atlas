from pathlib import Path
import os,sys,subprocess,json,sqlite3,hashlib
R=Path.cwd();sys.path.insert(0,str(R/'work/python_deps'))
import geopandas as g,pyogrio
O=R/'outputs/15_HIST-RASSM_PROOF_6';T=R/'work/proof6/reproduced_3'
assert not T.exists(),'Use a fresh empty reproduction directory'
before=(R/'work/proof6/1999_scope_per_arc.csv').read_bytes()
subprocess.run([sys.executable,'-X','utf8',str(R/'work/proof6/scope_1999.py')],check=True,stdout=subprocess.DEVNULL)
assert before==(R/'work/proof6/1999_scope_per_arc.csv').read_bytes()
env=os.environ.copy();env['PROOF6_OUTPUT']=str(T)
subprocess.run([sys.executable,'-X','utf8',str(R/'work/proof6/build_package.py')],env=env,check=True,stdout=subprocess.DEVNULL)
features=records=0;registers={}
for p in sorted(T.rglob('*.gpkg')):
 q=O/p.relative_to(T)
 for table,typ in pyogrio.list_layers(p):
  if typ is not None:
   a=g.read_file(p,layer=table);b=g.read_file(q,layer=table);assert a.drop(columns='geometry').equals(b.drop(columns='geometry')) and a.geometry.to_wkb().tolist()==b.geometry.to_wkb().tolist(),(p,table);features+=len(a)
  else:
   with sqlite3.connect(p) as c,sqlite3.connect(q) as d:aa=c.execute('SELECT * FROM "'+table+'"').fetchall();bb=d.execute('SELECT * FROM "'+table+'"').fetchall();assert aa==bb,(p,table);records+=len(aa)
for p in T.rglob('*.csv'):
 rel=p.relative_to(T).as_posix();registers[rel]=p.read_bytes()==(O/rel).read_bytes();assert registers[rel],rel
result=dict(passed=True,independent_empty_output=True,network_used=False,vector_features_WKB_and_attributes_identical=features,attribute_records_identical=records,byte_identical_registers=registers,scope_recomputed_separately=True,scope_input_provenance='scope_1999.py and source hashes; no general network audit')
(O/'09_VALIDARE/reproduction.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result))
