# HIST-0.4p — planurile Cetății Chioarului, controlul amplasamentului și poarta GCP

**12 noiembrie 2026** · Bază `main@7d06883093c2cad580208adb53928e4f116969dc`. **Mod exclusiv public și gratuit**: fără emailuri, drafturi noi, contacte instituționale, plăți, comenzi, abonamente ori republicarea imaginilor.

## 1. Post-merge HIST-0.4o

[Run 43204991850](https://github.com/ovidiudeica/atlas/actions/runs/43204991850) a fost închis cu **success** pentru **Build and verify website** (inclusiv Chromium desktop/mobil) și **Deploy GitHub Pages**. Închiderea software nu reprezintă certificarea unei geometrii istorice.

## 2. Șapte imagini originale de pe pagina repertoriului Várak.hu — inspectate efectiv

Sursa bibliografică: [Berkeszpataka – Kővár / Chioar](https://varak.hu/latnivalo/index/1631-Berkeszpataka-Kovar-Chioar/). Am recuperat gratuit și examinat local **șapte fișiere**, verificând pentru fiecare dimensiunile și SHA-256. **Nu au fost publicate fișierele grafice în repository** și nu au fost asumate drepturi noi.

| Martor | Ce demonstrează | Ce nu demonstrează |
|---|---|---|
| [Plan atribuit lui Marsigli, 1687](https://varak.hu/media/content/sights/1631/3174c78cba2f2d1b67f1.jpg) | Părțile **A, B, C** ale fortificației și reprezentarea cursului **Lápos** într-un plan istoric reprodus ulterior | Nu identifică o coordonată WGS84, datum, scară geodezică ori un simbol pe fotografia MNL 1859. Exemplarul manuscris original nu a fost verificat direct |
| [Reconstituire a planului de la sfârșitul sec. XVII](https://varak.hu/media/content/sights/1631/e4c104c46b5c730d6d80.jpg) | Separă cetatea inferioară de cea superioară; are **scară grafică de 50 m** | Este reconstituire editorială, nu ridicare geodezică din 1859 |
| [Planul cetății superioare, A. A. Rusu](https://varak.hu/media/content/sights/1631/kvrajzok3.jpg) | Înfățișează structura zidurilor superioare | Nu are coordonate independente ale unui vârf/bastion și nu este evident datat topografic |
| [Gravura Keleti Gusztáv, 1869](https://varak.hu/media/content/sights/1631/4060e52b39872e0a6de0.JPG) | Confirma vizual contextul unei ruine pe stâncă, lângă râu, relativ apropiat cronologic de MNL | Perspectivă artistică, nu hartă măsurată |
| [Schemă regională Kővár](https://varak.hu/media/content/sights/1631/a8fa330cd4b5f395ab5e.jpg) | Localizare aproximativă în fostul Chioar | Nu este rasterul original al celei de-a treia ridicări la 1:25.000 |
| [Hartă rutieră modernă](https://varak.hu/media/content/sights/1631/kvterkep1.jpg) | Localizator rutier contextual | Nu este sursă istorică sau punct de control |
| [Mapy.cz, traseu 2024](https://varak.hu/media/content/sights/1631/775d28f18a000ba6eb60.JPG) | Meandrul și ruta de apropiere moderne, inclusiv marcajul editorial al cetății | Punctul roșu nu este vârf/bastion măsurat și nu există pe MNL din 1859 |

**Corecție importantă:** deși prezentarea generală Várak.hu afirmă utilizarea decupajelor militare 1:25.000, **pagina acestui monument nu oferă, în cele trei imagini din secțiunea Hărți examinate, un raster militar original la 1:25.000**. Nu mai susținem că unul a fost recuperat pentru această cetate. Planurile istorice conțin probe ale configurației fortificației, fără a dobândi automat precizie juridică/cartografică.

### Identificarea arhivistică a manuscrisului Kővár

În colecția Muzeului Național Maghiar, studiul [Cenner-Wilhelmb Gizella, *A Magyar Történeti Képcsarnok kéziratos térképei*, *Folia Historica* 7 (1979), p. 126](https://mnm.hu/sites/default/files/publications/foliahistorica_07.pdf), **intrarea 7**, identifică **„PIANTA DI KUIVAR / governato da Teleki”** ca manuscris cu numărul de inventar **8920.T**, executat în tuș și acuarelă pe două foi lipite, format **18,3 × 28,4 cm**, cumpărat în **1907** de la anticarul Rohracher din Lienz. Catalogul îl atribuie unui **inginer militar din anturajul lui Carol de Lorena**. Asocierea personală cu Luigi Ferdinando Marsigli este prezentată în alte lucrări ca **posibilă**, nu ca identificare paleografică definitivă.

**Atenție la omonim:** intrarea 8 a aceluiași catalog este **„PIANTA DI KUKELVAR”**, inventar **8922.T**, despre **Küküllővár/Cetatea de Baltă** — un alt obiect decât Kővár/Cetatea Chioarului. Nu se vor transfera înregistrări, scanuri sau geometrii între cele două. Manuscrisul **8920.T** nu a fost consultat direct, ci numai descrierea sa publicată; reproducerea Várak.hu și numărul de inventar nu asigură singure control geodezic, un punct al unui bastion sau hotare comunale.

## 3. Șase poziții moderne — acordul între surse nu este punct geodezic

Am calculat distanțele geodezice WGS84 între pozițiile publicate pentru **același sit extins** (nu pentru aceeași cărămidă, poartă sau stâncă):

| Sursa punctului | Latitudine | Longitudine | Statut |
|---|---:|---:|---|
| [Várak.hu](https://varak.hu/latnivalo/index/1631-Berkeszpataka-Kovar-Chioar/) | 47.475990 | 23.578743 | Marcaj turistic al cetății |
| [OSM node 896978567, prin Mapcarta](https://mapcarta.com/N896978567) | 47.476010 | 23.578860 | Nod OSM `historic=ruins`; nu reper geodezic |
| [Burgenwelt](https://www.burgenwelt.org/rumaenien/chioarului/object.php) | 47.476167 | 23.578750 | Punct GPS în format DMS |
| [WelcomeToRomania](https://www.welcometoromania.ro/DN1c_Halmeu_Rastoci/DN1c_Halmeu_Rastoci_Berchezoaia_Cetatea_Chioarului_r.htm) | 47.476130 | 23.578810 | Localizare turistică |
| [ExploreCarpathia](https://www.explorecarpathia.eu/hu/romania/kovar) | 47.475914 | 23.578644 | Punct turistic |
| [Castlopedia](https://www.castlopedia.com/castle/chioar-fortress/12341) | 47.475900 | 23.576500 | Punct raportat semnificativ spre vest |

Primele **cinci** se înscriu într-o distanță maximă mutuală de **29,2 m**. Poziția Castlopedia se află la **168,9 m vest față de Várak.hu**. Nu o respingem automat: situl arheologic are aproximativ 600 m în lungime, iar punctele nu sunt descrise ca măsurători ale **aceleiași substructuri**. Valorile nu dovedesc independența surselor, metoda de ridicare sau eroarea măsurătorii.

**Excludere documentată:** [Burgenwelt](https://www.burgenwelt.org/rumaenien/chioarului/object.php) avertizează explicit că multe hărți plasează greșit cetatea la **confluența Cavnic–Lăpuș**, în locul meandrului de mai la sud-est de Berchezoaia. Prin urmare, acel punct de confluență este **ineligibil** drept GCP al cetății, chiar dacă alte hărți îl indică.

## 4. Confruntarea cu fotografia MNL 1859/1861

Sursa: MNL OL S75 nr.82, fotografia 2, SHA-256 `bd9c01173c1ddc89a97414215b0771b9d88861f192f547a2ec718bb2b9cb72a9`. Din HIST-0.4o există un sector original de căutare `[2600,3650,2500,3650]`, **nu un poligon georeferențiat**.

- Planul Marsigli (1687) demonstrează configurația istorică a fortificației și relația grafică cu râul, dar **nu** un punct cu coordonate de teren moderne sau o ancoră unică în harta administrativă MNL.
- Gravura Keleti (1869) reprezintă stânca și ruinele în perspectivă, fără geometrie planimetrică.
- Harta turistică Mapy.cz (2024) plasează un cerc la sit, dar nu îl leagă de un bastion distinct în originalul MNL.
- Raportul arheologic [Iosipescu–Ursu–Ursu, 1979](https://www.persee.fr/doc/mcarh_0076-5147_1979_num_13_1_1494) descrie părți structurale ale cetății, fără o coordonată geodezică accesibilă care să fie aceeași cu un pixel sigur din harta MNL.

**Verdict de admitere per-punct:** există martori fizici, istorici și topografici, dar **0 relații demonstrabile `același obiect → pixel unic MNL → coordonată independent măsurată`**. Nu se admite un transform afin nou și nu se calculează un RMS nou. Nu se modifică niciun hotar.

## 5. Decizia pentru ISTORIC

- **0 GCP noi**, **0 fotografii noi certificate**, **0/37 relații OHM**, **0/82 segmente Transilvania**, **0/15 segmente Chioar** admise.
- **0 schimbări** ale aplicației, `src/`, `public/`, arborelui ISTORIC, ACTUAL, OSMB, OHM sau frontierelor.
- **0 emailuri sau contacte instituționale**, comenzi, plăți, abonamente ori publicări de scanuri private.

**Următoarea poartă HIST-0.4q:** nu mai presupunem că harta administrativă MNL nr.2 conține un semn de ruină utilizabil. Fie se identifică pe **aceeași imagine** un reper fizic real reprezentat distinct și corespondent cu un punct geodezic, fie se schimbă sursa de bază spre un cadastru/ridicare militară **datată, georeferențiabilă independent și accesibilă gratuit**, după care se auditează separat proveniența juridică a fiecărui hotar. Repetarea identificării aceleiași cetăți din cataloage, fără noua piesă probatorie lipsă, nu este justificată.
