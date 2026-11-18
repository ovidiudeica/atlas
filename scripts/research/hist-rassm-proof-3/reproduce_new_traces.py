import pathlib,sys,shutil,subprocess,json,hashlib,os,tempfile
ROOT=pathlib.Path.cwd();sys.path.insert(0,str(ROOT/'work/python_deps'))
import geopandas as gpd,rasterio,numpy as np
W=ROOT/'work/proof3';scratch=pathlib.Path(tempfile.mkdtemp(prefix='isolated_reproduction_',dir=W));dest=scratch/'work/proof3';(dest/'sources').mkdir(parents=True,exist_ok=True)
for n in ['traces_1930.json','reconstruct_1930.py']:shutil.copy2(W/n,dest/n)
shutil.copy2(W/'sources/MASSR1930_official_1280.png',dest/'sources/MASSR1930_official_1280.png')
# The only shared runtime is the dependency library. No cache, output geometry or network input is reused.
env=os.environ.copy();env['PYTHONPATH']=str(ROOT/'work/python_deps');p=subprocess.run([sys.executable,'-X','utf8',str(dest/'reconstruct_1930.py')],cwd=scratch,env=env,capture_output=True,text=True,encoding='utf-8');assert p.returncode==0,p.stderr
a=W/'reconstruction';b=dest/'reconstruction';checks={}
for n in ['trace_lengths.csv','independent_symbols_C.geojson','nominal_georeferencing.json']:checks[n]=a.joinpath(n).read_bytes()==b.joinpath(n).read_bytes();assert checks[n],n
x=gpd.read_file(a/'independent_symbols_C.gpkg');y=gpd.read_file(b/'independent_symbols_C.gpkg');assert x.drop(columns='geometry').equals(y.drop(columns='geometry'));assert all(g.wkb==h.wkb for g,h in zip(x.geometry,y.geometry))
with rasterio.open(a/'MSE1930_nominal_C_EPSG4326.tif') as x,rasterio.open(b/'MSE1930_nominal_C_EPSG4326.tif') as y:assert x.transform==y.transform and np.array_equal(x.read(),y.read())
result=dict(passed=True,independent_empty_workspace=True,network_used=False,cache_used=False,byte_identical_files=checks,vector_features_WKB_and_attributes_identical=4,raster_pixels_and_transform_identical=True,baseline_reconciliation_rerun=False)
(ROOT/'outputs/12_HIST-RASSM_PROOF_3/06_VALIDARE/reproducibilitate_izolata.json').write_text(json.dumps(result,indent=2)+'\n',encoding='utf-8');print(json.dumps(result))
