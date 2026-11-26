# RASSM — proiect QGIS curent de cercetare, clasa C

Descarcă `RASSM_QGIS_PORTABLE_C.zip`, extrage toate fișierele într-un singur director și deschide `RASSM_LATEST_RESEARCH_C.qgz` în QGIS. Nu deschide proiectul direct din interiorul ZIP-ului. Nu este necesară conexiunea la internet sau vreun pachet PROOF anterior. Pentru descărcare separată, păstrează `.qgz` și `.gpkg` în același director.

La deschidere sunt vizibile conturul complet, cele 14 poligoane raionale candidate cu etichete și hotarele interioare unice. Celelalte opt instantanee HURI, ICR nedatat, corespondențele OSMB și trasările nominale sunt grupate și dezactivate implicit. Panoul conține 36 de straturi și tabele: 19 straturi spațiale, inclusiv două admiteri goale, și 17 tabele atributive.

Referința este instantaneul HURI din 15 ianuarie 1937: exterior 941,310474 km, interior unic 525,399981 km. Geometria completă PROOF.2 este păstrată WKB-identic; cele 14 poligoane au fost comparate cu PROOF.3/4, iar toate cele 91 de înregistrări ale celor opt episoade cu PROOF.5/6. Episoade: 1927-03-01, 1928-08-15, 1932-03-20, 1932-10-25, 1933-04-01, 1933-12-15, 1934-05-30, 1937-01-15. Nu reprezintă perioade de valabilitate juridică demonstrate.

**Clasa istorică rămâne C. Limitele nu sunt certificate juridic.** Tiraspol este păstrat explicit ca contradicție temporală: raionul a fost desființat în 1933 și reînființat la 27 august 1937; poligonul-sursă din ianuarie 1937 nu certifică existența juridică a raionului la acea dată. ICR rămâne nedatat. Cele cinci trasări cartografice nominale sunt moștenite fără dublare; nu sunt reconstrucții noi în această operațiune. Hidrografia Dubăsari este separată și nu este un hotar juridic. A/B, M1 istoric și GCP fizice admise: zero. Precizia absolută rămâne necunoscută.

Vectorii sunt în EPSG:4326; proiectul afișează EPSG:3857. Lungimile sunt geodezice WGS84. Toate sursele locale ale proiectului sunt căi relative către GeoPackage-ul din același director; nu există strat online obligatoriu. Cele două tabele de admitere au zero geometrii; extentul zero din metadate permite citirea lor OGR pe runtime-ul verificat, fără introducerea vreunei geometrii fictive. Fontul este Arial, cu substituția standard QGIS dacă nu este instalat.

`SOURCE_VERSION.json` documentează sursele, hashurile intrărilor și verificările. `MANIFEST_SHA256.txt` din ZIP verifică cele patru fișiere de conținut; manifestul exterior publicat în Drive include suplimentar hashul ZIP-ului. Manifestul nu își include propriul hash. Această separare evită referințele circulare.

La începutul centralizării, API-ul Drive a confirmat fișiere în toate cele 11 subfoldere PROOF.5. Livrarea PROOF.6 era parțială: 17 fișiere-sursă și 11 subfoldere goale. Datele sale utilizate aici provin din originalele locale verificate și din branch-ul PR125; nu se presupune că fișierele lipsă sunt deja livrate în vechiul folder. Pachetul CURRENT este verificat separat prin redescărcare, hashuri și deschidere QGIS a ZIP-ului extras. Starea vechiului pachet nu este echivalată cu starea celui centralizat.

© OpenStreetMap contributors, ODbL: https://www.openstreetmap.org/copyright . Proveniența HURI/ICR și identificatorii originali sunt păstrați. Datele și extrasele administrative sunt atribuite în tabelele de surse; acest pachet nu include rastere cu drepturi neclarificate. ACTUAL, aplicația Atlas și PR119–125 nu sunt modificate.

## Actualizarea permanentă

1. Se păstrează același folder `00_RASSM_QGIS_CURRENT`: [destinația privată este în chitanța de livrare] .
2. Se compară noile surse și registre cu versiunea documentată. Se modifică geometria numai când există o justificare istorică demonstrată; un fișier mai nou nu este o justificare.
3. Se reconstruiesc GeoPackage-ul și QGIS într-un director separat, cu aceleași nume și căi relative. Se actualizează `SOURCE_VERSION.json`, păstrând istoricul versiunilor și trimiterile spre pachetele probatorii originale.
4. Se verifică WKB, topologia, lungimile, clasele, schemele și reproducibilitatea. ZIP-ul se extrage într-un director nou și se deschide efectiv prin QGIS, offline.
5. După verificare, se înlocuiesc controlat conținuturile celor șase fișiere existente în Drive, păstrând pe cât posibil ID-urile și linkurile lor; se folosesc reviziile Drive, nu copii sau backupuri în folderul vizibil.
6. Se enumeră folderul prin API, se redescărcă GeoPackage-ul și ZIP-ul, se compară SHA-256 și se deschide proiectul extras. Abia apoi se certifică actualizarea. Pachetele probatorii anterioare rămân nemodificate.

Scripturile și verificările de reproducere sunt publicate în branch-ul `hist-rassm-qgis-current` al https://github.com/ovidiudeica/atlas .
