# HIST-0.4e — diversificarea surselor și poartă de admitere individuală

**Audit:** 11 noiembrie 2026 · **bază:** `main@c202b3140c663a269dec40a0eb729986c730b9a8` (HIST-0.4d, PR #96) · **tip:** dovezi de cercetare, nu import cartografic.

**Verdict:** `DIVERSIFIED_SOURCE_DISCOVERY_PASS / INDIVIDUAL_ADMISSION_GATE_ESTABLISHED / HISTORICAL_BOUNDARY_CERTIFICATION_PENDING / ZERO_ADMISSIONS`.

## 1. Rezultatul real, fără a confunda hărți georeferențiate și hotare certificate

- **37/37** relații OHM păstrate pe ID-urile și intervalele HIST-0.4d, din **11 familii**; priorități neschimbate: **3 P0, 25 P1, 9 P2**.
- **12** surse sau colecții-candidat catalogate: șase intrări Arcanum (hărți/ridicări militare și cadastru), două repere eHarta/RoHGIS și patru fișiere tematice/derivate din Drive. Dintre acestea, unele sunt **piste bibliografice**, nu 12 surse primare independente confirmate.
- **19/37** relații au cel puțin o **pistă de comparație nouă**, de relevanță istorică sau geografică; **18/37** nu au fost asociate încă unei surse noi relevante. Acest număr **nu** reprezintă 19 geometrii probate.
- **0/37** frontiere certificate; **0/37** variante admise la import și **0** imagini private sau licențe neclarificate publicate.
- Metadatele de proveniență privată sunt publicate fără ID-uri/linkuri Drive sau fișiere KMZ/imagine și fără a atribui hărții un autor necunoscut.

## 2. Arcanum — rol probatoriu diferențiat

Colecțiile [First Military Survey](https://maps.arcanum.com/hu/map/firstsurvey-hungary), [Second Military Survey](https://maps.arcanum.com/hu/map/secondsurvey-hungary), [Third Military Survey 1:75.000](https://maps.arcanum.com/hu/map/thirdsurvey75000/) și [cadastrul habsburgic](https://maps.arcanum.com/hu/map/cadastral) oferă repere georeferențiate pentru toponimie, hidrografie, căi de comunicație, suprafețe și, când sunt expres vizibile, limite administrative ale epocii.

**Limită:** data unei foi și caracterul ei topografic nu confirmă automat jurisdicția reprezentată sau hotarul istoric atribuit de un poligon OHM. Nu a fost descărcat, extras automat ori republicat vreun tile Arcanum, nu s-a plătit un abonament și nu s-a verificat o licență de redistribuire pentru website.

## 3. Drive — verificare efectivă a geometriei Chioar, nu sursă primară independentă

S-a recuperat local un **KMZ privat** despre organizarea administrativă a Transilvaniei la începutul secolului al XIX-lea: 324.544 octeți, SHA-256 `7b5f799a41bd6e133bb2b61e187e86504d049a929512c90f606966aadeaf427b`. KML-ul conține **73 placemarks** și **două geometrii Chioar identice**, fiecare cu 518 coordonate inelare. **Nu conține o bibliografie pentru delimitare sau un an exact verificabil al hotarului.**

Am confruntat poligonul KML cu relația OHM **2747435** pe coordonatele originale din HIST-0.4b; OHM **2747434** are aceeași geometrie, conform auditului HIST-0.4d.

| Indicator WGS84 | KMZ Drive ↔ OHM Chioar |
|---|---:|
| Suprafață KMZ | 1.058,281971 km² |
| Suprafață OHM | 1.031,852271 km² |
| Intersecție | 1.009,671312 km² |
| Reuniune | 1.080,462833 km² |
| Doar OHM | 22,180846 km² |
| Doar KMZ | 48,610674 km² |
| Diferență simetrică | **70,791521 km²** |
| IoU (intersecție/reuniune) | **93,4480%** |

Rezultatul a fost obținut cu `polygon-clipping` și `geographiclib-geodesic`, nu estimat după o imagine. Comparația numerică este reproductibilă folosind `compare-chioar-kmz-to-ohm.mjs`, pe fișiere de intrare păstrate privat. **Nu certifică nicio frontieră, nu explică lacuna OHM 1851–1860 și nu dovedește independența istorică a desenului KMZ.** Scriptul și raportul public nu includ ID-ul privat Drive.

Un al doilea KMZ Drive cu **zone etnografice** a fost identificat, dar aparține conceptual modulului *Ethnographic Areas*, nu constituie dovada unui hotar administrativ istoric. Imaginea modernă despre sudul Basarabiei (1860/1864) și cea etnografică a ținutului Cernăuți (1774) sunt doar surse contextuale; drepturile lor de publicare și metodele reconstruirii limitelor nu au fost certificate.

## 4. eHarta — hartă administrativă istorică georeferențiată, realmente obținută

Pentru [*Karte des Grossfürstentums Siebenbürgen*, ediția a IV-a, Sibiu 1862](https://geo-spatial.org/vechi/download/karte-des-grossfuerstentums-siebenbuergen-harta-marelui-principat-al-transilvaniei) am descărcat **GeoTIFF-ul integral** de la [geo-spatial.org](https://www.geo-spatial.org/vechi/file_download/29356). Dimensiune **76.917.140 octeți**, SHA-256 `584c02b98939b0d4416babc0fc7fd50da2f8de042e877bc50e8fc1a8da8fe181`; raster **5.472 × 4.369 px**, proiecție **EPSG:31700**, pixel aproximativ **70,176478 m**. Am citit structura GeoTIFF, modelul de georeferențiere și o imagine redusă de inspecție din fișierul local.

**Candidat prioritar:** Transilvania **OHM 2829384 (1851–1867)**. Data 1862 este în interval, iar harta prezintă și delimitări administrative; totuși **nu a fost extrasă o frontieră vectorială autentică din această hartă și nici comparate individual cele 82 de ways OHM**. Poarta pentru admiterea sa rămâne închisă până la identificarea exactă a limitelor relevante din legendă și la compararea segment-cu-segment cu toleranțe datate. Accesul la descărcare nu reprezintă automat o permisiune de republicare a rasterului pe website.

## 5. Admiterea per-ID, fără blocaj colectiv

Pentru **fiecare** relație pot exista trei rezultate editoriale, numai în baza dovezilor sale individuale:

1. `CERTIFIED_EXACT` — identitate administrativă și interval istoric demonstrate; document original sau sursă cartografică explicită, datată; linie de hotar comparată per-`way`, abateri acceptate; proveniență și drepturi de utilizare clarificate; aprobare expresă pentru import.
2. `APPROXIMATE_DOCUMENTED` — contur aproximativ, cu sursă independentă și incertitudine explicită. **Nu** se echivalează cu frontieră certificată și nu se publică fără arhitectură/editorializare aprobată separat.
3. `RESEARCH_HOLD` — context, cronologie, surse sau limite insuficient documentate; niciun import. Acesta este statutul efectiv al **tuturor celor 37** la închiderea prezentei tranșe.

Deciziile sunt în `individual-admission-per-id-37.json`. Pentru cazurile urmărite prioritar, registrul folosește `NEXT_SEGMENT_LEVEL_REVIEW` pentru **2747434**, **2747435** (Chioar) și **2829384** (Transilvania). Niciun flag de admitere și nicio geometrie nouă nu au fost activate.

## 6. Reproductibilitate, protecție și continuare

`validate-evidence.mjs` executat independent pe un pachet descărcat din commitul candidat validează 37 de ID-uri distincte, 3/25/9 priorități, 12 surse, 19 relații cu piste, metricile Chioar, georeferențierea eHarta și **0 admiteri**: `PASS`. Comparația Chioar a fost reluată de două ori, identic, pe fișiere locale; fișierul JSON publicat este identic cu copia locală sanitizată (SHA-256 `a438d9693f454e9f90bf3df35593cfe7bf3f966321d74535bbad2fbcd62400b7`).

Urmează, în această ordine, verificarea sursei/autorului KMZ Chioar, controlul cartografic local față de harta din 1862 și de planurile din secolul XIX pentru Chioar, confruntarea pe **82 ways** a OHM 2829384 cu limitele administrative relevante din legenda GeoTIFF și continuarea individuală a celorlalte 34 de dosare unde există surse potrivite. Acțiunile sunt **permisive, nu automatizări de admitere**.

**Protecție:** zero intervenții în OHM/OSMB/ACTUAL, `src/`, `public/`, geometrii, arborele ISTORIC, UI, CI sau website. Nu au fost copiate pe GitHub materiale private Drive, rastere Arcanum ori GeoTIFF-ul integral. Nu s-au inițiat plăți sau comenzi. **0/37 geometrii admise** până la certificare.
