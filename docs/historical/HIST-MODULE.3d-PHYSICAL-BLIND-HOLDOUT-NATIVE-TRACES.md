# HIST-MODULE.3d — repere fizice, HOLDOUT orb, scări și sectoare de hotar

**Data auditului:** 22 noiembrie 2026. **Stadiu real:** **PARȚIAL / HOLD**, nu certificare. Baza de referință: `HIST-MODULE.3c`, cu două georeferențieri exploratorii respinse. Această etapă nu transformă lipsa măsurătorilor independente în precizie artificială.

## 1. Scări și verificarea originalelor

- **Streit (1835):** fișierul PDF original WBC identificat prin SHA-256 `02e55f68e870aa6e8c65ff12a71e2a080a2787443eaa0e8a58e7c3fe83d1408a`. În cartușul scării **se citește 1:1.200.000**; în aceeași bandă apare „15 Meilen = 1° des Aequators”. Mărirea din imaginea de lucru 1600 × 1266 pixeli ajută citirea textului, dar **nu adaugă rezoluție** imaginii. Catalogul WBC declară **1:200.000** și este contrazis în privința acestui exemplar. Un al doilea catalog, David Rumsey, atribuie hărții Streit **1:1.200.000**. Nu deducem precizie metrică geodezică din scara nominală. [Original WBC](https://www.wbc.poznan.pl/Content/27667/PDF/17090.pdf) · [WBC catalog](https://wbc.poznan.pl/dlibra/publication/17090/edition/27667) · [Rumsey Streit](https://www.davidrumsey.com/luna/servlet/detail/RUMSEY~8~1~314314~90083475%3ADas-Grossfurstenthum-Siebenburgen).
- **Raffelsperger (1841):** JP2 original cu SHA-256 `c3b0f75ba204744405cb20e5f2af004d4514a108d131540c3a608cbb53dc7d87`. Catalogul David Rumsey declară **1:890.000**; **scara imprimată NU a fost încă măsurată independent** pe banda marginală. Controlul cartografic rămâne deschis. [Original / catalog](https://www.davidrumsey.com/luna/servlet/detail/RUMSEY~8~1~297853~90069447).

O comparație de numitori între ediții nu certifică datum-ul, proiecția, deformarea hârtiei sau coordonatele unei linii de hotar.

## 2. Examinarea reperelor fizice

S-au examinat rasterele folosite în 3c, inclusiv decupajul JP2 la rezoluție nativă din regiunea Dej–Bistrița și reproducerea integrală a originalului Streit. Rețeaua de râuri este reprezentată pe ambele; **nu a fost însă identificat cu certitudine un punct hidrologic în pixeli nativi și în teren** pentru a-l folosi la ajustare.

Registrul `georeferencing-3d-review.json` înscrie patru **locuri de cercetare, nu patru GCP-uri**: confluența Someșul Mare–Someșul Mic (Mica/Dej), Mureș–Strei, Târnava Mare–Târnava Mică și Olt–Cibin. Ele **nu au coordonate validate**, nu au pixel originar certificat, nu participă la FIT și nu sunt admise ca HOLDOUT. Confluențele, ca puncte mobile prin eroziune/depunere ori lucrări hidrotehnice, trebuie calificate suplimentar, nu presupuse stabile. Statutul istoric al confluenței de la Dej necesită atenție: [Arhiva Someșană 1932, articolul despre Cetan](https://documente.bcucluj.ro/web/bibdigit/periodice/arhivasomesana/pdf/BCUCLUJ_FP_279098_1932_009_016.pdf) discută **ipotetic** schimbări mult mai vechi ale albiei; aceasta nu dovedește o deplasare între 1835 și prezent. [Primăria Dej, hidrografie](https://www.primariadej.ro/Portals/0/Fisiere/HCL/2022/HCL%20138%20-%20Statutul%20municipiului.pdf).

**Criterii minime pentru admiterea unui GCP:** (a) punct fizic unic pe original la pixeli nativi, (b) identificator și coordonate independente pe referință fizică externă, (c) evaluare a migrației/lucrărilor și corectarea cronologiei, (d) incertitudine declarată, (e) verificare vizuală independentă, (f) registru semnat/fixat înaintea ajustării. Deocamdată **0/4** îndeplinesc ansamblul criteriilor.

## 3. HOLDOUT orb: cerință și adevărul operațional

HOLDOUT-ul din 3c era **disjunct, dar neorb**. Nu poate fi rebotezat drept orb. În 3d este **definit protocolul**, dar nu este executată o probă oarbă: evaluatorul independent trebuie să selecteze și să documenteze reperele fizice, să rețină cel puțin trei puncte HOLDOUT pentru **fiecare** hartă și să sigileze coordonatele-țintă înainte ca analistul să ajusteze modelul FIT. Analistul îngheață ulterior matricea/parametrii și numai apoi evaluatorul eliberează HOLDOUT pentru predicție. **Nu se reutilizează erorile publicate în 3c la alegerea eșantionului.**

Registrele consemnează onest: **0 GCP fizice valide; 0 puncte HOLDOUT oarbe evaluate; 0 transformări acceptate**. O împărțire de puncte în aceeași sesiune și o etichetă `blind=true` ar fi insuficiente.

## 4. Vectorizare independentă: încercare și limită

Au fost examinate borduri și linii colorate la scara surselor. Fără puncte fizice validate, fără atribuirea strictă a fiecărui segment unei jurisdicții și fără reper de coordonate nativ verificabil, **nu există un traseu legal al hotarului vectorizat independent și admis**. Nu generăm prin segmentare cromatică o `LineString` aparent exactă pentru a masca incertitudinea. Nici contururile HistoGIS nu sunt folosite drept șablon de digitizare.

Regula pentru viitoare trase: fiecare segment va avea `sourceMapId`, `nativePixelCoordinates` măsurate pe rasterul original, `originalLabel`, `lineStyle`, `readerId`, `uncertaintyPx`, `jurisdictionAssignmentEvidence`, `period`, `georeferenceId` și o probă independentă de revizuire. Până atunci `nativeLineDigitization.lines=[]` este corect și obligatoriu.

## 5. Cele opt dosare, fără reparentări

| Copil | Părinte HistoGIS | % exterior sursă | Rezultat 3d |
|---|---|---:|---|
| Doboka | Innere Szolnok | 100,000000 | **BLOCKED_SOURCE_PARENT**, două unități separate în sursele administrative; linia neatribuită independent |
| Mühlbach | Unterweißenburg | 100,000000 | **BLOCKED_SOURCE_PARENT**, scaun săsesc distinct; linia neatribuită independent |
| Bistritz | Transilvania | 0,228619 | **HOLD**, niciun contur nativ georeferențiat acceptat |
| Kövár | Transilvania | 3,004871 | **HOLD**, calificarea jurisdicției la data hărții lipsește |
| Zărand | Transilvania | 0,401048 | **HOLD**, limita de vest netrasată independent |
| Hunyad | Transilvania | 0,771978 | **HOLD**, limita sud-vestică netrasată independent |
| Kraszna | Transilvania | 2,029978 | **HOLD**, identitatea unității și hotarul neconfirmate |
| Mittlere Szolnok | Transilvania | 5,892093 | **HOLD**, abatere mare, fără reparare cosmetică |

Procentele sunt cele din QA **HistoGIS**, nu din cartarea originalelor. Harta din 1835, cea din 1841 și actul juridic din 1851 au intervale și structuri diferite. Nicio regulă de tip `intersection`, `buffer` ori `dissolve` nu poate converti în certificat un hotar neobservat.

## 6. Rezultat și continuare

**Accomplishment:** identificarea erorii de catalog la scara Streit, inventarul prudent de posibile repere naturale, protocol probator de HOLDOUT orb și inventar individual fail-closed pentru toate cele opt sectoare. **Neîndeplinite:** localizare fizică dublu confirmată la pixeli nativi, HOLDOUT orb efectiv, determinarea independentă a scării marginale Raffelsperger, digitizarea segmentelor originale atribuite sigur unei unități. Stadiu **HIST-MODULE.3d/PARTIAL-HOLD**, nu `3d/CERTIFIED`.

**Interdicții păstrate:** 0 poligoane istorice noi, 0 noi părinți administrativi, 0 înlocuiri ale originalelor HistoGIS, 0 modificări ACTUAL. Auditul și codul de verificare fail-closed pot fi integrate fără a modifica arborii sau datele teritoriale de producție.

**Pasul următor efectiv:** colecție de perechi raster-nativ/teren pentru câte trei repere fizice independente în fiecare sector geografic, cu operator distinct pentru HOLDOUT; georeferențiere potrivit proiecției după controlul distorsiunii foii; apoi trasare în pixeli nativi și comparație independentă pe fiecare din cele opt trasee. Numai validările reușite vor putea fi candidate la admitere.

## 7. Verificare fizică/independentă efectivă: EU-Hydro + decupaje la rezoluția nativă (22.11.2026)

S-au recontrolat **octeții ambelor originale**: Streit 1835 SHA-256 `02e55f68e870aa6e8c65ff12a71e2a080a2787443eaa0e8a58e7c3fe83d1408a`, Raffelsperger 1841 SHA-256 `c3b0f75ba204744405cb20e5f2af004d4514a108d131540c3a608cbb53dc7d87`. Cu GDAL s-au extras câte patru ferestre din rasterele nativ deschise ca `PDF:1:<original>` (2039 × 1613 px) și `<original>.jp2` (11426 × 8661 px), fără aplicarea transformărilor exploratorii din 3c. Ferestrele, dimensiunile, numele de fișier local și SHA-256 ale copiilor de examinare sunt în `georeferencing-3d-physical-topographic-crosscheck.json`. Copiile originale și decupajele rămân doar pe calculatorul autorizat în `C:\Users\Public\Documents\hist3c_sources\`, nu în distribuția publică a Atlas.

**Referință independentă de hotarele HistoGIS:** [Copernicus/EEA EU-Hydro River Network Database](https://copernicus.discomap.eea.europa.eu/arcgis/rest/services/EUHydro/EU_Hydro_RiverNetworkDatabase/MapServer), straturi de cursuri de apă Strahler 7–10, interogate ca `MapServer/{layer}/query` cu poligoane-envelope de selecție, `outFields=*`, `outSR=4326`, `f=geojson`. S-au inspectat câmpurile **`FNODE` / `TNODE`**, segmentele named/un-named și coordonatele comune ale capetelor, nu centrele orașelor. Datasetul EU-Hydro este o reprezentare topografică **modernă (2006–2012)**, nu o măsurătoare efectuată în 1835/1841; coordonatele numerice trebuie citite cu incertitudine nespecificată de serviciu.

| Reper | Nod EU-Hydro | WGS84 (lon, lat) — coordonată geometrică modernă | Confirmarea topologică | Verdict pentru GCP istoric |
|---|---|---|---|---|
| Someșul Mare + Someșul Mic, Mica–Dej | `NO35132805` | (23.91306916, 47.14449544) | 3 segmente numite convergente `RL35133368`, `RL35133366`, `RL35133419` | **NU** — confluența istorică nu e identificată la pixel unic independent |
| Strei + Mureș, Simeria | `NO35093042` | (23.05141309, 45.85175793) | `RL35093029` (continuare fără nume a Streiului), `RL35093068` (Mureș), `RL35093112` (continuare Mureș), trasă până la `RL35092948` numit Strei | **NU** — loc fizic modern atestat, corespondența punct-la-punct necertificată |
| Târnava Mică + Târnava Mare, Blaj | `NO35095608` | (23.89190263, 46.17095769) | `RL35095614` este o legătură scurtă (cca 39 m) între capătul identificat al Târnavei Mici (`RL35095825`) și nodul Târnavei Mari | **NU** — generalizare modernă + poziție istorică neconfirmate |
| Cibin + Olt, zona Podu Olt–Boița | `NO35092876` | (24.29198826, 45.64701244) | `RL35092867` este o continuare fără denumire de cca 96 m după `RL35092914` (Cibin), la confluența rețelei Olt (`RL35092865`, `RL35092954`) | **NU** — generalizare modernă + poziție istorică neconfirmate |

**Control vizual al originalelor:** pe Raffelsperger sunt lizibile râurile, toponimele și delimitările portocalii la rezoluția nativă; totuși o fereastră regională nu stabilește un `(x,y)` unic și demonstrabil al aceleiași confluențe istorice. Pe Streit 1835 colorările groase de delimitare administrativă pot fi confundate cu hidrografia fină; citirea aceleiași joncțiuni este și mai nesigură la scara 1:1.200.000. Niciuna dintre cele **opt inspecții regional-nativ** nu a produs o pereche documentată și auditabilă `pixel (x,y) ↔ nod topografic independent ↔ stabilitate în epocă`. Nu completăm un `pixelAtConfluence` prin inversarea transformării afine **respinsă** din 3c; aceasta ar fi circularitate metodologică.

**Concluzie suplimentară:** patru **localizări topologice independente moderne** sunt acum identificate, unele cu incertitudine de conectare; **zero GCP fizice istorice calificate** pentru ajustare și **zero HOLDOUT orb**. Acest nivel de probă califică existența/confluența regională în rețeaua modernă, dar **nu poziția fizică invariabilă din 1835/1841** și niciun hotar juridic. Fără o a doua probă topografică datată/teren și fără operator independent care poate delimita pixelul original, admiterea rămâne HOLD.

Sistemul de regresie `historicalPhysicalCrosscheck.mjs` / `hist-module-3d-physical-crosscheck.test.mjs` interzice schimbarea nejustificată a statutului vreunui punct în FIT/HOLDOUT ori modificarea ACTUAL.
