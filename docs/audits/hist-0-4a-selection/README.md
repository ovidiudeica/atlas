# HIST-0.4a — selecția familiilor istorice OHM

Data: 11 noiembrie 2026. Bază main: 1eb65a4f5c77dfa8c233e33d0fa3597dfac9576a. Date OHM din 10 noiembrie 2026.

Verdict: FAMILY_SELECTION_CATALOGUED / GEOMETRIES_NOT_ADMITTED / TREE_NOT_DESIGNED.

Această etapă selectează familii pentru catalogul editorial ISTORIC. NU autorizează importul vreunei geometrii, corecții, clip, asocierea automată la părinți ori schimbarea interfeței.

## 1. Familii principale selectate

| Familie | Versiuni OHM | ID-uri OHM |
|---|---:|---|
| Țara Românească | 4 | 2694164, 2929115, 2929116, 2929117 |
| Țara Moldovei | 2 | 2694163, 2746689 |
| Transilvania | 4 | 2747433, 2690518, 2878295, 2829384 |
| Bucovina și Districtul Bucovina | 6 | 2746380, 2746744, 2746379, 2746745, 2684081, 2746401 |
| Gubernia Basarabia | 2 | 2694153, 2694154 |
| Banatul Timișoarei | 2 | 2746573, 2747562 |
| Frontiera Militară a Banatului | 3 | 2746839, 2746840, 2746841 |
| Țara Chioarului | 2 | 2747435, 2747434 |
| Voivodina Sârbească și Banatul Timișan | 1 | 2694215 |
| Principatele Unite | 2 | 2746400, 2692354 |
| Regatul României | 9 | 2692219, 2693260, 2693464, 2693259, 2693258, 2693257, 2693256, 2693255, 2877966 |

Total: 11 familii, 37 variante OHM. Numai 12 din 37 au atribut de sursă la nivelul relației, iar 25 din 37 au avertisment fixme:s. Sursa poate fi prezentă și la nivel way; lipsa de pe relație nu este probă de inexistență.

Bucovina ca district militar, Districtul Bucovina și Bucovina ca ducat trebuie diferențiate temporal. La fel Banatul civil și Frontiera Militară a Banatului. Țara Moldovei (1812–1859 în subset) nu se confundă cu RSS Moldovenească. Nu se inventează versiuni medievale lipsă.

## 2. Subdiviziuni preselectate condiționat

| Familia de subdiviziuni | Variante OHM | Intersecții DRAFT | Fără intersecție DRAFT | Neconcludente |
|---|---:|---:|---:|---:|
| Comitate și județe istorice, clasificare OHM | 115 | 102 | 11 | 2 |
| Județe istorice moldovenești cu border_type nedeclarat | 14 | 13 | 0 | 1 |
| Districte administrative și de frontieră | 63 | 58 | 5 | 0 |
| Uezduri imperiale ruse | 29 | 26 | 3 | 0 |
| Cercuri administrative istorice | 8 | 8 | 0 | 0 |
| Regiuni/oblasturi istorice | 32 | 22 | 10 | 0 |
| Eialete otomane | 7 | 4 | 1 | 2 |
| Voievodate istorice | 3 | 3 | 0 | 0 |
| Județele administrației românești de la est de Nistru (1941–1944) | 3 | 3 | 0 | 0 |
| Alte gubernii și guvernorate | 3 | 3 | 0 | 0 |

Din cele 905 variante: 242 sunt PRESELECTED_SUBORDINATE_CATALOG, 30 sunt SUBORDINATE_BOUNDARY_SCOPE_REVIEW, 5 sunt SUBORDINATE_GEOMETRY_REVIEW, 37 sunt SELECTED_PRIMARY_FAMILY_CATALOG. Restul de 591 nu au fost selectate în această rundă, dar sunt conservate în inventar.

Cele 115 comitate și județe clasificate prin OHM sunt tratate separat de cele 14 variante (13 din aria DRAFT, una incompletă) ale județelor istorice moldovenești fără border_type declarat. NU se presupune o ierarhie sau identitate juridică după admin_level.

Cele 29 uezduri ruse OHM au uniform datele 1797–1923. Acest lucru impune verificarea cronologiei individuale, nu aprobarea automată a intervalului. Districtele austriece, militare și cele sovietice sunt categorii istorice diferite.

## 3. Condiții istorice și de proveniență

Aria Tisa–Carpați–Bugul de Sud–Dunăre–Balcani–Marea Neagră este un reper de cercetare; Nistrul este reper interior. Masca DRAFT din HIST-0.1 nu este frontieră naturală certificată. Un contur OHM care o intersectează nu este automat un candidat admis la publicare. Nu eliminăm variantele care cad în afara acelei măști aproximative.

Lacune principale: Țara Moldovei înainte de 1812, Țara Chioarului 1851–1860, Regatul României 1918–1919 și 1944–1945, gubernia Basarabia înainte de 1856. Datele OHM nu reprezintă certificare juridică a intervalelor. Un același teritoriu poate avea părinți diferiți în epoci diferite.

Dobrogea ca regiune istorică, Bugeac, RASS Moldovenească și Guvernământul Transnistriei ca întreg nu sunt relații explicit calificate în subsetul de 905, fără a fi declarate absente din baza OHM. Imperiile, provinciile antice, obiectele istorice neadministrative și regiunile culturale sunt amânate pentru examinări distincte.

## 4. Contract de lucru

Nu se importă și nu se editează geometrii OHM sau ACTUAL. Nu se construiește arbore/arbori, nu se setează relații părinte–copil, nu se modifică UI. Se păstrează toate cele 905 relații și semnalele de sursă, temporalitate, conflict identitar. Selecția per versiune rămâne dependentă de verificări și aprobări ulterioare.

Fișiere: primary-families-selected.csv, secondary-families-preselected.csv, secondary-names-in-full.json, per-ID 905 fragmentat în 21 fișiere, manifest și validare.