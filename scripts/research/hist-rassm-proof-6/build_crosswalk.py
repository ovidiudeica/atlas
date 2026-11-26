from pathlib import Path
import re,json,hashlib,sys,unicodedata
R=Path.cwd();sys.path.insert(0,str(R/'work/python_deps'))
import pandas as pd,geopandas as g
W=R/'work/proof6';S=R/'work/proof5/sources';old=(S/'Ukraine_720_2020_annex_extract.md').read_text(encoding='utf-8');new=(S/'Ukraine_720_2025_annex_extract.md').read_text(encoding='utf-8')
def blocks(text,year):
 text=''.join(c for c in text if unicodedata.category(c)!='Cf')
 pattern=r'(?m)^([^\n]+?)\s*('+ (r'\d{10}' if year==2020 else r'UA\d{17}') +r')\s+(?:м\.|с\.|смт|с-ще)\s*([^\n]+)'
 matches=list(re.finditer(pattern,text));out=[]
 for i,m in enumerate(matches):
  end=matches[i+1].start() if i+1<len(matches) else len(text);out.append(dict(heading=m.group(1).strip(),code=m.group(2),firstline=m.group(3).strip(),raw=text[m.start():end].strip()))
 return out
b20=blocks(old,2020);b25=blocks(new,2025);targets=['Ананьївська','Балтська','Куяльницька','Подільська'];rows=[];pred=[];source='https://zakon.rada.gov.ua/laws/file/text/81/f496291n9.doc';source25='https://zakon.rada.gov.ua/laws/file/text/132/f496291n12.docx'
for name in targets:
 a=next(x for x in b20 if x['heading']==name);b=next(x for x in b25 if x['heading'].startswith(name+' '));row=dict(unit_name=name,KOATUU_2020=a['code'],KATOTTG_2025=b['code'],code_role='ADMINISTRATIVE_CENTRE_LOCALITY_AS_LABELLED_IN_ANNEX_NOT_BOUNDARY_GEOMETRY_ID',source_2020=source,source_2025=source25,annex_2020_heading=a['heading'],annex_2025_heading=b['heading'],predecessors_2020_verbatim=a['raw'],predecessors_2025_verbatim=b['raw'],historical_council_polygon_documented=False,code_identity_proves_geometry=False,source_2020_sha256=hashlib.sha256((S/'Ukraine_720_2020_annex_extract.md').read_bytes()).hexdigest(),source_2025_sha256=hashlib.sha256((S/'Ukraine_720_2025_annex_extract.md').read_bytes()).hexdigest());rows.append(row)
 for year,entry in [(2020,a),(2025,b)]:
  for i,line in enumerate(entry['raw'].splitlines()[1:],1):
   line=line.strip()
   if line:pred.append(dict(parent_unit=name,annex_year=year,admin_centre_code=entry['code'],sequence=i,predecessor_or_scope_text=line,predecessor_unit_code=None,whole_council_geometry_proved=False,interpretation='Verbatimannexline; parenthesesandpartialterritoryclausespreserved; not onepolygon perline'))
pd.DataFrame(rows).to_csv(W/'UKRAINE_KOATUU_KATOTTG_historical_crosswalk.csv',index=False);pd.DataFrame(pred).to_csv(W/'Ukraine_predecessor_units_verbatim.csv',index=False)
(W/'Ukraine_selected_annex_blocks.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps([{k:x[k] for k in ['unit_name','KOATUU_2020','KATOTTG_2025']} for x in rows],ensure_ascii=False));print('Parsedblocks',len(b20),len(b25),'verbatimlines',len(pred))
for row in rows:
 if row['unit_name'] in ['Куяльницька','Подільська']:print(row['unit_name'],'2020',row['predecessors_2020_verbatim'],'2025',row['predecessors_2025_verbatim'])
