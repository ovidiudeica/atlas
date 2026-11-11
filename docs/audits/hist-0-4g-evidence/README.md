# HIST-0.4g — harta administrativă din 1861 și repartizarea legală a Chioarului (1877)

**Audit:** 11 noiembrie 2026 · **bază:** `main@46b2fe25878c0f301812ff036e6e4fca9bd8b8d8` (HIST-0.4f, PR #98)  
**Verdict:** `ARCHIVAL_1861_FACSIMILES_ACQUIRED / CHIOAR_1877_LEGAL_NAMES_RECONCILED / GEOREFERENCED_LANDES_TRACE_PENDING / ZERO_ADMISSIONS`.

## 1. Recuperare efectivă: 14 fotografii istorice instituționale, nu simple referințe de catalog

Am identificat și descărcat **14/14 imagini JPEG** oferite în galeria publicației [Magyar Nemzeti Levéltár despre harta Transilvaniei](https://mnl.gov.hu/mnl/ol/hirek/erdely_terkep_amely_a_kormanyra_nezve_valosagos_kincset_kepezett), sub identificatorul **MNL OL, Térképtár, Nyomtatott térképek (S 75), No. 82**.

- **444.622.163 octeți** total, 14/14 SHA-256 individuale recalculate și egale cu amprentele imediat după descărcare. Fișiere de aproximativ **6.355–6.426 × 9.819–10.156 pixeli**. Registrul include URL-ul instituțional exact, mărimea, dimensiunile și hashul fiecărei imagini.
- Contact sheet-ul și detaliul din a noua fotografie au fost inspectate vizual **local**. Titlul lizibil: *Administrativ Karte des Grossfürstenthums Siebenbürgen nach der neuesten Landeseintheilung 1859*. Legenda diferențiază **Landesgrenzen**, **Kreisgrenzen**, **Bezirksgrenzen**, **Gemeindegrenzen**. Harta este o reproducere fotografică publicată/identificată în arhivă ca **1861**, dar prezintă clasificarea **1859**.
- **14 fotografii din galerie NU înseamnă 14 din cele 24 de foi** cartografice individuale și nu dovedesc acoperirea integrală a seriei. Fotografii compozite, decupaje și ordinea foilor nu au fost echivalate cu cele 24 de originale. Nu pretindem că scanările reprezintă o hartă deja georeferențiată.
- S-au descărcat separat pentru arhiva locală: harta/studiul bibliografic *Catastrum* 2024 (PDF de **6.107.998 octeți**, SHA-256 `d43c5e8ad85b2c8a28baaa73b37e60b17737c9123e73090137f07896cf9f1c73`) și versiunile HTML ale legilor din 1876 și 1877.
- Exemplarele manuscrise **OSZK TK 1 131 H.** și **TK 1 175 H.**, precum și seria tipărită **HIM B IX a 719** și **MNL S 67 nr. 9**, sunt confirmate prin studiul [Jankó Annamária, *Catastrum* (2024), pp. 23–24](https://epa.oszk.hu/04300/04359/00039/pdf/EPA04359_catastrum_2024_01.pdf). Ele **nu** sunt considerate automat identice fizic cu fotografiile de la S 75 nr. 82.

**Condiții:** fotografiile sunt păstrate exclusiv în `Documents/Atlas-OHM-Inventory-2026-11-10/hist-0-4g-research-local/`. Dreptul de acces la galeria MNL **nu** reprezintă licență de redistribuire în Atlas Teritorial; **zero fotografii istorice au fost introduse în GitHub sau website**.

## 2. Transilvania — precauția cronologică 1859 / 1861 / 1862 / 1863

Relația OHM **[2829384](https://www.openhistoricalmap.org/relation/2829384), 1851–1867**, a avut în HIST-0.4f toate cele **82 ways** incluse în rasterul georeferențiat *Karte des Grossfürstentums Siebenbürgen* **1862**. Asta certifica acoperirea raster, nu conformitatea liniilor.

Noua sursă din 1861 arată **împărțirea administrativă 1859**. Studiul *Catastrum* 2024 explică faptul că harta generală în **patru foi, 1863, HIM B IX a 711**, reprezintă separat părțile **Partium** unite cu Regatul Ungariei în **1861** (și estompate pe noua hartă). Așadar există o **potențială discontinuitate cronologică internă** în intervalul foarte lung al unei singure relații OHM 1851–1867. Fără documentul juridic exact și contururile de epocă comparate, aceasta este o **ipoteză de audit**, nu justifică automat divizarea relației OHM.

Identificarea etichetelor de legendă *Landesgrenzen* / *Kreisgrenzen* / *Bezirksgrenzen* / *Gemeindegrenzen* previne substituirea nepermisă a unui hotar administrativ intern cu frontiera provinciei. **Nu au fost potrivite foi individuale la 82 ways, nu s-au ales GCP independente, nu s-a calculat un RMS georeferențiat și nu s-a digitalizat independent linia *Landes* pentru niciun way.** Cele **81 segmente comune** și arcul NW **200503147** față de **200503149/150/151** rămân identificate tehnic din HIST-0.4f, dar nu istorico-geometric certificate.

**Verdict Transilvania:** `SOURCE_1861_FACSIMILE_ACQUIRED / DATE_1859_BOUNDARY_STATE / 0_OF_82_VERIFIED_LANDES_SEGMENTS / NO_IMPORT`.

## 3. Chioar — efect juridic dovedit nominal, nu geometric

A fost prelucrat direct textul digitizat al [Legii maghiare **1877:I**, §2](https://net.jogtar.hu/ezer-ev-torveny?docid=87700001.TV), nu doar interpretarea secundară a lui Borovszky. Sunt **91 de nume istorice distincte**, în două loturi:

| Comitat succesor, potrivit legii 1877:I | Localități nominalizate |
|---|---:|
| Szolnok-Doboka — §2, punctul 2(c) | **48** |
| Szatmár — §2, punctul 3 | **43** |
| **Total** | **91** |

Forma `Purkerecz` este o **variantă a numelui Purkáriu**, nu a 92-a localitate. Registrul `chioar-1877-legal-locality-register.json` păstrează **grafia exactă din transcrierea legală**, ordinea și comitatul succesor. **Nu se fac transliterări, atribuire de coordonate, echivalări cu localitățile românești actuale sau reconstrucții fictive de hotare.**

[Legea **1876:XXXIII**](https://net.jogtar.hu/ezer-ev-torveny?docid=87600033.TV) **§1, punctul 2(c)** instituie regula repartizării Chioarului între Szolnok-Doboka și Szatmár, iar **§5** permite ministerului de interne să stabilească definitiv limitele după consultare. **§22** păstrează temporar exercitarea funcțiilor administrative de către vechile structuri; **§25** reglementează intrarea în vigoare și procedura de executare. [Legea **1877:I**, §2](https://net.jogtar.hu/ezer-ev-torveny?docid=87700001.TV) înscrie lista nominală definitivă și **§3** stabilește regula teritoriilor anexe comunelor. Prima lege a fost sancționată **19 iunie 1876** și anunțată **20 iunie 1876**; a doua sancționată **13 martie 1877**, anunțată în cele două camere **16–17 martie 1877**. Aceste date **nu** demonstrează singure ziua efectivă a încetării administrației Chioar sau ziua exactă a mutării fiecărei limite.

Pentru cele două relații OHM **[2747434](https://www.openhistoricalmap.org/relation/2747434)** și **[2747435](https://www.openhistoricalmap.org/relation/2747435)**, toate cele 15 segmente au numai comparația numerică preexistentă cu KMZ-ul privat. Cele **91 de nume nu sunt încă legate independent de geometriile comunelor din anii 1876/1877**; nu se atribuie automat relevanță retroactivă pentru varianta 1650–1851.

**Verdict Chioar:** `FINAL_1877_LEGAL_ALLOCATION_NAMES_VERIFIED / 91_COMMUNITIES / NO_GEOLOCATED_LEGAL_BOUNDARIES / NO_IMPORT`.

## 4. Registru, reproductibilitate și integritatea Atlasului

Documentele acestui director sunt:
- `archival-1861-gallery-register.json` — 14 fotografii, URL instituțional, SHA-256/dimensiune, limite ale inspecției și drepturilor.
- `chioar-1877-legal-locality-register.json` — cele 91 de nume istorice, secțiunea exactă din lege și comitatul de destinație.
- `per-way-1861-and-1877-gate.json` — **82** de segmente OHM Transilvania și **15** Chioar individuale, cu verdict distinct *negeoreferențiat / neverificat juridic*.
- `individual-qualification-37.json` — **37/37** relații și **3 P0 / 25 P1 / 9 P2**, patru dosare reluate, 33 păstrate fără schimbare de statut.
- `source-provenance-register.json` — zece surse/colecții diferențiate după accesul real și valoarea lor juridică.
- `scripts/acquire-mnl-1861-local.mjs` și `scripts/extract-1877-chioar-law.mjs` — reproducere numai locală (descărcarea imaginilor necesită ~445 MB spațiu; **nu se execută în CI**).
- `validate-evidence.mjs` — verifică fail-closed **14/14 surse**, **91 de localități**, **82/15 ways**, **37 ID-uri distincte**, zero importuri.

Rularea locală pe computerul autorizat a fost reușită: toate cele **14 hashuri ale imaginilor** corespund octet cu octet, iar extragerea listei juridice a fost executată de două ori cu **SHA-256 identic `526a4f67bde8f8fa48c6d4d211373c0baa51a891db31051cf82d9c2e80343bee`**.

**Nu sunt modificate:** `src/`, `public/`, ACTUAL, OSMB, OHM, limitele ISTORIC, arborii, interfața, CI sau GitHub Pages. Nu se lansează comenzi de arhivă, nu se fac abonamente ori plăți. Accesul la materialele din Arcanum și la KMZ-ul privat nu determină o redistribuire neautorizată.

## 5. Poarta următoare

Pentru Transilvania: **indexarea celor 14 fotografii la foile reale**, selectarea de puncte de control *independente de OHM*, determinarea proiecției / reziduurilor și **digitizarea explicită și verificabilă** a liniei `Landesgrenzen` numai după distincția între starea 1859 și reorganizarea din 1861 (comparație cu HIM B IX a 711 / 1863). Pentru Chioar: corelarea **91 de nume legale** cu [repertoriile oficiale din 1873 și 1877](https://web.kshkonyvtar.hu/article/56/959/helysegnevtarak), cu fondurile MNL **954 / 951 / 1001–1055** și geometriile contemporane ale comunelor, fără matching presupus după asemănarea numelor.

**Verificarea arcului Landes și admiterea geometrică rămân deschise.** Obținerea unor facsimile nu este, prin ea însăși, certificat de frontieră.
