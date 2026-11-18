"""Offline semantic GIS rebuild from hash-pinned PROOF6 geometry and PROOF7 registers.
Usage: python reproduce.py PACKAGE_ROOT NEW_OUTPUT_GPKG
Requires geopandas/pandas/pyogrio and their native GIS dependencies.
No network; no historical geometry or new controls inferred.
"""
from pathlib import Path
import sys,hashlib,sqlite3,json
sys.path.insert(0,str(Path.cwd()/'work/python_deps'))
import geopandas as g,pandas as pd
root=Path(sys.argv[1]).resolve();out=Path(sys.argv[2]).resolve();assert not out.exists();src=root/'11_COD/PROOF6_FROZEN_INPUT.gpkg'
assert hashlib.sha256(src.read_bytes()).hexdigest()=='c482fdf9cff8b28ae1e3df3fb85d9b32927f212b5aa0dba2a28dd0b38726a990'
a=g.read_file(src,layer='RASSM_SOURCE_BOUNDARIES');empty=g.GeoDataFrame({'arc_id':pd.Series(dtype='str'),'reason':pd.Series(dtype='str')},geometry=g.GeoSeries([],crs=4326),crs=4326)
for n in ['EXTERNAL_ADMITTED_AB','INTERNAL_ADMITTED_AB']:empty.to_file(out,layer='RASSM_PROOF7_'+n,driver='GPKG',geometry_type='LineString')
for k in ['EXTERNAL','INTERNAL']:a[a.kind==k].to_file(out,layer='RASSM_PROOF7_'+k+'_CANDIDATES',driver='GPKG')
a.to_file(out,layer='RASSM_PROOF7_UNRESOLVED',driver='GPKG');tr=g.read_file(src,layer='RETAINED_PROOF5_NOMINAL_C_TRACES');tr['PROOF7_status']='INHERITED_NOMINAL_C_NOT_NEW_RECONSTRUCTION';tr.to_file(out,layer='RASSM_PROOF7_INDEPENDENT_TRACES',driver='GPKG')
for old,new in [('CURRENT_OSMB_REFERENCE_C','RETAINED_MODERN_OSMB_C'),('DISTRICT_REFERENCE_8_EPISODES_C','RETAINED_DISTRICT_EPISODES_C')]:g.read_file(src,layer=old).to_file(out,layer=new,driver='GPKG')
def attrs(t,df):
 with sqlite3.connect(out) as c:
  df.to_sql(t,c,index=False,if_exists='replace');c.execute('INSERT OR REPLACE INTO gpkg_contents(table_name,data_type,identifier,description,srs_id) VALUES(?,?,?,?,NULL)',(t,'attributes',t,'Research evidence/context; not official legal certification'))
r=root/'12_RAPORT_FINAL';dec=pd.read_csv(r/'PROOF7_arc_decisions.csv');attrs('RASSM_PROOF7_TEMPORAL_CONTINUITY',dec);attrs('RASSM_PROOF7_SOURCE_EVIDENCE',pd.read_csv(r/'PROOF7_primary_sources.csv'));attrs('RASSM_PROOF7_UNCERTAINTY',dec[['arc_id','absolute_uncertainty_m','PROOF7_class','decision']]);attrs('PROOF7_ARCHIVAL_TARGETS',pd.read_csv(r/'PROOF7_archival_targets.csv'))
for f in ['PROOF7_primary_sources','PROOF7_source_authentication','PROOF7_original_maps','PROOF7_georeferencing','PROOF7_independent_GCP','PROOF7_boundary_admissions','PROOF7_comparison_PROOF6_PROOF7']:attrs(f,pd.read_csv(r/(f+'.csv')))
with sqlite3.connect(out) as c:c.execute("UPDATE gpkg_contents SET min_x=0,min_y=0,max_x=0,max_y=0 WHERE table_name IN ('RASSM_PROOF7_EXTERNAL_ADMITTED_AB','RASSM_PROOF7_INTERNAL_ADMITTED_AB')")
# Compare all application tables, columns, attribute values and geometry blobs; SQLite layout/time stamps may differ.
with sqlite3.connect(root/'RASSM_PROOF_7_temporal_C.gpkg') as old,sqlite3.connect(out) as new:
 tabs=[x[0] for x in old.execute('SELECT table_name FROM gpkg_contents')]
 for t in tabs:
  assert old.execute('PRAGMA table_info("'+t+'")').fetchall()==new.execute('PRAGMA table_info("'+t+'")').fetchall(),('schema',t)
  assert old.execute('SELECT * FROM "'+t+'"').fetchall()==new.execute('SELECT * FROM "'+t+'"').fetchall(),('records',t)
 assert new.execute('PRAGMA integrity_check').fetchone()[0]=='ok'
result=dict(passed=True,offline=True,application_tables_compared=len(tabs),all_schemas_attributes_and_geometry_blobs_identical=True,binary_SQLite_hash_identity_required=False,semantic_rebuild_not_original_file_substitution=True)
out.with_suffix('.validation.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result))
