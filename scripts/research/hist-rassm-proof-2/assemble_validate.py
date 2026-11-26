import pathlib,sys,json,hashlib,shutil,sqlite3,warnings
ROOT=pathlib.Path.cwd();sys.path.insert(0,str(ROOT/'work/python_deps'));warnings.filterwarnings('ignore',category=DeprecationWarning)
import geopandas as gpd,pandas as pd,numpy as np,shapely
from shapely.geometry import Point,LineString,Polygon
from shapely.ops import transform
from pyproj import Geod,Transformer,CRS
O=ROOT/'outputs/11_HIST-RASSM_PROOF_2';N=O/'01_OSMB_RECONCILIERE';E=O/'02_HOTAR_EXTERIOR';D=O/'03_RAIOANE';C=O/'04_CONSILII_SATESTI';S=O/'05_SURSE_ISTORICE';V=O/'06_VALIDARE';P=O/'08_COD_SI_REPRODUCIBILITATE';R=O/'09_RAPORT_FINAL';gd=Geod(ellps='WGS84')
def dump(p,x):p.write_text(json.dumps(x,ensure_ascii=False,indent=2,allow_nan=False)+'\n',encoding='utf-8')
def csv(df,p):pd.DataFrame(df).to_csv(p,index=False,encoding='utf-8',lineterminator='\n')
def area(g):return abs(gd.geometry_area_perimeter(g)[0])/1e6
def glen(g):return gd.geometry_length(g)
def safe(df):
 df=df.copy()
 for c in df.columns:
  if c!='geometry' and df[c].dtype==object:df[c]=df[c].map(lambda x:json.dumps(x,ensure_ascii=False,sort_keys=True) if isinstance(x,(dict,list,np.ndarray)) else x)
 return df
arcs=gpd.read_file(N/'RASSM_OSMB_reconciliere.gpkg',layer='RASSM_BOUNDARY_ARCS');parents=gpd.read_file(D/'RASSM_arce_parinte.gpkg',layer='historical_parent_arcs');h=gpd.read_file(E/'RASSM_temporal.gpkg',layer='RASSM_EXTERNAL_BOUNDARIES');ra=gpd.read_file(D/'RASSM_raioane_candidate.gpkg',layer='RASSM_DISTRICTS');modern=gpd.read_file(N/'OSMB_arce_moderne.gpkg',layer='modern_arcs')
snapshot_checks=[];assembled=[];geoms=[];pairchecks=[]
for date,rs in ra.groupby('snapshot'):
 ext=h.loc[h.snapshot==date].geometry.iloc[0];pr=parents[(parents.episode==date)&(parents.kind=='INTERNAL')];lines=[ext.boundary]+pr.geometry.to_list();network=shapely.union_all(lines,grid_size=1e-10);faces=shapely.get_parts(shapely.polygonize(shapely.get_parts(network)));faces=[x for x in faces if ext.covers(x.representative_point())];used=[]
 for _,r in rs.iterrows():
  hits=[f for f in faces if r.geometry.covers(f.representative_point())]
  if hits:
   g=shapely.union_all(hits);used.append(g);meta=r.drop(labels='geometry').to_dict();meta.update(assembly='Polygonized historical candidate network at numerical1e-10degree grid; NOT independent reconstruction',source_polygon_changed=False,certainty='C',historical_admission=False,symmetric_difference_source_km2=area(g.symmetric_difference(r.geometry)),geodesic_area_km2=area(g));assembled.append(meta);geoms.append(g)
  else:pairchecks.append(dict(episode=date,district_id=r.district_id,issue='NO_CLOSED_FACE; retained source candidate separately'))
 total_geom=shapely.union_all(used);internal=shapely.union_all(pr.geometry.to_numpy());sumperim=sum(glen(x.boundary) for x in rs.geometry);nodedperim=glen(ext.boundary)+2*glen(internal);selected=arcs[(arcs.episode==date)&(arcs.kind=='INTERNAL')];outside=arcs[(arcs.episode==date)&(arcs.kind=='EXTERNAL')]
 snapshot_checks.append(dict(episode=date,source_districts=len(rs),assembled_districts=len(used),faces=len(faces),all_assembled_valid=all(x.is_valid for x in used),assembled_union_gap_km2=area(ext.difference(total_geom)),assembled_union_outside_km2=area(total_geom.difference(ext)),sum_perimeters_m=sumperim,external_plus_twice_internal_m=nodedperim,perimeter_identity_delta_m=sumperim-nodedperim,internal_network_unique_m=glen(internal),classified_internal_sum_m=float(selected.length_geodesic_m.sum()),classified_internal_delta_m=float(selected.length_geodesic_m.sum()-glen(internal)),classified_external_sum_m=float(outside.length_geodesic_m.sum()),classified_external_delta_m=float(outside.length_geodesic_m.sum()-glen(ext.boundary))))
adf=gpd.GeoDataFrame(assembled,geometry=geoms,crs=4326);safe(adf).to_file(D/'RASSM_raioane_asamblate_C.gpkg',layer='assembled_candidates_C',driver='GPKG');adf.to_file(D/'RASSM_raioane_asamblate_C.geojson',driver='GeoJSON',coordinate_precision=10);csv(adf.drop(columns='geometry'),D/'asamblare_per_raion.csv');csv(snapshot_checks,V/'validare_asamblare_temporala.csv')
assert len(adf)==91,'Some candidate districts cannot be closed; inspect before claiming completion'
assert all(x['all_assembled_valid'] and abs(x['perimeter_identity_delta_m'])<.05 and abs(x['classified_internal_delta_m'])<.1 and abs(x['classified_external_delta_m'])<.1 for x in snapshot_checks)
assert all(x['assembled_union_gap_km2']<.00001 and x['assembled_union_outside_km2']<.00001 for x in snapshot_checks)
assert not arcs.duplicated(['episode','kind','arc_id']).any()
assert arcs.is_valid.all() and arcs.is_simple.all();assert (arcs.length_geodesic_m>0).all()
summary=pd.read_csv(N/'registru_kilometric_per_episod.csv');assert (summary.partition_delta_m.abs()<1e-6).all();assert (summary.A_B_certified_km==0).all();assert (summary.admitted_OSMB_reuse_km==0).all()
per_district=pd.read_csv(D/'tabel_per_raion.csv');assert len(per_district)==91;assert ((per_district.total_geodesic_km-per_district.perimeter_geodesic_km).abs()*1000<.1).all(),'District perimeter allocation incomplete'
sens=pd.read_csv(N/'sensibilitate_per_episod.csv');assert all(np.all(np.diff(g.sort_values('tolerance_m').coverage_percent)>=-1e-8) for _,g in sens.groupby(['episode','kind']))
# Candidate modern source arcs retain original noded OSMB coordinates, with provenance.
ids=set(x for s in arcs.loc[(arcs.geometric_effective=='M2'),'modern_arc_ids'] for x in str(s).split(';') if x)
mc=modern[modern.modern_arc_id.isin(ids)].copy();mc['admitted_historical_reuse']=False;safe(mc).to_file(N/'RASSM_OSMB_arce_reutilizabile.gpkg',layer='OSMB_candidate_source_arcs_C',driver='GPKG')

# Reuse administrative evidence per stable ID. No council polygon is invented from a village point.
prior=ROOT/'outputs/09_HIST-RASSM_FINAL/02_ADMINISTRATIE_ISTORICA'
c35=pd.read_csv(prior/'RASSM_33_consilii_reverificate.csv');c37=pd.read_csv(prior/'RASSM_Tiraspol_21_reverificate.csv');c26=pd.read_csv(ROOT/'outputs/10_HIST-RASSM_PROOF_1/05_RAPORT_PROBATORIU/reconciliere_1926_12_obiecte.csv');events=pd.read_csv(prior/'RASSM_cronologie_acte_extinsa.csv')
for df in [c35,c37,c26]:df['proof2_geometry_admitted']=False;df['continuity_to_OSMB_proven']=False
assert len(c35)==33 and len(c37)==21 and len(c26)==12
csv(c35,C/'RASSM_1935_33_consilii.csv');csv(c37,C/'RASSM_1937_Tiraspol_21_consilii.csv');csv(c26,C/'RASSM_1926_11_transferuri_si_Hrabariivka.csv')
events['canonical_event_key']=events.event_id
mask=events.entity.eq('NOVOSELIVSKA');events.loc[mask,'canonical_event_key']='NOVOSELIVSKA_TRANSFER_1936';events['count_as_distinct_change']=True;events.loc[events.territorial_consequence_status.eq('SAME_TRANSFER_RESTATEMENT'),'count_as_distinct_change']=False
events.loc[events.territorial_consequence_status.isin(['NOT_PROVEN','NOT_PROOF_OF_EXISTENCE']),'count_as_distinct_change']=False
events.loc[events.event_id.isin(['R5B-EV-1933-FEB','R5B-EV-1933-JUL']),'canonical_event_key']='TIRASPOL_DISSOLUTION_1933'
events['geometry_admitted']=False;events['historical_geometry_status']='D; no authenticated allotment polygon';events.loc[events.document_date.isin(['1924-10-12','1924-11-26','1926-09-29']),'evidence_level']='PRIMARY_GAZETTE_PAGE_REPRODUCTION_RECOVERED_PROOF1';csv(events,C/'RASSM_evenimente_administrative.csv')
assert events[events.entity=='NOVOSELIVSKA'].count_as_distinct_change.sum()==1
special=events[events.entity.isin(['NOVOSELIVSKA','SMOLIANSKA','EXTERNAL_ODESSA_MASSR'])];csv(special,C/'Oleno_Korytske_Novoselivska_Smolianska.csv')
shutil.copy2(ROOT/'outputs/10_HIST-RASSM_PROOF_1/01_SURSE_PRIMARE/manifest_surse.json',S/'PROOF1_manifest_surse_reutilizate.json')
shutil.copy2(ROOT/'outputs/10_HIST-RASSM_PROOF_1/02_GCP_SI_GEOREFERENTIERE/GCP_independente.csv',S/'Dubasari_GCP_14FIT_8HOLDOUT_nominal.csv');shutil.copy2(ROOT/'outputs/10_HIST-RASSM_PROOF_1/02_GCP_SI_GEOREFERENTIERE/transformari.json',S/'Dubasari_georeferentiere_nominala.json')
source_records=json.loads((S/'PROOF1_manifest_surse_reutilizate.json').read_text(encoding='utf-8'))+json.loads((S/'OSMB_originals_manifest.json').read_text())
for x in source_records:
 for k,v in list(x.items()):
  if isinstance(v,(list,dict)):x[k]=json.dumps(v,ensure_ascii=False)
sources=pd.DataFrame(source_records);csv(sources,S/'RASSM_surselectie_reutilizare.csv')

# Temporal model: geometric layers + attribute tables for events/councils/sources (no fake points).
model=O/'RASSM_PROOF_2_temporal_C.gpkg'
if model.exists():model.unlink()
for df,layer in [(h,'RASSM_EXTERNAL_BOUNDARIES'),(adf,'RASSM_DISTRICTS'),(arcs,'RASSM_BOUNDARY_ARCS'),(arcs,'RASSM_OSMB_MATCHES'),(modern,'OSMB_MODERN_ARCS_C')]:safe(df).to_file(model,layer=layer,driver='GPKG')
hyd=gpd.read_file(E/'RASSM_temporal.gpkg',layer='RASSM_RECONSTRUCTED_ARCS_HYDROGRAPHIC_C');safe(hyd).to_file(model,layer='RASSM_RECONSTRUCTED_ARCS',driver='GPKG')
unc=arcs[['arc_id','episode','kind','M_category','certainty','temporal_conflict','reason','geometry']].copy();unc['absolute_uncertainty_m']=None;unc['temporal_validity_proven']=False;safe(unc).to_file(model,layer='RASSM_UNCERTAINTY',driver='GPKG')
con=sqlite3.connect(model)
councils=pd.concat([c35.assign(register='1935_33'),c37.assign(register='1937_TIR21'),c26.assign(register='1926_12')],ignore_index=True)
for name,df in [('RASSM_ADMIN_EVENTS',events),('RASSM_COUNCILS',councils),('RASSM_SOURCES',sources)]:
 safe(df).to_sql(name,con,index=False,if_exists='replace');con.execute('INSERT OR REPLACE INTO gpkg_contents(table_name,data_type,identifier,description,srs_id) VALUES(?,?,?,?,NULL)',(name,'attributes',name,'Historical evidence registry; no demonstrated spatial geometry'))
con.commit();con.close()
dump(V/'validation_checks.json',dict(all_passed=True,districts_analyzed=91,districts_assembled_C=len(adf),source_snapshots=8,source_polygons_unchanged=True,shared_boundaries_stored_once_per_episode=True,perimeter_identity_tolerance_m=.05,arc_partition_tolerance_m=.1,max_perimeter_identity_delta_m=max(abs(x['perimeter_identity_delta_m']) for x in snapshot_checks),max_internal_partition_delta_m=max(abs(x['classified_internal_delta_m']) for x in snapshot_checks),max_external_partition_delta_m=max(abs(x['classified_external_delta_m']) for x in snapshot_checks),councils_1935=33,councils_Tiraspol1937=21,transfer_objects1926=11,Hrabariivka_recognition=1,Novoselivska_distinct_changes=1,geometric_matching_is_historical_proof=False,admitted_A_B_km=0,numerical_grid_degrees=1e-10))
shutil.copy2(__file__,P/'assemble_validate.py');print(json.dumps(dict(districts_assembled=len(adf),arcs=len(arcs),model=str(model),checks='passed')),flush=True)
