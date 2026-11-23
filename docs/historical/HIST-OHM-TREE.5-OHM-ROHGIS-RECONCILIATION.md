# HIST-OHM-TREE.5 — reconcilierea individuală OHM–RoHGIS (1930)

## Verdictul tehnic

**Auditul comparativ este executat, însă identitățile instituționale și hotarele istorice nu sunt certificate prin acest audit.** Cele două surse rămân separate. **Zero `geometryId` comune noi** și zero rescrieri ale geometriilor. Reutilizarea este respinsă pentru toate perechile auditate în snapshotul curent.

Artefact auditabil: `public/data/historical/v1/reconciliation/ohm-rohgis-1930.json`; reproducere geometrică: `python scripts/historical/reconcile_ohm_rohgis_1930.py` (Shapely, pyproj). Baze: `public/data/historical/v1/geodata/index.json` și `public/data/historical/v1/rohgis/catalog-1930.json`. Datele primare RoHGIS sunt reprezentate în 1930 exclusiv; OHM păstrează perioadele sale proprii.

## Inventarul și metoda

- **139 versiuni OHM**, cu 125 ID-uri geometrice interne (14 aliasuri deja documentate), față de **565 versiuni RoHGIS**, toate cu ID geometric propriu: 71 județe și 494 plăși.
- **78.535 comparații** de versiuni geometrice, inclusiv comitate și plăși. Condiția necesară de identitate topologică — egalitatea min/max X/Y în EPSG:4326 — a fost evaluată pentru toate perechile. Filtrul de bounding box rotunjit la opt zecimale nu a produs nicio pereche; implicit, nicio pereche nu poate trece egalitatea topologică exactă. Filtrul nu este folosit niciodată pentru *admiterea* unei egalități.
- **16 perechi** OHM/Județ RoHGIS cu potrivire textuală după normalizarea diacriticelor au fost comparate prin intersecție, reuniune, diferență simetrică și distanță Hausdorff a liniilor de hotar în EPSG:3844. Unitățile raportate: kilometri pătrați și kilometri; geometria originală din EPSG:4326 nu a fost simplificată ori mutată.
- Pentru celelalte **55 județe RoHGIS** nu există omonim la același nivel între cele 19 surse OHM „Județe istorice”; **494 de plăși** nu au nivel plasa în sursele OHM din snapshot. Cele trei județe OHM „Jugastru”, „Moghilău” și „Tulcin” aparțin perioadei 1941–1944 și nu au fost asociate anului 1930. Comitatele OHM rămân o categorie istorică distinctă, fără echivalare automată cu județele.
- Numai **Arad, Maramureș și Timiș-Torontal** au o versiune OHM a cărei perioadă declarată include anul 1930. Celelalte 13 încep în 1859, dar nu au `end` documentat; inexistența datei de sfârșit nu demonstrează supraviețuirea teritorială până în 1930.

## Cele 16 cazuri examinate individual

| Județ (nume comun) | Suprapunere IoU | Diferență simetrică, km² | Hausdorff hotare, km | Calificare temporală |
|---|---:|---:|---:|---|
| Arad | 97,88% | 134,57 | 4,93 | 1930 în perioada OHM |
| Bacău | 97,73% | 101,41 | 4,62 | Sfârșit OHM necunoscut |
| Botoșani | 95,97% | 125,53 | 4,29 | Sfârșit OHM necunoscut |
| Covurlui | 95,48% | 123,05 | 3,49 | Sfârșit OHM necunoscut |
| Dorohoi | 97,50% | 73,32 | 4,99 | Sfârșit OHM necunoscut |
| Fălciu | 94,88% | 109,80 | 5,06 | Sfârșit OHM necunoscut |
| Iași | 94,74% | 177,82 | 6,79 | Sfârșit OHM necunoscut |
| Maramureș | 98,96% | 35,83 | 2,16 | 1930 în perioada OHM |
| Neamț | 78,98% | 1007,36 | 33,95 | Sfârșit OHM necunoscut |
| Putna | 92,71% | 258,86 | 5,61 | Sfârșit OHM necunoscut |
| Roman | 92,05% | 158,66 | 6,95 | Sfârșit OHM necunoscut |
| Suceava | 0,06% | 4405,52 | 66,55 | Sfârșit OHM necunoscut |
| Tecuci | 92,60% | 184,73 | 4,62 | Sfârșit OHM necunoscut |
| Timiș-Torontal | 98,97% | 78,10 | 1,86 | 1930 în perioada OHM |
| Tutova | 91,92% | 207,88 | 5,06 | Sfârșit OHM necunoscut |
| Vaslui | 92,21% | 181,44 | 6,95 | Sfârșit OHM necunoscut |

*IoU* = aria intersecției împărțită la aria reuniunii, exprimată ca procent. O valoare apropiată de 100% indică similitudine spațială, **nu** identitate juridică sau geometrică.

### Cazuri prioritare

1. **Suceava — omonim geografic incompatibil:** OHM Suceava versus RoHGIS Suceava (1930) ≈ **0,06%**, adică practic fără intersecție. Conturul OHM Suceava are suprapunere mai mare cu **RoHGIS Baia** (IoU 61,22%), apoi Neamț și Câmpulung. Acestea sunt *indicii spațiale de investigat documentar*, nu echivalențe sau succesiuni certificate.
2. **Neamț:** IoU 78,98% și diferență simetrică de aproximativ 1.007 km²; necesită compararea reorganizărilor administrative și a surselor cartografice de epocă, nu netezirea automată a contururilor.
3. **Maramureș și Timiș-Torontal:** IoU în jur de 99%, însă diferențele nenule de contur (≈ 35,83 km² și 78,10 km²) **exclud** o geografie comună cu același `geometryId`.
4. **Arad:** perioada OHM acoperă 1930, dar geometria diferă de versiunea RoHGIS cu aproximativ 134,57 km² în diferența simetrică; nu se certifică granița prin potrivirea intervalelor cronologice.

## Politica de admitere

Fiecare versiune din ambele surse are **dispoziție individuală** și identificator de proveniență. Nivelurile probatorii rămân independente: **(1) nume**, **(2) perioada de existență**, **(3) identitate instituțională**, **(4) identitate geometrică**, **(5) validitate juridică**. Un nume comun sau IoU ridicat satisface numai criterii exploratorii. Chiar o egalitate topologică exactă va necesita un control documentar de identitate înainte de promovarea reutilizării unui ID geometric.

Nu se modifică **ACTUAL**, arborele istoric existent, relațiile părinte–copil ale 1930, geometriile RoHGIS/OHM, nici registrele OHM înghețate. Fișierul nou este **sidecar probatoriu read-only**; nu introduce corespondențe canonice în interfață.

## Restanțe care nu pot fi închise artificial

- Identitatea istorică între cele 16 entități OHM și entitățile RoHGIS trebuie verificată în acte și hărți contemporane fiecărei perioade; în special intervalele OHM fără capăt și disputa Suceava/Baia.
- Dacă o geometrie-sursă se va corecta ulterior, auditul va fi regenerat din snapshoturile actualizate și hashurile sursei vor fi recalculate. Niciun polygon nu se corectează prin suprapunere automată.
- Cartografia pentru 1925–1930 și schimbările de statut trebuie confruntate înainte de încheierea fiecărei corespondențe istorice.

**Concluzie:** închidere tehnică a comparării geometrice cross-source pentru snapshoturile analizate; **identitățile istorice și dreptul de reutilizare a geometriei comune rămân neadmise** în lipsa dovezilor necesare.
