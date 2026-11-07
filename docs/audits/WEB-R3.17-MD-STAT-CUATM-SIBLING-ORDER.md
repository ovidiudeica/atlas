# WEB-R3.17 — Sortare exclusiv Republica Moldova, pe coduri statistice și CUATM

**Data:** 2026-11-07. **Bază:** `main` `7f7e07f8a7bf0be07c44718426e71cbfb9072b6a`. **Sursă:** catalogul certificat OSM-Boundaries Moldova 2026-10-05.

## Regula acceptată

Pentru fiecare **pereche de copii ai aceluiași părinte** aparținând Republicii Moldova:

1. Entitatea cu cod statistic se sortează după `statisticalRoles[0].code` (ex. `MD111`), chiar dacă are simultan rol administrativ și cod CUATM.
2. Dacă două entități au același cod statistic, se departajează după codul CUATM, atunci când este disponibil.
3. Entitatea exclusiv administrativă cu cod `registry.system==='CUATM'` se sortează după `registry.code`, în ordine crescătoare, lexicografică pe codul de patru cifre (cu zerouri inițiale păstrate).
4. Entitățile codificate preced entitățile fără cod aplicabil; identitățile cu același cod se departajează stabil după ID-ul Atlas.
5. **Dacă ambele entități nu au nici cod statistic, nici cod CUATM, ordinea rămâne cea aprobată anterior** (inclusiv ordinea fixă Nistrenia și cele trei raioane ADM5 Găgăuzia). Nu sunt inventate coduri.
6. Comparatorul se aplică numai dacă **ambii copii sunt MD**. Ordinea României rămâne neschimbată.

Sortarea operează numai între **frați**, niciodată prin mutarea unui copil în altă ramură. Nu se schimbă `treeParentId`, `administrativeParentId`, geometria, codurile, identitățile, exporturile sau datele `public/data/**`.

## Exemple verificate în catalog

- `West/Vest`: Nord **MD111**, Centru **MD112**, Sud **MD113**, Găgăuzia **MD114 / CUATM 9600**, Chișinău **MD115 / CUATM 0100**. Codul statistic primează asupra CUATM chiar la ultimele două entități.
- `Transnistria MD120`: Bender **0500** precede UATSN/ATULBD **9800**.
- `Nord MD111`: primul ADM4 este Bălți **0300**; `Centru MD112`: primul ADM4 este Anenii Noi **1000**; `Sud MD113`: primul ADM4 este Basarabeasca **1200**.
- `Bălți ADM4`: Elizaveta **0301**, Sadovoe **4839**, apoi orașul Bălți **fără CUATM** în catalog. Faptul că acesta este reședința municipiului nu prevalează asupra codului.
- `Chișinău ADM4`: orașul Chișinău **0100** rămâne primul; ceilalți copii sunt în ordine CUATM. Sub oraș (overlay cartografic), sectoarele codificate sunt Botanica **0110**, Buiucani **0120**, Ciocana **0140**, Rîșcani **0150**, apoi Centru **fără cod** în catalog.
- `Găgăuzia`: cele trei raioane ADM5 nu au cod CUATM în catalog, astfel că ordinea lor aprobată este păstrată (Comrat, Ceadîr-Lunga, Vulcănești). Copiii ADM8 codificați sunt sortați numeric în fiecare raion, fără schimbarea parentajului canonic.
- `Nistrenia ADM3`: cele cinci raioane și cele două consilii orășenești ADM5 nu au coduri CUATM; rămâne ordinea fixă aprobată Tiraspol, Bender, Slobozia, Grigoriopol, Dubăsari, Rîbnița, Camenca.
- `Dubăsari ADM4 CUATM 3800`: Cocieri **3810** precede reședința de consiliu Coșnița **3818**. Nu reinterpretăm calitatea de reședință în funcție de cod.
- `UATSN ADM4`: 79 copii ADM8 în ordine CUATM; cele două nume Hlinaia au coduri **5029** și **7625** și nu mai sunt neapărat alăturate.

## Inventar și riscuri documentate

Din cele **1.042** entități MD ale catalogului: **1.036** au rol administrativ; **1.022** au cod CUATM; **9** au rol statistic; **14** entități administrative nu au cod CUATM. Cele 14 includ rădăcina Moldova, Nistrenia și cele șapte subdiviziuni ale sale, cele trei raioane ADM5 Găgăuzia, orașul Bălți ADM8 și sectorul Centru ADM7. Patru părinți au copii cu coduri CUATM colizionale în catalog (`1050`, `7160`, `3417`, `8034`); ordonarea nu le reinterpretează identitatea și folosește ID-ul pentru departajare.

Codurile CUATM nu sunt analizate ca prefixe de parentaj: toate relațiile rămân cele certificate.

## Validare și gate

- Test dedicat `tests/md-code-sibling-order.test.mjs`: toate familiile de frați MD din `all`/`administrative`/`statistical`, RO/EN, precendența statistică, coliziuni CUATM, entități fără cod, Nistrenia fără cod și **non-regresie România**.
- Aserțiunile istorice privind „reședința prima”, sortarea alfabetică, West/Est și cele două Hlinaia sunt actualizate doar în teste; nu sunt păstrate ca cerințe contradictorii.
- Chromium desktop/mobil trebuie să confirme ordinea reală afișată (inclusiv separarea Hlinaia în capturi individuale), build și CI pe SHA exact.
- Merge protejat și certificare GitHub Pages numai după checks SUCCESS. Ulterior se evaluează separat adaptarea regulii pentru România.

**Statut:** implementarea și auditul sunt limitate la prezentare; acceptarea finală depinde de CI și verificările publicării.
