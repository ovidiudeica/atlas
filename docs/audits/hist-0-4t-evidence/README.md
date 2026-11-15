# HIST-0.4t — verificarea sursei austriece de la baza foii 2977 și a reperelor independente

**15 noiembrie 2026** · bază: `main@e0c701e807c4feaa2c74cf0576c8690dd5277e1a` · continuare strictă a HIST-0.4s și HIST-0.4s-LM1.

**Verdict:** `SEARCH_SCREENING_PERFORMED / REGIONAL_SHEET_AND_25000_COLLECTION_LOCATED / EXACT_AUSTRIAN_PREDECESSOR_NOT_QUALIFIED / ZERO_GCP / ZERO_BOUNDARIES`.

## 1. Ce este deja demonstrat și nu trebuie revizitat

Facsimilul integral al foii românești **Șomcuta Mare 2977**, tipărit în **1924**, are inscripția originală **„Ediție provizorie reprodus după hartă Austriacă la 1:25.000”**. Sursa de bază este deci austriacă la scara declarată, dar identificatorul, anul ridicării și ediția originalului sunt încă necunoscute. JPG-ul cu margini [MAPSTER 11788799](http://igrek.amzp.pl/details.php?id=11788799) și GeoTIFF-ul georeferențiat [eHarta 25790](https://www.geo-spatial.org/vechi/file_download/25790) reproduc **aceeași planșă românească**. Nu sunt două măsurători geodezice independente. Dovada se păstrează la [HIST-0.4s](../hist-0-4s-evidence/README.md).

## 2. Verificările efectuate efectiv în HIST-0.4t

| Sursă | Constatare verificabilă | Ce nu demonstrează |
|---|---|---|
| `Geodata GIS`, 12 colecții | Căutare locală recursivă după nume austriece, militare, Chioar/Kővár/Somcut, cadastru și serii. S-au găsit mozaicul austriac **1910, 1:200.000** și foi românești **1:20.000**, dar niciun fișier identificat direct drept original austriac local **1:25.000**. | Nu constituie o dovadă universală de absență: nicio analiză completă a pixelilor tuturor foilor sau a tuturor arhivelor online. |
| [BEV — Historical Maps](https://www.bev.gv.at/en/Services/Products/Maps.html) | A treia ridicare militară: **1869–1887**, în principal **1:25.000**; în Transilvania există continuări **1:28.800**. | Data campaniei nu este data ridicării foii exacte, iar scara generală nu identifică o ediție locală. |
| [MAPSTER 11860629](https://igrek.amzp.pl/11860629) | **Gaura und Galgó, 16 XXIX (5071), 1886, 1:75.000**, din colecția Library of Congress; reper regional de catalog verificat. | NU este facsimilul austriac 1:25.000 de la baza foii 2977; 1886 este ulterior anului 1877. |
| [MAPSTER 11860630](https://igrek.amzp.pl/details.php?id=11860630) | Aceeași familie de foaie regională, ediția **1900, 1:75.000**. | Ediția mai târzie nu datează originalul topografic 1:25.000. |
| [Catalogul Cholnoky](http://cholnokymaps.gisit.ro/) | Pagina de catalog HTTP 200 clasifică explicit `TOP-3KF-25` — „III. katonai felmérés 1:25 000”. | Serviciul său de căutare `search.php` a răspuns **403** la interogarea cu acest cod; nu am obținut un identificator al foii din sectorul Chioar și nici imaginea ei. |
| [Arcanum](https://maps.arcanum.com/en/map/thirdsurvey25000/) | Pista de hartă generală a ridicării a treia a fost verificată ca adresă de catalog; accesul automat la imagine nu s-a confirmat (403/202 fără corp de răspuns). | Prezența în index nu autorizează atribuirea unui an/localizări sau extragerea de GCP-uri. |
| [OHM Chioar 2747435](https://www.openhistoricalmap.org/relation/2747435) | Relația există în inventarul istoric anterior al repository-ului; citirea live a API-ului a fost refuzată cu 403 în acest audit. | Nu am colectat ori certificat o geometrie nouă; nu am modificat OHM. |

**Metoda:** sursele au fost citite numai public, fără autentificare, comenzi, abonamente, plăți sau contacte instituționale. Nu s-au publicat rastere, KMZ-uri ori hărți private. Rezultatele se păstrează în `source-identification.json`, cu ID-urile exacte și limitările transportului.

## 3. Reperele individuale — păstrate distincte

Documentația deja verificată din [HIST-0.4s-LM1](../hist-0-4s-landmark-supplement/README.md) rămâne validă:

- **Buteasa** și **Vălenii Șomcutei**: biserici candidate P1. Vechimea clădirilor nu identifică un colț de fundație măsurat independent; la Vălenii Șomcutei există ambiguitate între foile **2977 și 2877**.
- **Codru Butesii:** edificiul a fost adus pe amplasamentul actual în **1937**, deci este EXCLUS ca punct fix pentru 1859/1924.
- **Șomcuta Mare → Ulmeni:** edificiu mutat în **1895**; amplasamentul actual nu este punctul aceleiași biserici în Șomcuta din 1859.
- **Cetatea Chioarului:** un simbol al ruinelor sau o etichetă nu individualizează un colț specific de bastion. **Cota 406** și meandrul Lăpușului nu sunt puncte geodezice independent identificate.

Niciun reper nu satisface simultan **același obiect fizic pe originalul datat**, **corespondența punctuală în alt martor istoric relevant**, **coordonate actuale ale aceluiași punct fix măsurate independent** și **bugetul de incertitudine**. Detaliile per-candidat se află în `landmark-gates.json`.

## 4. Verdict și separația probatorie

**0 GCP-uri noi**, **0 puncte holdout**, **RMSE nedefinit**, **0/15 segmente Chioar**, **0/82 segmente Transilvania** și **0/37 relații OHM** admise. Nu transformăm coordonatele descriptive ale monumentelor, poziții WMS, BBOX, simboluri de ruină sau suprapuneri de poligoane OHM în GCP-uri sau limite administrative juridice.

Identitatea unei așezări, filiația cartografică, georeferențierea, poziția unui reper și valoarea juridică a hotarului sunt **cinci afirmații distincte**, fiecare necesitând dovezi proprii. Disputa `Szt.-Kápolnok` nu a fost modificată.

## 5. Continuare permisă — HIST-0.4u

Căutarea punctuală a **foii austriece originale 1:25.000**, cu identificatorul în nomenclatura proprie și marginalia aferentă sectorului **Șomcuta–Kővár**. `16 XXIX (5071)` este **numărul unei foi 1:75.000**, nu numărul certificat al originalului 1:25.000. După identificarea rasterului original și a anului ridicării, se pot verifica **puncte fixe individuale pre-1877** (fundații/colțuri de zid) față de o măsurătoare independentă modernă, cu incertitudine declarată. Dacă originalul local este post-1877, nu poate certifica prin retroproiecție hotarul din 1859.

Acest PR este **numai probatoriu**: fără schimbări în `src/`, `public/`, datele administrative ACTUAL/OSMB, geometria OHM, selecțiile sau UI-ul Atlasului. Validator reproductibil: `node docs/audits/hist-0-4t-evidence/validate-evidence.mjs`.
