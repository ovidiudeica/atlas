# SIM-R7 — reluare controlată

Baza este main a71291c4ca46ecab85d42a11e75bc42e95f44590. Nu se reconstruiesc SIM-R4–SIM-R6. Snapshoturile istorice și manifestele de integritate rămân autoritative.

## Reproducere fără rețea

Din rădăcina repository-ului, după npm ci:

```
node scripts/audit/sim-r7/11-generate-results.mjs
node scripts/audit/sim-r7/12-verify-reproducibility.mjs
npm test
npm run build
node scripts/ci/browser-smoke.mjs
```

Generatorul citește registrele SIM-R6 și dovezile SIM-R7 deja consemnate. Nu modifică o imagine în baza unei observații și nu suprascrie snapshoturile istorice. Gate-ul CI verifică determinismul a șapte artefacte. Antetul gzip folosește OS=255, independent de platformă; un antet Windows/Linux diferit a fost detectat și corectat fără schimbarea conținutului JSON. Testele validează separat cele4.283 identități,8.566 sloturi,44 drepturi,907 surse și18 regiuni exclusiv statistice.

## Reluarea investigației cu rețea publică

Comenzile00–10 sunt colectoare de cercetare, nu comenzi obligatorii de build. Reexecutarea lor după o schimbare a surselor cere revizuire editorială și un nou lot de dovezi. Nu ștergeți checkpointurile pentru a ascunde erori.

1. `00-baseline.mjs` inventariază snapshoturile, fără reconstruirea catalogului. Manifestul istoric include suplimentar copia semantică a rezultatelor SIM-R6 de la SHA de bază.
2. `01-wikidata.mjs` recuperează afirmațiile și sitelinkurile ID-urilor exacte; checkpointuri în `work/sim-r7-wikidata/`.
3. `02-recover-institutions.mjs` reia exclusiv cele907 cazuri SIM-R6; checkpointuri `work/sim-r7-access/`, câte un caz per fișier. Prioritizează simbolurile existente, drepturile și nivelurile superioare. Nu reia cele300 recuperări SIM-R5.
4. `03-priority-documents.mjs` și `04-rights-investigation.mjs` colectează documentele prioritare și cele44 reproduceri, cu metadate și pagini Commons. Un răspuns API cu eroare nu este o recuperare.
5. `05-lock-invalidations.mjs` extrage31 invalidări istorice și categoriile constatate în revizuirea vizuală SIM-R6. Nu introduce eliminări noi.
6. `06-image-metadata.py` citește EXIF/XMP/SVG folosind Pillow, fără a genera sau modifica imagini. Datele de încărcare, modificare și creare nu sunt interschimbabile.
7. `07-rights-verdicts.mjs` consemnează separat oficialitatea, fidelitatea și reutilizarea. Toate44 rămân neclarificate în acest lot; aceasta nu este o permisiune demonstrată și nici dovada unei interdicții.
8. `08-priority-verdicts.mjs` consemnează paginile efectiv inspectate ale documentelor recuperate. Cele două PDF-uri instituționale sunt păstrate cu hashuri. Proiectul de consultare nu este un act adoptat.
9. `09-review-institutional-recovery.mjs` verifică documentele, urmărește legăturile heraldice din arhive și aplică revizuirea manuală explicită. Cuvintele din meniuri/știri sau stema județului nu dovedesc recuperarea documentului comunei. Confirmarea manuală este legată de hashul exact Crizbav; orice versiune diferită cere revizuire nouă.
10. `10-wikipedia-followup.mjs` citește articolul preferat legat de fiecare ID exact și păstrează extrasele relevante, revizia și hashul răspunsului. Nu copiază articolele integral în repository și nu transformă infoboxul în dovadă juridică.
În completare, `13-priority-commons.mjs` recitește fișele Commons și ultimele5 versiuni disponibile pentru candidații excepțiilor prioritare. La Tălmaciu, descrierea înainte de1918 nu demonstrează readoptarea actuală.

11. `11-generate-results.mjs` produce registrele și raportul; `12-verify-reproducibility.mjs` verifică rezultatele byte-cu-byte.

`network.mjs` folosește numai HTTP(S) public, cache URL/SHA256 în `work/sim-r7-cache`,550ms minimum între cererile către aceeași gazdă, timeouturi, concurență limitată și oprire pe gazdă după401/403/429. Nu folosește autentificare, ocolirea protecțiilor sau servicii contra cost. Robots.txt este consultat înaintea urmăririi paginilor instituționale. Nu se declară un URL recuperat doar pentru că răspunde200.

## Selecție preventivă

`scripts/data/symbol-discovery-gate.mjs` este gate-ul exportului viitor. `collect-sim-r4-symbols.mjs` scrie exclusiv în `work/symbol-discovery/`; nu trebuie executat pentru a reproduce SIM-R7. O imagine nouă necesită identitate exactă, declarație teritorială explicită și aprobare editorială legată de hash. Omonimiile, jurisdicțiile, codurile și părinții sunt confruntați; reutilizarea unui simbol cere domeniul comun documentat pentru toți titularii. Semnalele slabe produc carantină. Imaginile existente se păstrează și invalidările anterioare nu pot reveni prin fallback.

## Limite explicite

Toate907 cazuri URL, asociate cu901 entități, au o primă trecere și articolul legat de identitate citit:901 articole distincte.47 cereri originale au fost omise după restricții ale gazdei; nu se pretinde explorarea exhaustivă a tuturor arhivelor, limbilor sau autorităților superioare. Doar articolul arhivat Crizbav este confirmat ca recuperare heraldică relevantă;844 cazuri rămân inaccesibile/blocate,20 redirecționate fără document relevant și42 fără document relevant găsit. Nu există o nouă anexă grafică normativă finală recuperată pentru excepțiile prioritare. Nicio imagine nu este adăugată, înlocuită ori eliminată în SIM-R7.

CI pe SHA exact și publicarea GitHub Pages sunt verificări ulterioare distincte. Raportul generat pre-integrare nu le presupune.
