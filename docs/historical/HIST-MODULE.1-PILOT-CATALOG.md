# HIST-MODULE.1 — catalog istoric-pilot și geometrie unică

**Stadiu:** implementat într-un PR draft. Date sursă atribuite, dar hotare și relații istorice încă NECERTIFICATE. Nicio modificare ACTUAL sau activare a modulului Istoric în interfața publică.

## Dependențe și reconcilierea arhitecturii

HIST-MODULE.1 se bazează pe HIST-MODULE.0 (PR #136): tipul comun HistoricalPeriod, registrul de legături Administrativ–Istoric și relațiile părinte–copil datate. Funcția cronologică pregătită anterior în PR #135 este unificată aici: nu mai există modelul concurent reference/from/to, ci numai snapshot/at și interval/start/end. Componenta Entity GeometryUsesSection este generică și primește limba și etichetele din același selector global EN/RO folosit de toate modulele.

## Originea datelor și drepturile

**Sursă:** Austrian Academy of Sciences / ACDH-CH, HistoGIS Data v9.0, 2021. DOI: https://doi.org/10.5281/zenodo.4432081 . Licența originală CC BY 4.0: https://github.com/acdh-oeaw/histogis-data/blob/v9.0/LICENSE . Publicăm o extragere modificată din date, cu atribuirea sursei și marcarea modificărilor: deduplicare exactă a geometriei, reidentificarea versiunilor, candidate de ierarhii și diagnostice topologice. Nu am modificat coordonatele originale și nu am generat poligoane sintetice.

Arhiva originală din Geodata GIS: HistoGIS/01_Versiune_oficiala/histogis-data-v9.0.zip . SHA-256: 1e108156d8d21f5e47dc91849050f1e12e5d642f13095407f70270883004a5cd .

Generatorul reproductibil: scripts/historical/build_pilot_catalog.py . Nu acceptă automat alte versiuni ale arhivei, pentru a preveni actualizările silențioase ale sursei.

## Inventar efectiv

| Indicator | Rezultat |
| --- | ---: |
| Înregistrări GeoJSON din sursa HistoGIS incluse | 54 |
| Entități/identități istorice în pilot | 53 |
| Versiuni administrative istorice | 54 |
| Geometrii distincte, complete, stocate | 53 |
| Utilizări cronologice ale geometriilor | 54 |
| Relații temporale părinte–copil candidate | 52 |
| Poligoane-sursă valide topologic | 54 din 54 |
| Relații cu abatere spațială peste 0,1% în afara părintelui | 8 |
| Hotare certificate juridic de acest audit | 0 |
| Corespondențe confirmate cu catalogul ACTUAL | 0 |

**Transilvania:** versiunea HistoGIS nr. 9915 (1815-06-09–1867-12-21), plus 33 de înregistrări de comitate, districte și scaune din sursa HistoGIS, în ferestre distincte (29 pentru 1815-09-06–1849-12-31 și patru pentru 1851-05-16–1854-10-30). Nu completăm automat intervalele lipsă. Două subunități au proprii părinți intermediari (Doboka → Innere Szolnok și Mühlbach → Unterweißenburg), astfel încât contractul demonstrează trei niveluri în modul de revizuire.

**Bucovina:** versiunile HistoGIS 9936 (1849-03-05–1867-12-21) și 9970 (1867-12-22–1918-10-31) au coordonate identice și sunt asociate cu exact un asset geometric. Le-am grupat într-o identitate candidată pe baza numelui și a identificatorului extern comun, nu ca dovadă juridică a continuității. Tipul administrativ original al fiecărei versiuni este păstrat fără corectare tacită, chiar dacă sursa are clasificări discutabile. Copiii și schimbările de părinte sunt reprezentate ca relații candidate.

**Probleme deschise:** opt relații copil–părinte depășesc pragul de 0,1% al ariei copilului în afara poligonului părinte. Abaterile sunt înregistrate individual, nu netezite și nu ascunse. Sursa HistoGIS listează atât părinți direcți, cât și strămoși, uneori din perioade diferite; reconstrucția părintelui cel mai apropiat este doar o ipoteză de lucru care necesită confruntare independentă. Intervalele sunt cele declarate de HistoGIS, nu intervale juridice recertificate în acest PR.

## Fișiere implementate

- public/data/historical/v1/catalog.json: inventarul cu entități, versiuni, surse, geometrii, utilizări, relații candidate și QA; bridge, events, symbols și geometryDecisions sunt goale, pentru că nu inventăm informații.
- public/data/historical/v1/geometry.geojson: 53 de geometrii-sursă distincte și complete, fără simplificare sau reparare. Atribuirea și licența se găsesc în catalog și în această documentație.
- scripts/historical/build_pilot_catalog.py: extragere reproductibilă cu SHA de sursă verificat, date exacte, deduplicare strictă și verificare de topologie.
- src/data/historicalCatalog.mjs și .d.mts: încărcare independentă de ACTUAL, validare, căutare de versiuni, relații la o dată exactă și acces la utilizările unei geometrii.
- src/data/historicalGeometryUses.mjs și .d.mts: model temporal unic, controlul identităților geometrice și ordonarea cronologică.
- src/data/historicalLifeCycle.mjs și .d.mts: contractul pentru înființări, desființări, reforme, redenumiri, divizări/fuziuni, succesiuni, simboluri istorice datate și decizii asupra geometriilor concurente. Validează sursele, drepturile grafice și cel mult o geometrie principală admisă simultan.
- src/components/GeometryUsesSection.tsx: secțiune comună pentru panoul Entitate, cu dicționarul EN/RO global.
- src/App.tsx: numai etichete noi în același dicționar; modulul Istoric încă nu este activat cu date candidate în hartă.

## Reguli de afișare și integritate

În interfață, intervalele se afișează în forma anX–anY; zilele și lunile sunt păstrate intern. Un snapshot care dovedește doar un an se afișează „Atestat în 1910” / “Attested in 1910”, fără extrapolare. Lipsa capătului se indică prin ?–anY / anX–? . Nicio geometrie din acest pilot nu este certificată juridic.

Funcția historicalChildrenAtDate nu returnează legături candidate implicit; un cercetător poate activa explicit opțiunea includeCandidates și primește indicatorul de încredere și avertismentele geometrice. Acest sistem oferă un arbore de revizuire util fără a-l prezenta drept arhitectură istorică verificată.

Catalogul Administrativ cu 4.283 de entități, sursele OSMB, codurile SIRUTA/CUATM/NUTS/NTS, simbolurile și datele ACTUAL rămân nemodificate. Registrul bidirecțional către ACTUAL nu a fost populat pe baza numelor ori suprapunerilor.

## Reproducere și acceptare

Executați cu Python 3.10+ și Shapely 2+:
python scripts/historical/build_pilot_catalog.py --zip PATH/histogis-data-v9.0.zip --out public/data/historical/v1

Se compară ambele fișiere regenerate bit-cu-bit și rezultatele QA. Apoi: npm test, npm run build, CI pe SHA-ul exact. Teste suplimentare HIST-MODULE.1: evenimente cu succesori multipli, drepturile simbolurilor și interzicerea a două geometrii principale admise simultan. Pilotul are zero evenimente, zero simboluri și zero verdicte geometrice deja admise.

Etapa următoare HIST-MODULE.2: verificarea independentă a surselor, a perioadelor și a relațiilor, urmată de integrarea controlată a arborelui și a selecțiilor în modulul Istoric, fără contaminarea datelor ACTUAL.
