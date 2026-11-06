# WEB-R3.3 — Auditul final al interfeței „Harta în prim-plan”

**Stadiu:** verificări pre-merge satisfăcute; integrarea protejată și auditul GitHub Pages rămân condițiile finale de închidere.  
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
| Integrare și publicare | SHA exact, protecție main, GitHub Pages SUCCESS, HTTP 200 asset | **În așteptare** — post-merge |

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

**Închiderea definitivă se face numai după confirmarea explicită a GitHub Pages pe commitul integrat**, verificarea HTTP a website-ului și arhivarea branch-ului de audit. Raportul post-merge va documenta separat aceste dovezi, fără a modifica această concluzie pre-merge.

