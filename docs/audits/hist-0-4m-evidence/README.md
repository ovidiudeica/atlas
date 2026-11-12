# HIST-0.4m — facsimile parlamentare și primul registru de repere fizice independente

**Data auditului:** 12 noiembrie 2026. **Bază:** `main@a3325e4a7baca3646895fda1956362f8169ccf28` (HIST-0.4l). **Tip:** dosar probatoriu fără modificarea aplicației sau geometriei. **Verdict:** `PARLIAMENTARY_FOLIOS_LOCATED_NOT_VISUALLY_ACCESSED / CHIOAR_FORTRESS_GROUND_REFERENCE_RECONCILED_PROVISIONALLY / 0_CERTIFIED_GCPS / 0_IMPORTS`.

## 1. Facsimilele parlamentare: patru pagini localizate, dar verificare vizuală neînchisă

Ținta este abrevierea legală **`Szt.-Kápolnok`** din legea 1877:I §2 și eventuala rectificare `Szurdok-Kápolnok`. Am identificat direct în **indexul OCR** al fondului parlamentar următoarele tipărituri legate de același proces legislativ:

| Actul sursă | Pagina tipărită | Pagina vizualizatorului | Proba accesibilă |
|---|---:|---:|---|
| [Képviselőházi irományok 1875 XIV nr.503](https://library.hungaricana.hu/en/view/OGYK_KI-1875_14/?pg=13), proiect | 4 | 13 | indexare `Szt Kápolnok`, **nu** fotografia paginii |
| [Képviselőházi irományok 1875 XIV nr.529](https://library.hungaricana.hu/en/view/OGYK_KI-1875_14/?pg=159), lege adoptată | 150 | 159 | indexare `Szt Kápolnok`, **nu** fotografia paginii |
| [Főrendiházi irományok 1875 IV nr.204](https://library.hungaricana.hu/en/view/OGYK_FI-1875_04/?pg=282) | 271 | 282 | indexare `Szt Kápolnok`, **nu** fotografia paginii |
| [Főrendiházi irományok 1875 IV nr.231](https://library.hungaricana.hu/en/view/OGYK_FI-1875_04/?pg=375) | 364 | 375 | indexare `Szt Kápolnok`, **nu** fotografia paginii |

Indexul este accesibil din [căutarea Hungaricana](https://library.hungaricana.hu/en/search/results/?list=eyJxdWVyeSI6ICJTWk89KGJlcmVuY3ogZ3lcdTAwZjZyZ3kpIn0&page=10&per_page=100). Au fost testate separat vizualizatorul (HTTP 403), imagini statice de pe CDN (HTTP 403), accesul prin Opera Browser Connector (neconectat), cataloage alternative Google Books/Internet Archive (fără exemplar exact dovedit). Nu s-a primit **nicio imagine completă de pagină parlamentară**: 4 pagini localizate în index, **0 facsimile originale citite vizual**. Nu etichetăm OCR ca lectură directă a originalului și nu afirmăm că cele patru tipărituri înrudite sunt patru rectificări independente.

Compararea documentară din etapele anterioare rămâne: KSH 1873 `Szurdok (Kápolnok-)`, KSH 1877 `Kápolnok (Szurdok-)`, o sursă juridico-administrativă retrospectivă din 1885 `Szurduk-Kápolnok (Kopalnik)`, actualul **Copalnic**. Există continuitate toponimică solidă, dar **nu o dovadă a înlocuirii literal-juridice a abrevierii `Szt.`**. Pentru valoare oficială, rectificarea trebuie găsită în tipăriturile primare relevante, în special *Budapesti Közlöny* și originalul dispoziției de aplicare. *Rendeletek Tára* poate indexa ordine, dar nu este el însuși ediția de promulgare.

## 2. Primul registru de referințe fizice — fără substituirea lor cu GCP-uri inexistente

Am reexaminat în rezoluția originală **fotografia MNL nr. 2** (zona Chioar; 6379 × 9819 pixeli; SHA-256 `bd9c01173c1ddc89a97414215b0771b9d88861f192f547a2ec718bb2b9cb72a9`). Au fost inspectate patru decupaje **numai local**, nepublicate. Sunt vizibile meandrele Lăpușului, Berkeszpataka / Berchezoaia și alte localități din vechiul district, dar **nu a fost identificat un simbol univoc pentru ruinele Cetății Chioarului**.

**Cel mai bun nou reper fizic este Cetatea Chioarului (RAN 108525.01)**, existentă istoric înainte de 1859, dar deja în stare de ruină. Trei surse de amplasament publică puncte apropiate:

| Sursă independent publicată | Latitudine | Longitudine | Observație |
|---|---:|---:|---|
| [WelcomeToRomania](https://www.welcometoromania.ro/DN1c_Halmeu_Rastoci/DN1c_Halmeu_Rastoci_Berchezoaia_Cetatea_Chioarului_r.htm) | 47.476130 | 23.578810 | amplasament aproximativ |
| [Burgenwelt](https://www.burgenwelt.org/rumaenien/chioarului/burgenwelt-chioarului-objektseite.pdf) | 47.476167 | 23.578750 | transcriere coordonate DMS |
| [ExploreCarpathia](https://www.explorecarpathia.eu/hu/romania/kovar) | 47.475914 | 23.578644 | amplasament aproximativ |

Diferențele publicate față de prima sursă sunt de circa **6–27 m**, ceea ce indică un grup coerent de **candidați pentru localizarea modernă a monumentului**, fără a demonstra că sursele au măsurători geodezice independente. [Repertoriul Arheologic Național](https://ran.cimec.ro/sel.asp?codran=108525.01) confirmă situl arheologic; alte evidențe istorice avertizează asupra amplasărilor greșite pe hărți contemporane. **Coordenata poate deveni referință de teren doar după auditul amplasamentului**, iar GCP devine permis **numai dacă se identifică aceeași ruină cu un simbol propriu în fotografia istorică**, în pixeli absoluți.

În `first-independent-ground-anchor-register.json` sunt **6 repere fizice**: Cetatea Chioarului (fotografia 2), Cetatea Rupea, bisericile fortificate din Prejmer, Codlea și Hărman și Biserica Neagră Brașov (fotografia 8). Pentru fiecare s-au separat coordonatele punctuale actuale candidate, fișele patrimoniale, fotografia MNL, eventualul pixel identificat și motivul respingerii la calificarea GCP. Hărman rămâne cu coordonate moderne discordante. Două simboluri din fotografia 8 (Rupea și Prejmer) au pixeli, dar **nu identifică univoc clădirile în cauză**.

Un [KMZ privat din Drive](https://drive.google.com/file/d/1k2CSfYATlb5gKCO-TnD6z92GUlywUAza/view) despre administrația Transilvaniei de la începutul secolului XIX a fost identificat **numai prin metadate**. Nu este presupus etalon geodezic independent și nu a fost copiat/republicat.

## 3. Georeferențiere: poartă fail-closed

Nu există încă **nicio pereche** validă `(pixel exact al aceluiași obiect fizic pe MNL 1859, coordonată modernă verificată independent)`. În consecință:

- **0 GCP-uri fizice independente admise**; **0 transformări affine justificate**; RMS nou **nedefinit**, nu zero.
- **0 din 14 fotografii** certificate georeferențiat; **0 din 82** segmente Landesgrenzen Transilvania, **0 din 15** segmente Chioar și **0 din 37** relații OHM certificate pentru import.
- Reziduul affine anterior pe centre moderne (holdout ≈ 1241 m; leave-one-out ≈ 1575 m) rămâne cercetare exploratorie; nu poate fi transformat într-un certificat.

Pentru primul fit controlat sunt necesare minimum **4 repere necoliniare dispersate**, cu reprezentare punctiformă demonstrată în originalul MNL, coordonate geodezice independente și puncte de control reținute din afara ajustării. Sursa hotarului legal trebuie demonstrată **separat** de calitatea transformării raster.

## 4. Livrabile, drepturi și pas următor

Dosarul conține sursele per-folio, registrul per-obiect al ancorelor fizice, metodologia, manifestul și validatorul. Nu se modifică `src/`, `public/`, ACTUAL, OSMB, OHM, paginile publicate, arborele ISTORIC sau vreo geometrie. Nu s-au publicat fotografii MNL, imagini parlamentare, tile-uri Arcanum sau KMZ-uri private; **nu s-au făcut plăți sau comenzi**.

**Verdict HIST-0.4m:** `ORIGINAL_FOLIOS_INDEXED_NOT_VIEWED / PHYSICAL_GROUND_SITES_FOUND_NO_INDEPENDENT_PIXEL_PAIR / ZERO_GCPS_ZERO_IMPORTS`. Nu prezentăm această etapă drept finalizarea unui prim set GCP, ci drept închiderea responsabilă a investigației disponibile și înregistrarea explicită a probelor care încă lipsesc.

**Următorul pas HIST-0.4n:** recuperarea instituțională sau printr-un canal public accesibil a facsimilelor parlamentare exacte, verificarea unui amplasament fizic cu control geodezic independent (prioritar Cetatea Chioarului), apoi identificarea simbolului cartografic corespunzător în fotografia MNL și abia ulterior colectarea de puncte de control distribuite pe aceeași foaie.
