import pathlib,urllib.request,urllib.parse,json,hashlib,time
root=pathlib.Path('work/proof1/sources');root.mkdir(parents=True,exist_ok=True);log=[]
def get(url,name):
 try:
  with urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'HIST-RASSM research/1.0 (cartographic source verification)'}),timeout=40) as r:b=r.read();headers=dict(r.headers)
  p=root/name;p.write_bytes(b);log.append(dict(url=url,file=name,status=200,size=len(b),sha256=hashlib.sha256(b).hexdigest(),headers=headers));return b
 except Exception as e:log.append(dict(url=url,file=name,error=type(e).__name__,status=getattr(e,'code',None),retry_after=e.headers.get('Retry-After') if hasattr(e,'headers') else None));return None
api='https://commons.wikimedia.org/w/api.php?'+urllib.parse.urlencode(dict(action='query',titles='File:Map of the Moldavian ASSR.jpg',prop='imageinfo',iiprop='url|size|sha1|extmetadata',iiurlwidth=1280,format='json'))
b=get(api,'commons_imageinfo.json')
if b:
 try:
  j=json.loads(b);ii=next(iter(j['query']['pages'].values()))['imageinfo'][0]
  get(ii['url'],'Eftodiev_1929_original.jpg')
  if not (root/'Eftodiev_1929_original.jpg').exists() and ii.get('thumburl'):get(ii['thumburl'],'Eftodiev_1929_official_1280.jpg')
 except Exception as e:log.append(dict(error=type(e).__name__))
else:
 get('https://commons.wikimedia.org/wiki/Special:Redirect/file/Map_of_the_Moldavian_ASSR.jpg?width=1280','Eftodiev_1929_official_1280.jpg')
(root/'acquisition_1929.json').write_text(json.dumps(log,ensure_ascii=False,indent=2),encoding='utf-8');print(json.dumps([{k:v for k,v in x.items() if k!='headers'} for x in log],ensure_ascii=False))
