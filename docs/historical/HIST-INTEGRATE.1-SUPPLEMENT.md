# HIST-INTEGRATE.1b — extinderea catalogului-sursă Geodata GIS (RASSM/HURI și Transilvania)

**Stadiu:** implementare în PR #143 draft, fără merge, deploy ori modificare ACTUAL. Acest lot continuă importul sistematic al geometriilor EXISTENTE, nu georeferențierea originalelor Streit 1835 / Raffelsperger 1841.

## 1. Integrare cumulată

| Colecție | Utilizări-sursă | Geometrii exacte unice | Situație |
| --- | ---: | ---: | --- |
| OHM-Boundaries, import inițial #143 | 139 | 125 | poligoane-sursă candidate, nu hotare juridice |
| RASSM/HURI — raioane | 91 | 30 | 8 instantanee cartografice 1927–1937; identitate și paternitate necalificate |
| RASSM/HURI — contururi | 8 | 5 | 8 instantanee cartografice 1927–1937; contururi alternative, nu hotar certificat |
| Transilvania „1860” (districte) | 52 | 52 | **fără perioadă atribuită**; datarea din numele sursei este nesigură |
| **Total catalog-sursă Geodata** | **290** | **212** | **78** reutilizări de geometrie prin egalitate exactă |

Cele **53 geometrii / 54 versiuni** deja păstrate în pilotul HistoGIS rămân într-o componentă independentă, cu identificatorii și atribuirile neschimbate. Nu sunt însumate cu cele 212 de geometrii Geodata deoarece nu am executat încă deduplicarea intersursă.

## 2. Proveniență și reguli

- Cele trei GeoJSON originale au fost citite din Google Drive / **Geodata GIS**. Identificatorii Drive și hashurile SHA-256 ale fișierelor originale sunt în registrul `docs/historical/import/HIST-INTEGRATE.1-SUPPLEMENT-QA.json`.
- Cele 99 geometrii HURI sunt reprezentări de la **date de observație**, fără extrapolarea valabilității între instantanee. O geometrie identică poate fi reutilizată, fără a certifica vreo continuitate juridico-administrativă.
- Cele 52 poligoane Transilvania au `sourcePeriod.kind='undated'`, cu ambele capete nule. Nu apar la filtrul anului 1860 în lipsa probei cronologice.
- Sursa originală rămâne nemodificată. În website se păstrează coordonatele, fișierul, indexul de feature, familia, colecția și statutul explicit `source_candidate_not_certified`.
- Originalele HURI și Transilvania au drepturile de redistribuire **HOLD_PENDING_REUSE_CONFIRMATION**. PR-ul rămâne draft; publicarea în `main` sau Pages este blocată până la calificarea drepturilor.
- **Zero** relații părinte–copil calificate, **zero** corespondențe noi ACTUAL ↔ Istoric, **zero** hotare certificate pe baza acestor importuri. Nu se schimbă `public/data/phase4`.

## 3. Integrarea aplicației

Sunt folosite **același index și aceeași interfață** `HistoricalGeodataBrowser` din PR #143. Nu se pornește un al doilea catalog concurent din PR #144.

- `public/data/historical/v1/geodata/index.json`: 290 utilizări istorice-sursă, 212 ID-uri geometrice logice și 32 de sharduri lazy.
- `.../huri-rassm-raioane.geojson`, `.../huri-rassm-contururi.geojson`, `.../transilvania-1860-districte.geojson`: datele geometrice-sursă efective.
- `src/data/historicalGeodata.mjs`: validare de proveniență, drepturi, date de snapshot și dată necunoscută, fără asumarea unui hotar istoric legal. Geometriile sunt încărcate la selecție, fără încărcarea tuturor simultan.
- `src/components/HistoricalGeodataBrowser.tsx`: navigare pe familie / grup, filtrare temporală fără extrapolare, cardul Entitate bilingv și selectarea poligonului în MapLibre.
- `scripts/historical/import_geodata_gis_sources.py` + `scripts/historical/import_geodata_supplements.py`: două etape deterministe, prima OHM, apoi loturile suplimentare.
- `tests/hist-integrate-geodata.test.mjs`: teste pentru 290 utilizări, identitatea geometrică, blocarea promovării nefondate și absența datei istorice certificate pentru Transilvania.

## 4. Interoperabilitatea cu catalogul istoric

**Catalogul-sursă nu este încă un arbore administrativ certificat.** `GeometryAsset` / `GeometryUse` sunt identificate prin ID-uri stabile și asociate cu versiunile-sursă datate sau nedatate. Pentru recunoașterea ca `HistoricalEntity` sau `HistoricalVersion` canonică se cere separat calificarea identității, apartenenței și perioadei în contractele HIST-MODULE.0–3.

Importul urmărește **disponibilitatea și afișarea geometriei existente**, nu generarea unei istorii juridice din metadatele cartografice. Relațiile Administrativ ↔ Istoric rămân separate.

## 5. Domenii încă neînchise

Rămân pentru calificare și import controlat: exportul HistoGIS Europa complet (fără dublarea pilotului), DARMC Roman/Medieval (inclusiv Dacia/Moesia), inventarul ICR/KMZ, RASSM/ICR și materialele de lucru necertificate, sursele Russian Empire 1897, Mosaic și sursele istorice din GeoSpatial. Celelalte surse Geodata GIS care sunt actuale, hidrografice sau climatice **nu** sunt automat geometrii istorice administrative.

Nu se va declara întregul director Geodata GIS importat până când fiecare colecție are verdictul `importat`, `duplicate`, `rights HOLD`, `non-historical` ori `research HOLD`.

## 6. Acceptare și reproducere

Pe mediul cu Google Drive sincronizat, Python 3.10+ și Shapely 2+:

```sh
python scripts/historical/import_geodata_gis_sources.py --input "G:/My Drive/Geodata GIS/OHM-Boundaries" --repo .
python scripts/historical/import_geodata_supplements.py --input "G:/My Drive/Geodata GIS" --repo .
node --test tests/hist-integrate-geodata.test.mjs
npm run build
```

Rezultatele CI, TypeScript/Vite, testarea browser desktop/mobil și drepturile de redistribuire trebuie verificate înainte de schimbarea statutului PR-ului. Importul nu este certificat doar pentru că datele sunt afișabile.
