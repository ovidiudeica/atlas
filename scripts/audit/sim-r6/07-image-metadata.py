from pathlib import Path
from PIL import Image
import json, hashlib, xml.etree.ElementTree as ET
rows=json.loads(Path('docs/audits/sim-r6/rights-review.json').read_text(encoding='utf-8'))
result=[]
for r in rows:
 a=r['initialImage']; p=Path('public/'+a['url']) if a['kind']=='local' else Path('work/sim-r6-evidence/rights-'+str(r['index']).zfill(2)+'.bin')
 record={'atlasId':r['atlasId'],'kind':r['kind'],'index':r['index'],'metadata':{}}
 try:
  b=p.read_bytes(); record['sha256']=hashlib.sha256(b).hexdigest()
  if b'<svg' in b[:1000]:
   root=ET.fromstring(b)
   record['format']='SVG'
   for e in root.iter():
    if e.tag.split('}')[-1].lower() in ('creator','rights','license','attributionname','attributionurl'):
     record['metadata'][e.tag]=' '.join(e.itertext())[:1500] or str(e.attrib)
  else:
   im=Image.open(p); record['format']=im.format; exif=im.getexif()
   for k,n in [(315,'Artist'),(33432,'Copyright'),(270,'ImageDescription')]:
    if k in exif: record['metadata'][n]=str(exif[k])[:1500]
   for k,v in im.info.items():
    if any(x in k.lower() for x in ('author','copyright','license','xmp','description')):record['metadata'][k]=str(v)[:3000]
  record['finding']='EXPLICIT_FIELDS_FOUND_REVIEW_REQUIRED' if record['metadata'] else 'NO_AUTHOR_OR_LICENCE_FIELDS_FOUND'
 except Exception as e:record['error']=str(e);record['finding']='UNAVAILABLE'
 result.append(record)
Path('docs/audits/sim-r6/image-metadata.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps([r for r in result if r['metadata']],ensure_ascii=True))
