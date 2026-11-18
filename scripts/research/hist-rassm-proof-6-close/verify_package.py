from pathlib import Path
import sys,json,hashlib,sqlite3,re
R=Path.cwd();sys.path.insert(0,str(R/'work/python_deps'))
import geopandas as g,pandas as pd,pyogrio,shapely
from pyproj import Geod
root=Path(sys.argv[1]);manifest=Path(sys.argv[2]);output=Path(sys.argv[3]);expected=json.loads(manifest.read_text(encoding='utf-8'));sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
for x in expected:
 p=root/x['relative'];assert p.stat().st_size==x['bytes'] and sha(p)==x['sha256'],x['relative']
model=root/'RASSM_PROOF_6_temporal_C.gpkg';assert sha(model)=='c482fdf9cff8b28ae1e3df3fb85d9b32927f212b5aa0dba2a28dd0b38726a990'
layers={};feature_count=0
for p in sorted(root.rglob('*.gpkg')):
 with sqlite3.connect(p) as c:assert c.execute('PRAGMA integrity_check').fetchone()[0]=='ok';assert not c.execute('PRAGMA foreign_key_check').fetchall()
 for table,typ in pyogrio.list_layers(p):
  if typ is not None:
   d=g.read_file(p,layer=table);assert d.crs.to_epsg()==4326 and all(d.is_valid),(p,table);layers[p.relative_to(root).as_posix()+':'+table]=len(d);feature_count+=len(d)
a=g.read_file(model,layer='RASSM_SOURCE_BOUNDARIES');assert len(a)==a.arc_id.nunique()==512;register=pd.read_csv(root/'12_RAPORT_FINAL/PROOF6_continuitate_per_arc.csv');assert set(a.arc_id)==set(register.arc_id)
by=register.set_index('arc_id')
for _,row in a.iterrows():assert hashlib.sha256(row.geometry.wkb).hexdigest()==by.loc[row.arc_id,'geometry_sha256'] and row.M_category==by.loc[row.arc_id,'previous_M']==by.loc[row.arc_id,'new_M']
assert not register.PROOF6_geometry_admitted.any() and not register.PROOF6_geometric_chain_complete.any()
assert a.groupby('corridor_id').size().to_dict()==dict(C1=64,C2=133,C3=126,C4=189)
inside=a[a.kind=='INTERNAL'];metric=inside.to_crs(32635);overlap=float(metric.length.sum()-shapely.union_all(metric.geometry.to_numpy()).length);assert abs(overlap)<.01
geo=Geod(ellps='WGS84');lengths={k:sum(abs(geo.geometry_length(x)) for x in a[a.kind==k].geometry) for k in ['EXTERNAL','INTERNAL']};assert abs(lengths['EXTERNAL']-49980.07746358879)<.001 and abs(lengths['INTERNAL']-148198.2296404938)<.001
logs=(root/'09_VALIDARE/tests.log').read_text(encoding='utf-8');assert re.search(r'pass 301\b',logs) and re.search(r'fail 0\b',logs);assert 'built in' in (root/'09_VALIDARE/build_atlas.log').read_text(encoding='utf-8')
summary=json.loads((root/'12_RAPORT_FINAL/summary.json').read_text(encoding='utf-8'));assert summary['verdict']=='PROOF.6-C'
for k in ['new_M1_km','new_external_AB_km','new_internal_AB_km','physical_GCP_admitted','new_historically_founded_boundary_km','geometric_chains_complete']:assert summary[k]==0,k
result=dict(passed=True,original_binary_manifest_files_verified=len(expected),original_main_GPKG_binary_identical=True,original_main_GPKG_sha256=sha(model),all_GPKG_integrity='ok',all_vector_geometries_valid=True,all_vector_crs='EPSG:4326',vector_features_checked=feature_count,stable_arc_IDs=512,per_arc_WKB_sha256_verified=512,M_classifications_unchanged=True,pilot_external_m=lengths['EXTERNAL'],pilot_unique_internal_m=lengths['INTERNAL'],internal_duplicate_overlap_m=overlap,original_tests_passed=301,original_build_passed=True,historical_verdict_unchanged='PROOF.6-C',AB_M1_GCP_and_new_historical_reconstruction=0,layer_counts=layers)
output.write_text(json.dumps(result,indent=2)+'\n');print(json.dumps({k:result[k] for k in ['passed','original_binary_manifest_files_verified','stable_arc_IDs','per_arc_WKB_sha256_verified']}))
