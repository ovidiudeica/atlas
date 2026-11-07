# WEB-R3.13 — Ordinea și dezambiguizarea Est (Bender + UATSN)

**Data:** 2026-11-07. **Bază:** WEB-R3.12 deja integrat în commitul `f092d37e5f5e9f1627241b09af8496ac2237fecc`, catalogul certificat de 4.283 entități, OSM-Boundaries 2026-10-05.

## Hierarhie verificată, nemodificată

`Moldova` (ADM2) → `Est` (`stat-MD12`, NTS2) → `Stânga Nistrului` (`stat-MD120`, NTS3) → **Bender** (`osm-r9581354`, ADM4, CUATM 0500) și **UATSN** (`osm-r2607033`, ADM4, CUATM 9800). Bender are 2 ADM8; UATSN are 79 ADM8, toate înregistrate sub părintele său canonic în `treeParentId` și `administrativeParentId`. Ambele ADM4 au **părintele administrativ Republica Moldova** `osm-r58974`; nodurile NTS nu devin părinți administrativi.

## Reguli exclusiv vizuale

1. În `Toate`, la NTS3 `stat-MD120`, **Bender** este primul, urmat de UATSN. Nicio schimbare în vederile `Administrative` și `Statistical` cu privire la ierarhia părinte-copil.
2. În Bender ADM4, orașul Bender `osm-r12463379` este primul, apoi Proteagailovca `osm-r12463378`. Această regulă este aplicată în `Toate` și `Administrative`.
3. În UATSN ADM4, cei **79 de copii** sunt ordonați alfabetic după `shortTreeName(node,lang)` în RO sau EN, cu departajare stabilă după OSM ID. Nu se creează entități administrative sau raioane intermediare.
4. Denumirea **Hlinaia** este comună pentru două ADM8 ale UATSN: `osm-r9301463` (CUATM **5029**) și `osm-r8291058` (CUATM **7625**). Ambele păstrează numele și geometria, dar arborele afișează pe linia secundară **ADM 8 · CUATM 5029** sau **ADM 8 · CUATM 7625**. Etichetele accesibile și câmpurile aria includ codul pentru distingerea la citirea cu ecranul.
5. Codurile și metadatele originale ale celor două ramuri de **administrație recunoscută (UATSN)** și **administrație de facto (Nistrenia)** rămân distincte și nu se amestecă.

## Dovezi și constrângeri

- Test nou `tests/east-tree-order.test.mjs` pentru 2 ADM4 + 81 ADM8, parentaj, ordine RO/EN, vederi `all`/`administrative`, două Hlinaia, absența duplicatelor, regresii Nistrenia, Nord/Centru/Sud, Chișinău/Găgăuzia și Căușeni.
- Test Chromium desktop confirmă structura reală `East → Left Bank → Bender/UATSN`, 2/79 copii, sortarea în ambele limbi, codurile CUATM și capturile.
- Cod exclusiv în `src/data/treeOrder.mjs` și în prezentarea secundară din `src/App.tsx`. Nu sunt modificate datele `public/data/**` sau `data/**`, geometriile, atribuțiile juridice, identitățile OSM/CUATM, denumirile canonice și exporturile.
- Ordinea nu exprimă o capitală administrativă a unei regiuni statistice și nu constituie certificare juridică a limitelor.

**Gate:** PR separat de WEB-R3.12, check-uri obligatorii SUCCESS pe SHA exact, capturi inspectate, integrare protejată urmată de CI `main` și GitHub Pages.
