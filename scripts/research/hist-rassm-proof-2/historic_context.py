import sys,pathlib,json,hashlib,warnings,ast,re,shutil
ROOT=pathlib.Path.cwd();sys.path.insert(0,str(ROOT/'work/python_deps'));warnings.filterwarnings('ignore',category=DeprecationWarning)
import geopandas as gpd,pandas as pd,numpy as np,shapely
from shapely.ops import transform
from pyproj import Transformer,CRS,Geod
O=ROOT/'outputs/11_HIST-RASSM_PROOF_2';N=O/'01_OSMB_RECONCILIERE';D=O/'03_RAIOANE';C=O/'04_CONSILII_SATESTI';P=O/'08_COD_SI_REPRODUCIBILITATE';gd=Geod(ellps='WGS84');crs=CRS.from_proj4('+proj=aeqd +lat_0=47.5 +lon_0=29.5 +datum=WGS84 +units=m');tm=Transformer.from_crs(4326,crs,always_xy=True);tl=Transformer.from_crs(crs,4326,always_xy=True)
frames=[]
for country in ['Moldova','Ukraine']:
 d=gpd.read_file(ROOT/'work/proof2/inputs.gpkg',layer=country);d=d[d['boundary'].isin(['historic','statistical'])].copy();d['country']=country;d['historical_certainty']='C';d['valid_1924_1940_proven']=False;frames.append(d)
df=gpd.GeoDataFrame(pd.concat(frames,ignore_index=True),crs=4326)
for c in df.columns:
 if c!='geometry' and df[c].dtype==object:df[c]=df[c].map(lambda x:json.dumps(x,ensure_ascii=False) if isinstance(x,(list,dict,np.ndarray)) else x)
df.to_file(N/'OSMB_historic_statistical_context.gpkg',layer='context_not_current_administration',driver='GPKG');df.drop(columns='geometry').to_csv(N/'OSMB_historic_statistical_objects.csv',index=False,lineterminator='\n')
parents=gpd.read_file(D/'RASSM_arce_parinte.gpkg',layer='historical_parent_arcs');b=[transform(tm.transform,x.boundary) for x in df.geometry];tree=shapely.STRtree(b);records=[];geoms=[];partrows=[]
for _,r in parents.iterrows():
 line=transform(tm.transform,r.geometry);indices=[int(i) for i in tree.query(line.buffer(500))]
 if not indices:continue
 union=shapely.union_all([b[i].intersection(line.buffer(600)) for i in indices]);row={k:r[k] for k in ['episode','kind','parent_id','unit_a','unit_b']};row.update(source_osm_ids=';'.join(str(int(df.iloc[i].osm_id)) for i in indices),context_is_independent_primary_history=False,historical_category='C; temporal scope unproven',M_context='M5_CANDIDATE_TEMPORAL_AMBIGUITY')
 for tol in [25,50,100,250,500]:
  inter=line.intersection(union.buffer(tol,quad_segs=8));row['buffer_covered_'+str(tol)+'m_km']=gd.geometry_length(transform(tl.transform,inter))/1000
 row['parent_geodesic_km']=gd.geometry_length(r.geometry)/1000;records.append(row)
 covered=line.intersection(union.buffer(100,quad_segs=8))
 if not covered.is_empty:geoms.append(transform(tl.transform,covered));partrows.append({**row,'meaning':'Supplemental100m buffer coincidence only; no orientation gate; no admitted reuse'})
pd.DataFrame(records).to_csv(N/'OSMB_context_comparison_per_parent.csv',index=False,lineterminator='\n');gpd.GeoDataFrame(partrows,geometry=geoms,crs=4326).to_file(N/'OSMB_historic_statistical_context.gpkg',layer='context_coincidence_C_not_current_reuse',driver='GPKG')
def norm(x):return re.sub(r'[^а-яіїєґa-z]','',str(x).lower())
old=pd.read_csv(ROOT/'outputs/09_HIST-RASSM_FINAL/02_ADMINISTRATIE_ISTORICA/RASSM_33_consilii_reverificate.csv');rows=[]
for _,r in old.iterrows():
 name=r.official_name_uk_1935;root=norm(str(name).split()[0]);hits=df[df['name'].map(lambda x:norm(str(x).split()[0]))==root]
 rows.append(dict(council_id=r.council_id,name_1935=name,destination_1935=r.destination_raion_1935,exact_name_stem_candidate_ids=';'.join(str(int(x)) for x in hits.osm_id),candidate_count=len(hits),geometry_assignment_admitted=False,continuity_proven=False,decision='NAME_ONLY_RESEARCH_CANDIDATE' if len(hits) else 'NO_EXACT_STEM_MATCH_IN_SCOPED_CONTEXT; NOT_PROOF_OF_ABSENCE'))
pd.DataFrame(rows).to_csv(C/'1935_33_OSMB_historic_name_crosswalk.csv',index=False,lineterminator='\n');shutil.copy2(__file__,P/'historic_context.py');print(json.dumps(dict(context_objects=len(df),historic_objects=int((df['boundary']=='historic').sum()),statistical_objects=int((df['boundary']=='statistical').sum()),name_candidates=sum(x['candidate_count']>0 for x in rows),admitted_council_polygons=0)),flush=True)
