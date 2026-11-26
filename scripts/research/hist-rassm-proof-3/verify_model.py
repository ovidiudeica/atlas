import pathlib,sys,json,zipfile,xml.etree.ElementTree as ET
ROOT=pathlib.Path.cwd();sys.path.insert(0,str(ROOT/'work/python_deps'))
import geopandas as gpd,pyogrio
O=ROOT/'outputs/12_HIST-RASSM_PROOF_3';B=ROOT/'outputs/11_HIST-RASSM_PROOF_2';p=O/'RASSM_PROOF_3_temporal_C.gpkg';layers=pyogrio.list_layers(p);counts={}
for name,typ in layers:
 if typ is None:continue
 d=gpd.read_file(p,layer=name);assert d.crs.to_epsg()==4326,name;assert all(d.is_valid),name;counts[name]=len(d)
assert counts['RASSM_EXTERNAL_ADMITTED']==counts['RASSM_INTERNAL_ADMITTED']==0
a=gpd.read_file(p,layer='RASSM_MODERN_CONTINUITY');b=gpd.read_file(B/'RASSM_PROOF_2_temporal_C.gpkg',layer='OSMB_MODERN_ARCS_C');bm={r.modern_arc_id:r for _,r in b.iterrows()}
for _,r in a.iterrows():assert r.geometry.wkb==bm[r.modern_arc_id].geometry.wkb;assert r.source_objects==bm[r.modern_arc_id].source_objects
a=gpd.read_file(p,layer='HURI_1937_DISTRICTS_REFERENCE_C');b=gpd.read_file(B/'RASSM_PROOF_2_temporal_C.gpkg',layer='RASSM_DISTRICTS',where="snapshot='1937-01-15'");assert len(a)==len(b)==14;assert {g.wkb for g in a.geometry}=={g.wkb for g in b.geometry}
connectivity={}
for table in ['RASSM_EXTERNAL_CANDIDATES','RASSM_INTERNAL_CANDIDATES','RASSM_HISTORICAL_RECONSTRUCTIONS']:
 d=gpd.read_file(p,layer=table);parent={};degrees={}
 def find(x):
  parent.setdefault(x,x)
  while parent[x]!=x:parent[x]=parent[parent[x]];x=parent[x]
  return x
 for g in d.geometry:
  u=tuple(round(z,10) for z in g.coords[0]);v=tuple(round(z,10) for z in g.coords[-1]);parent[find(u)]=find(v);degrees[u]=degrees.get(u,0)+1;degrees[v]=degrees.get(v,0)+1
 connectivity[table]=dict(edges=len(d),endpoint_components=len({find(x) for x in parent}),degree1_nodes=sum(x==1 for x in degrees.values()),method='Endpoint diagnostic at1e-10degrees; no coordinate mutation; partial source traces need not form a closed network')
with zipfile.ZipFile(O/'07_QGIS/RASSM_PROOF_3_C.qgz') as z:
 q=ET.fromstring(z.read(next(n for n in z.namelist() if n.endswith('.qgs'))));ds=[n.text or '' for n in q.findall('.//projectlayers/maplayer/datasource')]
 assert all(not (len(x)>2 and x[1:3]==':/') for x in ds),ds
result=dict(passed=True,spatial_layer_counts=counts,all_vector_crs='EPSG:4326',modern_source_WKB_and_provenance_identical=True,unchanged_district_polygons=14,new_polygons_created=0,relative_QGIS_datasources_verified=True,endpoint_connectivity_diagnostics=connectivity)
(O/'06_VALIDARE/topology_model.json').write_text(json.dumps(result,indent=2)+'\n',encoding='utf-8');print(json.dumps(result))
