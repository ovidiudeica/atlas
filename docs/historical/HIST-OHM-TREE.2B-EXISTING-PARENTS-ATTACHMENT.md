# HIST-OHM-TREE.2B — atașarea controlată la părinții OHM existenți

**23 noiembrie 2026 · Calificare documentară, fără certificare geometrică**.

Sfera modificărilor: numai `public/data/historical/v1/ohm-parentage.json`, registrul de calificare aferent, teste și documentație. **Niciun fișier GeoJSON OHM, HistoGIS sau ACTUAL nu a fost modificat.** Începem cu cei doi părinți existenți care au copii documentați (Regatul României, Transilvania) și atașăm județe la al treilea părinte deja disponibil, Principatele Unite.

## A. Controlul individual al celor 13 județe candidate din 1865

Sursa bibliografică este *Indicele comunelor României după noua organizare a legii comunale*, Ministerul de Interne, Agricultură și Lucrări Publice, Imprimeria Statului, București, **1865**, *Recapitulația generală*.

- <https://commons.wikimedia.org/wiki/File:Indicele_Comunelor_Romaniei_1865.pdf> — facsimilul integral, 108 pagini, sursă oficială de epocă;
- <https://pdfcoffee.com/indicele-comunelor-romaniei-1865-pdf-free.html> — transcriere automată integrală de lucru (rubrica „RECAPITULATIE GENERALA”, tabelul final „NUMIREA JUDETELOR”);
- <https://www.academia.edu/11765188/Politici_administrativ_teritoriale_%C3%AEn_Rom%C3%A2nia_modern%C4%83_%C8%99i_contemporan%C4%83> — control documentar secundar al structurii din 1864.

**Limitare a inspecției:** facsimilul original este localizat public, dar nu a putut fi inspectat vizual la rezoluție nativă în acest flux. Extragerea OCR a tabelului final este lizibilă pentru **11 nume**, dar nu pentru Neamț și Vaslui. Nu prezentăm OCR-ul drept transcriere diplomatică a originalului. Decizia este limitată la apartenență **administrativă din anul documentar 1865**, fără calificarea geometriei și fără extrapolarea datei finale OHM (`null`).

| Județul OHM | Citire OCR în recapitularea din 1865 | Verdict pentru 1865 |
|---|---|---|
| Bacău | `Bac5:6` | **Admis, snapshot 1865** |
| Botoșani | `BotosanI` | **Admis, snapshot 1865** |
| Covurlui | `CovurluIu` | **Admis, snapshot 1865** |
| Dorohoi | `Doroholu` | **Admis, snapshot 1865** |
| Fălciu | `Fälciti` | **Admis, snapshot 1865** |
| Iași | `Iasi` | **Admis, snapshot 1865** |
| Neamț | OCR fragmentat / imposibil de identificat fără dubii | **HOLD** |
| Putna | `Putna` | **Admis, snapshot 1865** |
| Roman | `Romant` | **Admis, snapshot 1865** |
| Suceava | `Sucéva` | **Admis, snapshot 1865; județ moldovenesc** |
| Tecuci | `Tecuclu` | **Admis, snapshot 1865** |
| Tutova | `Tutova` | **Admis, snapshot 1865** |
| Vaslui | OCR fragmentat / `Vagulu`, ambiguu | **HOLD** |

Sunt introduse **11 legături datate Principatele Unite → județ** pentru 1865. Neamț și Vaslui rămân identități istorice cunoscute (confirmate și în 1925), dar nu primesc încă legătura specifică 1865 până la confruntarea vizuală a recapitulării. Intervalul 1 ianuarie–31 decembrie 1865 reprezintă **anul documentar**, nu înființarea ori desființarea juridică a fiecărui județ.

## B. Recalificarea Regatului României

**Document primar:** [Monitorul Oficial, nr. 220, 7 octombrie 1925, p. 10923](https://www.resurse.net/mo/1925/19251007.pdf), decretul regal nr. 2465, în baza legii de unificare administrativă. Lista de județe enumeră: Arad, Bacău, Botoșani, Covurlui, Dorohoi, Fălciu, Iași, Maramureș, Neamț, Putna, Roman, Tecuci, Tutova și Vaslui; Timiș-Torontal este expres exceptat de la modificarea împărțirii, **rămânând ca județ al Regatului**. Prin urmare sunt admise **15 relații pentru data documentară 7 octombrie 1925**, cu limită de snapshot 31 decembrie.

**Risc de identitate corectat:** aceeași listă oficială enumeră **Fălticeni** și **Suceava** ca două județe DISTINCTE. Astfel, nu este admisibilă identificarea poligonului OHM *Județul Suceava* cu începutul declarat în 1859 cu unitatea *Suceava* din 1930, apărută din administrația Bucovinei. Am **retras explicit** vechea legătură `ohm-1930-suceava-to-romania` din registrul admis, păstrând-o cu motiv și dovezi în `retractedLinks`.

Această precauție este susținută independent și de [Monitorul Oficial, nr. 212, 21 decembrie 1890, p. 5038](https://upload.wikimedia.org/wikipedia/commons/8/8b/Monitorul_Oficial_al_Rom%C3%A2niei_1890-12-21%2C_nr._212.pdf): raportul oficial din 15 octombrie 1890 menționează reședința județului **Suceava la Fălticeni**, lângă hotarul cu Bucovina. În același număr apare raportul județului **Tecuci**. Rezultă **două relații documentare noi pentru 1890**, fără identificarea hotarului OHM.

**Nicio continuitate neîntreruptă nu este dedusă** între snapshoturile 1865, 1890, 1925 și 1930. Intervalul 1926–1929 rămâne fără extinderea automată a celor 12 județe pentru care avem numai snapshoturile 1925 și 1930. Cele trei admiteri vechi 1926–1938 (Arad, Maramureș, Timiș-Torontal) se păstrează.

## C. Recalificarea Transilvaniei

**Studiu documentar:** Alexandru Onojescu, Ovidiu Iudean, Vlad Popovici, [*Parliamentary Representation in Eastern Hungary (1861–1918)*, pp. 215–217](https://www.academia.edu/26742369/Parliamentary_Representation_in_Eastern_Hungary_1861_1918_Preliminary_Results_of_a_Prosopographic_Inquiry). Autorii afirmă explicit că **districtul Kővár/Chioar și comitatele Kraszna și Közép-Szolnok** au rămas în administrația Principatului Transilvaniei până la decizia imperială din **27 decembrie 1860**, de la care au trecut sub administrație ungară.

Cele trei relații existente **Transilvania → Partium** sunt extinse din 1733–1847 până la **26 decembrie 1860**. Aceasta certifică **apartenența administrativă externă documentată**, nu identitatea internă a instituțiilor sau valabilitatea neschimbată a contururilor în timpul reorganizărilor 1848–1851. **Începând din 27 decembrie 1860 nu mai atașăm aceste unități sub Transilvania**. Nu introducem Regatul Ungariei, deoarece utilizatorul a cerut întâi atașarea la părinții existenți.

Zaránd rămâne HOLD din cauza împărțirii din 1732; comitatele reformei 1876 nu se atașează anacronic sub Transilvania.

## D. Rezultatul temporal al arborelui

**Semantica selectorului de an:** la selectarea unui an, arborele include o relație administrativă dacă există dovezi pentru **cel puțin o zi din anul respectiv**. Perioadele exacte ale relației rămân în registru și card; afișarea în lista anului 1890 sau 1925 **nu dovedește** că relația exista la 1 iulie ori că era valabilă întregul an. O eventuală schimbare de părinte în cursul anului este blocată ca ambiguă până când există un selector cu dată completă. Disponibilitatea versiunilor geometrice OHM este evaluată și afișată **separat**, fără completarea intervalelor nule.


| An de referință (1 iulie) | Părinte existent | Copii documentați |
|---:|---|---:|
| 1800 | Transilvania | 3 |
| 1848 | Transilvania | 3, potrivit studiului privind administrația până în 1860 |
| 1860 | Transilvania | 3 |
| 1861 | — | 0, transfer către administrația ungară |
| **1865** | **Principatele Unite** | **11; Neamț/Vaslui HOLD** |
| **1890** | **Regatul României** | **2; Suceava (Fălticeni), Tecuci** |
| **1925** | **Regatul României** | **15** |
| 1926 | Regatul României | 3 (relațiile anterioare) |
| **1930** | **Regatul României** | **15; vechea Suceava OHM exclusă** |
| 1931 | Regatul României | 3 (relațiile anterioare) |
| 1939 | — | 0, fără extrapolare după reorganizare |

Numărul relațiilor-sursă admise în registru crește de la **19 la 46**, din care 11 pentru 1865, două pentru 1890 și 15 pentru 1925, minus retragerea unei legături din 1930. Schimbarea de dată finală pentru cele trei legături Partium nu adaugă legături numerice.

## E. Constrângeri și restanțe

- Nu au fost modificate **139 versiuni OHM, 125 active geometrice, 76 grupuri**, ACTUAL sau colecția HistoGIS.
- Nicio apartenență administrativă documentată nu activează automat un poligon cu `sourcePeriod.end=null`.
- Aceeași geometrie exactă poate servi mai multor versiuni temporale fără dublare; totuși, egalitatea coordonatelor nu identifică automat instituții succesive.
- Verificarea vizuală la rezoluție nativă a rubricilor **Neamț/Vaslui** din ediția 1865 este necesară pentru închiderea celor două HOLD.
- La județul Suceava este necesară **separarea identităților** pentru județul moldovenesc (Fălticeni), județul bucovinean interbelic și județul actual, înainte de a admite hotare ori corespondențe transmodulare.
- Dosarele din [HIST-OHM-TREE.2A](HIST-OHM-TREE.2A-EXISTING-PARENTS-AUDIT.md) și [HIST-OHM-TREE.2](HIST-OHM-TREE.2-QUALIFICATION.md) sunt **fotografii de audit anterioare**, păstrate pentru proveniență; numerele lor istorice nu trebuie tratate ca valori curente.

**QA reproductibil:** `docs/historical/import/HIST-OHM-TREE.2B-QUALIFICATION-QA.json`, `tests/hist-ohm-tree-2b-existing-parents.test.mjs`.

**Următoarea etapă permisă:** închiderea celor două citiri originale 1865, apoi calificarea extinderii cronologice 1926–1929 și a identităților județelor 1930, fără a introduce părinți absenți ori geometrii noi în această etapă.
