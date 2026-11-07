# WEB-R3.16 — Chișinău primul sub West (Vest)

**Data:** 2026-11-07. **Repository:** `ovidiudeica/atlas`. **Bază:** release `397bdac276024fe2a2fcf333536bf768c7af17ed`. **Catalog:** OSMB Moldova 2026-10-05, 4.283 entități certificate.

## Decizia de prezentare

Nodul statistic `stat-MD11` (West/Vest, NTS2) are cinci copii `treeParentId=stat-MD11`. În interfața `Toate` și în vederea `Statistical` ei sunt afișați în următoarea ordine, **identică la nivelul ID-urilor** în RO și EN:

| Loc | ID Atlas | RO | EN | Stat / ADM |
|---|---|---|---|---|
| 1 | `osm-r1691801` | Chișinău | Chișinău | MD115 / ADM4 |
| 2 | `stat-MD111` | Nord | North | NTS3 |
| 3 | `stat-MD112` | Centru | Centre | NTS3 |
| 4 | `stat-MD113` | Sud | South | NTS3 |
| 5 | `osm-r1699032` | Găgăuzia | Gagauzia | MD114 / ADM4 |

Regula este **doar prioritizarea `osm-r1691801`**. Ordinea relativă anterioară a celorlalte patru ramuri este menținută, inclusiv trei regiuni NTS3 urmate de Găgăuzia.

## Invariante

- Chișinău rămâne `treeParentId=stat-MD11`, `administrativeParentId=osm-r58974`. În vederea `Administrative`, nodul West **nu devine** părintele juridic al Chișinăului.
- Localitatea ADM8 Chișinău (`osm-r1748490`) este în continuare **primul copil** al municipiului ADM4 Chișinău; cele cinci sectoare ADM7 rămân indentate sub localitate în prezentare. Găgăuzia și cele trei raioane ADM5 sunt intacte.
- Nu atingem arborele Nistreniei, ordinea WEB-R3.15, Transnistria/UATSN/ATULBD, geometriile, codurile OSM/CUATM, datele certificate sau exporturile.
- Singura modificare a logicii de producție este un rang de prezentare în `src/data/treeOrder.mjs`, specific pentru `parentId=stat-MD11`. Ordinea celorlalți copii folosește în continuare comparatorul acceptat.
- Nu se schimbă `public/data/**`, `data/**`, `treeParentId`, `administrativeParentId` sau ID-urile canonice.

## Teste și integrare

Test nou `tests/west-chisinau-first.test.mjs` pentru 5/5 copii NTS2, ordine exactă RO/EN în două vederi, identități și părinți, regresii Chișinău/Găgăuzia/Nistrenia/Est. `scripts/ci/browser-smoke.mjs` adaugă capturi și verificări pentru desktop și mobil. Integrarea este permisă numai după CI reușit pe SHA exact, auditul capturilor, PR protejat, verificări post-merge și GitHub Pages. Etapa de completare a arborelui Nistreniei rămâne separată.
