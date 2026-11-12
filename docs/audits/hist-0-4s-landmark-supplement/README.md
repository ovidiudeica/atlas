# HIST-0.4s-LM1 — supliment: biserici istorice și continuitatea amplasamentului (Chioar)

**12 noiembrie 2026.** Supliment **aditiv**, în urma [HIST-0.4s, PR #111](https://github.com/ovidiudeica/atlas/pull/111), `main@7709c8d07036e010da5a8d13abc14c349dcb3fa7`, cu [CI și Pages post-merge reușite (run 43256089018)](https://github.com/ovidiudeica/atlas/actions/runs/43256089018). Nu înlocuiește și nu modifică dovezile de filiație deja certificate în `docs/audits/hist-0-4s-evidence/`.

## 1. Sursa 2977: dovada originală este păstrată

Originalul integral [MAPSTER/MapyWig nr. 11788799](http://igrek.amzp.pl/details.php?id=11788799), foaia **Șomcuta Mare 2977**, a fost identificat și recuperat în dosarul părinte. L-am verificat suplimentar, direct din copia locală, cu **22.480.703 octeți**, **9.821 × 7.376 pixeli**, SHA-256 `367c2f3d5186bf04b4d980c7d4a4ab513cbc14192dcd37803ac969d1f49d93ce`. Am recitit vizual marginea inferioară:

> Ediție provizorie reprodus după hartă Austriacă la 1:25.000

Aceasta stabilește direct **scara și categoria sursei austriece** și anul ediției românești **1924**, fără să dovedească foaia austriacă exactă, anul ridicării ei ori statutul de hotar administrativ în 1859. TIFF-ul [eHarta 2977](https://www.geo-spatial.org/vechi/file_download/25790) este un produs decupat și georeferențiat al **aceleiași ediții**, nu a doua mărturie cartografică independentă.

## 2. Trei amplasamente cercetate prin index WFS și prin WMS

Am folosit **coordonatele muzeale doar pentru selectarea sectorului** în indexul public WFS `geospatial:index_pt_20k`, apoi am recuperat separat **trei imagini WMS**, de câte 1.400 × 1.000 pixeli, în vecinătatea amplasamentelor. Fiecare are bbox, număr de octeți, SHA-256 și verdict individual în `monument-chronology-and-wms.json`. Imaginile sunt fișiere de lucru **locale** și nu au fost publicate.

| Monument | Datare și amplasament | Admitere |
|---|---|---|
| [Biserica de lemn din Buteasa](https://chioar.culturamm.ro/biserica-de-lemn-sfintii-arhangheli-mihail-si-gavril-din-buteasa/) | Rezumatul spune **1800**; descrierea istorico-arhitecturală propune **1751**, iar consacrarea este menționată în **1839**. Coordonate muzeale 47,44749 N / 23,54702 E; indexul dă foaia **2977**. Acoperișul a cedat în ianuarie **2019**. | **Candidat P1**, nu GCP: vechimea clădirii este plauzibilă, însă un colț de zid/fundație supraviețuitor și măsurat independent nu a fost demonstrat |
| [Biserica de lemn din Vălenii Șomcutei](https://chioar.culturamm.ro/biserica-de-lemn-sf-arhangheli-din-valenii-somcutei/) | Rezumatul atribuie **secolul XVII**, descrierea aproximează **1741**; la restaurarea din **1845** s-au modificat intrarea și pridvorul. Coordonate muzeale 47,47433 N / 23,44854 E; WFS găsește **2977 Șomcuta Mare** și **2877 Silimeghiu**. | **Candidat P1**, nu GCP: la contactul foilor trebuie verificată foaia-sursă exactă și fundația originală |
| [Biserica din Codru Butesii](https://chioar.culturamm.ro/biserica-de-lemn-sf-arhangheli-mihail-si-gavril-din-codru-butesii/) | Edificiu vechi, dar cumpărat și **mutat pe amplasamentul actual în 1937**, după tipărirea foii 2977. Coordonate muzeale 47,46785 N / 23,59990 E; acoperire **2977**. | **EXCLUS** ca reper staționar al **acelui amplasament** în 1859/1924 |

Tot ca excludere cronologică, [Muzeul de Istorie și Arheologie Baia Mare](https://www.muzeubaiamare.ro/azi-despre-manastirea-ortodoxa-de-la-somcuta-mare-nagysomkut/) documentează biserica de lemn mutată **din Șomcuta Mare la Ulmeni în 1895**: locul ei actual nu poate deveni punct al satului Șomcuta din 1859.

## 3. De ce rămân 0 GCP-uri

O coordonată afișată pe o pagină muzeală este o **poziție de localizare a sitului**, nu poziția geodezică măsurată a aceluiași colț de edificiu. Centrul ferestrei WMS calculat din acea coordonată nu este nici el un pixel determinat **vizual pe originalul istoric**. Nu s-a demonstrat identitatea individuală a unui simbol în **1924**, pe foaia militară austriacă **încă neidentificată** și pe fotografia administrativă MNL **1859/1861**.

Prin urmare: **0 perechi punct–obiect admise**, **0 GCP-uri**, **0 RMS/holdout nou**, **0/37 geometrii OHM**, **0/15 segmente Chioar** și **0/82 segmente Transilvania** certificate. Nicio regularizare toponimică sau juridică a lui `Szt.-Kápolnok`.

## 4. Următorul pas specific — HIST-0.4t

Înaintea altor căutări generice, se caută **foaia austriacă originală la 1:25.000** ce a fost reprodusă la Șomcuta în 1924, cu indicativ, ediție și an verificabile; în paralel se identifică o foaie **militară/cadastrală pre-1877** cu un edificiu individual vizibil, apoi se verifică independent **același punct fix** din teren. Georeferențierea și probele de hotar administrativ rămân operațiuni separate.

**Regim respectat:** fără emailuri, contacte instituționale, comenzi, plăți, abonamente, republicarea rastrului ori intervenții asupra ACTUAL/OSMB/OHM/interfeței.
