# HIST-0.4j — reconcilierea celor 18 + 10 grafii Chioar și identificarea reperelor fizice independente

**Data:** 12 noiembrie 2026 · **Bază:** `main@40ac6c1c71211adfdd6d429f35746a05346b9b43` (HIST-0.4i) · **Verdict:** `28_CASE_SCREENS / 21_DISTINCT_NAMES / 18_1877_PRINT_VARIANTS_LOCATED / 1873_ONE_LEGAL_ABBREVIATION_UNRESOLVED / SIX_PHYSICAL_SITE_CANDIDATES / ZERO_BOUNDARY_IMPORTS`.

## 1. Confruntarea primară, fără OCR ca autoritate

Sunt investigate exact **18** nume care nu trecuseră poarta de șir exact normalizat în 1877 și **10** nume care nu aveau potrivire directă în transcrierea 1873, cu **7** nume comune și **21** unice. Surse: scanuri originale KSH [1873 și 1877](https://web.kshkonyvtar.hu/article/56/959/helysegnevtarak) și [textul legal al 1877:I §2](https://net.jogtar.hu/ezer-ev-torveny?docid=87700001.TV). Hashurile PDF și pagina fiecărui nume sunt în `chioar-21-individual-lexical-and-identity-gate.json`. Nu s-a folosit un număr de pagină OCR ca și cum ar fi pagina oficială. În 1873 sunt relevante paginile **124–125** (imaginile KSH 114–115), iar în 1877 paginile **47–48** (imagini 45–46) și **50–51** (imagini 48–49).

### Cele 18 nume, față de pagina 1877
| Numele legii 1877:I | Lectura din repertoriul oficial 1877 | Observație |
|---|---|---|
| Poinicza | Pojnica | variație `oi/oj`, `-icza/-ica` |
| Toplicza | Toplica | simplificare `cz/c` |
| Resztolcz | Resztolcs | `cz/cs` |
| Szelnicze | Szelnice | `cz/c` |
| Russor | Rusor | consonantă dublă |
| Fonácz | Fonác | terminatie |
| Laczkonya | Lackonya | `cz/c` |
| Berencze | Berence | `cz/c` |
| Garbonácz | Garbonác | `cz/c` |
| Plopis | Ploppis | dublarea lui `p` |
| Karullya | Károlya | **diferență semnificativă**, nu automat același sat |
| Stezser | Sztezser | `st/szt` |
| Somkutpatak | Somkutpataka | sufix `-a` |
| N.-Nyires | Nyires (Nagy-) | restructurare calificativ |
| N.-Somkut | Somkut (Nagy-) | restructurare calificativ |
| N.-Fentős | Fentős (Nagy-) | distinct de Kis- și Puszta-Fentős |
| P.-Fentős | Fentős (Puszta-) | distinct de Kis- și Nagy-Fentős |
| Szappanpataka | Szappanpatak | sufix `-a` lipsă |

Toate **18 variante** sunt localizate textual pe paginile oficiale. Acest rezultat îndreaptă parțial statutul vechi `NOT_MATCHED_BY_NORMALIZED_TEXT`, dar nu certifică automat identitatea istorică a comunei sau hotarul ei. Pentru `Karullya/Károlya`, diferența cere dovadă toponimică suplimentară.

### Cele 10 excepții față de 1873
| Nume în legea 1877:I | Sursă 1873 | Verdict |
|---|---|---|
| Dióspatak | Dióspataka | variantă grafică localizată |
| Resztolcz | Resztolcs | variantă grafică localizată |
| Szelnicze | Szelnice | variantă grafică localizată |
| **Szt.-Kápolnok** | niciun `Szt.-` confirmat; `Szurdok (Kápolnok-)` doar posibil context | **abreviere juridică nerezolvată** |
| Laczkonya | Lackonya | variantă grafică localizată |
| Plopis | Ploppis | variantă grafică localizată |
| Karullya | Karully / Karuly (lectură istorică de revizitat) | candidat contextual, nu identitate legală aprobată |
| Stezser | Sztezser | variantă grafică localizată |
| Somkutpatak | Somkutpataka | variantă grafică localizată |
| **Koltó-Katalin** | **Katalinfalva** și **Koltó** apar ca două intrări distincte | **nu se contopesc**. Vechiul Katalinfalva se corelează documentar cu Cătălina/Koltó-Katalin; păstrăm separarea față de Coltău/Koltó |

Pentru Koltó-Katalin, controlul suplimentar independent este [Dorin Ștef, *Dicționar etimologic* (2023), p. 156](https://bjmures.ro/wp-content/uploads/2023/05/S00122.pdf), [studiul despre Coltău și Cătălina, *Bibliotheca Septentrionalis* (2012)](https://www.bibliotecamm.ro/septentrionalis/revista_bs_38%282012%29.pdf) și [repertoriul istoric transilvănean](https://www.kia.hu/kiakonyvtar/konyvtar/erdely/erdstat/hnevtar.pdf). Concluzia este **asociere toponimică puternic susținută**, nu demonstrarea unei fuziuni juridice sau a identității vreunui poligon comunal. `Szt.` nu poate fi extins arbitrar la `Szurdok` doar pentru că formele sunt apropiate.

## 2. Repere geografice *fizice* în locul centrelor administrative

Am inspectat contact sheet-ul celor 14 fotografii, fără a-l confunda cu un index demonstrat al celor 24 foi originale. Pe **fotografia 8**, unde există deja studiul pilot de 8 toponime și reziduuri >1 km, am identificat **șase repere fizice cercetabile**, din surse independente ale limitelor OHM:

| Candidat fizic | Legătură cu harta | Sursă de identificare |
|---|---|---|
| **Biserica fortificată Prejmer** | `Tartlau`, vizibil pe decupaj | [RAN 41676.12](https://ran.cimec.ro/sel.asp?descript=prejmer-prejmer-brasov-ansamblul-bisericii-evanghelice-fortificate-de-la-prejmer-cod-sit-ran-41676.12), OSM way 266834556 |
| **Biserica fortificată Hărman** | `Honigberg`, vizibil | [RAN 41097.10](https://ran.cimec.ro/sel.asp?descript=harman-harman-brasov-cetatea-sateasca-si-biserica-evanghelica-fortificata-de-la-harman.-cod-sit-ran-41097.10); coordonate publicate discordante, ținute în carantină |
| **Biserica fortificată Codlea** | `Zeiden`, vizibil | [RAN 40250.09](https://ran.cimec.ro/sel.asp?descript=codlea-municipiul-codlea-brasov-ansamblul-bisericii-evanghelice-fortificate-de-la-codlea-cod-sit-ran-40250.09) |
| **Cetatea Rupea** | `Reps` vizibil, cetatea separată fizic de localitate | [RAN 40401.09](https://ran.cimec.ro/sel.asp?codran=40401.09) |
| **Biserica evanghelică fortificată Rupea** | `Reps` vizibil | OSM way 973910596, deosebită de cetatea de pe deal |
| **Biserica Neagră Brașov** | `Kronstadt` vizibil; conglomerat urban | OSM way 866090450 și [referință cartografică](https://mapcarta.com/26950134) |

Am recuperat **cinci poziții moderne la nivel de monument**, nu de centru administrativ; pentru Hărman există raportări publice cu discrepanțe semnificative și nu se promovează coordonata până la reconcilierea exactă a clădirii. Pentru **niciunul dintre cele șase** nu este încă identificat riguros un simbol/centru de obiect univoc în pixelii originalului MNL. Niciuna dintre cele 14 fotografii nu este, prin urmare, calificată drept independent georeferențiată.

Faptul că o construcție medievală exista înainte de 1859 **nu demonstrează** că simbolul punctiform al așezării de pe harta din 1861 indică exact aceeași construcție; cu atât mai puțin un hotar. Coordonatele moderne rămân index de **candidat**, nu `GCP` validat. Nu a fost produs un GeoTIFF certificat.

## 3. Poarta de admisie per dosar

| Tip de probă | Admitere după HIST-0.4j |
|---|---|
| Identitate de șir în repertoriul anului specific | **18/18 1877 variante localizate**; **9/10 1873 asocieri documentate** (incluzând cazul distinct Koltó–Katalinfalva) |
| Identitate a localității în sens juridic complet | **0 certificate**; un studiu de caz Cătălina cu dovezi convergente |
| Identitate modernă sau ID OSM actual | **0 atribuite** |
| Contur comunal legal al anilor 1873–1877 | **0 certificate** |
| Punct de control al fotografiei 1861, în coordonate/facsimil | **0 admise** |
| Segmente de frontieră `Landesgrenzen` sau Chioar | **0 admise** |
| Relații OHM importate în ISTORIC | **0 din 37** |

**Verdict:** `DOCUMENTARY_LEXEMES_SCREENED_PER_ID / STRONG_KOLTOKATALIN_CATALINA_ALIAS_EVIDENCE / LEGAL_ABBREVIATION_OPEN / PHYSICAL_SITES_FOUND_GCP_NOT_VERIFIED / NO_IMPORTS`.

Nu au fost modificate fișierele aplicației sau datele OSMB/OHM/ACTUAL, nu au fost publicate surse originale raster, KMZ-uri private ori materiale fără licență demonstrată și nu au fost făcute plăți sau comenzi.

## 4. Pasul următor permis

`HIST-0.4k`: confruntarea abrevierii `Szt.-Kápolnok` cu originalul legii sau acte de punere în executare și a variantei `Karullya/Károlya` cu repertorii suplimentare; separat, digitizarea în **coordonate pixel** a unor simboluri de monument clar individualizate pe fotografii și verificarea pe puncte independente, cu erori exprimate în metri și raportate la scara hărții. Abia după aceea se poate începe încercarea controlată de trasare a `Landesgrenzen` sau compararea hotarelor comunale din surse cadastrale istorice.
