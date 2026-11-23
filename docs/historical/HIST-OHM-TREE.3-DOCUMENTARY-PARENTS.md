# HIST-OHM-TREE.3 — completarea părinților documentari fără geometrie

**Data implementării:** 23 noiembrie 2026. **Sursă geometrică activă:** exclusiv OpenHistoricalMap, fără noi poligoane, fără modificarea ACTUAL. **Calificare:** identitatea instituțiilor și unele raporturi temporale părinte–copil, nu contururile sau drepturile de reutilizare.

## 1. Modelul nou

`public/data/historical/v1/documentary-parents.json` definește **11 instituții istorice documentare** cu ID propriu `doc:…`, denumiri RO/EN, categoria instituțională, intervale de **acoperire a dovezii**, proveniență și trimiteri către surse.

Fiecare obiect are explicit `geometryId: null` și `geometryStatus: "NO_GEOMETRY_DOCUMENTARY_NODE"`. Nu adăugăm:
- coordonate, centroizi sau contururi fabricate;
- versiuni OHM pentru acești părinți;
- bife active pe un părinte fără geometrie;
- afirmații că începutul/sfârșitul intervalului de dovadă reprezintă înființarea sau desființarea instituției.

**Identitatea instituției**, **raportul administrativ**, **perioada documentară** și **disponibilitatea geometrică** sunt patru dimensiuni independente. Un părinte poate exista fără o hartă, iar un copil poate avea geometrie OHM incert datată, dar să aibă apartenență administrativă demonstrată.

## 2. Părinții introduși

| ID | Entitate documentară | Funcție |
|---|---|---|
| `doc:kingdom-hungary` | Regatul Ungariei | Comitatele din repertoriul contemporan 1911 |
| `doc:austrian-empire` | Imperiul Austriac | Țări de coroană și teritorii de administrație imperială |
| `doc:habsburg-monarchy` | Monarhia Habsburgică | Teritorii administrate direct de Curtea vieneză înainte de 1804 |
| `doc:galicia-lodomeria` | Regatul Galiției și Lodomeriei | Districtul Bucovina în cadrul administrației galiciene |
| `doc:austrian-crownlands` | Țările Coroanei Austriece (Cisleithania) | Bucovina în jumătatea austriacă a monarhiei dualiste |
| `doc:habsburg-military-frontier` | Administrația Frontierei Militare Habsburgice | Frontiera Militară a Banatului |
| `doc:transnistria-governorate` | Guvernământul Transnistriei | Administrația românească de ocupație, nu provincie anexată |
| `doc:ukrainian-ssr` | RSS Ucraineană | Oblasturi sovietice, cu întreruperile de administrație din 1941–1944 |
| `doc:ussr` | URSS | RSS Moldovenească și RSS Ucraineană în raporturi unionale |
| `doc:czechoslovakia` | Republica Cehoslovacă | Transcarpatia/Rutenia Subcarpatică în etapa interbelică |
| `doc:russian-empire` | Imperiul Rus | Gubernia Basarabia, conservator 1878–1916 |

Structurile sunt **entități istorice de catalog, nu categorii UI și nu poligoane**. Nu confundăm administrația Galiciei cu un hotar al Ducatului Bucovinei și nici Monarhia Habsburgică cu statul austro-ungar dualist de după 1867.

## 3. Relațiile admise

Total în registrul `ohm-parentage.json`: **96 de relații datate** = **46 păstrate** + **50 noi**. Dintre noile relații, **47** duc la grupuri OHM și **3** între părinți fără geometrie, pentru a permite lanțuri multinivel.

### 3.1. Regatul Ungariei — 1911

**28 de comitate OHM** apar ca copii temporali ai Regatului Ungariei numai pentru **anul de observație 1911**. Fiecare are un nume corespondent verificabil în repertoriul contemporan: *Encyclopædia Britannica*, ediția 1911, articolul `Hungary`, secțiunea `Administrative Divisions`.

Sursă: https://en.wikisource.org/wiki/1911_Encyclop%C3%A6dia_Britannica/Hungary

Articolul enumeră explicit, printre altele, comitatele Temes, Torontál, Arad, Krassó-Szörény, Szilágy, Máramaros, Bereg, Zemplén și cele cincisprezece comitate transilvănene standardizate prin reforma din 1876.

**Limita calificării:** reperul 1911 **nu certifică automat întreaga perioadă 1876–1918** și nici hotarele din poligoanele OHM. Unsprezece grupuri OHM de comitate nu au admis această relație: versiuni în afara anului 1911, instituții reorganizate ori intervale defecte. **Comitatul Ung** (sursă OHM cu aceeași dată la început și sfârșit) rămâne pe `HOLD` geometric/temporal, chiar dacă repertoriul istoric atestă existența unui comitat Ung în 1911.

### 3.2. Structurile imperiale și galiciene

Sunt admise relații conservator datate între Monarhia Habsburgică și Banatul Timișoarei; administrația militară habsburgică și Frontiera Militară a Banatului; Imperiul Austriac și Voivodina Sârbească/Banatul Timișan, Transilvania și Bucovina; Țările Coroanei Austriece și Bucovina; Galiția și Districtul Bucovina. Este admisă și încadrarea documentară Galiția → Monarhia Habsburgică (până în 1803), respectiv Galiția → Imperiul Austriac (1804–1848).

Referințe:
- Studiu despre autonomia și administrația Habsburgică a Banatului: https://www.ceeol.com/search/article-detail?id=983852
- Istoria administrativă a Bucovinei, Galiției și monarhiei austriece: https://study.scicenter.online/history-ukraine/ukrainian-lands-under-habsburg-rule-1772-105691.html
- Monarhia dualistă și teritorii de coroană: https://pmc.ncbi.nlm.nih.gov/articles/PMC4959110/
- Frontiera Militară: https://www.academia.edu/51080504/The_Local_Elite_in_Central_Government_Service_Banat_Military_Frontier_Officers_in_the_18_th_Century

**Bucovina și Districtul Bucovina sunt tratate ca etape sau instituții administrative diferite**, nu automat ca un părinte și copil, chiar când folosesc același contur-sursă.

### 3.3. Guvernământul Transnistriei, 1941–1944

Admise numai ca relații de **administrație românească de ocupație**:
`Guvernământul Transnistriei → Județul Jugastru/Iugastru, Județul Moghilău, Județul Tulcin`.

Interval conservator `1941-09-12 – 1944-03-31`, fără afirmație de anexare juridică a teritoriului de dincolo de Nistru. Documentul istoric despre Ordonanța nr. 8 din 12 septembrie 1941 enumeră aceste județe: https://administrare.info/istorie/administrarea-teritoriului-romaniei-in-timpul-cel-de-al-doilea-razboi-mondial/

### 3.4. URSS / RSS Ucraineană / oblasturi și RSS Moldovenească

Sunt admise lanțuri instituționale ca `URSS → RSS Ucraineană → Regiunea Cernăuți / Regiunea Ismail / Regiunea Transcarpatia` și `URSS → RSS Moldovenească`, limitate la perioade documentare. Akkerman este ținut separat de Ismail ca etapă de reorganizare, nu subordonat regiunii Ismail.

- Cernăuți: 1940–1941 și etapa postbelică, **separate**. Arhivele de stat ale regiunii: https://old.archives.gov.ua/Eng/Archives/ra25.php
- Ismail: 1940–1941 și 1945–1954, **separate**; analiză istorică: https://edu.lvivcenter.org/en/modules/izmail-region-in-soviet-memory-eng/
- Transcarpatia: regiune sovietică de la 1946; Encyclopedia of Ukraine: https://www.encyclopediaofukraine.com/display.asp?linkpath=pagesTRTranscarpathia.htm
- RSS Moldovenească, republică unională: https://www.encyclopediaofukraine.com/display.asp?linkpath=pages%5CM%5CO%5CMoldavianSovietSocialistRepublic.htm
- Document diplomatic contemporan din 1940 despre RSS Ucraineană: https://history.state.gov/historicaldocuments/frus1940v01/d522

**Nu extrapolăm guvernarea sovietică efectivă peste intervalele ocupației din 1941–1944.** Subordonarea constituțională, administrarea efectivă și hotarul geometric sunt separate.

### 3.5. Cehoslovacia și Imperiul Rus

`Republica Cehoslovacă → Transcarpatia`: interval conservator 1921–1937, înainte de schimbările de autonomie și frontieră din 1938; Encyclopedia of Ukraine: https://www.encyclopediaofukraine.com/display.asp?linkpath=pages%5CS%5CU%5CSubcarpathianRuthenia.htm

`Imperiul Rus → Gubernia Basarabia`: 1878–1916; studiul privind trecerea Basarabiei de la statut de oblast la gubernie precizează schimbarea administrativă din anii 1870: https://pressto.amu.edu.pl/bp/article/view/19029. Nu redenumim retroactiv perioada de oblast ca gubernie doar fiindcă geometria-sursă OHM o numește astfel.

## 4. Cerințe tehnice și QA

- `validateDocumentaryParents` verifică ID-urile, denumirile bilingve, sursele, ferestrele documentare, `geometryId=null` și interdicția certificării hotarelor.
- `validateOhmParentage` acceptă ținte `doc:…` **numai** dacă există în registru și întregul interval al relației cade într-o fereastră documentară admisă. Respinge părinți inexistenți, conflicte temporale, cicluri, date incorecte sau lipsa dovezii.
- `buildHistoricalOhmTree` creează noduri fără geometrie numai dacă au acoperire documentară pentru anul selectat; acestea pot avea copii OHM sau alți părinți documentari.
- Browserul afișează un marcaj neutru `DOC`, fără bifă de geometrie, cu informații despre perioada documentară și dovezi deschise la cerere. Selecțiile cu bife continuă să acționeze numai asupra versiunilor OHM.
- Contractele de regresie păstrează **76 de grupuri OHM, 139 de versiuni, 125 de geometrii distincte**, deduplicarea existentă și resetarea separată de ACTUAL.

**Evidență verificabilă:** `docs/historical/import/HIST-OHM-TREE.3-DOCUMENTARY-PARENTS-QA.json` inventariază toate cele 76 de grupuri OHM, noile legături și cele încă nesusținute. `tests/hist-ohm-tree-3-documentary.test.mjs` verifică 1911, 1942, 1946, 1835, geometriile absente și cazurile de refuz.

## 5. Ce rămâne `HOLD`

- Comitate din alte intervale decât 1911, în special **Ung**, Csanád-Arad-Torontál după 1923, Bereg-Ugocsa, Békés-Csanád și reorganizările austriece din 1850–1860.
- Modificări de raport părinte–copil în același an, unde arborele selectat doar după an nu poate distinge două date; registrul păstrează exact datele, dar ierarhia anuală nu alege arbitrar.
- Partium, Zaránd și Chioar în perioade rămase neprobate.
- Etapele de ocupație / război și modificările efective de frontieră care nu se deduc din statutul instituțional.

**Următorul lot:** calificarea cronologică a comitatelor în intervalele neacoperite, respectiv pregătirea integrării **județelor și plășilor din 1930** în același model entitate–versiune–geometrie–parentaj. **HistoGIS rămâne sursă de completare numai la final.**
