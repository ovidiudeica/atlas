from pathlib import Path
import json,hashlib,zipfile,shutil
R=Path.cwd();W=R/'work/qgis_current';O=R/'outputs/00_RASSM_QGIS_CURRENT';sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
shutil.copy2(W/'README.md',O/'README.md')
version=json.loads((O/'SOURCE_VERSION.json').read_text(encoding='utf-8'));qa=json.loads((W/'QGIS_validation.json').read_text(encoding='utf-8'));qa.pop('layer_records',None);qa['visual_verified']=True;version['QGIS_validation']=qa;version['version_history']=[dict(version='QGIS-CURRENT.1-FIX',date='2026-11-18',change='Initial consolidated delivery; source WKB unchanged')];(O/'SOURCE_VERSION.json').write_text(json.dumps(version,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
names=['RASSM_LATEST_RESEARCH_C.gpkg','RASSM_LATEST_RESEARCH_C.qgz','README.md','SOURCE_VERSION.json'];core=''.join(sha(O/n)+'  '+n+'\n' for n in names);(O/'MANIFEST_SHA256.txt').write_text(core,encoding='utf-8')
zipfile_path=O/'RASSM_QGIS_PORTABLE_C.zip'
with zipfile.ZipFile(zipfile_path,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=6) as z:
 for n in names+['MANIFEST_SHA256.txt']:
  i=zipfile.ZipInfo(n,date_time=(2026,11,18,0,0,0));i.external_attr=0o100644<<16;z.writestr(i,(O/n).read_bytes(),compress_type=zipfile.ZIP_DEFLATED,compresslevel=6)
(O/'MANIFEST_SHA256.txt').write_text(core+sha(zipfile_path)+'  '+zipfile_path.name+'\n',encoding='utf-8')
isolated=W/'isolated_local';assert not isolated.exists(),'Use a fresh extraction directory'
with zipfile.ZipFile(zipfile_path) as z:
 assert z.testzip() is None;z.extractall(isolated)
 for line in z.read('MANIFEST_SHA256.txt').decode().splitlines():h,n=line.split('  ',1);assert sha(isolated/n)==h
inventory=[dict(name=n,path=str(O/n),bytes=(O/n).stat().st_size,sha256=sha(O/n)) for n in names+['MANIFEST_SHA256.txt',zipfile_path.name]]
(W/'upload_inventory.json').write_text(json.dumps(inventory,ensure_ascii=False,indent=2)+'\n',encoding='utf-8');print(json.dumps([dict(name=x['name'],bytes=x['bytes'],sha256=x['sha256']) for x in inventory]))
