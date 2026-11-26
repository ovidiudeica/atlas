from pathlib import Path
import sys,json
R=Path.cwd();sys.path.insert(0,str(R/'work/python_deps'))
import geopandas as g,pandas as pd,numpy as np,shapely
from pyproj import Transformer
W=R/'work/proof6';P2=R/'outputs/11_HIST-RASSM_PROOF_2/RASSM_PROOF_2_temporal_C.gpkg';P5=R/'outputs/14_HIST-RASSM_PROOF_5/RASSM_PROOF_5_temporal_C.gpkg';m=g.read_file(P2,layer='OSMB_MODERN_ARCS_C');mask=[]
for _,r in m.iterrows():
 objs=json.loads(r.source_objects);mask.append(any(int(o['admin_level'])==2 and int(o['osm_id'])==-58974 for o in objs) and any(int(o['admin_level'])==2 and int(o['osm_id'])==-60199 for o in objs))
border=m[np.array(mask)];assert len(border)>0;border.to_file(W/'scope_reference.gpkg',layer='MD_UA_OSMB_shared_level2_reference_C',driver='GPKG');metric=border.to_crs(32635);u=shapely.union_all(metric.geometry.to_numpy());a=g.read_file(P5,layer='RASSM_HISTORICAL_CANDIDATES');t=Transformer.from_crs(4326,32635,always_xy=True);rows=[]
for _,r in a.iterrows():
 z=shapely.transform(r.geometry,t.transform,interleaved=False);d=float(z.distance(u));intersection=z.intersection(u);rows.append(dict(arc_id=r.arc_id,corridor_id=r.corridor_id,kind=r.kind,episode=r.episode,minimum_nominal_distance_to_MD_UA_OSMB_border_m=d,intersects_reference=bool(z.intersects(u)),linear_overlap_reference_m=float(intersection.length),intersection_type=intersection.geom_type,within_100m_screen=d<=100,screen_only_not_legal_applicability=True,rule='1999treaty applies to stateborder; proximity toOSMBreferencealone does not prove applicability or RASSMcontinuity',source='OSMBMD2026-10-05andUA2026-11-09sharedlevel2arcs; notofficialdelimitationcoordinates'))
d=pd.DataFrame(rows);d.to_csv(W/'1999_scope_per_arc.csv',index=False);summary=d.groupby(['corridor_id','kind']).agg(arcs=('arc_id','count'),minimum_m=('minimum_nominal_distance_to_MD_UA_OSMB_border_m','min'),intersections=('intersects_reference','sum'),linear_overlap_m=('linear_overlap_reference_m','sum'),within100m=('within_100m_screen','sum')).reset_index();summary.to_csv(W/'1999_scope_per_corridor.csv',index=False);print(summary.to_string(index=False));print('Referencearcs',len(border))
