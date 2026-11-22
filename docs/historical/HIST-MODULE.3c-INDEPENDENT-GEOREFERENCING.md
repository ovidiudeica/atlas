# HIST-MODULE.3c — hărțile originale Streit 1835 / Raffelsperger 1841: FIT/HOLDOUT independent și opt dosare de hotar

**Data:** 22 noiembrie 2026. **Verdict:** **HOLD** pentru ambele georeferențieri exploratorii și pentru toate cele opt dosare de hotar; fără promovarea unui poligon, fără substituirea părintelui administrativ și fără modificarea ACTUAL.

## 1. Recuperarea și examinarea originalelor

### Streit 1835 — recuperat integral

- F. W. Streit, *Das Grossfürstenthum Siebenbürgen* (1835), Natorff & Comp., Berlin, exemplar **PAN Biblioteka Kórnicka**, indexat de Wielkopolska Biblioteka Cyfrowa la ediția 27667.
- Catalog: https://www.wbc.poznan.pl/dlibra/doccontent?id=27667
- **PDF original recuperat:** https://www.wbc.poznan.pl/Content/27667/PDF/17090.pdf
- **SHA-256:** \`02e55f68e870aa6e8c65ff12a71e2a080a2787443eaa0e8a58e7c3fe83d1408a\`. **9.190.975 octeți.**
- PDF cu **2 pagini**. Prima este fața cartografică; a doua este reversul cu ștampila bibliotecii. Dimensiune GDAL a paginii cartografice PDF: **2039 × 1613 px** la 150 DPI.
- Rasterul primei pagini și decupaje ale originalului au fost inspectate manual. Harta prezintă împărțiri istorice în **Land der Ungarn**, **Land der Székler** și **Land der Sachsen**, alături de rețele hidrografice și toponime. Legenda tratează comitatele și scaunele săsești drept unități distincte.
- **Atenție:** metadatele bibliotecii indică 1:200.000, însă acest numitor nu a fost validat prin scara marginală și întinderea pe teren. **Nu este introdus în calculul preciziei fără reconciliere**. Fișierul PDF este o reproducere digitală; scanarea are rezoluție și potențiale deformări proprii.

### Raffelsperger 1841 — original recuperat în HIST-MODULE.3b, reanalizat

- Franz Raffelsperger, *Karte des Grossfürstenthumes Siebenbürgen* (1841), David Rumsey, image 11381017, list 11381.017; scară catalogată **1:890.000**.
- Catalog: https://www.davidrumsey.com/luna/servlet/detail/RUMSEY~8~1~297853~90069447
- Original JP2: https://www.davidrumsey.com/static/jp2k/171/11381017.jp2
- **SHA-256:** \`c3b0f75ba204744405cb20e5f2af004d4514a108d131540c3a608cbb53dc7d87\`. **15.084.248 octeți**.
- Rezoluție sursă **11.426 × 8.661 px**, cu overviews; decupajele la rezoluție nativă au fost inspectate în zona Cluj–Dej–Bistrița, Deva, Sibiu–Brașov și a regiunii sudice.
- Harta delimitează unități prin borduri colorate, dar precizia poziției unei linii istorice nu rezultă doar din pixeli sau dintr-un numitor de scară.

Originalele **nu sunt copiate în repository**: rămân la instituțiile și URL-urile furnizoare și în spațiul local de lucru autorizat, nu în distribuția web.

## 2. Selecția GCP și independența reală

Controlul nu folosește coordonatele geometriilor HistoGIS ca GCP. Punctele au fost alese din **toponime / simboluri de localități** identificate vizual în rasterele istorice și au fost confruntate cu coordonate geografice aproximative ale localităților actuale, inclusiv repertoare publice:
- https://openadmindata.org/ro/cities/
- https://www.geodatos.net/en/coordinates/romania
- https://en.wikipedia.org/wiki/Dej
- https://www.geodatos.net/en/coordinates/romania/medias

**Limite esențiale:** punctele NU sunt borne geodezice, confluențe fizice independente certificate sau amplasamente verificate ale centrului localității din 1835/1841. Poziția tipografică poate diferi de amplasamentul istoric. Estimarea incertitudinii de ordinul kilometrilor este doar operațională, nu dedusă dintr-un survey. Selecția HOLDOUT este distinctă de FIT, dar **nu orb**: interpretarea rasterului s-a făcut în aceeași etapă exploratorie. Un control independent de HistoGIS **nu este automat un holdout de certificare**.

| Hartă | FIT | HOLDOUT | Comentariu |
|---|---:|---:|---|
| Streit 1835 | 7 | 4 | Puncte urbane vizuale, raster PDF de 2039×1613 px |
| Raffelsperger 1841 | 7 | 3 | Puncte urbane vizuale, JP2 11426×8661 px |

Fiecare GCP are în \`georeferencing-3c.json\` ID, toponim, coordonate de pixel pe preview, mărimi raster/preview, \`WGS84\` țintă, referință, rol FIT/HOLDOUT și statutul \`provisional_visual_only_not_ground_survey\`. Pentru calcul, coordonatele preview au fost convertite în **pixeli nativi**. Erorile sunt calculate în **ETRS89 LAEA Europe, EPSG:3035**.

## 3. Reproducerea efectivă a transformării și respingerea FIT/HOLDOUT

Metoda exploratorie: **transformare afină 2D prin least squares**, cu 7 GCP FIT, urmată de predicția independentă pe setul HOLDOUT al fiecărei foi. Nu pretindem că proiecțiile originale ar fi afine, că au același datum sau că distorsiunile hârtiei sunt uniforme.

| Hartă | RMSE FIT | RMSE HOLDOUT | HOLDOUT maxim | Prag exploratoriu | Verdict |
|---|---:|---:|---:|---|---|
| Streit 1835 | 5.521,21 m | **9.594,17 m** | **15.864,79 m** | RMSE ≤5.000 m și max ≤10.000 m | **HOLD — FAIL** |
| Raffelsperger 1841 | 5.368,03 m | **7.681,60 m** | **10.499,21 m** | RMSE ≤5.000 m și max ≤10.000 m | **HOLD — FAIL** |

Aceste praguri sunt *filtre tehnice preliminare* și nu reprezintă o toleranță legală sau un criteriu validat de precizie pentru cele două hărți. Chiar trecerea numerică a lor **nu ar fi suficientă** pentru certificare, deoarece lipsesc GCP fizice confirmate, un HOLDOUT orb și vectorizarea independentă a hotarului.

**Fișiere reproductibile:**
- \`public/data/historical/v1/georeferencing-3c.json\`: originalele fixate prin SHA-256, 21 GCP exploratorii, referințe și opt dosare.
- \`public/data/historical/v1/georeferencing-3c-results.json\`: toate reziduurile individuale și agregate, matricele \`geotransformNative\`, verdictul celor 8 dosare, \`acceptedOriginalMapGeoreferencing=0\`.
- \`scripts/historical/replay_original_map_fit_holdout.py\`: reproduce matricea afină, erorile și hashurile din octeții originali; opțional creează VRT-uri **strict locale, doar de probă**.
- \`src/data/historicalGeorefFitHoldout.mjs\`, \`.d.mts\`: validator fail-closed pentru surse, 7+ FIT/HOLDOUT, coincidența reziduurilor, cele opt dosare, integritatea registrului HistoGIS și interdicția promovării unei geometrii.
- \`tests/hist-module-3c-fit-holdout.test.mjs\`: teste de integritate și mutații adversariale (inclusiv falsificarea etichetei „blind” ori promovarea unui părinte). Testele locale au trecut **6/6**.

Comandă de reproducere într-un mediu Python cu NumPy, pyproj și GDAL:

\`\`\`bash
python scripts/historical/replay_original_map_fit_holdout.py \
  --register public/data/historical/v1/georeferencing-3c.json \
  --streit "/cale/catre/Streit_1835_17090_original.pdf" \
  --raffelsperger "/cale/catre/Raffelsperger_Siebenburgen_1841_11381017.jp2" \
  --output /cale/locala/HIST-MODULE.3c-FIT-HOLDOUT.json \
  --trial-vrt-dir /cale/locala/trials
\`\`\`

Pe calculatorul autorizat au fost construite efectiv numai aceste VRT-uri **nereutilizabile canonic**:
- \`C:\Users\Public\Documents\hist3c_sources\trials\Streit_1835_EXPLORATORY_NOT_FOR_USE.vrt\`
- \`C:\Users\Public\Documents\hist3c_sources\trials\Raffelsperger_1841_EXPLORATORY_NOT_FOR_USE.vrt\`

Nu există un raster nou certificat în \`public/data\`. În GitHub se păstrează măsurătorile și metadatele, nu un VRT ce ar putea fi confundat cu o geometrie admisă.

## 4. Reevaluarea individuală a celor opt hotare

Pentru fiecare dosar, \`georeferencing-3c.json\` conține \`sourceRelationId\`, ID-ul exact al copilului/părintelui, procentele din QA în EPSG:3035, tipul de informație din harta 1835, rezultatul FIT/HOLDOUT (neadmis) și verdictul juridic/geometric individual.

| Copil / părinte-sursă | În afara părintelui HistoGIS | Confruntare originală și verdict |
|---|---:|---|
| **Doboka → Innere Szolnok** | 100,000% | **BLOCKED_SOURCE_PARENT**; unități distincte în repertoriile și legenda 1835, fără linie redigitizată și fără alt părinte direct admis |
| **Mühlbach → Unterweißenburg** | 100,000% | **BLOCKED_SOURCE_PARENT**; „Mühlbacher Stuhl” apare în gruparea scaunelor săsești, nu ca parte a comitatului respectiv; fără alt părinte admis |
| **Bistritz → Transilvania** | 0,228619% | **HOLD_ORIGINAL_BOUNDARY_RECONCILIATION**; foaia oferă toponime și limite administrative, dar nu există transformare acceptată |
| **Kövár → Transilvania** | 3,004871% | **HOLD**; necesită stabilirea statutului teritorial la 1835 versus reorganizările ulterioare |
| **Zărand → Transilvania** | 0,401048% | **HOLD**; verificare de linie și document administrativ contemporan, fără extrapolare 1849/1851 |
| **Hunyad → Transilvania** | 0,771978% | **HOLD**; nume/toponime vizibile, hotarul independent nevectorizat |
| **Kraszna → Transilvania** | 2,029978% | **HOLD**; identificarea corectă a unității în vechile grupări teritoriale trebuie reconciliată cu actele |
| **Mittlere Szolnok → Transilvania** | 5,892093% | **HOLD**; abatere deosebit de mare, nu se repară cu simplă intersectare geometrică |

**Separare importantă:** harta din 1835, harta din 1841 și actele din 1849/1851 pot descrie **organizații administrative diferite**. Nu substituim automat granițe sau părinți dintr-o perioadă în alta, chiar dacă numele entităților coincid. Copiii orfani rămân în arborele de candidat până la identificarea documentară a părintelui; un \`dissolve\` nu este folosit înainte de certificarea componenței și cronologiei.

Rezultatul este **un verdict de admisibilitate pentru fiecare dosar**, nu o nouă trasare cartografică a liniei pe ambele foi: linia originală **nu** a fost vectorizată și controlată punct cu punct.

## 5. Condițiile pentru o etapă de certificare efectivă

O nouă georeferențiere care să poată fundamenta o decizie de hotar necesită:
1. Repere **fizice și stabile**, confirmate independent pe originalele la rezoluție nativă (confluențe hidrografice și alte intersecții topografice persistente), nu doar simboluri urbane.
2. Un plan de eșantionare **înaintea ajustării**, cu FIT și HOLDOUT orb, spațial distribuite și tratament separat pentru deformarea foii, datum și proiecția cartografică.
3. Estimarea incertitudinii în raport cu scara **verificată** a fiecărei foi; aplicarea unei transformări numai dacă residualele și holdout-ul sunt reproductibile și suficiente.
4. Trasarea independentă a liniei din original la rezoluția completă și comparație cu fiecare contur HistoGIS, inclusiv în punctele de limită unde apar cele opt anomalii.
5. Coroborarea cu acte și repertorii **contemporane fiecărui interval** pentru paternitate juridică; geometria singură nu poate demonstra părinte administrativ direct.

**Finalizare tehnică a HIST-MODULE.3c:** originale recuperate; probe FIT/HOLDOUT efective, măsurate și reproductibile; toate cele opt dosare reevaluate cu verdict onest de neadmitere. **Nu este finalizată certificarea de hotar** — două mapări au eșuat, iar probele fizice independente lipsesc.

**Integritatea seturilor:** 0 modificări în \`public/data/phase4\` (ACTUAL), 0 reparentări în \`catalog.json\`, 0 geometrii sursă șterse sau înlocuite, 0 hotare istorice noi admise.
