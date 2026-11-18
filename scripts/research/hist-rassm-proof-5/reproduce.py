from pathlib import Path
import sys,subprocess,os,json
R=Path.cwd();sys.path.insert(0,str(R/'work/python_deps'))
import geopandas as g,pandas as pd,pyogrio
W=R/'work/proof5';O=R/'outputs/14_HIST-RASSM_PROOF_5';T=W/'fresh_reproduction_verified';assert not T.exists()
env=dict(os.environ,PROOF5_OUTPUT=str(T));subprocess.run([sys.executable,'-X','utf8',str(W/'build_package.py')],env=env,check=True,stdout=subprocess.DEVNULL)
csvs={}
for p in sorted((O/'11_RAPORT_FINAL').glob('*.csv')):
 csvs[p.name]=p.read_bytes()==(T/'11_RAPORT_FINAL'/p.name).read_bytes();assert csvs[p.name],p.name
features=0;attributes=0
for name,typ in pyogrio.list_layers(O/'RASSM_PROOF_5_temporal_C.gpkg'):
 a=g.read_file(O/'RASSM_PROOF_5_temporal_C.gpkg',layer=name);b=g.read_file(T/'RASSM_PROOF_5_temporal_C.gpkg',layer=name)
 if typ is not None:
  assert a.geometry.to_wkb().tolist()==b.geometry.to_wkb().tolist(),name;assert a.drop(columns='geometry').equals(b.drop(columns='geometry')),name;features+=len(a)
 else:assert a.equals(b),name;attributes+=len(a)
# Independently rerun the native pixel transform, rather than just copying the derived new trace.
subprocess.run([sys.executable,'-X','utf8',str(W/'compare_mse.py')],check=True,stdout=subprocess.DEVNULL)
a=g.read_file(W/'new_trace_C.gpkg');b=g.read_file(O/'RASSM_PROOF_5_temporal_C.gpkg',layer='RASSM_RECONSTRUCTED_ARCS');b=b[b.trace_id=='P5-MSE30-BALTA-BIRZULA-01'];assert a.iloc[0].geometry.wkb==b.iloc[0].geometry.wkb
result=dict(passed=True,independent_empty_output=True,network_used=False,general_reconciliation_rerun=False,byte_identical_registers=csvs,vector_features_WKB_and_attributes_identical=features,attribute_records_identical=attributes,new_native_pixel_transform_recomputed=True,new_trace_WKB_identical=True)
(O/'08_VALIDARE/reproduction.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result))
