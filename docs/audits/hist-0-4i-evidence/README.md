# HIST-0.4i — controlul surselor MNL 1861 și reconcilierea paginilor KSH Chioar 1873/1877

**Data auditului:** 11 noiembrie 2026. **Tip intervenție:** numai dosar probatoriu, fără import / modificare de geometrii, OHM, ACTUAL, OSMB, `src/`, `public/`, interfață sau Pages. **Verdict:** `1873_1877_OFFICIAL_SCANS_MANUALLY_INSPECTED / 1873_92_VS_1877_91_TEXT_ENTRIES / PHOTO8_STABLE_GCP_NOT_QUALIFIED / ZERO_IMPORTS`.

## 1. Inventarul documentar verificat

S-au inspectat **direct** exemplarele oficiale de la [KSH Könyvtár](https://www.kshkonyvtar.hu/article/56/959/helysegnevtarak); capturile digitale originale sunt păstrate în arhiva locală și au hashuri în `chioar-91-documentary-screen.json`. Numerotarea de mai jos este **pagina tipărită** și, între paranteze, **indexul imaginii de pe serverul KSH**; nu trebuie confundată cu poziția PDF-ului sau cu pagina OCR-ului secundar:

| Ediție | Pagina tipărită (index JPG) | Secțiune | Constatare |
|---|---|---|---|
| 1873 | 124 (**114.jpg**) | `Kővár vidéke` — Nagy-Somkuti, Nagy-Nyiresi | 22, respectiv 20 intrări |
| 1873 | 125 (**115.jpg**) | `Kővár vidéke` — Monostori, Kis-Nyiresi | 21, respectiv 29 intrări |
| 1877 | 47 (**45.jpg**) | `Szatmár megye`, inclusiv Nagy-bányai | `Kapnikbánya` în lista administrativă județeană |
| 1877 | 48 (**46.jpg**) | `Szatmár megye`, Nagy-somkuti | 42 intrări de interes pentru lista juridică |
| 1877 | 50 (**48.jpg**) | `Szolnok-Doboka megye`, Kis-nyiresi și Monostori | 28, respectiv 20 intrări |
| 1877 | 51 (**49.jpg**) | Continuarea `Szolnok-Doboka megye` | Verificare de continuitate a rubricilor |

**Inventarul textual din 1873 numără 92 intrări** (22 + 20 + 21 + 29), nu 91. Repertoriul din 1877 oferă **91 intrări relevante** pentru repartizarea legii 1877:I §2 (43 în Szatmár = 42 în Nagy-somkuti și 1 în Nagy-bányai; 48 în Szolnok-Doboka = 28 în Kis-nyiresi și 20 în Monostori). Această diferență **nu demonstrează prin ea însăși** desființarea, alipirea ori schimbarea de hotar a unei comune.

Fișierul `chioar-91-documentary-screen.json` conține 91 înregistrări în ordinea legii, cu paginile sursă, grafia candidat, cercul din 1873, forma din 1877 când poate fi confruntată, tipul asocierii și toate porțile de aprobare închise. Transcrierile au scop de indexare și trebuie recitite la sursă în cazul caracterelor incerte; nu sunt un registru juridic al identității comunelor. Pentru comparație, **73** de rânduri au o variantă exact normalizabilă între textul legii și transcrierea vizuală din 1877, iar **81** între candidatul inițial și transcrierea din 1873. Acestea sunt indicatori **textuali de triaj**, nu număr de identități certificate.

## 2. Corecții documentare și excepții

- **Koltó / Katalinfalva:** două forme distincte în 1873; în 1877 apare `Katalin (Koltó-)`, iar în textul legii `Koltó-Katalin`. Asocierea este **potențial compozită**; nu rezultă automat dacă a existat contopire, redenumire ori altă modificare. Niciun ID modern sau poligon nu este atribuit.
- **Kolcér:** apare explicit în facsimilul 1873 (p. 124) și în 1877 (p. 48); în registrul preliminar din HIST-0.4h era marcat eronat ca neidentificat.
- **Erdőaranyos:** numele legal are candidat istoric `Aranyoserdő` (1873) și `Aranyos (Erdő-)` (1877); ordinea lexicală diferă. Asocierea nu este geografic/juridic certificată.
- **Kapnik-Bánya:** repertoriul 1873 indică `Kapnikbánya (része)`, adică **parte**; ediția 1877 plasează `Kapnikbánya` la Szatmár/Nagy-bányai. Nu echivalăm automat partea cu întregul.
- **Szt.-Kápolnok:** nu există corespondență univocă în transcrierea 1873; `Kápolnok (Szurdok-)` din 1877 rămâne un **candidat contextual**, nu o expansiune acceptată a abrevierii din lege.
- **Durusa / Darusa / Daruta, Mályán / Málhán, Kovács-Kápolnok / Kápolnok (Kovás-/Kavás-), Puszta-Hidegkut / Hidegkut:** variante lexicale și schimbări de calificativ de cercetat cu alte repertorii de epocă; nu se validează prin scor fuzzy.
- **Aranymező ≠ Aranyosmező:** intrări diferite, chiar dacă formele seamănă. În mod expres, nu se face contopire.

Corecția paginilor: lista `Kővár vidéke` din 1873 **nu** este pe imaginile KSH 116–117 (acelea arată deja alte unități). Referința auditabilă este **114–115.jpg / paginile tipărite 124–125**. Tot astfel, paginile Szatmár și Szolnok-Doboka din ediția 1877 sunt separate de pozițiile numerice din OCR-ul secundar. Acest dosar nu suprascrie retrospectiv probele HIST-0.4h.

## 3. MNL 1861 — control geografic independent, statutul real

Fotografia MNL OL S75 nr. 82, **imaginea 8**, are opt puncte **toponimice** de cercetare, dintre care șase pentru ajustare și două independente de ajustare pentru verificare. Localitățile identificate vizual pe hartă sunt Rupea (Reps), Odorheiu Secuiesc, Miercurea Ciuc, Sfântu Gheorghe, Brașov, Prejmer (Tartlau), Baraolt (Baróth) și Codlea (Zeiden). Coordonatele de referință provin din Nominatim/OSM modern, **nu** din frontierele OpenHistoricalMap. Majoritatea reperelor sunt însă **centre administrative moderne**, nu repere fizice precis localizate și demonstrabil stabile din 1859.

Ajustarea afină pilot are eroare RMS la ajustare **918,86 m**, RMS pe cele două puncte reținute **1.241,12 m**, RMS leave-one-out **1.574,97 m** și eroare maximă pe puncte reținute **1.413,13 m**. În aceste condiții **0 puncte sunt admise drept GCP-uri istorice stabile**, nu se aprobă world file-ul de cercetare și nu se certifică transformarea niciuneia dintre cele 14 fotografii. O potrivire automată anterioară pe fotografia 8, cu 41 inliers colapsați într-un singur descriptor, rămâne respinsă.

Pentru admiterea reală sunt necesare identificarea fotografiilor față de foile originale, repere **fizice** stabile (de exemplu, intersecții de ape sau construcții istorice documentate) identificate pe facsimil și într-o sursă independentă, coordonate măsurate/justificate, reziduuri și holdout adecvate scării, controlul distorsiunii locale și trasarea distinctă a `Landesgrenzen` față de `Kreisgrenzen`. Referința din 1862 poate avea aceeași filiație cartografică și nu poate servi singură drept probă independentă. Starea teritorială **1859** din hartă nu trebuie proiectată necritic peste schimbările **1861** sau 1863.

## 4. Decizie editorială / limitări

- **91/91** asocieri din registru rămân neaprobate ca identități geografico-juridice; 92/91 sunt numărări de intrări de repertoriu, nu indicatori de poligoane.
- **0/14** fotografii georeferențiate independent cu GCP-uri stabile; **0/82** segmente Transilvania și **0/15** segmente Chioar confirmate față de hotarul istoric; **0/37** relații admise la import.
- Nu se interpretează textul legii 1877:I ca dovadă geometrică pentru limitele districtului Chioar din secolele anterioare; este necesară sursă cadastrală/administrativă contemporană.
- Nu sunt publicate imagini originale MNL/KSH, fotografii, KMZ-uri private sau rastere georeferențiate; accesul la scanări **nu este echivalent cu drept de redistribuire**. Nu s-au făcut plăți, comenzi ori abonamente.

**Pasul ulterior:** `HIST-0.4j` — rezolvarea individuală a celor 18 grafii fără corespondență exactă în transcrierea 1877, a celor 10 fără corespondență directă în transcrierea 1873 și, prioritar, a cazului compozit Koltó–Katalinfalva; pentru cartografie, înlocuirea centrelor administrative moderne cu repere de teren stabile din fiecare fotografie, apoi verificare independentă a reziduurilor. Doar după surse cadastrale adecvate se poate redeschide calificarea limitelor.