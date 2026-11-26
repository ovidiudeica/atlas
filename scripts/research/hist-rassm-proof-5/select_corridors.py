from pathlib import Path
import sys,json,hashlib
R=Path.cwd();sys.path.insert(0,str(R/'work/python_deps'))
import geopandas as g,pandas as pd,shapely
from pyproj import Geod
W=R/'work/proof5';P=R/'outputs/11_HIST-RASSM_PROOF_2/RASSM_PROOF_2_temporal_C.gpkg'
assert hashlib.sha256(P.read_bytes()).hexdigest()=='4ae9ec315841246a07d3678bfda045d14c2e5a2567547835624c0172f605b494'
a=g.read_file(P,layer='RASSM_BOUNDARY_ARCS',where="episode='1937-01-15'");districts=g.read_file(P,layer='RASSM_DISTRICTS');modern=g.read_file(P,layer='OSMB_MODERN_ARCS_C');chosen=[];summary=[]
specs=[('C1','Camenca–Rîbnița',[{'Kamianka','Rybnytsia'}],['Kamianka'],48.08),('C2','Tiraspol–Slobozia',[{'Tyraspol','Slobodzeia'}],['Slobodzeia','Tyraspol'],46.65),('C3','Dubăsari–Grigoriopol',[{'Dubosary','Hryhoriopol'}],['Dubosary','Hryhoriopol'],47.18),('C4','Ananiev–Balta–Kotovsk',[{'Ananiv','Balta'},{'Ananiv','Kotovsk'},{'Balta','Kotovsk'}],['Ananiv','Balta','Kotovsk'],47.95)]
for cid,name,pairs,extunits,lat in specs:
 inside=a[(a.kind=='INTERNAL')&a.adjacent_raion_names.apply(lambda x:set(str(x).split(';')) in pairs)].copy();inside['corridor_id']=cid;inside['corridor_name']=name;chosen.append(inside)
 # One contiguous 12km parent-chain window per pilot, centred on the strongest eligible geometric candidate.
 ext=a[(a.kind=='EXTERNAL')&a.adjacent_raion_names.isin(extunits)].copy();ext['selection_lat_distance']=[abs(z.centroid.y-lat) for z in ext.geometry];ext['M_rank']=ext.M_category.map({'M2':0,'M3':1,'M4':2,'M5':3});seed=ext.sort_values(['M_rank','selection_lat_distance','arc_id']).iloc[0];centre=(seed.chainage_start_m+seed.chainage_end_m)/2
 ext=ext[(ext.parent_id==seed.parent_id)&(ext.chainage_end_m>=centre-6000)&(ext.chainage_start_m<=centre+6000)].copy();ext['corridor_id']=cid;ext['corridor_name']=name;ext=ext.drop(columns=['selection_lat_distance','M_rank']);chosen.append(ext)
 summary.append(dict(corridor_id=cid,name=name,internal_arcs=len(inside),internal_km=inside.length_geodesic_m.sum()/1000,external_arcs=len(ext),external_km=ext.length_geodesic_m.sum()/1000,external_parent_id=seed.parent_id,selection='Entire selected shared historical pair plus one contiguous external parent-chain12kmwindow; original stable PROOF2arc IDs and WKB preserved. No new general reconciliation.'))
b=g.GeoDataFrame(pd.concat(chosen,ignore_index=True),crs=4326);assert b.arc_id.nunique()==len(b);b.to_file(W/'corridors_input.gpkg',layer='pilot_arcs',driver='GPKG');ids=set(';'.join(b.modern_arc_ids.fillna('')).split(';'));m=modern[modern.modern_arc_id.isin(ids)];m.to_file(W/'corridors_input.gpkg',layer='modern_source_arcs',driver='GPKG')
names=set(';'.join(b.adjacent_raion_names).split(';'));districts[districts.huri_name.isin(names)].to_file(W/'corridors_input.gpkg',layer='districts_all_episodes_C',driver='GPKG');pd.DataFrame(summary).to_csv(W/'corridors.csv',index=False)
print(json.dumps(summary,ensure_ascii=False));print('Stablearcs',len(b),'modernarcs',len(m))
