from pathlib import Path
import json,hashlib,sqlite3
R=Path.cwd();W=R/'work/proof6_close';O=R/'outputs/15_HIST-RASSM_PROOF_6';V=O/'09_VALIDARE';V.mkdir(exist_ok=True)
read=lambda p:json.loads(Path(p).read_text(encoding='utf-8-sig'));sha=lambda p:hashlib.sha256(Path(p).read_bytes()).hexdigest()
original=read(R/'work/proof6/upload_inventory.json');drive=read(W/'initial_Drive_inventory.json');present={};duplicates=[]
for item in drive['subfolders']:
 for f in item['files']:
  rel=item['folder']['title']+'/'+f['title']
  if rel in present:duplicates.append(rel)
  present[rel]=f
for f in drive['root']:
 if f['mime_type']!='application/vnd.google-apps.folder':present[f['title']]=f
rows=[]
for x in original:
 p=O/x['relative'];exists=p.exists();localmatch=exists and sha(p)==x['sha256'];assert localmatch,('Original changed or missing',x['relative'])
 f=present.get(x['relative']);status='PRESENT_VERIFIED' if f else 'MISSING_RECOVERABLE'
 if f:assert int(f['size'])==x['bytes'],x['relative']
 rows.append(dict(relative=x['relative'],state=status,local_original_binary_verified=True,sha256=x['sha256'],bytes=x['bytes'],Drive_id=f['id'] if f else None,Drive_mime=f['mime_type'] if f else None,Drive_size=int(f['size']) if f else None,Drive_hash_available=None,Drive_hash_verification='PENDING_ACTUAL_DOWNLOAD' if f else 'MISSING',Drive_folder=x['relative'].split('/')[0] if '/' in x['relative'] else 'ROOT'))
assert sha(O/'RASSM_PROOF_6_temporal_C.gpkg')=='c482fdf9cff8b28ae1e3df3fb85d9b32927f212b5aa0dba2a28dd0b38726a990'
notproduced=[dict(relative=n,state='INTENTIONALLY_NOT_PRODUCED',reason='Original historical evidence not recovered; not a missing technical deliverable') for n in ['Original_Camenca_1959_decree_and_boundary_annex','Original_Camenca_1969_decree_and_boundary_annex','Original_Grigoriopol_1958_decree_and_boundary_annex','Original_Grigoriopol_1971_decree_and_boundary_annex','MD_UA_1995_1999_original_protocol_map_album','Historical_Ukrainian_predecessor_council_polygons','New_PROOF6_AB_M1_or_physical_GCP_geometry']]
result=dict(stage='PROOF.6-CLOSE',original_expected_files=len(original),initial_present_files=len(present),missing_recoverable=sum(x['state']=='MISSING_RECOVERABLE' for x in rows),original_files_rebuild_required=0,original_binary_all_verified=True,duplicates=duplicates,unrecoverable_technical_blockers=0,files=rows,intentionally_not_produced=notproduced,metadata_hash_note='Provider listing exposes no SHA256; actual raw-file download is used for verification. PRESENT_VERIFIED initially establishes name/size and exact local original; final audit adds downloadedSHA256.')
(V/'PROOF6_DELIVERY_GAP_AUDIT.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf-8');(W/'expected_originals.json').write_text(json.dumps(original,ensure_ascii=False,indent=2)+'\n',encoding='utf-8');print({k:result[k] for k in ['original_expected_files','initial_present_files','missing_recoverable','original_files_rebuild_required','duplicates']})
