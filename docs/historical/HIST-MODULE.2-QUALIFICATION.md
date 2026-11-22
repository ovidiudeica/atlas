# HIST-MODULE.2 — calificarea geometriei și arborele istoric exploratoriu

**Data:** 22 noiembrie 2026. **Stadiu:** PR draft; arbore-pilot necertificat. Dependențe PR #136 și PR #137.

## Origine și probatoriu

Sursă: ACDH-CH / Austrian Academy of Sciences, HistoGIS v9.0, licență CC BY 4.0. DOI: https://doi.org/10.5281/zenodo.4432081; licență: https://github.com/acdh-oeaw/histogis-data/blob/v9.0/LICENSE .

HistoGIS documentează proveniența straturilor „Austrian Empire Counties 1835” și „Austrian Empire Counties 1850”: https://histogis.acdh.oeaw.ac.at/shapes/source/detail/224 și https://histogis.acdh.oeaw.ac.at/shapes/source/detail/255 . Prima sursă folosește, între altele, Floder 1835, Meyer Siebenbürgen 1843 și alte hărți. A doua derivă și din prima. Prin urmare, nu sunt confirmări geometrice independente între ele. Nu am examinat individual toate actele administrative contemporane pentru fiecare unitate.

Datele din HistoGIS sunt considerate **atestări după sursă**, nu certificate juridice. Am calificat proveniența, validitatea topologică, cronologia declarată și compatibilitatea geometrică dintre perechile părinte–copil; nu am certificat o succesiune sau o subordonare juridică.

## Confruntarea geometrică reproductibilă

Toate cele 52 de relații candidate au fost reproiectate în **ETRS89 LAEA Europe (EPSG:3035)**. Pentru fiecare a fost calculat procentul ariei copilului rămas în afara poligonului părinte, independent de testul inițial în EPSG:4326. Poligoanele originale nu au fost reparate, dilatate, modificate, dizolvate sau înlocuite.

**Verdicte:** 44 relații coerente spațial la pragul de control de 0,1%, 6 necesitând reconciliere, 2 complet incompatibile. Pragul de 0,1% este un indicator de revizuire, nu un standard juridic.

| Copil (ID sursă) | Părinte propus (ID sursă) | Arie în afara părintelui, EPSG:3035 | Decizie |
| --- | --- | ---: | --- |
| Doboka (12324) | Innere Szolnok (12328) | 100,000% | Blocată |
| Mühlbach (12383) | Unterweißenburg (12406) | 100,000% | Blocată |
| Bistritz (12330) | Transilvania (9915) | 0,228619% | Reconciliere |
| Kövár (12391) | Transilvania (9915) | 3,004871% | Reconciliere |
| Zărand (12392) | Transilvania (9915) | 0,401048% | Reconciliere |
| Hunyad (12401) | Transilvania (9915) | 0,771978% | Reconciliere |
| Kraszna (12404) | Transilvania (9915) | 2,029978% | Reconciliere |
| Mittlere Szolnok (12405) | Transilvania (9915) | 5,892093% | Reconciliere |

Cei doi copii cu neconcordanță de 100% sunt incluși în geometria mai largă a Transilvaniei, dar acest lucru **nu autorizează substituirea automată a părintelui**. Relațiile 12324→12328 și 12383→12406 nu sunt admise ca muchii active; copiii sunt păstrați separat în secțiunea „Unități nelegate sau disputate”.

Celelalte șase pot fi consultate numai în preview ca legături candidate, împreună cu avertismentul de neconcordanță. Toate cele 44 de relații coerente geometric rămân **candidate documentare**: o potrivire spațială nu certifică subordonarea juridică.

## Fișiere de audit și reproducere

- scripts/historical/qualify_pilot_geometry.py — generator reproductibil din catalog și geometrii, fără modificarea acestora; necesită Python 3.10+, Shapely 2+ și pyproj.
- public/data/historical/v1/qualification.json — verdict pentru fiecare relație, proiecție, metodă, procente, sursă, note, explicit fără certificare juridică.
- docs/historical/qa/HIST-MODULE.2-relations-qa.csv — registru integral de 52 de relații, cu ID-urile sursei, nume, perioade, procent măsurat și verdict.
- src/data/historicalQualification.mjs și declarația TypeScript — validare fail-closed a registrului, a sursei, a clasificărilor și a integrității temporale.
- src/components/HistoricalPilot.tsx — arbore temporal exploratoriu și fișă istorico-administrativă bazată pe același sistem de secțiuni Entitate.
- tests/hist-module-2-qualification.test.mjs — integritatea celor 52 de verdicte, cronologia, contradicțiile și lipsa promovării nejustificate.

Reproducere:
python scripts/historical/qualify_pilot_geometry.py --catalog public/data/historical/v1/catalog.json --geometry public/data/historical/v1/geometry.geojson --out public/data/historical/v1/qualification.json --csv docs/historical/qa/HIST-MODULE.2-relations-qa.csv

Regenerarea JSON a fost confruntată SHA-256 cu registrul rezultat anterior: identitate bit-cu-bit.

## Interfață și utilizarea datelor

La deschiderea modulului Istoric sunt încărcate doar datele-pilot istorice, într-un namespace separat de ACTUAL. Implicit nu este desenată nicio geometrie istorică necertificată. Vizitatorul trebuie să activeze explicit „Explorează pilotul HistoGIS necertificat”; mesajul de avertizare rămâne vizibil.

Se poate alege un an de referință (1815–1918). Perioadele propriu-zise apar ca anX–anY, iar lunile/zilele sursei sunt păstrate intern pentru validare. Nu extindem unitățile din 1835 automat până în 1867, nici pe cele din 1850 peste reorganizări ulterioare.

Părinții/ copiii sunt navigabili în arborele-candidat. Cele două subordonări complet incompatibile sunt blocate; unitățile copil nu sunt eliminate. Selectarea unei versiuni istorice deschide panoul Entitate cu identificatorii, cronologia, geometria partajată, versiuni, relații candidate și sursele HistoGIS, fără steme/drapele inventate. Geometria se desenează pe sursa MapLibre „historical-pilot”, cu contur portocaliu întrerupt, independent de ACTUAL.

Resetul local Istoric ascunde numai preview-ul și selecția istorică. Resetul global păstrează comportamentul implicit România + Republica Moldova. RO/EN rămâne selectorul global.

## Limite și restanțe

- 0 hotare istorice certificate juridic; 0 relații părinte–copil certificate juridic.
- 0 identități cross-module HIST-ADMIN-BRIDGE admise; nu se deduce continuitate din suprapunere geometrică.
- 0 simboluri istorice promovate; drepturile și actele de aprobare se verifică separat.
- Geometriile altor perioade și surse OHM/ICR/Mosaic nu sunt interpolate sau substitute automat.
- Părinții lipsă nu sunt încă dizolvați din copii; această operație necesită dovezi de componență și perioadă.
- HistoGIS conține și strămoși, nu numai părinți direcți. Arborele-candidat nu substituie verificarea administrativă independentă.

CI și verificările Chromium desktop/mobil sunt gate-uri obligatorii înainte de integrarea protejată. Publicarea website-ului sau promovarea statutului juridic nu se deduc din testele unitare.

**Concluzie:** primul arbore funcțional în modul exploratoriu se bazează pe relațiile sursei, cu QA individual și necertificare vizibilă. Admiterea istorică definitivă rămâne o etapă separată.
