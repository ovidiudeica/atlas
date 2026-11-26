import pathlib,json,csv,re,sqlite3,hashlib,shutil
ROOT=pathlib.Path.cwd();OUT=ROOT/'outputs/09_HIST-RASSM_FINAL';SRC=ROOT/'work/sources'
def csvread(p):
 with p.open(encoding='utf-8-sig',newline='') as f:return list(csv.DictReader(f))
def csvwrite(p,rows):
 keys=list(dict.fromkeys(k for r in rows for k in r))
 with p.open('w',encoding='utf-8-sig',newline='') as f:w=csv.DictWriter(f,keys);w.writeheader();w.writerows(rows)
def norm(s):return re.sub(r'[^а-яіїєґa-z0-9]','',s.lower())
def stem(s):return norm(re.sub(r'ська(?=\s|$)','ськ',s))
law=(SRC/'LAW1935.txt').read_text(encoding='utf-8');law_norm=norm(re.sub(r'ську(?=\s|[,.;]|$)','ськ',law))
rows=csvread(SRC/'HIST-RASSM_5b_pachet_probatoriu_2026-11-17/HIST-RASSM_5b_33_consilii_reconciliate_per_ID.csv')
for r in rows:
 s=stem(r['official_name_uk_1935']);r['recheck_2026_11_17']=s in law_norm;r['recheck_method']='Ukrainian adjectival stem; case ending ignored; Roman numerals retained';r['geometry_certainty']='D';r['settlement_geolocation']='NOT_ADMITTED';r['council_geometry']='MISSING'
csvwrite(OUT/'02_ADMINISTRATIE_ISTORICA/RASSM_33_consilii_reverificate.csv',rows)
tir=csvread(SRC/'HIST-RASSM_5b_pachet_probatoriu_2026-11-17/HIST-RASSM_5b_Tiraspol_1937_21_consilii.csv');tl=norm((SRC/'LAW1937A.txt').read_text(encoding='utf-8'))
for r in tir:
 r['recheck_2026_11_17']=stem(r['official_name_uk_1937']) in tl;r['geometry_certainty']='D'
 r['source_accusative_form']='Володимировську' if r['council_id']=='RASSM37-TIR-SR-13' else ''
 r['discrepancy']='Inherited Володимирівська differs from downloaded act Володимировську; preserve both; no automatic identity merger' if r['council_id']=='RASSM37-TIR-SR-13' else ''
csvwrite(OUT/'02_ADMINISTRATIE_ISTORICA/RASSM_Tiraspol_21_reverificate.csv',tir)
logs=json.loads((SRC/'laws_acquisition.json').read_text(encoding='utf-8'));urls={r['source']:r['url'] for r in logs}
early=[('Болгани','village','Kamianка','TRANSFER'),('Нижня Слобідка','village','Kamianка','TRANSFER'),('Сербівська','village_council','Kruti','TRANSFER'),('Кодимська','village_council','Kruti','TRANSFER'),('Французька','village_council','Kruti','TRANSFER'),('Будейська','village_council','Kruti','TRANSFER'),('Івано-Богословка','village','MASSR','TRANSFER'),('Шайки','village','MASSR','TRANSFER'),('Миролюбівка','village','MASSR','TRANSFER'),('Стара Андріяшівка','village','MASSR','TRANSFER'),('Нова Андріяшівка','village','MASSR','TRANSFER'),('Грабарівка','village','Kamianка','RECOGNITION_ALREADY_INCLUDED')]
earlyrows=[dict(entity_id='RASSM26-EXT-%02d'%(i+1),historical_name=n,entity_type=t,destination=d,event_type=e,document_date='1926-09-29',publication_date='1926-10-12',effective_date=None,source=urls['LAW1926'],geometry_certainty='D',geometry_id=None,external_effect='DOCUMENTED_ADMINISTRATIVE_BORDER_REGULATION_AREA_UNRESOLVED') for i,(n,t,d,e) in enumerate(early)]
csvwrite(OUT/'02_ADMINISTRATIE_ISTORICA/RASSM_1926_12_obiecte_transfer.csv',earlyrows)
events=csvread(SRC/'HIST-RASSM_5b_pachet_probatoriu_2026-11-17/HIST-RASSM_5b_cronologie_acte_1933_1937.csv')
for r in events:r['effective_date']=None;r['institution']='VUCIK / RASSM; see individual source';r['geometry_id']=None;r['geometry_certainty']='D'
for id,date,change,source in [('RFINAL-1924-01','1924-10-12','Constituire; descriere directionala a hotarului; delimitarea exacta incredintata comisiei mixte',urls['LAW1924']),('RFINAL-1924-02','1924-11-26','Balta si parte a raionului Balta catre RASSM; patru consilii catre Tulchin; comisia trebuie sa precizeze consiliile Balta',urls['LAW1924_BALTA']),('RFINAL-1926-01','1926-09-29','Reglementare hotar: 11 obiecte transferate si Hrabariivka recunoscuta; geometrii lipsa',urls['LAW1926'])]:
 events.append(dict(event_id=id,document_date=date,entity='MASSR_EXTERNAL_BORDER',documented_change=change,evidence_level='PRIMARY_LEGAL_TRANSCRIPTION_DOWNLOADED',source_url=source,territorial_consequence_status='EXTERNAL_ADMINISTRATIVE_CHANGE_GEOMETRY_UNRESOLVED',effective_date_exact_certified=False,legal_boundary_polygon_certified=False,effective_date=None,institution='VUCIK / Council of Peoples Commissars USSR Ukraine',geometry_id=None,geometry_certainty='D'))
csvwrite(OUT/'02_ADMINISTRATIE_ISTORICA/RASSM_cronologie_acte_extinsa.csv',sorted(events,key=lambda x:x['document_date']))
windows=[('1924-10-12','1924-11-25','FORMATION_DESCRIPTION_NOT_COMMISSION_BOUNDARY'),('1924-11-26','1926-09-28','BALTA_TRANSFER_AND_1925_CHANGES_PENDING'),('1926-09-29','1927-02-28','REGULATED_BORDER_NO_INDEPENDENT_POLYGON'),('1927-03-01','1928-08-14','HURI_G01_SOURCE_ONLY'),('1928-08-15','1932-03-19','HURI_G01_SOURCE_ONLY'),('1932-03-20','1933-07-03','HURI_G02_SOURCE_ONLY'),('1933-07-04','1934-06-03','TIRASPOL_CITY_COUNCIL_NOT_RAION'),('1934-06-04','1935-01-21','OLENO_KORYTSKE_EXTERNAL_EFFECT_UNRESOLVED'),('1935-01-22','1935-02-10','13_RAIONS_PLUS_CITY_COUNCIL'),('1935-02-11','1937-08-26','33_COUNCIL_REFORM_AND_INTERNAL_1936_TRANSFER'),('1937-08-27','1937-09-30','TIRASPOL_RAION_REESTABLISHED_21_COUNCILS'),('1937-10-01','1940-08-01','SMOLIANSKA_TRANSFER_AND_1938_1940_REVIEW_PENDING')]
csvwrite(OUT/'02_ADMINISTRATIE_ISTORICA/RASSM_ferestre_cercetare_1924_1940.csv',[dict(window_id='RASSM-WIN-%02d'%(i+1),research_start=a,research_end=b,documented_context=c,valid_geometry_from=None,valid_geometry_to=None,geometry_admitted=False,interval_type='RESEARCH_WINDOW_NOT_CERTIFIED_VALIDITY') for i,(a,b,c) in enumerate(windows)])
conn=sqlite3.connect(OUT/'02_ADMINISTRATIE_ISTORICA/RASSM_raioane_context_C.gpkg')
for name,records in [('consilii_1935_fara_geometrie',rows),('consilii_1937_fara_geometrie',tir),('transferuri_1926_fara_geometrie',earlyrows),('cronologie_documentara',events)]:
 cols=list(dict.fromkeys(k for r in records for k in r));conn.execute('DROP TABLE IF EXISTS "'+name+'"');conn.execute('CREATE TABLE "'+name+'" (fid INTEGER PRIMARY KEY,'+','.join('"'+c+'" TEXT' for c in cols)+')')
 conn.executemany('INSERT INTO "'+name+'" ('+','.join('"'+c+'"' for c in cols)+') VALUES ('+','.join('?' for _ in cols)+')',[[str(r.get(c)) if r.get(c) is not None else None for c in cols] for r in records]);conn.execute("INSERT OR REPLACE INTO gpkg_contents(table_name,data_type,identifier,description,last_change) VALUES (?,?,?,?,?)",(name,'attributes',name,'Documentary records; no geometry','2026-11-17T00:00:00.000Z'))
conn.commit();conn.close()
sources=[]
for r in logs:
 p=SRC/(r['source']+'.html');sources.append(dict(source_id=r['source'],source_url=r['url'],acquisition=r['status'],sha256=hashlib.sha256(p.read_bytes()).hexdigest() if p.exists() else None,kind='PUBLIC_TRANSCRIPTION_NOT_ARCHIVAL_FACSIMILE',rights='Source law public-domain tagging; surrounding page CC BY-SA; retain attribution'))
csvwrite(OUT/'04_REGISTRE_PROBATORII/RASSM_surse_externe_acte.csv',sources)
inspection=json.loads((ROOT/'work/raster_inspection.json').read_text(encoding='utf-8'))
for r in inspection:r['historical_evidence']='RETROSPECTIVE_ETHNOGRAPHIC_MAP_NOT_CONTEMPORANEOUS_BOUNDARY';r['admission']='CONTEXT_ONLY';r['gcp_admitted']=False
csvwrite(OUT/'04_REGISTRE_PROBATORII/RASSM_rastere_Drive_inspectate.csv',inspection)
saved=set();dest=OUT/'07_REPRODUCIBILITATE/inputs/drive_originals';dest.mkdir(exist_ok=True)
for p in (SRC/'drive_rasters').iterdir():
 h=hashlib.sha256(p.read_bytes()).hexdigest()
 if h not in saved:shutil.copy2(p,dest/(h+p.suffix.lower()));saved.add(h)
for p in SRC.glob('LAW*.html'):shutil.copy2(p,OUT/'07_REPRODUCIBILITATE/inputs'/p.name)
for p in SRC.glob('LAW*.txt'):shutil.copy2(p,OUT/'07_REPRODUCIBILITATE/inputs'/p.name)
checks=[]
for folder in SRC.glob('*pachet*'):
 p=folder/'SHA256SUMS.txt'
 if not p.exists():continue
 for line in p.read_text(encoding='utf-8-sig').splitlines():
  tokens=line.split(maxsplit=1)
  if len(tokens)!=2:continue
  h,name=tokens;f=folder/name.lstrip('* ')
  checks.append(dict(archive=folder.name,file=f.name,exists=f.exists(),matches=hashlib.sha256(f.read_bytes()).hexdigest()==h if f.exists() else False))
(OUT/'05_VALIDARE/QA_documentar.json').write_text(json.dumps(dict(councils_1935=len(rows),councils_1935_stem_matches=sum(r['recheck_2026_11_17'] for r in rows),councils_1937=len(tir),councils_1937_stem_matches=sum(r['recheck_2026_11_17'] for r in tir),archive_hash_checks=checks,rasters=31,unique_rasters=19,duplicate_rasters=12,early_1926_objects=12,law1926_date_conflict='Intro says November 1925, citation 1924/50 art304 and own act date Nov26 1924; kept as source discrepancy',new_boundary_polygons_reconstructed=0),ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(dict(councils1935_matches=sum(r['recheck_2026_11_17'] for r in rows),councils1937_matches=sum(r['recheck_2026_11_17'] for r in tir),hash_checks=len(checks),hash_failures=sum(not r['matches'] for r in checks)),ensure_ascii=False))
