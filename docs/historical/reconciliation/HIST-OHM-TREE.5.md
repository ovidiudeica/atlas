# HIST-OHM-TREE.5 — reconciliere geometrică OHM ↔ RoHGIS (1930)

**Stare: audit sursă–sursă încheiat; nicio promovare de geometrie comună admisă.**

## Date verificate

Bază: `public/data/historical/v1/geodata/index.json` (139 versiuni OHM, 125 identificatori de geometrie) și `public/data/historical/v1/rohgis/catalog-1930.json` (565 versiuni: 71 județe + 494 plăși, toate numai în eșantionul 1930).

Auditul geometriei a parcurs **toate cele 139 × 565 = 78.535 de perechi de versiuni** pentru **egalitatea topologică exactă**. Mai întâi au fost comparate limitele bounding-box (rotunjire la 8 zecimale doar pentru prefiltrare), apoi egalitatea geometrică propriu-zisă pentru orice candidat. Sunt **zero bounding-boxuri candidate** și, în consecință, **zero contururi topologic identice**. Reutilizare OHM↔RoHGIS `geometryId`: **zero**. Identitățile și geometria fiecărei surse sunt păstrate integral.

La nivel județean există **19** entități OHM candidate de tip județ istoric; **16** au un corespondent RoHGIS 1930 cu același nume după normalizarea diacriticelor. Celelalte trei — Jugastru, Tulcin și Moghilău — aparțin perioadei ocupației din 1941–1944 și nu au corespondent direct pentru 1930. Din cele 16 perechi, trei au perioade OHM declarate care cuprind 1930 (Arad, Maramureș, Timiș-Torontal), dar acest fapt **nu certifică identitatea hotarului**. Pentru celelalte 13, sfârșitul perioadei OHM este necunoscut; nu este permisă extrapolarea automată în 1930. **55** județe RoHGIS nu au corespondent OHM județean omonim; toate **494 plăși** nu au un nivel omolog OHM în acest set, prin urmare sunt conservate drept surse independente.

## Măsurători geometrice individuale

Fișierul [HIST-OHM-TREE.5-16-COUNTY-PAIRS.csv](./HIST-OHM-TREE.5-16-COUNTY-PAIRS.csv) conține fiecare dintre cele 16 perechi: identificatori originali, intersecție/uniune (IoU), diferență simetrică în km², distanță Hausdorff a conturului în km, avertisment temporal și verdict de nereutilizare. Operațiile `intersection`, `union`, `difference` și `boundary.hausdorff_distance` au fost efectuate cu Shapely/PROJ, după proiectarea ambelor surse în **EPSG:3844**. Poligoanele-sursă au rămas în EPSG:4326.

Exemple relevante:
- **Maramureș**: IoU 0,989597; diferență 35,835 km² — apropiere mare, dar contur **neidentic**.
- **Arad**: IoU 0,978815; diferență 134,565 km² — contur **neidentic**.
- **Neamț**: IoU 0,789814; diferență 1.007,356 km² — discrepanță teritorială majoră.
- **Suceava**: OHM Suceava ↔ RoHGIS Suceava are IoU **0,000575** (aprox. 0,06%). Este o **omonimie geografică înșelătoare**, nu un match teritorial. OHM Suceava ↔ RoHGIS Baia are IoU 0,612240, însă această suprapunere este numai o sugestie de investigare, **nu identitate administrativă demonstrată**.

## Calificări și limite

- `SAME_NAME_SPATIAL_OVERLAP_NOT_GEOMETRY_IDENTITY`: 15 perechi; `SAME_NAME_GEOGRAPHIC_CONFLICT`: Suceava.
- Datele de nume și suprapunerile nu dovedesc continuitatea juridică a instituțiilor și nici identitatea graniței. Diferențele geometrice pot reflecta generalizarea sau metodologia de digitizare, nu obligatoriu o modificare administrativă.
- Nu se modifică `ACTUAL`, indecșii OHM/RoHGIS, cele 565 de geometrii RoHGIS, cele 139 OHM sau cardurile publicate; nu există promovări în catalogul canonic.
- Pentru variantele de plăși din colecția RoHGIS 1929–1933 nu se afirmă existența simultană a 494 unități la o anumită zi a lui 1930: este un **eșantion-sursă** convențional.

## Reproducere și control

`tests/hist-ohm-tree5-reconciliation.test.mjs` verifică întregul inventar, relațiile, categoriile de dispoziție individuală și absența coliziunilor exacte de bounding-box pentru toate cele 78.535 de perechi. Registrul geometric integral cu măsurători și un GeoPackage comparativ în cinci layere sunt disponibile în pachetul arhivat **HIST-OHM-TREE.5-OHM-ROHGIS-1930.zip** (artefactul extern de audit), împreună cu scriptul Shapely de reproducere și registrele individuale pentru toate cele 704 versiuni. Testul JavaScript nu înlocuiește măsurătorile GIS; furnizează un control independent al invariabilelor.

**Etapa următoare permisă**: anchetă documentară individuală pentru perechi cu contururi apropiate (Maramureș, Timiș-Torontal, Arad), verificarea modificărilor administrative și a metodei de digitizare, apoi rezolvarea separată a Neamț și a omonimiei Suceava/Baia. Reutilizarea unei geometrii este permisă numai după o calificare explicită, nu dintr-un prag arbitrar de IoU.
