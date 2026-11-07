# WEB-R3.15 — Nistrenia: orașele înaintea raioanelor, apoi sud → nord

**Data:** 2026-11-07. **Repository:** `ovidiudeica/atlas`. **Sursă:** OSM-Boundaries Moldova 2026-10-05. **Bază:** `main` `21532c25c1306349b88321d36164ef7012fd85ea`.

## Regula solicitată

Ordinea celor **7 copii direcți ADM5** ai Nistreniei (`osm-r65335`) este **fixă, după ID OSM**, și **identică în română și engleză**. Primele două poziții revin celor două consilii orășenești, apoi urmează cele cinci raioane în ordinea geografică **sud → nord**:

| Poziție | ID Atlas / OSM | RO | EN | Categorie |
|---|---|---|---|---|
| 1 | `osm-r1702219` / 1702219 | Tiraspol | Tiraspol | consiliu orășenesc; centrul administrației de facto |
| 2 | `osm-r944727` / 944727 | Bender | Bender | consiliu orășenesc |
| 3 | `osm-r1702218` / 1702218 | Slobozia | Slobdzeya | raion sudic |
| 4 | `osm-r1702214` / 1702214 | Grigoriopol | Grigoriopol | raion |
| 5 | `osm-r1702215` / 1702215 | Dubăsari | Dubossary | raion |
| 6 | `osm-r1702217` / 1702217 | Rîbnița | Rybnitsa | raion |
| 7 | `osm-r1702216` / 1702216 | Camenca | Kamenka | raion nordic |

**Nu** sortăm aceste șapte entități alfabetic (nici în RO, nici în EN). Tiraspol rămâne primul indiferent de limbă.

## Domeniu strict limitat

- Codul de prezentare `src/data/treeOrder.mjs` definește `NISTRIAN_CHILD_ORDER`, o listă fixă de exact șapte ID-uri, și compară pozițiile numai dacă `parentId==='osm-r65335'`. Pentru un eventual nou ID neprevăzut, există un fallback alfabetic; acesta nu modifică lista aprobată.
- `treeParentId`, `administrativeParentId`, nivelurile ADM5, denumirile în RO/EN și toate cele șapte ID-uri rămân **neschimbate**.
- Nu schimbăm `public/data/**`, `data/**`, geometrii OSMB, CUATM, catalogul certificat, exporturile și identificatorii.
- **Nistrenia** (`osm-r65335`, administrație de facto) este separată de **UATSN/ATULBD** (`osm-r2607033`, CUATM 9800), de municipiul Bender din cadrul CUATM (`osm-r9581354`, 0500) și de regiunea statistică **Transnistria** (`stat-MD120`).
- Nu introducem copii ADM8 dublați, niveluri intermediare sau schimbări de indentare. O eventuală prezentare paralelă a localităților Nistreniei se auditează distinct.

## Verificări obligatorii

1. Test `tests/nistrenia-fixed-order.test.mjs`: 7/7 ID-uri părinte–copil, ADM5, OSM, separare de UATSN/Transnistria, 4 combinații `all` / `administrative` × RO/EN, regresii Nord/Est/Chișinău/Găgăuzia și cele trei localități Căușeni.
2. Adaptarea regresiilor precedente `tests/md-regional-tree-order.test.mjs` și `tests/east-tree-order.test.mjs`, păstrând toate celelalte așteptări.
3. Test Chromium desktop în vederile `Toate` și `Administrativ` (EN), precum și în sertarul mobil (RO), cu dovezi vizuale.
4. CI complet reușit pe SHA exact, examinare capturi, integrare protejată, CI `main` și verificare GitHub Pages.

Aceasta este **o regulă geografică de prezentare**, nu o reclasificare juridică și nici o validare juridică a administrației de facto.
