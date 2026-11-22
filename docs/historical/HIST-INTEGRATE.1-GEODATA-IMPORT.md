# HIST-OHM-CORE.1 — catalog istoric OHM, după retragerea HistoGIS

**Prioritate decisă:** OHM → județele și plășile din 1930 → abia la final HistoGIS pentru completarea lacunelor. Nicio georeferențiere nouă a hărților din 1835 și 1841 nu este inclusă în această etapă.

**Stadiu:** implementat în ramura draft `feat/hist-import-geodata-gis-1` / PR #143, **neintegrat, nepublicat și fără certificare juridică a hotarelor**. Actualizarea catalogului web se produce numai după verificarea CI și integrarea protejată.

## Setul de date activ — OpenHistoricalMap

Sursa este colecția existentă `Geodata GIS/OHM-Boundaries` din Drive, fără mutarea sau modificarea fișierelor originale.

| Lot OHM | Versiuni-sursă |
|---|---:|
| State și regiuni istorice | 43 |
| Județe istorice | 19 |
| Comitate istorice | 77 |
| **Total** | **139** |

- **139** apariții de geometrii-sursă și versiuni OHM, păstrate separat ca relații OHM distincte;
- **125** active geometrice logice distincte după egalitate **exactă** a coordonatelor, cu **14** reutilizări, fără rescrierea coordonatelor;
- **29** fișiere GeoJSON fragmentate pentru încărcare la selecție, nu într-un singur payload mare;
- **139/139** geometrii topologic valide conform QA efectuat la import; acest rezultat este tehnic, nu o atestare a hotarelor istorice;
- **13** versiuni au cel puțin o limită temporală nedocumentată; ea nu se completează arbitrar;
- **76** grupuri de proveniență/editoriale distincte sunt proiectate ca **entități provizorii de lucru** (nu identități instituționale certificate), cu **139** versiuni-sursă și **139** utilizări de geometrie.

Identitatea relației OHM, datarea declarată, denumirile originale, tipul sursei, ID-ul și calea sursei, SHA-256 și etichetele `fixme` se păstrează în `public/data/historical/v1/geodata/index.json`. Geometria se încarcă numai la selectare. Legăturile de subordonare, continuitatea instituțională și corespondențele ACTUAL ↔ Istoric rămân necertificate și nu sunt generate din structura folderelor.

**Drepturile de reutilizare și validarea istorică independentă trebuie verificate înainte de a trata geometria drept hotar admis.** Vizualizarea sursei nu reprezintă certificare juridică.

## Clean-up executat în ramura draft

- Retrasă geometria HistoGIS `public/data/historical/v1/geometry.geojson` din pachetul web; pilotul HistoGIS și legăturile sale din interfața principală au fost dezactivate/eliminate.
- Retrași cei trei payload-uri suplimentare RASSM/HURI și Transilvania introduse prematur în aceeași ramură; ei nu se reintroduc odată cu OHM.
- Indexul și validatoarele active acceptă numai familia `OHM`; testele de regresie principale și smoke-testul browser sunt actualizate pentru OHM.
- Metadatele documentare istorice din etapele HIST-MODULE precedente rămân disponibile pentru audit, dar **nu sunt un catalog activ și nu mai au un pachet geometric HistoGIS publicat prin această ramură**.
- **Fișierele-sursă HistoGIS din Geodata GIS rămân intacte** pentru completarea lacunelor după finalizarea lotului OHM și a județelor/plășilor 1930.
- `ACTUAL`, `public/data/phase4` și geometria administrativă în producție nu sunt modificate.

## Etapa următoare: județe și plăși 1930

1. Stabilizarea lotului OHM: verificarea relațiilor/versiunilor și a interfeței RO/EN, QA CI și emiterea verdictului de integrare.
2. Inventarierea completă a geometriilor județelor din 1930, cu proveniență, limită de perioadă și raport de acoperire.
3. Integrarea plășilor din 1930 sub județele documentate, numai cu relații părinte–copil și delimitări confirmate din surse.
4. Reconcilierea suprapunerilor OHM ↔ 1930 **fără a suprascrie sursa originală**.
5. Completarea lacunelor cu HistoGIS **la final**, după verificarea corespondențelor și drepturilor.

Un județ OHM cu o dată care intersectează 1930 nu este automat un județ 1930 certificat, iar poligonul județului nu este o geometrie de plasă.

## Reproducibilitate

Importator: `scripts/historical/import_geodata_gis_sources.py`; registrul original: `docs/historical/import/HIST-INTEGRATE.1-OHM-IMPORT-QA.json`; proiecția sursei: `src/data/historicalGeodataTemporal.mjs`; teste: `tests/hist-integrate-geodata.test.mjs` și `tests/hist-geodata-temporal-projection.test.mjs`. Vechea integrare HistoGIS poate fi consultată în documentația HIST-MODULE și în istoricul Git, dar nu reprezintă setul activ OHM.
