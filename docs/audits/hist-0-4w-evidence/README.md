# HIST-0.4w — facsimile arheologice și calificarea geodezică a porților Chioar

**15 noiembrie 2026** · bază main@b85c72aabcb320fd86d4dc30679aef5718b8907b · continuare HIST-0.4v.

**Verdict:** 14/14 pagini scanate verificate, 5 versiuni suplimentare de înaltă rezoluție, două figuri arheologice măsurate local, zero GCP-uri sau hotare juridice admise.

## 1. Facsimile recuperate

Am inspectat efectiv imaginile tuturor celor **4 pagini din [Iosipescu–Ursu–Ursu 1979](https://www.persee.fr/doc/mcarh_0076-5147_1979_num_13_1_1494)**, pp. 337–340, și ale celor **10 pagini din [Iosipescu–Ursu–Ursu 1983](https://www.persee.fr/doc/mcarh_0076-5147_1983_num_15_1_1851)**, pp. 474–483, folosind imaginile JPEG din serviciul Persée renderPage. Cinci pagini (1979: 337; 1983: 477, 478, 479, 482) au fost recuperate și verificate în formatul cu rezoluție aproximativ 1620 × 2340 px. URL-ul exact, SHA-256, dimensiunile și numărul de octeți sunt în [facsimile-page-register.json](./facsimile-page-register.json). PDF-urile integrale au refuzat descărcarea cu HTTP 403, dar aceasta nu invalidează imaginile individuale controlate. Nu s-au publicat copii grafice în repository.

## 2. Cele patru convenții de notare

Raportul **1979, p. 337**, introduce în descrierea de ansamblu A = cetatea mare est, B = cetatea mică vest, C = piața și culoarul de legătură, D = curtea exterioară, E = șanțul de vest. **Același raport** folosește apoi, în descrierea săpăturilor, B = poarta de mijloc și C = sectorul cetății mici. Raportul **1983** continuă codurile de săpături B = poarta pieței centrale, C = castelul mic exterior, D = piața de jos.

În plus, alfabetul **Holst** este diferit: A/B = cetatea mare/mică, G/H = intrările lor. **Figura 2 din 1983 (p. 477)** reproduce desenul atribuit lui Holst: nu este ridicare geodezică independentă și nu definește literele sectoarelor de săpătură. Nu se pot unifica literele fără contextul exact al sursei. Registrul explicit este [figure-and-metric-crosswalk.json](./figure-and-metric-crosswalk.json).

## 3. Planuri măsurate local și faze constructive

**Fig. 3, p. 478 (1983):** planul arheologic al turnului estic al porții centrale, cu indicator nord și bară grafică 0–1 m; sunt vizibile zone pline și hașurate. **Nu există o legendă explicită pentru semnificația cronologică a hașurii**, așa că ea nu poate certifica zidul original ori restaurarea. Facsimilul la rezoluție mare: SHA-256 e080b5934db908aa9849dc0483600d5a35a8839b49a9ea30a4a9dfaee5c152da.

**Fig. 4, p. 479:** secțiune stratigrafică estică a turnului, scara **1:50**, cu I = zidul casei scării, II = peretele sudic, III = primele asize ale feței anterioare, plus straturi 1–8 (două niveluri de ardere, cenușă și stâncă). Este un sistem metric **local**, nu un sistem global proiectat. Facsimilul la rezoluție mare: SHA-256 d4afa7f01ca34b5bdc47a4add219ee3e0fcfccd9acddb59dcb4cf5528fd21c8e.

**Figurile 5–13, pp. 479–481:** fotografiile arată ziduri, praguri, intrări blocate, turnul vestic și anexe. Acestea nu sunt puncte geodezice măsurate. În **1983, p. 482**, se menționează distinct valorile **4,15 m și 3,15 m** pentru trecerea porții centrale, trecerea de **3,70 m** a porții pieței de jos (sector D) și blocuri-stâlpi de aproximativ **0,50 × 0,50 × 0,90 m**. Măsurătorile locale pot fi utilizate pentru confruntarea arheologică, nu ca GCP.

## 4. Restaurare și limite de admitere

Textul 1983 confirmă deplasarea fundației vechi față de zidăria ulterioară a turnului estic, proiectul de restaurare al arhitectului **V. Brâncu** și intervențiile din 1981. [Muzeul Județean Baia Mare](https://www.muzeubaiamare.ro/vernisajul-expozitiei-cetatea-de-piatra-cetatea-chioarului/) confirmă reconstrucția unui turn de poartă, fără a identifica precis turnul și colțul reconstruit. Originalele proiectului de restaurare, ale releveului pre-1981 și ale planului as-built nu au fost recuperate. Culoarea solidă ori hașura din fig. 3 nu este tratată automat ca mască original/reconstruit.

Nicio sursă examinată nu furnizează **același colț de fundație** cu ID, coordonate moderne X/Y/(Z), CRS, epocă de măsurare și incertitudine. Un locator RAN sau OSM al sitului este insuficient. Originalul austriac 1:25.000 de la baza foii Șomcuta 2977 (1924) nu este certificat. Cazurile per-structură și testele de admitere sunt în [geodetic-restoration-gates.json](./geodetic-restoration-gates.json).

## 5. Verdict și următorul pas

**0 GCP-uri independente, 0 holdout-uri, RMSE nedefinit, 0/15 segmente Chioar, 0/82 segmente Transilvania, 0/37 relații OHM și 0 hotare juridice admise.**

**HIST-0.4x:** calificarea proiectului de restaurare V. Brâncu, a planurilor pre/post-1981 și a reperelor de fundație originală măsurate independent. Identificarea foii austriece 1:25.000 continuă separat; gravura Holst nu devine hartă metrică.

Operațiunea este exclusiv probatorie în docs/audits/hist-0-4w-evidence; nu schimbă aplicația, ACTUAL/OSMB/OHM ori Geodata GIS. Fără emailuri, plăți, comenzi sau publicarea surselor grafice brute.
