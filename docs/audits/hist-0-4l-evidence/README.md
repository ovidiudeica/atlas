# HIST-0.4l — lanț legislativ Chioar 1877 și condiții independente de georeferențiere

**12 noiembrie 2026.** Bază `main@d754210bcff5c54076f744d20566dd05603d4b79`. Registre de probe, **fără modificări** la interfață, ISTORIC, ACTUAL, OHM, OSMB, `src/`, `public/`, fără rastru original sau KMZ privat publicat.

## 1. Szt.-Kápolnok: proba legislativă, în etape

Am identificat **patru intrări** în *Hungaricana*, colecția documentelor parlamentare tipărite, care indexează grafia `Szt Kápolnok` — nu doar transcrierea juridică modernă:

| Etapă parlamentară | Document tipărit, pagină | URL arhivistic | Stare de acces |
|---|---|---|---|
| Proiect al Camerei Deputaților | *Képviselőházi irományok*, 1875, vol. XIV, nr. **503**, p. **4**, index vizualizator **13** | [proiect 503](https://library.hungaricana.hu/en/view/OGYK_KI-1875_14/?pg=13) | index OCR găsit, facsimil **neinspectat** |
| Lege tipărită la Camera Deputaților | același vol., nr. **529**, p. **150**, index **159** | [lege 529](https://library.hungaricana.hu/en/view/OGYK_KI-1875_14/?pg=159) | index OCR găsit, facsimil **neinspectat** |
| Document al Camerei Magnaților | *Főrendiházi irományok*, 1875, vol. IV, nr. **204**, p. **271**, index **282** | [nr. 204](https://library.hungaricana.hu/en/view/OGYK_FI-1875_04/?pg=282) | index OCR găsit, facsimil **neinspectat** |
| Document al Camerei Magnaților | același vol., nr. **231**, p. **364**, index **375** | [nr. 231](https://library.hungaricana.hu/en/view/OGYK_FI-1875_04/?pg=375) | index OCR găsit, facsimil **neinspectat** |

Acestea sunt **reprezentări interdependente ale aceluiași proces legislativ**, nu patru confirmări independente că `Szt.` ar însemna `Szurdok`. Accesul la imaginile vizualizatorului a returnat HTTP 403; indexul permite localizarea paginii, nu o autentificare paleografică directă. O reproducere web a [legii 1877:I §2(2c)](https://net.jogtar.hu/ezer-ev-torveny?docid=87700001.TV) păstrează explicit `Szt.-Kápolnok`. Astfel, ipoteza unei greșeli **exclusiv OCR modern** devine improbabilă, dar existența unei erori tipografice contemporane sau a unei rectificări ulterioare **nu a fost verificată**.

**Control separat al localității:** scanările KSH 1873 p.125 și 1877 p.50 au `Szurdok (Kápolnok-)`, respectiv `Kápolnok (Szurdok-)`. Un [compendiu juridic ulterior](https://mek.oszk.hu/13200/13288/13288.pdf), care citează ordinele ministeriale din **1885**, enumeră **Szurduk-Kápolnok (Kopalnik)** lângă localitățile fostului Chioar. [Repertoriul istoric Varga](https://www.kia.hu/kiakonyvtar/konyvtar/erdely/erdstat/hnevtar.pdf) confirmă continuitatea numelui pentru **Copalnic**. Acest ansamblu susține un candidat de identitate **toponimică**, nu corectează literal forma legii 1877 și nu certifică legal identitatea unei comune/circumscripții sau conturul ei.

**Decizie:** `Szt.-Kápolnok` rămâne forma exactă a legii, `Szurduk-Kápolnok/Copalnic` rămâne candidatul documentar foarte solid; **rectificare oficială găsită = 0**, **certificare juridică comunală = 0**, **geometrie = 0**.

## 2. MNL OL S75 nr. 82: audit integral de proveniență, nu de GCP

Am identificat local, la nivel de fișier, **toate cele 14 fotografii** originale MNL, cu hashuri SHA-256, dimensiuni, identificator de galerie și total de **444.622.163 octeți**. Detaliile sunt în `mnl-14-source-photo-inventory.json`. Relația dintre fiecare imagine fotografică și o **foaie cartografică independentă** rămâne neconfirmată: 14 fotografii nu implică 14 foi distincte. Fotografia nr. 8 a fost inspectată în detaliu la rezoluția sursă, nr. 9 pentru legendă și titlu; celelalte sunt documentate la nivelul planșei-contact, **nu se declară inspectate individual pixel-cu-pixel**.

Din HIST-0.4k au rămas cele două **simboluri** de pe fotografia 8, Reps/Rupea la (1034,6421) și Tartlau/Prejmer la (4481,9136), plus șase obiective fizice istorice distincte în surse actuale. Niciunul dintre aceste semne nu este până acum asociat fără ambiguitate cu **același** obiect geodezic modern. La Rupea semnul triunghiular poate reprezenta izvor mineral, nu cetate/biserică; niciun anumit izvor nu are un punct identificat independent. La Prejmer simbolul nu este demonstrat ca biserică fortificată.

## 3. Noi surse cartografice de control — Arcanum

Am identificat direct catalogul pentru [A doua ridicare militară, Transilvania](https://maps.arcanum.com/en/map/secondsurvey-transylvania/), [Prima ridicare militară, Transilvania](https://maps.arcanum.com/ro/map/firstsurvey-transylvania/) și [cadastrul habsburgic din secolul XIX](https://maps.arcanum.com/hu/map/cadastral). Toate sunt **surse potențiale de comparație**, nu contururi acceptate. Stratului din A doua ridicare militară i se atribuie data de cercetare a foilor locale, aproximativ **1860–1872**, iar [Timár et al., 2007](https://technicalgeography.org/pdf/1_2007/gt_1_2007.pdf) documentează lipsa unui suport geodezic originar uniform și necesitatea rectificării prin repere. Harta militară poate astfel fi independentă **istoric** de contururile OHM, fără să fie independentă **geodezic** de procesul de georeferențiere al platformei.

Accesul automat la vizualizator a returnat 403. Nu sunt înregistrate coordonate dintr-un strat Arcanum ca și cum rasterul ar fi fost efectiv accesat. Nu au fost descărcate, exportate ori republicate tile-uri, nici achiziționate abonamente.

Matricea `arcanum-gcp-independent-control-matrix.json` face triaj separat pentru **6 monumente** și **3 observații ale simbolurilor/hatch-urilor** (dintre care **2** au coordonate pixel exploratorii). Există **0 perechi punct–obiect univoc calificate** și, deci, **nu este definit un RMS nou**. RMS-ul de **1.241,12 m**, respectiv **1.574,97 m** din testul precedent rămâne un diagnostic al centrelor moderne, nu o evaluare a unui GCP stabil. Nicio fotogramă și nicio frontieră nu sunt certificate.

## 4. Integritate și publicare

În cursul verificării de început a HIST-0.4l s-a constatat că **build-ul și toate testele** pentru `main@d754210b` reușiseră, dar primul job GitHub Pages nu a putut recupera metadatele artefactului; din jurnal rezultă că acesta fusese deja încărcat cu SHA-256 `8f65e6402b2971f7197838a7f07462fa4b32fc03142d7a1c45f4f76a5ee440b0`. Inventarul API a confirmat artefactul `github-pages-43170163292-1`, apoi **reluarea exclusiv a jobului eșuat** a reușit. Nu s-a refăcut codul sau datele atlasului pentru acest incident.

**Verdict**: lanțul surselor pentru `Szt.` este mai bine localizat, dar nu rectificat oficial; 14 fotografii au amprente documentare verificabile; Arcanum a fost adăugat ca referință independentă potențială; **0/37 geometrii OHM**, **0/82 segmente Transilvania**, **0/15 segmente Chioar** admise. Fără plăți și fără modificări de frontieră.

## 5. Poarta următoare: HIST-0.4m

Examinarea directă a facsimilelor parlamentare (proiect nr. 503, lege nr. 529, Camera Magnaților nr. 204 și 231), apoi cercetarea *Rendeletek Tára* 1876 p.150+ și a ordinelor din 1885; separat, identificarea strictă a unui simbol de cetate/punct fizic unic în originalul MNL și o poziție verificabilă într-o sursă geodezică independentă. Odată obținute minimum patru puncte validate necoliniare și o verificare holdout în afara setului de ajustare, se poate testa transformarea unui sector; numai ulterior se redeschide analiza hotarelor.
