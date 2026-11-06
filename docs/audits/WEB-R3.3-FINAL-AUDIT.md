# WEB-R3.3 — Auditul final al interfeței „Harta în prim-plan”

**Stadiu:** **CERTIFICAT ȘI ÎNCHIS — WEB-R3.3** (2026-11-06); codul de interfață este integrat și publicat, iar verificările de după integrare sunt reușite.  
**Data:** 2026-11-06  
**Repository:** `ovidiudeica/atlas`  
**Bază:** `main` după WEB-R3.2, commit `410f380ba32f1b46ac6c549f5867d6d09f5da724`.

## Domeniu și interdicții

Auditul final verifică implementarea acceptată în WEB-R3.0, introdusă în WEB-R3.1 și WEB-R3.2: harta în prim-plan, panouri ale modulelor și detaliilor la cerere, comenzi cartografice compacte, filtre, exporturi și accesibilitate.

**Nu se schimbă** fișierele `data/`, `public/data/`, geometriile canonice detaliate și simplificate, setul OSMB 2026-10-05, registrul surselor, codurile SIRUTA/CUATM sau cele 4.283 de identități.

## Criterii obligatorii de certificare

| Criteriu | Probă automată / vizuală | Stadiu |
| --- | --- | --- |
| Harta domină interfața desktop la 1440 px | canvas utilizabil > 1.300 px, panourile inițial închise | **REUȘIT** — Chromium 85c1cb3f |
| Doar 3 comenzi permanente pe hartă | zoom +, zoom −, Acasă; atribuirea OSM și scara rămân | **REUȘIT** — Chromium 85c1cb3f |
| Panouri de module retractabile | click, click repetat, schimbare modul, X și Escape | **REUȘIT** — Chromium 85c1cb3f |
| Detalii numai la selecția entității | selecție, închidere/reopen, stare de geometrie păstrată | **REUȘIT** — Chromium 85c1cb3f |
| Setări și acțiuni secundare accesibile | fundal, simplificare, încadrare, resetare, informații și legendă | **REUȘIT** — Chromium 85c1cb3f |
| Export valid și identitate de sursă fidelă | GeoJSON detaliat Brețcu cu OSM ID gol și CSV, URL/permalink | **REUȘIT** — Chromium 85c1cb3f |
| Filtru ADM/NUTS/NTS păstrat | țări în ordinea RO–MD, combinare și vizibilitate fără dublare | **REUȘIT** — Chromium 85c1cb3f |
| Tabletă 900 px | un singur panou overlay, zoom fără suprapuneri | **REUȘIT** — browser + capturi |
| Mobil 390 și 360 px | fără scroll orizontal, trei butoane hartă, module jos | CI + captură |
| Tastatură | Escape închide și întoarce focusul, drawer modal captează Tab | **REUȘIT** — Chromium 85c1cb3f |
| Zone tactile | minimum 44×44 px pentru zoom, X, Detalii, acțiuni principale | CI + captură |
| Date canonice intacte | PR-ul conține exclusiv `src/`, `scripts/ci/`, `docs/` | **REUȘIT** — PR #22 |
| Integrare și publicare | SHA exact, protecție main, GitHub Pages SUCCESS, HTTP 200 asset | **REUȘIT** — SHA `ad3ecb54` |

## Neconformități identificate și tratate

În urma examinării mecanismului WEB-R3.2, navigarea de tastatură în dialogurile mobile nu limita Tab la interiorul panoului, iar focusul putea rămâne într-un element demontat după închidere. Se adaugă un trap Tab în dialogul mobil și revenirea focusului la iconul modulului, respectiv la butonul Detalii. Controalele compacte sunt aduse la un minim de 44 px pentru utilizare tactilă.

Nu se relaxează niciun test și nu se modifică rezultatele anterioare pentru a simula un succes.

## Dovezi pre-merge verificate

- **PR:** [#22](https://github.com/ovidiudeica/atlas/pull/22), modificări exclusiv în codul de interfață, CSS, browser QA și documentație; fără modificări ale datelor certificate.
- **Commit de cod testat:** `85c1cb3ffb5acb2ac275da146a15321288b07a7a`.
- **GitHub Actions:** [rularea 42311228416](https://github.com/ovidiudeica/atlas/actions/runs/42311228416), `Build and verify website: SUCCESS`.
- **Teste:** 57/57 reușite, 0 eșecuri; TypeScript și build Vite reușite; smoke Chromium end-to-end reușit pe 1440 desktop, 900 tabletă, 390 și 360 mobil.
- **Artefact:** `browser-smoke-85c1cb3ffb5acb2ac275da146a15321288b07a7a`, incluzând capturile `desktop-initial.png`, `tablet-detail-open.png`, `mobile-initial.png`, `mobile-360-initial.png`, `mobile-360-drawer-open.png` și `mobile-360-detail-open.png`.
- **Funcții verificate:** zoom/Acasă fără butoane secundare, atribuirea OSM și scara, arbori și module retractabile, Filtre ADM/NUTS/NTS, selecții și resetare geometrie, GeoJSON/CSV și link permanent, focus Escape, Tab modal și restaurare focus.
- **Constatări UX rezolvate:** elementele din accordion închis nu mai participă la ordinea Tab; butonul Info utilizează un marcaj CSS stabil pe fonturi mobile; zonele tactile relevante sunt cel puțin 44 px.

## Verdict provizoriu pentru integrare

**ADMIS PENTRU INTEGRARE PROTEJATĂ**, condiționat de rerularea obligatorie a CI după actualizarea prezentului registru, verificarea exactă a SHA-ului PR și integrarea numai dacă toate verificările sunt reușite.

## Închiderea post-merge și verdictul definitiv

- **PR integrat:** [#22](https://github.com/ovidiudeica/atlas/pull/22) cu `squash` și protecție SHA exact asupra sursei `d5afa7811e0e00dc900548c5944a46c3ec6013c4`.
- **Commit integrat pe `main`:** `ad3ecb543120ac44e4c9ace7ad7edce54962ed67`. Branch-ul `main` a rămas protejat.
- **CI post-merge:** [rularea 42311740037](https://github.com/ovidiudeica/atlas/actions/runs/42311740037), `Build and verify website = SUCCESS`, `Deploy GitHub Pages = SUCCESS`, pe SHA-ul integrat.
- **Website public:** `https://ovidiudeica.github.io/atlas/` — HTML HTTP 200. Bundle JavaScript `assets/index-khcHqypU.js` și foaia CSS `assets/index-Bz1K9Neh.css` au răspuns HTTP 200.
- **Inspecția artefactelor publice:** prezente textele `Instrumente hartă`, `Niveluri administrative și statistice`, `Geometrii din sursa originală`, marcajul accesibil `detail-info-glyph` în JavaScript/CSS; vechea clasă de acțiuni suprapuse `map-quick-actions` nu mai apare în bundle.
- **Capturi finale inspectate:** `desktop-initial.png` demonstrează harta fără benzi de butoane secundare, `mobile-360-initial.png` arată toolbarul cu numai trei iconițe, `mobile-360-drawer-open.png` arată accesul la Filtre și Instrumente hartă, `mobile-360-detail-open.png` arată panoul Detalii și exportul GeoJSON/CSV/link, cu iconul de informație corect randat.
- **Arhivare:** branch-ul de implementare/audit `audit/web-r3-3-final-ux-acceptance` a fost păstrat sub tagul `archive/2026-11-06/web-r3-3-final-ux-acceptance` (SHA sursă original verificat) și eliminat după integrare.
- **Integritatea datelor:** nu au fost modificate cele 4.283 de înregistrări certificate, geometria detaliată/simplificată, codurile SIRUTA/CUATM, clasificările statistice, proveniența OSMB sau deciziile privind excepțiile.

**Verdict definitiv: WEB-R3.3 ACCEPTAT / ÎNCHIS.** Nu există blocante de interfață identificate de matricea de acceptare. Auditul este unul de funcționalitate, randare și accesibilitate testată, nu o certificare juridică a contururilor ori un audit complet WCAG realizat de un terț.

**Notă de arhivă:** acest commit de închidere modifică numai registrul documentar. Integrarea lui nu schimbă codul certificat de la `ad3ecb54`; propriile controale CI și Pages sunt urmărite separat pe commitul ulterior de documentație.


