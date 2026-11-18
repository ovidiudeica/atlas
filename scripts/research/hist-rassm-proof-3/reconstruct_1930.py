import pathlib,sys,json,hashlib
ROOT=pathlib.Path.cwd();sys.path.insert(0,str(ROOT/'work/python_deps'))
import numpy as np,geopandas as gpd,shapely
from pyproj import Transformer,Geod
from shapely.geometry import LineString
from PIL import Image,ImageDraw,ImageFont
import rasterio
from rasterio.transform import Affine
from rasterio.warp import calculate_default_transform,reproject,Resampling
W=ROOT/'work/proof3';cfg=json.loads((W/'traces_1930.json').read_text());P=W/'reconstruction';P.mkdir(exist_ok=True)
crs='+proj=aeqd +lat_0=47.5 +lon_0=30 +datum=WGS84 +units=m +no_defs';to=Transformer.from_crs(4326,crs,always_xy=True);back=Transformer.from_crs(crs,4326,always_xy=True);geod=Geod(ellps='WGS84')
c=cfg['controls'];p0,p1=[np.array(x['pixel'],float) for x in c];w0,w1=[np.array(to.transform(x['lon'],x['lat'])) for x in c];v=p1-p0;pixel_south=v/np.linalg.norm(v);pixel_east=np.array([pixel_south[1],-pixel_south[0]]);north_scale=np.linalg.norm(w1-w0)/np.linalg.norm(v);sb=cfg['scale_bar'];east_scale=sb['length_m']/np.linalg.norm(np.subtract(sb['end_pixel'],sb['start_pixel']));J=np.stack([pixel_east*east_scale,-pixel_south*north_scale]);offset=w0-J@p0
def xy(p,scale=1):
 q=np.array(p);z=w0+scale*(J@(q-p0));return back.transform(*z)
rows=[]
for f in cfg['features']:
 coords=[xy(p) for p in f['pixels']];g=LineString(coords);length=abs(geod.geometry_length(g));alts=[]
 for scale in [.99,1.01]:
  alt=LineString([xy(p,scale) for p in f['pixels']]);alts.append(abs(geod.geometry_length(alt)))
 rows.append(dict(trace_id=f['trace_id'],source=cfg['source_id'],episode=cfg['source_episode'],kind=f['kind'],adjacent_hypothesis=f['adjacent_hypothesis'],certainty='C',M_category='NOT_ASSIGNED_TO_PROOF2_EPISODE',historical_identity='PROVISIONAL_CARTOGRAPHIC_INTERPRETATION',legal_boundary_admitted=False,absolute_accuracy_m=None,reading_allowance_px=5,nominal_reading_allowance_m=5*max(north_scale,east_scale),length_geodesic_m=length,length_scale_minus1pct_m=alts[0],length_scale_plus1pct_m=alts[1],geometry=g))
g=gpd.GeoDataFrame(rows,crs=4326);g.to_file(P/'independent_symbols_C.gpkg',layer='RASSM_HISTORICAL_RECONSTRUCTIONS',driver='GPKG');g.to_file(P/'independent_symbols_C.geojson',driver='GeoJSON');g.drop(columns='geometry').to_csv(P/'trace_lengths.csv',index=False)
im=Image.open(W/'sources'/cfg['source_file']).convert('RGB');arr=np.moveaxis(np.array(im),-1,0);tr=Affine(J[0,0],J[0,1],offset[0],J[1,0],J[1,1],offset[1]);h,w=arr.shape[1:];bounds=rasterio.transform.array_bounds(h,w,tr);corners=np.array([J@np.array(p)+offset for p in [(0,0),(w,0),(0,h),(w,h)]]);left,bottom=corners.min(axis=0);right,top=corners.max(axis=0);dt,dw,dh=calculate_default_transform(crs,'EPSG:4326',w,h,left,bottom,right,top)
with rasterio.open(P/'MSE1930_nominal_C_EPSG4326.tif','w',driver='GTiff',width=dw,height=dh,count=3,dtype='uint8',crs='EPSG:4326',transform=dt,compress='deflate') as dst:
 for band in range(3):reproject(arr[band],rasterio.band(dst,band+1),src_transform=tr,src_crs=crs,dst_transform=dt,dst_crs='EPSG:4326',resampling=Resampling.bilinear)
 dst.update_tags(CERTAINTY='C',ABSOLUTE_DATUM='UNKNOWN',METHOD='Two printed graticule anchors and printed scale bar; approximate frame; zero independent physical holdouts',TEMPORAL_CONTENT='Undated administrative content in source catalogued 1930')
d=ImageDraw.Draw(im);font=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',18)
for f in cfg['features']:
 col='#ff3030' if f['kind'].startswith('EXTERNAL') else '#1980ff';d.line([tuple(p) for p in f['pixels']],fill=col,width=3);x,y=f['pixels'][0];d.text((x+8,y),f['trace_id'],fill=col,font=font)
im.save(P/'digitization_review.png')
stats=dict(method='Approximate scale-constrained frame; not an authenticated historical projection or datum',source_sha256=hashlib.sha256((W/'sources'/cfg['source_file']).read_bytes()).hexdigest(),matrix_pixel_to_nominal_AEQD=J.tolist(),offset=offset.tolist(),north_m_per_pixel=north_scale,east_m_per_pixel=east_scale,printed_fit_controls=2,printed_scale_constraints=1,independent_physical_holdouts=0,absolute_RMSE_m=None,absolute_datum_unknown=True,absolute_accuracy_claimed=False,trace_count=len(g),external_symbol_km=float(g[g.kind.str.startswith('EXTERNAL')].length_geodesic_m.sum()/1000),internal_symbol_km=float(g[g.kind.str.startswith('INTERNAL')].length_geodesic_m.sum()/1000),legal_boundary_admitted_km=0,certainty='C',sensitivity='±1 percent scale and 5 pixel reading allowance are conditional scenarios, not an absolute confidence bound')
(P/'nominal_georeferencing.json').write_text(json.dumps(stats,ensure_ascii=False,indent=2)+'\n',encoding='utf-8');print(json.dumps(stats,ensure_ascii=False))
