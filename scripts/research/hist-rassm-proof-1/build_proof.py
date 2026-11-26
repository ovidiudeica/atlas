"""HIST-RASSM.PROOF.1: independent image evidence; never promotes a river axis to a legal border.
Run from workspace, or --package PATH after delivery. Outputs are deterministic GeoJSON/CSV.
Dependencies: numpy, pandas, geopandas, shapely, pyproj, rasterio, Pillow.
"""
import sys,os,json,csv,hashlib,shutil,argparse,math
from pathlib import Path
ROOT=Path.cwd()
if (ROOT/'work/python_deps').exists():sys.path.insert(0,str(ROOT/'work/python_deps'))
import numpy as np
import pandas as pd
import geopandas as gpd
from PIL import Image,ImageDraw
from shapely.geometry import Point,LineString,Polygon,box
from shapely.ops import transform,nearest_points
from pyproj import Transformer,Geod
import rasterio
from affine import Affine
OUT=Path(argparse.ArgumentParser().parse_known_args()[1][1]) if '--package' in sys.argv else ROOT/'outputs/10_HIST-RASSM_PROOF_1'
DIRS=['01_SURSE_PRIMARE','02_GCP_SI_GEOREFERENTIERE','03_RECONSTRUCTIE_SECTOR','04_VALIDARE','05_RAPORT_PROBATORIU','06_REPRODUCIBILITATE']
for d in DIRS:(OUT/d).mkdir(parents=True,exist_ok=True)
S,G,V,A,R,P=[OUT/d for d in DIRS]
def dump(path,x):path.write_text(json.dumps(x,ensure_ascii=False,indent=2,allow_nan=False)+'\n',encoding='utf-8')
def sha(path):return hashlib.sha256(path.read_bytes()).hexdigest()
def table(path,rows):
 if rows:pd.DataFrame(rows).to_csv(path,index=False,encoding='utf-8',lineterminator='\n')
def save(layer,rows,geoms):
 df=gpd.GeoDataFrame(rows,geometry=geoms,crs=4326)
 df.to_file(V/'HIST_RASSM_PROOF_1_C.gpkg',layer=layer,driver='GPKG')
 df.to_file(V/(layer+'.geojson'),driver='GeoJSON',coordinate_precision=10)
 return df
if (ROOT/'work/proof1/sources').exists():
 src=ROOT/'work/proof1/sources'
 for pattern in ['LAW*.jpg','*imageinfo.json','Eftodiev_1929_official_1280.jpg','Dubasari_L3535A_1936.jpg','acts_acquisition.json','dubasari_download.json']:
  for f in src.glob(pattern):shutil.copy2(f,S/f.name)
 for n in ['acquire_1929.py','acquire_acts.py','get_dubasari.py']:
  shutil.copy2(ROOT/'work/proof1'/n,P/n)
 # Small controlled extracts, not a repetition of the previous package.
 base=ROOT/'work/sources/HIST-RASSM_4_GIS_HURI_ICR_NECERTIFICAT.gpkg'
 h=gpd.read_file(base,layer='huri_contururi');i=gpd.read_file(base,layer='icr_referinta')
 h[h.snapshot.isin(['1934-05-30','1937-01-15'])].to_file(P/'reference_inputs.gpkg',layer='huri_C',driver='GPKG')
 i.to_file(P/'reference_inputs.gpkg',layer='icr_C',driver='GPKG')
 d=gpd.read_file(ROOT/'outputs/09_HIST-RASSM_FINAL/05_VALIDARE/RASSM_514_componente.gpkg',layer='componente_C')
 # Preliminary coverage only; final subset is selected below by actual study area.
 d[d.intersects(box(29.04,47.24,29.19,47.33))].to_file(P/'reference_inputs.gpkg',layer='differences_C',driver='GPKG')
 old=ROOT/'outputs/09_HIST-RASSM_FINAL/02_ADMINISTRATIE_ISTORICA/RASSM_1926_12_obiecte_transfer.csv'
 df=pd.read_csv(old);df['facsimile_page']=['1020-1021']*2+['1021']*10
 df['facsimile_result']='TEXT_CONFIRMED_VISUALLY; HISTORICAL_ALLOTMENT_POLYGON_MISSING'
 df['spatial_admission']='D; NO_POLYGON_CREATED'
 df['clause']=[1,1,2,2,2,2,3,3,3,3,3,4]
 df['1924_crosscheck']=['Excluded by art2a; 1926 transfer','Not named individually','Explicitly sent to Tulchyn by 1924 art304b','Explicitly sent to Tulchyn by 1924 art304b','Explicitly sent to Tulchyn by 1924 art304b','Explicitly sent to Tulchyn by 1924 art304b']+['No individual 1924 allotment recovered']*6
 df.to_csv(R/'reconciliere_1926_12_obiecte.csv',index=False,encoding='utf-8',lineterminator='\n')
 prior=[ROOT/'outputs/HIST-RASSM_FINAL_C.zip',ROOT/'work/sources/Atlas_1935.pdf',ROOT/'work/sources/arhiva_R2947_inv3.pdf',ROOT/'work/sources/Ukraine_admin_history.pdf']
 dump(P/'reused_sources.json',[dict(file=f.name,sha256=sha(f),bytes=f.stat().st_size,reuse='Verified; retained in prior package, no redownload') for f in prior if f.exists()])
shutil.copy2(Path(__file__),P/'build_proof.py') if Path(__file__).resolve()!=(P/'build_proof.py').resolve() else None

# Measured minute marks on the printed geographic frame. x is the neatline intersection,
# obtained by extending the short minute tick to the inner neatline (not a town or HURI point).
# Pixel convention: image top-left (0,0), x right, y down, original 7904 x 8777 scan.
corners=[('NW',1177,904,29,47+20/60),('NE',7128,925,29.25,47+20/60),('SW',1155,6740,29,47+10/60),('SE',7120,6756,29.25,47+10/60)]
rows=[dict(gcp_id='DUB36-'+n,pixel_x=x,pixel_y=y,lon=lon,lat=lat,role='FIT',reading_sigma_px=3,kind='printed_geographic_frame_corner') for n,x,y,lon,lat in corners]
left=[1491,2072,2657,3241,3824,4408,4994,5578,6163]
right=[1512,2093,2676,3260,3843,4426,5012,5594,6177]
for side,ys,x0,y0,x1,y1,lon in [('W',left,1177,904,1155,6740,29),('E',right,7128,925,7120,6756,29.25)]:
 for k,y in enumerate(ys,1):
  rows.append(dict(gcp_id=f'DUB36-{side}-{20-k:02}',pixel_x=round(x0+(x1-x0)*(y-y0)/(y1-y0),2),pixel_y=y,lon=lon,lat=47+(20-k)/60,role='FIT' if k%2 else 'HOLDOUT',reading_sigma_px=5,kind='minute_tick_extended_to_neatline'))
for r in rows:r.update(coordinate_source='Printed geographic frame L-35-35-A; nominal Greenwich degrees',stability='Mathematical graticule fixed on the historical sheet; no modern feature used',admission='RELATIVE_FRAME_ONLY',absolute_admission='NOT_ADMITTED_DATUM_UNKNOWN',absolute_sigma_m=None,contradiction='Printed geodetic datum and modern datum operation not established; no physical independent holdout')
table(G/'GCP_independente.csv',rows)
pix=np.array([[r['pixel_x'],r['pixel_y']] for r in rows]);ll=np.array([[r['lon'],r['lat']] for r in rows]);fit=np.array([r['role']=='FIT' for r in rows]);hold=~fit
to_m=Transformer.from_crs(4326,32635,always_xy=True);to_ll=Transformer.from_crs(32635,4326,always_xy=True)
target=np.column_stack(to_m.transform(ll[:,0],ll[:,1]));origin=np.array([660000,5240000]);q=target-origin
def design(p):
 u=(np.asarray(p)-[4000,3800])/3000
 return np.column_stack([np.ones(len(u)),u])
X=design(pix);coef=np.linalg.lstsq(X[fit],q[fit],rcond=None)[0]
def affine_predict(p):return design(p)@coef+origin
u=X[:,1];v=X[:,2];D=[];z=[]
for j in np.flatnonzero(fit):
 D.extend([[1,u[j],v[j],0,0,0,-q[j,0]*u[j],-q[j,0]*v[j]],[0,0,0,1,u[j],v[j],-q[j,1]*u[j],-q[j,1]*v[j]]]);z.extend(q[j])
h=np.linalg.lstsq(np.array(D),np.array(z),rcond=None)[0]
def projective_predict(p):
 Xp=design(p);uv=Xp[:,1:];den=1+uv@h[6:];return np.column_stack([Xp@h[:3],Xp@h[3:6]])/den[:,None]+origin
res=[];models=[]
for name,predict,params in [('affine',affine_predict,coef.tolist()),('projective',projective_predict,h.tolist())]:
 err=predict(pix)-target;dist=np.linalg.norm(err,axis=1)
 models.append(dict(model=name,parameters=params,fit_n=int(fit.sum()),holdout_n=int(hold.sum()),fit_RMSE_m=float(np.sqrt(np.mean(dist[fit]**2))),holdout_RMSE_m=float(np.sqrt(np.mean(dist[hold]**2))),holdout_max_m=float(dist[hold].max()),interpretation='internal consistency with nominal printed frame; NOT absolute positional accuracy'))
 for r,e,d in zip(rows,err,dist):res.append(dict(gcp_id=r['gcp_id'],role=r['role'],model=name,dx_m=float(e[0]),dy_m=float(e[1]),error_m=float(d)))
table(G/'reziduuri_fit_holdout.csv',res)
grid=np.array([[x,y] for x in range(1200,7101,500) for y in range(950,6751,500)])
model_disagreement=np.linalg.norm(affine_predict(grid)-projective_predict(grid),axis=1)
J=coef[1:,:].T/3000
dump(G/'transformari.json',dict(selected='affine',selection_reason='Six parameters; projective fitted for comparison only; no interior absolute control can justify added freedom',normalization=dict(pixel_center=[4000,3800],pixel_scale=3000,target_origin_m=origin.tolist(),target_crs='EPSG:32635 NOMINAL ONLY'),models=models,jacobian=J.tolist(),scale_singular_values_m_per_px=np.linalg.svd(J)[1].tolist(),jacobian_determinant=float(np.linalg.det(J)),affine_projective_max_disagreement_m=float(model_disagreement.max()),absolute_positional_uncertainty_m=None,absolute_uncertainty_status='UNBOUNDED_BY_AVAILABLE_EVIDENCE; no statistical confidence radius assigned',point_reading_allowance_m=float(np.linalg.svd(J)[1].max()*5),admissible_for_certified_boundary=False))

# Diagnostic raster: preserve complete original separately; georeference only the map rectangle.
im=Image.open(S/'Dubasari_L3535A_1936.jpg').convert('RGB');crop=(1155,904,7135,6757)
raw=np.asarray(im.crop(crop));b0=affine_predict([[crop[0],crop[1]]])[0]
tr=Affine(J[0,0],J[0,1],b0[0],J[1,0],J[1,1],b0[1])
with rasterio.open(G/'Dubasari_1936_diagnostic_NOMINAL_C.tif','w',driver='GTiff',height=raw.shape[0],width=raw.shape[1],count=3,dtype='uint8',crs=32635,transform=tr,compress='JPEG',photometric='YCBCR',tiled=True) as dst:
 dst.write(raw.transpose(2,0,1));dst.update_tags(CERTAINTY='C',DATUM_STATUS='UNKNOWN; nominal WGS84 interpretation for diagnosis only',ABSOLUTE_ACCURACY='NOT_ESTABLISHED',SOURCE_SHA256=sha(S/'Dubasari_L3535A_1936.jpg'))

# New hydrographic tracing, independent of HURI/ICR. Explicitly not a legal boundary.
# Only a short unbranched reach is admitted to image tracing; text/lines are bridged by
# robust row-window quantiles, retaining every measured transect in a reviewable CSV.
a=np.array(im).astype(np.int16);trace=[]
anchors=np.array([[2000,3650],[2500,3840],[3000,4080],[3300,4240]])
for y in range(2100,3251,25):
 center=np.interp(y,anchors[:,0],anchors[:,1]);lo=int(center-250);hi=int(center+250)
 ar=a[y-5:y+6,lo:hi];blue=(ar[:,:,1]-ar[:,:,0]>13)&(ar[:,:,2]-ar[:,:,1]>3)&(ar[:,:,1]>105)
 # Reject green vegetation and isolated blue wells/pond marks. Select the longest
 # x-run supported in at least three scan rows, bridging print gaps up to 40 pixels.
 support=blue.sum(axis=0)>=3
 ix=np.flatnonzero(support)
 groups=np.split(ix,np.where(np.diff(ix)>40)[0]+1)
 run=max(groups,key=lambda z:len(z)) if groups else np.array([],dtype=int)
 xs=run+lo
 if len(xs)<40:raise ValueError(f'Insufficient river paint at row {y}: {len(xs)}')
 west,east=np.quantile(xs,[.02,.98]);trace.append(dict(pixel_y=y,west_x=round(float(west),2),east_x=round(float(east),2),axis_x=round(float((west+east)/2),2),paint_pixels=len(xs),interpretation='historical water-paint envelope; not surveyed bank or legal frontier'))
table(V/'digitizare_hidrografie_pixeli.csv',trace)
west=np.array([[r['west_x'],r['pixel_y']] for r in trace]);east=np.array([[r['east_x'],r['pixel_y']] for r in trace]);axis=(west+east)/2
def geographic(p):m=affine_predict(p);return np.column_stack(to_ll.transform(m[:,0],m[:,1]))
lines=[LineString(geographic(x)) for x in [west,axis,east]]
pol=Polygon(np.vstack([geographic(west),geographic(east)[::-1]]))
gpkg=V/'HIST_RASSM_PROOF_1_C.gpkg'
if gpkg.exists():gpkg.unlink() # Only this derived artifact under the explicit output folder.
feature_rows=[dict(feature_id='DUB36-WATER-'+n,certainty='C',feature_type=n,source='RKKA L-35-35-A catalogued 1936; reconnaissance 1933',method='Image paint transects in original pixel coordinates + independent nominal frame fit',historical_boundary_admitted=False,absolute_uncertainty_m=None,legal_interpretation='UNDETERMINED; not an administrative boundary',source_sha256=sha(S/'Dubasari_L3535A_1936.jpg')) for n in ['WEST_ENVELOPE','AXIS_CANDIDATE','EAST_ENVELOPE']]
save('hidrografie_noua_C',feature_rows,lines)
save('apa_istorica_C',[dict(feature_id='DUB36-WATER-AREA',certainty='C',meaning='Image water-paint envelope only',legal_boundary=False)],[pol])
save('gcp_cadru_nominal',[{k:v for k,v in r.items() if k not in ['lon','lat']} for r in rows],[Point(r['lon'],r['lat']) for r in rows])
axis_m=transform(to_m.transform,lines[1]);study=axis_m.buffer(1800).envelope;study_ll=transform(to_ll.transform,study)
save('sector_studiu_MC',[dict(sector='MC-DUB36-01',certainty='C',choice='New detailed contemporaneous source and independent graticule; no reservoir shores used as GCP')],[study_ll])
refs=gpd.read_file(P/'reference_inputs.gpkg',layer='huri_C');icr=gpd.read_file(P/'reference_inputs.gpkg',layer='icr_C');refgeoms=[];refrows=[];comparison=[];connector_geoms=[]
geod=Geod(ellps='WGS84')
for name,geom in [(str(r.snapshot),r.geometry) for _,r in refs.iterrows()]+[('ICR-undated',icr.geometry.iloc[0])]:
 boundary=transform(to_m.transform,geom.boundary);cut=boundary.intersection(study)
 refgeoms.append(transform(to_ll.transform,cut));refrows.append(dict(reference=name,certainty='C',clip='study envelope only; unchanged source boundary'))
 ds=[]
 for k,s in enumerate(np.linspace(0,axis_m.length,int(axis_m.length//50)+2)):
  p=axis_m.interpolate(s);n=nearest_points(p,boundary)[1];dist=p.distance(n);ds.append(dist)
  comparison.append(dict(reference=name,sample=k,chainage_m=float(s),distance_to_source_boundary_m=float(dist),meaning='unsigned diagnostic distance; new line is hydrographic axis, not certified boundary correction'))
  if name=='1937-01-15':connector_geoms.append(transform(to_ll.transform,LineString([p,n])))
save('limite_sursa_decupate_C',refrows,refgeoms)
table(A/'distante_axa_HURI_ICR.csv',comparison)
save('vectori_distanta_HURI_C',[dict(sample=k,meaning='diagnostic connector, not territorial addition/removal',certainty='C') for k in range(len(connector_geoms))],connector_geoms)
diff=gpd.read_file(P/'reference_inputs.gpkg',layer='differences_C');diff=diff[diff.intersects(study_ll)].copy()
if len(diff):
 diff.geometry=diff.geometry.intersection(study_ll);diff.to_file(gpkg,layer='diferente_locale_C',driver='GPKG');diff.to_file(V/'diferente_locale_C.geojson',driver='GeoJSON',coordinate_precision=10)
 diff.drop(columns='geometry').to_csv(A/'componente_locale_nerezolvate.csv',index=False,lineterminator='\n')
cmp=[]
for name in sorted(set(r['reference'] for r in comparison)):
 ds=np.array([r['distance_to_source_boundary_m'] for r in comparison if r['reference']==name]);cmp.append(dict(reference=name,n=len(ds),mean_m=float(ds.mean()),median_m=float(np.median(ds)),p95_m=float(np.quantile(ds,.95)),max_m=float(ds.max())))
checks=[]
for n,geom in zip(['west','axis','east','water_area'],lines+[pol]):checks.append(dict(feature=n,valid=bool(geom.is_valid),simple=bool(geom.is_simple),empty=bool(geom.is_empty),parts=1,geodesic_length_m=float(geod.geometry_length(geom)),vertices=len(geom.exterior.coords) if geom.geom_type=='Polygon' else len(geom.coords)))
simp=[]
for tol in [5,10,25,50]:
 sm=axis_m.simplify(tol,preserve_topology=True);simp.append(dict(tolerance_m=tol,vertices=len(sm.coords),hausdorff_m=float(axis_m.hausdorff_distance(sm)),length_change_m=float(sm.length-axis_m.length),used_in_delivery=False))
assert all(c['valid'] and c['simple'] and not c['empty'] for c in checks)
audit=dict(verdict='PROOF.1-C',boundary_admitted_A_or_B=0,new_hydrographic_features_C=4,gcp_relative_frame_n=len(rows),gcp_fit_n=int(fit.sum()),gcp_holdout_n=int(hold.sum()),gcp_absolute_admitted_n=0,source_references_modified=False,canonical_geometry_modified=False,geometry_checks=checks,simplification=simp,comparisons=cmp,local_diff_components=len(diff),local_diff_ids=diff.component_id.tolist(),absolute_positional_uncertainty_m=None,legal_frontier_position='NOT_DETERMINED',territorial_area_correction_km2=None,nominal_water_paint_area_km2=abs(geod.geometry_area_perimeter(pol)[0])/1e6,axis_geodesic_length_m=float(geod.geometry_length(lines[1])))
dump(A/'audit_GIS.json',audit)
table(V/'registrul_modificarilor.csv',[dict(change_id='PROOF1-MC-001',action='ADD_NEW_IMAGE_DERIVED_HYDROGRAPHY_C',source='Dubasari_L3535A_1936.jpg',source_existing_boundary_used_in_digitization=False,source_existing_boundary_changed=False,admitted_boundary=False,reason='Independent pixel measurements of historical water course; datum and legal boundary interpretation unresolved')])
preview=im.crop((3250,1950,4700,3400));dr=ImageDraw.Draw(preview)
for arr,color in [(west,'red'),(east,'red'),(axis,'yellow')]:dr.line([(x-3250,y-1950) for x,y in arr],fill=color,width=4)
preview.thumbnail((1200,1200));preview.save(A/'digitizare_verificare_pixeli.jpg',quality=92)
draw=im.copy();dr=ImageDraw.Draw(draw)
for r in rows:
 x,y=r['pixel_x'],r['pixel_y'];col='red' if r['role']=='FIT' else 'blue';dr.ellipse((x-24,y-24,x+24,y+24),outline=col,width=8);dr.text((x+28,y),r['gcp_id'],fill=col,stroke_width=1)
draw.thumbnail((1600,1800));draw.save(G/'GCP_distributie.jpg',quality=92)
dump(P/'environment.json',dict(python=sys.version,geopandas=gpd.__version__,numpy=np.__version__,rasterio=rasterio.__version__,pandas=pd.__version__,vector_crs='EPSG:4326',metric_crs='EPSG:32635',raster_crs='EPSG:32635 NOMINAL, not certified',platform=sys.platform))
print(json.dumps(dict(models=models,audit=audit),ensure_ascii=False),flush=True)
