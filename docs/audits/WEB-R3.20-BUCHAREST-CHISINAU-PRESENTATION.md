# WEB-R3.20 — București și Chișinău: indentare și identități

Contract pentru prezentarea arborelui; catalogul ACTUAL OSMB 2026-10-05 (4.283 entități) rămâne nemodificat.

## București

Nod unic `osm-r377733`, relație OSM `377733`, **ADM4 OSM**, NUTS3 RO321, SIRUTA `403`. Înregistrarea municipală SIRUTA `179132` este un **rol administrativ național** distinct de nivelul geometriei; nu produce un ADM8 OSM sintetic. Cele șase sectoare OSM ADM9 sunt deja copiii direcți canonici ai Bucureștiului, `administrativeParentId` și `treeParentId` identice. WEB-R3.19b le ordonează numeric după SIRUTA: Sector 1–6; WEB-R3.20 certifică această structură.

## Chișinău

- Municipiul `osm-r1691801` — ADM4 OSM, nod teritorial principal.
- Orașul `osm-r1748490` — ADM8 OSM real, **entitate și geometrie distincte**, primul copil de prezentare al municipiului. În loc de repetarea «Chișinău → Chișinău», rândul său din arbore este «Chișinău → Oraș» în RO, «Chișinău → City» în EN.
- În căutare, intrarea ADM8 este explicit «Orașul Chișinău» / «Chișinău city», iar numele original `Chișinău` și numele oficial rămân în indexul de căutare. Pentru cititoarele de ecran, rândul este «Orașul Chișinău» / «City of Chișinău». Selectarea, geometria, cardul și exportul entității ADM8 rămân disponibile.
- Cinci sectoare ADM7 apar vizual sub orașul ADM8, cu ordonare CUATM; **părintele administrativ canonic** al fiecărui sector rămâne municipiul ADM4. Celelalte 18 localități ADM8 rămân copiii municipiului. Acesta este un overlay de prezentare, nu o mutare juridică.
- Nistrenia/Găgăuzia își păstrează ordonarea și identificatorii.

## Gate

Teste: `tests/web-r320-capital-presentation.test.mjs`, `tests/gagauzia-chisinau-order.test.mjs`, `tests/tree-name-corpus.test.mjs`, Chromium desktop/mobil și întregul CI. Verificăm cardinalități, identități, relații canonice, niveluri OSM, coduri și accesibilitatea operațiilor. Nicio editare în `data/**` sau `public/data/**`.
