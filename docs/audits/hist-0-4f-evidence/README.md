# HIST-0.4f — confruntare cartografică țintită per-segment

**Data:** 11 noiembrie 2026 · **bază:** `main@d6d6be71737976cd2329fc5626140646654ad36e` (HIST-0.4e, PR #97).  
**Verdict:** `PER_WAY_SCREENING_REPRODUCED / TEMPORAL_ARC_LOCALIZED / NO_AUTHENTICATED_FULL_BORDER_TRACE / NO_ADMISSIONS`.

## 1. Semnificația verificării

HIST-0.4f a executat efectiv **(a)** proiectarea și inventarierea per-`way` a limitei OHM Transilvania 1851–1867 pe GeoTIFF 1862, **(b)** izolarea diferenței dintre cele două variante istorice vecine, **(c)** verificarea vizuală limitată la arcul diferit și **(d)** măsurarea distanțelor linie–linie pe fiecare dintre cele 15 `way` Chioar, în ambele sensuri.

**Nu** a fost trasată și validată independent toată frontiera de tip *Landes* din harta din 1862, nu s-a demonstrat originea istorică a KMZ-ului privat și nu s-au obținut izvoarele juridice individuale ale limitelor. **82 segmente acoperite în raster ≠ 82 segmente conforme unei frontiere istorice**.

## 2. Transilvania: relația 2829384, 1851–1867

- **82/82 `way`** OHM proiectate în EPSG:31700; toate geometriile lor intră integral în rasterul istoric al ediției 1862, **5.472 × 4.369 px**, ~**70,176478 m/pixel**; lungime cumulată proiectată **1.627,921 km**.
- **8/82 `way`** cu `source` în inventarul OHM HIST-0.4b; doar existența tagului, nu validitatea izvorului, este confirmată.
- Legenda tipărită distinge **Landes**, **Kreis**, **Bezirk** și **Comitats**. Numai segmentul de categorie și epocă corespunzătoare se poate interpreta drept hotar al provinciei. Harta și [analiza geo-spatial.org](https://geo-spatial.org/vechi/download/karte-des-grossfuerstentums-siebenbuergen-harta-marelui-principat-al-transilvaniei) au fost inspectate, dar **0/82** segmente nu au primit certificare de coincidență cu linia de hotar tipărită.
- Recalcularea comparativă cu OHM **2878295 (1765–1851)** identifică **81 `way` comune cu coordonate identice**, plus un arc diferit: actualul **200503147** față de **200503149, 200503150, 200503151** (varianta anterioară). Diferența simetrică proiectată între poligoane: **93,719812 km²**; IoU proiectat **0,998494**.
- Controlul se concentrează în nord-vest, aproximativ **22,64–22,81° E / 47,38–47,50° N**. Au fost plasate pe originalul raster **șase puncte vizuale preliminare**, în apropierea unei linii negre groase de tip *Landes*, fără a le considera GCP-uri geodezice. **4/6** sunt mai apropiate de noul arc, **2/6** de cel vechi; mediane ~**912 m** față de ~**1.379 m**. Selecția **nu a fost oarbă** față de variante; lățimea simbolurilor, geometria sursei și reziduurile georeferențierii nu sunt cuantificate. Acestea sunt indicii **necertificate**, nu un test independent de exactitate.
- Harta din 1862 intră cronologic în intervalul 1851–1867, dar anul hărții nu dovedește singur că toate cele 82 de componente au aceeași valabilitate legală.

**Noi surse prioritare pentru auditul de frontieră:** inventarul [Hadtörténeti Intézet és Múzeum](https://militaria.hu/hadtorteneti-intezet-es-muzeum/terkeptar) identifică harta administrativă a Principatului Transilvaniei din **1861**, pe baza ridicării din 1859, **24 foi la scara 1:144.000, cotă B IX a 719**. [Catalogul arhivistic austriac](https://www.archivinformationssystem.at/archivplansuche.aspx?ID=6201811) enumeră și o hartă administrativă datată 1 februarie 1861. **Nu** s-a demonstrat identitatea exemplarelor și nici nu s-au obținut planșele originale. Cercetarea contemporană pentru ținuturile săsești indică hărțile [Lipszky 1806 și Mersich 1859](https://www.tandfonline.com/doi/full/10.1080/17445647.2023.2227214), dar nu poate ține loc de contur al întregii provincii.

## 3. Chioar: relațiile 2747434 și 2747435

OHM a păstrat **aceleași 15 ID-uri `way` și aceleași coordonate** în ambele intervale 1650–1851 și 1860–1876 (HIST-0.4d). Un KMZ privat din Drive (fără proveniență cartografică explicită și fără o dată a hotarului verificată) reprezintă două copii identice ale unui alt contur Chioar.

Au fost eșantionate distanțele dintre liniile cele două surse, la pași de cel mult **150 m** în EPSG:31700:

| Indicator | OHM → KMZ | KMZ → OHM |
|---|---:|---:|
| Eșantioane | 2.500 | 1.827 |
| Mediana | 237,40 m | 219,09 m |
| P95 | 772,97 m | 799,34 m |
| Distanța maximă | 1.342,12 m | 1.719,47 m |
| Eșantioane ≤500 m | 83,32% | 82,54% |
| Eșantioane ≤1.000 m | 98,84% | 98,19% |

Toate cele **15/15** segmente au rezultate individuale `p50/p90/p95/p99` în `chioar-per-way-distance.json`. Prioritare pentru verificare: **199616885**, **202362132**, **202362135**, cu P95 peste 1.000 m. Aceste abateri reprezintă **diferențe între două seturi geometrice**, nu demonstrarea unei erori OHM.

**Noi piste probatorii pentru 1860–1876:** [Magyar Nemzeti Levéltár](https://mnl.gov.hu/mnl/szszbml/hirek/kutass_online_5_szatmar_varmegye?theme=mnlvakbarat) inventariază **fondul 954, Kővár Vidék 1861–1876**, alături de fonduri ale administrației districtului (1001–1004, 1051–1055). [Lucrarea lui Borovszky](https://www.mek.oszk.hu/09500/09536/html/0020/19.html) menționează legea **1876: XXXIII** și trecerea a **43 de comune** în județul Szatmár. Acest comentariu este **sursă secundară**, iar textul legal și lista completă a comunităților/limitelor nu au fost confruntate încă. Fondurile nu certifică retrospectiv limita 1650–1851.

## 4. Decizia individuală și protecția

`individual-qualification-37.json` păstrează **37/37 ID-uri** și **P0=3 / P1=25 / P2=9**. Actualizează numai patru fișe: Transilvania `2829384`, comparatoarea `2878295` și Chioar `2747434` / `2747435`. Celelalte **33** rămân reportate din HIST-0.4e, fără reclasificare. Rezultatul oficial: **0/37 geometrii certificate**, **0/37 admiteri**, **3 P0 deschise**.

Nu se modifică geometria originală OHM, ACTUAL, OSMB, codul, interfața, arborii, workflow-urile sau website-ul. Nu se publică rasterul, PDF-uri, imagini diagnostice, KMZ-ul privat, tile-uri Arcanum ori reproduceri cu drepturi neclarificate. Nu se fac comenzi și nu se plătește nimic.

## 5. Reproductibilitate

Arhiva locală HIST-0.4b și fișierele recuperate pentru HIST-0.4e permit rerularea celor cinci scripturi `scripts/hist04f-*.mjs` pe **Node 24.21.0**. Dependențe locale de cercetare, fără a modifica dependențele website-ului: `proj4@2.15.0`, `geotiff@2.1.3`, `sharp@0.34.4`, `adm-zip@0.5.16`, `fast-xml-parser@5.2.5`, `polygon-clipping@0.15.7`. Se menține structura `hist-0-4b-evidence/original-relations` și `hist-0-4e-drive-evidence` din arhiva autorizată. Scripturile folosesc variabila opțională `HIST_ROOT` pentru calea rădăcină.

Ordinea: `hist04f-stage1.mjs`, `hist04f-transylvania-temporal.mjs`, `hist04f-distance-chioar.mjs`, `hist04f-map-checkpoints.mjs`, `hist04f-build-screen.mjs`. **Toate cele cinci artefacte JSON locale au trecut testul A/B de execuție consecutivă cu hashuri identice.** `validate-evidence.mjs` a fost rulat ulterior pe **7 fișiere deja recuperate din GitHub**, cu rezultat `PASS` (82/82, 81 way comune, 15/15 Chioar, 37 ID-uri, zero admiteri).

Originalele digitale rămân în arhiva de cercetare; raportul își declară explicit dependența de ele și **nu poate fi reprodus din repository singur** fără aceleași intrări cu amprentele consemnate. Toate fișierele documentare publicate sunt inventariate în `manifest.json`.

## Următoarea poartă efectivă

**HIST-0.4g — reconstituire independentă a liniei *Landes* pentru Transilvania**: accesarea hărții administrative 1861 în 24 de foi și confruntarea efectivă, pe `way`, cu ediția 1862 și cu OHM; examinarea reziduurilor georeferențierii. În paralel, identificarea localităților și hotarelor districtului Kővár din fondurile 954/1001–1055 și din actul 1876: XXXIII, fără plăți. Admiterea rămâne **strict individuală**, numai dacă identitatea, intervalul, frontiera și drepturile sunt demonstrate pentru cazul respectiv.
