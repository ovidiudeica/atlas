"""Regenerate the GIS and documentary outputs from the delivered inputs."""
import pathlib,argparse,shutil,csv,zipfile,subprocess,sys,json
p=argparse.ArgumentParser();p.add_argument('--destination',required=True);p.add_argument('--qgis-python-bat');a=p.parse_args()
here=pathlib.Path(__file__).resolve().parent;package=here.parent;target=pathlib.Path(a.destination).resolve()
if target.exists() and any(target.iterdir()):raise SystemExit('Destination must be empty; no existing data are overwritten')
sources=target/'work/sources';sources.mkdir(parents=True,exist_ok=True);inputs=here/'inputs'
for f in inputs.iterdir():
 if f.is_file() and f.name not in ['inventory_final.json','global_search_supplement.json','raster_inspection.json']:shutil.copy2(f,sources/f.name)
for z in sources.glob('*.zip'):
 with zipfile.ZipFile(z) as archive:
  destination=sources/z.stem
  for name in archive.namelist():
   resolved=(destination/name).resolve()
   if not resolved.is_relative_to(destination.resolve()):raise ValueError('Unsafe archive member')
  archive.extractall(destination)
with (package/'04_REGISTRE_PROBATORII/RASSM_registru_surse_si_provenienta.csv').open(encoding='utf-8-sig') as f:
 for r in csv.DictReader(f):
  if not r['path'].startswith('drive_rasters/'):continue
  original=pathlib.Path(r['path']);stored=inputs/'drive_originals'/(r['sha256']+original.suffix.lower())
  if stored.exists():destination=sources/original;destination.parent.mkdir(exist_ok=True);shutil.copy2(stored,destination)
for f in (package/'03_RASTERE_GEOREFERENTIATE').glob('*.pdf'):shutil.copy2(f,sources/f.name)
for f in (package/'03_RASTERE_GEOREFERENTIATE').glob('atlas1935-*.png'):shutil.copy2(f,target/'work'/f.name)
for name in ['inventory_final.json','global_search_supplement.json','raster_inspection.json']:shutil.copy2(inputs/name,target/'work'/name)
for script in ['build_package.py','qualify_history.py']:
 subprocess.run([sys.executable,'-X','utf8',str(here/script)],cwd=target,check=True,stdout=subprocess.DEVNULL)
if a.qgis_python_bat:
 for script in ['build_qgis.py','independent_qgis_check.py']:
  subprocess.run([a.qgis_python_bat,'-X','utf8',str(here/script)],cwd=target,check=True)
generated=target/'outputs/09_HIST-RASSM_FINAL';comparisons=[]
for rel in ['01_GEOMETRII_FINALE/RASSM_contur_referinta.geojson','01_GEOMETRII_FINALE/RASSM_etape_teritoriale_1924_1940.geojson','05_VALIDARE/RASSM_comparatii_HURI_ICR_recalculate.csv','04_REGISTRE_PROBATORII/RASSM_514_componente_decizii.csv','04_REGISTRE_PROBATORII/RASSM_registru_segmente.csv']:
 same=(generated/rel).read_bytes()==(package/rel).read_bytes();comparisons.append({'file':rel,'byte_identical':same})
 if not same:raise AssertionError('Reproduction differs: '+rel)
(package/'05_VALIDARE/reproducere_independenta.json').write_text(json.dumps(dict(all_passed=True,files=comparisons,scope='Deterministic GeoJSON and CSV; GeoPackage binary timestamps excluded; no historical certification'),ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({'all_passed':True,'files':len(comparisons),'generated':str(generated)}))
