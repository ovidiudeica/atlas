# HIST-0.4h — verificarea georeferențierii controlate și reconcilierea numelor Chioar (1873/1877)

**Data:** 11 noiembrie 2026 · **Baza:** `main@b7bf7836ac89ac244f1170e661b89553caf77dcd` · **Verdict:** `GEOREFERENCING_REJECTED_INDEPENDENT_GCPS_ABSENT / 1877_OCR_CROSSWALK_PARTIAL / ZERO_IMPORTS`.

## Ce s-a executat

### 1. Fotografii MNL 1861, harta cu delimitarea administrativă din 1859
Au fost folosite cele 14 fotografii originale digitale deja descărcate și validate prin SHA-256 în HIST-0.4g (MNL OL S 75 nr. 82) și rasterul istoric eHarta din 1862 (EPSG:31700). Nu am confundat anul **1859** al stării administrative reprezentate cu anul **1861** al reproducerii sau cu **1862** al sursei de referință.

Pentru fiecare fotografie, scriptul `scripts/exploratory-1861-to-1862-sift.py` a executat detecție SIFT, ratio test 0,72 și omografie RANSAC de cel mult 5 pixeli în *miniatura* de 1200 × 958 px a hărții 1862. Scriptul verifică explicit nu numai numărul de inliers și aria de dispersie pe sursă, ci și **diversitatea punctelor din imaginea de referință și aria învelișului lor convex**. Acest control previne omografiile degenerative.

**Rezultat corectat:** 0/14 fotografii au trecut poarta de înregistrare. La fotografia nr. **8**, prima evaluare raporta 41 inliers/51 potriviri și o eroare internă de 0,407 px, dar toate cele 41 coincid cu **un singur punct** al referinței (un singur descriptor țintă; înveliș convex referință cu aria 0). Omografia antrenată pe un subeșantion separat nu poate fi calculată. Aceasta este o **potrivire falsă**, nu un set de GCP-uri. Testul exploratoriu ulterior a respins-o. Nici celelalte 13 imagini nu au îndeplinit criteriile geometrice independente.

**Nu există** GCP-uri independente identificate manual pe localități/obiective stabile, omografie controlată cu puncte de verificare geografice și RMS în metri, registru al foilor reunite sau o linie `Landesgrenzen` digitizată verificabil. Nu s-a produs GeoTIFF 1861, nu s-a făcut un `warp` al originalelor, nu s-a creat un presupus poligon certificat. `0` puncte de verificare înseamnă **nedemonstrat**, nu eroare zero.

În `1861-folio-degeneracy-gate.json` sunt 14 verdicte individuale cu SHA-256 pentru imaginile sursă; `1861-photo8-provisional-reference-registration.json` nu este admis ca transformare (testul de omografie pe holdout devine degenerat), astfel niciun transform nu este aprobat în GIS. Referința 1862 poate avea o origine cartografică parțial comună cu 1861, deci nici o potrivire automată bună nu ar înlocui un control geodezic independent.

### 2. Repertorii administrative oficiale 1873 și 1877

Am descărcat **integral** edițiile din [colecția KSH Könyvtár](https://www.kshkonyvtar.hu/article/56/959/helysegnevtarak):

| Ediție originală | Pagini PDF | Octeți | SHA-256 |
|---|---:|---:|---|
| **1873**, înainte de reforma din 1876 | 1.004 | 162.329.617 | `25ce833a6f15fbac76cafbdb120649c944609bb59bc94d1bc5bc3425efc1590f` |
| **1877**, după reformă | 787 | 133.619.304 | `274ce1624c5779e75ae382d9acd525529f5424cd57da4650b6046e1c1a759d2d` |

Am verificat programatic pe pagini-eșantion: **ambele PDF-uri KSH au numai imagini raster, fără strat de text selectabil**. Nu s-a invocat o comparație textuală integrală acolo unde scanările nu o permit. Pentru triaj am obținut și versiunea publică digitalizată cu **OCR preexistent**, a repertoriului din 1877 (Google Books / The Burgenland Bunch), **794 pagini / 67.062.008 octeți**, SHA-256 `f3d32e0f4c6a37fc8d31a63bacc806c9ed36e11beb056c990fa7c6a5faa3d03a`.

Am localizat și **inspectat vizual paginile** 53–54 (Szatmár, inclusiv Nagy-Somkut) și 56–57 (Szolnok-Doboka, inclusiv Kis-Nyires și Monostor). În baza OCR-ului existent, cele **91 nume legale distincte** din 1877:I sunt inventariate per-nume cu următoarele rezultate **necertificate**:

| Stare de cercetare 1877 | Nume |
|---|---:|
| Șir normalizat detectat în secțiunea comitatului succesor | **58** |
| Variantă grafică OCR candidat cu scor fuzzy înalt | **14** |
| Neelucidat automat / necesită confruntarea planșei tipărite | **19** |
| **Total** | **91** |

Această clasificare **NU** înseamnă 58 de echivalări istorico-geografice autentificate: potrivirea este pe textul OCR al secțiunii de comitat, iar homonimia și erorile tipografice rămân posibile. Niciun nume nu este afirmat ca reconciliat 1:1 cu identitatea unei comune pre-1876, cu localitatea românească modernă sau cu un poligon juridic. Pentru **1873**, starea per-nume este `ORIGINAL_SCAN_ACQUIRED_NO_PAGE_ENTRY_VERIFIED` în toate cele 91 de rânduri.

Fișierul `chioar-91-legal-gazetteer-crosswalk.json` reține pentru fiecare nume: grafia din lege, comitatul de destinație (48 Szolnok-Doboka / 43 Szatmár), paginile OCR relevante din 1877, șirul candidat, scorul și statutul de neverificare pentru 1873. Variante precum `Poinicza/Pojnica`, `Resztolcz/Resztolcs` sau prefixul `Kis-` mutat în paranteză nu sunt soluționate automat prin similaritate.

### 3. Poarta pe fiecare entitate OHM

`individual-qualification-37.json` păstrează cele **37** relații și clasificarea **3 P0 / 25 P1 / 9 P2**, cu actualizări documentare individuale pentru `2829384`, `2878295`, `2747434` și `2747435`. Nicio informație din 1877 nu este extrapolată la hotarul Chioar din 1650–1851.

**Statut oficial HIST-0.4h:** 0/14 fotografii independent georeferențiate; 0/82 segmente ale frontierelor Transilvaniei 1851–1867 confirmate din linia `Landesgrenzen` 1861; 0/15 segmente Chioar confirmate prin limite comunale contemporane; **0/37 geometrii admise la import**.

Nu au fost modificate `src/`, `public/`, OHM/OSMB/ACTUAL, arborele ISTORIC, interfața sau GitHub Pages. Niciun PDF de sute de MB, fotografie MNL, ortofotoplan ori KMZ privat nu este publicat. Nu s-au efectuat plăți ori comenzi de arhivă.

### 4. Condiții pentru deschiderea validă a porții geometrice

Pentru 1861: indexul fotografii–foi, puncte de control stabilite independent pe localități sau elemente stabile ale terenului, transformări verificate cu puncte reținute și RMS în unități geografice, controale de identificare ale liniilor `Landesgrenzen` față de `Kreisgrenzen`; separarea 1859/1861/1862 și tratarea Partium.

Pentru Chioar: confruntarea manuală a paginilor originale 1873 și 1877, reconcilierea grafiilor cu identitatea istorică a fiecărei comune și, numai după aceea, obținerea hotarelor comunale din surse cadastrale/originale. Lista legală de 91 de localități nu este un poligon.

**Verdict:** `RESEARCH_SOURCE_ACQUISITION_SUCCESS / AUTOMATED_GEOREFERENCING_FAIL_CLOSED / LEGAL_NAME_CROSSWALK_PRELIMINARY / P0_OPEN / ZERO_IMPORTS`.
