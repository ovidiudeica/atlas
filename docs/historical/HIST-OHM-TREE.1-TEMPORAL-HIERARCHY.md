# HIST-OHM-TREE.1 — arbore temporal OHM, geometrii comune, bife

**Stadiu:** implementare în ramură de dezvoltare. Integrarea în `main` și publicarea sunt supuse CI și revizuirii; drepturile de reutilizare și validitatea juridică a contururilor nu sunt certificate implicit.

## Model

- 139 versiuni-sursă originale OHM, grupate în 76 de identități provizorii de sursă (nu instituții probate automat).
- 125 active geometrice distincte definite prin egalitate exactă a coordonatelor; 14 utilizări suplimentare referă unul dintre aceste active. Nu sunt create 14 geometrii noi. `loadGeodataSharedAsset` reîncarcă numai poligonul canonic al activului, păstrând separat ID-ul relației OHM și proveniența versiunii. GeoJSON-urile originale rămân disponibile pentru audit.
- `HistoricalVersion` referă un `geometryId` reutilizabil. Două entități administrative nu devin aceeași entitate dacă poligonul lor este identic; două versiuni cronologice nu devin automat o perioadă continuă.
- `public/data/historical/v1/ohm-parentage.json` este un registru **separat** cu relații administrative documentate, datate, și tipul verificării. Structura folderelor OHM, asemănarea numelor și suprapunerea spațială nu creează părinte administrativ.
- `buildHistoricalOhmTree` construiește arborele pentru data de referință 1 iulie a anului ales. Doar relațiile active la această dată, susținute de dovezi și cu versiuni-sursă datate pentru ambele capete, creează copii. Un nod fără părinte verificat rămâne rădăcină neîncadrată, în secțiunea editorială a sursei.
- Perioadele OHM cu început sau sfârșit neconfirmat nu sunt extinse automat la anul selectat. Versiunile lor se pot inspecta și bifa explicit, dar nu sunt prezentate drept „active” în mod temporal.

## Primele trei relații administrative temporale documentate

Intervalul de admitere este **1 ianuarie 1926 – 13 august 1938**, exclusiv pentru apartenență administrativă, fără certificarea hotarelor sau a echivalenței instituționale a versiunilor OHM:

| Părinte | Copil | Sursă de susținere |
|---|---|---|
| Regatul României | Județul Arad | Consiliul Județean Arad, PATJ, p. 99; Legea de unificare din 1925 |
| Regatul României | Județul Maramureș | *Unificarea administrativă a României întregite*; Legea de unificare din 1925 |
| Regatul României | Județul Timiș-Torontal | PATJ Arad, p. 99; *Unificarea administrativă a României întregite* |

**Atenție:** după reorganizarea din august 1938, ținuturile sunt unități intermediare. Nu menținem fictiv un raport direct județ–stat până în 1940. Nu deducem că geometria județului Arad OHM, datată 1921–1950, descrie exact frontiera din 1930: hotarul a putut fi modificat în 1926. Aceasta este o relație despre identitatea/numele administrativ documentat, nu o georeferențiere juridică a sursei OHM.

Referințe verificabile sunt incluse individual în fiecare legătură din registru, cu descrierea limitelor dovezii.

## Interfața

- Arbore asemănător celui Administrativ, cu indentare, extindere/restrângere, checkbox individual pentru entitate și pentru versiuni, card de detalii, map-focus pe selectarea unei versiuni.
- Selectarea unei entități în card nu activează obligatoriu bifa. Când exact o versiune temporală este potrivită anului, bifa de entitate controlează acea versiune. Când există mai multe versiuni ori lipsesc date certe, sunt disponibile bife individuale de versiune.
- Multiple geometrii pot fi afișate simultan. Poligoanele cu `geometryId` egal apar **o singură dată** în stratul de hartă, chiar dacă mai multe versiuni sunt bifate. Proveniența tuturor bifelor este păstrată.
- Filtrarea temporală ascunde din hartă bifările necorespunzătoare anului de referință, fără a le șterge. Bifele reapar la revenirea la perioada relevantă ori când filtrul temporal este dezactivat.
- Resetarea locală Istoric șterge numai bifele, selecția, filtrele și anul din modul; resetarea globală șterge toate modulele și restabilește România + Republica Moldova. ACTUAL nu este modificat.

## Condiții de admitere

Validatoarele refuză relații fără probe URL, datare invalidă, părinți inventați, conflict temporal de părinți, cicluri și orice afirmație de certificare geometrică. Rămân necalificate toate celelalte relații părinte–copil OHM până la confruntarea independentă a fiecăreia.

Etapa ulterioară: reconcilierea celorlalte 73 grupuri fără părinte calificat la 1930 (unele pot fi state/rădăcini legitime), apoi județele și plășile din 1930 într-un catalog temporal comun. HistoGIS se va folosi doar la final pentru lacune.
