# HIST-MODULE.3b — originalele cartografice, hotarele și părinții administrativi direcți

**Data auditului:** 22 noiembrie 2026.  
**Metodă:** evidență independentă pentru **structura juridică prevăzută de o normă**, controale geometrice reproducibile separat de **verificarea independentă a liniei de hotar** și de funcționarea efectivă a unei administrații.  
**Stadiu probatoriu:** *calificare documentară punctuală 1851*, cu hotare HistoGIS **necertificate**; zero corecții de geometrie sau părinte pentru 1815–1849.

## 1. Actul normativ original din 1851 și ce dovedește

Am identificat și recuperat numărul original al **Reichs-Gesetz- und Regierungsblatt**, XXXV. Stück, cu **Verordnung des Ministeriums des Innern vom 12. Mai 1851**, nr. **117/1851**, ediția germană publicată **16 mai 1851**; ediția bilingvă a avut apariția indicată pentru **4 iunie 1851**. Sursa digitală verificabilă: [Biblioteka Jagiellońska, PDF original](https://jbc.bj.uj.edu.pl/Content/203610/PDF/NDIGCZAS002330_1851_1_035.pdf), **800.587 octeți**, SHA-256 \`4229fe5a0c5515c3cc0b8cea8be0a7546e50415cd4a07a2a30cf582014e986e7\`.

Din § 1: șeful administrației politice a țării este guvernatorul din Hermannstadt; § 2 împarte Transilvania, cu Sachsenland, în **cinci Kreise**; § 3 le subordonează guvernatorului; § 4 împarte cercurile în **politische Bezirke / Bezirkshauptmannschaften** și afirmă subordonarea directă a șefului districtului față de președintele cercului; § 5 trimite la anexele A și B.

- **Cercurile în anexa B:** Hermannstadt, Karlsburg, Klausenburg, Dées, Maros-Vásárhely.
- **Căpităniile districtuale:** 6 + 10 + 6 + 7 + 7 = **36**. Toate cele 36 sunt inventariate individual în \`boundary-parentage-review.json\`, cu \`parentId\` și \`lawOfficeType\`.
- **Structură directă:** 5 relații *crownland → Kreis* și 36 relații *Kreis → politische Bezirkshauptmannschaft*, **41 legături documentate în schema juridică publicată**.
- **Timp:** atestare a structurii prescrise în act la **16.05.1851**, nu demonstrație a activării administrației efective în aceeași zi, a continuității până în 1854 sau a liniei exacte de hotar. \`effectiveOperationConfirmed=false\`, \`completeDurationConfirmed=false\`. Nu există un interval fictiv început/sfârșit.

### Reconcilierea cu pilotul HistoGIS

| Kreis 1851 din act | Versiune HistoGIS | Decizie |
|---|---|---|
| Hermannstadt | 12660 (1851–1854) | Corespondență nominală datată, **tip juridic Kreis**, tipul HistoGIS original „County” păstrat |
| Karlsburg | — | Entitate documentară reală în act, **fără geometrie HistoGIS individuală**; nu inventăm poligon |
| Klausenburg | 12657 (1851–1854) | Corespondență nominală datată; geometrie necertificată |
| Dées | 12659 (1851–1854) | Corespondență nominală datată; geometrie necertificată |
| Maros-Vásárhely | 12658 (1851–1854) | Corespondență nominală datată; geometrie necertificată |

Cei 36 de Bezirke sunt **noduri documentare fără geometrii**, nu reutilizări nejustificate ale unor scaune/comitate anterioare doar fiindcă numele coincid. Judecătoriile \`Gerichtsbezirke\` din ultima coloană a anexei B nu sunt echivalate cu aceste unități politice. Legea din **1854** de organizare politică și judiciară, RGBl **141/1854**, reprezintă un control cronologic pentru întreruperea/examinarea ulterioară: [repertoriu oficial RIS, RGBl 141/1854](https://www.ris.bka.gv.at/Ergebnis.wxe?Abfrage=BgblAlt&Jahrgang=1854&Bgblnummer=141). Nu presupunem o continuitate administrativă neîntreruptă doar din perioada HistoGIS.

**Verdict:** da, se poate califica **directitatea administrativă din schema legală a actului la data publicării**. Nu se poate promova automat pe întregul \`1851–1854\` statutul de părinte administrativ efectiv sau vreun hotar exact.

## 2. Cele două relații incompatibile din HistoGIS 1815–1849

Actul 1851, **anexa A**, identifică explicit fostele comitate **Doboká** și **Inner-Szolnok** în enumerări separate, în contextul redistribuirii teritoriilor pentru noile Kreise. În aceeași anexă, **Mühlenbach** este enumerat printre *fostele scaune săsești*, separat de *fostul Unter-Albener Comitat*.

Acest document nu reprezintă în sine o cartă jurisdicțională pentru întregul interval **1815–1849**, dar **nu oferă nicio confirmare** pentru relațiile HistoGIS:

| Copil | „Părinte” HistoGIS | Procent copil în afara părintelui în EPSG:3035 | Verdict |
|---|---|---:|---|
| Doboka (12324) | Innere Szolnok (12328) | **100,000%** | **Blocat**, fără substituirea părintelui |
| Mühlbach (12383) | Unterweißenburg (12406) | **100,000%** | **Blocat**, fără substituirea părintelui |

Recalcularea tuturor contururilor-sursă din 1835 a confirmat pentru ambele unități suprapunerea de **100%** cu **Marele Principat al Transilvaniei (9915)**, în cadrul formei generale HistoGIS. Aceasta este **numai o cuprindere spațială**: nu demonstrează că Marele Principat era părintele administrativ direct în schema instituțională relevantă și nici că conturul fiecărui copil este exact. Cele două muchii istorice inițiale rămân excluse din arborele exploratoriu.

## 3. Cele șase abateri parțiale

Toate cele șase dosare rămân **HOLD** față de promovarea unei geometrii istorice sau a relației directe pe 1815–1849. Procentele sunt reexecutabile din originalele HistoGIS, **nu rezultate ale unei georeferențieri independente**:

| Copil | Părinte-sursă | Copil în afara părintelui |
|---|---|---:|
| Bistritz (12330) | Großfürstentum Siebenbürgen (9915) | 0,228619% |
| Kövár (12391) | Großfürstentum Siebenbürgen (9915) | 3,004871% |
| Zărand (12392) | Großfürstentum Siebenbürgen (9915) | 0,401048% |
| Hunyad (12401) | Großfürstentum Siebenbürgen (9915) | 0,771978% |
| Kraszna (12404) | Großfürstentum Siebenbürgen (9915) | 2,029978% |
| Mittlere Szolnok (12405) | Großfürstentum Siebenbürgen (9915) | 5,892093% |

**Interdicție:** nu tăiem prin \`intersection\`, nu cosmetizăm prin \`buffer\`, nu transferăm retroactiv hotarele din 1851 în 1835 și nu deducem granițele juridice doar pentru că un poligon este mai mare.

## 4. Hărțile originale și controlul independenței

**A. Franz Raffelsperger, 1841 — recuperat**  
[Karte des Grossfürstenthumes Siebenbürgen](https://www.davidrumsey.com/luna/servlet/detail/RUMSEY~8~1~297853~90069447), David Rumsey collection, list no. **11381.017**, \`11381017.jp2\`, scară menționată **1:890.000**. Original JP2 [sursă directă](https://www.davidrumsey.com/static/jp2k/171/11381017.jp2). Fișierul a fost descărcat, măsurat și verificat: **15.084.248 octeți**, SHA-256 \`c3b0f75ba204744405cb20e5f2af004d4514a108d131540c3a608cbb53dc7d87\`. Harta a fost editată independent de proiectul de digitizare HistoGIS; o reproducere a imaginii nu este totuși o certificare a fiecărei linii.

**B. Friedrich Wilhelm Streit, 1835 — identificat în repertoriu**  
[Grossfürstenthum Siebenbürgen](https://wbc.poznan.pl/dlibra/publication/17090/edition/27667), Wielkopolska Biblioteka Cyfrowa, ediția identificată **27667**. Este o a doua sursă contemporană utilă; originalul cartografic nu a fost încă recuperat și inspectat în rezoluție integrală în această etapă. Rămâne **în așteptare**.

**C. Floder 1835 / Meyer 1843 — nu sunt probe independente de HistoGIS**  
[HistoGIS, descrierea datasetului 1835](https://histogis.acdh.oeaw.ac.at/shapes/source/detail/224) confirmă utilizarea acestor hărți ca surse de digitizare, cu adaptări din OpenStreetMap. Refolosirea lor drept „confirmare independentă” a rezultatului HistoGIS ar crea **circularitate probatorie**. Sunt menționate doar ca proveniență, nu ca FIT/HOLDOUT independent.

### GCP și FIT/HOLDOUT

Registrul păstrează obligatoriu:

- \`independentGeoreferencing.fit=[]\` și \`holdout=[]\`;
- prag operațional preliminar: minimum **6 FIT** și **3 HOLDOUT**, pe obiecte fizice distincte, selectate independent;
- **zero** transformări georeferențiate admise, **zero** poligoane originale redigitizate;
- **zero** erori de control raportate fictiv: un RMS/holdout nu poate fi estimat fără GCP reale;
- precizia finală trebuie evaluată ținând cont de scara și deformările foii originale, nu pe baza unei distanțe arbitrare impuse fără măsurători.

Fără această confruntare, **nu putem decide** dintre doi poligoane concurente pentru aceeași identitate/perioadă care corespunde mai bine hotarului real. Nici Raffelsperger (1841) și nici Streit (1835) nu sunt folosite pentru a inventa o „corecție” automată.

## 5. Fișiere și reproducibilitate

- \`public/data/historical/v1/boundary-parentage-review.json\` — 5 Kreise + 36 Bezirke, corespondențele nominale cu patru versiuni HistoGIS, excepțiile cartografice, stadiul surselor și prohibițiile.
- \`src/data/historicalBoundaryReview.mjs\` + \`.d.mts\` — validare **fail-closed** a inventarului 5/36, a celor 8 excepții, a necertificării și a separării actului normativ de intervale administrative reale.
- \`scripts/historical/audit_disputed_source_parents.py\` — verifică toate cele 8 relații în EPSG:3035 și măsoară *numai* posibile cuprinderi spațiale, fără afirmarea unor părinți direcți. Generează:
- \`docs/historical/qa/HIST-MODULE.3b-spatial-candidates.json\` — 8 rezultate, fiecare cu \`inferredAdministrativeParent=null\`, \`boundaryCertified=false\`, zero GCP și zero HOLDOUT.
- \`tests/hist-module-3b-original-boundary-parentage.test.mjs\` — verifică statutul și fiecare regulă, inclusiv blocarea oricărei certificări inventate.

Comandă de reproducere QA spațială, într-un mediu Python cu Shapely 2+ și pyproj:

\`python scripts/historical/audit_disputed_source_parents.py --catalog public/data/historical/v1/catalog.json --geometry public/data/historical/v1/geometry.geojson --qualification public/data/historical/v1/qualification.json --out docs/historical/qa/HIST-MODULE.3b-spatial-candidates.json\`

Rezultatul nu are semnificație juridică fără verificări externe.

## 6. Ce se vede în website

În modulul Istoric, când anul selectat este **1851**, se poate deschide o **secțiune separată** pentru ierarhia legală documentată în 1851 (5/36), cu avertisment că reprezintă structura prescrisă de lege, nu un arbore istoric de poligoane certificate. Patru noduri de tip Kreis permit navigarea către versiunea-sursă HistoGIS corespunzătoare; Karlsburg și cele 36 de căpitănii rămân explicit **fără poligon confirmat**.

Fișa unei versiuni istorice afectate arată verdictul original al hotarului și trimiteri către actul din 1851 și sursa cartografică din 1841. Fișa celor patru Kreise califică paternitatea prevăzută la 16 mai 1851 **separat** de părinții încă necertați din sursa HistoGIS.

**Nu** este modificat niciun fișier \`public/data/phase4\` (ACTUAL), nicio geometrie HistoGIS existentă, nici registrul istorico-administrativ al legăturilor ACTUAL ↔ Istoric.

## Verdict și următoarea operațiune admisibilă

**41 de relații de paternitate directă în organigrama legală din 1851**, atestate de un act normativ primar, cu corespondențe nominale controlate pentru 4 dintre 5 cercuri. **0 părinți direcți calificați pentru întreaga durată 1815–1849 sau 1851–1854 fără dovezi suplimentare; 0 hotare istorice certificate; 0 geometrii noi admise.**

Următoarea operațiune de hotar este recuperarea și examinarea integrală a foii Streit 1835, apoi alegerea unor puncte fizice independente comune pe hărțile 1835 și Raffelsperger 1841; georeferențiere FIT/HOLDOUT, confruntarea celor 8 cazuri și admiterea individuală numai a geometriilor care trec verificarea probatorie. Activarea efectivă a structurilor din 1851 și reorganizarea din 1854 trebuie verificate cronologic separat înainte de a utiliza relații juridice permanente în arbore.
