# WEB-R3.11 — denumirea scurtă Chițcani (7 noiembrie 2026)

**Decizie aprobată:** în interfața română, entitatea administrativă `osm-r6879649` apare **Chițcani** în arbore, căutare, breadcrumbs și celelalte etichete care folosesc `shortTreeName`. Varianta engleză originală **Kitskany** nu se modifică.

## Proveniență și semantica identității

- Corpus cartografic certificat: OSM-Boundaries Moldova, instantaneu 2026-10-05.
- ID OSM / Atlas: `6879649` / `osm-r6879649`; nivel **ADM8**.
- În catalog, `name`, `shortName.ro`, `officialName` și `sourceTags['name:ro']` conțin `Sovetul sătesc Chițcani`. **Aceste date rămân neschimbate** și sunt vizibile în câmpul oficial / alias de căutare.
- În catalog `shortName.en` este `Kitskany`; rămâne neschimbat.
- Cod CUATM `7612`; părinte administrativ și de arbore `osm-r65343` (Căușeni), în concordanță cu identitatea teritorială recunoscută de Republica Moldova.
- OSMB păstrează separat eticheta și ierarhia administrației de facto. Raportul anterior `atlas-audit-cremenciug-gisca-chitcani-2026-11-07.md` documentează discrepanțele pentru Cremenciug, Gîsca și Chițcani; această intervenție nu le reclasifică.
- Numele scurt `Chițcani` este un **alias geografic de afișare**, nu o afirmație că numele oficial OSMB/CUATM a fost suprascris.

## Schimbare și regresii

- Modificăm numai funcția `shortTreeName` pentru ID-ul exact și limba `ro`.
- Testele de corpus confirmă eticheta română, varianta engleză `Kitskany`, identitatea și numele original, codul CUATM, părinții, nivelul și etichetele sursă.
- Testul Chromium confirmă că o căutare după `Sovetul sătesc Chițcani` continuă să identifice entitatea, cu eticheta scurtă RO/EN și cu numele original în `title`.
- Zero modificări în `public/data/**`, `data/**`, geometrii, hashuri, certificate, registre ori exporturi. Arborele Găgăuzia/Chișinău/Nistrenia și regulile Nord/Centru/Sud rămân nemodificate.

**Acceptare:** CI complet și Chromium pe SHA exact, inspectarea capturilor, integrare cu protecție SHA, urmată de CI `main` și GitHub Pages.
