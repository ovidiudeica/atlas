from pathlib import Path
from PIL import Image
import json,hashlib,xml.etree.ElementTree as ET
rows=json.loads(Path('docs/audits/sim-r7/rights-source-investigation.json').read_text(encoding='utf-8'))['cases'];result=[]
for r in rows:
 record={'atlasId':r['atlasId'],'kind':r['kind'],'index':r['index'],'author':None,'copyright':None,'licenceFields':[],'metadata':{},'creationDate':None}
 try:
  b=Path('work/sim-r7-rights/image-'+str(r['index'])+'.bin').read_bytes();record['sha256']=hashlib.sha256(b).hexdigest()
  if b'<svg' in b[:1000]:
   record['format']='SVG';root=ET.fromstring(b)
   for e in root.iter():
    if e.tag.split('}')[-1].lower() in ('creator','rights','license','attributionname','attributionurl'):record['licenceFields'].append({'tag':e.tag,'text':' '.join(e.itertext())[:1200],'attributes':e.attrib})
  else:
   im=Image.open(__import__('io').BytesIO(b));record['format']=im.format;exif=im.getexif();record['author']=str(exif[315]) if 315 in exif else None;record['copyright']=str(exif[33432]) if 33432 in exif else None
   record['creationDate']=str(exif[36867]) if 36867 in exif else None
   for k,v in im.info.items():
    if any(t in k.lower() for t in ('author','copyright','licen','xmp')):record['metadata'][k]=str(v)[:3500]
  record['state']='METADATA_EXAMINED'
 except Exception as e:record['state']='UNAVAILABLE';record['error']=str(e)
 result.append(record)
Path('docs/audits/sim-r7/image-metadata.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
print({'cases':len(result),'examined':sum(r['state']=='METADATA_EXAMINED' for r in result)})
