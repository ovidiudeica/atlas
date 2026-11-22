# HIST-MODULE.0 — contract de interoperabilitate Administrativ ↔ Istoric

**Data:** 2026-11-22  
**Stadiu:** fundație de date/validare, **în PR draft**, fără import de hotare sau publicare de geometrii istorice.  
**Repo:** `ovidiudeica/atlas`  
**Dependență:** HIST-MODULE.1, PR #135, încă în draft, necesită reconciliere după acest contract.

## 1. Contractul existent, verificat în `main`

La 2026-11-22, aplicația React/TypeScript/MapLibre are:

- `src/data/territories.ts` — catalog ACTUAL `atlas-territory-browser-v1`, 4.283 de entități (RO 3.241, MD 1.042), snapshot OSMB `2026-10-05`. `Territory.id`, OSM, registru, roluri administrative/statistice și geometrie `geometryShard` sunt date canonice; nu vor fi rescrise pentru Istoric.
- `src/data/territoryRoles.mjs` — domeniile `administrative`, `statistical`, `cartographic` nu sunt interschimbabile. De exemplu, București ADM4 OSM / rol municipal SIRUTA și Chișinău ADM4/ADM8 nu pot fi comasate.
- `src/data/treeOverlay.mjs` — ierarhia **de prezentare** nu mută părinții canonici; nu certifică subordonarea juridică.
- `src/data/entityCardRoles.mjs` și `src/components/EntityCardSection.tsx` — secțiunile Identitate, Administrație, Statistică, Ierarhie, Simboluri, Geometrie, Surse; același panou Entitate desktop/mobil. Panoul rămâne **unul singur**, indiferent de modul.
- `src/data/moduleReset.mjs` — selecții geometrice separate pentru șase module, desenate pe aceeași hartă, reset local izolat și reset global.
- `src/App.tsx` — selector global RO/EN, căutare, navigare, MapLibre, `selectedModule`, panou Entitate. În prezent, `choose()` selectează numai `administrative`, iar `currentNode` caută numai în catalogul ACTUAL; celelalte module afișează placeholder. Aceste două limite vor fi corectate doar după admiterea catalogului Istoric.
- `src/data/phase5.mjs` — permalinks administrative cu `entity`, cameră, `lang` și `view`. Linkurile vechi trebuie să continue să funcționeze.

**Invariantă:** catalogul ACTUAL și materialul `public/data/phase4/` rămân byte-for-byte identice în această etapă.

## 2. Identități și surse: modelul țintă

Modelul are registre **logice** distincte, nu neapărat câte un fișier pentru fiecare:

1. **HistoricalEntity** — identitate administrativă istorică stabilă și ciclul de viață, început/sfârșit (eventual necunoscute).
2. **HistoricalVersion** — versiune administrativă datată, cu tip, nume, eventual reședință; un comitat devenit județ poate fi aceeași entitate cu versiuni diferite ori două entități succesoare, după documente.
3. **GeometryAsset** — contur unic canonic per reprezentare geometrică, reutilizat când este identic; toate sursele originale rămân accesibile.
4. **GeometryUse / GeometryDecision** — asociere temporală a versiunii cu geometria; la același moment pot exista mai mulți candidați, dar cel mult un contur implicit admis pentru o perspectivă și o versiune. O alternativă nu se șterge.
5. **TemporalHierarchy** — părinte, copil, tip administrativ/statistic/editorial, perspectivă administrativă, perioadă, surse și statut. Nu se deduce apartenență juridică doar din intersecția poligoanelor.
6. **HistoricalEvolution / HIST-EVENTS** — redenumire, reformă, reorganizare, divizare, fuziune, schimbare de hotar, transfer, creare/desființare și predecesor/succesor; pot fi relații multiple, nu doar A→B.
7. **HistoricalSymbolUse** — stemă, drapel, sigiliu, interval verificat, autorizare și licență. Simbolurile ACTUAL nu se propagă retrospectiv.
8. **HistoricalAdminBridge** — relații explicite între identificatori de versiune/entitate istorică și ID-uri ACTUAL din snapshotul 2026-10-05. Păstrează dovezile, nu transformă un județ în altul prin potrivire de nume.

Toate legăturile documentare poartă propriile `sourceIds` și statut (`qualified`, `candidate`, `in_review`). Calificarea cartografică, cea cronologică și cea juridico-instituțională sunt independente. Nu interpretăm „calificat” drept hotar juridic certificat automat.

## 3. Contractul implementat: `HistoricalAdminBridge`

Fișiere: `src/data/historicalAdminBridge.mjs` și `.d.mts`.

Fiecare legătură are:
- `id`, `actualId`, `historicalEntityId`, `historicalVersionId`;
- `historicalPeriod` și `actualSnapshotDate` care trebuie să corespundă snapshotului explicit al catalogului;
- `kind` cu **patru semantici neinterșanjabile**: `institutional_continuity`, `administrative_succession`, `territorial_overlap`, `identical_boundary`;
- `evidenceStatus` și `sourceIds`;
- `geometryComparison` pentru comparații spațiale: ambele ID-uri geometrice, CRS, metoda și **două procente distincte** (`historicalCoveragePercent` și `actualCoveragePercent`).

Un suprapus teritorial nu este o succesiune administrativă, iar coincidența unui contur nu implică identitatea instituției.

Validarea respinge ID-uri necunoscute, variante de timp invalide, duplicarea semantică a unei relații, sursele lipsă, discrepanta de snapshot și declararea ca „qualified” a unei corespondențe spațiale fără măsurători. Acest registru este **gol în producție**: pentru nicio entitate actuală nu a fost inventată o legătură istorică.

Funcții de citire:
- `historicalLinksForActual`: toate legăturile pentru un `actualId`, ordonate cronologic;
- `actualLinksForHistorical`: legăturile pentru o entitate istorică;
- `navigationTargetForBridge`: identifică ținta de navigare în celălalt modul **doar pentru legături qualified**; nu alege automat „prima potrivire” în cazul corespondențelor multiple.

## 4. Contractul implementat: ierarhie temporală

Fișiere: `src/data/historicalTemporalHierarchy.mjs` și `.d.mts`.

Fiecare relație are `parentVersionId`, `childVersionId`, `kind`, `perspectiveId`, `period`, dovezi și statut. `perspectiveId` permite administrații paralele documentate, fără a le amesteca.

Validarea respinge cicluri de paternitate active simultan, două părinți administrativi concurenți în aceeași perspectivă, relații care depășesc intervalele versiunilor, autolegături și ID-uri nerezolvate.

`childrenForHistoricalYear` și `parentsForHistoricalYear` prezintă numai legături calificate cu ambele capete temporale cunoscute. O simplă atestare pentru 1910 nu devine automat o relație 1867–1918.

**Părinți derivați geometric:** operația `unary_union/dissolve` se va executa în etapa GIS, numai după justificarea grupării, perioada comună, QA topologic, verificarea alternativelor deja existente și evitarea suprapunerilor/golurilor. Nu apar noi entități doar pentru că mai mulți copii sunt apropiați geometric.

## 5. Regula anX–anY

Perioada publică este `anX–anY` când ambele capete sunt documentate. Se păstrează intern lunile și zilele, precum și calificările istorice. Dacă numai un capăt este cunoscut, afișăm `anX–?` sau `?–anY`; pentru un snapshot, afișăm „Atestat în 1910” / “Attested in 1910”, **nu** un interval fabricat.

Datele î.Hr. sunt reprezentate cu ani negativi în formatul intern și cu sufix `î.Hr./BCE` în afișare. Nu se introduce anul 0. Atribuirea unei geometrii identice la mai multe intervale nu înseamnă că acestea sunt continue dacă există lacune documentare.

## 6. Navigare și panoul Entitate

O singură componentă comună `EntityCardSection`, fără dublare desktop/mobil; limba vine din `WORDS[lang]` global.

### Administrativ → Istoric

Selectarea unui județ, raion, municipiu etc. va afișa o secțiune **Istoric** numai când există relații calificate. Se vor lista cronologic relațiile și versiunile (nu doar un singur strămoș). Alegerea uneia va schimba modulul și versiunea istorică selectată, păstrând panoul Entitate comun. Relațiile candidate pot apărea într-o secțiune de verificare, dar nu se navighează ca fapt certificat.

### Istoric → Administrativ

Secțiunea **Situația actuală** va prezenta toate unitățile ACTUAL relevante, cu semantica legăturii: continuitate instituțională, succesiune documentată sau simplă intersecție teritorială. Pentru comparațiile spațiale se expun ambele procente și originea datelor. Dacă partea istorică relevantă se află în Ucraina sau în alt teritoriu neacoperit de ACTUAL, se indică **acoperire incompletă**, nu „nu există unități actuale”.

### Starea aplicației și hărții

La integrare, selecția globală trebuie să devină `{ moduleId, entityId, versionId? }`. Arborele administrativ și cel istoric au colecții, căutare, expansiune și selecții proprii; **nu** se amestecă părinții lor. Straturile comune MapLibre vor avea ID-uri distincte pentru ACTUAL și Istoric sau un adaptor care păstrează proveniența. Resetul local al unui modul trebuie să păstreze selecțiile celorlalte; resetul global restaurează numai România + Republica Moldova. Vizibilitatea hărții și simplificarea nu modifică forma canonică. Linkurile vechi `?entity=...` rămân valide; cele istorice vor folosi identificator de modul și versiune.

## 7. Planul imediat de integrare

1. **HIST-MODULE.0** (acest PR): contracte, validări, teste, documentație; niciun import de geometrii și nicio mutare ACTUAL.
2. **HIST-MODULE.1** (PR #135, încă draft): reconciliere cu aceste tipuri; geometrie fizică unică, utilizări documentate, afişare cronologică, integrare globală EN/RO; fără dublarea formatterelor temporale.
3. **HIST-MODULE.2**: admiterea treptată a unui catalog istoric minim din auditul Geodata GIS, cu date și surse calificate; ierarhii România→directorate→județe→plăși și Transilvania→unități→subunități doar după verificarea cronologiei.
4. **HIST-MODULE.3**: selector interval, arbore temporal, MapLibre istoric separat de ACTUAL, suport multi-module.
5. **HIST-MODULE.4**: cardul Entitate bidirecțional, HIST-EVENTS, simboluri temporale, alternative geometrice, permalinks și QA desktop/mobil.

Nu se forțează trecerea la etapa următoare dacă datele nu permit raporturi istorice verificate. **Nu se execută merge, deploy sau editarea ACTUAL în această etapă.**

## 8. Gate de acceptare

- `npm test` inclusiv `tests/hist-module-0-interoperability.test.mjs`: ID-uri canonice, statut probatoriu, perioade și snapshoturi, multe-la-multe, perspective concurente, detectarea ciclurilor și a dublei paternități.
- `npm run build` pentru TypeScript/Vite.
- Înainte de orice UI: test de navigare între module, reset local/global, păstrarea limbii RO/EN și permalinks ACTUAL.
- Înainte de merge: validarea completă pe SHA-ul exact și protecțiile repository-ului, fără modificarea `public/data/phase4`.
