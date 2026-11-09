from pypdf import PdfReader
from pathlib import Path
import sys
sys.stdout.reconfigure(encoding='utf-8')
for n in (0,5,13):
 p=Path('work/sim-r7-priority/doc-'+str(n)+'.bin');r=PdfReader(p)
 print('DOC',n,'pages',len(r.pages))
 if n!=13:
  for i,page in enumerate(r.pages):Path('work/sim-r7-priority/doc-'+str(n)+'-page-'+str(i+1)+'.txt').write_text(page.extract_text(),encoding='utf-8')
 else:
  for i,page in enumerate(r.pages):
   t=page.extract_text()
   if any(x in t.lower() for x in ('tălmaciu','talmaciu','steag')):
    print('RELEVANT',i+1,t[:180].replace('\n',' '));Path('work/sim-r7-priority/sibiu-page-'+str(i+1)+'.txt').write_text(t,encoding='utf-8')
