# WEB-R4.0 — arhitectura modulară a cardurilor entităților

**Domeniu:** prezentare web, fără schimbări în datele canonice ACTUAL.  
**Bază:** `main` la `ca96970dbb21eeda4be7a1ef5df5462e18f6972c`.  
**Date certificate:** 4.283 entități; OSM-Boundaries, 5 octombrie 2026.

## Problemă

Fișa entității combina anterior identitatea, identificatorii OSM, registrele
administrative, codurile statistice, două relații de părinte, sursele și registrele
brute într-o singură listă `<dl>`. Această structură amesteca domenii probatorii
diferite și îngreuna citirea pe desktop și mobil.

## Soluție: secțiuni independente, o singură entitate

`EntityCardSection` din `src/components/EntityCardSection.tsx` oferă un container
reutilizabil, semantic și accesibil, fără cunoașterea clasificatoarelor sau a
stării hărții. `App.tsx` rămâne proprietarul selecției, vizibilității, navigării,
încadrării, exportului, permalinks și prezentării în sidebar/drawer. Un singur
conținut al fișei este folosit pe desktop și pe mobil; nu se dublează sursele.

| Secțiune | Conținut | Afișare |
| --- | --- | --- |
| Identitate | numele oficial, țara | întotdeauna |
| Administrativ și registru | cod SIRUTA/CUATM real, eventual cod cadastral PMR pentru reședință, avertismente de interpretare | numai dacă există rol/înregistrare relevantă |
| Roluri statistice | fiecare rol NUTS/NTS, nivel, cod, versiune și cod părinte statistic | numai dacă există roluri statistice |
| Ierarhie teritorială | părinte administrativ și/sau părinte de prezentare din arbore | când există referințe |
| Geometrie și proveniență | nivel OSM efectiv, ID relație OSM (poate fi gol), sursă și dată, avertismentul juridic | întotdeauna |
| Înregistrări originale | fișa integrală din registru și tagurile OSM, separat expandabile | secțiune retractabilă, implicit închisă |

Navigarea prin breadcrumbs și frați, afișarea/ascunderea geometriei, încadrarea,
exportul și copierea legăturii rămân în zona comenzilor fișei. Schimbarea
entității reinițializează doar expandarea înregistrărilor, nu vizibilitatea
geometriilor ori selecția teritorială.

## Reguli de integritate semantică

1. `adminLevel` și `osmRelationId` reprezintă numai domeniul cartografic OSM.
   Niciun rol statistic sau SIRUTA nu produce alt contur.
2. București rămâne o singură entitate: ADM 4 este nivelul OSM real, iar ADM 8
   este rolul municipal SIRUTA `179132`; precizarea apare în fișă.
3. Municipiul Chișinău (ADM 4) și orașul Chișinău (ADM 8) rămân identități
   distincte, cu geometrii distincte.
4. Codurile cadastrale PMR 32–66 sunt asociate reședințelor celor șapte unități,
   nu se redenumesc CUATM/KLADR și păstrează sursa și avertismentul.
5. Un ID OSM lipsă rămâne gol: nu fabricăm un identificator pentru Brețcu sau
   alte înregistrări reconstruite în catalog.
6. Părintele statistic este cod din clasificator, distinct de
   `administrativeParentId` și `treeParentId`; se afișează doar ca atare.
7. Sursa și avertismentul despre limitele necertificate juridic rămân vizibile,
   chiar când înregistrările brute sunt închise.

## Gate de acceptare

- `npm test`: contracte existente și testele `WEB-R4.0` (inclusiv SHA-256
  nealterat pentru `public/data/phase4/catalog.json.gz`).
- `npm run build`: TypeScript + Vite.
- Chromium desktop/mobil: aceeași fișă, controale și panouri funcționale.
- PR separat și integrare protejată pe SHA exact; audit GitHub Pages după merge.

**Excluderi:** nu refacem arborele, nu importăm clasificatoare, nu schimbăm
geometrii, nu extindem modelul canonic și nu începem celelalte etape WEB-R4.
