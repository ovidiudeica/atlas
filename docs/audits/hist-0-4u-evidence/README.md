# HIST-0.4u — martorul KÖWAR/Holst și calificarea reperelor Chioar

**Data:** 15 noiembrie 2026. **Bază:** main@9d26c56c34f4db5ea2213ff391748245daef8716. **Predecesor:** HIST-0.4t.

## Rezultatul probatoriu nou

Am identificat și recuperat efectiv reproducerea digitală integrală a unei gravuri istorice despre Cetatea Chioarului: **KÖWAR in Transiluania**, semnată **J. V. Holst Obr. fecit**. Exemplarul este din **Bibliothèque nationale de France, département Cartes et plans, GE D-14179**, cu identificatorul Gallica **btv1b8492308h**, disponibil gratuit pe [Wikimedia Commons, pagina fișierului](https://commons.wikimedia.org/w/index.php?curid=120425983).

Am descărcat pe calculatorul conectat exemplarul JPEG complet și am verificat dimensiunea și conținutul: **5.997.772 octeți**, **6.260 × 5.108 pixeli**, **SHA-256 4d035db75c147ce2ec56118577ae3747287edf268de98cabb68be406df3c7b8f**. A fost inspectată vizual gravura, inclusiv legenda A–I și semnătura. Nu am încărcat rasterul în GitHub și nu am modificat arhiva Geodata GIS.

Este o **perspectivă/vedere oblică** a sistemului de fortificații, nu o ridicare topografică ortorectificabilă cu scară, datum sau precizie metrică demonstrată. Sursa este nouă pentru registrul arhitectural istoric al proiectului, dar nu certifică geometria unui hotar și nu înlocuiește originalul austriac 1:25.000 al planșei din 1924.

## Datarea nu este unică

Trei atestări diferite trebuie păstrate separat:

- **1658**: anul atribuit gravurii în metadatele BnF/Commons; nu a fost găsit pe imagine un an de ridicare care să certifice această dată.
- **1661**: anul **ridicării estimative** atribuite colonelului „Johan von Holst”, potrivit figurii 2 din [Iosipescu–Ursu–Ursu, 1983](https://www.persee.fr/doc/mcarh_0076-5147_1983_num_15_1_1851); acesta este un martor bibliografic secundar.
- **1670**: anul de publicare al volumului I din [Gualdo Priorato, Historia di Leopoldo Cesare](https://books.google.com/books?id=f0QgAQAAMAAJ), unde gravura este indicată bibliografic la pp. 726–727. Plansa din cartea originală nu a fost confruntată pixel cu pixel.

[Keresztény Múzeum, inv. 1975.4702.1](https://katalogus.keresztenymuzeum.hu/mutargy/1172/kovar-madartavlati-kepe), indică **Jacob von Holst**. Autorii din 1983 folosesc **Johan von Holst**, iar pe gravură scrie numai **J. V. Holst**. Identitatea completă și data releveului **nu au fost reconciliate**.

## Legenda din original

| Simbol | Descriere | Utilizare probatorie |
|---|---|---|
| A | Cetatea mare | Complex, nu punct |
| B | Cetatea mică | Complex, nu punct |
| C | Râpe și stânci | Relief, nu GCP fix |
| D | Râul Lăpuș | Hidrografie, curs variabil |
| E | Pajiște | Descriere de peisaj |
| F | Munți împăduriți | Descriere de peisaj |
| G | **Intrarea cetății mari** | Candidat arhitectural individual |
| H | **Intrarea cetății mici** | Candidat arhitectural individual |
| I | Drumul spre Baia Mare | Traseu, nu punct stabil certificat |

Sursa [Keresztény Múzeum](https://katalogus.keresztenymuzeum.hu/mutargy/1172/kovar-madartavlati-kepe) furnizează etichetele originale în italiană, iar imaginea recuperată arată efectiv simbolurile.

## Confruntarea cu monumentul și cercetările arheologice

[RAN 108525.01 / LMI MM-I-s-A-04369](https://ran.cimec.ro/?codran=108525.01) identifică situl fortificat medieval de la Berchezoaia. Raportul arheologic [1979](https://www.persee.fr/doc/mcarh_0076-5147_1979_num_13_1_1494) descrie porți, turnuri și sectoare excavate. Raportul din [1983](https://www.persee.fr/doc/mcarh_0076-5147_1983_num_15_1_1851) descrie turnul estic al porții curții centrale și citează planul atribuit lui Holst.

**Nu echivalăm automat** intrarea G/H cu turnul descris de arheologi. Nu am identificat un colț de zid comun demonstrat printr-un plan de săpătură la scară, printr-un pixel unic în planșa din 1924 și prin coordonatele unui releveu modern independent. Localizatorul RAN este un punct pentru întregul sit, nu un vârf geodezic.

Candidatele Buteasa/Vălenii Șomcutei și excluderile celor două biserici mutate rămân în starea certificată anterior, în HIST-0.4s-LM1.

## Filiația foii austriece — încă necunoscută

[Șomcuta Mare 2977, 1924](../hist-0-4s-evidence/README.md) este o reproducere la 1:20.000, declarată explicit după o hartă austriacă la **1:25.000**. Am verificat indicii de serie MAPSTER KUK025, Cholnoky TOP-3KF-25, Arcanum Third Survey 1:25.000 și catalogul cartografic ceh ČÚZK. Nu am recuperat originalul individual 1:25.000 cu identificatorul și anul ridicării locale.

**Gaura und Galgó 16 XXIX (5071)** reprezintă o ediție regională la **1:75.000**, cunoscută în edițiile 1886 și 1900, nu dovada originalului 1:25.000 și nici a hotarului din 1859/1877.

## Verdict și poarta următoare

**1 gravură de epocă recuperată și verificată binar; 9 simboluri documentare citite; 2 intrări arhitecturale candidate; 0 GCP-uri noi; 0 puncte holdout; RMSE nou nedefinit; 0/15 segmente Chioar, 0/82 segmente Transilvania, 0/37 relații OHM admise.**

Următorul pas, **HIST-0.4v**, este confruntarea intrărilor G/H cu planurile individuale din campaniile arheologice și cu un releveu modern al acelorași colțuri de zid, în paralel cu identificarea foii austriece originale 1:25.000. O perspectivă din secolul XVII nu trebuie transformată prin ajustare afină într-o hartă metrică a hotarului.

**Restricții respectate:** fără emailuri, contacte instituționale, plăți, comenzi, abonamente, publicarea imaginilor, modificarea ACTUAL/OSMB/OHM/Geodata GIS ori a website-ului Atlas. Date structurate în primary-evidence.json; validator reproducibil în validate-evidence.mjs.
