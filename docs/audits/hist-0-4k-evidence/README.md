# HIST-0.4k — identitatea Chioar și poarta de pixel pentru harta 1861

**Data:** 12 noiembrie 2026. **Bază:** `main@fb74848b12af40740718184e479b5205d4b54076` (PR #102, HIST-0.4j). **Intervenție:** numai probe documentare. Nu se reconstruiesc hotare.

## 1. Cele două dosare toponimice

**Karullya / Károlya → Coruia (Maramureș).** [Legea 1877:I §2](https://net.jogtar.hu/ezer-ev-torveny?docid=87700001.TV) numește `Karullya` la Szatmár; [scanările oficiale KSH](https://web.kshkonyvtar.hu/article/56/959/helysegnevtarak) au `Karully/Karulya` în Kővár, 1873 p.124, și `Károlya` la Szatmár, 1877 p.48. [Repertoriul 1882](https://www.bogardi.com/gen/g149.shtml) are `Károlya` în același district succesor; [Varga E. Árpád, Helységnévtár](https://www.kia.hu/kiakonyvtar/konyvtar/erdely/erd2002/hnevta02.pdf), intrarea `Coruia`, documentează seria cronologică (Karalya, Karullyer, Karulya) și continuitatea administrativă. [Borovszky](https://www.mek.oszk.hu/09500/09536/html/0020/7.html) atestă Karuly și formele medievale `Korullya` (1405) și `Karulya` (1475). **Verdict:** continuitate de nume pentru localitatea istorică **puternic documentată**, fără a asocia automat un ID OSM actual sau geometrii.

**Szt.-Kápolnok → posibil Szurduk-Kápolnok (Copalnic).** Legea 1877:I §2(2c) rămâne în transcriere cu **`Szt.-Kápolnok`**. Repertoriul 1873 arată `Szurdok (Kápolnok-)`, iar cel 1877 `Kápolnok (Szurdok-)`; [Varga](https://varga.adatbank.ro/?helyseg=magyar&k=450&pg=1), [Dorin Ștef (2023)](https://bjmures.ro/wp-content/uploads/2023/05/S00122.pdf), [raportul geologic din 1885](https://epa.oszk.hu/02900/02934/00042/pdf/EPA02934_mafi_evi_jel_1885_027-051.pdf) și [repertoriul Kővár](https://lexikon.katolikus.hu/K/K%C5%91v%C3%A1r%20vid%C3%A9k.html) identifică o localitate istorică numită Szurduk-Kápolnok, separată de Kápolnok-Monostor. Un [repertoriu juridic ulterior privind jurisdicția localităților fostului Chioar](https://mek.oszk.hu/13200/13288/13288.pdf) folosește explicit `Szurduk-Kápolnok (Kopalnik)`. **Dar nu este găsit un act de rectificare a formei `Szt.` din textul legislativ.** `Szt.` poate avea în alte contexte sensul `Szent`, deci **nu se expandează automat ca `Szurdok`**. **Verdict:** candidatură de identitate istorico-toponimică solidă contextual; legătura cu exacta abreviere din lege rămâne **nerezolvată probatoriu**.

Două înregistrări separate în `chioar-two-target-identity-dossiers.json` au surse și valori distincte pentru: nume juridic, lecturi 1873/1877, succesor probabil, continuitate a denumirii, identitate legală a comunei, ID modern, hotar, geometrie. **0 identități juridice comunale și 0 hotare sunt certificate**.

## 2. Examinare efectivă în pixelii originalului MNL, fotografia 8

Sursa: MNL OL S 75 nr.82, fotografie **1861**, stare administrativă **1859**. Rezoluția originalului: **6.415 × 10.156 px**, SHA-256 `0cd897c4e5d104042dab44bc47b3021722a5f294af565ad80b5bb15097bb9afe`. Imagini decupate **numai local**, fără redistribuire.

Am reexaminat legenda `Erklärung der Zeichen` de pe fotografia 9: distinge `Städte`, `Märkte`, `Dörfer`, `Landesgrenzen`, `Kreisgrenzen`, `Bezirksgrenzen`, `Gemeindegrenzen`, `Festungen`, `Forts`, `Ruinen` și semne pentru minerale/izvoare, inclusiv `Mineralquelle` și `Salzquelle`. **Un triunghi nu poate fi presupus „biserică” sau „cetate”.**

Pe fotografia 8, în pixeli absoluți ai JPEG-ului original:
- `Reps` (Rupea): simbol triunghiular inversat, poziție exploratorie **(1034, 6421)** cu incertitudine aproximativă ±12 px. Legenda sugerează **posibil simbol de izvor mineral**, dar nu este probată corespondența cu *un anumit izvor*. [Strategia municipiului Rupea](https://www.primariarupea.ro/wp-content/uploads/SDD-RUPEA-actualizata.pdf) descrie **șapte izvoare mineralizate captate** în două fântâni istorice; nu furnizează identificatorul unui izvor la coordonate de monument de pe harta 1859. **Nu este GCP**.
- `Tartlau` (Prejmer): semn triunghiular în perimetrul localității, **(4481, 9136)** ±12 px. Nu există dovada că semnul reprezintă punctul central al bisericii fortificate, deși monumentul este atestat separat în RAN. **Nu este GCP**.
- `Kronstadt` (Brașov): trama urbană ocupă o zonă largă, fără simbol de monument identificat unic. Centrul Bisericii Negre nu poate fi extras prin simpla alegere a centrului tramei.

Cele **șase** monumente fizice identificate în HIST-0.4j rămân candidați, fără pixel 1859 asociat pe simbol identificat independent. Pentru **Hărman**, conflictul coordonatelor moderne rămâne deschis.

## 3. Control numeric de reproductibilitate

Am recalculat, din erorile per-punct ale pilotului precedent (nu dintr-o transformare nouă), RMS: **918,86 m** pe 6 puncte de ajustare, **1.241,12 m** pe 2 puncte holdout și **1.574,97 m** leave-one-out pe 8. Acestea **nu** reprezintă eroarea georeferențierii cu obiective stabile: `GCP valide = 0`, astfel un RMS nou legitim ar fi **nedefinit**, nu zero.

Examinarea surselor de poziție fizică demonstrează neechivalența între centrele moderne Nominatim de localitate și obiectivele istorice:
- Rupea, biserică: circa **94 m** față de centrul Nominatim; cetate: **648 m**;
- Prejmer, biserică fortificată: **214 m**;
- Codlea, biserică: **857 m**;
- Brașov, Biserica Neagră: **2.167 m**.

Aceste diferențe sunt **între două localizări moderne de obiecte diferite**, nu reziduuri de transformare istorică și nu trebuie utilizate pentru recalibrare. Încercarea de a substitui orașele cu monumentele pe pixeli de localitate ar introduce eroare structurală.

## 4. Verdict și restricții

**HIST-0.4k:** nume `Karullya → Coruia` puternic coroborat; `Szt.-Kápolnok` explicat contextual, dar forma legală rămâne deschisă; **2 simboluri grafice localizate în pixeli**, **0 GCP valide**, **0/14 fotografii georeferențiate cert**, **0/82 segmente Landesgrenzen**, **0/15 segmente Chioar**, **0/37 relații admise la import**.

Nu s-au introdus surse rastru, KMZ-uri private, drepturi de publicare presupuse, corecții automate ale frontierei sau modificări ale `src/`, `public/`, ACTUAL, OSMB, OHM, tree ISTORIC sau GitHub Pages. Fără plăți sau comenzi de arhivă.

**Poarta HIST-0.4l:** obținerea actului de punere în executare/corecției oficiale care leagă forma `Szt.` de `Szurdok`; identificarea de repere fizice cu **simbol propriu unic** pe fotografii, coordonate independente geodezice, puncte reținute și RMS potrivit scării. Fără acestea, frontierele rămân închise.
