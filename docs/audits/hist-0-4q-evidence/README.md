# HIST-0.4q — schimbarea sursei geometrice, zona Chioar

**Data:** 12 noiembrie 2026. **Repository:** `ovidiudeica/atlas`. **Bază:** `main@591b86bc0a501906561a9e1cc02337e7b21f0f76`. **Fără emailuri, contacte instituționale, comenzi, plăți ori import de frontiere.**

## 1. HIST-0.4p: certificare tehnică post-merge

[GitHub Actions run 43213366811](https://github.com/ovidiudeica/atlas/actions/runs/43213366811) are ambele joburi `success`: verificare build/regresii/Chromium desktop/mobil și deploy GitHub Pages. Aceasta închide CI-ul etapei anterioare, nu certificarea cartografică.

## 2. O sursă cartografică efectiv recuperată pentru Chioar

Am consultat [eHarta — geo-spatial.org](https://geospatialorg.github.io/initiative/eharta/), **nu doar catalogul**. Serverul [GeoServer WMS GetCapabilities](https://services.geo-spatial.org/geoserver/eharta/ows?service=WMS&version=1.3.0&request=GetCapabilities) a răspuns HTTP 200, XML de 307.697 octeți. În colecția `eharta` sunt publicate straturile `mozaic_planuri_tragere_20k` (CRS EPSG:3844/CRS:84), `mozaic_austrian_200k` (EPSG:31700/CRS:84), `misc_karte_von_siebenburgen` (EPSG:31700/CRS:84). Acestea acoperă poziția Chioarului.

Am obținut, deschis și verificat local **cinci răspunsuri raster PNG** la GetMap WMS 1.1.1, în bbox-uri WGS84 (lon,lat), fără să le republicăm. Identificatorii, cererile exacte, dimensiunile fișierelor, hashurile SHA-256 și dimensiunile rasterelor sunt în `eharta-chioar-wms-reproducible-images.json`.

**Descoperire probatorie:** în decupajul **1:20.000** al sectorului `23.552,47.462,23.607,47.492` se citește explicit inscripția **„Ruine Chioarului (Kővár)”**, pe culmea abruptă de lângă meandrul Lăpușului, cu detaliu de relief și o cotă **406** în vecinătate. Aceste simboluri sunt conținutul unei hărți istorice, nu un cerc turistic modern suprapus. Existența ruinelor ca loc cartografiat este confirmată la nivel de sit, inclusiv în sursa detaliată.

[GetMap public, decupaj Kővár 1:20.000](https://services.geo-spatial.org/geoserver/eharta/ows?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&LAYERS=eharta%3Amozaic_planuri_tragere_20k&STYLES=&SRS=EPSG%3A4326&BBOX=23.552%2C47.462%2C23.607%2C47.492&WIDTH=1600&HEIGHT=1000&FORMAT=image%2Fpng&TRANSPARENT=true)

**Aceasta NU este o dovadă că foaia ar reprezenta situația din 1859.** [Documentația eHarta privind Planurile Directoare de Tragere](https://www.geo-spatial.org/vechi/download/planurile-directoare-de-tragere) descrie o serie națională ulterioară, emisă între **1917 și 1959**, ale cărei foi pot proveni din ridicări și actualizări de date diferite. WMS livrează **mozaicul georeferențiat**, nu identificatorul, data originală și raportul reziduurilor **foii** care intersectează cetatea. Aceste câmpuri rămân `null` în registru.

Mai multe poziții moderne ale sitului confirmă aceeași regiune, dar nu au demonstrat măsurători geodezice independente ale aceluiași bastion. Cota „406” poate fi testată doar după identificarea semnului exact al reperului topografic și a datumului altimetric; nu este un GCP prin simpla citire numerică.

## 3. Calificarea surselor originale, fără eroarea de scară

Am comparat trei clase de surse:

1. **Cadastrul istoric** la 1:2.880 (uneori 1:1.440 sau 1:720), fondul MNL S78 / anexele fondului S79, util pentru identificarea clădirilor și parcelelor. [Metodologia MNL](https://adatbazisokonline.mnl.gov.hu/adatbazis/kataszteri-telekkonyvek/informacio) avertizează că fondul conține **predominant localități din Ungaria actuală**, doar sporadic foste județe transfrontaliere. Originalul datat pentru Berkeszpataka **nu a fost identificat sau descărcat**, iar portalele Hungaricana/Arcanum au răspuns HTTP 403. Nu presupunem că există o foaie locală.
2. **Ridicările militare ale Transilvaniei** din jurul anilor 1860–1872, secțiuni la **1:28.800**, nu automat 1:25.000. [BEV — autoritatea cartografică austriacă](https://www.bev.gv.at/en/Services/Products/Maps.html) precizează scara excepțională transilvăneană, iar [Timár–Molnár–Imecs–Păunescu](https://technicalgeography.org/pdf/1_2007/gt_1_2007.pdf) discută dificultățile de datum, lipsa unei rețele uniforme și rectificarea prin repere. **Nicio foaie originală Chioar datată din acest interval nu a fost recuperată.**
3. **Foile topografice și seriile derivate ulterioare**. Mozaicul eHarta 1:20.000 este acum **disponibil și verificat efectiv** pentru sit; la 1:200.000 se citesc toponimele istorice Berkeszpataka, Butyásza și valea Lăpușului, dar nu se măsoară geodezic un bastion. Edițiile MAPSTER 1886 și 1900 de la 1:75.000 rămân localizate în catalog, fără rastrul original verificat.

Am verificat și [colecția Cholnoky din Cluj](https://hagyatek.cholnoky.ro/terkeptar/digitalizalt/top-3k-25e/): o imagine este legată explicit de foaia **Kolozsvár 5271/4**, deci nu este certificată pentru **Chioar**. Noua interfață de căutare `cholnokymaps.gisit.ro` nu a fost accesibilă. Nici această sursă nu este promovată automat pe baza apartenenței la Transilvania.

## 4. Poarta dublă de certificare

**I. Calificarea sursei:** raster public existent, acoperire reală, proveniență și drepturi, data fiecărei foi, tipul ridicării, metoda georeferențierii și calitatea controlului. **Parțial trecută** pentru eHarta 1:20.000: raster și localizare da; foaie, dată și precizie individuală **nu**.

**II. Calificarea punctului:** o structură/un reper univoc în sursa originală (nu textul numelui de localitate), același obiect în fotografia MNL 1859 ori într-o altă hartă contemporană, coordonată geodezică independentă a exact aceluiași obiect, eroare punctuală documentată, apoi puncte suplimentare și validare holdout. **Neîndeplinită:** avem un loc cu ruine etichetat pe o hartă târzie, nu un punct exact MNL ↔ bastion modern.

Acesta este motivul pentru care **0 GCP-uri sunt admise**, **RMS-ul nou este nedefinit**, **0/14 fotografii MNL** sunt certificate georeferențiat, **0/82 segmente Transilvania**, **0/15 segmente Chioar** și **0/37 relații OHM** sunt promovate.

**Limita juridică este distinctă:** hotarele cadastrale de parcelă sau traseele istorice vizibile nu devin prin georeferențiere hotare administrativ-teritoriale. Nicio modificare a formei legale `Szt.-Kápolnok` și nicio certificare de comună/poligon nu este autorizată de acest dosar.

## 5. HIST-0.4r — acțiune probatorie recomandată

Continuarea justificată este **identificarea foii componente originale eHarta 1:20.000 pentru ruinele Chioarului**, inclusiv *titlu/cod de foaie, an tipărire, an ridicare, eventuală retipărire, sursă militară anterioară și transformare/reziduuri*; apoi alegerea unui vârf de bastion, punct de triangulație ori edificiu stabil demonstrat individual și compararea sa cu o sursă anterioară anului 1877. Dacă fotografia administrativă MNL nr.2 nu îl prezintă ca simbol, ea **nu** poate servi drept foaie de bază pentru acel punct. Pentru certificarea hotarelor, actul juridic și sursa geometrică a limitelor se admit separat.

**Fără contacte instituționale și fără imagini ori geometrii noi publicate.** Cele cinci decupaje WMS și copiile de lucru rămân exclusiv pe calculatorul conectat al utilizatorului; repository-ul conține numai fișe, linkuri, hashuri și verificări.
