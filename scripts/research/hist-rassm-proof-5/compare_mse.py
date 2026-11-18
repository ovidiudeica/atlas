from pathlib import Path
import sys,json,hashlib
R=Path.cwd();sys.path.insert(0,str(R/'work/python_deps'))
import geopandas as g,pandas as pd,numpy as np,shapely
from shapely.geometry import LineString
from pyproj import Transformer,Geod
from PIL import Image,ImageDraw
W=R/'work/proof5';P=R/'outputs/11_HIST-RASSM_PROOF_2/RASSM_PROOF_2_temporal_C.gpkg';f=json.loads((R/'outputs/13_HIST-RASSM_PROOF_4/03_GEOREFERENTIERE/native_frame.json').read_text());cfg=json.loads((W/'new_trace_pixels.json').read_text());back=Transformer.from_crs('+proj=aeqd +lat_0=47.5 +lon_0=30 +datum=WGS84 +units=m +no_defs',4326,always_xy=True);J=np.array(f['matrix']);offset=np.array(f['offset']);line=LineString([back.transform(*(J@np.array(p)+offset)) for p in cfg['pixels']]);geo=Geod(ellps='WGS84');length=abs(geo.geometry_length(line))
new=g.GeoDataFrame([dict(trace_id=cfg['trace_id'],source=cfg['source_id'],episode=cfg['episode'],kind=cfg['kind'],adjacent_units=cfg['adjacent_units'],certainty='C',absolute_accuracy_m=None,physical_GCP=0,length_geodesic_m=length,reading_allowance_m=15*max(f['north_m_per_pixel'],f['east_m_per_pixel']),historical_boundary_admitted=False,method='Manual native-pixel reading transformed with inherited diagnostic P4 frame; no HURI/ICR/OSMB snapping or FIT',geometry=line)],crs=4326);new.to_file(W/'new_trace_C.gpkg',layer='native_trace_C',driver='GPKG');new.to_file(W/'new_trace_C.geojson',driver='GeoJSON')
old=g.read_file(R/'outputs/13_HIST-RASSM_PROOF_4/RASSM_PROOF_4_temporal_C.gpkg',layer='RASSM_HISTORICAL_RECONSTRUCTIONS');old['trace_origin']='RETAINED_PROOF3_WKB_UNCHANGED';new['trace_origin']='NEW_NATIVE_PIXEL_READING_PROOF5';all_=pd.concat([old,new],ignore_index=True);all_=g.GeoDataFrame(all_,crs=4326);t=Transformer.from_crs(4326,32635,always_xy=True);rows=[]
for ep in ['1927-03-01','1928-08-15']:
 a=g.read_file(P,layer='RASSM_BOUNDARY_ARCS',where=f"episode='{ep}'").to_crs(32635)
 for _,r in all_.iterrows():
  kind='EXTERNAL' if str(r.kind).startswith('EXTERNAL') else 'INTERNAL';u=shapely.union_all(a[a.kind==kind].geometry.to_numpy());z=shapely.transform(r.geometry,t.transform,interleaved=False);d=np.array([z.interpolate(float(k)).distance(u) for k in np.linspace(0,z.length,max(3,int(z.length/250)+1))]);rows.append(dict(trace_id=r.trace_id,comparison_episode=ep,network=kind,trace_origin=r.trace_origin,nominal_minimum_m=float(d.min()),nominal_median_m=float(np.median(d)),nominal_p95_m=float(np.quantile(d,.95)),nominal_max_m=float(d.max()),meaning='One-way diagnostic source-reading-to-HURI distance; HURI is a comparison, not an independent control. Administrative content date and absolute datum unresolved.',historical_identity_proved=False,geometry_admitted=False))
pd.DataFrame(rows).to_csv(W/'MSE_1927_1928_diagnostic_comparison.csv',index=False)
im=Image.open(R/'work/proof4/sources/MSE5_leaf0168_native.jp2').convert('RGB');d=ImageDraw.Draw(im);d.line([tuple(p) for p in cfg['pixels']],fill='red',width=9)
for p in cfg['pixels']:d.ellipse((p[0]-7,p[1]-7,p[0]+7,p[1]+7),fill='blue')
im.crop((2300,1850,2700,2150)).resize((1200,900)).save(W/'inspection/native_trace_review.png');print(json.dumps(dict(new_nominal_trace_km=length/1000,old_traces_unchanged=4,comparison_rows=len(rows),new_AB_km=0,absolute_accuracy_m=None)))
