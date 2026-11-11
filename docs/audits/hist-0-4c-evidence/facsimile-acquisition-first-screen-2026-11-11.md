# HIST-0.4c — Recuperare de facsimile istorice și prima confruntare numerică

**Data:** 11 noiembrie 2026. **Bază:** `main@8ad28bf4e183c6425c6c98b0b2b525d9937b432b` (PR #94 integrat). **Stare:** `FACSIMILE_COPIES_VERIFIED / P0_OPEN / NO_GEOMETRIC_ADMISSION`.

## Materiale recuperate efectiv

1. **László Bendefy (1976), vol. II**, [copie digitală integrală, Academia Ungară de Științe](https://real-eod.mtak.hu/112/2/KIADV_072.pdf), **144.687.931 octeți**, SHA-256 `a1af589393436c6c2d1f9c169817a682f1f84b3b118c23f23b70cbacde2b2eb9`. Am extras și vizualizat **pagina PDF 28, planșa 12**: reproducere editorială a **`OSZK TK 2274`**, cu legenda `Kővár-vidék és Kraszna vármegye`. Planșa arată teritorii ale Kővár și Kraszna împreună. Nu este o scanare directă verificată a exemplarului păstrat în depozitul OSZK.
2. **Iulia Mesea / Muzeul Național Brukenthal (2017)**, [catalogul oficial](https://www.brukenthalmuseum.ro/pdf/catalog%20secvente%20ro%20eng.pdf), **14.602.688 octeți**, SHA-256 `0e67aac712d44ab77f382f4aae250fc724b39fc5169cafe30a383a6c8837b7b7`. Am extras și vizualizat **pagina PDF 45**, catalog `II/1`, reproducere a hărții **Johann Baptist Homann (1717)**, cota **`MNB XV/633`**. Reproducerea tipărită are rezoluție insuficientă pentru trasare GIS segment-cu-segment.

Ambele PDF-uri și extrasele vizuale sunt păstrate în spațiul **local** de cercetare `Documents/Atlas-OHM-Inventory-2026-11-10/hist-0-4c-cartography-originals/`, cu hashuri individuale în JSON. **Fișierele PDF și imaginile NU sunt introduse în GitHub/website**, deoarece drepturile de reproducere ale edițiilor moderne nu au fost clarificate; existența unei opere cartografice istorice în domeniul public nu stabilește automat condițiile de reutilizare ale scanării/editorializării moderne.

## Rezultat P0 pentru Chioar — control numeric, NU verdict de frontieră

[Bendefy, vol. I, §34](https://real-eod.mtak.hu/112/1/KIADV_071.pdf) indică pentru district circa **1.089 km²** și o scară aproximativă **1:360.000** pentru harta Mikoviny. Datele geometrice deja verificate în HIST-0.4b sunt:

| ID OHM | Perioadă OHM | Suprafața tehnică OHM | Membrul `way` cu sursă |
|---|---|---:|---:|
| [2747435](https://www.openhistoricalmap.org/relation/2747435) | 1650 – 1851-05-12 | 1.028,9583 km² | 0/15 |
| [2747434](https://www.openhistoricalmap.org/relation/2747434) | 1860-12-27 – 1876 | 1.028,9583 km² | 0/15 |

Diferență aritmetică față de descrierea lui Bendefy: **60.0417 km²** (**5.51%** din 1.089 km²). **Nu este o neconcordanță de frontieră demonstrată**: aria bibliografică este aproximativă, harta nu este georeferențiată, include și comitatul Kraszna, iar perioada și metodologia măsurătorii diferă de datele OHM. Nu se poate impune automat valoarea 1.089 km² ca suprafață corectată. Lacuna OHM 1851–1860 și lipsa surselor pe toate cele 15 `ways` rămân.

## Rezultat P0 pentru Transilvania

Copia catalogului muzeal verifică vizual existența unei reproduceri a unei hărți datate în catalog **1717**, din perioada relației [OHM 2747433](https://www.openhistoricalmap.org/relation/2747433) (1711–1732). Nu dovedește că liniile OHM reproduc exact harta; **contradicția `end_date=1732-12-31` / `end_event=Compromisul din 1867` rămâne**, împreună cu problema surselor segmentelor.

## Metodă, limite, pasul următor

- Descărcări efective prin HTTPS, dimensiuni și SHA-256 calculate local; 2/2 PDF-uri recuperate; 2/2 pagini-țintă redate și inspectate. Rasterizare locală cu Node 24, `pdfjs-dist@6.5.438`, `@napi-rs/canvas@1.1.0`; reproducer `pdf-render/render.mjs`; rezultatele `page-28.jpg` și `page-45.jpg` sunt numai locale.
- Originalele **OSZK TK 2274** și **MNB XV/633** nu au fost examinate fizic. Reproduceri facsimilare nu substituie o fișă cu dată, precizie, localizare, metodă de proiecție și toleranță geometrică. Nu există puncte de control cartografic acceptate ori măsurarea reziduurilor de georeferențiere.
- **Următorul prag**: obținerea de la instituții a scanărilor de rezoluție suficientă și a datelor despre exemplar/drepturi; georeferențiere non-destructivă reproductibilă și testarea per-`way` a celor trei P0. Nu deduce limitele Chioarului prin trasarea întregii planșe Kővár–Kraszna. Pentru P1/P2 rămân valabile registrul de 34 de dosare și restricțiile anterioare.

**P0=3, P1=25, P2=9; 37/37 cercetate documentar, 0/37 frontiere certificate, 0/37 admise.** Nu au fost schimbate date OHM/OSMB/ACTUAL, aplicația, arborii, modulele sau interfața. Această completare este numai probatorie.
