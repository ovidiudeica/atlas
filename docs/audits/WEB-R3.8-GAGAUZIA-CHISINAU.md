# WEB-R3.8 — Găgăuzia și Chișinău: ordonarea copiilor

Data: 7 noiembrie 2026. Corpus certificat: 4.283 entități (OSMB 2026-10-05).

- **Găgăuzia** (`osm-r1699032`, ADM 4): 29 copii direcți,
  trei raioane ADM 5 (Ceadîr-Lunga, Comrat, Vulcănești),
  apoi 26 unități locale ADM 8.
- **Chișinău** (`osm-r1691801`, ADM 4): 24 copii direcți,
  cinci sectoare ADM 7 (Botanica, Buiucani, Centru, Ciocana, Rîșcani),
  apoi 19 unități locale ADM 8.
- Fiecare grup este ordonat alfabetic după denumirea scurtă, separat
  pentru limba română și engleză; egalitățile se dezambiguizează stabil după ID.
- În arbore, sufixul englezesc redundant `Sector` se elimină:
  `Buiucani Sector` → `Buiucani`, `Rîșcani Sector` → `Rîșcani`.
  Câmpurile `shortName` și `officialName` din sursă rămân intacte.
- Raionul și municipiul Comrat, Ceadîr-Lunga ori Vulcănești rămân
  două unități distincte, cu niveluri ADM 5 și ADM 8 indicate în arbore.
- Comparația se aplică exclusiv copiilor direcți ai acestor doi părinți
  în modurile `all` și `administrative`. Modul `statistical` și
  ceilalți părinți își păstrează comportamentul.
- Nicio schimbare a geometriilor, codurilor, identităților ori relațiilor
  administrative/statistice.

Acceptare condiționată de testul exhaustiv al denumirilor în ambele limbi,
verificările de ordine pe corpus și auditul vizual Chromium desktop/mobil.
