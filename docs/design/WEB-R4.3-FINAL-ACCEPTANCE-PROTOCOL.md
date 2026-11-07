# WEB-R4.3 — protocol de certificare finală WEB-R4

**Bază:** `main` la `52850d006061e21e027c27bf3e57bd5308276bc8`, publicat și certificat la finalul WEB-R4.2. **Domeniu exclusiv:** finalizarea fișelor entităților. **Ordine:** [audit preliminar](../audits/WEB-R4.3-PREACCEPTANCE-AUDIT.md) → remediere contrast → testare integrată → PR protejat → CI/Pages pe SHA final.

## Matrice de acceptare

| Gate | Dovezi verificabile / scenarii | Condiție pentru ACCEPTAT |
|---|---|---|
| A — Semantica datelor | 4.283 entități, România 3.241, R. Moldova 1.042, SHA-256 gzip al catalogului; RO/MD/Nistrenia, Brețcu fără ID OSM | Nicio modificare `data/`, `public/data/`; codurile și rolurile nu sunt fabricate |
| B — Roluri / fișe | România ADM2, R. Moldova ADM2/NTS1, București NUTS3+ADM4 OSM+ADM8 SIRUTA, Chișinău ADM4/NTS3 vs oraș ADM8, Găgăuzia ADM4/NTS3, Bender PMR32, Transnistria NTS3 | Inventare și clasificatoare expuse distinct, sursa oficială vizibilă, niciun părinte legal inferat |
| C — Navigare / hartă | părinte/copil, breadcrumb, frați, afișare/ascundere geometrie, cameră, filtrele administrative și statistice | Navigarea doar în card păstrează starea hărții, selecția explicită și filtrele; testele de regresie anterioare rămân verzi |
| D — Export / partajare | GeoJSON detaliat, CSV metadate, permalink; simplificarea globală schimbă doar desenarea | Butoanele funcționează; identitatea geometriilor și datele-sursă rămân intacte |
| E — Accesibilitate verificabilă automat | RO/EN, nume accesibile, focus pe titlu, Escape, dialog modal și toolbar, contrastul textului normal >=4,5:1, focus >=3:1 | Testele și citirile `getComputedStyle` în Chromium trec în lățimi 1440/900/390/360; fără overflow |
| F — Integrare/publicare | PR în branch separat, SHA exact head, CI `SUCCESS`, merge protejat, Pages `pages_build_version` egal SHA-ul `main` final | Toate `SUCCESS`; pagina publică accesibilă; logul de deploy și URL-ul sunt arhivate |

Testarea vizuală este realizată cu capturile reale Chromium și verificarea manuală a unor capturi. **Limitare:** verificarea asistată și automatizată nu constituie audit manual exhaustiv cu NVDA/VoiceOver/TalkBack sau certificat universal WCAG 2.2 AA. Limita va rămâne explicită în verdict, indiferent de testele automate.

## Trasabilitate și ieșire

- `tests/web-r43-final-acceptance.test.mjs` consolidează identitatea teritorială, sursele, etichetele RO/EN, contrastele WCAG și indicatorii de focus.
- `scripts/ci/browser-smoke.mjs` extinde testele WEB-R4.1/4.2 cu un **audit de acceptare integrat** în Chromium: fișe RO/EN, administrativ/statistic, contrast măsurat după randare, toggle geometrie, export/acțiuni, tabletă și mobil.
- Corecție CSS exclusiv pentru textul secundar cu contrast insuficient și contururile de focus, cu culori `#4c6858`, `#496456`, `#946217` față de fundalurile deja existente.
- Documentația finală a certificării se consemnează în conversația PR împreună cu head SHA, merge SHA, job IDs, capturi și verdictul Pages.

**Modificările de date, extinderile teritoriale, noile module și cleanup-ul branchurilor sunt în afara WEB-R4.3.**
