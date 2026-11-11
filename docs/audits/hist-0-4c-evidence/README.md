# HIST-0.4c — Închiderea probatorie țintită: cercetare documentară realizată, frontiere încă necertificate

Data auditului: 11 noiembrie 2026. Bază: main d8f63ee2256c2bd171e35f726c2e94a1a9179471 (HIST-0.4b / PR #91). Dovezile brute OHM din HIST-0.2/HIST-0.4b rămân nemodificate.

**Verdict: HIST-0.4c DOCUMENTARY_RESEARCH_COMPLETED_WITH_OPEN_PROBATIVE_GAPS. 37/37 dosare cercetate, 0/37 geometrii istorice certificate, 0 importuri.** Nu s-au creat, decupat ori corectat contururi. Nu s-au construit arbori sau interfețe.

## 1. Metodă

Au fost păstrate cele 37 de ID-uri OHM, cele 11 familii principale și prioritățile existente (3 P0, 25 P1, 9 P2). Pentru fiecare variantă: ID, perioadă OHM, contur tehnic, gradul surselor, documentele externe găsite, faptele istorice susținute, eventualele contradicții și acțiunea care poate completa dosarul.

Un tratat care fixează un transfer ori o lucrare ce atestă existența unei administrații NU confirmă automat precizia geometrică a fiecărei limite OHM. Geometriile rămân înregistrări de inventar, nu limite istorice certificate.

## 2. Cele trei dosare P0

| ID OHM | Familie | Progres probatoriu | Blocaj rămas |
|---|---|---|---|
| [2747433](https://www.openhistoricalmap.org/relation/2747433) | Transilvania | Sursele istorice disting 1765 (Mare Principat) și 1867 (compromis austro-ungar). | end_date OHM 1732 și end_event 1867 se contrazic; nu am modificat OHM. |
| [2747435](https://www.openhistoricalmap.org/relation/2747435) | Țara Chioarului, 1650–1851 | Arhivele Statului și trimiterea la monografia din 1725 susțin existența istorică a districtului. | Nu există surse OHM pe relație sau pe cele 15 ways; poligonul nu este validat istoric. |
| [2747434](https://www.openhistoricalmap.org/relation/2747434) | Țara Chioarului, 1860–1876 | Publicația Arhivelor Statului (1987, p.28) documentează reorganizarea și desființarea în 1876. | Lipsa surselor pentru cele 15 ways și intervalul de 3517 zile dintre versiuni sunt încă neclarificate. |

P0 rămân DESCHISE; consolidarea dovezilor privind instituția nu reprezintă închiderea juridică ori cartografică a conturului.

## 3. P1 și P2 — evaluare pe familii

| Familie | Coroborare independentă | Probă lipsă |
|---|---|---|
| Țara Românească | Studiu istoric privind Brăila după Adrianopol 1829. | Documente contemporane pentru 1417, 1420, 1538 și planuri ale raialelor. |
| Țara Moldovei / Gubernia Basarabia | Tratatele Paris 1856 (art. XX–XXI) și Berlin 1878 (art. XLV). | Procese-verbale de delimitare și hărți de tratat georeferențiate. |
| Transilvania | Enciclopedia Britannica (1911): 1765, 1867–1868. | Patente istorice, hărți ale frontierelor pe fiecare perioadă OHM. |
| Bucovina / Districtul Bucovina | Encyclopedia of Ukraine: regim militar, integrare în Galiția, țară a coroanei 1849, statut 1861. | Planuri și hărți datate din epocă, nu proxy geografic modern. |
| Banatul Timișoarei și Frontiera Militară | Studiu CEU: separare civil/militar din 1751; realizarea frontierei militare a fost graduală. | Acte imperiale și planuri pentru 1751–1764; reziduu geometric OHM de 7,09 km². |
| Voivodina Sârbească și Banatul Timișan | Fonduri arhivistice autentice 1849–1861 și cronologia Consiliului Județean Timiș. | Decretele 1849/1860 și hărțile de organizare la scara potrivită. |
| Principatele Unite | Convenția de la Paris 1858 și Tratatul de la Berlin 1878. | Compararea anexelor și limitelor exacte, inclusiv Dobrogea. |
| Regatul României | Tratatele București 1913, Craiova 1940 și Paris 1947; documente diplomatice 1944. | Hărțile tratatelor; distincția între suveranitate, ocupație și control militar; lacuna 342 zile 1944–1945. |

## 4. Clarificare necesară: România și Guvernământul Transnistriei, 1941–1944

Muzeul Memorial al Holocaustului din SUA (USHMM) descrie Guvernământul Transnistriei ca unitate administrativă românească a unui teritoriu ucrainean ocupat, neanexat suveran de România, între Nistru și Bugul de Sud. Varianta OHM 2693255 nu poate fi tratată ca hotar suveran al Regatului doar pe baza unui atribut de tip kingdom. Eventuala reprezentare istorică a ocupației este un subiect editorial distinct și necesită decizie explicită.

## 5. Surse și verificabilitate

Documentele colectate sunt menționate individual în external-source-register-18.json, cu tip, autoritate, URL, domeniu de aplicabilitate și limită. Câteva PDF-uri au avut extragere de text disponibilă, dar verificarea paginii vizuale a eșuat; cazul este declarat în registru. Versiunea FRUS 1878 poate reda anul tratatului anterior drept 1858, deși documentul original al tratatului indică 1856; referințele nu au fost corectate artificial.

Principalele referințe: [Tratatul Paris 1856](https://content.ecf.org.il/files/M00934_TreatyOfParis1856English.pdf), [Tratatul Berlin 1878](https://history.state.gov/historicaldocuments/frus1878/d523), [Convenția 1858](https://legislatie.just.ro/public/DetaliiDocument/21852), [Arhivele Statului 1987 — Chioar](https://biblioteca-digitala.ro/reviste/carte/arhivele-nationale/dl.asp?filename=fenesan_izvoare-demografie-istorica_vol-II_XlX_transilvania_1987.pdf), [Britannica 1911 — Transilvania](https://en.wikisource.org/wiki/1911_Encyclop%C3%A6dia_Britannica/Transylvania), [USHMM — Transnistria](https://encyclopedia.ushmm.org/content/en/article/transnistria-governorate), [Tratatul Craiova 1940](https://legislatie.just.ro/public/DetaliiDocument/23040), [Tratatul Paris 1947](https://legislatie.just.ro/public/DetaliiDocument/126153).

## 6. Protecție și pragul următor

HIST-0.4b a fost reverificat independent în această sesiune: 37/37 SHA256 ale membrilor OHM concordante cu arhiva, 26/26 comparații de arie/intersecție/diferență simetrică reproduse fără diferențe, 0 erori de geometrie. Toate metadatele din prezentul audit sunt numai documentare. Nu au fost atinse ACTUAL, SIM/WEB, aplicația, geometriile originale sau arborele ISTORIC.

Concluzie: cercetarea contextuală pentru P0, P1 și P2 este documentată, dar certificatele istorico-geometrice și admiterea la import rămân blocate. Următoarea operațiune permisă este obținerea documentelor cartografice primare pentru 37 contururi și confruntarea fiecărui segment OHM cu limitele originale, fără creare/correctare automată de geometrii.

## 7. Artefacte

- qualification-targeted-per-id-37.csv — dosarele individuale, sursele și motivele menținerii blocajului.
- p0-targeted-findings-3.json — cele trei cazuri prioritare neînchise artificial.
- external-source-register-18.json — 18 înregistrări bibliografice cu proveniență și calificare.
- family-status-11.csv — situația pe familii.
- exceptions-persisting-7.json — excepții și observații transversale.
- manifest.json — totaluri, hashuri și limitele certificării.