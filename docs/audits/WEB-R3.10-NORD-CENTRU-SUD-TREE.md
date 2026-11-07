# WEB-R3.10 — Reordonare vizuală Nord, Centru, Sud (7 noiembrie 2026)

**Repository:** `ovidiudeica/atlas`. **Sursă:** OSM-Boundaries Moldova, 2026-10-05; SHA-256 arhivă: `d29b600daa2857bacf8ec7d13369db8fc95353e89f62fe1c762dbc692c216dad`.

## Decizie și limită de autoritate

Regiunile Nord (NTS3 MD111), Centru (NTS3 MD112) și Sud (NTS3 MD113) sunt **statistice**, nu superiori administrativi. În modul **Toate** avem deja `stat-MD11` → MD111/MD112/MD113 → 33 unități ADM4 → 853 unități ADM8. În modul **Administrative**, toate ADM4 rămân sub Republica Moldova, iar cele 853 ADM8 rămân sub unitățile ADM4. Modul **Statistice** este neschimbat.

Indentația existentă se păstrează. WEB-R3.10 modifică **numai comparatorul vizual al fraților**, în `src/data/treeOrder.mjs`: primele unități ADM4 sub regiunile statistice sunt Bălți (Nord), Ialoveni (Centru), Cimișlia (Sud), fiind localități-sediu ADR, **nu capitale juridice ale unor regiuni administrative**. Urmează alte 11/12/7 unități ADM4, alfabetic după eticheta scurtă în limba interfeței.

În fiecare dintre cele 33 unități ADM4, apare prima reședința verificată prin ID unic din audit, urmată de ceilalți copii ADM8 alfabetic în RO/EN cu ID ca departajare. Dubăsari prioritizează **Coșnița** (`osm-r19013515`), sediul consiliului, distinct de punctul `admin_centre` OSMB situat în Cocieri. Dondușeni, Drochia și Ocnița au omonime și nu se identifică prin nume. Aceste priorități sunt convenții de navigare, nu identități administrative noi.

| Regiune | Nod | ADM4 | ADM8 | Prima ADM4 |
|---|---|---:|---:|---|
| Nord | `stat-MD111` | 12 | 315 | Bălți (`osm-r58983`) |
| Centru | `stat-MD112` | 13 | 357 | Ialoveni (`osm-r1691800`) |
| Sud | `stat-MD113` | 8 | 181 | Cimișlia (`osm-r1211126`) |
| **Total** | | **33** | **853** | |

## Invariante și verificare

- Zero modificări în `data/**`, `public/**`, `assets/**`, `src/data/treeOverlay.mjs`, geometrii, SHA, OSM ID, CUATM, NTS, `treeParentId`, `administrativeParentId`, carduri și CSV/GeoJSON.
- În `tests/md-regional-tree-order.test.mjs`: 33/33 entități ADM4, 853/853 copii ADM8, câte 12/13/8, 315/357/181; toate reședințele cu ID individual, fără duplicare; RO și EN, modurile Toate și Administrative, integritatea statistică și regresia ramurilor Găgăuzia/Chișinău/Nistrenia.
- Testul browser Chromium trebuie să verifice indentarea vizibilă, ordonarea și capturile pe desktop și telefon, fără revenirea la liste ADM4 false în modul Administrative.
- Excepția deja acceptată Fîrlădeni/Căușeni este numai geometrică și nu se remediază prin acest PR.

**Acceptare:** CI obligatoriu terminal `SUCCESS` pe SHA exact; capturile browser inspectate; integrare numai după verificare, urmată de CI post-merge și audit GitHub Pages. Nicio înlocuire sau promovare a corpusului ACTUAL.
