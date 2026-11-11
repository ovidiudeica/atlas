# HIST-0.4c — Completare cartografică de proveniență (11 noiembrie 2026)

**Bază:** `main@10aff6f8c46c6a93c89f9a540953e3c881b85f01` (HIST-0.4c PR #92 și #93 deja integrate). **Această completare este append-only și NU substituie dosarele originale.**

## Verdict

Au fost identificate suplimentar **7 repere bibliografice/cartografice cu identificatori sau instituții de proveniență**, dintre care unele sunt hărți istorice datate, iar altele cataloage sau transcrieri ulterioare ale manuscriselor. Identificarea unui obiect cartografic ori a reproducerii sale în catalog nu echivalează cu examinarea originalului, georeferențierea, verificarea fiecărui `way` OHM sau certificarea juridico-geometrică.

**P0=3, P1=25, P2=9 rămân nemodificate. 37/37 cercetate documentar; 0/37 geometrii istorice certificate; 0/37 admise la import.**

## P0: cartografie și documente mai apropiate de intervalele analizate

| Caz | Reper suplimentar și identificator | Rezultat / limită |
|---|---|---|
| Transilvania, OHM [2747433](https://www.openhistoricalmap.org/relation/2747433), 1711–1732 | **Johann Baptist Homann, Harta Principatului Transilvaniei (Nürnberg, 1717)**, Muzeul Național Brukenthal **MNB XV/633**. [Catalog instituțional](https://www.brukenthalmuseum.ro/pdf/catalog%20secvente%20ro%20eng.pdf); **Matthäus Seutter, Transylvaniae, Moldaviae, Walachiae, Bulgariae, nova et accuratissima delineatio**, [Stanford/AGSL](https://geodiscovery.uwm.edu/catalog/stanford-hm001wb9376) | Contemporane intervalului; fără verificare GIS a limitelor. Contradicția OHM `end_date=1732` / `end_event=1867` persistă. |
| Țara Chioarului, OHM [2747435](https://www.openhistoricalmap.org/relation/2747435), 1650–1851 | **Samuel Mikoviny, Mappa Districtus Kővár et C[omitatus] Kraszna**, **OSZK TK 2274; fost No 21 S.P.**, menționată în [Bendefy 1976, secțiunea 34](https://real-eod.mtak.hu/112/1/KIADV_071.pdf) | Hartă istorică identificată concret, nu fișier cartografic inspectat și georeferențiat. Nu acoperă demonstrat 1650–1851 integral. |
| Țara Chioarului, OHM [2747434](https://www.openhistoricalmap.org/relation/2747434), 1860–1876 | **Pesty Frigyes 1864–1865**, fond OSZK **Fol. Hung. 1114/23** și **1114/26**; [ediția universitară 2023](https://mnhp.unideb.hu/kiadvanyok/pesty/pesty_kovar-kraszna.pdf) | Text contemporan care identifică sate și jurisdicții; hărțile ediției sunt reconstrucții moderne. Cei 15 `ways`/variantă rămân nesursați, lacuna 1851–1860 nu se umple. |

### Distincții documentare obligatorii

**Homann 1717:** muzeul descrie explicit gravura ca hartă datată din 1717 și furnizează numărul de inventar `XV/633`. PDF-ul catalogului a putut fi citit textual, dar captura vizuală a paginii a eșuat în instrumentul de inspectare; nu pretindem examinarea fizică a hărții. **Seutter 1730:** data și proveniența sunt metadate de catalog; nu există dovada echivalenței cu toate cele 78 de segmente ale variantei OHM.

**Mikoviny / Kővár:** indicativul `TK 2274`, vechea notă `No 21 S.P.` și titlul hărții sunt identificatori citați de László Bendefy în monografia catalogată de biblioteca Academiei Ungare de Științe. PDF-ul sursă are dimensiune prea mare pentru captura vizuală efectivă. În consecință, `ARCHIVAL_MAP_IDENTIFIED_NOT_INSPECTED`; anul original nu se deduce din data publicării monografiei (1976).

**Pesty 1864–1865:** ediția 2023 este bazată pe însemnări manuscrise contemporane; editorii declară expres că hărțile moderne ale volumului au fost realizate folosind proiectul GISta Hungarorum. Nu se promovează astfel de hărți moderne drept exemplare din epocă.

## P1 / P2: două surse cartografice în sprijin contextual

**V. P. Piadyshev, General Map of Bessarabia, 1821**, [Library of Congress, LCCN 2018688650](https://www.loc.gov/item/2018688650/), este o hartă militară a provinciei Basarabia din anul 1821, relevantă pentru geografia perioadei anterioare rectificării din 1856. Sunt necesare comparații cu originale de delimitare pentru 1856 și 1878; nu s-a demonstrat potrivirea celor 96 de `ways` din OHM 2694163.

**James Wyld, Treaty map shewing the boundaries of Russia & the Eastern European states, 25 februarie 1856**, [Library of Congress, cota G7001.F2 1856 .W9; LCCN 2015591079](https://www.loc.gov/item/2015591079/), descrie **propuneri** înaintea Tratatului de la Paris din 30 martie 1856. **Nu este harta finală autentificată a tratatului.**

Pentru P1/P2 rămân necesare celelalte surse deja cerute de registrul HIST-0.4c: anexele tratatelor 1878/1913/1940/1947, planurile frontierelor militare bănățene, patentele administrative și măsurătorile contemporane din Bucovina/Voivodina. Catalogul general al Arhivelor Naționale Ungare [S78/S79](https://aol.mnl.gov.hu/adatbazis/kataszteri-telekkonyvek/informacio) este doar o pistă de identificare a foilor cadastrale; **nu confirmă existența foilor pentru Chioar**.

## Verificabilitate, protecție și operațiunea următoare

Referințele noi sunt enumerate individual în `cartographic-provenance-leads-2026-11-11.json`, cu URL, instituție, cotă, dată, tip document, verificare efectivă, interpretare și limite. **Nu sunt adăugate la registrul inițial S01–S18**, păstrând auditul de bază și cele șase hashuri din manifest neschimbate.

Pentru P0: obținerea copiilor originale ale hărții **OSZK TK 2274**, a hărții Homann **MNB XV/633** și a registrelor/planurilor inginerești Chioar 1875–1876; extragerea listei administrative din textele 1876/1877 și confruntarea pe localități, apoi pe segmente ale OHM, cu indicarea incertitudinilor de scară și dată. Pentru P1/P2: un tabel *hartă contemporană → perioadă → frontieră reprezentată → segment OHM → verdict verificabil*.

**Poarta rămâne** `HIST-0.4c DOCUMENTARY_RESEARCH_COMPLETED_WITH_OPEN_PROBATIVE_GAPS / P0_OPEN / ZERO_GEOMETRY_CERTIFICATES / NO_IMPORT`. Nicio schimbare în `src/`, `public/`, `data/`, ACTUAL/OSMB/OHM, arbori, UI, workflow-uri sau CI.
