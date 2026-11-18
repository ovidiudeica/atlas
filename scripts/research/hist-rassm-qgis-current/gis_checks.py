from pathlib import Path
import sys,sqlite3,json
R=Path.cwd();sys.path.insert(0,str(R/'work/python_deps'))
import geopandas as g,pyogrio,shapely
from pyproj import Geod
p=Path(sys.argv[1]);report=Path(sys.argv[2]);geo=Geod(ellps='WGS84');layers={}
with sqlite3.connect(p) as c:
 assert c.execute('PRAGMA integrity_check').fetchone()[0]=='ok';assert not c.execute('PRAGMA foreign_key_check').fetchall()
 assert c.execute('SELECT COUNT(*) FROM STABLE_PROOF2_ARC_REGISTER').fetchone()[0]==32722
for table,typ in pyogrio.list_layers(p):
 if typ is not None:
  d=g.read_file(p,layer=table);assert d.crs.to_epsg()==4326 and all(d.is_valid),table;layers[table]=len(d)
d=g.read_file(p,layer='RASSM_DISTRICTS_1937_C');ext=g.read_file(p,layer='RASSM_EXTERNAL_1937_C');inside=g.read_file(p,layer='RASSM_INTERNAL_BOUNDARIES_1937_C');assert len(d)==14 and len(ext)==1
length_ext=sum(abs(geo.geometry_length(x.boundary)) for x in ext.geometry);length_int=sum(abs(geo.geometry_length(x)) for x in inside.geometry);assert abs(length_ext-941310.4742762588)<.01 and abs(length_int-525399.9809064411)<.01
m=inside.to_crs(32635);duplicate=float(m.length.sum()-shapely.union_all(m.geometry.to_numpy()).length);assert abs(duplicate)<.01
union=shapely.union_all(d.geometry.to_numpy());outer=ext.geometry.iloc[0];difference=union.symmetric_difference(outer);area_m2=abs(geo.geometry_area_perimeter(difference)[0]) if not difference.is_empty else 0
# Source topology may contain tiny numerical residuals; do not redraw source geometry.
assert area_m2<10,area_m2
assert d[d.huri_name=='Tyraspol'].temporal_warning.str.contains('contradicted').all()
assert g.read_file(p,layer='RASSM_ICR_UNDATED_C').reference_date.isna().all()
assert all(layers['HURI_DISTRICTS_'+ep+'_C']==(14 if ep=='19370115' else 11) for ep in ['19270301','19280815','19320320','19321025','19330401','19331215','19340530','19370115'])
assert layers['RASSM_EXTERNAL_ADMITTED_AB']==layers['RASSM_INTERNAL_ADMITTED_AB']==0
traces=g.read_file(p,layer='RASSM_HISTORICAL_TRACES_C');assert len(traces)==traces.trace_id.nunique()==5
result=dict(passed=True,integrity_check='ok',geometries_valid=True,spatial_layers=len(layers),districts1937=14,episodes=8,external_m=length_ext,internal_unique_m=length_int,duplicate_internal_m=duplicate,source_district_union_vs_outer_residual_m2=area_m2,AB_km=0,ICR_undated=True,Tiraspol_conflict_retained=True,unique_traces=5)
report.write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result))
