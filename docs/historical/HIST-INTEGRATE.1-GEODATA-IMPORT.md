# HIST-INTEGRATE.1 — integrarea sistematică a poligoanelor-sursă Geodata GIS în Istoric

**Stadiu:** sursele OHM importate complet într-un branch de dezvoltare; raport închis doar pentru colecția OHM-Boundaries, **NU** pentru întreg Geodata GIS. **Fără merge/deploy** înainte de CI, drepturi și QA.

## Proveniență / date

Sursa directă este `G:\My Drive\Geodata GIS\OHM-Boundaries`, copie sincronizată a directorului Google Drive autentic. **139 fișiere OHM-r*.geojson** au fost citite integral, fără a modifica sau suprascrie vreun fișier în Drive; 139 de versiuni administrative cartografice ale sursei au fost înregistrate în `public/data/historical/v1/geodata/index.json`, cu 29 de fragmente GeoJSON încărcate la cerere.

- **139** versiuni istorice-sursă distincte: **43** principale/regionale, **19** județe istorice, **77** comitate istorice.
- **125** active geometrice logice distincte după egalitate **exactă a secvenței de coordonate**, **14** versiuni folosesc un contur deja prezent; toate originale sunt păstrate în fragmentele-sursă.
- **139/139** poligoane `Polygon` sau `MultiPolygon` topologic valide (Shapely), fără `buffer`, `make_valid`, simplificare, interpolare sau reproiectare a datelor-sursă publicate.
- **13** versiuni au cel puțin un capăt temporal incomplet. Ele se pot consulta în listă, însă nu se extind automat la un an fără dovadă.
- Fiecare intrare păstrează `id`/ID OHM, nume RO/EN când există, intervalul exact de sursă, avertismentele `fixme`, cale originală relativă, SHA-256 al fișierului și sursa din Drive când ID-ul este verificat. Lipsa ID-ului Drive individual nu este acoperită cu un URL inventat; se păstrează calea sincronizată și relația OHM.
- Un `sourceGroup` indică **folderul editorial al sursei**, **nu** o subordonare administrativă verificată.

Importatorul reproducibil este `scripts/historical/import_geodata_gis_sources.py`; registrul QA: `docs/historical/import/HIST-INTEGRATE.1-OHM-IMPORT-QA.json`. Datele `ACTUAL` și `public/data/phase4` sunt neschimbate. Geometriile HistoGIS deja prezente în catalogul-pilot (53 active, 54 versiuni) nu sunt replicate ca OHM.

## Interfață

Modulul Istoric dispune în continuare de arborele HistoGIS și de cardul comun al Entității. Acest import adaugă **catalogul de versiuni sursă OHM** cu filtrare după nume, grup și perioadă, geometrie on-demand în sursa **`historical-geodata`** MapLibre și card Entitate cu proveniență, interval original și avertisment de necertificare. Nu există amestec cu `historical-pilot` sau catalogul ACTUAL. Resetul local Istoric elimină selecția sursei istorice, resetul global revine la România + Moldova. Anul este o opțiune de filtrare, nu o atribuire retrospectivă.

Modulul nu a inventat din foldere relațiile părinte–copil și nu a certificat hotare juridice. Următoarea etapă separată trebuie să unească registrele provenienței cu `HistoricalEntity`/`HistoricalVersion`/`TemporalHierarchy` după probe documentare.

## Stadiul celorlalte colecții

| Sursă | Inventar observat / stadiu | Decizie de import |
|---|---|---|
| HistoGIS v9.0 | arhivă 41,5 MB; pilot existent 53 geometrii / 54 versiuni; export Europa 2.617 entități, 101 MB, CC BY 4.0 | **Pilot integrat anterior**; exportul Europa și colecțiile istorice din 1512/1834/1860 rămân de importat, fără dublarea celor 54 versiuni |
| Transilvania 1860 | fișier GeoJSON cu 52 poligoane; README recunoaște etichetă „1860” neconfirmată, posibil conținut din Mosaic 1910 | **Nu publicați sub anul 1860** până la calificarea cronologiei și drepturilor |
| ICR Maps | 20 KMZ sursă; provin din multiple hărți My Maps | inventar sursă disponibil, selecție și drepturi per strat încă nefinalizate |
| RASSM | 1.396 fișiere de lucru, inclusiv 160 GeoJSON și 69 GeoPackage | **Nu importați în bloc rezultatele de lucru drept hotare canonice**; necesară selectarea geometriilor-sursă și stărilor temporale |
| DARMC | trei arhive ZIP, două servicii regionale exportate și registru QA | de integrat după citirea licențelor și a atributelor cronologice originale |
| Mosaic | 11 arhive-sursă și README cu condiții noncomerciale pentru unele resurse | în așteptarea drepturilor de redistribuire |
| Russian Empire 1897 | arhivă ZIP, README și documentație | inventar disponibil; geometriile trebuie examinate înainte de adoptarea versiunilor |
| GeoSpatial / Natural Earth / HydroSHEDS / Marine Regions / AIGA | colecții prezente în Geodata GIS | statutul de sursă istorică și temporalitatea trebuie determinate per set; nu toate sunt poligoane administrative istorice |

Criteriu de completitudine: vom numi `Geodata GIS complet importat` **numai după** auditul tuturor colecțiilor, cu registru `importat / aceeași geometrie deja prezentă / licență HOLD / neistoric / invalid / cercetare suplimentară` și referință verificabilă.

## Control de acceptare

`node --test tests/hist-integrate-geodata.test.mjs`: 4/4 verificări reușite pentru registrul OHM complet, identificatori, geometrii și fail-closed. `npm run build`: TypeScript + Vite reușite în Windows. Testele globale includ arhive istorice de hashuri SHA-256 care sunt sensibile la checkout `core.autocrlf=true`; rezultatele locale negative de reproducibilitate pentru acele dosare sunt tratate distinct, nu remediate prin editarea datelor ACTUAL sau a registrelor de simboluri.

**Niciun poligon sursă nu primește `boundaryCertified=true` în acest import.**
