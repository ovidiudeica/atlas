# HIST-0.4s — marginea originală a foii 2977 și certificarea filiației austriece

**12 noiembrie 2026** · `ovidiudeica/atlas` · bază `main@7e1c08248a6bba50542c63e822f725b6ab0d3c8a`.

**Regim:** cercetare gratuită, prin surse publice și hărți deja disponibile. **Fără emailuri sau contacte instituționale, comenzi, plăți, abonamente, rastere republicate, date ACTUAL/OSMB/OHM ori frontiere modificate.**

## 1. Închiderea post-merge HIST-0.4r

[GitHub Actions run 43248873985](https://github.com/ovidiudeica/atlas/actions/runs/43248873985) a încheiat cu **success** ambele joburi, `Build and verify website` (inclusiv WEB-AUDIT.5 și Chromium desktop/mobil) și `Deploy GitHub Pages`. Aceasta închide tehnic etapa anterioară, nu dovedește hotare istorice.

## 2. Recuperarea originalului integral cu margini — probă nouă

În [catalogul MAPSTER al Planurilor Directoare de Tragere](http://igrek.amzp.pl/maplist.php?cat=ROMLCH020K&listtype=mapywig2), foaia **Șomcuta Mare, 2977, 1924** are două intrări diferite:

- [MAPSTER nr. 11788799](http://igrek.amzp.pl/details.php?id=11788799): **JPG neg eoreferențiat, imagine integrală cu margini**, 300 dpi, aproximativ 21,4 MiB.
- [MAPSTER nr. 11788800](http://igrek.amzp.pl/details.php?id=11788800): **GeoTIFF georeferențiat, marginile decupate**, aceeași ediție din 1924; nu o dovadă geodezică distinctă.

Am identificat în index și recuperat efectiv din arhiva MapyWig [JPG-ul complet al foii 2977](http://maps.mapywig.org/m/Balkan_states_maps/series/020K_Rom%C3%A2nia_L-CH_PDdT/jpg/PDdT_20K_2977_%C8%98omcuta_Mare_1924_300dpi_eHarta0260.jpg), prin HTTP public, fără autentificare. Control binar local: **22.480.703 octeți**, **9.821 × 7.376 pixeli**, JPEG 300 dpi, SHA-256 `367c2f3d5186bf04b4d980c7d4a4ab513cbc14192dcd37803ac969d1f49d93ce`. Au fost examinate vizual imaginea integrală și marginile originale. Decupajele au rămas **exclusiv pe calculatorul conectat**, fără copiere în GitHub.

**Limitare de transport:** HTTPS MAPSTER prezintă un certificat TLS nepotrivit în calculatorul conectat, astfel că lista a fost citită prin HTTP public, fără autentificare. Am verificat identitatea foii și conținutul geografic împotriva GeoTIFF-ului eHarta recuperat independent în HIST-0.4r. **Nu** deduc din această verificare o autenticitate criptografică a transferului HTTP ori o verificare de pixel identic pentru întregul raster.

## 3. Mențiunile de pe original — citire manuală directă

| Poziție | Inscripție citită | Concluzie admisă |
|---|---|---|
| Sus, centru | `PLANUL DIRECTOR DE TRAGERE` | Familia românească a hărții |
| Sus, dreapta | `ȘOMCUTA MARE 2977` | Foaia identificată |
| Jos, stânga | `Serviciul Geografic al Armatei 1924` | Emitentul și anul ediției |
| Jos, centru | `Scara 1:20.000` | Scara reproducerii românești |
| Jos, centru | `Echidistanța curbelor 20 metri` | Legendă de relief a ediției |
| Jos, dreapta | **`Ediție provizorie reprodus după hartă Austriacă la 1:25.000`** | **Sursa cartografică anterioară: hartă austriacă la 1:25.000** |

Această ultimă mențiune **rezolvă parțial filiația**: 2977 reprezintă o **reproducere provizorie din 1924** după o hartă austriacă la scara 1:25.000, **nu o ridicare topografică românească din 1924 demonstrată**. Ceea ce lipsea în HIST-0.4r — **tipul și scara sursei de bază** — este stabilit acum direct prin facsimil. **Nu** apare pe marginea inspectată numărul unic de foaie austriacă, anul ei de ridicare, data tipăririi originale ori raportul reziduurilor georeferențierii. Aceste câmpuri rămân `null`.

## 4. Încadrarea istorică: nu confundăm sursa cu o campanie presupusă

Documentația [BEV Austria — Historical Maps](https://www.bev.gv.at/en/Services/Products/Maps.html) datează la nivel de ansamblu **a treia ridicare militară, 1869–1887**, cu scara generală **1:25.000** și cu excepții **1:28.800** în Transilvania. Cercetarea [Timár–Molnár–Imecs–Păunescu](https://technicalgeography.org/pdf/1_2007/gt_1_2007.pdf) descrie complexitatea celei de-a doua ridicări pentru Transilvania, aproximativ 1853–1872 la 1:28.800, fără control geodezic uniform simplu.

Prin urmare, inscripția **„hartă Austriacă la 1:25.000”** este **compatibilă la nivel de scară** cu o hartă austriacă din familia ridicării a treia, dar nu dovedește **care foaie**, **care an** sau **care etapă militară** a furnizat datele concrete despre Kővár. Data **1877** nu poate fi folosită drept limită temporală a unei surse nedatate. O campanie de 18 ani nu este echivalentul datării fiecărei foi.

Au fost verificate separat cataloagele MAPSTER pentru serii austriece 1:25.000 și 1:28.800; căutarea în înregistrări după `Gaura`, `Galgó`, `Berkeszpataka`, `Somkut`, `Kővár` și alte forme nu a furnizat o intrare locală verificabilă. Rezultatul negativ **nu** demonstrează inexistența originalului. În Google Drive, căutările punctuale după Chioar și Kővár nu au livrat o foaie cartografică locală exactă; directoarele generale Transilvania necesită identificarea conținutului înaintea oricărei afirmații de proveniență.

## 5. Repere individuale și independența geodezică

Au fost păstrate cinci clase de posibile repere în `landmark-and-legal-boundary-independent-admission.json`: (a) un colț individual de zid/bastion la Cetatea Chioarului; (b) cota `406`; (c) meandrul Lăpușului; (d) un edificiu sau biserică stabilă din Berchezoaia; (e) un pod/drum cu obiect identic demonstrat. **Niciunul** nu este deocamdată (i) identificabil punctual și neechivoc în fotografia MNL nr. 2 reprezentând 1859 ori pe o foaie locală georeferențiabilă dinainte de 1877, **și** (ii) măsurat independent în sistem geodezic cu incertitudinea declarată.

Harta regională originală din 1862 și mărturiile din 1852/1865 rămân **martori istorici**, nu puncte de control geodezice. Reprezentarea ruinelor pe harta 1924, indicată de nume, nu este vârful unui bastion. Foaia 1924 `GeoTIFF EPSG:3844`, cu rezoluție ~1,7 m/pixel, este o rectificare a **aceleiași ediții** precum JPG-ul full-scan și nu poate fi socotită **a doua sursă independentă**.

Verdict: **0 GCP-uri noi**, **RMS nou/holdout nedefinite**, **0/15 segmente Chioar**, **0/82 segmente Transilvania** și **0/37 relații OHM** admise. Disputa nomenclaturii juridice `Szt.-Kápolnok` și dovada hotarului juridic se păstrează separate; nicio potrivire cartografică nu certifică retroactiv o limită de comună.

## 6. Pasul următor — HIST-0.4t

Recuperarea **foii austriece originale 1:25.000** care a stat concret la baza ediției 2977, cu titlu/număr, sursă de ridicare și an pentru **sectorul Kővár**; numai după aceea se pot confrunta un punct fizic unic din sursa austriacă, reperul de pe 2977 și coordonata unui obiect modern efectiv măsurat. Dacă sursa austriacă originală este după 1877, ea rămâne martor topografic util, dar nu certifică situația legală din 1859/1877.

**Nu se revizitează** prin presupunere pasul juridic. Nicio modificare la `src/`, `public/`, arbore, ACTUAL, OSMB, OHM, geometrii și niciun raster publicat sau email trimis.
