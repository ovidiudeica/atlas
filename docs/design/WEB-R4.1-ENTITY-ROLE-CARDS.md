# WEB-R4.1 — fișe adaptate rolurilor teritoriale

Data: 2026-11-07. Domeniu: exclusiv interfață și teste, nu catalog/geometry.

## Dependență de audit

[Auditul vizual preimplementare](../audits/WEB-R4.1-PREIMPLEMENTATION-VISUAL-AUDIT.md)
este primul artefact din acest branch și examinează capturile Chromium ale
commitului WEB-R4.0 publicat. Problemele confirmate au fost abordate în această
ordine: antet, roluri, clasificatoare, relații, mobil, verificări.

## Implementare

- `src/data/entityCardRoles.mjs` este un adaptor pur, bazat pe
  `resolveTerritorialRoles`, fără să modifice entitățile certificate.
  Nivelul OSM rămâne un atribut numai al rolului cartografic.
- **Identitate**: antet cu numele scurt localizat; denumirea oficială integrală
  rămâne în secțiunea Identitate.
- **Administrativ**: enumerăm rolurile `ADM n` împreună cu baza `OSM`
  (geometrie reală) ori `SIRUTA` (rol de registru, fără geometrie separată).
  Registrul și codul părinte SIRUTA apar cu proveniența lor.
- **Statistic**: denumirea publică `NUTS n` sau `NTS n` conform schemei
  acceptate în Atlas; păstrăm nemodificată clasificarea de sursă
  `NUTS_MOLDOVA`, codurile, versiunile și `parentCode`.
- **Ierarhie**: trei relații distincte: administrativă, părinte de arbore
  (doar prezentare) și părinte statistic identificat prin
  `classification:parentCode`. Doar legături verificate și existente în
  catalog sunt navigabile; nu deducem subordonare juridică din geometrie.
  Indexul exclude codurile ambigue, fără alegere arbitrară.
- **Cartografic**: nivel OSM și ID relație OSM exclusiv din câmpurile reale;
  ID-ul lipsă rămâne gol, inclusiv Brețcu. Datele, sursa și avertismentul
  juridic rămân disponibile.
- **Nistrenia**: codurile cadastrale PMR descriu reședința, nu identitatea
  CUATM, KLADR sau geometria administrativă. Păstrăm avertismentul existent.
- **Mobil**: un permalink valid `?entity=…` deschide direct drawerul
  entității la lățimi de cel mult 700px, fără a crea altă entitate și fără a
  schimba geometriile vizibile.

## Scenarii obligatorii

1. România, ADM2 fără a inventa statistici; Republica Moldova, ADM2 și NTS1.
2. București: NUTS3, ADM4 real și rol SIRUTA ADM8 `179132`, fără geometrie
   secundară. Navigare la părintele statistic verificat.
3. Chișinău ADM4 NTS3 și orașul Chișinău ADM8: fișe și geometrii distincte.
4. Găgăuzia ADM4 + CUATM `9600`.
5. Bender ADM5 + PMR `32`, fără cod CUATM fabricat.
6. `stat-MD120` pur statistic NTS3 fără nivel administrativ OSM.
7. Brețcu, `siruta-u64096`, fără relație OSM fabricată.
8. RO/EN, desktop 1440px, mobil 360px, fără overflow orizontal; focus, drawer,
   butoane și export deja protejate de verificările anterioare.

## Acceptare

- `npm test` incl. audit exhaustiv read-only asupra celor 4.283 înregistrări,
  verificare checksum gzip
  `1f930079194c92dc0e02d6e675165dddec6f49db0a62357bcc61be0705125482`.
- `npm run build`.
- `scripts/ci/browser-smoke.mjs`: 9 fișe desktop și 3 fișe mobil,
  capturi WEB-R4.1 + verificări vizuale și semantice.
- PR separat pe SHA exact → integrare numai dacă toate gate-urile cerute trec
  → verificare Pages pe SHA-ul final și acces public.

Fără modificări ale fișierelor `data/`, `public/data/`, `ACTUAL`.
