from pathlib import Path
import os,sys,subprocess,json,hashlib
R=Path.cwd();sys.path.insert(0,str(R/'work/python_deps'))
import geopandas as gpd,pyogrio,rasterio,numpy as np
O=R/'outputs/13_HIST-RASSM_PROOF_4';T=R/'work/proof4/reproduction_fresh'
assert not T.exists(),'Fresh directory required'
env=dict(os.environ,PROOF4_OUTPUT=str(T));subprocess.run([sys.executable,'-X','utf8','work/proof4/build_proof4.py'],env=env,check=True,stdout=subprocess.DEVNULL)
checks={}
for n in ['03_GEOREFERENTIERE/native_frame.json','03_GEOREFERENTIERE/GCP_native_MSE5.csv','10_RAPORT_FINAL/sources.csv','10_RAPORT_FINAL/decisions_per_arc.csv','10_RAPORT_FINAL/four_trace_reassessment.csv','10_RAPORT_FINAL/summary.json']:
 checks[n]=(O/n).read_bytes()==(T/n).read_bytes();assert checks[n],n
count=0
for name,typ in pyogrio.list_layers(O/'RASSM_PROOF_4_temporal_C.gpkg'):
 if typ is None:continue
 a=gpd.read_file(O/'RASSM_PROOF_4_temporal_C.gpkg',layer=name);b=gpd.read_file(T/'RASSM_PROOF_4_temporal_C.gpkg',layer=name);assert a.geometry.to_wkb().tolist()==b.geometry.to_wkb().tolist();assert a.drop(columns='geometry').equals(b.drop(columns='geometry'));count+=len(a)
with rasterio.open(O/'03_GEOREFERENTIERE/MSE5_native_nominal_C.tif') as a,rasterio.open(T/'03_GEOREFERENTIERE/MSE5_native_nominal_C.tif') as b:
 assert a.transform==b.transform and a.crs==b.crs and np.array_equal(a.read(),b.read())
result=dict(passed=True,fresh_output_directory=True,network_used=False,full_reconciliation_rerun=False,byte_identical_files=checks,vector_features_WKB_and_attributes_identical=count,native_diagnostic_raster_pixels_transform_identical=True)
(O/'07_VALIDARE/reproduction.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result))
