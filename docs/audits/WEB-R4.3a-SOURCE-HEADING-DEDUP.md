# WEB-R4.3a — eliminarea mențiunii redundante OSM-Boundaries

**Data:** 2026-11-07. **Bază:** `main` certificat WEB-R4.3, SHA `35235179fb1ffe18ed7d3d4659c7b07823f72f8d`.

## Cerință și implementare

Utilizatorul a cerut eliminarea mențiunii `OSM-Boundaries · 5 October 2026` / `OSM-Boundaries · 5 octombrie 2026` din **antetul panoului Administrativ** și **antetul fișei entității**, deoarece sursa și data apar deja în secțiunea `Geometrie și proveniență` / `Geometry & provenance`.

Modificarea este limitată la interfață:
- `src/App.tsx`: în `treePanel` și `details`, antetul conține numai `<h2>{t.tree}</h2>` / `<h2>{t.details}</h2>`; se elimină cele două traduceri `sourceSnapshot` devenite nefolosite.
- **Nicio modificare** a secțiunii `Geometrie și proveniență`: sursa `OSM-Boundaries` și data `2026-10-05` rămân afișate în metadatele fiecărei fișe, cu toate celelalte câmpuri, avertismente și linkuri OSM.
- `tests/web-r43a-source-heading-dedup.test.mjs` verifică în cod lipsa duplicării și păstrarea provenienței, inclusiv SHA-ul ACTUAL.
- `scripts/ci/browser-smoke.mjs` verifică antetele **RO/EN pe desktop și RO pe mobil (360px)**, sursa și data în secțiunea de proveniență, plus capturi Chromium.

## Porți de acceptare

1. **ACTUAL neschimbat**: catalog 4.283 entități, SHA256 gzip `1f930079194c92dc0e02d6e675165dddec6f49db0a62357bcc61be0705125482`, fără fișiere `data/` sau `public/data/` în PR.
2. Teste statice + TypeScript/Vite + Chromium complet pe SHA-ul exact al PR-ului, nu doar testele noi.
3. Integrare protejată și CI post-merge pe SHA-ul final, urmate de confirmarea `pages_build_version` în GitHub Pages și verificare externă de disponibilitate.
4. Fără extindere geografică, reproiectare, eliminare de proveniență, cleanup de branchuri sau alte modificări funcționale.

**Criteriu de acceptare:** informațiile se găsesc o singură dată în fișă, în `Geometrie și proveniență`; antetele modulelor și fișelor rămân compacte.
