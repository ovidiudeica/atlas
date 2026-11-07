# WEB-R4.1 — audit vizual înainte de implementare

Data: 2026-11-07. Bază protejată `main`: `74b05b9e7ada0d778148d4b013da24b2199f5107` (WEB-R4.0).

## Dovezi și metodă

Am recuperat și inspectat **capturile Chromium generate pe exact SHA-ul publicat** în [GitHub Actions #42413890728](https://github.com/ovidiudeica/atlas/actions/runs/42413890728), artefactul [browser-smoke-74b05b9e…](https://github.com/ovidiudeica/atlas/actions/runs/42413890728/artifacts/13590313489), 75 capturi. Același SHA are deployment Pages `SUCCESS` și pagina https://ovidiudeica.github.io/atlas/ disponibilă public.

Au fost inspectate explicit:
- `desktop-nistrenia-pmr-cadastral-card-en-32-all.png`: cardul Bender, identitate, cod PMR 32, sursă, avertisment, ierarhie și acțiuni.
- `mobile-360-detail-open.png`: drawer-ul de detalii al României la 360 px, export deschis, identitate, bară module mobil.
- `desktop-romania-bucharest-siruta-en.png`, `mobile-romania-bucharest-siruta.png`: arborele București, rolurile NUTS3/ADM4/ADM8, sectoarele.
- `desktop-chisinau-sectors-nested-en-all.png`, `mobile-chisinau-city-sectors-nested-ro.png`: arborele cu oraș și sectoare.
- `desktop-gagauzia-comrat-nested-en-all.png`, `mobile-gagauzia-raion-nested-ro.png`: subunitățile Găgăuziei.
- `desktop-east-distinct-stat-admin-en.png`, `mobile-east-distinct-stat-admin-ro.png`: NTS vs ADM distincte.
- `mobile-nistrenia-web-r318-cadastral-order-ro.png`: ordinea ramurii Nistrenia.

**Limitare explicită:** capturile automate acoperă multe situații din arbore, dar nu includ încă fișe deschise pentru toate rolurile. Auditul extern live al interacțiunilor a fost indisponibil fără un serviciu cu plată; nu s-a făcut nicio plată. Prin urmare, acest audit nu pretinde vizualizare manuală live independentă a fiecărui card. WEB-R4.1 va adăuga aserțiuni și capturi specifice fișelor după schimbări.

## Constatări

1. **P1 — Antet lung:** în captura desktop Bender, numele oficial `Sovetul orășenesc Bender` se comprimă pe lângă butonul de închidere; utilizăm numele scurt de prezentare în antet și păstrăm denumirea integrală în Identitate.
2. **P1 — Proveniența nivelurilor administrative:** cardul București nu enumeră separat baza OSM a ADM4 și baza SIRUTA a rolului ADM8. Avertismentul există, dar lipsește un tabel vizibil de roluri cu codurile originale distincte.
3. **P1 — Terminologia statistică:** `currentNode.statisticalRoles.map` afișează clasificatorul brut; sursa MD folosește `NUTS_MOLDOVA`, dar interfața publică convenită este `NTS`. Nu se modifică valorile sursă.
4. **P2 — Relații greu de navigat:** cardul arată separat părintele administrativ și părintele arborelui, dar fără acțiuni pentru deschiderea lor; codul `parentCode` statistic apare fără legătură clară la entitatea corespunzătoare.
5. **P2 — Mobile:** drawer-ul funcționează la 360 px, iar bara modulelor rămâne accesibilă; detaliile sunt lungi (identitatea poate ajunge sub exportul desfăcut). Prioritizăm identitatea și rolurile, păstrând exportul retractabil, fără panouri suplimentare.
6. **P1 — Verificare insuficientă:** CI nu are capturi orientate pe card pentru fiecare jurisdicție/tip; în WEB-R4.1 adăugăm verificări dedicate desktop/mobil pentru București, Chișinău, Găgăuzia, Nistrenia și entități statistice.

## Contract de remediere, fără modificări ACTUAL

- Antet cu nume scurt localizat; nume oficial complet întotdeauna disponibil.
- Secțiune administrativă cu roluri reale `OSM` și roluri de registru `SIRUTA` distincte; codul din registru nu se prezintă ca geometrie.
- Fiecare rol statistic: `NUTS` sau `NTS`, nivel, cod, versiune, `parentCode`, iar legătura către entitate părinte numai când aceasta există în catalog.
- Ierarhie administrativă, de arbore și statistică etichetate distinct.
- Nivel `adminLevel` numai din OSM, ID OSM gol dacă lipsește, avertismente PMR și juridice păstrate.
- Fără alterarea catalogului ACTUAL: 4.283 entități și SHA-256 gzip `1f930079194c92dc0e02d6e675165dddec6f49db0a62357bcc61be0705125482`.

Ordinea execuției: acest audit → cod de prezentare → teste/capturi → CI → PR protejat → audit Pages.
