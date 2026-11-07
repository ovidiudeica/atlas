# WEB-R4.2 — interacțiune cu fișele și acceptare de accesibilitate

**Bază:** `main` WEB-R4.1 la `637493464c16af9c7e747b8d16aeb6071f0e1d86`. **Domeniu:** prezentare web exclusivă.

## Poarta de audit precedentă

WEB-R4.2 a început numai după [auditul UX și de accesibilitate](../audits/WEB-R4.2-PREIMPLEMENTATION-UX-A11Y-AUDIT.md), bazat pe cele 90 de capturi Chromium ale versiunii efectiv publicate. Scopul este eliminarea problemelor demonstrate, nu reproiectarea datelor.

## Reguli de interacțiune

1. **Un singur card, context păstrat:** selectarea din card a unui copil, a unui părinte, a unui breadcrumb sau a unui frate schimbă `selected`, deschide fișa și închide uneltele suprapuse. Nu modifică `visible`, filtrele, nivelurile OSM, geometriile ori camera; încadrarea hărții rămâne o acțiune explicită.
2. **Subunități ale arborelui activ:** copiii provin numai din `hierarchy` deja calculat de `createHierarchy(catalog,treeView,lang)`. Sunt păstrați ordinea, numele scurt și rolurile. Această ierarhie este de **prezentare**; nu reparentează legal ori canonic Chișinău/Găgăuzia, nu deduce relații din suprapuneri.
3. **Paginare vizuală:** se arată primele 12 subunități, butonul `Afișează încă 12` le adaugă progresiv, fără a încărca instant liste foarte lungi. La extindere, focusul se mută la prima subunitate nou afișată.
4. **Focus la selecție:** numai navigarea inițiată din card folosește `chooseRelated`. Aceasta păstrează semantica `choose`, apoi afișează noul card de la început și focalizează titlul. Alegerea obișnuită din hartă/arbore nu primește mutări artificiale ale focusului.
5. **Panouri accesibile:** închiderea prin buton sau Escape reîntoarce focusul la acțiunea care poate redeschide panoul. Bara de închidere mobilă/desktop este un rând distinct, `sticky`, fără flotare peste coduri; dialogul are etichetă accesibilă cu numele entității.
6. **Lizibilitate:** textul secundar este mărit la 11–12px, focusurile de tastatură sunt evidente, iar datele statistice nu sunt dublate în `dl` și în lista fiecărui rol.
7. **Date și acces:** identitatea oficială, rolurile OSM/SIRUTA/NUTS/NTS, părinții verificați, data sursei, avertismentele PMR/juridice, exportul, permalinks și detaliile brute retractabile rămân funcționale.

## Teste de acceptare

- Test nou `tests/web-r42-entity-card-ux-a11y.test.mjs`: catalog gzip SHA-256, 4.283 entități, șase sectoare București în ierarhia de prezentare, clasă de copii, focus/scroll, butoane de închidere și proveniență.
- Browser smoke Chromium extins: 1440×900 și 360×780, deschidere directă a Bucureștiului, trecere la copil și înapoi prin breadcrumb, verificarea focusului și a contorului geometriilor vizibile, închidere cu restaurarea focusului, controlul barei lipite la scroll mobil, paginare Chișinău cu focus pe primul copil nou, capturi pre/post.
- Reexecuția tuturor testelor istorice și a scenariilor 900/390 deja păstrate în script.
- Gate-ul GitHub: SHA exact, CI integral `SUCCESS`, merge protejat fără forțare, verificarea publicării Pages pe SHA-ul rezultat.

### Integritatea ACTUAL

**Nu** se ating `data/`, `public/data/`, `src/data/territoryRoles.mjs` sau alte surse canonice. Catalogul are în continuare **4.283 entități**, SHA-256 `1f930079194c92dc0e02d6e675165dddec6f49db0a62357bcc61be0705125482`. Nu fabricăm ID OSM, cod CUATM/KLADR sau geometrii.
