# HIST-0.4o — cercetare fără comunicări instituționale, calificare juridică și puncte de control

**Data:** 12.11.2026 · **Bază:** `main@cc4389bf511a459081616ec47609da8f03a8bb81` (HIST-0.4n). **Restricție expresă:** **fără emailuri, mesaje, formulare, contacte instituționale, comenzi, plăți sau abonamente**. S-au consultat exclusiv surse publice gratuite și fotografii disponibile deja local în proiect. Nimic nu este expediat din contul utilizatorului. Nu se trimite nici draftul Gmail creat în HIST-0.4n.

## 1. Închiderea post-merge HIST-0.4n

[GitHub Actions, run 43192757592](https://github.com/ovidiudeica/atlas/actions/runs/43192757592) are **ambele joburi cu verdict `success`**: `Build and verify website` (inclusiv regresii statice, reproducibilitate SIM, Vite/TypeScript, WEB-AUDIT.5 și Chromium desktop/mobil) și `Deploy GitHub Pages`. Acest fapt închide tehnic execuția anterioară, dar nu certifică dovezile istorice.

## 2. `Szt.-Kápolnok`: ce confirmă și ce nu confirmă sursele gratuite

Textul disponibil [1877:I §2(2c)](https://net.jogtar.hu/ezer-ev-torveny?docid=87700001.TV) afișează în continuare `Szt.-Kápolnok`; ediția PDF derivată a legii precizează sancționarea la 13 martie 1877 și promulgarea parlamentară la **16 și 17 martie 1877**. Indexul Hungaricana identifică patru piese parlamentare: nr. **503** (proiect, p.4), **529** (lege aprobată, p.150), **204** (Camera Magnaților, p.271), **231** (Camera Magnaților, p.364), toate cu `Szt Kápolnok` în OCR-ul asociat. **Nu există o nouă citire vizuală a vreunui original**; nu certificăm punctuația în ediția tipărită din OCR.

Repertoriile KSH 1873 p.125 `Szurdok (Kápolnok-)` și KSH 1877 p.50 `Kápolnok (Szurdok-)` (examinate vizual anterior) și [compendiul jurisdicțional din 1885](https://mek.oszk.hu/13200/13288/13288.pdf), care consemnează `Szurduk-Kápolnok (Kopalnik)`, susțin **identificarea toponimică** a localității Copalnic. Aceste surse nu îndreaptă automat grafia din lege. [Varga](https://www.kia.hu/kiakonyvtar/konyvtar/erdstat/hnevtar.pdf) documentează succesiunea numelui.

Am verificat piste pentru un exemplar gratuit al ediției [Ráth Mór, 1877](https://www.antikvarium.hu/konyv/1877-ik-evi-orszaggyulesi-torvenyczikkek-560956-0) și al [Corpus Juris Hungarici, 1877–1878, ediție 1896](https://www.antikvarium.hu/aukcio/index.php?aid=3608&bid=762221&t=cd). Paginile identificate sunt **cataloage**, nu facsimilele actului. Un volum Google Books cu titlu apropiat nu a putut fi dovedit drept **același** volum parlamentar XIV din 1875. Nicio scanare originală autentificată și nicio rectificare publicată nu au fost recuperate. **Absența unei rectificări în căutare nu dovedește că ea nu a existat.**

Rezultate: `4_original_folios_INDEXED`, `0_original_facsimiles_READ`, `0_official_corrigenda_CERTIFIED`, `0_legal_commune_identities_CERTIFIED`.

## 3. MNL 1859, fotografia nr. 2: noul sector de control în pixeli

Am recitit originalul local **6.379 × 9.819 px**, SHA-256 `bd9c01173c1ddc89a97414215b0771b9d88861f192f547a2ec718bb2b9cb72a9`. Am realizat local o vedere de ansamblu cu grilă din 500 în 500 de pixeli originali și trei decupaje de control, toate **nepublicate**. În zona Berkeszpataka–Butyásza apar cele două localități și alte toponime ale fostului Chioar. Pentru căutări ulterioare este stabilit un **dreptunghi exploratoriu** (coordonate în originalul JPG): `x=2600..3650, y=2500..3650`. Acesta **nu este** poligonul cetății și **nu** este o geometrie georeferențiată.

**Constatare de cartografie semantică:** linia groasă, sinuoasă, de lângă Berkeszpataka nu este demonstrată drept râul Lăpuș. Harta include și **limite administrative** reprezentate prin linii groase. Nu o transformăm în meandru, confluență, frontieră sau GCP. Nici simbolul distinct al ruinelor, nici o coordonată pixel de **același obiect fizic** nu au putut fi confirmate. Așezările reprezentate prin puncte/trame sunt generalizări și nu localizează automat bastioane sau repere topografice.

Rămân valide **ca documente de context**, nu ca hotare juridice, mărturiile Kővári (1852) și Pesty (Berkeszpataka, 7.04.1865), [RAN 108525.01](https://ran.cimec.ro/sel.asp?codran=108525.01), precum și pozițiile moderne publicate în trei surse, dar situl arheologic întins aproximativ 600 m nu permite echivalarea centrului generic cu un vârf sau bastion măsurat. Divergențele istorice dintre atribuirea la Butyásza și Berkeszpataka rămân deschise.

## 4. Edițiile topografice „Gaura und Galgó” rămân distincte

Am reconfirmat că [MAPSTER/LoC 1886](https://igrek.amzp.pl/11860629), scara **1:75.000**, și [MAPSTER/LoC 1900](https://igrek.amzp.pl/details.php?id=11860630) sunt **două fișiere catalogate distinct**, neexaminate vizual aici. Accesul direct la serverul MAPSTER și endpointul LoC a eșuat în mediul curent. Exemplarului [NYPL/Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Gaura_und_Galgo._NYPL1226642.tiff), analizat anterior în ediția cu marcaj **„Nach Zeichenschlüssel 1904”**, nu i se atribuie fictiv anul 1886. Nu s-a confirmat un pixel de ruină care să poată fi pus în corespondență cu pixelul MNL din 1859.

Asemănările regionale de relief și toponimie între foi din epoci diferite nu sunt probe geodezice independente ale unui **punct unic** și nu constituie prin ele însele hotare administrative contemporane.

## 5. Poarta de georeferențiere și import

`GCP_acceptate=0`; `RMS_afin_nou=null` (nedefinit), `RMS_holdout_nou=null`; `fotografii_MNL_georeferențiate_certificat=0/14`; `segmente_Transilvania=0/82`; `segmente_Chioar=0/15`; `relații_OHM_importate=0/37`.

**Fără modificări** la `src/`, `public/`, ACTUAL, OSMB, OHM, arborele ISTORIC, Pages sau frontiere. Nu sunt distribuite fotografii/decupaje MNL, rastru NYPL, tile-uri Arcanum ori KMZ-uri private și **nu s-a trimis vreun email**.

### HIST-0.4p — pas probatoriu fără contacte instituționale

Recuperarea unei hărți cadastrale / ridicări militare **accesibile public**, cu semn și contur explicit al **unui bastion, al unei stânci sau al unei intersecții naturale stabile**, plus o măsurătoare independentă a **aceluiași obiect**. Se vor înregistra poziția exactă în fotografia MNL și eroarea punctului. Doar când există minimum patru perechi punct–obiect necoliniare și repere holdout separate se calculează ajustarea. Certificarea hotarului juridic rămâne o etapă probatorie distinctă. Pentru lege, rămâne permisă numai căutarea în exemplare scanate public, fără solicitări prin email sau alte instituții.
