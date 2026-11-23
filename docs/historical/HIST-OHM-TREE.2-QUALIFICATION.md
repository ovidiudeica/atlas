# HIST-OHM-TREE.2 — calificarea sistematică a părinților OHM

**Data evaluării:** 23 noiembrie 2026. **Sferă:** catalogul OHM existent, nu județele/plășile din 1930 importate dintr-o altă sursă. **Tipul admiterii:** exclusiv `direct_administrative_membership`, datată și documentată, fără certificarea conturului geometric sau a continuității identității OHM.

## Registrul complet

Pentru **toate cele 76 de grupuri OHM** a fost produs un dosar individual în `docs/historical/import/HIST-OHM-TREE.2-QUALIFICATION-QA.json`. Fiecare conține ID-urile relațiilor OHM, perioadele declarate de sursă, verdict, părintele-candidat (dacă există), documentele folosite sau încă lipsă, următoarea acțiune și avertismentul privind hotarul necertificat.

| Verdict individual | Grupuri |
|---|---:|
| Relație temporală calificată în cel puțin un interval | 19 |
| Părintele necesar nu există în OHM | 16 |
| Părinte extern / cronologie comitatensă neverificată | 35 |
| Zaránd — împărțire teritorială, nu poate fi atașat integral | 1 |
| Ung — interval OHM de o singură zi, defect temporal de verificat | 1 |
| Entitate politică rădăcină (nu i se inventează părinte) | 4 |
| **Total** | **76** |

**19 relații admise** în registrul `public/data/historical/v1/ohm-parentage.json`: trei din etapa anterioară și șaisprezece noi. **57 de grupuri nu au relație admisă**: 53 necesită completarea parentajului sau revalidarea temporală, iar patru sunt rădăcini politice care nu au nevoie automat de un părinte în acest catalog.

### A. Județe OHM din România, anul 1930

Pe lângă Arad, Maramureș și Timiș-Torontal, admise anterior pentru 1926–1938, sunt documentate prin `Monitorul Oficial` din 22 ianuarie 1930 alte **13 județe**:

Bacău, Botoșani, Covurlui, Dorohoi, Fălciu, Iași, Neamț, Putna, Roman, Suceava, Tecuci, Tutova și Vaslui.

**Sursă primară:** `Monitorul Oficial`, Partea I, nr. 17 bis / 22 ianuarie 1930, p. 680, Decretul nr. 43, Art. I, cu enumerarea județelor și repartizarea a 322 de plăși: https://www.resurse.net/mo/1930/19300122bis.pdf.

**Verdict:** apartenență directă la Regatul României pentru **anul de observație 1930** (interval operațional 22 ianuarie – 31 decembrie 1930, nu afirmație că apartenența a încetat la 31 decembrie). Nu se extinde automat în 1931, în 1925 sau în orice altă perioadă. Pentru 13 dintre aceste județe, OHM are `end=null` în intervalul început în 1859: **apartenența este documentată, dar geometria nu este calificată pentru 1930**. Bifa de entitate nu activează automat poligonul, iar în modul filtrat pe an geometria incertă rămâne indisponibilă.

Nu am importat niciun poligon al plășilor din 1930 și nu am certificat vreo limită a județelor în acest pas.

### B. Partium și Transilvania, 1733–1847

Sunt admise trei relații față de **Transilvania**:

- Țara Chioarului / Kővárvidék;
- Comitatul Kraszna / Crasna;
- Comitatul Közép-Szolnok / Solnocul de Mijloc.

**Dovezi:** `Partium`, *Magyar Katolikus Lexikon* (decretul imperial din 31 decembrie 1732, ratificare 16 februarie 1733) https://lexikon.katolikus.hu/P/Partium.html; Onojescu–Iudean–Popovici, *Parliamentary Representation in Eastern Hungary (1861–1918)*, pp. 215–217, https://www.academia.edu/26742369/Parliamentary_Representation_in_Eastern_Hungary_1861_1918_Preliminary_Results_of_a_Prosopographic_Inquiry.

**Verdict:** administrare transilvăneană în intervalul conservator **16 februarie 1733 – 31 decembrie 1847**. Perioada 1848–1860 include transformări incompatibile cu o simplă extrapolare. **Zaránd** rămâne neadmis integral: decretul din 1732 a împărțit comitatul, iar sursa OHM nu demonstrează că poligonul său corespunde numai porțiunii rămasă sub Transilvania.

### C. Comitatele ungare și țările/părinții absenți

Majoritatea comitatelor din anii 1876–1918 depindeau de **Regatul Ungariei**, absent din lotul OHM; nu devin automat copii ai Transilvaniei. Contextul independent se găsește în *Encyclopædia Britannica* (1911), `Hungary – Administrative Divisions`, care enumeră comitatele și diferențiază reforma din 1876: https://en.wikisource.org/wiki/Page%3AEB1911_-_Volume_13.djvu/925. Pentru epoci pre-1876 există reorganizări austriece și ungare diferite; acestea cer identificarea exactă a instituției părinte și a intervalului. Niciuna nu a fost „completată” din suprapunerea poligoanelor.

**Județele Iugastru/Jugastru, Moghilău și Tulcin** au funcționat în **Guvernământul Transnistriei**, absent din catalog, nu direct sub Regatul României în arhitectura de subdiviziuni. Studiul administrativ: V. Stănică, *Administrarea teritoriului României în timpul celui de-al doilea război mondial*, pp. 110–111: https://rtsa.ro/rtsa/index.php/rtsa/article/download/166/162/323.

Alte unități cu **părinți absenți**: gubernia Basarabiei (Imperiul Rus), regiuni sovietice Cernăuți/Ismail/Akkerman/Transcarpatia (RSS Ucraineană), RSS Moldovenească (URSS), Transcarpatia 1920–1938 (Cehoslovacia), provincia Voivodina Sârbească și Banatul Timișan (Imperiul Austriac), districtul Bucovinei (administrație galiciană/imperială). **Bucovina ≠ Districtul Bucovina ca părinte–copil** pe simplul motiv că au folosit același contur în ani diferiți; poate fi schimbare de regim administrativ.

### D. Excepții prioritare

- **Comitatul Ung:** OHM raportează `1876-06-19 → 1876-06-19`. Nu este o durată certificată a unei entități și nu poate fi folosit pentru o ierarhie cronologică fără revizuirea relației originale.
- **Comitatul Zaránd:** împărțit; trebuie identificată exact porțiunea transilvăneană înainte de subordonare.
- **Comitatele post-1920:** Bereg, Csongrád, Békés, Csanád-Arad-Torontál etc. necesită admitere separat pentru unitățile din Regatul Ungariei după tratatele de pace, fără prelungirea ierarhiei pre-1918.
- **Bucovina, Partium și Transcarpatia:** schimbări succesive de administrație trebuie modelate ca evenimente/versiuni, nu ca relații de parentaj între contururi identice.

## Consecințe pentru implementare

În `src/data/historicalOhmTree.mjs` relațiile documentare părinte–copil **nu mai depind de existența unui poligon OHM calificat temporal pentru același an**. De exemplu, în 1930, **16 județe** apar sub Regatul României, însă **13 geometrii cu dată finală necunoscută nu sunt bifate automat**. În 1800 apar **3 copii Partium** sub Transilvania, iar în 1939 nici legăturile din 1930, nici cele din 1926–1938 nu sunt prelungite. Acestea sunt *verificări de model*, nu certificări de frontieră.

**Neschimbate:** 139 versiuni OHM, 125 geometrii distincte, deduplicarea exactă, fișierele originale, toate datele ACTUAL, arhiva HistoGIS. Nu au fost importate județele/plășile din 1930 din surse noi în acest PR.

## Următoarea calificare permisă

Pentru a integra toate celelalte unități în arbore trebuie întâi aduse, documentate și datate (posibil **fără geometrie inițială**) nodurile-superioare care lipsesc: Regatul Ungariei, administrația imperială austriacă/galiciană, Guvernământul Transnistriei, RSS Ucraineană, Cehoslovacia și Imperiul Rus, în funcție de evidența fiecărei unități. Abia după aceasta se poate completa gradual și prudent parentajul comitatelor, oblasturilor și al celorlalte grupuri. Județele și plășile anului 1930 vor utiliza același model de entități, relații și geometrii comune.
