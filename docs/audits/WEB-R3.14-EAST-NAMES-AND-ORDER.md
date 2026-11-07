# WEB-R3.14 — Transnistria / UATSN / ATULBD: prezentare distinctă și ordine

**Data:** 2026-11-07. **Repository:** `ovidiudeica/atlas`. **Bază:** release `8d6a140812af85ac66773548d02ec599f1d91c04`. **Instantaneu OSMB:** Moldova 2026-10-05, SHA256 `d29b600daa2857bacf8ec7d13369db8fc95353e89f62fe1c762dbc692c216dad`.

## Cerință și decizie

Regiunea statistică din Est și unitatea administrativă recunoscută de Republica Moldova au același nume scurt în release-ul anterior. Pentru a distinge **statistică, administrație legală și administrație de facto**:

| ID Atlas | Tip | Identificator | Română | Engleză |
|---|---|---|---|---|
| `stat-MD120` | statistic, NTS3 | `MD120` | **Transnistria** | **Transnistria** |
| `osm-r2607033` | administrativ, ADM4 | CUATM `9800` | **UATSN** | **ATULBD** |
| `osm-r9581354` | administrativ, ADM4 | CUATM `0500` | **Bender** | **Bender** |
| `osm-r65335` | administrație de facto, sursă distinctă | OSM `65335` | **Nistrenia** | **Pridnestrovie** |

**Sursa engleză:** abrevierea **ATULBD** apare în *Republic of Moldova's First Biennial Transparency Report under the Paris Agreement*, publicat de agențiile de mediu ale Republicii Moldova și transmis către UNFCCC (https://unfccc.int/sites/default/files/resource/BTR1-EN-270125.pdf), inclusiv în lista de abrevieri și în secțiunea 2.1.3. Nu este `short_name:en` OSM: OSM admin `2607033` are doar `short_name=UATSN`.

**Sursa geografică:** OSMB `-18976350`, `boundary=statistical`, `name=Regiunea de Dezvoltare Transnistria`, `alt_name=Regiunea Transnistria`, `short_name=RDT`. Atlas păstrează `stat-MD120` conform nomenclatorului statistic 2017; relația OSMB indică **MD121** la `ref:nuts`. Neconcordanța de sursă **MD121/MD120 nu este remediată automat**, nici recodificată. „Transnistria” este exclusiv eticheta geografică scurtă aleasă pentru această regiune statistică din Atlas.

**Sursa administrativă:** OSMB `-2607033`, `boundary=administrative`, `admin_level=4`, `short_name=UATSN`, `ref:cuatm:codunic=9800`, cu numele original „Unitățile administrativ-teritoriale din stînga Nistrului”. `ATULBD` este traducerea acronimică documentată în engleză, **nu un tag introdus în corpusul OSMB**. Bender rămâne separat cu CUATM `0500`.

**Politică:** nodul `stat-MD120` grupează geometric UATSN + Bender **numai pentru vedere statistică/mixtă**; nu îl transformă în superior administrativ și nu reprezintă Republica Moldovenească Nistreană sau o autoritate recunoscută de facto. Eticheta „Transnistria” poate fi folosită și în alte contexte, dar aici este restrânsă explicit de nivelul **NTS3 MD120**.

## Ordinea în arbore

În vederea `Toate`: `Moldova` → `Est` (NTS2) → **Transnistria** (NTS3) → **UATSN/ATULBD** (ADM4, 79 copii ADM8) → **Bender** (ADM4, 2 copii ADM8). Apare întâi UATSN/ATULBD. Copiii existenți păstrează ordinea deja acceptată, cu codurile CUATM de dezambiguizare pentru cele două Hlinaia.

În vederea `Administrative`, ambele unități ADM4 își păstrează părintele canonic `osm-r58974` (Moldova), nu sunt copiii unei regiuni statistice. În `Statistical`, se afișează `stat-MD120` ca singura entitate NTS3 din Est, fără copiii ADM4.

## Invariante / acceptare

- Numărul total **4283**; MD120 / UATSN / Bender / Nistrenia și cei **79+2 ADM8** păstrați, cu exact aceleași identități OSM, CUATM, `name`, `officialName`, `shortName`, `sourceTags`, `treeParentId`, `administrativeParentId`, geometrii și exporturi.
- Modificări doar în `src/data/treeNames.mjs` și `src/data/treeOrder.mjs`; teste în `tests/` și `scripts/ci/browser-smoke.mjs`, plus acest document.
- Teste pentru ambele limbi, toate vederile, căutare după numele original și original `ref:nuts=MD121`, regresii Nistrenia/Găgăuzia/Chișinău/Nord/Centru/Sud, Chromium desktop/mobil.
- Integrare **numai** cu toate verificările obligatorii SUCCESS la SHA exact, urmată de CI `main`, GitHub Pages și verificarea publicării.
