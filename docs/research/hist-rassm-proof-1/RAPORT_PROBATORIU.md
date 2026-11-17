# HIST-RASSM.PROOF.1 — raport probatoriu

**Verdict: PROOF.1-C — progres probatoriu și hidrografie nouă; niciun hotar A/B admis.**

Au fost recuperate zece imagini noi: opt pagini facsimile ale actelor, rasterul oficial redus Eftodiev 1929 și scanul topografic Dubăsari catalogat decembrie 1936. Din ultimul a fost produsă independent o axă hidrografică nominală de 4.346950 km, două anvelope laterale și un poligon al cernelii de apă. Acestea sunt geometrii noi C, nu copii HURI. Nu s-a determinat responsabil poziția juridică a hotarului, deci obiectivul de hotar A/B rămâne deschis.

## 1. Starea reutilizată

Pachetul FINAL a fost verificat prin SHA-256: `8ce459466db2e6a5b4381010ea8cce68dce963e9ac68c6c91420c839422b3ff6`. Atlasul 1935 și cele două PDF-uri arhivistic/bibliografic au fost reutilizate local, fără redescărcare. Nu s-a repetat inventarul 1390 sau auditul 514. Au fost extrase numai referințele necesare comparației locale și cele două componente intersectate. HURI și ICR au rămas în clasaC.

## 2. Sursele recuperate și autentificarea

| Material | Recuperat efectiv | Limite |
|---|---|---|
| Act 12.10.1924, art 280 | pagini 877–880, scan DJVU 1–4, randări oficiale 1920 px | ediție oficială bilingvă, nu exemplar semnat; planurile comisiei lipsesc |
| Act 26.11.1924 Balta, art 304 | pagini 939–940, PDF 432–433, randări oficiale 960 px | ambele pagini lizibile; întregul volum 122 MB nu a fost duplicat |
| Act 29.09.1926, art 390 | pagini 1020–1021, DJVU 590–591, randări oficiale 1920 px | hârtie întunecată, text lizibil la rezoluția nativă; anexe spațiale lipsă |
| Eftodiev 1929 | JPEG 1280×2106,822926 octeți, SHA în manifest | original 3451×5679 a rămas 429; harta e schematică, fără graticul interpretabil |
| Dubăsari L-35-35-A | JPEG 7904×8777,8219763 octeți; reproducere contemporană 1:50000 | catalogMAPSTER 1936, nume 12.1936; data editării nu a fost localizată independent în imprimat; recunoașteri 1916 și 1933 tipărite |

Manifestul surselor conține colecția, URL, titlu, datare, rezoluția efectivă, drepturile și SHA-256. Pentru legi și Eftodiev metadatele Commons declară domeniu public. Pentru scanul Mapywig licența oglinzii nu a fost stabilită; rasterul și decupajele rămân în pachetul de cercetare privat, fără publicare în repo. Ștampilele LoC/CIA sunt vizibile; proveniența directă LoC nu este autentificată doar prin afirmația oglinzii. Dimensiunea fișierului corespunde exact catalogului [MAPSTER 11783467](https://igrek.amzp.pl/details.php?id=11783467). Transportul publicHTTP după timeoutHTTPS este o limitare de autenticitate consemnată.

## 3. Ce dovedesc actele

Actul 12.10.1924, p 879, art 2 descrie traseul general prin hotarele fondurilor sătești, raioane și localități. Art 3 cere comisiei mixte determinarea exactă și înaintarea spre aprobare. Prin urmare, actul constitutiv și delimitarea efectivă nu sunt același produs cartografic. Textul vestic „по державному кордону Союзу РСР” nu localizează singur talvegul, malul sau un traseu măsurat în sectorul Dubăsari.

Actul 26.11.1924, p 940, art 1 a include Balta cu partea raionului care gravitează spre ea. Art 1 b trimite explicit cele patru consilii Serbivska, Kodymska, Frantsuzka și Budeiska către Tulchyn; art 4 cere comisiei paritare instituite 29.10.1924 să precizeze consiliile Balta incluse. Nu există aici o anexă cu contururi locale.

Actul 29.09.1926 confirmă vizual cele 11 obiecte transferate:2 sate către Kamianка,4 consilii către Kruti și 5 sate din Odessa. Hrabariivka apare separat la art 4, ca recunoaștere a includerii, nu al 12-lea transfer. Fiecare dintre cele 12 rânduri este confruntat individual în `reconciliere_1926_12_obiecte.csv`; toate poligoanele rămânD. Contradicție nou constatată: preambulul imprimat 1926 citează 26 noiembrie**1925**, însă citează colecția**1924**, nr 50, art 304; facsimilul acelui art 304 poartă 26 noiembrie 1924. Păstrăm citirea literală și identificarea bibliografică separat, fără corectură tacită. Pe p 1021 există o subliniere manuscrisă în coloana rusă, care nu este tratată ca amendament normativ.

## 4. Surse încă neobținute

Ananiev 1936 (R-2947, inv 3, unit 3), harta administrativă RASSM 1:300000 cu situația 1 martie 1939, procesele-verbale și planurile comisiilor 1924–1926, hotarele fondurilor sătești. Catalogul 1939 indică 72×47 cm; o altă bibliografie dă 1:3000000, contradicție care necesită verificarea scării tipărite. Catalogul și harta generală din atlasul de buzunar 1939,1:6000000, nu sunt substituite facsimilului cerut.

Originalul IU Tiraspol 1929 a fost localizat în DataCORE public; descărcarea a returnat formularHTML de arhivă rece, nu TIFF. Recuperarea automată, fărăemail, a fost refuzată de serviciu din cauza prea multor cereri în curs. Nu a fost contactată instituția și nu a fost folosit TIFF-ul georeferențiat de depozit ca reper independent. RăspunsulHTML denumit inițial `.tif` în spațiul intermediar a fost exclus complet din livrabilele raster. Registrul de acces separă recuperarea efectivă de descrierea de catalog.

## 5. GCP-uri și georeferențiere

22 puncte din cadrul geografic, fără centre de sate, limiteHURI, frontiere moderne sau maluri de acumulare:4 colțuri și 18 semne minutare laterale. Pentru semnele scurte, ordonata este citită pe graticul, iar intersecția cu linia interioară este prelungită pe cadrul măsurat. Convenție pixeli: origine stânga-sus, x spre dreapta, y în jos, scanul integral 7904×8777. Alocarea fixă este 14 FIT și 8 HOLDOUT, fără suprapunere. Distribuția rămâne periferică; nu există control fizic independent interior. Toleranțele de citire 3/5 pixeli sunt estimări de lucru, nu deviații standard demonstrate.

**22 admise numai pentru consistența cadrului nominal;0 GCP admise absolut în datum modern;0 repere fizice certificate.** Gradele sunt interpretate nominalGreenwich și proiectateUTM 35 N pentru ajustare, nu identificate automat cu un datum 1936. Nu am atribuit retroactiv Pulkovo 1942 unei foi anterioare. Problema datumului rămâne deschisă.

| Model | FIT RMSE | HOLDOUT RMSE | HOLDOUT maxim |
|---|---:|---:|---:|
| Afin,6 parametri | 7.869 m | 4.616 m | 9.371 m |
| Proiectiv,8 parametri | 5.816 m | 3.542 m | 5.306 m |

Afinul este păstrat pentru diagnostic, fiind mai parcimonios; îmbunătățirea proiectivă nu stabilește acuratețea absolută. Diferența maximă între modele pe grila de control este 8.435 m. Valorile singulare ale Jacobianului sunt 3,175–3,177 m/pixel, fără plieri în modelul afin. Nu a fost justificat un polinom de ordin superior. Parametrii normalizați, toate reziduurile și Jacobianul sunt livrate. **RMS intern nu este precizia hotarului. Incertitudinea absolută rămâne necunoscută; nu se oferă rază 95% sau toleranță arbitrară de 500 m.** GeoTIFF-ul este etichetat `diagnostic_NOMINAL_C`, neadmis pentru un hotar certificat.

## 6. Alegerea sectorului și geometria nouă

MC-DUB 36-01, Cocieri–Corjova–nordDubăsari, a fost ales după evaluareaNE, SE, MC, ME, NW. Are sursa contemporană detaliată și graticul măsurabil. NE/NW au acte mai bune, dar lipsesc fondurile/cadastrul; ME nu are facsimilul Ananiev; SE nu are încă rasterul originalIU. Toate respingerile sunt păstrate în `selectie_sectoare.json`.

Extragerea acoperă rândurile 2100–3250, pas 25 pixeli:47 transecte, cu domeniu de căutare restrâns în jurul albiei vizibile. Pragurile RGB selectează cyanul, exclud vegetația și puțurile izolate; se păstrează grupul continuu cel mai lung, tolerând întreruperi de tipar de până la 40 pixeli. Anvelopele sunt cuantilele 2%/98% ale suportului, iar axa este mijlocul lor. CSV-ul păstrează fiecare măsurătoare și imaginile permit controlul. Controlul vizual a eliminat o primă segmentare care confunda vegetația și simboluri albastre izolate cu albia. Nu s-a folosit HURI/ICR în ajustare sau trasare.

Rezultatul este **albie reprezentată cartografic**, cu distorsiuni de simbol și tipar, nu mal topografic măsurat sau talveg. Suprafața nominală a anvelopei este 1.006663 km²; nu este o rectificare teritorială. Nu se trasează artificial o frontieră pe mijlocul apei. Regula juridică, legenda specifică semnului, datarea exactă și datum-ul sunt necesare pentruB; pentruA sunt necesare și concordanțe geografice și juridice independente, cu eroare absolută măsurată.

## 7. Diferențe HURI–ICR și OSM

88 eșantioane pe axa nouă, aproximativ 50 m, distanțe nesemnate până la cea mai apropiată limită, UTM 35 N. HURI 1937: mediană 823.209 m, P 951072.190 m, maxim 1113.454 m. ICR: mediană 187.997 m, P 95356.086 m, maxim 412.523 m. HURI 1934 are aici aceeași limită ca 1937. Aceste distanțe sunt diagnostice condiționate de coordonatele nominale, nu corecții certificate sau erori adevărate aleHURI.

Componente locale intersectate: `R5-1927-HI-001` și `R5-1937-HI-001`; ambele rămân nerezolvate istoric. Sunt livrate decupajele și vectorii distanțelor, nu poligoane inventate de „adăugat/scăzut”. Nu se modifică referința 8477,165018594918 km².

OSM Standard a fost randat efectiv înQGIS și examinat: contextCocieri/Corjova și cursul din amonte/aval sunt geografic coerente. Albia veche este acum în parte sub acumulare și traversează zona barajului modern. Malul actual nu este control istoric, iar comparația vizuală nu rezolvă datum-ul. Fundal ©OpenStreetMapcontributors, ODbL; data observării 17.11.2026. Nu s-a realizat matching metricOSM sau descărcare vectorialăOverpass nouă.

## 8. Validare și reproductibilitate

Cele 3 linii și poligonul sunt valide, simple, continue, fără autointersecții sau fragmente. Anvelopele sunt separate; legăturile capetelor închid numai porțiunea analizată. Suprapunerea cu sursele este intenționat diagnostică. Geometriile se livreazăEPSG 4326. Lungimile WGS 84 calculate independent deQGIS coincid cuPROJ/Geod la precizia numerică afișată. Simplificările 5/10/25/50 m au fost măsurate în audit; nicio simplificare nu a fost aplicată livrării. ProiectulQGIS se redeschide cu 9 straturi valide și căi relative. Randările istorice șiOSM sunt livrate.

Scriptul nou este distinct de pipelineFINAL; sursele anterioare sunt reutilizate controlat prin extrase și hashuri. Instrucțiunile și mediul sunt în 06_REPRODUCIBILITATE. Rezultatul testului izolat de regenerare, testeleAtlas și CI sunt consemnate în `status_livrare.json` și `verificari_reproducibilitate.json`, după execuția lor. Nu se pretinde identitatea binară a containerelorGeoPackage/GeoTIFF, ale căror metadate pot varia; se verifică ieșirile deterministeCSV/GeoJSON, coordonatele și proprietățile geometrice.

## 9. Livrare, Git și pasul probatoriu exact

[Drive 10_HIST-RASSM_PROOF_1](https://drive.google.com/drive/folders/1pp4MlXhylRl3gVss3Ttuv5FcS96fw-CJ), cu cele 6 subdirectoare cerute. GIS: `03_RECONSTRUCTIE_SECTOR/HIST_RASSM_PROOF_1_C.gpkg`; QGIS: `HIST_RASSM_PROOF_1_C.qgz`; axă și anvelope: `hidrografie_noua_C.geojson`. Arhiva și SHA-256 sunt livrate separat. Starea încărcărilor verificate se află în registrul de livrare.

Branch `hist-rassm-proof-1`, creat dinmain `51a55fac9bb9b02f4dadf666e150deac724569dc`. PR nou draft șiCI: vezi `status_livrare.json` pentru linkurile efective, fără a presupune finalizarea înainte de citirea rezultatelor. PR 119 și branch-ul său rămân nemodificate, fărămerge. ACTUAL nu este atins; datele noi sunt numai în zona de cercetare.

**Următorul pas exact:** recuperarea foii administrativeRASSM 1:300000 cu situația 1 martie 1939, completă cu legendă și imprint, apoi identificarea normei și semnului frontierei din sectorulMC-DUB 36-01; în paralel, stabilirea datum-ului foiiL-35-35-A și a minimum 3 repere fizice pre 1933 independente, distribuite în/în jurul tronsonului. Numai după măsurarea erorilor absolute și confirmarea regulii de trasare se poate transforma axa candidată într-un hotarB. PentruNE/NW sunt necesare suplimentar planurile fondurilor/consiliilor transferate 1926; fiecare obiect rămâneD până atunci.
