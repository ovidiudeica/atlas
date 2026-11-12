# HIST-0.4s — marginaliile foii 2977 și admiterea individuală a reperelor stabile

**Data:** 12 noiembrie 2026. **Bază:** `main@7e1c08248a6bba50542c63e822f725b6ab0d3c8a`. **Cercetare exclusiv gratuită, fără contacte instituționale, emailuri, comenzi, plăți, autentificări sau intervenții asupra geometriei istorice.**

## 1. Închiderea tehnică a HIST-0.4r

Execuția [GitHub Actions #43248873985](https://github.com/ovidiudeica/atlas/actions/runs/43248873985) este terminală cu **success** atât pentru build, verificările SIM/WEB-AUDIT/Chromium, cât și pentru publicarea GitHub Pages.

## 2. Foaia 2977 — ce știm despre dată și ce nu știm

HIST-0.4r a recuperat efectiv de la eHarta individualul **Șomcuta Mare, indicativ 2977, ediția 1**, iar [catalogul public](https://www.geo-spatial.org/vechi/maps/download-planuri-tragere.php) îi atribuie **anul tipăririi 1924**. Fișierul `2977.tif` (21.353.131 octeți, 8.883 × 5.966 pixeli, SHA-256 `c97eea5662827f5d36dbaf1bd26c6fb6a1814c992ee783d1c7b441c153718ff2`) este un **produs georeferențiat, decupat, în EPSG:3844**, nu o probă că deținem scanarea brută cu toate marginile tipărite.

Am verificat direct [metodologia de documentare eHarta](https://geo-spatial.org/vechi/articole/eHarta-work-planurile-de-tragere). Ea cere **șapte câmpuri distincte**: nume hartă, an tipărire, retipărit, sursă, an harta-sursă, an ridicare și actualizări. Proiectul eHarta descrie [scanarea foilor A0 la 300 DPI și prelucrarea prin georeferențiere, decupare, optimizare](https://geo-spatial.org/vechi/download/planurile-directoare-de-tragere). **Anul 1924 este, prin urmare, anul de tipărire din catalog, nu o certificare a anului ridicării.**

### Încercări publice concrete de recuperare a marginilor

- [Pagina publică de previzualizare, `mapId=260`](https://www.geo-spatial.org/vechi/maps/preview-pt-zoomify.php?mapId=260) răspunde HTTP 200, dar oferă doar un container **Flash** cu vechea cale Zoomify `../images/planuri_tragere/preview/prim/2977`.
- Metadatele Zoomify `ImageProperties.xml` pentru foaia 2977 au răspuns **404** pe ambele variante de hostname încercate. Variantele de cale apropiate au răspuns tot 404.
- [Ruta `pt-metadata.php?mapId=260`](https://www.geo-spatial.org/vechi/maps/pt-metadata.php?mapId=260) a răspuns **404**; adăugarea parametrului de limbă nu a schimbat rezultatul.
- Pentru URL-ul exact al metadatelor Zoomify, indexul public Wayback CDX a returnat `[]`, fără o copie arhivată găsită prin acea căutare.
- Interogarea publică a [registrului `pt-grid-json.php`](https://www.geo-spatial.org/vechi/maps/pt-grid-json.php?start=0&limit=1&filter%5B0%5D%5Bfield%5D=idi&filter%5B0%5D%5Bdata%5D%5Btype%5D=numeric&filter%5B0%5D%5Bdata%5D%5Bcomparison%5D=eq&filter%5B0%5D%5Bdata%5D%5Bvalue%5D=260) confirmă numărul, titlul, ediția și 1924, dar **nu returnează data ridicării ori sursele de cartografiere**.

Nu s-au accesat formulare de înregistrare/autentificare, nu s-a cerut niciun document și nu s-a trimis un email. Eșecul acestor căi publice **nu dovedește inexistența exemplarului complet**. Anul ridicării, proveniența materialului-sursă, statutul de retipărire și eventualele actualizări rămân **necunoscute**, nu estimate.

## 3. Repere fizice anterioare anului 1859 — probe noi

În loc să transformăm centrul ruinelor într-un punct fictiv, am cercetat trei monumente databile și am cerut direct de la **WFS `geospatial:index_pt_20k`** indexul foii care intersectează coordonatele publicate de proiectul de patrimoniu [Biserici de lemn din Țara Chioarului](https://chioar.culturamm.ro/tara-chioarului/). Pentru fiecare amplasament s-a obținut și inspectat un decupaj WMS la 1:20.000 (1.400 × 1.000 pixeli, aproximativ 900 m lățime), păstrat exclusiv local. Registrul oferă pentru fiecare **bbox, hash SHA-256, răspuns HTTP și metadate**.

| Monument | Dovada cronologică | Poziție în index | Verdict |
|---|---|---|---|
| [Biserica de lemn Buteasa](https://chioar.culturamm.ro/biserica-de-lemn-sfintii-arhangheli-mihail-si-gavril-din-buteasa/) | Rezumatul spune **1800**; descrierea propune **1751** și consemnează sfințirea **1839**. Acoperișul s-a prăbușit în ianuarie **2019**. | Foaia **2977**, 1924. Coordonate patrimoniale 47.44749, 23.54702. | **Candidat documentar**, fără colț de fundație supraviețuitor și măsurat independent |
| [Biserica de lemn Vălenii Șomcutei](https://chioar.culturamm.ro/biserica-de-lemn-sf-arhangheli-din-valenii-somcutei/) | Rezumat: sec. XVII; descriere: probabil **1741**; în **1845** a fost schimbată intrarea și a fost adăugat pridvorul vestic. | La contactul foilor **2977 Șomcuta Mare** și **2877 Silimeghiu**; coordonate 47.47433, 23.44854. | **Candidat documentar**, fără simbol punctual original identificat sau vârf măsurat independent |
| [Biserica Codru Butesii](https://chioar.culturamm.ro/biserica-de-lemn-sf-arhangheli-mihail-si-gavril-din-codru-butesii/) | Clădirea este veche (datarea catalogului și istoricul diferă), dar a fost **mutată aici în 1937**, după tipărirea foii 2977. | Foaia **2977**, coordonate 47.46785, 23.59990. | **EXCLUSĂ** ca reper fix la amplasamentul actual pentru **1859** și **1924** |

Ca test negativ suplimentar, [Muzeul Județean de Istorie și Arheologie Maramureș](https://www.muzeubaiamare.ro/azi-despre-manastirea-ortodoxa-de-la-somcuta-mare-nagysomkut/) documentează mutarea în **1895** la Ulmeni a vechii biserici de lemn din Șomcuta Mare. Punctul clădirii din Ulmeni nu poate fi folosit pentru poziția aceleiași biserici la Șomcuta în 1859.

**Rezultatul inspecției WMS:** cele trei sectoare conțin clădiri și drumuri cartografiate în mod real. La coordonatele nominale de patrimoniu, **niciun colț de biserică sau semn unic nu a fost asociat cu certitudine cu un pixel al originalului 1924**, și cu atât mai puțin cu același obiect pe fotografia MNL 1859. Centrul unui decupaj WMS bazat pe coordonata publicată **nu este** un punct măsurat pe harta veche.

## 4. Independența surselor de dinainte de 1877

[Timár et al., *Datum and Projection Parameters for the Transylvanian Sheets*](https://technicalgeography.org/pdf/1_2007/gt_1_2007.pdf) confirmă ridicările locale circa **1860–1872**, la **1:28.800**, și nevoia de repercuse locală. [Inventarul arhivei militare maghiare](https://vmek.oszk.hu/01300/01336/html/) distinge colecția specifică Transilvaniei, iar [înregistrarea bibliografică OSZK](https://nektar.oszk.hu/hu/manifestation/2649974) avertizează că un DVD generic al Regatului Ungariei **exclude Transilvania**. Nu vom folosi acea ediție drept substitut sigur al unei foi Chioar.

Originalul regional [*Karte des Grossfürstentums Siebenbürgen*, 1862](https://upload.wikimedia.org/wikipedia/commons/a/ad/Gro%C3%9Ff%C3%BCrstentum_Siebenb%C3%BCrgen_1862.jpg), recuperat în HIST-0.4r, rămâne important pentru reprezentările generale ale epocii, dar **nu a demonstrat un colț de biserică unic** vizibil și pe 2977. Georeferențierea lui pe baza hărților austriece mai târzii nu constituie probă geodezică independentă.

## 5. Decizia de admitere și pasul următor

**0 GCP-uri noi**, **0 valori RMS/holdout nou calculate**, **0/37 relații OHM promovate**, **0/15 segmente Chioar**, **0/82 segmente Transilvania** certificate. Fotografiei administrative MNL OL S75 nr.82 îi rămâne statutul de context, fără semn de cetate/biserică individual verificat. Certificarea unui obiect fizic nu certifică automat hotarul politic ori administrativ al unei comune.

**HIST-0.4t recomandat:** identificarea unei foi locale originale **1:28.800 (1860–1872)** sau a unui cadastru pre-1877 care reprezintă explicit biserica din Buteasa/Vălenii Șomcutei. Urmează admiterea **unui singur colț de fundație actual, expertizat și măsurat**, demonstrabil neschimbat, iar apoi minimum patru GCP-uri necoliniare și control holdout separat. După georeferențiere, hotarul juridic se examinează distinct pe actele perioadei.

**Nicio imagine terță, raster, KMZ privat sau geometrie nouă nu este publicată; se păstrează numai registre, legături, hashuri și verificări.**
