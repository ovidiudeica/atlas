from pathlib import Path
import sys,json,hashlib,shutil,sqlite3,os
R=Path.cwd();sys.path.insert(0,str(R/'work/python_deps'))
import numpy as np,pandas as pd,geopandas as gpd,pyogrio
from PIL import Image
from pyproj import Transformer,Geod
import rasterio
from rasterio.transform import Affine
from rasterio.warp import calculate_default_transform,reproject,Resampling
W=R/'work/proof4';B=R/'outputs/12_HIST-RASSM_PROOF_3';O=Path(os.environ.get('PROOF4_OUTPUT',str(R/'outputs/13_HIST-RASSM_PROOF_4')))
dirs=['01_HARTI_ORIGINALE','02_DOCUMENTE_ADMINISTRATIVE','03_GEOREFERENTIERE','04_HOTAR_EXTERIOR','05_HOTARE_RAIONALE','06_DUBASARI','07_VALIDARE','08_QGIS','09_COD','10_RAPORT_FINAL']
for n in dirs:(O/n).mkdir(parents=True,exist_ok=True)
sha=lambda p:hashlib.sha256(Path(p).read_bytes()).hexdigest()
old=B/'RASSM_PROOF_3_temporal_C.gpkg';assert sha(old)=='e810fa4ea28f3e764c35477451d71f2c439f2fa76382ed564506d546882b69b9'
model=O/'RASSM_PROOF_4_temporal_C.gpkg';shutil.copy2(old,model)
sources=[]
for m in json.loads((W/'acquisition_native_pages.json').read_text()):
 p=W/'sources'/m['label'];assert sha(p)==m['sha256'];shutil.copy2(p,O/dirs[0]/p.name)
 sources.append(dict(source_id=p.stem,file=dirs[0]+'/'+p.name,url=m['url'],sha256=m['sha256'],bytes=m['bytes'],kind='PRIMARY_VOLUME_PAGE',publication_year=1930,administrative_content_date=None,rights='Public IA scan; source-specific rights not independently cleared; private research package only',interpretation='MSE first edition volume5; title leaf4; editorial cutoff leaf5; article leaf167 and169; complete map leaf168. Publication date authenticated, map content date unresolved.'))
for m in json.loads((W/'acquisition_inventories.json').read_text()):
 p=W/'sources'/m['local_file'];assert sha(p)==m['sha256'];shutil.copy2(p,O/dirs[1]/p.name)
 sources.append(dict(source_id=m['label'],file=dirs[1]+'/'+p.name,url=m['url'],sha256=m['sha256'],bytes=m['bytes'],kind='PRIMARY_ARCHIVAL_FINDING_AID',publication_year=None,administrative_content_date=None,rights='Institutional finding aid, private research copy; no map licence inferred',interpretation='Inventory only, no unit map facsimiles. Inventory1 PDFp3 preface andp4 entry1б document Revkom1924–1925 transfer fromR648/1/37 on17June1991. Inventory3 PDFp3 lists1939map andAnaniev1936.'))
p=W/'sources/SV1928.jpg';shutil.copy2(p,O/dirs[0]/p.name);sources.append(dict(source_id='SV-CATALOG-1928',file=dirs[0]+'/'+p.name,url='https://sv.od.ua/mapod/1928/1928_amssr.php',sha256=sha(p),bytes=p.stat().st_size,kind='COMPLETE_HISTORICAL_MAP_UNVERIFIED_PUBLICATION',publication_year=None,administrative_content_date=None,rights='Public collection scan, watermark maps.southklad.ru; rights unclear, private only',interpretation='Catalogued1928, not printed-authenticated. Printed1:1500000, Greenwich grid. Claimed Bessarabia/Prut outline; not actual left-bank jurisdiction or1939target; internal district reconstruction not admitted.'))
p=W/'sources/MSE5_original_title_article_map_excerpt.pdf';shutil.copy2(p,O/dirs[0]/p.name)
full=json.loads((W/'acquisition_mse_volume.json').read_text());(O/dirs[0]/'whole_volume_reference.json').write_text(json.dumps(full,indent=2)+'\n')
pd.DataFrame(sources).to_csv(O/dirs[9]/'sources.csv',index=False)
(O/dirs[0]/'provenance.json').write_text(json.dumps(sources,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
for n in ['acquisition_native_pages.json','acquisition_inventories.json','research_resume.json']:shutil.copy2(W/n,O/(dirs[1] if 'inventories' in n else dirs[0])/n)
# New nominal frame read on native complete page, independent of HURI/ICR/OSMB.
controls=[dict(id='MSE5-N48-E30',pixel_x=3090,pixel_y=1423,lon=30,lat=48,role='FIT',kind='PRINTED_GEOGRAPHIC_GRID_NOT_PHYSICAL'),dict(id='MSE5-N47-E30',pixel_x=3164,pixel_y=3995,lon=30,lat=47,role='FIT',kind='PRINTED_GEOGRAPHIC_GRID_NOT_PHYSICAL')]
pd.DataFrame(controls).to_csv(O/dirs[2]/'GCP_native_MSE5.csv',index=False)
crs='+proj=aeqd +lat_0=47.5 +lon_0=30 +datum=WGS84 +units=m +no_defs';to=Transformer.from_crs(4326,crs,always_xy=True)
p0,p1=[np.array([x['pixel_x'],x['pixel_y']],float) for x in controls];w0,w1=[np.array(to.transform(x['lon'],x['lat'])) for x in controls];v=p1-p0;s=v/np.linalg.norm(v);e=np.array([s[1],-s[0]]);ns=np.linalg.norm(w1-w0)/np.linalg.norm(v);es=45000/np.linalg.norm(np.array([2025,5560])-np.array([966,5557]));J=np.stack([e*es,-s*ns]);offset=w0-J@p0
frame=dict(source_id='MSE5_leaf0168_native',source_sha256=sha(W/'sources/MSE5_leaf0168_native.jp2'),source_size=[3820,5831],method='Diagnostic scale-constrained nominal AEQD frame; historical projection and datum unknown',printed_fit_controls=2,printed_scale_constraints=1,printed_holdout_controls=0,physical_fit_controls=0,physical_holdout_controls=0,absolute_RMSE_m=None,absolute_accuracy_claimed=False,certainty='C',historical_projection_authenticated=False,historical_datum_authenticated=False,publication_year=1930,editorial_cutoff='1930-01-01',administrative_content_date=None,scale_bar=dict(start_pixel=[966,5557],end_pixel=[2025,5560],length_m=45000),matrix=J.tolist(),offset=offset.tolist(),north_m_per_pixel=ns,east_m_per_pixel=es,reading_allowance_pixels=15,conditional_reading_allowance_m=15*max(ns,es),uncertainty='Reading allowance is a scenario, not an absolute confidence bound; no physical holdouts and no authenticated datum. No small fitted residual claimed as validation.')
(O/dirs[2]/'native_frame.json').write_text(json.dumps(frame,indent=2)+'\n')
im=Image.open(W/'sources/MSE5_leaf0168_native.jp2').convert('RGB');im.thumbnail((1910,2916));arr=np.moveaxis(np.array(im),-1,0);h,w=arr.shape[1:];factor=3820/w;A=J*factor;tr=Affine(A[0,0],A[0,1],offset[0],A[1,0],A[1,1],offset[1]);corners=np.array([A@np.array(p)+offset for p in [(0,0),(w,0),(0,h),(w,h)]]);left,bottom=corners.min(axis=0);right,top=corners.max(axis=0);dt,dw,dh=calculate_default_transform(crs,'EPSG:4326',w,h,left,bottom,right,top)
with rasterio.open(O/dirs[2]/'MSE5_native_nominal_C.tif','w',driver='GTiff',width=dw,height=dh,count=3,dtype='uint8',crs='EPSG:4326',transform=dt,compress='deflate') as dst:
 for band in range(3):reproject(arr[band],rasterio.band(dst,band+1),src_transform=tr,src_crs=crs,dst_transform=dt,dst_crs='EPSG:4326',resampling=Resampling.bilinear)
 dst.update_tags(CERTAINTY='C',DATUM='UNKNOWN',PHYSICAL_HOLDOUTS='0',ADMINISTRATIVE_CONTENT_DATE='UNKNOWN',PUBLICATION='MSE vol5 Moscow1930 leaf168',METHOD='Nominal two-grid-anchor plus45km scale frame; no absolute accuracy claim')
# Retain original readings, never redigitize or shift historical boundaries merely to fit a better scan.
recon=gpd.read_file(model,layer='RASSM_HISTORICAL_RECONSTRUCTIONS');trace_dec=[]
for _,r in recon.iterrows():trace_dec.append(dict(trace_id=r.trace_id,kind=r.kind,episode=r.episode,previous_class='C',new_class='C',previous_source='MSE1930-OFFICIAL1280',authenticated_source='MSE5_leaf0168_native',publication_year=1930,editorial_cutoff='1930-01-01',administrative_content_date=None,geometry_changed=False,geometry_sha256=hashlib.sha256(r.geometry.wkb).hexdigest(),length_geodesic_m=r.length_geodesic_m,delta_length_m=0,absolute_accuracy_m=None,physical_holdouts=0,decision='SOURCE_AUTHENTICATED_GEOMETRY_NOT_ADMITTED',reason='Same printed cartographic symbols in original volume; source authentication does not resolve absolute datum, exact content date or district pair. Internal fragment remains UNASSIGNED_RAYON_PAIR.'))
pd.DataFrame(trace_dec).to_csv(O/dirs[9]/'four_trace_reassessment.csv',index=False)
dec=pd.read_csv(B/'09_RAPORT_FINAL/RASSM_PROOF3_decizii_per_arc.csv').fillna('');dec['new_evidence']='MSE5_leaf0168_native; MSE5_leaf0004_native; MSE5_leaf0005_native; ANRM_current_inventory_3';dec['change_type']='PRIMARY_SOURCE_AUTHENTICATION_ONLY';dec['new_direct_historical_evidence']=False;dec['native_map_publication_authenticated']=True;dec['historical_content_date_authenticated']=False;dec['new_geometry_km']=0;dec['positional_error_estimate_m']=None
for i,r in dec.iterrows():
 dec.at[i,'reason']=('Original MSE volume5 Moscow1930 authenticated; editorial work ended1January1930, before candidate1937episode. '+r['reason']+' No primary evidence ties this exact modern arc to the depicted historical line; absolute error remains unknown.')
 dec.at[i,'verdict']='CONTRADICTION_PRESERVED' if r.historical_identity=='CONTRADICTED_AT_CANDIDATE_DATE' else 'C_RETAINED_NO_HISTORICAL_ADMISSION'
dec.to_csv(O/dirs[9]/'decisions_per_arc.csv',index=False)
for kind,dest in [('EXTERNAL',dirs[3]),('INTERNAL',dirs[4])]:dec[dec.kind==kind].to_csv(O/dest/'individual_decisions.csv',index=False)
for n in ['M1_admissions.csv','AB_admissions.csv']:dec.iloc[:0].to_csv(O/dirs[9]/n,index=False)
cases=gpd.read_file(model,layer='INVESTIGATED_CASES');before={r.arc_id:r.geometry.wkb for _,r in cases.iterrows()}
for kind,dest in [('EXTERNAL',dirs[3]),('INTERNAL',dirs[4])]:cases[cases.kind==kind].to_file(O/dest/'investigated_C.geojson',driver='GeoJSON')
gpd.read_file(model,layer='HURI_1937_DISTRICTS_REFERENCE_C').to_file(O/dirs[4]/'candidate_districts_1937_C.geojson',driver='GeoJSON')
with sqlite3.connect(model) as c:
 c.execute('DELETE FROM RASSM_SOURCES_AND_DECISIONS')
 for kind,rows,key in [('SOURCE',sources,'source_id'),('DECISION',dec.to_dict('records'),'arc_id'),('TRACE_REASSESSMENT',trace_dec,'trace_id')]:
  c.executemany('INSERT INTO RASSM_SOURCES_AND_DECISIONS(record_type,record_id,payload) VALUES(?,?,?)',[(kind,x[key],json.dumps(x,ensure_ascii=False)) for x in rows])
for p in (B/'05_GEOREFERENTIERE_DUBASARI').iterdir():shutil.copy2(p,O/dirs[5]/p.name)
for n in ['control_north.png','control_south.png','control_bar.png']:shutil.copy2(W/'inspection'/n,O/dirs[2]/n)
shutil.copy2(B/'03_HOTAR_EXTERIOR/MSE1930_nominal_C_EPSG4326.tif',O/dirs[2]/'PROOF3_old_frame_unchanged.tif')
shutil.copy2(B/'08_REPRODUCIBILITATE/traces_1930.json',O/dirs[8]/'PROOF3_traces_unchanged.json')
# Every vector geometry must remain exactly equal: source recovery alone cannot justify a boundary change.
counts={};geo=Geod(ellps='WGS84');lengths={}
for table,typ in pyogrio.list_layers(model):
 if typ is None:continue
 a=gpd.read_file(old,layer=table);b=gpd.read_file(model,layer=table);assert a.geometry.to_wkb().tolist()==b.geometry.to_wkb().tolist(),table;assert all(b.is_valid);assert b.crs.to_epsg()==4326;counts[table]=len(b)
 if table in ['RASSM_EXTERNAL_CANDIDATES','RASSM_INTERNAL_CANDIDATES','RASSM_HISTORICAL_RECONSTRUCTIONS']:lengths[table]=sum(abs(geo.geometry_length(g)) for g in b.geometry)
assert counts['RASSM_EXTERNAL_ADMITTED']==counts['RASSM_INTERNAL_ADMITTED']==0
for table in ['RASSM_INTERNAL_CANDIDATES','RASSM_MODERN_CONTINUITY']:
 a=gpd.read_file(model,layer=table);assert a.geometry.to_wkb().nunique()==len(a)
validation=dict(passed=True,input_PROOF3_sha256=sha(old),all_inherited_geometry_WKB_unchanged=True,vector_layer_counts=counts,all_vector_crs='EPSG:4326',all_geometries_valid=True,shared_internal_geometry_unique=True,baseline_reconciliation_rerun=False,new_polygons_created=0,new_boundary_geometries_created=0,case_count=36,external_case_count=18,internal_case_count=18,absolute_accuracy_m=None,physical_GCP_admitted=0,geodesic_lengths_m=lengths,source_hashes_verified=len(sources),symmetric_difference_of_inherited_polygons_m2=0,modern_arc_and_geometry_provenance_unchanged=True)
(O/dirs[6]/'GIS_validation.json').write_text(json.dumps(validation,indent=2)+'\n')
base=json.loads((B/'09_RAPORT_FINAL/summary.json').read_text());summary=dict(verdict='PROOF.4-C',investigated_arcs=36,exterior_cases=18,interior_cases=18,new_georeferences=1,georeference_type='DIAGNOSTIC_C_NO_PHYSICAL_HOLDOUT',physical_GCP_admitted=0,absolute_accuracy_m=None,new_M1_km=0,new_exterior_AB_km=0,new_interior_AB_km=0,new_independently_reconstructed_boundary_km=0,retained_independent_exterior_symbol_km=88.55332909564687,retained_independent_interior_symbol_km=9.859033356602051,target_1939_recovered=False,target_Ananiev1936_recovered=False,MSE_original_volume_authenticated=True,MSE_volume=5,MSE_publication_year=1930,MSE_editorial_cutoff='1930-01-01',MSE_native_map_size=[3820,5831],MSE_map_PDF_page=169,MSE_map_leaf=168,MSE_content_date=None,SV_catalog_year=1928,SV_printed_year_authenticated=False,SV_printed_scale=1500000,new_case_direct_historical_admissions=0,new_source_authentications=1,revkom_transfer_lead='R648/1/37 -> R2947/1/1б;17June1991;protocols1924–1925; no actual protocol or map annex recovered',exterior_1937=base['exterior_1937'],internal_1937=base['internal_1937'],baseline_reconciliation_rerun=False,existing_PRs_modified=False,ACTUAL_modified=False)
(O/dirs[9]/'summary.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
comparison=[dict(metric=k,PROOF3=a,PROOF4=b) for k,a,b in [('MSE_original_volume_authenticated',False,True),('MSE_native_map_width',1280,3820),('MSE_native_map_height',None,5831),('new_diagnostic_georeferences',0,1),('physical_GCP_admitted',0,0),('M1_km',0,0),('exterior_AB_km',0,0),('interior_AB_km',0,0),('new_boundary_km_this_stage',98.41236245224893,0),('retained_independent_exterior_symbol_km',88.55332909564687,88.55332909564687),('retained_independent_interior_symbol_km',9.859033356602051,9.859033356602051),('target_1939_recovered',False,False),('target_Ananiev1936_recovered',False,False)]]
pd.DataFrame(comparison).to_csv(O/dirs[9]/'PROOF3_to_PROOF4.csv',index=False)
print(json.dumps(summary,ensure_ascii=False))
