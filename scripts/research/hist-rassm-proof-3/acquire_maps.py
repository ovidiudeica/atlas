import pathlib,urllib.request,urllib.parse,json,hashlib,re,concurrent.futures
P=pathlib.Path('work/proof3/sources');P.mkdir(parents=True,exist_ok=True)
def get(item):
 n,u=item;out=dict(file=n,url=u)
 try:
  req=urllib.request.Request(u,headers={'User-Agent':'HIST-RASSM research/3.0 (public source verification)'})
  with urllib.request.urlopen(req,timeout=45) as r:b=r.read();out.update(status=r.status,content_type=r.headers.get('Content-Type'),bytes=len(b),sha256=hashlib.sha256(b).hexdigest())
  (P/n).write_bytes(b)
 except Exception as e:out.update(error=str(e),status=getattr(e,'code',None),retry_after=e.headers.get('Retry-After') if hasattr(e,'headers') else None)
 print(json.dumps(out,ensure_ascii=False),flush=True);return out
targets=[('mapywig100K.html','http://maps.mapywig.org/m/Russian_and_Soviet_maps/series/100K/'),('IU_Tiraspol.html','https://datacore.iu.edu/concern/data_sets/bz60cx02x?locale=en'),('IU_Tiraspol_download.response','https://datacore.iu.edu/downloads/k0698847c?locale=en'),('Eftodiev_native.jpg','https://upload.wikimedia.org/wikipedia/commons/1/16/Map_of_the_Moldavian_ASSR.jpg'),('MASSR1930_native.png','https://upload.wikimedia.org/wikipedia/commons/f/f8/Massr_map.png'),('Ukraine1939_native.jpg','https://upload.wikimedia.org/wikipedia/commons/0/0c/Map_of_Ukraine_MASSR_1939.jpg'),('ethnic1928_native.jpg','https://upload.wikimedia.org/wikipedia/commons/c/c2/Harta_etnica_rassm.jpg')]
with concurrent.futures.ThreadPoolExecutor(max_workers=3) as ex:rows=list(ex.map(get,targets))
(P/'acquisition_maps.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
