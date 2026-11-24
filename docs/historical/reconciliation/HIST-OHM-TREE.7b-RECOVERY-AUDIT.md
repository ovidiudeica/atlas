# HIST-OHM-TREE.7b — recuperarea actelor 1923/1929 și controlul cartografic 1928

Data: 2026-11-24. Statut: PARTIAL_DOCUMENTARY_ADVANCE; NO_CANONICAL_PROMOTION.

## 1. Actul 1923

Vasile Ciurea, „Fălticenii”, Natura, nr. 3–4, martie–aprilie 1944, p. 80, indică 31 mai 1923 pentru redenumirea Suceava moldovenească → Fălticeni: https://pdf.bjt.ro/data/Natura_1922-1948/Natura_1944_21.745.pdf . Textul indexat a fost examinat, captura facsimilului a eșuat (cache miss). Este o mărturie retrospectivă, nu actul original; relatarea amestecă cronologia schimbărilor teritoriale cu redenumirea. Nu se deduce că geometria se schimbă la 31 mai 1923. Data devine candidat pentru căutare, nu sourcePeriod.end.

Contra-control: M.O. din 6 aprilie 1923 utilizează denumirea Suceava pentru județul din jurul Fălticenilor, https://www.resurse.net/mo/1923/19230406.pdf ; M.O. din 7 septembrie 1923 încă folosește Suceava într-un context medical și menționează acte mai vechi, https://www.resurse.net/mo/1923/19230907.pdf . Aceste mențiuni nu infirmă automat o redenumire; pot reflecta inerție terminologică. M.O. 220/1925 p. 11003 enumeră județul Fălticeni. Numărul, data semnării, publicării și aplicării actului din 1923 rămân necunoscute.

## 2. Decretul 4036/7 decembrie 1929 și rectificările

M.O. nr. 7 din 10 ianuarie 1930, p. 282, confirmă explicit decretul 4036 și publicarea în M.O. 274/9 decembrie 1929; deciziunile pentru Suceava și Tecuci arată efectul asupra consiliilor județene, NU delimitarea: https://www.resurse.net/mo/1930/19300110.pdf . Text consultat, screenshot eșuat (cache miss).
Referința legislativă identifică șapte ediții cu rectificări 1929: https://www.monitoruljuridic.ro/acte/lege/an-1929/ .
Registru de recuperare: M.O. 274, 281, 283, 285, 286, 287, 290, 291/1929: ORIGINAL_NOT_OBTAINED, textul anexelor/rectificărilor nu este colationat. Adresa probabilă https://www.resurse.net/mo/1929/19291209.pdf nu a putut fi accesată; nici digibuc.ro și manifestul IIIF nu s-au deschis prin accesul web; containerul nu are DNS extern; dispozitivul Desktop Commander este offline. Nu s-au trimis solicitări instituționale.

**Nouă rectificare identificată:** M.O. nr. 52 din 5 martie 1930, p. 1756, corectează anexa nr. 2, județul Botoșani, p. 9165 din M.O. 274/1929: consilierii orașului Botoșani sunt 32, nu 36. https://www.resurse.net/mo/1930/19300305.pdf . Clasificare NON_TERRITORIAL_ELECTORAL; text OCR, screenshot cache miss. Căutarea rectificărilor trebuie extinsă în 1930; cele șapte numere din 1929 nu sunt exhaustive. M.O. 31/12 februarie 1930 citează decretul pentru alegeri, iar alte decizii privesc Orhei/Hunedoara; nu certifică modificări de hotar pentru aceste 13 județe: https://www.resurse.net/mo/1930/19300212.pdf .

Biblioteca Metropolitană București deține colecția digitală pentru 1908–1933 conform https://monitoruloficial.ro/produs/e-monitor-on-line-gratuit/ ; Biblioteca Națională conservă seria istorică https://bibnat.ro/periodice-romanesti-vechi-2/ . Localizarea colecției nu echivalează cu recuperarea numerelor.

## 3. Harta Teodorescu 1928

Catalog AGSL/UWM: https://collections.lib.uwm.edu/digital/collection/agdm/id/26708/ ; Constantin Teodorescu, Institutul Cartografic Unirea, 1928, 1:500.000, 115×168 cm, ID am003827, cota 666 B-1928. Manifest catalogat: https://collections.lib.uwm.edu/iiif/info/agdm/26709/manifest.json . Previzualizări indexate ale hărții: https://collections.lib.uwm.edu/digital/api/singleitem/image/agdm/26706/default.jpg și https://collections.lib.uwm.edu/digital/api/singleitem/image/agdm/26707/default.jpg . Sunt imagini de ansamblu cu caroiaj/îmbinări și rezoluție insuficientă pentru trasee individuale. Manifestul și rasterul la rezoluție nativă nu au fost recuperate; nu s-au măsurat GCP, RMSE sau suprapuneri. Identificate suplimentar fișe pentru hărțile județene Teodorescu Roman și Vaslui (1928), fără calificarea rasterelor: https://www.okazii.ro/general-c-teodorescu-harta-judetului-roman-brasov-1928-a190819639 ; https://www.okazii.ro/general-c-teodorescu-harta-judetului-vaslui-brasov-1928-a190819662 .

## 4. Registru individual de confruntare — ținte, NU observații măsurate

Date de bază: HIST-OHM-TREE.6 (IoU și suprafețe), HIST-OHM-TREE.7 (enumerări OCR 1925). Fiecare linie indică controlul precis necesar pe rasterul 1928, nu confirmarea lui. Toate cele 13 au mapComparison=BLOCKED_NATIVE_RASTER, legalBoundaryCertified=false, geometrySharingAdmitted=false, sourcePeriod.end neschimbat.

| Județ | Sector prioritar de confruntat | Rezultat nou / limită |
|---|---|---|
| Bacău | Neamț–Balcani/Frumoasa, Racova, Blăgești; Putna/Tecuci | 1925 OCR; 1929 hold |
| Botoșani | Iași, Dorohoi, Suceava; Burdujeni | Rectificarea 1930 este numai electorală |
| Covurlui | Tecuci, Tutova, Prut | Nicio explicație teritorială nouă |
| Dorohoi | Rădăuți, Botoșani, Hotin; Cândești | 1925 OCR; 1929 hold |
| Fălciu | Prut–Cahul, Tutova; Stoeșești/Șuletea | 1929 revenirea la hotarul istoric de pe Prut este documentată secundar, nu per comună |
| Iași | Botoșani, Vaslui, Bălți; Mironeasa/Schitu-Duca | Aceeași rezervă pentru Prut; 1929 hold |
| Neamț | Bistrița, Broșteni–Borca–Farcașa; Ciuc, Roman, Bacău | Schimbări raportate anterior; nicio validare de contur |
| Putna | Râmnicu-Sărat, Tecuci; Nănești/Nămoloasa | 1925 OCR; 1929 hold |
| Roman | Neamț–Bârgăoani/Talpa; Vaslui–Ezeru | Hartă județeană 1928 identificată bibliografic, raster necalificat |
| Suceava (Moldova) | Fălticeni separat de Suceava bucovineană; Neamț/Câmpulung | 31.05.1923 candidat din Ciurea 1944, nu act |
| Tecuci | Putna, Covurlui, Tutova | M.O. 7/1930 confirmă reorganizarea consiliului, nu hotarul |
| Tutova | Fălciu, Covurlui, Tecuci | 1925 OCR; 1929 hold |
| Vaslui | Iași, Roman, Tutova | Hartă județeană 1928 identificată bibliografic, raster necalificat |

Pentru schimburile de pe Prut, sursa secundară RoHGIS: https://geo-spatial.org/vechi/download/romania-limitele-administrative-ale-jude-elor-interbelice-1930 . Nu se atribuie niciun segment prin analogie.

## 5. Verdict

Original 1923: 0/1; original 1929 și șapte ediții de rectificare: 0/8; o rectificare suplimentară 1930 identificată textual, ne-teritorială; 13/13 ținte individuale de confruntare înregistrate, 0/13 confruntări GIS finalizate. Nicio promovare canonică; nu s-au modificat fișierele aplicației sau geometriile. Următorul pas: recuperarea facsimilelor din colecția BMB/BNR sau altă copie digitală, căutare concentrată pe 31 mai–iunie 1923, descărcarea foii/foilor Teodorescu la rezoluție nativă și FIT/HOLDOUT independent. Fără a echivala schimbarea numelui cu schimbarea conturului.
