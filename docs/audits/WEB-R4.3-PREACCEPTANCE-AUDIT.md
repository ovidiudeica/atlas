# WEB-R4.3 — auditul de acceptare al fișelor, înainte de remediere

**Data auditului:** 2026-11-07. **Bază publicată:** `main` protejat la `52850d006061e21e027c27bf3e57bd5308276bc8`, [CI/Pages #42421252650](https://github.com/ovidiudeica/atlas/actions/runs/42421252650) `SUCCESS`. **Scop:** închiderea WEB-R4.0–R4.2; fără extinderea atlasului.

## Dovezi consultate

- Capturile Chromium ale buildului publicat, artefactul [browser-smoke-52850d006061e21e027c27bf3e57bd5308276bc8](https://github.com/ovidiudeica/atlas/actions/runs/42421252650/artifacts/13594180703): fișa București cu copii, Chișinău cu paginare, mobil București cu toolbar sticky, mobil Sector 1 cu focus restaurat, plus fișele de rol RO/MD/Nistrenia/Găgăuzia.
- Suitele existente: `tests/web-r40-entity-card-architecture.test.mjs`, `tests/web-r41-entity-role-cards.test.mjs`, `tests/web-r42-entity-card-ux-a11y.test.mjs`, `tests/web-r42-focus-restoration.test.mjs`, `scripts/ci/browser-smoke.mjs` — verificări de navigare, focus, arbore/filtre, export/permalink, desktop/tabletă/mobil RO/EN.
- Codul de prezentare al fișelor `src/App.tsx` și `src/styles.css`, semantica `src/data/entityCardRoles.mjs`, `src/data/treeOverlay.mjs`. Semnificația relațiilor **administrative/statistice/de prezentare** nu se schimbă.
- Testarea manuală cu cititoare de ecran reale nu a fost posibilă aici. Nu se declară conformitate WCAG integrală pe baza testelor automate; observațiile de mai jos sunt verificări concrete WCAG 2.2 AA.

## Rezultatul auditului: probleme demonstrabile și remedieri permise

| Prioritate | Caz | Observație măsurabilă | Intervenție |
|---|---|---|---|
| P1 | `.entity-child-link>small`, 10px, `#668174` pe `#f9fcf9` | Contrast aproximativ **4,1:1**, sub **4,5:1** pentru text normal (WCAG 1.4.3 AA). Etichetele de nivel sunt greu lizibile pe mobil. | Închidere cromatică a etichetei fără schimbarea ierarhiei sau a textului. |
| P1 | `.entity-statistical-roles small`, 11px, `#607b6a` pe `#f8fbf9` | Contrast aproximativ **4,44:1**, tot sub **4,5:1** pentru text normal. | Color token cu contrast suficient și test automat. |
| P1 | `.entity-parent-link:focus-visible` / `.entity-card .entity-title h3:focus`, contur `#e6a73d` pe alb | Contrast aproximativ **2,1:1**, sub ținta de **3:1** folosită pentru delimitarea stărilor de focus/non-text. | Contur de focus mai închis; păstrarea grosimii 3px și a `outline-offset`. |
| P2 | Certificare transversală | Verificările WEB-R4.1–R4.2 acoperă cazurile individuale; nu există încă un **registru unic WEB-R4.3** care să verifice RO/EN, rolurile, accesibilitatea, stabilitatea selecției și integritatea ACTUAL înainte de închiderea etapei. | Suită finală de acceptare și raport per gate cu capturi, fără noi funcții. |

## Teste de regresie cerute

1. Fișe RO/MD cu entități doar administrative, doar statistice și multirol: România, Moldova, București (ADM4 OSM + ADM8 SIRUTA), Chișinău municipiu/oraș, Găgăuzia, Bender/PMR și Transnistria statistică.
2. Ierarhie: breadcrumbs, frați, părinți administrație/arbore/statistic și copii ordonați; focus la titlu și la copilul nou după extindere.
3. Filtre/contururi: o singură geometrie pentru roluri multiple; selectarea unei entități nu schimbă implicit selecția filtrelor, vizibilitatea sau camera.
4. Export: GeoJSON detaliat, CSV cu metadate și permalink, inclusiv în modul simplificat; registrul brut rămâne retractabil.
5. Accesibilitate: elemente etichetate, dialog modal cu numele entității, închidere prin Escape, focus inițial/retur, contrastul textului și focusului, absența overflow-ului orizontal în viewport 1440/900/390/360.
6. CI post-merge și `pages_build_version` pe SHA-ul exact integrat.

## Restricții și criterii de ieșire

Nu se modifică niciun fișier `public/data/` sau `data/`; catalogul rămâne la **4.283 de entități**, SHA-256 gzip `1f930079194c92dc0e02d6e675165dddec6f49db0a62357bcc61be0705125482`. Nu se modifică geometriile, ID-urile OSM, clasficatoarele/codurile, relațiile canonice sau ierarhia de prezentare. Corecții exclusiv în CSS și testele/dovezile de acceptare. Nu efectuăm plăți, nu cerem Codex, nu curățăm branchurile.

**Verdict inițial:** WEB-R4.3 *deschis*; remediem contrastele P1, apoi certificăm automat și vizual buildul și Pages. Un eventual `FAILURE` CI sau Pages blochează închiderea.
