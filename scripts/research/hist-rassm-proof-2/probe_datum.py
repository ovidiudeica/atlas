import pathlib,sys,json
sys.path.insert(0,str(pathlib.Path('work/python_deps').resolve()))
from pyproj import Proj,Transformer
import numpy as np
from PIL import Image,ImageDraw,ImageFont
p=pathlib.Path('work/proof2');tr=json.loads(pathlib.Path('outputs/10_HIST-RASSM_PROOF_1/02_GCP_SI_GEOREFERENTIERE/transformari.json').read_text());coef=np.array(tr['models'][0]['parameters']);origin=np.array(tr['normalization']['target_origin_m']);J=coef[1:,:].T/3000;offset=coef[0]+origin-J@np.array([4000,3800]);utm=Transformer.from_crs(4326,32635,always_xy=True)
im=Image.open('work/proof1/sources/Dubasari_L3535A_1936.jpg');out=Image.new('RGB',(1400,1400),'white');rec=[]
for k,(e,n) in enumerate([(5658000,5242000),(5664000,5238000),(5668000,5230000),(5654000,5232000)]):
 predictions={}
 for ellps in ['bessel','krass','WGS84']:
  pr=Proj(proj='tmerc',lat_0=0,lon_0=27,k=1,x_0=5500000,y_0=0,ellps=ellps);lon,lat=pr(e,n,inverse=True);xy=np.array(utm.transform(lon,lat));pix=np.linalg.solve(J,xy-offset);predictions[ellps]=pix.tolist()
 x,y=predictions['bessel'];box=(int(x)-320,int(y)-320,int(x)+380,int(y)+380);crop=im.crop(box);d=ImageDraw.Draw(crop)
 for ellps,col in [('bessel','lime'),('krass','red'),('WGS84','magenta')]:
  xx,yy=predictions[ellps];xx-=box[0];yy-=box[1];d.ellipse((xx-8,yy-8,xx+8,yy+8),outline=col,width=3);d.text((xx+12,yy),ellps,fill=col,stroke_width=1)
 d.text((5,5),str((e,n))+' origin '+str(box[:2]),fill='black');out.paste(crop,(k%2*700,k//2*700));rec.append(dict(easting=e,northing=n,predicted_pixels=predictions,crop_origin=box[:2]))
out.save(p/'datum_probe.jpg');(p/'datum_probe_predictions.json').write_text(json.dumps(rec,indent=2));print(json.dumps(rec))
