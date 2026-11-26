from pathlib import Path
import sys,os,json,sqlite3,hashlib
R=Path.cwd();sys.path.insert(0,str(R/'work/python_deps'))
import geopandas as g,pandas as pd,shapely,pyogrio
from pyproj import Geod
W=R/'work/qgis_current';O=Path(os.environ.get('CURRENT_OUTPUT',str(R/'outputs/00_RASSM_QGIS_CURRENT')));O.mkdir(parents=True,exist_ok=True)
P2=R/'outputs/11_HIST-RASSM_PROOF_2/RASSM_PROOF_2_temporal_C.gpkg';P5=R/'outputs/14_HIST-RASSM_PROOF_5/RASSM_PROOF_5_temporal_C.gpkg';P6=R/'outputs/15_HIST-RASSM_PROOF_6/RASSM_PROOF_6_temporal_C.gpkg';ICR=R/'outputs/09_HIST-RASSM_FINAL/07_REPRODUCIBILITATE/inputs/HIST-RASSM_4_GIS_HURI_ICR_NECERTIFICAT.gpkg'
sha=lambda p:hashlib.sha256(Path(p).read_bytes()).hexdigest()
assert sha(P2)=='4ae9ec315841246a07d3678bfda045d14c2e5a2567547835624c0172f605b494'
districts=g.read_file(P2,layer='RASSM_DISTRICTS');outer=g.read_file(P2,layer='RASSM_EXTERNAL_BOUNDARIES');arcs=g.read_file(P2,layer='RASSM_BOUNDARY_ARCS');modern=g.read_file(P2,layer='OSMB_MODERN_ARCS_C');icr=g.read_file(ICR,layer='icr_referinta');episode='1937-01-15';d37=districts[districts.snapshot==episode].copy();e37=outer[outer.snapshot==episode].copy();inside=arcs[(arcs.episode==episode)&(arcs.kind=='INTERNAL')].copy()
assert len(d37)==14 and len(outer)==8 and len(districts)==91 and len(icr)==1
comparisons=[]
def compare_districts(p,table,all8):
 x=g.read_file(p,layer=table);b=districts if all8 else d37
 key='district_id';xx=dict(zip(x[key],x.geometry.to_wkb()));bb=dict(zip(b[key],b.geometry.to_wkb()));assert xx==bb,(p,table)
 comparisons.append(dict(stage=p.parent.name,table=table,records=len(x),WKB_identical=True))
for folder in ['12_HIST-RASSM_PROOF_3','13_HIST-RASSM_PROOF_4']:compare_districts(next((R/'outputs'/folder).glob('*.gpkg')),'HURI_1937_DISTRICTS_REFERENCE_C',False)
compare_districts(P5,'RASSM_DISTRICT_REFERENCE_8_EPISODES_C',True);compare_districts(P6,'DISTRICT_REFERENCE_8_EPISODES_C',True)
pilot=g.read_file(P6,layer='RASSM_SOURCE_BOUNDARIES');lookup=dict(zip(arcs.arc_id,arcs.geometry.to_wkb()));assert all(row.geometry.wkb==lookup[row.arc_id] for _,row in pilot.iterrows());assert len(pilot)==512
traces=g.read_file(P6,layer='RETAINED_PROOF5_NOMINAL_C_TRACES');t5=g.read_file(P5,layer='RASSM_RECONSTRUCTED_ARCS');assert dict(zip(traces.trace_id,traces.geometry.to_wkb()))==dict(zip(t5.trace_id,t5.geometry.to_wkb())) and traces.trace_id.nunique()==5
traces['consolidation_note']='Retained unique traces; not newly reconstructed in QGIS-CURRENT.1; nominal positioning, not legal certification'
for data in [districts,d37]:
 data['reference_date']=data.snapshot;data['source_stage']='PROOF.2 WKB unchanged through PROOF.6';data['temporal_warning']=data.huri_name.map(lambda n:'Tiraspol raion dissolved1933; recreated27August1937: January1937district identity contradicted' if n=='Tyraspol' else 'Source snapshot date is not certified legal validity');data['display_name']=data.huri_name.map(lambda n:('Tiraspol [contradicție temporală]' if n=='Tyraspol' else n));data['historical_class']='C';data['legal_certification']=False
e37['reference_date']=episode;e37['historical_class']='C';e37['legal_certification']=False
icr['reference_date']=None;icr['time_status']='UNDATED; do not assign1937';icr['historical_class']='C';icr['legal_certification']=False
# Read existing correspondence classifications; no matching or historical audit is rerun.
links={mid:set() for mid in modern.modern_arc_id};ids={mid:set() for mid in modern.modern_arc_id}
for _,row in arcs.iterrows():
 for mid in str(row.modern_arc_ids).split(';'):
  if mid in links:links[mid].add(str(row.M_category));ids[mid].add(str(row.arc_id))
modern['M_categories_existing']='';modern['stable_PROOF2_arc_ids']='';modern['country']='';modern['snapshot']='';modern['osm_ids']=''
for idx,row in modern.iterrows():
 objs=json.loads(row.source_objects);modern.at[idx,'M_categories_existing']=';'.join(sorted(links[row.modern_arc_id]));modern.at[idx,'stable_PROOF2_arc_ids']=';'.join(sorted(ids[row.modern_arc_id]));modern.at[idx,'country']=';'.join(sorted({str(x.get('country','')) for x in objs}));modern.at[idx,'snapshot']=';'.join(sorted({str(x.get('snapshot','')) for x in objs}));modern.at[idx,'osm_ids']=';'.join(sorted({str(x.get('osm_id','')) for x in objs}))
modern['historical_class']='C';modern['historical_reuse_admitted']=False;modern['evidence']='Existing PROOF.2 geometric correspondence only; no independent historical continuity proved'
model=O/'RASSM_LATEST_RESEARCH_C.gpkg'
if model.exists():model.unlink()
vectors=[('RASSM_EXTERNAL_1937_C',e37),('RASSM_DISTRICTS_1937_C',d37),('RASSM_INTERNAL_BOUNDARIES_1937_C',inside),('RASSM_ICR_UNDATED_C',icr),('RASSM_OSMB_CANDIDATE_ARCS',modern),('RASSM_HISTORICAL_TRACES_C',traces),('RASSM_PILOT_512_UNCHANGED_C',pilot)]
for ep in sorted(districts.snapshot.unique()):vectors.append(('HURI_DISTRICTS_'+ep.replace('-','')+'_C',districts[districts.snapshot==ep]))
vectors.append(('HURI_EXTERNAL_8_SNAPSHOTS_C',outer))
hydro=g.read_file(R/'outputs/15_HIST-RASSM_PROOF_6/08_DUBASARI/HIST_RASSM_PROOF_1_C_unchanged.gpkg',layer='hidrografie_noua_C');vectors.append(('RASSM_DUBASARI_HYDROGRAPHY_C',hydro))
for table,data in vectors:data.to_file(model,layer=table,driver='GPKG')
empty=g.GeoDataFrame({'arc_id':pd.Series(dtype='str'),'historical_class':pd.Series(dtype='str'),'reason':pd.Series(dtype='str')},geometry=g.GeoSeries([],crs=4326),crs=4326)
for table in ['RASSM_EXTERNAL_ADMITTED_AB','RASSM_INTERNAL_ADMITTED_AB']:empty.to_file(model,layer=table,driver='GPKG',geometry_type='LineString')
tables=[]
with sqlite3.connect(P2) as c:
 for old,new in [('RASSM_SOURCES','SOURCES_PROOF2'),('RASSM_ADMIN_EVENTS','ADMINISTRATIVE_CONTRADICTIONS'),('RASSM_COUNCILS','COUNCILS_CONTEXT_PROOF2')]:tables.append((new,pd.read_sql_query('SELECT * FROM '+old,c)))
with sqlite3.connect(P6) as c:
 for table in ['BOUNDARY_CONTINUITY','ADMINISTRATIVE_EVENTS','SOURCES_AND_DECISIONS','COUNCILS_1988_PRIMARY_REFERENCE','UKRAINE_CENTRE_CODE_CROSSWALK','UKRAINE_PREDECESSOR_TEXT','MD_UA_TREATY_SCOPE','INHERITED_PROOF5_EVENT_CONTEXT','INHERITED_PROOF5_SOURCE_EVIDENCE']:tables.append(('PROOF6_'+table,pd.read_sql_query('SELECT * FROM '+table,c)))
with sqlite3.connect(P5) as c:tables.append(('UNCERTAINTY_PILOT_512',pd.read_sql_query('SELECT * FROM RASSM_UNCERTAINTY',c)))
tables+=[('STABLE_PROOF2_ARC_REGISTER',arcs.drop(columns='geometry')),('EPISODE_REGISTER',pd.DataFrame([dict(snapshot=ep,district_count=len(districts[districts.snapshot==ep]),status='CANDIDATE_SOURCE_SNAPSHOT_NOT_LEGAL_VALIDITY',external_geometry_unchanged=True) for ep in sorted(districts.snapshot.unique())])),('ADMISSION_STATUS',pd.DataFrame([dict(kind=k,M1_km=0,AB_km=0,historical_class='C',legal_certified=False,reason='No independent geometric continuity evidence admitted through PROOF.6') for k in ['EXTERNAL','INTERNAL']])),('VERSION_GEOMETRY_COMPARISON',pd.DataFrame(comparisons))]
with sqlite3.connect(model) as c:
 for table,df in tables:
  df.to_sql(table,c,index=False,if_exists='replace');c.execute('INSERT INTO gpkg_contents(table_name,data_type,identifier,description,srs_id) VALUES(?,?,?,?,NULL)',(table,'attributes',table,'Consolidated original evidence; not legal certification'))
 assert c.execute('PRAGMA integrity_check').fetchone()[0]=='ok';assert not c.execute('PRAGMA foreign_key_check').fetchall()
geo=Geod(ellps='WGS84');external_m=sum(abs(geo.geometry_length(x.boundary if x.geom_type in ['Polygon','MultiPolygon'] else x)) for x in e37.geometry);internal_m=sum(abs(geo.geometry_length(x)) for x in inside.geometry)
assert abs(external_m-941310.4742762588)<.01,external_m;assert abs(internal_m-525399.9809064411)<.01,internal_m
metric=inside.to_crs(32635);unique_m=float(shapely.union_all(metric.geometry.to_numpy()).length);overlap_m=float(metric.length.sum()-unique_m);assert abs(overlap_m)<.01
counts={};wkb_checks={}
for table,data in vectors:
 b=g.read_file(model,layer=table);assert b.crs.to_epsg()==4326 and all(b.is_valid),table;assert b.geometry.to_wkb().tolist()==data.geometry.to_wkb().tolist(),table;counts[table]=len(b);wkb_checks[table]=True
for table in ['RASSM_EXTERNAL_ADMITTED_AB','RASSM_INTERNAL_ADMITTED_AB']:assert len(g.read_file(model,layer=table))==0;counts[table]=0
validation=dict(passed=True,external_geodesic_m=external_m,internal_unique_geodesic_m=internal_m,internal_duplicate_overlap_m=overlap_m,districts1937=14,historical_episodes=8,reference_district_records=91,ICR_undated=True,unique_historical_traces=5,pilot_IDs_and_WKB_unchanged=512,geometry_class='C',AB_km=0,physical_GCP_admitted=0,absolute_accuracy_m=None,all_geometries_valid=True,all_vector_crs='EPSG:4326',WKB_identical_to_inputs=wkb_checks,layer_counts=counts,comparisons=comparisons,integrity_check='ok',general_historical_audit_rerun=False)
(W/'GIS_validation.json').write_text(json.dumps(validation,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
version=dict(package='HIST-RASSM.QGIS-CURRENT.1',date='2026-11-18',class_historical='C',geometry_basis='PROOF.2 complete HURI candidate geometry; WKB unchanged through PROOF.6',HURI_reference='1937-01-15',ICR_date=None,episodes=sorted(districts.snapshot.unique()),inputs=[dict(name=p.name,sha256=sha(p),role=role) for p,role in [(P2,'Complete geometry and stable classifications'),(P5,'Unique5traces and uncertainty'),(P6,'Latest metadata and frozen geometry verification'),(ICR,'Undated ICR original reference')]],GIS_validation=validation,permanent_folder='PRIVATE_DESTINATION_RECORDED_IN_DELIVERY_RECEIPT',PROOF6_delivery_at_start='Partial:17sourcefiles;11emptyfolders; not represented as completed',prior_PRs_modified=False,ACTUAL_modified=False,Atlas_application_modified=False)
(O/'SOURCE_VERSION.json').write_text(json.dumps(version,ensure_ascii=False,indent=2)+'\n',encoding='utf-8');print(json.dumps({k:validation[k] for k in ['passed','external_geodesic_m','internal_unique_geodesic_m','districts1937','unique_historical_traces','internal_duplicate_overlap_m']}))
