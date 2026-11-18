from pathlib import Path
import sys,os,json,subprocess,sqlite3,hashlib
R=Path.cwd();sys.path.insert(0,str(R/'work/python_deps'))
import geopandas as g,pyogrio
W=R/'work/proof6_close';O=R/'outputs/15_HIST-RASSM_PROOF_6';T=W/'fresh_reproduction';assert not T.exists();env=os.environ.copy();env['PROOF6_OUTPUT']=str(T)
subprocess.run([sys.executable,'-X','utf8',str(R/'work/proof6/build_package.py')],env=env,check=True,stdout=subprocess.DEVNULL)
features=attributes=0;tables=[];csv=[]
for p in sorted(T.rglob('*.gpkg')):
 q=O/p.relative_to(T)
 for table,typ in pyogrio.list_layers(p):
  if typ is not None:
   a=g.read_file(p,layer=table);b=g.read_file(q,layer=table);assert a.drop(columns='geometry').equals(b.drop(columns='geometry')) and a.geometry.to_wkb().tolist()==b.geometry.to_wkb().tolist(),(p,table);features+=len(a)
  else:
   with sqlite3.connect(p) as c,sqlite3.connect(q) as d:aa=c.execute('SELECT * FROM "'+table+'"').fetchall();bb=d.execute('SELECT * FROM "'+table+'"').fetchall();assert aa==bb,(p,table);attributes+=len(aa)
  with sqlite3.connect(p) as c,sqlite3.connect(q) as d:assert c.execute('PRAGMA table_info("'+table+'")').fetchall()==d.execute('PRAGMA table_info("'+table+'")').fetchall(),table
  tables.append(dict(file=p.relative_to(T).as_posix(),table=table,schema_identical=True,WKB_and_attributes_identical=True))
for p in sorted(T.rglob('*.csv')):q=O/p.relative_to(T);assert p.read_bytes()==q.read_bytes(),p;csv.append(p.relative_to(T).as_posix())
original=O/'RASSM_PROOF_6_temporal_C.gpkg';rebuilt=T/original.name;result=dict(passed=True,independent_initially_empty_directory=True,network_used=False,original_binary_recovered=True,original_sha256=hashlib.sha256(original.read_bytes()).hexdigest(),rebuilt_sha256=hashlib.sha256(rebuilt.read_bytes()).hexdigest(),rebuilt_binary_equal=original.read_bytes()==rebuilt.read_bytes(),WKB_identical=True,attributes_identical=True,schemas_identical=True,vector_features_compared=features,attribute_records_compared=attributes,byte_identical_csv_registers=csv,tables=tables,note='Original binary remains the delivered file. SQLite reproduction binary is not claimed identical; table schemas, all feature WKB and attributes are compared explicitly.')
assert features==2238 and attributes==1071
(O/'09_VALIDARE/PROOF6_CLOSE_REPRODUCTION.json').write_text(json.dumps(result,indent=2)+'\n');(W/'reproduction.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps({k:result[k] for k in ['passed','original_binary_recovered','rebuilt_binary_equal','vector_features_compared','attribute_records_compared']}))
