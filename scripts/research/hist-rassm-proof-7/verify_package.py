from pathlib import Path
import sys,json,sqlite3,hashlib
sys.path.insert(0,str(Path.cwd()/'work/python_deps'))
import geopandas as g,pandas as pd,pyogrio
root=Path(sys.argv[1]).resolve();model=root/'RASSM_PROOF_7_temporal_C.gpkg';out=Path(sys.argv[2])
sha=lambda p:hashlib.sha256(Path(p).read_bytes()).hexdigest()
with sqlite3.connect(model) as c:assert c.execute('PRAGMA integrity_check').fetchone()[0]=='ok';tables={r[0] for r in c.execute('SELECT table_name FROM gpkg_contents')}
required=['EXTERNAL_CANDIDATES','INTERNAL_CANDIDATES','EXTERNAL_ADMITTED_AB','INTERNAL_ADMITTED_AB','INDEPENDENT_TRACES','TEMPORAL_CONTINUITY','UNRESOLVED','SOURCE_EVIDENCE','UNCERTAINTY'];assert all('RASSM_PROOF7_'+t in tables for t in required)
a=g.read_file(model,layer='RASSM_PROOF7_UNRESOLVED');seed=root/'11_COD/PROOF6_FROZEN_INPUT.gpkg';assert sha(seed)=='c482fdf9cff8b28ae1e3df3fb85d9b32927f212b5aa0dba2a28dd0b38726a990';b=g.read_file(seed,layer='RASSM_SOURCE_BOUNDARIES');assert a.arc_id.tolist()==b.arc_id.tolist();assert a.geometry.to_wkb().tolist()==b.geometry.to_wkb().tolist();assert len(a)==512 and a.arc_id.nunique()==512
counts={}
for t,typ in pyogrio.list_layers(model):
 if typ:
  d=g.read_file(model,layer=t);assert d.crs.to_epsg()==4326 and all(d.is_valid);counts[t]=len(d)
assert counts['RASSM_PROOF7_EXTERNAL_CANDIDATES']==158 and counts['RASSM_PROOF7_INTERNAL_CANDIDATES']==354
assert counts['RASSM_PROOF7_EXTERNAL_ADMITTED_AB']==counts['RASSM_PROOF7_INTERNAL_ADMITTED_AB']==0
assert counts['RASSM_PROOF7_INDEPENDENT_TRACES']==5
for k in ['EXTERNAL','INTERNAL']:
 d=g.read_file(model,layer='RASSM_PROOF7_'+k+'_CANDIDATES');ref=b[b.kind==k];assert d.arc_id.tolist()==ref.arc_id.tolist() and d.geometry.to_wkb().tolist()==ref.geometry.to_wkb().tolist()
dec=pd.read_csv(root/'12_RAPORT_FINAL/PROOF7_arc_decisions.csv');assert len(dec)==512 and set(dec.arc_id)==set(a.arc_id);assert not dec.PROOF7_admitted.any();assert not dec.PROOF7_individually_reevaluated_with_localizable_evidence.any()
sources=pd.read_csv(root/'12_RAPORT_FINAL/PROOF7_primary_sources.csv');assert len(sources)==9
for _,s in sources.iterrows():
 p=root/s.file;assert p.stat().st_size==s.bytes and sha(p)==s.sha256
assert (sources.status=='INVENTORY_ONLY').sum()==6
assert sources.native_recovered.sum()==6
regs=list((root/'12_RAPORT_FINAL').glob('PROOF7_*.csv'));required_regs=['primary_sources','archival_targets','source_authentication','original_maps','georeferencing','independent_GCP','boundary_admissions','arc_decisions','temporal_continuity','unresolved_evidence','comparison_PROOF6_PROOF7'];assert all((root/'12_RAPORT_FINAL'/('PROOF7_'+n+'.csv')).exists() for n in required_regs)
for n in ['georeferencing','independent_GCP','boundary_admissions']:assert len(pd.read_csv(root/'12_RAPORT_FINAL'/('PROOF7_'+n+'.csv')))==0
result=dict(passed=True,SQLite_integrity='ok',pilot_ID_WKB_exact_match_PROOF6=True,pilot_count=512,all_vector_crs_EPSG4326=True,all_vectors_valid=True,layer_counts=counts,required_registers=11,source_files_SHA_verified=9,new_geometric_evidence_arc_count=0,new_AB_count=0,new_physical_GCP_count=0)
out.write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result))
