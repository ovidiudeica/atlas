import sys,pathlib,json,csv,hashlib,sqlite3,shutil,ast,platform,importlib.metadata,argparse
parser=argparse.ArgumentParser();parser.add_argument('--sources');parser.add_argument('--metadata');parser.add_argument('--supplement');parser.add_argument('--output');args=parser.parse_args()
ROOT=pathlib.Path.cwd();sys.path.insert(0,str(ROOT/'work/python_deps'))
import geopandas as gpd, shapely, pyproj, pandas as pd, numpy as np
from collections import Counter
from shapely.ops import transform,substring
from shapely.geometry import LineString
from shapely import normalize
OUT=pathlib.Path(args.output) if args.output else ROOT/'outputs/09_HIST-RASSM_FINAL';SRC=pathlib.Path(args.sources) if args.sources else ROOT/'work/sources'
DIRS=['01_GEOMETRII_FINALE','02_ADMINISTRATIE_ISTORICA','03_RASTERE_GEOREFERENTIATE','04_REGISTRE_PROBATORII','05_VALIDARE','06_QGIS','07_REPRODUCIBILITATE']
for d in DIRS:(OUT/d).mkdir(parents=True,exist_ok=True)
def writejson(p,v):p.write_text(json.dumps(v,ensure_ascii=False,indent=2,allow_nan=False),encoding='utf-8')
def csvwrite(p,rows,fields=None):
 rows=list(rows);fields=fields or list(dict.fromkeys(k for r in rows for k in r))
 with p.open('w',encoding='utf-8-sig',newline='') as f:
  w=csv.DictWriter(f,fieldnames=fields);w.writeheader();w.writerows(rows)
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
geod=pyproj.Geod(ellps='WGS84')
area=lambda g:abs(geod.geometry_area_perimeter(shapely.orient_polygons(g))[0])/1e6
fwd=pyproj.Transformer.from_crs(4326,3035,always_xy=True).transform
back=pyproj.Transformer.from_crs(3035,4326,always_xy=True).transform
legacy_fwd=pyproj.Transformer.from_crs(4326,'+proj=laea +lat_0=47.4 +lon_0=29.3 +datum=WGS84 +units=m +no_defs',always_xy=True).transform
legacy=lambda g:transform(legacy_fwd,g)
metric=lambda g:transform(fwd,g)
def save(g,p,layer):
 g.to_file(p,layer=layer,driver='GPKG',engine='pyogrio')
 check=gpd.read_file(p,layer=layer);assert len(check)==len(g) and check.crs.to_epsg()==4326
 assert all(check.geometry.is_valid)
 return check
inventory_path=pathlib.Path(args.metadata) if args.metadata else ROOT/'work/inventory_final.json'
supplement_path=pathlib.Path(args.supplement) if args.supplement else ROOT/'work/global_search_supplement.json'
inventory=json.loads(inventory_path.read_text(encoding='utf-8'))
items={x['id']:x for x in inventory['inventory']}
supp=json.loads(supplement_path.read_text(encoding='utf-8'))
for v in supp.values():
 for x in v.get('structuredContent',{}).get('results',[]):
  if x['id'] not in items:x['path']='DRIVE_SEARCH_ONLY/PATH_NOT_RESOLVED/'+x['title'];items[x['id']]=x
local_by_name={p.name:p for p in SRC.rglob('*') if p.is_file()}
name_counts=Counter(x['title'] for x in items.values())
rows=[]
for x in items.values():
 p=local_by_name.get(x['title']) if name_counts[x['title']]==1 else None;isfolder=x.get('file_or_folder')=='folder'
 relevant=any(t in (x.get('path','')+' '+x['title']).lower() for t in ['rassm','massr','odesa','odessa','transnistr','huri','1935','osmb'])
 rows.append(dict(drive_id=x['id'],full_path=x.get('path','UNRESOLVED'),name=x['title'],format=x.get('mime_type'),size_bytes=x.get('size'),sha256=sha(p) if p else '',historical_date='UNDETERMINED',provenance='Drive user collection',crs='SEE_LAYER_AUDIT' if p and p.suffix=='.gpkg' else 'NOT_INSPECTED',layers='SEE_LAYER_AUDIT' if p and p.suffix=='.gpkg' else '',reuse_rights='UNDETERMINED_SOURCE_SPECIFIC',evidence_class='C' if relevant else 'D',decision='FOLDER_METADATA_ONLY' if isfolder else ('LOCAL_CONTENT_OBTAINED' if p else 'RELEVANCE_SCREEN_ONLY_CONTENT_PENDING'),scope_relevant=relevant,url=x.get('url','')))
csvwrite(OUT/'04_REGISTRE_PROBATORII/RASSM_inventar_exhaustiv_Drive.csv',rows)
coverage=dict(listed_folders=len(inventory['scanned'])+1,queued_folders=len(inventory['queue']),unique_items=len(items),geodata_items=len({x['id'] for x in inventory['inventory'] if x.get('path','').startswith('Geodata GIS/')}),max_children_returned=max(len(x['result'].get('structuredContent',{}).get('files',[])) for x in inventory['scanned']),list_limit_requested=1000,coverage='Geodata GIS recursive metadata; two additional RASSM folders; global keyword search. NOT an exhaustive content inventory of all Drive.',content_inventory_complete=False,definitive_reconstruction_gate='NOT_PASSED',unresolved_search_paths=sum('PATH_NOT_RESOLVED' in x.get('path','') for x in items.values()))
writejson(OUT/'04_REGISTRE_PROBATORII/acoperire_inventar.json',coverage)
sources=[]
for p in sorted(SRC.rglob('*')):
 if p.is_file():
  sources.append(dict(source_id='SRC-'+sha(p)[:16],path=str(p.relative_to(SRC)).replace('\\','/'),name=p.name,size_bytes=p.stat().st_size,sha256=sha(p),drive_id=next((x['id'] for x in items.values() if x['title']==p.name),''),evidence='SOURCE_PRESERVED_NOT_CERTIFIED',rights='SOURCE_SPECIFIC_NOT_GRANTED_BY_DOWNLOAD'))
csvwrite(OUT/'04_REGISTRE_PROBATORII/RASSM_registru_surse_si_provenienta.csv',sources)
duplicate={}
for r in sources:duplicate.setdefault(r['sha256'],[]).append(r['path'])
writejson(OUT/'04_REGISTRE_PROBATORII/duplicate_locale.json',{h:p for h,p in duplicate.items() if len(p)>1})
old=SRC/'HIST-RASSM_4_GIS_HURI_ICR_NECERTIFICAT.gpkg'
huri=gpd.read_file(old,layer='huri_contururi');raions=gpd.read_file(old,layer='huri_raioane');icr=gpd.read_file(old,layer='icr_referinta')
huri=huri.sort_values('snapshot').reset_index(drop=True)
assert len(huri)==8 and len(raions)==91 and len(icr)==1
ic=icr.geometry.iloc[0];ref=huri.loc[huri.snapshot=='1937-01-15','geometry'].iloc[0]
candidate=gpd.GeoDataFrame([dict(geometry_id='RASSM-WORK-HURI-19370115',source='HURI snapshot 1937-01-15',snapshot_date='1937-01-15',valid_from=None,valid_to=None,certainty='C',admission='WORKING_REFERENCE_ONLY_NOT_HISTORICALLY_ADMITTED',method='Unmodified HURI source; independently measured; no boundary reconstruction claimed',area_km2_geodesic=area(ref),positional_uncertainty_m=None,geometry=ref)],crs=4326)
save(candidate,OUT/'01_GEOMETRII_FINALE/RASSM_contur_referinta.gpkg','contur_lucru_C')
candidate.to_file(OUT/'01_GEOMETRII_FINALE/RASSM_contur_referinta.geojson',driver='GeoJSON')
stages=huri.copy();stages['geometry_id']=['RASSM-HURI-'+d.replace('-','') for d in stages.snapshot];stages['certainty']='C';stages['admission']='SOURCE_SNAPSHOT_NOT_CONFIRMED_HISTORICAL_VALIDITY';stages['valid_from']=None;stages['valid_to']=None
stages['source_claimed_from']=[ast.literal_eval(v).get('START_D') for v in stages.source_edt]
stages['source_claimed_to']=[ast.literal_eval(v).get('END_Date') for v in stages.source_edt]
stages['source_geometry_hash']=[hashlib.sha256(normalize(g).wkb).hexdigest()[:16] for g in stages.geometry]
representatives=[];groups=[]
for g in stages.geometry:
 match=next((i for i,r in enumerate(representatives) if area(g.symmetric_difference(r))<1e-8),None)
 if match is None:match=len(representatives);representatives.append(g)
 groups.append('HURI-G%02d'%(match+1))
stages['geometry_group']=groups;stages['area_km2_geodesic']=stages.geometry.map(area)
save(stages,OUT/'01_GEOMETRII_FINALE/RASSM_etape_teritoriale_1924_1940.gpkg','instantanee_sursa_C')
stages.to_file(OUT/'01_GEOMETRII_FINALE/RASSM_etape_teritoriale_1924_1940.geojson',driver='GeoJSON')
raions['certainty']='C';raions['legal_entity_type']='SOURCE_RAION_UNVERIFIED';raions['legal_admission']=False
mask=(raions.huri_name=='Tyraspol')&raions.snapshot.isin(['1933-12-15','1934-05-30','1937-01-15'])
raions.loc[mask,'legal_entity_type']='TIRASPOL_CITY_COUNCIL_TERRITORY_CONTEXT_NOT_RAION';raions['temporal_conflict']=mask
raions['stable_id']=raions.source_id+'@'+raions.snapshot
save(raions,OUT/'02_ADMINISTRATIE_ISTORICA/RASSM_raioane_context_C.gpkg','raioane_context')
audits=[];diffs=[]
for row in huri.itertuples():
 d=row.geometry.symmetric_difference(ic);g=metric(row.geometry).symmetric_difference(metric(ic))
 audits.append(dict(comparison='ICR-HURI',snapshot=row.snapshot,geodesic_km2=area(d),laea3035_km2=g.area/1e6,legacy_local_laea_km2=legacy(row.geometry).symmetric_difference(legacy(ic)).area/1e6,huri_area_geodesic_km2=area(row.geometry),icr_area_geodesic_km2=area(ic),after_reconstruction_km2=None,boundary_changed=False))
 diffs.append(dict(snapshot=row.snapshot,certainty='C',method='RAW_SOURCE_SYMMETRIC_DIFFERENCE',geometry=d))
a=huri.geometry.iloc[0];b=ref
audits.append(dict(comparison='HURI1927-HURI1937',snapshot='1927/1937',geodesic_km2=area(a.symmetric_difference(b)),laea3035_km2=metric(a).symmetric_difference(metric(b)).area/1e6,legacy_local_laea_km2=legacy(a).symmetric_difference(legacy(b)).area/1e6,boundary_changed=False,after_reconstruction_km2=None))
csvwrite(OUT/'05_VALIDARE/RASSM_comparatii_HURI_ICR_recalculate.csv',audits)
save(gpd.GeoDataFrame(diffs,crs=4326),OUT/'05_VALIDARE/RASSM_diferente.gpkg','diferente_sursa')
comp=gpd.read_file(SRC/'HIST-RASSM_5_pachet_audit_2026-11-17/HIST-RASSM_5_SECTOARE_QGIS_NECERTIFICAT.gpkg',layer='diferente_componente')
assert len(comp)==514 and comp.component_id.nunique()==514
comp['recalc_geodesic_km2']=comp.geometry.map(area);comp['recalc_laea_km2']=comp.geometry.map(lambda g:metric(g).area/1e6)
comp['delta_prior_area_km2']=comp.recalc_laea_km2-comp.area_km2_laea
comp['recalc_legacy_local_laea_km2']=comp.geometry.map(lambda g:legacy(g).area/1e6)
comp['delta_legacy_prior_km2']=comp.recalc_legacy_local_laea_km2-comp.area_km2_laea
comp['topology_valid']=comp.geometry.is_valid;comp['certainty']='C';comp['decision']='UNRESOLVED_NO_INDEPENDENT_BOUNDARY_EVIDENCE';comp['cause']='UNDETERMINED_CARTOGRAPHIC_GENERALISATION_OR_DATING';comp['source_1935_scan_obtained']=True;comp['source_1935_georef_admitted']=False
prior={'NE':1,'SE':2,'MC':3,'ME':4,'NW':5};comp['sector_priority']=comp.sector_majority.map(lambda s:prior.get(s,6))
comp=comp.sort_values(['sector_priority','rank_by_area','component_id'])
csvwrite(OUT/'04_REGISTRE_PROBATORII/RASSM_514_componente_decizii.csv',comp.drop(columns='geometry').to_dict('records'))
save(comp,OUT/'05_VALIDARE/RASSM_514_componente.gpkg','componente_C')
segments=[];ring=metric(ref).exterior;total=ring.length
for i,start in enumerate(np.arange(0,total,10000)):
 seg=substring(ring,float(start),min(float(start)+10000,total));wgs=transform(back,seg)
 sid='RASSM-SEG-'+hashlib.sha256(seg.wkb).hexdigest()[:12]
 segments.append(dict(segment_id=sid,source_geometry='RASSM-WORK-HURI-19370115',chainage_start_m=float(start),chainage_end_m=min(float(start)+10000,total),certainty='C',admission='NOT_ADMITTED',method='10km chainage segmentation EPSG3035; original polygon unchanged',positional_uncertainty_m=None,decision='RETAIN_SOURCE_PENDING_INDEPENDENT_HISTORY_AND_PHYSICAL_GCP',geometry=wgs))
segs=gpd.GeoDataFrame(segments,crs=4326)
save(segs,OUT/'04_REGISTRE_PROBATORII/RASSM_registru_segmente.gpkg','segmente_C')
csvwrite(OUT/'04_REGISTRE_PROBATORII/RASSM_registru_segmente.csv',segs.drop(columns='geometry').to_dict('records'))
modern=SRC/'RASSM_WORKING_ICR_OSMB_NECERTIFICAT.gpkg';md=gpd.read_file(modern,layer='osmb_moldova_modern');ua=gpd.read_file(modern,layer='osmb_ukraine_modern')
modern_out=OUT/'05_VALIDARE/OSMB_referinte_moderne.gpkg'
save(md,modern_out,'moldova_20261005');save(ua,modern_out,'ukraine_20261109')
bound=shapely.union_all([metric(g).boundary for g in list(md.geometry)+list(ua.geometry)])
screen=[]
for r in segs.itertuples():
 line=metric(r.geometry);ds=[substring(line,d,d).distance(bound) for d in np.linspace(0,line.length,21)]
 screen.append(dict(segment_id=r.segment_id,samples=21,nearest_modern_admin_boundary_median_m=float(np.median(ds)),nearest_modern_admin_boundary_max_m=float(max(ds)),interpretation='SCREEN_ONLY_MODERN_ADMIN_EDGES_NOT_RIVER_OR_HISTORICAL_TRUTH',systematic_shift_certified=False))
csvwrite(OUT/'05_VALIDARE/RASSM_OSMB_screen_segmente.csv',screen)
top=[]
for date,sub in raions.groupby('snapshot'):
 union=shapely.union_all(sub.geometry);external=huri.loc[huri.snapshot==date,'geometry'].iloc[0]
 pairs=[]
 for i in range(len(sub)):
  for j in range(i):
   ar=area(sub.geometry.iloc[i].intersection(sub.geometry.iloc[j]))
   if ar>1e-8:pairs.append(dict(a=sub.stable_id.iloc[i],b=sub.stable_id.iloc[j],overlap_km2=ar))
 top.append(dict(snapshot=date,raions=len(sub),invalid=int((~sub.geometry.is_valid).sum()),sum_area_km2=sum(area(x) for x in sub.geometry),union_area_km2=area(union),union_vs_external_symmetric_km2=area(union.symmetric_difference(external)),gaps_km2=area(external.difference(union)),outside_km2=area(union.difference(external)),overlaps_above_0_01m2=pairs))
writejson(OUT/'05_VALIDARE/RASSM_audit_topologic.json',dict(tolerance_area_km2=1e-8,tolerance_note='Detection threshold only; no snapping or polygon edits',snap_tolerance_m=0,snapshots=top,all_source_contours_valid=bool(huri.geometry.is_valid.all()),all_514_components_valid=bool(comp.geometry.is_valid.all()),polygon_reference_valid=bool(ref.is_valid),source_coordinate_preservation=bool(candidate.geometry.iloc[0].equals_exact(ref,0)),epsg3857_finite=bool(np.isfinite(candidate.to_crs(3857).total_bounds).all())))
admin=OUT/'02_ADMINISTRATIE_ISTORICA'
for p in SRC.rglob('*.csv'):
 if '5b_' in p.name or '5a_LEGE' in p.name or '5a_ACT' in p.name or '5a_1935_repertoriu' in p.name:shutil.copy2(p,admin/p.name)
repro=OUT/'07_REPRODUCIBILITATE';inputdir=repro/'inputs';inputdir.mkdir(exist_ok=True)
for p in SRC.iterdir():
 if p.is_file() and p.suffix in ['.zip','.gpkg','.json']:shutil.copy2(p,inputdir/p.name)
keep_fields=['id','title','path','size','mime_type','url','file_or_folder']
reduced_inventory={**inventory,'inventory':[{k:x.get(k) for k in keep_fields} for x in inventory['inventory']],'scanned':[{'id':x['id'],'path':x['path'],'result':{'structuredContent':{'files':[{'id':y['id']} for y in x['result'].get('structuredContent',{}).get('files',[]) ]}}} for x in inventory['scanned']]}
writejson(inputdir/'inventory_final.json',reduced_inventory)
reduced_supp={k:{'structuredContent':{'results':[{f:x.get(f) for f in keep_fields} for x in v.get('structuredContent',{}).get('results',[])]}} for k,v in supp.items()}
writejson(inputdir/'global_search_supplement.json',reduced_supp)
for p in SRC.glob('*.pdf'):shutil.copy2(p,OUT/'03_RASTERE_GEOREFERENTIATE'/p.name)
for p in (ROOT/'work').glob('atlas1935-*.png'):shutil.copy2(p,OUT/'03_RASTERE_GEOREFERENTIATE'/p.name)
writejson(OUT/'03_RASTERE_GEOREFERENTIATE/STATUT.json',dict(atlas1935_pdf_pages=116,map_sheet_pdf_page=96,roster_pdf_page=97,map_visual_review='Balta symbol is visibly inside external border; prior OCR ambiguity resolved',native_pdf_obtained=True,georeferenced=False,gcp_admitted=0,rms_m=None,reason='Schematic map without graticule or scale; no independently stable physical GCP qualified. Town symbols alone do not certify historical position.',map1929='HTTP429 original unavailable; metadata only',map1939='ARCHIVAL_INVENTORY_ONLY'))
writejson(repro/'software_versions.json',dict(python=platform.python_version(),packages={m:importlib.metadata.version(m) for m in ['geopandas','shapely','pyproj','pyogrio','numpy','pandas']},proj=pyproj.proj_version_str,geos=shapely.geos_version_string))
writejson(OUT/'05_VALIDARE/rezumat_calculat.json',dict(verdict='C',reference_snapshot='1937-01-15',reference_area_km2=area(ref),icr_area_km2=area(ic),historically_admitted_reference=False,source_snapshots=len(huri),distinct_geometry_groups=stages.geometry_group.nunique(),raion_features=len(raions),tiraspol_semantic_conflicts=int(mask.sum()),components=len(comp),max_component_area_recalc_delta_km2=float(comp.delta_prior_area_km2.abs().max()),segments=len(segs),coverage=coverage,comparisons=audits))
print(json.dumps(json.loads((OUT/'05_VALIDARE/rezumat_calculat.json').read_text(encoding='utf-8')),ensure_ascii=False,indent=2))
