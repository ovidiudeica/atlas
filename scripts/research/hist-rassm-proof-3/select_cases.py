import pathlib,sys,json,hashlib
ROOT=pathlib.Path.cwd();sys.path.insert(0,str(ROOT/'work/python_deps'))
import geopandas as gpd,pandas as pd,shapely,numpy as np
from pyproj import Transformer
P=ROOT/'outputs/11_HIST-RASSM_PROOF_2';W=ROOT/'work/proof3';W.mkdir(exist_ok=True)
a=gpd.read_file(P/'RASSM_PROOF_2_temporal_C.gpkg',layer='RASSM_BOUNDARY_ARCS');m=gpd.read_file(P/'RASSM_PROOF_2_temporal_C.gpkg',layer='OSMB_MODERN_ARCS_C');icr=a[a.source=='ICR'].to_crs(32635);iu=shapely.union_all(icr.geometry.to_numpy());t=Transformer.from_crs(4326,32635,always_xy=True)
s=a[(a.episode=='1937-01-15')&(a.M_category.isin(['M2','M3']))&(a.geometric_effective=='M2')].copy();s['ICR_distance_m']=[shapely.transform(g,t.transform,interleaved=False).distance(iu) for g in s.geometry];s['priority_score']=s.ICR_distance_m+2*s.p95_m
s.loc[s.kind=='INTERNAL','priority_score']=2*s.loc[s.kind=='INTERNAL','p95_m']
sel=[]
for sector in ['NW','SE','SC']:
 d=s[(s.kind=='EXTERNAL')&(s.sector==sector)].sort_values(['priority_score','arc_id'])
 # Spatially separate actual cases, avoiding many tiny adjacent splits of one run.
 taken=[]
 for idx,r in d.iterrows():
  pt=r.geometry.interpolate(.5,normalized=True)
  if r.length_geodesic_m<100 or any(pt.distance(x)<.035 for x in taken):continue
  taken.append(pt);sel.append(idx)
  if len(taken)==6:break
inside=s[s.kind=='INTERNAL'].copy()
for names,d in inside.groupby('adjacent_raion_names'):
 d=d[d.length_geodesic_m>=100]
 if len(d):sel.append(d.sort_values(['priority_score','arc_id']).index[0])
# Mandatory targeted M4/M5 cases: one per meaningful unresolved pair, no general recomputation.
for names in ['Kamianka;Rybnytsia','Tyraspol;Slobodzeia','Hryhoriopol;Dubosary','Ananiv;Valehotsulove']:
 d=a[(a.episode=='1937-01-15')&(a.kind=='INTERNAL')&a.adjacent_raion_names.apply(lambda x:set(str(x).split(';'))==set(names.split(';')))&a.M_category.isin(['M4','M5'])].sort_values('length_geodesic_m',ascending=False)
 if len(d):sel.append(d.index[0])
for names,d in a[(a.episode=='1937-01-15')&(a.kind=='INTERNAL')&(a.M_category=='M5')].groupby('adjacent_raion_names'):
 if 'Tyraspol' in names.split(';'):sel.append(d.sort_values('length_geodesic_m',ascending=False).index[0])
selected=a.loc[list(dict.fromkeys(sel))].copy();selected=selected.merge(s[['arc_id','ICR_distance_m','priority_score']],on='arc_id',how='left');selected['lon_mid']=[g.interpolate(.5,normalized=True).x for g in selected.geometry];selected['lat_mid']=[g.interpolate(.5,normalized=True).y for g in selected.geometry]
selected.to_file(W/'selected_cases.gpkg',layer='cases',driver='GPKG');selected.drop(columns='geometry').to_csv(W/'selected_cases.csv',index=False)
ids=set(';'.join(selected.modern_arc_ids.fillna('')).split(';'));m=m[m.modern_arc_id.isin(ids)];m.to_file(W/'selected_cases.gpkg',layer='modern_source_arcs',driver='GPKG')
print(selected[['arc_id','kind','sector','adjacent_raion_names','M_category','length_geodesic_m','ICR_distance_m','lon_mid','lat_mid']].to_string(index=False));print('MODERN',m.columns.tolist());print(m.drop(columns='geometry').head(1).to_json(orient='records'))
