import pathlib,urllib.request,json,hashlib
base=pathlib.Path('work/proof1/sources');path='/m/Russian_and_Soviet_maps/series/050K/L-35-35-A_(DUBOSSARY)_12.1936_LoC.jpg';log=[]
for scheme in ['https','http']:
 url=scheme+'://maps.mapywig.org'+path
 try:
  with urllib.request.urlopen(url,timeout=35) as response:b=response.read();ct=response.headers.get('Content-Type')
  log.append(dict(url=url,size=len(b),content_type=ct,sha256=hashlib.sha256(b).hexdigest()))
  if b[:2]==b'\xff\xd8':(base/'Dubasari_L3535A_1936.jpg').write_bytes(b);break
 except Exception as e:log.append(dict(url=url,error=type(e).__name__,reason=str(getattr(e,'reason',''))))
(base/'dubasari_download.json').write_text(json.dumps(log,ensure_ascii=False,indent=2),encoding='utf-8');print(json.dumps(log,ensure_ascii=False))
