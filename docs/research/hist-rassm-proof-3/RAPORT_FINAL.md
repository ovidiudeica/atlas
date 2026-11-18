# HIST-RASSM.PROOF.3 — Raport final

## 1. Verdict

**PROOF.3-C: progres probatoriu parțial, fără certificare nouă M1 sau A/B.** Sunt investigate țintit 36 arce PROOF.2, cu dosare individuale și sursele OSMB exacte. Au fost construite patru trasări independente C din semnele unei reproduceri cartografice atribuite anului 1930. Nu este îndeplinit criteriul B în niciuna dintre cele două rețele. Nu se pretinde închiderea istorică a sistemului RASSM.

## 2. Arce investigate efectiv

18 arce exterioare, câte șase în NW, SE și SC, și 18 arce interioare: **36 arce**, 11,494 km în episodul candidat 15 ianuarie 1937. Selecția este țintită, spațiată; nu reprezintă auditul tuturor celor 356,030 km de candidați. ID-urile, perechile raionale, obiectele moderne, distanțele PROOF.2 și motivele se găsesc în registrul per-arc. Reconcilierea celor 32.722 de înregistrări nu a fost reluată.

## 3. Dovezi istorice noi per arc

**0 arce au primit dovadă directă suficientă pentru identitatea precisă a traseului istoric.** Pentru 8 arce exterioare există context cartografic regional nou în vecinătatea nominală de 5 km a trasărilor din 1930. Acesta este un indiciu, nu o certificare și nici o acoperire metrică demonstrată. Distanța este calculată după transformarea aproximativă a reproducerii; pragul de 5 km este de selecție a contextului, nu o eroare absolută estimată.

## 4. Promovări M2/M3 → M1

**0 km.** Geometriile OSMB sunt păstrate exact în stratul de proveniență, cu snapshot și identificator; nu au fost admise retrospectiv și nu au fost redigitizate sau folosite pentru snapping.

## 5. Exterior admis A/B

**0 km.** Identitatea administrativă, identitatea geometrică și validitatea juridică sunt câmpuri separate în fiecare dosar. O coincidență HURI–ICR–OSMB nu autentifică singură regula fluvială sau continuitatea traseului din 1937 până în 2026.

## 6. Interior admis A/B

**0 km.** Niciun hotar comun nou nu este admis B. Stratul `RASSM_INTERNAL_ADMITTED` este real, cu schema definită, dar fără obiecte. Pentru fiecare caz interior este nominalizată harta sau anexa lipsă.

## 7. Reconstrucții independente efective

Patru trasări ale semnelor tipărite: trei exterioare, **88,553 km nominali**, și o porțiune de semn raional interior, **9,859 km nominali**. Acestea aparțin episodului distinct `PUBLICATION_1930_ADMINISTRATIVE_CONTENT_UNDATED`, în clasa C. Nu se însumează cu rețeaua din 1937. Perechea raională a porțiunii interioare rămâne neatribuită; nu este introdusă ca hotar comun al unor raioane identificate cert.

Transformarea folosește două intersecții ale meridianului tipărit de 30° cu paralelele 48° și 47°, orientarea cadrului și bara de scară de 45 km. Este o localizare aproximativă constrânsă de scară, fără autentificarea proiecției și a datum-ului istoric. Parametrii, pixelii, scara și sensibilitatea ±1% sunt livrate. Cinci pixeli corespund nominal la circa 578,389 m; acest lucru nu reprezintă eroarea absolută sau un interval de încredere. RMSE absolut: **nedeterminat**. Hotar juridic nou admis din aceste trasări: **0 km**.

## 8. Kilometri rămași M2/M3/M4/M5

Valorile PROOF.2 pentru episodul candidat 1937 sunt păstrate nemodificate:

| Rețea | Total km | M2 km | M3 coincident km | M3 divergent km | M4 km | M5 km |
|---|---:|---:|---:|---:|---:|---:|
| Exterior | 941,310 | 342,527 | 13,503 | 12,895 | 566,886 | 5,500 |
| Interior unic | 525,400 | 8,987 | 7,036 | 6,036 | 444,839 | 58,501 |

Toți acești kilometri necesită în continuare dovadă istorică independentă. Pentru celelalte șapte episoade HURI și ICR se păstrează registrele PROOF.2, cu hashul sursei în manifest; nu se însumează episoade diferite.

## 9. Segmente rezolvate

**Niciun arc PROOF.2 nu este declarat rezolvat istoric.** Au fost rezolvate distincții de sursă: foaia regională de atlas 1939 nu este harta administrativă RASSM 1:300.000; harta etnică în culori este o reconstrucție modernă, nu un facsimil din 1928. Cele patru obiecte cartografice construite au ID-urile `P3-MSE30-NW-01`, `P3-MSE30-SC-01`, `P3-MSE30-SE-01`, `P3-MSE30-IN-01`, toate C. Prima lectură interioară a fost respinsă la controlul vizual; fișierul livrat urmărește centrele punctelor tipărite.

## 10. Segmente nerezolvate și motive

Toate cele 36 ID-uri sunt prezentate mai jos și în `RASSM_PROOF3_blocaje_individuale.csv`. Pentru fiecare există verdict individual și probă lipsă. M5 nu este transformat automat în obligație de redigitizare. `RASSM_UNRESOLVED_SEGMENTS` păstrează toate cazurile M4/M5 și părțile divergente M3 ale episodului candidat 1937, inclusiv pe cele neinvestigate în această selecție. Restanțele celorlalte episoade rămân în pachetul PROOF.2 intact.

## 11. Raioane afectate

Selecția include următoarele nume HURI: Ananiv, Balta, Chorna, Dubosary, Hryhoriopol, Kamianka, Kodyma, Kotovsk, Krasni Okny, Rybnytsia, Slobodzeia, Tyraspol, Valehotsulove. Numele din sursă sunt păstrate ca atare; identitatea lor cu o unitate modernă nu este dedusă din asemănarea denumirii. Rețeaua interioară păstrează o singură muchie pentru ambele raioane.

## 12. Modificări documentate și cronologie

Nu a fost recuperat un act nou cu traseu anexat care să permită modificarea geometriei. Se păstrează cronologia verificată anterior: constituirea 1924, transferurile 1926, reorganizările 1933–1935, transferurile 1936 și reorganizarea 1937. Tiraspol este desființat în 1933 și reînființat în august 1937; poligonul HURI etichetat ianuarie 1937 nu este admis ca dovadă a existenței legale a raionului. Portalul istoric instituțional consultat descrie și desființarea Camencăi în 1959 și reînființarea în 1969 cu teritorii de pe malul drept: indiciu de discontinuitate administrativă ce impune verificarea actelor și planurilor, fără a demonstra singur deplasarea fiecărui arc.

## 13. Hărți recuperate efectiv

Două reproduceri oficiale noi au fost descărcate și verificate ca imagini: harta atribuită Micii Enciclopedii Sovietice din 1930, 1280 px lățime, și foaia regională din Atlasul URSS 1939, 960 px lățime. Originalele native au răspuns HTTP429 și nu au fost urmărite prin cereri repetate. Pentru harta din 1930 nu a fost autentificat volumul integral sau numărul paginii; atribuirea editorială provine din metadatele Commons. Nu se pretinde recuperarea originalului nativ, a hărții administrative Lațaș 1939, a originalului Tiraspol 1929 sau a planului Ananiev 1936.

## 14. Surse încă inaccesibile și piste exacte

Inventarul primar ANRM R-2947, inventarul 3, imaginea PDF 2, înregistrează: **unitatea 1 — hartă administrativă RASSM 1939, 1 cm = 3 km, Harkiv, limba ucraineană; unitatea 3 — harta raionului Ananiev 1936, 1 cm = 500 m, color, calc**. Inventarul nu conține aceste hărți. Publicația Institutului de Istorie al Ucrainei descrie limite sătești pe harta 1939; este descriere, nu facsimil.

DataCORE Tiraspol a furnizat din nou HTML de arhivă rece, nu TIFF; alternativa genealogică a răspuns503; indexul MapyWIG 1:100.000 nu a furnizat foaia țintă. Ediția Tiraspol 1944 identificată în catalog este ulterioară intervalului și nu substituie foaia 1929. Geoportalul RGO a prezentat o problemă de certificat TLS; validarea TLS nu a fost dezactivată. Nu au fost găsite public planurile comisiilor 1924–1926 sau planurile fondurilor sătești necesare. Nu au fost contactate instituții.

## 15. Datum Dubăsari

Ipoteza Bessel/Gauss–Krüger zona 5 rămâne compatibilă cu testul intern PROOF.2, RMSE nominal aproximativ 17,1 m pentru cele patru controale ale caroiajului. Nu autentifică realizarea efectivă a datum-ului, parametrii către WGS84 sau precizia absolută. Excluderile Ustia și Corjova omonimă sunt păstrate; nu sunt reintroduse.

## 16. GCP fizice independente admise

**0.** Au fost aprofundate patru piste: Ohrincea, Izbiște, Jevreni și Dubăsarii Vechi. Istoriile instituționale permit precizarea unor date și a reconstrucțiilor clădirilor, dar nu oferă împreună identitatea exactă a simbolului, continuitatea punctului material și coordonata măsurată independent. Coordonatele presupuse nu sunt fabricate. Nu a fost executată o ajustare cu puncte fizice FIT sau HOLDOUT pretins admise.

## 17. Precizie și incertitudine

Pentru Dubăsari, erorile cadrului și testul de elipsoid rămân verificări relative interne, cu precizia absolută nedeterminată. Axa hidrografică de 4,346950 km din PROOF.1 este rezultat anterior, nu hotar juridic nou și nu este numărată din nou. Pentru harta din 1930 transformarea aproximativă, scenariile ±1% și lectura de ±5 px sunt livrate ca analiză condițională; zero repere fizice de control. Norma juridică pentru linia fluvială nu a fost recuperată; centrul albiei nu primește automat statut de hotar.

## 18. Topologie și verificări

Geometriile selectate sunt WKB-identice cu PROOF.2; nodurile nu sunt mutate. Lungimile selectate sunt recalculate geodezic, cu diferență maximă 0 m față de registrul original. Nu există ID-uri duplicate sau dublări ale aceleiași muchii interioare în episodul de referință. Trasările noi sunt valide, simple și continue individual; ele sunt eșantioane parțiale, nu o rețea istorică închisă. Nu au fost create poligoane noi ori schimbate suprafețe. Cele 14 poligoane candidate de referință rămân C.

Reproducerea izolată compară exact registrele, GeoJSON, WKB/atributele celor patru trasări și pixelii/transformarea rasterului. QGIS recitește proiectul și calculează independent lungimile; rezultatele și controlul vizual sunt în `06_VALIDARE`. Validitatea GIS nu constituie dovadă istorică.

## 19. Evoluție față de PROOF.2

| Indicator | PROOF.2 | PROOF.3 |
|---|---:|---:|
| Exterior M1 km | 0 | 0 |
| Exterior A/B km | 0 | 0 |
| Interior M1 km | 0 | 0 |
| Interior A/B km | 0 | 0 |
| Exterior fără corespondent verificat M4 km | 566,886 | 566,886 |
| Interior fără corespondent verificat M4 km | 444,839 | 444,839 |
| GCP fizice absolute admise | 0 | 0 |

Progresul verificabil constă în cele 36 de dosare țintite, calificarea surselor, patru trasări cartografice C reproductibile și aprofundarea pistelor fizice. Nu există creștere a lungimii admise istoric. Pachetul PROOF.2 și toate valorile sale sunt păstrate intacte.

## 20. Livrare GIS/QGIS și Drive

[Folderul privat PROOF.3](https://drive.google.com/drive/folders/1e8gelJThsFpoq6AdtlQYYiXu9fQMp3xh). Modelul este `RASSM_PROOF_3_temporal_C.gpkg`; proiectul portabil este `07_QGIS/RASSM_PROOF_3_C.qgz`. Cele nouă straturi cerute sunt prezente, inclusiv cele două straturi A/B goale. Toate straturile vectoriale sunt EPSG:4326; afișarea QGIS este EPSG:3857. Fundalul OSM necesită rețea; sursele locale și vectorii funcționează fără el. Pachetele precedente nu sunt duplicate integral.

## 21. GitHub

Branch de cercetare: `hist-rassm-proof-3`, creat din `main` la `51a55fac9bb9b02f4dadf666e150deac724569dc`. PR separat draft; numărul, URL-ul și SHA-ul efectiv sunt în `status_livrare.json` și în recipisa externă de livrare. PR-urile #119–#121 sunt păstrate fără modificări. ACTUAL, geometriile canonice și aplicația nu sunt modificate. Niciun merge.

## 22. Teste și CI

Rezultatele locale Atlas, TypeScript/Vite și rezultatul GitHub Actions pentru SHA-ul final sunt în `06_VALIDARE` și `status_livrare.json`. Acest raport nu substituie starea efectivă a rulării. Reproducerea și verificările GIS au rapoarte distincte. Rasterele și paginile instituționale rămân în pachetul privat; repository-ul primește metodele și registrele de cercetare admisibile.

## 23. Următoarea operațiune exactă

Obținerea facsimilului complet **ANRM R-2947, inventarul 3, unitatea 1, harta administrativă RASSM 1939**, cu legenda, graticulul, antetul și limitele sătești, este ținta principală pentru ambele rețele; pentru Ananiev: aceeași colecție, unitatea 3. Este necesară o copie publică ori acces distinct autorizat, fără ocolirea controalelor. În paralel, pentru Dubăsari: documentul de datum al foii L-35-35-A și măsurători independente ale unor puncte materiale identificate în hartă, cu FIT/HOLDOUT distincte, urmate de verificarea normei fluviale. Nu se înlocuiește proba lipsă cu snapping sau cu identitatea numelor.

## Registru sintetic al celor 36 de dosare

| ID PROOF.2 | Rețea | Sector | Raioane | M anterior → nou | Lungime m | Verdict |
|---|---|---|---|---|---:|---|
| R2-bb634220b02be08378-000 | EXTERNAL | NW | Kamianka | M2 → M2 | 419.914 | candidat îmbunătățit |
| R2-71d3ead19c3cb18558-000 | EXTERNAL | NW | Rybnytsia | M2 → M2 | 303.781 | nerezolvat documentar |
| R2-d9c6808a6ec62525e5-000 | EXTERNAL | NW | Kamianka | M2 → M2 | 439.650 | nerezolvat documentar |
| R2-e9033598eb540a6bce-000 | EXTERNAL | NW | Rybnytsia | M2 → M2 | 432.204 | nerezolvat documentar |
| R2-c3aad84c28d8fc76af-000 | EXTERNAL | NW | Kamianka | M2 → M2 | 196.915 | nerezolvat documentar |
| R2-657cab680e8eeccec6-000 | EXTERNAL | NW | Kamianka | M2 → M2 | 499.999 | nerezolvat documentar |
| R2-9d7b01a6fb8f95d82e-000 | EXTERNAL | SE | Slobodzeia | M2 → M2 | 108.497 | candidat îmbunătățit |
| R2-84e72544151b2069cc-000 | EXTERNAL | SE | Slobodzeia | M2 → M2 | 346.312 | candidat îmbunătățit |
| R2-9bcbcf81a44a7591f0-000 | EXTERNAL | SE | Slobodzeia | M2 → M2 | 327.096 | candidat îmbunătățit |
| R2-064fe69cde8af9c92f-000 | EXTERNAL | SE | Slobodzeia | M2 → M2 | 247.926 | candidat îmbunătățit |
| R2-c3b09671ff1bb75978-000 | EXTERNAL | SE | Tyraspol | M2 → M2 | 395.378 | nerezolvat documentar |
| R2-4b75be1b635ec9f241-000 | EXTERNAL | SE | Slobodzeia | M2 → M2 | 104.372 | candidat îmbunătățit |
| R2-bda5a7d975ff984b17-000 | EXTERNAL | SC | Tyraspol | M2 → M2 | 128.015 | nerezolvat documentar |
| R2-78c77fbcff34f081f0-000 | EXTERNAL | SC | Tyraspol | M2 → M2 | 141.202 | nerezolvat documentar |
| R2-9e4b647719f475afb2-000 | EXTERNAL | SC | Hryhoriopol | M2 → M2 | 281.627 | candidat îmbunătățit |
| R2-e7af230398e22049b2-000 | EXTERNAL | SC | Hryhoriopol | M2 → M2 | 499.998 | candidat îmbunătățit |
| R2-29ca8e1dcbaa12f70f-000 | EXTERNAL | SC | Tyraspol | M2 → M2 | 499.995 | nerezolvat documentar |
| R2-71274adfe552885cf1-000 | EXTERNAL | SC | Tyraspol | M2 → M2 | 484.018 | nerezolvat documentar |
| R2-65c03b2d043008f0fc-000 | INTERNAL | NE | Ananiv;Balta | M3 → M3 | 157.929 | nerezolvat documentar |
| R2-00754af14341b7727d-000 | INTERNAL | NE | Ananiv;Kotovsk | M3 → M3 | 307.321 | nerezolvat documentar |
| R2-b145c52eaac9203f29-000 | INTERNAL | NC | Chorna;Kotovsk | M2 → M2 | 499.999 | nerezolvat documentar |
| R2-43ef13f974b6a27d1e-000 | INTERNAL | NC | Chorna;Rybnytsia | M2 → M2 | 421.366 | nerezolvat documentar |
| R2-2eed748d6ec3e2b381-000 | INTERNAL | MC | Dubosary;Chorna | M2 → M2 | 143.200 | nerezolvat documentar |
| R2-29dc58e4c5f9ec97b8-000 | INTERNAL | MC | Dubosary;Krasni Okny | M3 → M3 | 413.642 | nerezolvat documentar |
| R2-dfe2391a6936b6c116-000 | INTERNAL | MC | Hryhoriopol;Dubosary | M2 → M2 | 105.354 | nerezolvat documentar |
| R2-52f730f6c7d43d574a-000 | INTERNAL | NC | Kodyma;Balta | M2 → M2 | 282.321 | nerezolvat documentar |
| R2-745d0a55ad4701dd3a-000 | INTERNAL | NC | Kotovsk;Balta | M2 → M2 | 149.490 | nerezolvat documentar |
| R2-e6cd6411a41b1e434b-000 | INTERNAL | NC | Kotovsk;Kodyma | M3 → M3 | 117.026 | nerezolvat documentar |
| R2-8ccf1e284955b98989-000 | INTERNAL | MC | Krasni Okny;Kotovsk | M3 → M3 | 166.009 | nerezolvat documentar |
| R2-7a45ebb8d8e5c752d5-000 | INTERNAL | NC | Rybnytsia;Kodyma | M2 → M2 | 212.545 | nerezolvat documentar |
| R2-ce3dceced9811e91f7-000 | INTERNAL | NE | Valehotsulove;Kotovsk | M2 → M2 | 160.842 | nerezolvat documentar |
| R2-eb5a0a4a199f648e4e-000 | INTERNAL | NW | Rybnytsia;Kamianka | M4 → M4 | 499.998 | nerezolvat documentar |
| R2-a17519896d9f5da30b-000 | INTERNAL | SE | Slobodzeia;Tyraspol | M5 → M5 | 500.000 | contradicție păstrată |
| R2-cf167adce37ff23929-000 | INTERNAL | MC | Hryhoriopol;Dubosary | M4 → M4 | 500.000 | nerezolvat documentar |
| R2-99ff1f7a616db7da68-000 | INTERNAL | ME | Valehotsulove;Ananiv | M4 → M4 | 500.000 | nerezolvat documentar |
| R2-ff2da5dbc9e31acb8e-000 | INTERNAL | SC | Tyraspol;Hryhoriopol | M5 → M5 | 500.000 | contradicție păstrată |
