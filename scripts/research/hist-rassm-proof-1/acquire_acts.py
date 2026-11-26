import pathlib,re,json,urllib.request,urllib.parse,hashlib,html
base=pathlib.Path('work/proof1/sources'); log=[]
def fetch(url):
 return urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'HIST-RASSM research/1.0 (cartographic source verification)'}),timeout=40).read()
for key in ['LAW1924','LAW1924_BALTA','LAW1926']:
 raw=pathlib.Path('work/sources/'+key+'.html').read_text(encoding='utf-8')
 pages=sorted(set(urllib.parse.unquote(x).split(':',1)[1] for x in re.findall(r'title="([^"]+)"',raw) if urllib.parse.unquote(x).startswith('Сторінка:')))
 for page in pages:
  title,num=page.rsplit('/',1);params=dict(action='query',titles='File:'+title.replace('_',' '),prop='imageinfo',iiprop='url|size|sha1|extmetadata',iiurlwidth=1800,iiurlparam='page'+num,format='json')
  url='https://commons.wikimedia.org/w/api.php?'+urllib.parse.urlencode(params)
  rec=dict(id=key+'_page'+num,title=title,page=int(num),metadata_url=url)
  try:
   b=fetch(url); data=json.loads(b);(base/(rec['id']+'_imageinfo.json')).write_bytes(b)
   info=next(iter(data['query']['pages'].values()))['imageinfo'][0];rec['imageinfo']=info
   print(rec['id'],{k:info.get(k) for k in ['thumburl','width','height','size','thumbwidth','thumbheight']},flush=True)
   u=info.get('thumburl');b=fetch(u)
   if b[:2]!=b'\xff\xd8' and not b.startswith(b'\x89PNG'):raise ValueError('Not raster image')
   name=rec['id']+('.png' if b.startswith(b'\x89PNG') else '.jpg');(base/name).write_bytes(b);rec.update(file=name,sha256=hashlib.sha256(b).hexdigest(),bytes=len(b),download_url=u,status='RECOVERED_OFFICIAL_PAGE_RENDER')
  except Exception as e:rec.update(status='FAILED',error=type(e).__name__,detail=str(e)[:200])
  log.append(rec);(base/'acts_acquisition.json').write_text(json.dumps(log,ensure_ascii=False,indent=2),encoding='utf-8')
