#!/usr/bin/env python3
"""Generate audit-labeled EPSG:4326 RoHGIS GeoJSON shards for the 1930 snapshot.
Source geometries and verified parent attribute remain intact in original EPSG:3844 files.
This projection is for web display only, not historical border certification.
"""
import argparse
import geopandas as gpd,json,pathlib,hashlib,collections

def build_shards(base_path,county_path,plasa_path):
    base=pathlib.Path(base_path)
    cat_path=base/'catalog_rohgis_1930.json'; catalog=json.load(open(cat_path,encoding='utf-8'))
    vers={v['entityId']:v for v in catalog['versions']}
    shards=[]
    for name,path,layer,idcol in [('judete',str(county_path),'rohgis_judete_1930','Nume'),('plasi',str(plasa_path),'rohgis_plasi_1929_1933','id')]:
      frame=gpd.read_file(path,layer=layer)
      assert frame.crs.to_epsg()==3844
      frame=frame.to_crs(epsg=4326)
      items=[]
      for _,r in frame.iterrows():
        ident=('rohgis:county:1930:'+__import__('re').sub('[^a-z0-9]+','-', ''.join(c for c in __import__('unicodedata').normalize('NFKD',r['Nume'].replace('ș','s').replace('ț','t').replace('ş','s').replace('ţ','t')) if not __import__('unicodedata').combining(c)).lower()).strip('-')) if name=='judete' else 'rohgis:plasa:1930:'+str(r['id'])
        v=vers[ident]
        props={'atlasHistoricalSourceId':ident,'atlasHistoricalGeometryId':v['geometryId'],'atlasHistoricalBoundaryCertified':False,'sourceFamily':'ROHGIS','historicalYear':1930,'name':v['nameRo'],'parentEntityId':v['parentId']}
        obj={'type':'Feature','id':ident,'geometry':r.geometry.__geo_interface__,'properties':props}
        items.append(obj)
      items=sorted(items,key=lambda x:x['id'])
      current=[];curr_bytes=0;counter=0
      for feature in items:
        approx=len(json.dumps(feature,ensure_ascii=False,separators=(',',':')).encode('utf-8'))
        if current and curr_bytes+approx>580000:
          counter+=1;fn=f'geom/{name}-{counter:02d}.geojson';(base/'geom').mkdir(exist_ok=True)
          obj={'type':'FeatureCollection','metadata':{'schema':'hist-ohm-tree4-rohgis-geometry-shard-v1','crs':'EPSG:4326','sourceCRS':'EPSG:3844','year':1930,'sourceFamily':'ROHGIS','legalBoundariesCertified':False},'features':current}
          data=json.dumps(obj,ensure_ascii=False,separators=(',',':'))+'\n';(base/fn).write_text(data,encoding='utf-8')
          shards.append({'path':fn,'count':len(current),'bytes':len(data.encode()),'sha256':hashlib.sha256(data.encode()).hexdigest()})
          for f in current:vers[f['id']]['geometryShard']=fn
          current=[];curr_bytes=0
        current.append(feature);curr_bytes+=approx
      if current:
        counter+=1;fn=f'geom/{name}-{counter:02d}.geojson'
        obj={'type':'FeatureCollection','metadata':{'schema':'hist-ohm-tree4-rohgis-geometry-shard-v1','crs':'EPSG:4326','sourceCRS':'EPSG:3844','year':1930,'sourceFamily':'ROHGIS','legalBoundariesCertified':False},'features':current}
        data=json.dumps(obj,ensure_ascii=False,separators=(',',':'))+'\n';(base/fn).write_text(data,encoding='utf-8')
        shards.append({'path':fn,'count':len(current),'bytes':len(data.encode()),'sha256':hashlib.sha256(data.encode()).hexdigest()})
        for f in current:vers[f['id']]['geometryShard']=fn
    assert sum(s['count'] for s in shards)==565 and all('geometryShard'in v for v in catalog['versions'])
    catalog['geometryShards']=shards
    cat_path.write_text(json.dumps(catalog,ensure_ascii=False,sort_keys=True,indent=2)+'\n',encoding='utf-8')
    mini=base/'catalog_rohgis_1930.min.json';mini.write_text(json.dumps(catalog,ensure_ascii=False,separators=(',',':'))+'\n',encoding='utf-8')
    return shards

if __name__ == '__main__':
    parser=argparse.ArgumentParser()
    parser.add_argument('--base',required=True)
    parser.add_argument('--counties',required=True)
    parser.add_argument('--plasi',required=True)
    args=parser.parse_args()
    shards=build_shards(args.base,args.counties,args.plasi)
    print('shards',len(shards),'features',sum(x['count'] for x in shards),'bytes',sum(x['bytes'] for x in shards))