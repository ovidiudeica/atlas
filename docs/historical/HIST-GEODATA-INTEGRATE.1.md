# HIST-GEODATA.INTEGRATE.1 — import real din Geodata GIS în modulul Istoric

**22 noiembrie 2026 — lotul 1, PR draft.** Nu este un import complet al întregului Geodata GIS. Scopul este integrarea geometriei deja existente, nu georeferențierea unor hărți sau reconstrucția prematură a hotarelor.

## Date importate, fără schimbarea contururilor

| Colecție/loc | Fișiere GeoJSON originale | Utilizări istorice în catalog |
|---|---:|---:|
| OHM-Boundaries / Transilvania | 4 | 4 |
| OHM-Boundaries / Bucovina | 4 | 4 |
| OHM-Boundaries / Comitatul Zărand | 2 | 2 |
| OHM-Boundaries / Județul Iași | 1 | 1 |
| Transilvania 1860 / districte | 1 | 52 |
| **Total nou importat în acest PR** | **12** | **63** |

Catalogul separat `public/data/historical/geodata-source/v1/catalog.json` inventariază **59 de geometrii distincte logic**, **63 de utilizări**, fiecare cu fișier, `featureIndex`, `geometryAssetId`, identificator de entitate sursă, perioadă **declarată de sursă** (nu validată automat), proveniență și statut `NOT_CERTIFIED`. Patru utilizări reutilizează geometrii identice; sursele originale rămân separat și intacte.

Fiecare fișier original se găsește sub `public/data/historical/geodata-source/v1/`, cu cale, ID de fișier Google Drive și hash SHA-256 din manifeste originale OHM, respectiv din `SHA256SUMS.txt` pentru 1860. Nu s-au executat simplificări, reproiecții, buffer, intersection ori dissolve. Am păstrat toate atributele-sursă inclusiv `fixme:s`, notele de cronologie și câmpurile KML ale districtelor. Sursele OHM includ explicit unele date *arbitrar alese*, în special la Bucovina; acestea **nu** devin intervale istorice certificate.

Catalogul HistoGIS v9 existent rămâne intact: **53 de geometrii distincte**, 54 de versiuni istorice, 52 de relații candidate. Nu adunăm mecanic 53+59 ca număr de **geometrii distincte în toate sursele** fără un test intercolecții; 59 privește strict noul lot.

## Interfață

- `src/components/HistoricalGeodataBrowser.tsx`: un browser **Geodata GIS** integrat în panoul modulului Istoric, separat de arborele HistoGIS exploratoriu, cu filtrare pe colecție, nume și an, în RO/EN prin selectorul global.
- `src/data/historicalGeodataSource.mjs`: registru, validator, filtru temporal de **tag-sursă** și încărcare la cerere a geometriei din fișierul original.
- `src/App.tsx`: strat MapLibre separat `historical-geodata`, contur albastru întrerupt, selecție din inventar, zoom la poligon, cardul Entitate comun cu identificare, periodizare declarată, tip sursă și link de proveniență. Selecțiile ACTUAL nu sunt scrise.
- Reset local Istoric ascunde importul selecționat și pilotul; reset global revine la România + Republica Moldova. Datele `public/data/phase4`, codurile statistice și geometria ACTUAL nu sunt editate.

Browserul oferă **colecție de geometrii de sursă**, nu un arbore administrativ complet: relațiile părinte–copil ale OHM și ale stratului „Transilvania 1860” trebuie calificate separat, fără a deduce părinți din suprapunere. Până atunci aceste entități sunt vizibile și selectabile, cu proveniența explicită.

## Domeniul neacoperit de acest lot (nu se pretinde import complet)

Au fost identificate în [Geodata GIS](https://drive.google.com/drive/folders/10bkGRw9h2cRMPCDjZrsVKAv7dEdxaDVX), dar nu toate preluate acum:

1. Restul folderelor **OHM-Boundaries**: state, regiuni, comitate, județe, perioade și variante; unele fișiere sunt redundante sau au perioade/source-fixme incerte.
2. **DARMC**, diverse straturi și exporturi ArcGIS cu proveniență proprie.
3. **ICR Maps**, inclusiv KMZ-uri și construcții KML/MyMaps.
4. **RASSM**, separat între poligoane de sursă, geometrii de lucru și proiecte de reconstrucție P1–P5.
5. **HistoGIS**, dincolo de eșantionul deja preluat în primul catalog.
6. **OHM-Audit, alte colecții și geometrii alternative**: vor fi reconciliate fără a le impune o ierarhie juridică artificială.

Pentru formatele KMZ/GPKG/SHP va exista conversie strict tehnică în GeoJSON, cu sursa originală păstrată și hash verificat; conversia nu este o corectare a hotarului. Echivalența geometriei rezultată din formate diferite trebuie testată explicit.

## Drepturi și audit

Geometriile OHM au proveniență din OpenHistoricalMap și manifeste cu observația „no explicit relation-level license tag”; cadrul de licențiere și eventualele drepturi asupra surselor/cartografiilor de origine trebuie clarificate înaintea publicării. Setul Transilvania 1860 are propria proveniență, iar permisiunea pentru redistribuție trebuie verificată independent. Importul într-un **PR draft** nu este echivalent cu promovarea comercială, aprobarea juridică sau publicarea pe website. Existența unui contur nu înseamnă că versiunea ori perioada sa sunt independente de sursa declarată.

**Verdict lot 1:** 12 fișiere preluate efectiv în branch, 63 de versiuni/ocurențe de poligon și 59 de geometrii distincte logic; afișarea pregătită în modul Istoric, fără schimbarea catalogului ACTUAL. Acesta este **un import efectiv parțial**, nu „toate geometriile Geodata GIS importate”.

## Porțile înainte de integrare

1. Reproducerea celor 12 surse din Drive la SHA-256 original, validarea GeoJSON, verificarea numărului de feature și a reutilizării fizice.
2. `node --test tests/hist-geodata-import.test.mjs`; `npm test`, `npm run build`; teste Chromium desktop/mobil; CI pe SHA exact.
3. Calificarea drepturilor de reutilizare pentru materialele aduse în distribuția publică.
4. Fără hotare/părinți juridici inventați, fără modificări ale `public/data/phase4`; admiterile istorice definitive se tratează separat, după dezvoltarea completă a catalogului.

**Ordinea următoare:** inventar exhaustiv recursiv al tuturor colecțiilor Geodata GIS → importul fișierelor lipsă și tratamentul KML/KMZ/GPKG → legare identitate–versiune–geometrie–sursă → abia ulterior audit și corecție.
