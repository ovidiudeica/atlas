# HIST-OHM-TREE.2A — auditul atașării copiilor la părinții OHM existenți

**Audit la 23 noiembrie 2026. Tip: exclusiv inspecție și calificare preliminară.** Nu adaugă relații în `ohm-parentage.json`, nu modifică interfața, geometriile OHM, ACTUAL sau proveniența. Detaliile reproductibile pentru fiecare dintre cei 18 părinți potențiali și instantanee temporale: [registrul QA](import/HIST-OHM-TREE.2A-EXISTING-PARENTS-AUDIT.json).

## 1. Ce există efectiv

Lotul OHM conține **76 grupuri-sursă** = 18 state/regiuni/instituții superioare + 19 județe + 39 comitate, cu **139 versiuni** și **125 active de geometrie** distincte exact.

Registrul activ `public/data/historical/v1/ohm-parentage.json` conține **19 relații datate**, dar **numai doi părinți au copii**:
- **Regatul României** — 16 județe în 1930: Arad, Maramureș și Timiș-Torontal documentate pentru 1926–1938, plus Bacău, Botoșani, Covurlui, Dorohoi, Fălciu, Iași, Neamț, Putna, Roman, Suceava, Tecuci, Tutova și Vaslui pentru **snapshotul documentar din 1930**, nu 1931 în mod automat.
- **Transilvania** — Țara Chioarului, comitatul Kraszna și comitatul Közép-Szolnok, **1733–1847**.

**Toate celelalte grupuri-sursă nu au momentan părinte atestat în registru, ceea ce nu înseamnă că au fost state independente.** Acestea sunt adunate artificial sub trei clase de navigație, iar secțiunile lor nu reprezintă ierarhii juridice. Grupuri diferite de sursă pot avea aceleași coordonate fără să fie aceeași instituție.

## 2. Instantanee ale arborelui ACTUAL (data de referință = 1 iulie)

| An | Relații părinte–copil active | Grupuri-rădăcină fără părinte calificat | Ce se vede în arbore |
|---:|---:|---:|---|
| 1730 | 0 | 76 | Numai rădăcini ale sursei, inclusiv Transilvania |
| 1735 | 3 | 73 | Transilvania → Chioar, Kraszna, Közép-Szolnok |
| 1800 | 3 | 73 | Aceleași trei legături Partium |
| 1848 | 0 | 76 | Nu se prelungește automat intervalul 1733–1847 |
| 1865 | 0 | 76 | **Principatele Unite nu are încă județe atașate** |
| 1880 | 0 | 76 | Comitatele OHM nu se pun sub Transilvania post-1867 |
| 1900 | 0 | 76 | Regatul României și comitatele fără parentaj calificat pentru acest an |
| 1930 | 16 | 60 | Regatul României → 16 județe |
| 1931 | 3 | 73 | Numai cele trei relații cu interval mai extins rămân admise |
| 1939 | 0 | 76 | Reforma ținuturilor nu permite extrapolarea copiilor din 1938 |
| 1942 | 0 | 76 | Județele transnistrene nu se atașează direct Regatului |
| 1946 | 0 | 76 | Părinții sovietici ai oblasturilor nu sunt în setul OHM |

**Aceste numere reprezintă toate cele 76 de grupuri istorice cunoscute, cu filtrul temporal pentru arbore separat de filtrul de vizibilitate a geometriei.** Cu filtrul de an activ, ramurile fără versiune-sursă în perioada respectivă pot dispărea vizual, dar nu sunt șterse din catalog. În 1930, dintre cele 16 județe sub Regat, **13 au final de perioadă OHM necunoscut** și nu pot avea bifă geometrică automată în filtrul temporal.

### Cum arată arborele existent, în 1800

```text
▾ Transilvania
  ☐ Țara Chioarului              (Partium, membru documentat)
  ☐ Comitatul Kraszna            (Partium, membru documentat)
  ☐ Comitatul Közép-Szolnok      (Partium, membru documentat)

Alte rădăcini neîncadrate:
  Principatul Moldovei; Țara Românească; Bucovina;
  și toate celelalte entități fără părinte calificat pentru 1800.
```

### Cum arată arborele existent, în 1930

```text
▾ Regatul României
  ☐ Județul Arad                — perioadă geometrică OHM cunoscută
  ☐ Județul Maramureș           — perioadă geometrică OHM cunoscută
  ☐ Județul Timiș-Torontal      — perioadă geometrică OHM cunoscută
  ◌ Județul Bacău               — părinte documentat; geometrie 1930 necalificată
  ◌ Județul Botoșani            — idem
  ◌ Județul Covurlui            — idem
  ◌ Județul Dorohoi             — idem
  ◌ Județul Fălciu              — idem
  ◌ Județul Iași                — idem
  ◌ Județul Neamț               — idem
  ◌ Județul Putna               — idem
  ◌ Județul Roman               — idem
  ◌ Județul Suceava             — idem
  ◌ Județul Tecuci              — idem
  ◌ Județul Tutova              — idem
  ◌ Județul Vaslui              — idem

Alte rădăcini: 3 județe transnistrene, 39 comitate și
18 grupuri istorice de rang superior/neîncadrate în 1930.
```

## 3. Primul lot cu părintele DEJA existent — Principatele Unite, în 1865

**Propunere de calificat, nu aprobată și nu introdusă în arbore:** 13 legături **Principatele Unite → județele moldovenești OHM** pentru o fotografie documentară din 1865:

Bacău, Botoșani, Covurlui, Dorohoi, Fălciu, Iași, Neamț, Putna, Roman, Suceava, Tecuci, Tutova, Vaslui.

Dovezi de pornire:
1. Ministerul de Interne, Agricultură și Lucrări Publice, *Indicele comunelor României după noua organizare a legii comunale*, Imprimeria Statului, București, **1865**, în special recapitularea finală și cele 13 antete de județ: https://commons.wikimedia.org/wiki/File:Indicele_Comunelor_Romaniei_1865.pdf ; transcriere digitală de lucru https://pdfcoffee.com/indicele-comunelor-romaniei-1865-pdf-free.html.
2. *Legea pentru înființarea consiliilor județene* din 2 aprilie 1864, în `Monitorul – Jurnalul Oficial al Principatelor Unite`: https://bjmures.ro/wp-content/uploads/2024/02/C00120.pdf.
3. Studiu administrativ al CJ Botoșani despre reorganizarea Botoșani/Dorohoi în 1864: https://www.cjbotosani.ro/files/H001_20260128.pdf.

Toate cele **13 geometrii OHM pornesc convențional în 1859 și au `end=null`**. Prin urmare: identitatea județului de epocă trebuie confruntată individual cu antetul din 1865 (inclusiv **Suceava = județul cu reședința Fălticeni, nu teritoriul Bucovinei**); datarea drept instituție nu aprobă automat conturul OHM pentru 1865. Nu se presupune continuitate neîntreruptă 1859–1881.

**Previzualizare dorită, după calificarea documentară:**

```text
▾ Principatele Unite  [1865]
  ◌ Județul Bacău
  ◌ Județul Botoșani
  ◌ Județul Covurlui
  ◌ Județul Dorohoi
  ◌ Județul Fălciu
  ◌ Județul Iași
  ◌ Județul Neamț
  ◌ Județul Putna
  ◌ Județul Roman
  ◌ Județul Suceava (Fălticeni)
  ◌ Județul Tecuci
  ◌ Județul Tutova
  ◌ Județul Vaslui
```

Dacă toate 13 trec calificarea, la anul 1865 numărul de grupuri fără părinte scade de la **76 la 63**, fără crearea vreunui părinte nou. Bifele geometrice rămân indisponibile cât timp perioada exactă a conturului nu este verificată.

## 4. Unde NU trebuie create legături fals pozitive

- **Transilvania → comitatele reformei 1876** este greșit ca legătură directă la acea dată: în urma integrării din 1867, administrația relevantă aparținea Regatului Ungariei, care lipsește din OHM. Studiu istoric: https://www.academia.edu/26742369/Parliamentary_Representation_in_Eastern_Hungary_1861_1918_Preliminary_Results_of_a_Prosopographic_Inquiry.
- **Transilvania → Zaránd**, pentru întreg poligonul OHM, nu poate fi admisă: comitatul a fost împărțit în 1732, iar în 1876 a trecut prin alte transformări teritoriale.
- **Bucovina ↔ Districtul Bucovina**, **Regiunea Akkerman ↔ Regiunea Ismail**, **Principatele Unite ↔ Regatul României** sunt cazuri de succesiune, statut ori identitate temporală, nu de subordonare administrativă părinte–copil.
- **Comitatele Kraszna/Közép-Szolnok → Sălaj**, **Caraș/Severin → Caraș-Severin** sunt reorganizări/fuziuni, nu ierarhii contemporane.
- **Banatul Timișoarei ↔ Frontiera Militară a Banatului**: administrații civile/militare distincte, fără părinte comun OHM suficient documentat.
- **Principatul Moldovei → 13 județe OHM** înainte de 1859: sursele OHM disponibile încep în 1859, astfel încât nu pot fi retrodatate pentru a reprezenta ținuturile principatului.
- **Regatul României → Iugastru/Jugastru, Moghilău, Tulcin** din 1941–1944: ar necesita intermediarul Guvernământul Transnistriei; aici nu se admite subordonare directă.
- **Țara Chioarului ca simplu copil al comitatului Közép-Szolnok**: în catalog există suprapuneri temporale și mențiuni despre subordonări mai vechi, dar trebuie verificat dacă era o entitate administrativă distinctă, o dependență istorică sau o versiune separată înainte de admitere.

## 5. Arhitectura vizuală recomandată

**Interfața trebuie să afișeze un arbore administrativ real, nu trei pseudo-părinți „State și regiuni / Județe / Comitate”.** Aceste clasificări pot deveni filtre secundare.

- Rădăcină = stat/provincie/unitate cu statut de părinte calificat pentru anul ales.
- Copiii = unități cu `direct_administrative_membership` datată și documentată.
- Secțiunea separată **„Neîncadrate / relație în verificare”** reunește entitățile fără părinte, nu le transformă în copii arbitrar.
- Pentru fiecare copil: săgeată pentru extinderea versiunilor și bifă pentru afișarea geometriei; când hotarul nu este calificat temporal, bifa trebuie dezactivată și explicată.
- Aceeași geometrie este reutilizată prin `geometryId` pentru mai multe perioade, fără afișare dublă, dar nici identitatea instituțională, nici raportul părinte–copil nu se deduc din egalitatea coordonatelor.
- Modificarea anului reface ierarhia și stările temporale; resetarea locală Istoric nu afectează selecțiile Administrativ.

## 6. Următorul pas permis

**HIST-OHM-TREE.2B — atașarea copiilor la părinții existenți**: control individual al celor 13 antete din *Indicele comunelor 1865*, stabilirea unui snapshot administrativ corect, admiterea succesivă a legăturilor Principatele Unite → județe, apoi verificarea altor relații disponibile la Regatul României și Transilvania, fără a adăuga părinți noi. Abia după stabilizarea acestor relații este oportun HIST-OHM-TREE.3 (părinții absenți).

**Audit-only / niciun fapt administrativ nou admis prin această etapă.**
