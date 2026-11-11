# HIST-0.4b — Calificarea probatorie individuală a celor 37 de variante OHM

Data: 11 noiembrie 2026. Bază GitHub: 6a38d968bb761b65f7e9a89a01711c63c6beb650 (PR #90). Date OHM: 106 loturi arhivate din 10 noiembrie 2026; interogări suplimentare de taguri ale segmentelor din 11 noiembrie 2026.

**Verdict: 37/37 verificate tehnic; 0/37 admise pentru import.** Nu am creat, decupat, modificat sau importat geometrii și nu am stabilit relații părinte–copil ori structura modulului ISTORIC.

## 1. Indicatori verificați

| Indicator | Rezultat |
|---|---:|
| Relații OHM originale recuperate și hashuri concordante cu HIST-0.2 | 37/37 |
| Lanțuri geometrice OHM reconstruite și comparate | 37/37 |
| Perechi de versiuni succesive comparate geometric | 26/26 |
| Referințe la segmente way, inclusiv reutilizări între versiuni | 3.643 |
| Referințe la way cu atribut de sursă | 1.142 |
| Variante cu sursă pe cel puțin un segment | 35/37 |
| Variante cu atribut source la nivelul relației | 12/37 |
| Variante cu avertisment fixme:s pe relație | 25/37 |
| Prioritate P0 / P1 / P2 la verificarea documentelor | 3 / 25 / 9 |
| Variante admise pentru import în Atlas | 0 |

Sursa declarată în OHM nu demonstrează singură corectitudinea istorică a frontierei. Numerele de segmente reprezintă referințe la ways, nu kilometri de frontieră susținuți prin documente; același way poate apărea în mai multe versiuni.

## 2. Situația celor 11 familii istorice

| Familie | Variante | Ways cu sursă / ways totale | Variante cu fixme:s |
|---|---:|---:|---:|
| Țara Românească | 4 | 48 / 258 | 0 |
| Țara Moldovei | 2 | 97 / 183 | 0 |
| Transilvania | 4 | 32 / 328 | 4 |
| Bucovina și Districtul Bucovina | 6 | 6 / 414 | 4 |
| Gubernia Basarabia | 2 | 117 / 209 | 1 |
| Banatul Timișoarei | 2 | 9 / 162 | 2 |
| Frontiera Militară a Banatului | 3 | 24 / 134 | 3 |
| Țara Chioarului | 2 | 0 / 30 | 2 |
| Voivodina Sârbească și Banatul Timișan | 1 | 2 / 108 | 0 |
| Principatele Unite | 2 | 129 / 312 | 2 |
| Regatul României | 9 | 678 / 1505 | 7 |

## 3. Constatări geometrice și cronologice

- Moldova și Basarabia: suprafața adăugată Țării Moldovei în varianta OHM 1856 și suprafața adăugată Guberniei Basarabia în varianta OHM 1878 sunt identice geometric (aproximativ 10.025,49 km², diferență simetrică 0). Acest control verifică consistența internă OHM, nu precizia juridică a conturului.
- Banatul Timișoarei, 1751: partea civilă și Frontiera Militară nu se suprapun geometric, iar reuniunea lor diferă de Banatul anterior cu aproximativ 7,09 km². Diferența necesită verificare individuală.
- Transilvania, 1765: două variante au contur OHM identic, deși statutul de principat/mare principat diferă. Nu deduplicăm istoriile după contur.
- Bucovina: cinci variante folosesc practic aceeași geometrie; între prima și cea din 1878–1918 există o diferență simetrică de aproximativ 4,07 km².
- Țara Chioarului: 1851-05-12 până la 1860-12-27 — **3.517 zile** lipsă între versiunile OHM, deși geometria este identică. Nu sunt declarate surse pe relații sau ways.
- Regatul României: între varianta încheiată la 1944-04-01 și cea începută la 1945-03-09 rămân **342 de zile** neacoperite de această succesiune OHM. Variantele 1941–1944 necesită separarea controlului militar de suveranitate.

Valorile ariei și diferenței simetrice provin din operații pe geometriile OHM originale, doar în memorie pentru comparație; nu au fost serializate ca înlocuitori ai contururilor OHM.

## 4. Excepții care blochează certificarea

**P0 (3 ID-uri):** OHM 2747433 (Transilvania) are end_date 1732-12-31, dar end_event declară Austro-Hungarian Compromise, eveniment din 1867. OHM 2747435 și 2747434 (Țara Chioarului) nu au surse declarate nici pe relație, nici pe segmente. Metadatele OHM nu au fost schimbate.

**P1 (25 ID-uri):** necesită verificarea surselor, rezolvarea avertismentelor fixme:s, clarificarea datelor și a modului de utilizare a surselor cartografice. Unele hărți citate au data 1850 sau ulterioară, deși sunt folosite pe frontiere din secolele XV–XVIII.

**P2 (9 ID-uri):** există indicii de sursă și contururi analizabile, dar trebuie verificat independent dacă documentele susțin perioada și traseul fiecărui segment. Unele surse OHM sunt geodate moderne (LSIB 2024 / Natural Earth) și nu constituie de la sine dovezi pentru frontierele istorice.

## 5. Coroborări externe limitate

- [Tratatul de la Berlin din 1878, art. XLV](https://sourcebooks.web.fordham.edu/mod/1878berlin.asp) și [Muzeul Național de Istorie a României](https://www.mnir.ro/125-de-ani-de-la-proclamarea-independentei/): schimbarea teritorială în sudul Basarabiei; nu sunt încă comparate toate limitele juridice cu coordonatele OHM.
- [FWF Austria](https://www.fwf.ac.at/en/research-radar/10.55776/P15666) și [Encyclopedia of Ukraine](https://www.encyclopediaofukraine.com/pages/B/U/Bukovyna.htm): statutul militar, districtual și de țară a coroanei al Bucovinei.
- [Encyclopaedia Britannica 1911, Transylvania](https://en.wikisource.org/wiki/1911_Encyclop%C3%A6dia_Britannica/Transylvania): marele principat din 1765 și compromisul austro-ungar din 1867.
- [Ciorteanu, 2015](https://doaj.org/article/6d75306010bb495295d6677fb419650f): contextul schimbărilor teritoriale 1918–1940.

Acestea sunt coroborări ale evenimentelor generale, nu verificări independente ale fiecărei linii sau hărți OHM. Nicio relație nu a primit certificat juridic sau geometric istoric complet.

## 6. Dovezi și continuare

Fișierele publicate conțin qualification-per-id-37.csv, consecutive-diffs-26.csv, family-audit-11.csv, source-evidence-per-id.json, cross-family-evidence.json, exceptions.json și manifest.json, plus acest raport. Probele brute și geometriile originale rămân pe computer în Documents/Atlas-OHM-Inventory-2026-11-10/hist-0-4b-evidence, în afara aplicației și a dataseturilor ACTUAL.

**Următorul prag:** HIST-0.4c — închiderea probatorie țintită, întâi 3 cazuri P0, apoi 25 P1 și 9 P2, fără crearea sau corectarea geometriilor până la solicitarea explicită a utilizatorului. Selecția definitivă per-variantă, legăturile părinte–copil, arborii și designul modulului ISTORIC sunt amânate.