# WEB-R3.19b — ordine de prezentare România

Implementare: `src/data/treeOrder.mjs`, comparatorul `compareRomaniaSiblingCodes()`. Se aplică **numai** când ambii copii sunt din România și numai în interiorul grupului de frați calculat de `presentationParentId()`. Nu modifică `administrativeParentId`, `treeParentId`, identificatorii, clasificatorii sau geometriile canonice.

## Regula

1. Codurile NUTS au prioritate; NUTS1, NUTS2 și NUTS3 sunt ordonate crescător în cadrul propriilor grupuri de frați, independent de limbă.
2. Un județ cu NUTS3 precedă conform codului NUTS3 chiar dacă ordinea SIRUTA diferă, în special în RO31 (Sud-Muntenia) și RO32 (București–Ilfov). București RO321 precedă Ilfov RO322.
3. Pentru frații fără rol NUTS, codurile SIRUTA sunt comparate **numeric**, nu lexicografic și nici prin ID OSM. Codurile valide preced lipsurile.
4. La egalitate de coduri se folosesc în ordine celelalte coduri relevante și ID-ul stabil Atlas; frații complet fără cod continuă să urmeze ordinea de prezentare acceptată.
5. Comparația statistică nu stabilește administrare juridică; nu modifică rolul municipal SIRUTA `179132` și nici nivelul OSM al Bucureștiului (ADM4).

## Acoperire automată

`tests/ro-code-sibling-order.test.mjs` verifică distribuția 4/8/42 NUTS1/NUTS2/NUTS3, RO31/RO32, numericul SIRUTA, comparația fraților pe toate cele trei vederi și ambele limbi, precum și Nistrenia. Testul vechi «România neschimbată» din `md-code-sibling-order.test.mjs` a fost înlocuit cu noua aserțiune; restul testelor Republicii Moldova se păstrează.

**Gate:** testele Node, build Vite/TypeScript, Chromium desktop/mobil și verificarea SHA exact + CI post-merge / GitHub Pages. Nicio modificare în `public/data/**` sau `data/**`.
