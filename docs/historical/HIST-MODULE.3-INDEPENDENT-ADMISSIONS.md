# HIST-MODULE.3 — admitere probatorie limitată și primele corespondențe ACTUAL ↔ Istoric

**Data:** 22 noiembrie 2026. **Statut:** implementare cu verificări separate: identități, apartenențe documentare, geometrii cartografice și legături între module.

## Verdictul corect: calificare punctuală, nu certificare integrală

Catalogul HistoGIS v9.0 din HIST-MODULE.1 rămâne identic, cu **53 de entități, 54 de versiuni, 53 de geometrii fizice și 52 de relații-sursă**. Nu extindem datele acestora la intervale neprobate. Toate geometriile istorice rămân `boundaryCertification=not_certified`; niciun părinte administrativ direct nu este promovat din HistoGIS, suprapunere ori dizolvare.

HIST-MODULE.3 adaugă numai fișierul independent `public/data/historical/v1/admissions.json`, validat separat de codul `historicalIndependentAdmissions`. Înregistrările `qualified` sunt **strict scurte**, în funcție de tip:

- **13 identități/tipuri istorice atestate pentru o dată** (1848, 1849, 1861 sau 1907). Atestarea unei zile/an nu validează întreaga perioadă HistoGIS.
- **6 înregistrări de identitate rămân `in_review`**, în special variante de transliterare ale scaunelor săsești și districtele bucovinene care necesită corespondent în originalele cartografice.
- **4 apartenențe teritoriale datate**, extrase din art. 1 al Constituției imperiale din 4 martie 1849 (Kövár, Zărand, Kraszna, Mittlere Szolnok — Transilvania). `kind=territorial_membership_not_direct_parentage` nu înseamnă subordonare administrativă directă și nu stabilește conturul.
- **5 intersecții geografice măsurate între poligoanele HistoGIS și poligoanele cartografice ACTUAL**; `kind=territorial_overlap`, fără succesiune administrativă, instituțională ori identitate juridică.

Actul din 1849 a fost abrogat în 1851; versiunea de referință HistoGIS 1815–1867 nu primește artificial o atestare integrală.

## Surse independente de HistoGIS

| ID | Document | Calificare | Limită |
|---|---|---|---|
| hist3:law:at-1849-03-04 | [Reichsverfassung 4 martie 1849, §1](https://www.verfassungen.at/at-18/verfassung49.htm) | Text normativ contemporan, listă explicită de coroane și unități | Niciun poligon legal; actul nu stabilește geometria |
| hist3:law:at-1861-20 | [Reichsgesetzblatt 20/1861, Landes-Ordnung für das Herzogthum Bukowina](https://www.reichsgesetzblatt.de/A/RGBl-A/1861/haupt.htm) | Bibliografie oficială a legislației și denumire/tip „Herzogthum” | Textul integral și eventualele modificări rămân pentru audit |
| hist3:map:bev-bukowina-1907 | [BEV: Nationalitätenkarte – Blatt Bukowina, 1907](https://www.bev.gv.at/Presse/Archiv/2025/Histo-KdM_Oktober_2025.html) | Hartă de epocă identificată într-o prezentare arhivistică a serviciului austriac | Nu este georeferențiată independent la nivel de hotar HistoGIS |
| hist3:paper:transylvania-1848-saxon-seats | [Journal of Maps, 2023: sașii transilvăneni în 1848](https://www.tandfonline.com/doi/full/10.1080/17445647.2023.2227214) | Cercetare istorică independentă pentru nume/existența unor scaune în 1848 | Harta digitală nu certifică pe sine contururile HistoGIS |
| hist3:actual:osmb-2026-10-05 | [Atlas ACTUAL · 2026-10-05](https://github.com/ovidiudeica/atlas/blob/main/public/data/phase4/catalog.json.gz) | Poligoane cartografice originale, versiune exactă și hash | Nu sunt hotare juridice certificate |

**Neconcordanța Bucovinei:** HistoGIS denumește `Herzogtum Bukowina`, dar folosește `sourceOriginalType: "Kingdom"` pentru 1849–1867. Constituția din 1849 și legislația din 1861 folosesc **Herzogthum / Ducat**. Nu modificăm câmpul original; afișăm separat tipul independent atestat la 28 februarie 1861. Totodată, HistoGIS începe versiunea la **5 martie 1849**, pe când Constituția este din **4 martie 1849**. Aceste date rămân separate într-o excepție explicită: nicio extindere automată înapoi cu o zi.

Scaunele săsești au reorganizări inclusiv după 1849; nu transferăm atestarea lor în 1848 asupra intervalului 1849–1860 fără confruntare administrativă.

## Corespondențe ACTUAL ↔ Istoric admise numai ca suprapunere sursă

Calcul în **ETRS89 LAEA Europe (EPSG:3035)**, Shapely; fiecare procent este raportat la aria poligonului său:

| Sursa istorică (ID HistoGIS) | ACTUAL (OSM ID Atlas) | % din poligonul istoric intersectat | % din poligonul ACTUAL intersectat | Intersecție km² |
|---|---|---:|---:|---:|
| Bucovina (9970) | Județul Suceava (osm-r2077868) | 50,14002 | 61,26594 | 5239,93967 |
| Districtul Suczawa (11756) | Județul Suceava (osm-r2077868) | 100,00000 | 6,13413 | 524,63848 |
| Districtul Suczawa (11756) | Municipiul Suceava (osm-r10495794) | 6,07179 | 65,76029 | 31,85495 |
| Districtul Radautz (11751) | Municipiul Rădăuți (osm-r10495792) | 1,72983 | 100,00000 | 32,46205 |
| Districtul Kimpolung (11383) | Municipiul Câmpulung Moldovenesc (osm-r10495796) | 5,33096 | 93,45305 | 128,67385 |

**Important:** pentru districtul de 524,64 km², 100% în județul Suceava actual nu înseamnă că este același județ, iar pentru municipiul Rădăuți 100% în districtul istoric nu implică identitate instituțională. O comparație între 1907 și 2026 este o **relație geometrică intertemporală**, nu o apartenență simultană sau o delimitare juridică.

Geometrii originale închise cu SHA-256:

- `public/data/historical/v1/geometry.geojson`: `3ff24bcc42bb9556f663e332a8a67ba9b7799ab094561daea11fcd7eac1f3fd2`
- `public/data/phase4/geometry/ro-adm-09-detailed.geojson.gz`: `07463d7f4dcb685cf7858b134f48f721cd388bb4a23e85f9e03d0355a555aba8`
- `public/data/phase4/catalog.json.gz`: `1f930079194c92dc0e02d6e675165dddec6f49db0a62357bcc61be0705125482`

Scriptul `scripts/historical/verify_independent_bridge.py` **recalculează** intersecțiile din octeții originali și respinge orice nepotrivire, fără reparare/editare sau substituire de geometrie. Rularea locală a returnat exact cele cinci intersecții.

## Interfața bilingvă

Panoul **Istoric** păstrează sursele și arborele candidat pentru 1815–1918, dar distinge vizual atestările punctuale independente prin text „Atestat independent (numai la data indicată)”. Fișa Entitate afișează într-o secțiune retractabilă temeiul probatoriu, tipul istoric și excepțiile, în continuare fără a certifica părinții direcți sau hotarele.

Pentru cele cinci măsurători, panoul entităților ACTUAL din județul/municipiile Suceava, Rădăuți și Câmpulung Moldovenesc prezintă o secțiune retractabilă „Corespondențe teritoriale istorice”. Butonul deschide versiunea istorică, iar fișa istorică oferă navigare inversă spre ACTUAL. Se afișează perioadele sursei și procentele ambelor poligoane, cu avertismentul explicit că suprapunerea **nu** implică aceeași administrație, hotar legal ori succesiune.

Toate etichetele folosesc comutatorul global RO/EN, fără selector separat.

## Următoarele dosare probatorii

1. Originalul integral și anexa cartografică a normei 1849, plus modificatorii din 1849–1854; pentru cele patru comitate/districte, verificarea subordonării efective și a excluderilor/includerilor după fiecare reformă.
2. Confruntarea hărților BEV 1907 și a studiului scaunelor săsești 1848 cu facsimile topografice originale, GCP independente și holdout, înainte de a admite vreun hotar.
3. Reconcilierea numelor scaunelor/transliterărilor, a perioadelor Bucovinei și a întregului repertoriu de 53 entități, fiecare cu versiunea sa.
4. Pentru `identical_boundary` ori `administrative_succession`, demonstrație **independentă** a identității instituționale, a normei juridice și a acordului geometric; în prezent nu există asemenea legături admise.
5. Abia apoi promovare individuală a geometriilor principale pe intervale precise și, eventual, dizolvări documentate ale poligoanelor pentru părinți lipsă.

**Verdict:** prima tranșă este admisă la nivel de fapt documentar punctual și măsurătoare cartografică reproductibilă, nu ca inventar istoric complet ori ca hotar legal. `public/data/phase4` și catalogul inițial HIST-MODULE.1 rămân nemodificate.
