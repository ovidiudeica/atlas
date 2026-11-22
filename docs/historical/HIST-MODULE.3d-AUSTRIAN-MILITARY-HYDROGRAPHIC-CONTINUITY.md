# HIST-MODULE.3d — confruntarea hidrografică cu ridicările militare austriece (1769–1918, ediții în curs de datare)

**Data:** 22 noiembrie 2026. **Verdict:** continuitate de **topologie hidrografică regională** documentată suplimentar; **zero puncte fizice istorice admise în FIT/HOLDOUT**. Continuare probatorie a [HIST-MODULE.3d](HIST-MODULE.3d-PHYSICAL-BLIND-HOLDOUT-NATIVE-TRACES.md), fără intervenții în ACTUAL sau geometriile istorice canonice.

## 1. Principiul de interpretare

O confluență vizibilă pe două sau trei hărți **nu garantează aceeași poziție**, nici identitatea fiecărui braț, nici stabilitatea albiei. Se disting explicit: (A) prezența generală a sistemului de râuri, (B) confluența identificată prin nume și topologie, (C) localizarea unei intersecții la pixel independent în rasterul original și (D) imobilitatea sau incertitudinea măsurată pe perioada dintre 1769, 1835/1841 și reprezentarea modernă EU-Hydro. Doar (A)/(B) au probe noi; (C)/(D) **nu**.

Nu preluăm poziția unui GCP dintr-o GeoTIFF deja georeferențiată în vederea validării independente a propriei transformări. Georeferențierea oferită de LOC este destinată **selectării/identificării foii și unei confruntări vizuale**, nu este un survey istoric cu eroare individuală cunoscută. Nu extragem pixeli pentru hărțile Streit și Raffelsperger prin inversarea transformării exploratorii respinse din 3c.

## 2. Surse și verificări efective

### Prima ridicare militară — *Josephinische Landesaufnahme*, Transilvania 1769–1773

- Facsimile din **Kriegsarchiv / B IX 715**, disponibile în Commons ca `Josephinische_Landaufnahme_pgNNN.jpg`; sursa este independentă de HistoGIS și de EU-Hydro.
- Au fost descărcate și inspectate **7 imagini publice de previzualizare la 1800 pixeli**: `052`, `053`, `172`, `200`, `215`, `253`, `254`; fișierele și SHA-256 se regăsesc în `georeferencing-3d-austrian-military-hydrography.json`.
- Exemplarele la rezoluția integrală de aproximativ 8.3–8.5 mii pixeli lățime **nu au fost recuperate local în această etapă**. De aceea nu sunt justificate citiri de coordonate la nivelul pixelilor nativi.
- Exemplu: [foaia 053 — zona Dés/Dej](https://commons.wikimedia.org/wiki/File:Josephinische_Landaufnahme_pg053.jpg), [172 — Balázsfalva](https://commons.wikimedia.org/wiki/File:Josephinische_Landaufnahme_pg172.jpg), [200 — Hunyad/Szászváros](https://commons.wikimedia.org/wiki/File:Josephinische_Landaufnahme_pg200.jpg), [253 — Tălmaciu](https://commons.wikimedia.org/wiki/File:Josephinische_Landaufnahme_pg253.jpg).

### A doua ridicare militară — *Franziszeische Landesaufnahme*, Transilvania 1853–1858 și 1869–1870

- Sursă bibliografică și domeniu: [Timár et al., parametri de datum și proiecție](https://technicalgeography.org/pdf/1_2007/gt_1_2007.pdf) și [Mapire, Second Survey Transylvania](https://maps.arcanum.com/en/map/secondsurvey-transylvania/).
- **Nu a fost recuperat un facsimil/cartogramă inspectabilă pentru niciuna dintre cele patru confluențe**. Accesul încercat la Mapire a returnat HTTP 202 cu corp gol sau interfață inaccesibilă. Un alt produs GeoSpatial numit „Hărțile austriece (1910)” este derivat din **a treia ridicare**, nu substituie hărțile franciscane.
- **Rezultat explicit: 0/4 comparații franciscane efectuate**. Nu presupunem că toate cele patru situri au fost măsurate în anul 1858 sau în 1869–1870; anii sunt specifici eventual foii.

### A treia ridicare — *Spezialkarte*, 1:75.000, ediții originale nesigilate cronologic

- Colecția publică [Library of Congress: Austro-Hungarian Maps](https://data.labs.loc.gov/austro-hungarian-maps/) conține 4.998 imagini ale foilor militare și GeoTIFF-uri derivate. Indexul geografic `index_shapefile.zip` a fost **descărcat, citit cu GDAL/OGR și intersectat** în WGS84 cu cele patru noduri EU-Hydro.
- Câte un GeoTIFF LOC `{sheet}_000_geo.tif` a fost deschis prin GDAL/vsicurl și **extras efectiv** prin `gdal_translate -projwin`: foile `5172_000`, `5670_000`, `5572_000`, `5772_000`. Decupajele au fost inspectate vizual și amprentate SHA-256; NU sunt poligoane sau GCP-uri noi.
- Pentru `5172_000` s-a citit și **originalul cu chenar**, `sheets_img/5172_000_img.tif`; marginea tipărită identifică **SZAMOSÚJVÁR**, număr **5172**, **Maßstab 1:75.000**, **k.u.k. Militärgeographisches Institut**. Ștampila **3 Oct. 1966** aparține bibliotecii destinatare — **nu este anul hărții**. Data exactă a ediției 000 nu este confirmată.
- Seria LOC cuprinde ediții de la cca 1875 până după 1918; **nu** atribuim tuturor foilor un an generic „1875”, iar convergența din această serie nu certifică aceeași poziție în 1835.

## 3. Rezultate individuale

| Reper și nod EU-Hydro | Prima ridicare (1769–1773) | LOC / Spezialkarte (ediție 000) | Verdict de continuitate |
|---|---|---|---|
| **Someșul Mare–Someșul Mic · NO35132805** | Foaia **053** reprezintă **Dés** și cursuri de apă meandrate care se întâlnesc în regiune; **052** este suplimentară | **5172** (Dés, Mica) are brațe fluviale sinuose distincte; nicio potrivire fizică pixel–pixel cuantificată | **HOLD:** identitatea celor două brațe și stabilitatea poziției nu sunt probate independent |
| **Strei–Mureș · NO35093042** | Foile **200/215** indică valea Streiului, însă gura sa la Mureș **nu este demonstrată direct** din previzualizările inspectate | **5670**: inscripțiile **STREU** și **MAROS** lângă **Piski/Ó-Piski** și confluența lor sunt vizibile | **HOLD:** topologie istorică târzie confirmată regional, fără intermediarul 1853–1870 și anul foii 5670 |
| **Târnava Mare–Târnava Mică · NO35095608** | Foaia **172**, regiunea Balázsfalva/Blaj, conține meandre; nu sunt delimitate fără echivoc brațele la intersecție | **5572** prezintă două cursuri **Küküllő** în vecinătatea Balázsfalva, cu confluență regională; nomenclatura exactă rămâne de reconciliat | **HOLD:** deplasarea meandrelor sau diferența de proiecție nu sunt estimate |
| **Cibin–Olt · NO35092876** | Foile **253/254** includ coridorul Tălmaciu–Olt, dar **gura Cibinului nu poate fi identificată univoc** | **5772** prezintă Nagy Talmács, Kis Talmács, Boița, Porcești și rețeaua hidrografică; punctul precis nu este identificat | **HOLD:** continuitate regională, fără punct temporal fix și fără eroare măsurată |

Acolo unde o foaie este vecină și nu include într-un singur raster punctul însuși, prezența cursului de apă **nu se transformă** în probă a confluenței.

## 4. Ce NU rezultă din confruntare

1. **Nu există un survey de stabilitate metrică** a gurilor din 1769–1773 până la EU-Hydro 2006–2012. Meandrele, deviațiile de albie și regulările hidrotehnice trebuie căutate separat.
2. **Nu există corespondență dublă certificată** a coordonatei moderne cu un `(x,y)` nativ pe Streit 1835 ori Raffelsperger 1841.
3. Nu au fost recuperate cele **patru foi originale franciscane**, nu a fost verificată data exactă a edițiilor 1:75.000, nu a existat al doilea cititor independent care să sigileze un HOLDOUT.
4. **Nu se rulează FIT/HOLDOUT**, nu se creează VRT nou, nu se digitizează canonic vreun hotar și nu se modifică **ACTUAL**.

**Condiții pentru admiterea viitoare a unui GCP:** (i) recuperarea și identificarea exactă a foii franciscane pentru fiecare sit și confirmarea anului său; (ii) localizarea cu marcaj la pixeli nativi a fiecărui braț fluvial și a gurii pe minimum două originale, cu doi operatori; (iii) verificarea albiei pe surse geodezice/cadastrale datate și a posibilelor intervenții; (iv) estimarea reproductibilă a incertitudinii pe hartă/teren, fără folosirea georeferențierii ce urmează să fie testată; (v) blocarea punctelor HOLDOUT și a modelului anterior calculului.

**Verdict final pentru controlul prezent:** **4 dosare documentate de continuitate topologică regională, 0/4 GCP-uri istorice calificate, 0/4 foi franciscane efectiv controlate și 0 puncte FIT/HOLDOUT admise**. Aceasta este o **închidere probatorie HOLD** a acestei încercări, nu o închidere a `HIST-MODULE.3d` sau o certificare a hotarelor.
