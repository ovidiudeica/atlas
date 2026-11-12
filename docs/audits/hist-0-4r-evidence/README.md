# HIST-0.4r — foaia originală Șomcuta Mare 2977 (1924) și martorul cartografic din 1862

**Data:** 12 noiembrie 2026. **Repository:** `ovidiudeica/atlas`. **Bază:** `main@322bcb9a2d68fc29d8b55a48f54bc47b076e46c9` (HIST-0.4q). **Mod:** cercetare publică, gratuită, fără emailuri, contacte instituționale, plăți ori modificarea geometriei istorice.

## 1. Verificarea post-merge pentru HIST-0.4q

[GitHub Actions run 43238854754](https://github.com/ovidiudeica/atlas/actions/runs/43238854754) are **Build and verify website: success** și **Deploy GitHub Pages: success**. Aceasta închide tehnic faza precedentă, fără a certifica hotare.

## 2. Identificarea exactă a foii eHarta care conține Cetatea Chioarului

Am recuperat efectiv baza de metadate de la [catalogul public de Planuri Directoare de Tragere](https://www.geo-spatial.org/vechi/maps/download-planuri-tragere.php). Interfața folosește [`pt-grid.php`](https://www.geo-spatial.org/vechi/maps/js/pt-grid.php?lang=ro) și endpointul public [`pt-grid-json.php`](https://www.geo-spatial.org/vechi/maps/pt-grid-json.php?start=0&limit=5000); s-au recitit **1.883 înregistrări**. Răspunsul începe cu literalele JavaScript `{success:true,results:...` și nu este JSON strict; pentru citire automată s-au normalizat doar aceste nume de câmpuri, fără `eval`.

În paralel am interogat direct stratul `geospatial:index_pt_20k` prin [WFS GetFeature cu bbox în EPSG:4326](https://services.geo-spatial.org/geoserver/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=geospatial%3Aindex_pt_20k&bbox=23.57%2C47.47%2C23.59%2C47.49%2CEPSG%3A4326&outputFormat=application%2Fjson&maxFeatures=20), în jurul cetății: **1 singură foaie indexată**. Registrul `sheet-2977-exact-wfs-catalog-geotiff-provenance.json` conține corespondența între geometria indexului și catalog:

| Câmp | Valoare recuperată |
|---|---|
| Indicativ | **2977** |
| Titlu | **Șomcuta Mare** |
| An tipărire *în catalog* | **1924** |
| Ediție | **1** |
| `idPlansa` | **260** |
| `id`/WFS feature | **499 / index_pt_20k.499** |
| `fid` | **1225** |
| `dowId` | **25790** |

Acesta este un **identificator individual verificat spațial**; nu mai depindem numai de forma mozaicată WMS și de un text cu nume apropiat.

## 3. Originalul digital georeferențiat al foii 2977 a fost descărcat

Am descărcat, numai pe calculatorul conectat, [`2977.tif`](https://www.geo-spatial.org/vechi/file_download/25790). Serviciul a returnat `HTTP 200` și `Content-Disposition: attachment; filename="2977.tif"`. Verificările locale:

- **21.353.131 octeți**, **8.883 × 5.966 pixeli**, TIFF RGB 24-bit, cu compresie JPEG internă și 300 DPI;
- SHA-256: `c97eea5662827f5d36dbaf1bd26c6fb6a1814c992ee783d1c7b441c153718ff2`;
- GeoKey **EPSG:3844 / Pulkovo 1942(58) – Stereo70**; `ModelTiepoint` origine `(383122.18,669558.14)` m; `ModelPixelScale` aproximativ **1,699752 × 1,699819 m/pixel**;
- TIFF-ul georeferențiat, decupat, **nu include marginalia tipărită integrală**. **Anul 1924 este certificat doar ca *anul tipăririi din catalog***, nu prin citirea directă a marginii planșei. *Anul ridicării, sursa topografică anterioară și eventualele actualizări sunt încă necunoscute*.

**Atenție:** **1,7 m/pixel nu înseamnă o eroare geodezică de 1,7 m**. Fără punctele folosite la georeferențiere, datumurile exacte ale surselor cartografice și reziduurile ajustării, exactitatea pozițională a foii rămâne necertificată.

Am inspectat întreaga imagine și trei decupaje locale la rezoluția originală, fără republicarea rasterelor. În dreptunghiul `x=4700..6500, y=2100..3450` se disting **„Ruine Chioarului (Kővár)”**, fragmentele vizuale ale ruinei, meandrul Lăpușului, drumuri/versanți și cota înscrisă **406**. Această identificare are acum suport pe o **foaie individuală**, nu pe o etichetă turistică suprapusă.

Din această observație **nu** derivăm automat un vârf de zid, un pilon geodezic sau un hotar. Cota 406 poate reprezenta o cotă topografică, dar semnul de referință și datumurile de altitudine nu au fost verificate individual.

## 4. Martor anterior anului 1877, recuperat efectiv

Am accesat [`Karte des Grossfürstentums Siebenbürgen` — ediția a IV-a (1862)](https://geo-spatial.org/vechi/download/karte-des-grossfuerstentums-siebenbuergen-harta-marelui-principat-al-transilvaniei), publicată la **Hermannstadt/Sibiu**, și am recuperat public gratuit [imaginea integrală de la Wikimedia Commons](https://upload.wikimedia.org/wikipedia/commons/a/ad/Gro%C3%9Ff%C3%BCrstentum_Siebenb%C3%BCrgen_1862.jpg). Fișierul verificat local are **5.500 × 4.347 px**, **10.448.861 octeți** și SHA-256 `d79ffb416106b99c5dfef81066f863aa92520eef0f0733917a764098e29389a9`. Originalul hărții afișează **1862** pe medalion; exemplarul este un martor cartografic autentic al epocii, distinct de foaia din 1924.

Sursa eHarta declară transparent că **georeferențierea modernă a hărții din 1862 s-a făcut cu sprijinul unor hărți austriece ulterioare 1:200.000**. Prin urmare, *originalitatea documentară din 1862* nu înseamnă *independență geodezică a coordonatelor rectificate*. În plus, scara regională nu a permis identificarea fără echivoc a **aceluiași colț de zid/bastion** de pe 2977 sau de pe fotografia MNL.

Martorii documentari 1852 Kővári și 1865 Pesty rămân coroborări ale ruinelor și relației generale cu Lăpușul, nu măsurători de GCP. Nu am recuperat o foaie **cadastrală sau militară locală la scară mare, datată înainte de 1877**, pentru același amplasament.

## 5. Calificarea individuală a punctelor și porțile probatorii

`physical-landmarks-cross-era-1924-1862-1859-gcp-gate.json` păstrează patru clase de candidați separați:

1. **Ruinele cetății**: localizate pe 2977, dar complexul e extins, iar un anumit colț nu este identificat unic pe harta din 1862 sau pe MNL 1859.
2. **Cota 406**: vizibilă pe 2977, dar fără identificarea unui reper altimetric independent și fără corespondență MNL.
3. **Meandrul Lăpușului**: coroborare descriptivă 1852/1865, dar este o formă curbilinie potențial variabilă, nu un punct geodezic verificat.
4. **Clădirile din Berchezoaia**: reprezentate în 1924, dar nu este dovedită continuitatea individuală din 1859 și până azi.

**Verdict:** **0 perechi admise** `pixel același obiect MNL / hartă contemporană ↔ coordonată independentă din teren`, **0 GCP-uri certificate**, **RMS nou și holdout nedefinite**, **0 geometrii ISTORIC sau OHM importate**, **0/15 segmente Chioar** și **0/82 segmente Transilvania** promovate. Numele `Szt.-Kápolnok` și orice hotar juridic rămân independente de această operațiune.

## 6. Continuitate — HIST-0.4s

Prioritatea următoare este **obținerea marginii/legendelor neatinse de decuparea TIFF pentru 2977**, cu data reală a ridicării și metoda sursei, plus un **punct de control geodezic independent și punctual** identificat vizual pe aceeași foaie; în lipsă, alegerea unui reper fizic cu identitate sigură dintr-o altă foaie contemporană pre-1877. Ajustarea raster și certificarea juridică a limitelor sunt operațiuni separate și nu trebuie confundate.

**Conformitate:** nicio corespondență electronică/instituțională; nicio comandă, plată, subscripție, autentificare sau publicare a fișierelor raster MNL, eHarta, Wikimedia, Arcanum ori a KMZ-urilor private. Repository-ul primește numai metadate, hashuri, linkuri publice și un validator reproductibil.
