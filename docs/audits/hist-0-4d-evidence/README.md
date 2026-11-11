# HIST-0.4d — control cartografic independent: verificare geometrică reproductibilă, admiterea istorică blocată

**Data:** 11 noiembrie 2026 · **bază:** `main@3e8209b90b230b7287af77bdd2c4f26608e77ebd` (HIST-0.4c, PR #95).  
**Verdict:** `INDEPENDENT_OHM_GEOMETRIC_RECHECK_PASS / ORIGINAL_MAPS_NOT_ACQUIRED / GEOREFERENCING_NOT_ADMITTED / P0_OPEN / ZERO_IMPORTS`.

Acest audit nu deduce un hotar dintr-o imagine analogică în lipsa unui lanț probatoriu complet. **Verificarea geometrică a datelor OHM nu este certificarea istorico-cartografică a hotarelor.**

## 1. Închiderea controlului matematic independent pentru cele trei P0

Au fost citite din arhiva locală *originală* HIST-0.4b fișierele gzip `rel-2747433.json.gz`, `rel-2747434.json.gz` și `rel-2747435.json.gz`, fără a le modifica. Noul script `recompute-p0.mjs` reunește segmentele prin capete, verifică inelele, calculează semnătura SHA256 a listei ordonate după ID a tuturor coordonatelor `way` și obține independent ariile cu **@turf/area 7.4.0 (model sferic)** și **geographiclib-geodesic 2.2.0 (elipsoid WGS84)**.

| Relație OHM | Segmente `way` | `way` cu `source` OHM¹ | Inele închise / neînchise | Arie sferică, km² | Arie elipsoidală, km² |
|---|---:|---:|---|---:|---:|
| [Transilvania 2747433](https://www.openhistoricalmap.org/relation/2747433) | 78 | 8 | 1 / 0 | 56.113,585956 | 56.256,631584 |
| [Chioar 2747435](https://www.openhistoricalmap.org/relation/2747435) | 15 | 0 | 1 / 0 | 1.028,958295 | 1.031,852271 |
| [Chioar 2747434](https://www.openhistoricalmap.org/relation/2747434) | 15 | 0 | 1 / 0 | 1.028,958295 | 1.031,852271 |

¹ Numărul de segmente cu tagul `source` provine din fișierul local `way-source-coverage.json` al HIST-0.4b, reconciliat acum cu numărul membrilor. Aria sferică reproduce valorile inițiale HIST-0.4b până la șase zecimale; discrepanța față de calculul elipsoidal este efectul **modelului geodezic**, nu dovada vreunei diferențe între variante istorice.

**Constatare nouă cu identitate demonstrată:** 2747434 și 2747435 au exact **aceleași 15 ID-uri `way` și aceleași liste de coordonate**, confirmate de SHA256 identic `09dfd7ee0136610914015df7aea7ab99bd669b7c0d199e00da44360390d035ae`. Ambele au 1.445 de vârfuri distincte și perimetru elipsoidal de aproximativ **265,47963 km**. Această egalitate a datelor OHM **nu** atestă menținerea neschimbată a districtului în 1650–1876 și nu umple lacuna 1851–1860.

Reproducere executată de două ori consecutiv, **SHA256 identic pentru output**: `052251fcc8b8043bba04904066cef749898a74a3e03424bc8b1b4305cd5d5bdf`. Script: `f6aa1f2f1b073d7c4bacd8236ae4b31429defd8d6aa8b06b472c714d18f8b790` (SHA256). Copiile publicate în acest director au fost confruntate cu fișierele locale prin SHA-256.

## 2. Controlul mapelor / drepturilor — fără contururi GIS inventate

| Izvor / suport | Ce s-a verificat efectiv | Ce lipsește pentru certificare |
|---|---|---|
| **OSZK TK 2274**, Mikoviny, *Mappa Districtus Kővár et C[omitatus] Kraszna* | Identificatorul arhivistic în Bendefy 1976; reproducerea planșei 12, pagina PDF 28, recuperată vizual în HIST-0.4c (SHA256 PDF `a1af589393436c6c2d1f9c169817a682f1f84b3b118c23f23b70cbacde2b2eb9`) | Scanarea integrală a **foii originale**, datarea exactă, confirmarea limitelor distincte Kővár vs Kraszna, GCP-uri independente, drepturi de publicare |
| **MNB XV/633**, Homann 1717 | Catalogul oficial Brukenthal 2017, pagina 45, `II/1` (SHA256 PDF `0e67aac712d44ab77f382f4aae250fc724b39fc5169cafe30a383a6c8837b7b7`); obiectul apare și în registrul secundar de patrimoniu | Scanarea integrală a **exemplarului muzeal**, identificarea stării gravurii și claritatea necesară unui control per-segment al relației 2747433 |
| **IGiPZ PAN B.1645[2]**, Homann, post-1715 | [Catalog bibliotecar](https://rcin.org.pl/dlibra/doccontent?id=84084), statut `Public Domain` pentru acel exemplar și drept de consultare în catalog | O scanare completă analizată și o **demonstrație a echivalenței** cu exemplarul Brukenthal, care nu poate fi presupusă din numele autorului |

**OSZK** oferă [serviciu de digitalizare la cerere](https://oszk.hu/masolatkeszites), cu aprobări, taxe posibile și condiții separate de publicare; nu a fost plasată **nicio comandă, cerere tarifată sau plată**. Licența liberă a unor hărți din [Földabrosz](https://oszk.hu/en/news/nszl-launch-new-digital-content-service-entitled-foldabrosz) nu se extinde implicit la manuscrisul `TK 2274`. Pentru muzeu: [catalogul oficial](https://www.brukenthalmuseum.ro/pdf/catalog%20secvente%20ro%20eng.pdf) este consultabil, dar asta nu acordă o licență automată de redistribuire a imaginilor. Facsimilele rămân locale și nu sunt publicate în `atlas`.

## 3. Poarta de georeferențiere și comparare cu OHM

Pentru **niciuna** dintre cele două foi originale nu există în acest audit un raster original adecvat, georeferențiat și cu proveniență verificată, cu puncte de control independente marcate pe hartă și confirmate geografic. Prin urmare:

- Puncte de control calificate: **0**; puncte de verificare independente: **0**; RMS / eroare reziduală: **NEDETERMINATĂ**, nu `0`.
- Segmente OHM comparate efectiv cu o linie de frontieră istorică autentificată: **0/78** pentru Transilvania, **0/15** pentru fiecare Chioar; **NEEXAMINAT**, nu `CONFORM`.
- Harta Mikoviny ilustrează **Kővár și Kraszna**, deci nu se poate interpreta conturul întregii planșe drept limita Kővár. Suprafața de circa **1.089 km²** relatată de Bendefy este aproximativă și nu înlocuiește nici valorile 1.028,958295 km² (sferic), nici 1.031,852271 km² (WGS84) fără definirea perioadei și metodei.
- Pentru Transilvania, contradicția `end_date=1732-12-31` / `end_event=Compromisul austro-ungar (1867)` rămâne nerezolvată. Harta datată 1717 nu poate corecta automat metadata OHM.

**Nu s-a făcut un warp/cartogram, nu s-au generat linii de frontieră estimate, suprapuneri sau diferențe de poligoane între foi cu epoci diferite**. A fabrica un RMS prin selectarea de puncte arbitrare ori a numi 0 segmente comparate „conforme” ar fi un fals probatoriu.

## 4. P1/P2, protecție și pragul următor

Registrul `qualification-gate-per-id-37.json` păstrează **toate 37 de ID-uri**, cu **P0=3, P1=25, P2=9**. Cele **34 P1/P2 nu au primit o nouă certificare cartografică** în această investigație și păstrează verdictul HIST-0.4c. Pentru toate: **0/37 frontiere istorice certificate și 0/37 importuri autorizate**. Nu se modifică OHM, OSMB, ACTUAL, arborele ISTORIC, modulele ori website-ul Atlas Teritorial.

**Pasul probatoriu rămas**: obținerea/consultarea autorizată a scanărilor integrale **OSZK TK 2274** și **MNB XV/633**, cu metadate și permisiuni verificabile; selecția de puncte de control geografic independente distribuite pe hartă, documentarea metodei și a reziduurilor/zonelor de distorsiune, identificarea explicită a limitei administrative istorice și confruntarea *per-way* cu OHM. Pentru Chioar 1860–1876 trebuie folosite și documentele juridice 1876/1877 și materialul de arhivă contemporan; o hartă din secolul XVIII nu validează automat o frontieră a secolului XIX.

Formularele de solicitare **neexpediate** sunt pregătite în `archival-inquiries-unsent.md`; fără costuri ori cereri de cumpărare.

## 5. Reproducerea locală

Sursele gzip originale ale HIST-0.4b nu sunt publicate în repository. În directorul acestui audit, într-un mediu de cercetare separat, se instalează **local, fără modificarea dependențelor website-ului**:
```sh
npm install --prefix docs/audits/hist-0-4d-evidence --no-save --no-package-lock geographiclib-geodesic@2.2.0 @turf/area@7.4.0
```
Se setează `HIST04D_BASE_DIR` către `Atlas-OHM-Inventory-2026-11-10`, unde există `hist-0-4b-evidence/original-relations/rel-<ID>.json.gz` și `hist-0-4b-evidence/way-source-coverage.json`. Se execută `node docs/audits/hist-0-4d-evidence/recompute-p0.mjs`. Scriptul nu scrie în input, ci doar în fișierul de ieșire din directorul său; valoarea SHA256 de comparat este cea de mai sus, pe Node 24.21.0 și versiunile pachetelor declarate.

Artefactele `independent-p0-geometric-control.json`, `recompute-p0.mjs`, `qualification-gate-per-id-37.json`, `cartographic-provenance-rights.json` și `archival-inquiries-unsent.md` separă rezultatele pozitive de restanțele juridico-cartografice. **HIST-0.4d închide controlul independent posibil în acest stadiu, nu certificarea frontierei.**
