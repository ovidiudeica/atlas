from pathlib import Path
import sys,json,hashlib,sqlite3,shutil,os
R=Path.cwd();sys.path.insert(0,str(R/'work/python_deps'))
import geopandas as g,pandas as pd,pyogrio
W=R/'work/proof6';P=R/'outputs/14_HIST-RASSM_PROOF_5';O=Path(os.environ.get('PROOF6_OUTPUT',str(R/'outputs/15_HIST-RASSM_PROOF_6')))
D=['01_ACTE_SI_ANEXE','02_CAMENCA','03_GRIGORIOPOL','04_MOLDOVA_UCRAINA','05_UCRAINA','06_HOTAR_EXTERIOR','07_HOTARE_RAIONALE','08_DUBASARI','09_VALIDARE','10_QGIS','11_COD','12_RAPORT_FINAL']
for n in D:(O/n).mkdir(parents=True,exist_ok=True)
sha=lambda p:hashlib.sha256(Path(p).read_bytes()).hexdigest()
src=P/'RASSM_PROOF_5_temporal_C.gpkg';assert sha(src)=='0c53be76a1dfd75f582add57e0f534edb05015747905eba2f2de94a3268ebbed'
a=g.read_file(src,layer='RASSM_HISTORICAL_CANDIDATES');scope=pd.read_csv(W/'1999_scope_per_arc.csv');cross=pd.read_csv(W/'UKRAINE_KOATUU_KATOTTG_historical_crosswalk.csv');pred=pd.read_csv(W/'Ukraine_predecessor_units_verbatim.csv')
assert len(a)==512 and a.arc_id.nunique()==512
assert 'Савранська' not in cross.iloc[-1].predecessors_2025_verbatim
assert all('Липецька' in cross.iloc[-1][c] for c in ['predecessors_2020_verbatim','predecessors_2025_verbatim'])
S=[]
def copy_source(name,url,kind,note,folder=D[0]):
 p=W/'sources'/name;assert p.exists();shutil.copy2(p,O/folder/name);S.append(dict(source_id=name,file=folder+'/'+name,url=url,status=kind,note=note,bytes=p.stat().st_size,sha256=sha(p),geometry_admitted=False))
copy_source('moldavskaia_ssr_1988_god.pdf','https://archive.org/details/moldavskaia_ssr_1988_god','RECOVERED_PRIMARY_OFFICIAL_REFERENCE','Presidium Supreme Soviet MSSR; Cartia Moldoveneasca 1988; reference date 1 April 1988; 182 PDF pages, paired printed pages; not a recreation decree or boundary annex.')
copy_source('ANRM_R2848_inventory18.pdf','https://doc.arhiva.gov.md/inventare/Fondul%20R-2848/F.%20R-2848%20Inv.%2018.pdf','RECOVERED_PRIMARY_FINDING_AID','36 pages; USSR draft series not confused with MSSR series; units 127/131(1958),150/153(1959) retrieval leads only; individual acts and plans not recovered.')
native=json.loads((W/'acquisition_1988_native.json').read_text())
for x in native:copy_source(x['file'],x['url'],'RECOVERED_NATIVE_SCAN_PAGE','Native JP2 public archive member; identity and hash recorded; pages100/108 visually read. Not georeferenced.')
for file,url,note in [('Kokhivka_plan_text_extract.md','https://ananiv-mr.od.gov.ua/wp-content/uploads/2021/12/2021-0304gp-sr-1.pdf','Text consulted; native PDF strict TLS issuer failure. Legend separates village, starosta district, community. Not a Soviet council plan.'),('Ananiv_planning_catalog_extract.md','https://ananiv-mr.od.gov.ua/ekonomika-regionu/arhitektura-ta-mistobuduvannya','Official catalogue text; no historical polygon admitted.')]:copy_source(file,url,'CONSULTED_TEXT_NATIVE_FACSIMILE_NOT_RECOVERED',note,D[4])
for name in ['Ukraine_720_2020_annex_extract.md','Ukraine_720_2025_annex_extract.md','Ukraine_Moldova_1999_treaty_extract.md','Camenca_2026_passport_extract.md','Grigoriopol_1971_institutional.html']:
 shutil.copy2(R/'work/proof5/sources'/name,O/D[0]/name)
 S.append(dict(source_id=name,file=D[0]+'/'+name,url='See PROOF5 source register',status='REUSED_PROOF5_TEXT_NOT_NEW_RECOVERY',note='Context/source role retained; institutional history is not original decree',bytes=(O/D[0]/name).stat().st_size,sha256=sha(O/D[0]/name),geometry_admitted=False))
targets=[('CAM1959','Camenca','1959','ABOLITION','Institutional history only; exact day and original act/annex unresolved'),('CAM1969','Camenca','1969-01-10','RECREATION','Date corroborated by official1988reference pp34–35; original decree and delimitation annex missing'),('GRI1958','Grigoriopol','1958','ABOLITION','Institutional history only; exact day and original act/annex unresolved'),('GRI1971','Grigoriopol','1971-06-21','RECREATION','Date corroborated by official1988reference pp18–19; original decree and delimitation annex missing')]
acts=pd.DataFrame([dict(target_id=i,unit=u,date=d,event=e,original_act_recovered=False,boundary_annex_recovered=False,evidence=n,geometry_proved=False) for i,u,d,e,n in targets])
for i,u,d,e,n in targets:S.append(dict(source_id=i,file='',url='',status='IDENTIFIED_TARGET_NOT_RECOVERED',note=n,bytes=None,sha256=None,geometry_admitted=False))
for i in ['R2947/3/1','R2947/3/3','R2947/1/1б']:S.append(dict(source_id=i,file='',url='https://arhiva.gov.md/',status='INHERITED_UNRECOVERED_TARGET_NO_NEW_ACCESS',note='Actual1939map/1936Ananievmap/1924–25protocol not recovered; no repeated general search counted',bytes=None,sha256=None,geometry_admitted=False))
sources=pd.DataFrame(S);sources.to_csv(O/D[11]/'PROOF6_documente_delimitare.csv',index=False);acts.to_csv(O/D[11]/'PROOF6_acte_1958_1971.csv',index=False)
# Manual transcription checked against native paired printed pages. These are memberships, not polygons.
cam=['Валя-Адынкский','Васкауцкий','Вертюжанский','Верхнекугурештский','Грушковский','Жабский','Катериновский','Краснооктябрьский','Кузьминский','Куничский','Нападовский','Немировский','Нижнекугурештский','Окницкий','Подоймский','Приднестровский','Рашковский','Ротарский','Севериновский','Сенатовский','Слобода-Рашковский','Темелеуцкий','Хрустовский']
gri=['Буторский','Бычокский','Глинойский','Делакеу','Кармановский','Колосовский','Красногорский','Малаештский','Спейский','Ташлыкский','Тейский','Шипский']
councils=pd.DataFrame([dict(district=d,council_name_original=n,council_type=t,reference_date='1988-04-01',printed_pages=p,PDF_page=page,source='moldavskaia_ssr_1988_god.pdf',boundary_plan_recovered=False,polygon_admitted=False) for d,names,p,page in [('Camenca',cam,'34–35',108),('Grigoriopol',gri,'18–19',100)] for t,ns in [('RURAL',names),('URBAN',['Каменка'] if d=='Camenca' else ['Григориополь','Маяк'])] for n in ns])
cam_members=['Валя-Адынкэ;Константиновка','Васкауцы;Октябрьское;Фэгэдэу','Вертюжаны','Верхние Кугурешты;Николаевка;Ункитешты;п ж-д ст. Ункитешты','Грушка;Фрунзовка','Бурсук;Жабка','Катериновка;Садки','Александровка;Красный Октябрь','Войтовка;Кузьмин','Кунича','Нападово','Залучены;Немировка;Черлина','Нижние Кугурешты;Ципордей','Окница','Подойма;Подоймица','Приднестровское','Рашково;Янтарное','Бодяны;Ротарь;Соколовка','Севериновка','Сенатовка','Слобода-Рашково','Темелеуцы','Хрустовая']
gri_members=['Бутор;Виноградное;Индия','Бычок;Нововладимировка','Глиное','Делакеу;Красная Горка;Тимуш','Карманово;Котовка;Мочаровка;Федосеевка','Колосово;Красная Бессарабия;Победа','Красногорка','Малаешты;Черница','Спея','Ташлык','Тея;Токмазея','Веселое;Шипка']
membership={('Camenca',n):v for n,v in zip(cam,cam_members)};membership.update({('Grigoriopol',n):v for n,v in zip(gri,gri_members)});membership.update({('Camenca','Каменка'):'Каменка;Солнечное',('Grigoriopol','Григориополь'):'Григориополь;Красное',('Grigoriopol','Маяк'):'Маяк;Бруслаки;Гыртоп;Мариян;Мокряки'})
councils['settlements_1988_original_names']=[membership[(r.district,r.council_name_original)] for _,r in councils.iterrows()]
councils['geometry_or_bank_from_membership_alone']='NOT_DEDUCED;1988membership not1937polygon; right-bank territorial extent must be separately delimited'
assert sum(len(x.split(';')) for x in councils[councils.district=='Camenca'].settlements_1988_original_names)==43
assert sum(len(x.split(';')) for x in councils[councils.district=='Grigoriopol'].settlements_1988_original_names)==32
councils.to_csv(O/D[11]/'PROOF6_planuri_fonduri_satesti.csv',index=False)
compare=[]
for name,roman,former in [('Гыртоп','Hirtop','Dubasari'),('Делакеу','Delacau','Dubasari'),('Кармановский','Carmanova','Dubasari'),('Колосовский','Colosova','Dubasari'),('Шипский','Sipca','Dubasari'),('Буторский','Butor','Tiraspol'),('Красногорский','Crasnogorca','Tiraspol'),('Малаештский','Malaiesti','Tiraspol'),('Спейский','Speia','Tiraspol'),('Ташлыкский','Taslic','Tiraspol'),('Тейский','Teiu','Tiraspol')]:
 compare.append(dict(name_1971_reported=roman,predecessor_district_reported=former,reported_transfer_date='1971-06-21',source1971_role='INSTITUTIONAL_RETROSPECTIVE_HISTORY_NOT_ORIGINAL_DECREE',name1988=name,status1988='VILLAGE_UNDER_MAIAK_URBAN_COUNCIL' if name=='Гыртоп' else 'RURAL_COUNCIL_NAME_PRESENT',source1988='Official1988reference pp18–19;1April1988',intermediate_change_date=None,boundary_plan_recovered=False,geometric_identity_proved=False))
pd.DataFrame(compare).to_csv(O/D[2]/'GRIGORIOPOL_1971_1988_council_comparison.csv',index=False)
cross.to_csv(O/D[4]/'UKRAINE_KOATUU_KATOTTG_historical_crosswalk.csv',index=False);pred.to_csv(O/D[11]/'PROOF6_Ukraine_predecessor_units.csv',index=False)
scope.to_csv(O/D[3]/'1999_scope_per_arc.csv',index=False);shutil.copy2(W/'1999_scope_per_corridor.csv',O/D[3]/'1999_scope_per_corridor.csv')
scope_evidence=pd.DataFrame([dict(document='1995–1999 protocol-description and topographic map album',status='REFERRED_BY_1999_TREATY_NOT_RECOVERED',date='1995–1999 work period; exact annex date not independently verified',scope='Modern international Moldova–Ukraine boundary only; no retroactive RASSM admission',scale='TreatyArticle7:1:50000 maps and1:10000 working material; not authenticated annex scale',issuer='TreatyArticle1 bilateral delimitation documents; original signature/version not inspected',legal='Article3 river rules apply only within treaty scope; Article11 is not evidence that every annex is secret',source='https://zakon.rada.gov.ua/laws/show/498_046/print',pilot_linear_overlap_m=0,point_intersections=4,threshold_m=100,threshold_role='SEARCH_SCREEN_NOT_ACCURACY_OR_LEGAL_APPLICABILITY')])
scope_evidence.to_csv(O/D[3]/'MD_UA_1995_1999_scope_and_boundary_evidence.csv',index=False)
dec=pd.read_csv(P/'11_RAPORT_FINAL/PROOF5_continuitate_per_arc.csv').merge(scope.drop(columns=['corridor_id','kind','episode']),on='arc_id',validate='one_to_one')
dec['PROOF6_new_evidence']=dec.corridor_id.map({'C1':'Official1988reference:1969date,23rural1urban councils;1959/1969annex missing','C2':'Official1988Grigoriopol composition affects successor context; Tiraspol1933–1937identity gap retained','C3':'Official1988reference:1971date,12rural2urban councils; Hirtop under Maiak; original1958/1971annex missing','C4':'2020/2025annex centre-code crosswalk; predecessor partial-territory clauses; no council boundary plans recovered'})
dec['PROOF6_geometry_admitted']=False;dec['PROOF6_geometric_chain_complete']=False;dec['PROOF6_new_class']='C'
dec.to_csv(O/D[11]/'PROOF6_continuitate_per_arc.csv',index=False)
gaps=dec[['arc_id','corridor_id','kind','historical_units','documentary_gaps','PROOF6_new_evidence']].copy();gaps['required_next_evidence']='Original dated boundary annex/plan or independent physical controls; administrative membership alone insufficient';gaps.to_csv(O/D[11]/'PROOF6_restante_individuale.csv',index=False)
pd.DataFrame(columns=['arc_id','source','previous_M','new_M','length_km','reason']).to_csv(O/D[11]/'PROOF6_M1_promovari.csv',index=False)
pd.DataFrame(columns=['arc_id','kind','class','length_km','independent_evidence','absolute_accuracy_m']).to_csv(O/D[11]/'PROOF6_geometrii_AB.csv',index=False)
empty=g.GeoDataFrame({'arc_id':pd.Series(dtype='str'),'reason':pd.Series(dtype='str')},geometry=g.GeoSeries([],crs=4326),crs=4326)
model=O/'RASSM_PROOF_6_temporal_C.gpkg'
if model.exists():model.unlink()
for table in ['EXTERNAL_ADMITTED','INTERNAL_ADMITTED']:empty.to_file(model,layer=table,driver='GPKG',geometry_type='LineString')
for table,data in [('RASSM_SOURCE_BOUNDARIES',a),('UNRESOLVED_BOUNDARIES',a)]+[(n,a[a.corridor_id==c]) for c,n in [('C1','C1_CAMENCA'),('C2','C2_TIRASPOL'),('C3','C3_GRIGORIOPOL'),('C4','C4_UKRAINE')]]:data.to_file(model,layer=table,driver='GPKG')
for old,new in [('RASSM_RECONSTRUCTED_ARCS','RETAINED_PROOF5_NOMINAL_C_TRACES'),('RASSM_CURRENT_OSMB_ARCS','CURRENT_OSMB_REFERENCE_C'),('RASSM_DISTRICT_REFERENCE_8_EPISODES_C','DISTRICT_REFERENCE_8_EPISODES_C')]:g.read_file(src,layer=old).to_file(model,layer=new,driver='GPKG')
border=g.read_file(W/'scope_reference.gpkg');border.to_file(model,layer='MD_UA_SHARED_LEVEL2_REFERENCE_C',driver='GPKG')
def attrs(path,tables):
 with sqlite3.connect(path) as c:
  for table,df in tables:
   df.to_sql(table,c,index=False,if_exists='replace');c.execute('INSERT OR REPLACE INTO gpkg_contents(table_name,data_type,identifier,description,srs_id) VALUES(?,?,?,?,NULL)',(table,'attributes',table,'Evidence/context; not certified historical geometry'))
attrs(model,[('BOUNDARY_CONTINUITY',dec),('ADMINISTRATIVE_EVENTS',acts),('SOURCES_AND_DECISIONS',sources),('COUNCILS_1988_PRIMARY_REFERENCE',councils),('UKRAINE_CENTRE_CODE_CROSSWALK',cross),('UKRAINE_PREDECESSOR_TEXT',pred),('MD_UA_TREATY_SCOPE',scope_evidence)])
with sqlite3.connect(src) as old:
 inherited_events=pd.read_sql_query('SELECT * FROM RASSM_TEMPORAL_TRANSITIONS',old);inherited_sources=pd.read_sql_query('SELECT * FROM RASSM_SOURCE_EVIDENCE',old)
inherited_sources['source_package']='14_HIST-RASSM_PROOF_5; input hash pinned; retained original source IDs; files are not new recoveries'
attrs(model,[('INHERITED_PROOF5_EVENT_CONTEXT',inherited_events),('INHERITED_PROOF5_SOURCE_EVIDENCE',inherited_sources)])
inherited_events.to_csv(O/D[11]/'PROOF6_inherited_PROOF5_events.csv',index=False)
inherited_sources.to_csv(O/D[11]/'PROOF6_inherited_PROOF5_sources.csv',index=False)
for cid,folder,name in [('C1',D[1],'CAMENCA_1959_1969_delimitare_si_continuitate.gpkg'),('C3',D[2],'GRIGORIOPOL_1958_1971_delimitare_si_continuitate.gpkg')]:
 path=O/folder/name
 if path.exists():path.unlink()
 a[a.corridor_id==cid].to_file(path,layer='UNCHANGED_PILOT_CANDIDATES_C',driver='GPKG');empty.to_file(path,layer='HISTORICAL_BOUNDARIES_ADMITTED',driver='GPKG',geometry_type='LineString');attrs(path,[('ACT_TARGETS',acts[acts.unit==('Camenca' if cid=='C1' else 'Grigoriopol')]),('COUNCILS_1988',councils[councils.district==('Camenca' if cid=='C1' else 'Grigoriopol')]),('CONTINUITY',dec[dec.corridor_id==cid])])
path=O/D[4]/'UKRAINE_predecessor_councils_boundaries.gpkg'
if path.exists():path.unlink()
empty.to_file(path,layer='HISTORICAL_COUNCIL_POLYGONS_NOT_RECOVERED',driver='GPKG',geometry_type='Polygon');a[a.corridor_id=='C4'].to_file(path,layer='PILOT_HISTORICAL_CANDIDATES_C_NOT_COUNCIL_POLYGONS',driver='GPKG');attrs(path,[('CENTRE_CODE_CROSSWALK',cross),('PREDECESSOR_TEXT',pred)])
for kind,folder in [('EXTERNAL',D[5]),('INTERNAL',D[6])]:a[a.kind==kind].to_file(O/folder/'pilot_candidates_C.geojson',driver='GeoJSON')
for file in (P/'07_DUBASARI').iterdir():
 if file.is_file():shutil.copy2(file,O/D[7]/file.name)
shutil.copy2(P/'04_HARTI_SI_ACTE_PRIMARE/MSE5_native_nominal_C.tif',O/D[0]/'MSE5_native_nominal_C_RETAINED.tif')
counts={};b=g.read_file(model,layer='RASSM_SOURCE_BOUNDARIES');assert b.arc_id.tolist()==a.arc_id.tolist() and b.geometry.to_wkb().tolist()==a.geometry.to_wkb().tolist()
for file in O.rglob('*.gpkg'):
 for table,typ in pyogrio.list_layers(file):
  if typ is not None:
   data=g.read_file(file,layer=table);assert data.crs.to_epsg()==4326 and all(data.is_valid),(file,table);counts[file.relative_to(O).as_posix()+':'+table]=len(data)
assert scope.linear_overlap_reference_m.sum()==0 and scope.intersects_reference.sum()==4
validation=dict(passed=True,pilot_arcs=512,all_pilot_ids_and_WKB_unchanged=True,PROOF5_input_sha256=sha(src),all_vectors_4326_valid=True,layer_counts=counts,new_M1_km=0,new_AB_km=0,new_historically_founded_km=0,original_delimitation_annexes_recovered=0,physical_GCP_admitted=0,absolute_accuracy_m=None,point_intersections_MD_UA=4,linear_overlap_MD_UA_m=0,code_role='ADMINISTRATIVE_CENTRE_LOCALITY_NOT_TERRITORY_GEOMETRY',prior_traces_retained_not_new=True,general_audit_rerun=False)
(O/D[8]/'GIS_administrative_validation.json').write_text(json.dumps(validation,indent=2)+'\n')
summary=json.loads((P/'11_RAPORT_FINAL/summary.json').read_text());summary.update(verdict='PROOF.6-C',new_primary_official_repertoires_recovered=1,new_primary_finding_aids_recovered=1,original_delimitation_annexes_recovered=0,new_native_cartographic_C_trace_count=0,new_nominal_cartographic_C_km=0,new_historically_founded_boundary_km=0,new_primary_normative_acts_read=0,new_primary_facsimile_acts_recovered=0,documented_event_records=4,administrative_chains_partial=4,source_councils_1988=38,centre_code_crosswalk_rows=4,predecessor_text_lines=len(pred),scope_tested_arcs=512,point_intersections_MD_UA=4,linear_overlap_MD_UA_m=0)
(O/D[11]/'summary.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
metrics=['pilot_arcs','new_M1_km','new_external_AB_km','new_internal_AB_km','new_nominal_cartographic_C_km','geometric_chains_complete','physical_GCP_admitted'];prev=json.loads((P/'11_RAPORT_FINAL/summary.json').read_text());pd.DataFrame([dict(metric=k,PROOF5=prev[k],PROOF6=summary[k]) for k in metrics]).to_csv(O/D[11]/'PROOF6_comparatie_PROOF5_PROOF6.csv',index=False)
for file in ['per_corridor.csv','per_raion.csv']:shutil.copy2(P/'11_RAPORT_FINAL'/file,O/D[11]/file)
for file in ['build_package.py','build_crosswalk.py','scope_1999.py']:shutil.copy2(W/file,O/D[10]/file)
(O/D[10]/'input_manifest.json').write_text(json.dumps({'PROOF5_GPKG_SHA256':sha(src),'MSSR1988_PDF_SHA256':sha(W/'sources/moldavskaia_ssr_1988_god.pdf'),'MSSR1988_reference_date':'1988-04-01','protected_base':json.loads((W/'initial_state.json').read_text())['base']},indent=2)+'\n')
print(json.dumps(summary,ensure_ascii=False))
