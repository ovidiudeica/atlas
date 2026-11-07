# WEB-R3.12 — Etichete geografice scurte în Est / UATSN

**Data:** 2026-11-07. **Referință:** OSM-Boundaries Moldova 2026-10-05, catalog certificat Atlas de 4.283 entități; instantaneu SHA-256 `d29b600daa2857bacf8ec7d13369db8fc95353e89f62fe1c762dbc692c216dad`.

## Domeniu

- `stat-MD12` (Est, NTS2) → `stat-MD120` (Stânga Nistrului, NTS3) → Bender `osm-r9581354` (ADM4, CUATM 0500, 2 copii) și UATSN `osm-r2607033` (ADM4, CUATM 9800, 79 copii).
- Sunt **44** consilii de nivel ADM8 cu etichete descriptive în limba română: **43** cu `Sovetul sătesc` și **1** cu `Sovetul orășenesc`. Identitățile și denumirile geografice au fost confruntate individual cu `registry.record.name` din catalogul certificat. Mapa ID → etichetă este `UATSN_RO_SHORT_LABELS` din `src/data/treeNames.mjs`, cu exact 44 de ID-uri.
- Pentru `osm-r8349338`, eticheta engleză `Sovetul sătesc Popencu` se prezintă `Popencu`; numele original rămâne în date.
- Pentru `osm-r8290877`, `shortName.ro/en` și `name:ro` sunt `Slobozia`, dar `officialName`, registrul CUATM (cod `7628`) și `short_name:ro` din OSMB indică `Pervomaisc`. Ambele limbi afișează **Pervomaisc**, fără rescrierea sursei.
- `osm-r9301463` (Hlinaia, CUATM `5029`) și `osm-r8291058` (Hlinaia, CUATM `7625`) sunt două identități originale diferite. WEB-R3.12 le lasă identitățile și etichetele EN neatinse; WEB-R3.13 va adăuga dezambiguizarea vizuală a homonimelor.

## Reguli de integritate

Intervențiile sunt exclusiv în funcția `shortTreeName`; niciun `node.name`, `shortName`, `officialName`, tag OSM, `registry`, cod CUATM, OSM ID, `treeParentId`, `administrativeParentId`, geometrie sau export nu este schimbat. Nu transformăm raioanele Nistreniei în părinți ai UATSN. Testele acoperă **44/44** etichete cu corelare oficială și căutare originală, Popencu, Pervomaisc, dubla Hlinaia și regresii globale ale întregului catalog.

**Limită:** localizarea istorică folosește forma de diacritice a numelor sursă; înregistrările CUATM cu varianta `ș/ş`, `ț/ţ` sunt recunoscute semantic, fără rescrierea metadatelor. Aceasta este o convenție de afișare, nu certificare a organizării politico-administrative de facto.

**Acceptare:** static + build + Chromium desktop/mobil, inspectarea capturilor, merge SHA exact, verificare post-merge GitHub Pages. WEB-R3.13 este un PR ulterior distinct.
