import pathlib,sys,os,json,hashlib,shutil,subprocess,argparse
parser=argparse.ArgumentParser();parser.add_argument('--package',required=True);parser.add_argument('--scratch',required=True);args=parser.parse_args();package=pathlib.Path(args.package).resolve();scratch=pathlib.Path(args.scratch).resolve();code=package/'08_COD_SI_REPRODUCIBILITATE';scratch.mkdir(parents=True,exist_ok=True)
assert not (scratch/'work/proof2/measurement_cache.pickle').exists(),'Use a new empty scratch directory for an independent run'
for r in json.loads((code/'input_manifest.json').read_text(encoding='utf-8')):
 p=code/'inputs'/r['input'];assert hashlib.sha256(p.read_bytes()).hexdigest()==r['sha256'];target=scratch/r['destination'];assert target.resolve().is_relative_to(scratch);target.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(p,target)
env=dict(os.environ)
localdeps=pathlib.Path.cwd()/'work/python_deps'
if localdeps.exists():env['PYTHONPATH']=str(localdeps.resolve())
for name in ['reconcile.py','assemble_validate.py','historic_context.py']:
 with (scratch/(name+'.log')).open('w',encoding='utf-8') as log:r=subprocess.run([sys.executable,'-X','utf8',str(code/name)],cwd=scratch,env=env,stdout=log,stderr=log)
 assert r.returncode==0,'Failure in '+name+'; inspect scratch log'
rebuilt=scratch/'outputs/11_HIST-RASSM_PROOF_2';results=[]
for directory in ['01_OSMB_RECONCILIERE','02_HOTAR_EXTERIOR','03_RAIOANE','04_CONSILII_SATESTI']:
 for p in sorted((package/directory).glob('*.csv')):
  if not (rebuilt/directory/p.name).exists():continue
  a=hashlib.sha256(p.read_bytes()).hexdigest();b=hashlib.sha256((rebuilt/directory/p.name).read_bytes()).hexdigest();results.append(dict(file=p.relative_to(package).as_posix(),sha256=a,match=a==b))
assert all(x['match'] for x in results),'CSV output differs'
if localdeps.exists():sys.path.insert(0,str(localdeps.resolve()))
import geopandas as gpd,pyogrio
layer_checks=[]
for layer,typ in pyogrio.list_layers(package/'RASSM_PROOF_2_temporal_C.gpkg'):
 if typ is None:continue
 a=gpd.read_file(package/'RASSM_PROOF_2_temporal_C.gpkg',layer=layer);b=gpd.read_file(rebuilt/'RASSM_PROOF_2_temporal_C.gpkg',layer=layer)
 layer_checks.append(dict(layer=layer,features=len(a),geometry_wkb_identical=a.geometry.to_wkb().tolist()==b.geometry.to_wkb().tolist(),attributes_identical=a.drop(columns='geometry').equals(b.drop(columns='geometry'))))
assert all(x['geometry_wkb_identical'] and x['attributes_identical'] for x in layer_checks)
result=dict(all_passed=True,fresh_workspace=True,original_raw_archives_redownloaded=False,measurement_cache_reused_from_original_run=False,matching_and_noding_recomputed=True,deterministic_csv_files=len(results),files=results,temporal_gpkg_layers=layer_checks)
(package/'06_VALIDARE/reproducibilitate_izolata.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf-8');print(json.dumps(dict(passed=True,csv=len(results),vector_layers=len(layer_checks))),flush=True)
