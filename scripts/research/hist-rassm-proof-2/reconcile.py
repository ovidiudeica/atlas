"""PROOF.2a: explicit metric correspondence, without automatic historical admission."""
import pathlib,sys,json,hashlib,math,warnings,shutil,sqlite3,os,pickle
ROOT=pathlib.Path.cwd();sys.path.insert(0,str(ROOT/'work/python_deps'))
import geopandas as gpd,pandas as pd,numpy as np,shapely
from shapely.geometry import Point,LineString,Polygon,box
from shapely.ops import transform,substring,nearest_points
from shapely.strtree import STRtree
from pyproj import Transformer,Geod,CRS
warnings.filterwarnings('ignore',category=DeprecationWarning)
OUT=ROOT/'outputs/11_HIST-RASSM_PROOF_2';N=OUT/'01_OSMB_RECONCILIERE';E=OUT/'02_HOTAR_EXTERIOR';D=OUT/'03_RAIOANE';C=OUT/'04_CONSILII_SATESTI';S=OUT/'05_SURSE_ISTORICE';V=OUT/'06_VALIDARE';Q=OUT/'07_QGIS';P=OUT/'08_COD_SI_REPRODUCIBILITATE';R=OUT/'09_RAPORT_FINAL'
for p in [N,E,D,C,S,V,Q,P,R]:p.mkdir(parents=True,exist_ok=True)
metric=CRS.from_proj4('+proj=aeqd +lat_0=47.5 +lon_0=29.5 +datum=WGS84 +units=m +no_defs');tm=Transformer.from_crs(4326,metric,always_xy=True);tl=Transformer.from_crs(metric,4326,always_xy=True);geod=Geod(ellps='WGS84');TOLS=[1,10,25,50,100,250,500]
def dump(p,x):p.write_text(json.dumps(x,ensure_ascii=False,indent=2,allow_nan=False)+'\n',encoding='utf-8')
def jid(g,prefix):return prefix+'-'+hashlib.sha256(shapely.normalize(g).wkb).hexdigest()[:18]
def parts(g):
 if g.is_empty:return []
 if g.geom_type=='LineString':return [g] if g.length>0 else []
 return [p for a in getattr(g,'geoms',[]) for p in parts(a)]
def canonical(g):
 return shapely.normalize(Polygon(g.coords)).exterior if g.is_ring else shapely.normalize(g)
def merged(g):
 a=parts(g)
 return [canonical(x) for x in parts(shapely.line_merge(shapely.union_all(a)))] if a else []
def glen(g):return float(geod.geometry_length(g))
def clean(df):
 df=df.copy()
 for c in df.columns:
  if c!='geometry' and df[c].dtype==object:df[c]=df[c].map(lambda x:json.dumps(x,ensure_ascii=False,sort_keys=True) if isinstance(x,(dict,list,np.ndarray)) else x)
 return df
def save(df,path,layer):
 clean(df).to_file(path,layer=layer,driver='GPKG')
def flat(rows,geoms):return gpd.GeoDataFrame(rows,geometry=geoms,crs=4326)
def csv(df,p):pd.DataFrame(df).to_csv(p,index=False,encoding='utf-8',lineterminator='\n')
src=ROOT/'work/sources/HIST-RASSM_4_GIS_HURI_ICR_NECERTIFICAT.gpkg';h=gpd.read_file(src,layer='huri_contururi');ra=gpd.read_file(src,layer='huri_raioane');icr=gpd.read_file(src,layer='icr_referinta');study=shapely.union_all(h.geometry.to_numpy()).buffer(.1)
sectors=gpd.read_file(ROOT/'work/sources/HIST-RASSM_5_pachet_audit_2026-11-17/HIST-RASSM_5_sectoare_3x3.geojson');sector_lines=transform(tm.transform,shapely.union_all(sectors.geometry.boundary.to_numpy()))
rawmodern=[];audit_sources=[];excluded=[]
for country,date in [('Moldova','2026-10-05'),('Ukraine','2026-11-09')]:
 df=gpd.read_file(ROOT/'work/proof2/inputs.gpkg',layer=country);df['country']=country;df['snapshot']=date;df['original_geometry_sha256']=df.geometry.map(lambda x:hashlib.sha256(x.wkb).hexdigest());df['source_drive_id']='1bezJvDbyE0E1ZXt3ZXmdSfxGko64Q1Fl' if country=='Moldova' else '1k8qD3o1TvZXvlPux7KBH6UdVEyBkRyxk'
 # Keep other semantics in the evidence inventory, never call them current administrative limits.
 mask=(df['boundary']=='administrative')&df.admin_level.notna();ex=df[~mask].copy();excluded.extend(ex.drop(columns='geometry').to_dict('records'));df=df[mask].copy();df['osm_element_type']=np.where(df.osm_id<0,'relation','way');df['osm_positive_id']=df.osm_id.abs();rawmodern.append(df)
 audit_sources.append(dict(country=country,source_snapshot=date,relevant_original_objects=len(df),excluded_other_semantics=len(ex),admin_levels={str(k):int(v) for k,v in df.admin_level.value_counts().sort_index().items()},invalid_original=int((~df.is_valid).sum())))
modern=gpd.GeoDataFrame(pd.concat(rawmodern,ignore_index=True),crs=4326);save(modern,N/'OSMB_original_objects_relevant.gpkg','original_objects');csv(clean(pd.DataFrame(excluded)),N/'OSMB_excluded_noncurrent_or_other_semantics.csv')
boundaries=[];prows=[];repairs=[]
for idx,r in modern.iterrows():
 geom=r.geometry
 if not geom.is_valid:repairs.append(dict(osm_id=int(r.osm_id),action='make_valid derived network only',source_geometry_unchanged=True));geom=shapely.make_valid(geom)
 b=geom.boundary.intersection(study);boundaries.append(b);prows.append(dict(country=r.country,snapshot=r.snapshot,osm_id=int(r.osm_id),admin_level=int(r.admin_level),name=r['name'],positive_id=int(r.osm_positive_id)))
print('modern objects',len(modern),'building noded network',flush=True)
net=shapely.union_all(boundaries);mg=merged(net);btree=STRtree(boundaries);mrows=[]
for g in mg:
 mid=g.interpolate(.43,normalized=True);ids=btree.query(mid.buffer(1e-8));owners=[int(i) for i in ids if boundaries[int(i)].distance(mid)<1e-8]
 if not owners:owners=[int(btree.nearest(mid))]
 mrows.append(dict(modern_arc_id=jid(g,'OSMB'),source_objects=json.dumps([prows[i] for i in owners],ensure_ascii=False),source_osm_ids=';'.join(str(prows[i]['osm_id']) for i in owners),countries=';'.join(sorted(set(prows[i]['country'] for i in owners))),admin_levels=';'.join(str(x) for x in sorted(set(prows[i]['admin_level'] for i in owners))),length_geodesic_m=glen(g),certainty='C',reuse_historical_admitted=False))
marcs=flat(mrows,mg);save(marcs,N/'OSMB_arce_moderne.gpkg','modern_arcs');mm=[transform(tm.transform,g) for g in mg];mtree=STRtree(mm);print('modern noded arcs',len(mg),flush=True)
dump(V/'OSMB_source_audit.json',dict(original_archives=json.loads((ROOT/'work/proof2/sources/originals_manifest.json').read_text()),countries=audit_sources,geometry_repairs=repairs,modern_network_arcs=len(mg),extract_extent='union of eight HURI + 0.1 degree search margin; full original objects retained',license='© OpenStreetMap contributors, ODbL; snapshot pinned, no live replacement'))
shutil.copy2(ROOT/'work/proof2/sources/originals_manifest.json',S/'OSMB_originals_manifest.json')

# Historical source polygons remain immutable. Source dates are not certified legal validity.
h['certainty']='C';h['historical_valid_from']=None;h['historical_valid_to']=None;h['time_status']='CANDIDATE_SOURCE_SNAPSHOT_ONLY';save(h,E/'RASSM_temporal.gpkg','RASSM_EXTERNAL_BOUNDARIES')
ra['district_id']=ra.apply(lambda r:'DIST-'+r.snapshot+'-'+r.source_id,axis=1);ra['certainty']='C';ra['historical_valid_from']=None;ra['historical_valid_to']=None
ra['legal_semantic_conflict']=ra.apply(lambda r:('tyr' in r.huri_name.lower() or 'tiras' in r.huri_name.lower()) and '1933-07-04'<=r.snapshot<'1937-08-27',axis=1)
ra['entity_interpretation']=np.where(ra.legal_semantic_conflict,'UNRESOLVED_CITY_COUNCIL_TERRITORY_NOT_CERTIFIED_RAION','HURI_DISTRICT_CANDIDATE');save(ra,D/'RASSM_raioane_candidate.gpkg','RASSM_DISTRICTS')
parents=[];pg=[];topo=[]
for _,r in h.iterrows():
 for g in merged(r.geometry.boundary):parents.append(dict(parent_id=jid(g,'EXT'),episode=r.snapshot,kind='EXTERNAL',unit_a='RASSM',unit_b='OUTSIDE',unit_ids='',source='HURI',temporal_conflict=False,primary_tolerance_m=100));pg.append(g)
for g in merged(icr.geometry.iloc[0].boundary):parents.append(dict(parent_id=jid(g,'ICR'),episode='ICR_UNDATED',kind='EXTERNAL',unit_a='ICR_REFERENCE',unit_b='OUTSIDE',unit_ids='',source='ICR',temporal_conflict=False,primary_tolerance_m=50));pg.append(g)
for date,rs in ra.groupby('snapshot'):
 pp=rs.geometry.to_list();shared=[]
 for i in range(len(rs)):
  for j in range(i+1,len(rs)):
   one,two=rs.iloc[i],rs.iloc[j];gs=merged(shapely.intersection(pp[i].boundary,pp[j].boundary,grid_size=1e-10))
   for g in gs:
    shared.append(g);parents.append(dict(parent_id=jid(g,'INT'),episode=date,kind='INTERNAL',unit_a=one.huri_name,unit_b=two.huri_name,unit_ids=one.district_id+';'+two.district_id,source='HURI_DISTRICTS',temporal_conflict=bool(one.legal_semantic_conflict or two.legal_semantic_conflict),primary_tolerance_m=100));pg.append(g)
 union=shapely.union_all(pp);outer=h.loc[h.snapshot==date].geometry.iloc[0];areas=[geod.geometry_area_perimeter(x)[0] for x in pp];sum_area=sum(abs(x) for x in areas);union_area=abs(geod.geometry_area_perimeter(union)[0]);outside=union.difference(outer);gap=outer.difference(union)
 topo.append(dict(episode=date,districts=len(rs),sum_perimeters_m=sum(glen(p.boundary) for p in pp),internal_unique_network_m=glen(shapely.union_all(shared)),shared_pair_sum_m=sum(glen(g) for g in shared),sum_area_km2=sum_area/1e6,union_area_km2=union_area/1e6,overlap_diagnostic_km2=max(0,sum_area-union_area)/1e6,outer_uncovered_km2=abs(geod.geometry_area_perimeter(gap)[0])/1e6,union_outside_outer_km2=abs(geod.geometry_area_perimeter(outside)[0])/1e6,valid_all=bool(rs.is_valid.all()),source_polygons_changed=False,closure_certified=False))
parentdf=flat(parents,pg);save(parentdf,D/'RASSM_arce_parinte.gpkg','historical_parent_arcs');csv(topo,V/'audit_topologie_raioane.csv');print('historical parent arcs',len(parents),flush=True)

def tangent(line,s,span=15):
 a=line.interpolate(max(0,s-span));b=line.interpolate(min(line.length,s+span));v=np.array([b.x-a.x,b.y-a.y]);return v/max(np.linalg.norm(v),1e-30)
def oriented_angle(line,target):
 p=line.interpolate(.5,normalized=True);v=tangent(line,line.length*.5);s=target.project(p);w=tangent(target,s);return float(math.degrees(math.acos(min(1,abs(float(v@w))))))
cache_path=ROOT/'work/proof2/measurement_cache.pickle';network_fingerprint=hashlib.sha256(b'PROOF2_METRICS_COMPLETE_V3'+b''.join(g.wkb for g in mg)).hexdigest();cache={}
if cache_path.exists():
 with cache_path.open('rb') as f:stored=pickle.load(f)
 if stored.get('network')==network_fingerprint:cache=stored['cache'];print('loaded metric cache',len(cache),flush=True)
arows=[];ags=[];sens=[];contradictions=[];chunk_count=0
def measure_chunk(chunk,tol):
 key=(jid(chunk,'C'),tol)
 if key in cache and (cache[key].get('metrics_complete_nearest') or math.isfinite(cache[key]['mean_m']) and cache[key]['max_m']+12.5<=1000):return cache[key]
 closest=int(mtree.nearest(chunk));nearest_distance=chunk.distance(mm[closest]);radius=max(1000,nearest_distance+chunk.length+1);clip_radius=max(1100,radius+100)
 candidates=[int(i) for i in mtree.query(chunk,predicate='dwithin',distance=radius)]
 local=shapely.union_all([mm[i].intersection(chunk.buffer(clip_radius)) for i in candidates]);n=max(3,int(math.ceil(chunk.length/25))+1);points=shapely.line_interpolate_point(chunk,np.linspace(0,chunk.length,n));dist=np.array(shapely.distance(points,local));near=int(mtree.nearest(chunk.interpolate(.5,normalized=True)));angle=oriented_angle(chunk,mm[near]);buffer=local.buffer(tol,quad_segs=8)
 ins=parts(chunk.intersection(buffer));outs=parts(chunk.difference(buffer));covered=sum(g.length for g in ins)/chunk.length
 # Orientation gate prevents a crossing road/admin boundary from being called a matching route.
 if angle>20:ins=[];outs=[chunk];covered=0
 cat='M2' if covered>=.999999 and dist.max()<=tol+.001 else 'M3' if covered>1e-8 else 'M4'
 pieces=[(g,'COINCIDENT' if role else 'DIVERGENT') for seq,role in [(ins,True),(outs,False)] for g in seq]
 best=[]
 for i in candidates:
  coverage=chunk.intersection(mm[i].intersection(chunk.buffer(clip_radius)).buffer(tol,quad_segs=8)).length/chunk.length
  if coverage>.8 and oriented_angle(chunk,mm[i])<=20:best.append(i)
 competing=[]
 for i in range(len(best)):
  for j in range(i+1,len(best)):
   # Exact shared modern boundaries are one noded arc, not contradictory duplicates.
   mid=chunk.interpolate(.5,normalized=True);d=nearest_points(mid,mm[best[i]])[1].distance(nearest_points(mid,mm[best[j]])[1])
   if d>10:competing.append((best[i],best[j],d))
 if competing:cat='M5'
 observed=[mrows[i]['modern_arc_id'] for i in candidates if mm[i].distance(chunk)<=tol+.001]
 osmids=sorted(set(x for i in candidates if mm[i].distance(chunk)<=tol+.001 for x in mrows[i]['source_osm_ids'].split(';')))
 coverages={t:float(chunk.intersection(local.buffer(t,quad_segs=8)).length/chunk.length) if angle<=20 else 0.0 for t in TOLS}
 result=dict(pieces=pieces,category=cat,minimum_m=float(chunk.distance(local)),mean_m=float(dist.mean()),median_m=float(np.median(dist)),p95_m=float(np.quantile(dist,.95)),max_m=float(dist.max()),directed_hausdorff_sample_m=float(dist.max()),hausdorff_local_m=float(shapely.hausdorff_distance(chunk,local.intersection(chunk.buffer(radius)),densify=.25)),endpoint_start_m=float(dist[0]),endpoint_end_m=float(dist[-1]),orientation_difference_deg=angle,modern_arc_ids=';'.join(observed),source_osm_ids=';'.join(osmids),coverages=coverages,competing=len(competing),metrics_complete_nearest=True)
 cache[key]=result;return result
def node_points(z):
 if z.is_empty:return []
 if z.geom_type=='Point':return [z]
 if z.geom_type=='LineString':return [Point(z.coords[0]),Point(z.coords[-1])]
 return [p for x in getattr(z,'geoms',[]) for p in node_points(x)]
for pi,(parent,g) in enumerate(zip(parents,pg)):
 gm=transform(tm.transform,g);cuts=[0,gm.length];owner_spans=[]
 local_ra=ra[ra.snapshot==parent['episode']] if parent['source']=='HURI' else None
 # Historical district junctions are true network nodes, including along the external contour.
 if local_ra is not None:
  for _,district in local_ra.iterrows():
   for edge in merged(shapely.intersection(g,district.geometry.boundary,grid_size=1e-10)):
    ss=[gm.project(transform(tm.transform,Point(p))) for p in [edge.coords[0],edge.coords[-1]]];cuts.extend(ss);low,high=sorted(ss);middle_s=gm.project(transform(tm.transform,edge.interpolate(.5,normalized=True)))
    spans=[(low,high)] if low-1e-4<=middle_s<=high+1e-4 else [(0,low),(high,gm.length)]
    owner_spans.extend((a,b,district.district_id) for a,b in spans)
 # Split at exact modern network crossings/overlap endpoints in addition to a500m cap.
 near=[int(x) for x in mtree.query(gm)]
 if near:
  intersection=gm.intersection(shapely.union_all([mm[x] for x in near]))
  cuts.extend(gm.project(p) for p in node_points(intersection))
 # Preserve the established FINAL sector grid and split before sector accounting.
 cuts.extend(gm.project(p) for p in node_points(gm.intersection(sector_lines)))
 cuts.extend(np.arange(500,gm.length,500));cuts=sorted(set(round(float(x),6) for x in cuts))
 for lo,hi in zip(cuts,cuts[1:]):
  if hi-lo<1e-5:continue
  chunk=substring(gm,lo,hi);met=measure_chunk(chunk,parent['primary_tolerance_m']);chunk_count+=1
  category='M5' if parent['temporal_conflict'] else met['category'];chunkid=hashlib.sha256((parent['parent_id']+f':{lo:.6f}:{hi:.6f}').encode()).hexdigest()[:18]
  for k,(piece,role) in enumerate(met['pieces']):
   ll=transform(tl.transform,piece);entry={**parent,**{x:met[x] for x in ['minimum_m','mean_m','median_m','p95_m','max_m','directed_hausdorff_sample_m','hausdorff_local_m','endpoint_start_m','endpoint_end_m','orientation_difference_deg','modern_arc_ids','source_osm_ids']},'arc_id':'R2-'+chunkid+f'-{k:03}','chainage_start_m':lo,'chainage_end_m':hi,'M_category':category,'partial_role':role if category=='M3' else 'NOT_PARTIAL','geometric_effective':'M2' if role=='COINCIDENT' else 'M4','certainty':'C','independent_historical_continuity_proven':False,'length_geodesic_m':glen(ll),'length_metric_m':piece.length,'decision':'RETAIN_TEMPORAL_CONTRADICTION' if parent['temporal_conflict'] else 'RETAIN_COMPETING_ROUTES' if category=='M5' else 'OSMB_CANDIDATE_ONLY_NO_HISTORICAL_ADMISSION' if role=='COINCIDENT' else 'INDEPENDENT_RECONSTRUCTION_REQUIRED','evidence':'HURI/ICR geometry + pinned OSMB; no independent continuity document','reason':'Tiraspol district legally dissolved in source period' if parent['temporal_conflict'] else 'Coincidence is geometric only; unresolved historical evidence','sector':''}
   middle=ll.interpolate(.5,normalized=True);ss=sectors[sectors.covers(middle)];entry['sector']=ss.iloc[0].sector_id if len(ss) else 'OUTSIDE_PREVIOUS_GRID'
   if local_ra is not None:
    piece_s=gm.project(piece.interpolate(.5,normalized=True));owner_ids={d for a,b,d in owner_spans if a-1e-5<=piece_s<=b+1e-5};owners=local_ra[local_ra.district_id.isin(owner_ids)];entry['unit_ids']=';'.join(owners.district_id);entry['adjacent_raion_names']=';'.join(owners.huri_name)
   else:entry['adjacent_raion_names']=parent['unit_a']+';'+parent['unit_b']
   arows.append(entry);ags.append(ll)
  for t,v in met['coverages'].items():sens.append(dict(episode=parent['episode'],kind=parent['kind'],chunk_id=chunkid,tolerance_m=t,metric_length_m=chunk.length,covered_metric_m=chunk.length*v,orientation_gate_deg=20))
  if category=='M5':contradictions.append(dict(episode=parent['episode'],chunk_id=chunkid,parent_id=parent['parent_id'],unit_a=parent['unit_a'],unit_b=parent['unit_b'],temporal_conflict=parent['temporal_conflict'],competing_modern_routes=met['competing'],decision='NO_AUTOMATIC_CHOICE'))
 if pi%5==0:
  print('parents processed',pi+1,'/',len(parents),'unique chunks',len(cache),'rows',len(arows),flush=True)
  with cache_path.open('wb') as f:pickle.dump(dict(network=network_fingerprint,cache=cache),f)
arcs=flat(arows,ags);csv(arcs.drop(columns='geometry'),N/'RASSM_OSMB_corespondențe_segmente.csv');save(arcs,N/'RASSM_OSMB_reconciliere.gpkg','RASSM_BOUNDARY_ARCS');save(arcs,N/'RASSM_OSMB_reconciliere.gpkg','RASSM_OSMB_MATCHES')
csv(contradictions,N/'RASSM_OSMB_contradictii.csv');csv(sens,N/'sensibilitate_toate_segmentele.csv')
for path,mask,layer in [('RASSM_OSMB_arce_reutilizabile.gpkg',arcs.M_category=='M1','M1_admitted_empty'),('RASSM_OSMB_arce_reutilizabile.gpkg',(arcs.M_category=='M2'),'M2_candidates_not_admitted'),('RASSM_OSMB_arce_partial_coincidente.gpkg',arcs.M_category=='M3','M3_partitioned'),('RASSM_OSMB_arce_fara_corespondent.gpkg',arcs.M_category=='M4','M4_no_verified_counterpart'),('RASSM_OSMB_arce_fara_corespondent.gpkg',arcs.M_category=='M5','M5_unresolved_conflicts')]:save(arcs[mask],N/path,layer)
for name,df in [('RASSM_external_arcs_C',arcs[arcs.kind=='EXTERNAL']),('RASSM_district_arcs_C',arcs[arcs.kind=='INTERNAL'])]:
 target=E if 'external' in name else D;save(df,target/(name+'.gpkg'),name);df.to_file(target/(name+'.geojson'),driver='GeoJSON',coordinate_precision=10)

def summarize(df,keys):
 rows=[]
 for vals,g in df.groupby(keys,dropna=False):
  vals=vals if isinstance(vals,tuple) else (vals,);r=dict(zip(keys,vals));r['total_geodesic_km']=g.length_geodesic_m.sum()/1000
  for c in ['M1','M2','M3','M4','M5']:r[c+'_km']=g.loc[g.M_category==c,'length_geodesic_m'].sum()/1000
  r['M3_coincident_km']=g.loc[(g.M_category=='M3')&(g.geometric_effective=='M2'),'length_geodesic_m'].sum()/1000;r['M3_divergent_km']=r['M3_km']-r['M3_coincident_km'];r['geometry_covered_km']=g.loc[g.geometric_effective=='M2','length_geodesic_m'].sum()/1000;r['geometric_coverage_percent']=r['geometry_covered_km']/r['total_geodesic_km']*100 if r['total_geodesic_km'] else 0;r['historical_continuity_proven_km']=0;r['historical_continuity_percent']=0;r['A_B_certified_km']=0;r['admitted_OSMB_reuse_km']=0;r['candidate_OSMB_reuse_km']=r['M2_km']+r['M3_coincident_km'];r['independent_geometry_or_conflict_investigation_km']=r['M4_km']+r['M3_divergent_km']+r['M5_km'];r['independent_historical_evidence_still_required_km']=r['total_geodesic_km'];r['partition_delta_m']=(sum(r[c+'_km'] for c in ['M1','M2','M3','M4','M5'])-r['total_geodesic_km'])*1000;rows.append(r)
 return pd.DataFrame(rows)
summ=summarize(arcs,['episode','kind']);csv(summ,N/'registru_kilometric_per_episod.csv');csv(summarize(arcs,['episode','kind','sector']),R/'tabel_per_sector.csv');csv(summarize(arcs[arcs.kind=='INTERNAL'],['episode','unit_a','unit_b']),D/'tabel_per_pereche_raioane.csv')
district_rows=[]
for _,r in ra.iterrows():
 subset=arcs[(arcs.episode==r.snapshot)&arcs.unit_ids.map(lambda ids:r.district_id in ids.split(';'))]
 rr=summarize(subset,['episode']);
 if len(rr):d=rr.iloc[0].to_dict();d.update(district_id=r.district_id,raion=r.huri_name,perimeter_geodesic_km=glen(r.geometry.boundary)/1000,internal_boundary_share_km=subset.loc[subset.kind=='INTERNAL','length_geodesic_m'].sum()/1000,external_boundary_share_km=subset.loc[subset.kind=='EXTERNAL','length_geodesic_m'].sum()/1000,legal_semantic_conflict=bool(r.legal_semantic_conflict));district_rows.append(d)
csv(district_rows,D/'tabel_per_raion.csv')
sd=pd.DataFrame(sens).groupby(['episode','kind','tolerance_m'],as_index=False)[['metric_length_m','covered_metric_m']].sum();sd['coverage_percent']=sd.covered_metric_m/sd.metric_length_m*100;csv(sd,N/'sensibilitate_per_episod.csv')
# One diagnostic comparison for independently traced historical river; never label as a boundary.
hyd=gpd.read_file(ROOT/'outputs/10_HIST-RASSM_PROOF_1/03_RECONSTRUCTIE_SECTOR/HIST_RASSM_PROOF_1_C.gpkg',layer='hidrografie_noua_C');hr=[]
for _,r in hyd.iterrows():
 gm=transform(tm.transform,r.geometry);m=measure_chunk(gm,25);hr.append(dict(feature=r.feature_type,length_geodesic_km=glen(r.geometry)/1000,median_m=m['median_m'],p95_m=m['p95_m'],max_m=m['max_m'],orientation_deg=m['orientation_difference_deg'],**{'coverage_'+str(k)+'m':v for k,v in m['coverages'].items()},certainty='C',historical_frontier_admitted=False,datum='UNRESOLVED'))
csv(hr,E/'Dubasari_historical_hydrography_vs_OSMB.csv');save(hyd,E/'RASSM_temporal.gpkg','RASSM_RECONSTRUCTED_ARCS_HYDROGRAPHIC_C')
dump(V/'PROOF2a_run.json',dict(status='TECHNICAL_RECONCILIATION_EXECUTED_HISTORICAL_ADMISSION_OPEN',historical_snapshots=8,district_records=len(ra),modern_objects=len(modern),modern_arcs=len(mg),historical_parent_arcs=len(parents),arc_records=len(arcs),unique_geometric_chunks_measured=len(cache),match_counts=arcs.M_category.value_counts().to_dict(),A_B_admitted_arcs=0,metric_crs=metric.to_wkt(),tolerances_m=TOLS,primary_tolerance_policy={'HURI':100,'ICR':50,'DUB36':25},tolerance_interpretation='Operational geometric comparison only; not assumed historical positional accuracy',numerical_shared_boundary_grid_degrees=1e-10,numerical_grid_max_coordinate_shift_m=0.000008,maximum_base_chunk_m=500,sample_step_m=25,orientation_gate_deg=20,source_geometries_unchanged=True,missing_historical_episodes=['1924 initial allotments','1926 transfers','1935 council allotments','1937 post-August27 authenticated district geometry','1939 March1 original administrative sheet']))
shutil.copy2(__file__,P/'reconcile.py');print(summ.to_json(orient='records'),flush=True)
