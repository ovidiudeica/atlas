# HIST-OHM-TREE.4 — RoHGIS 1930 și intervale comitatense

## Domeniu
Extinde arborele istoric EXISTENT, nu modulul ACTUAL: în anul 1930 sub Regatul României apare un grup RoHGIS cu 71 de județe și 494 de plăși. Plasa are părinte explicit în atributul-sursă Județ; nu este dedus din suprapunere geometrică. Identitățile OHM și RoHGIS rămân distincte inclusiv pentru omonime. Geometriile și parentajul nu sunt certificate juridic.

## Importul datelor
- 71 județe: rohgis_judete_1930.gpkg, EPSG:3844.
- 494 plăși: rohgis_plasi_1929_1933.gpkg, EPSG:3844.
- 16 fragmente GeoJSON EPSG:4326 pentru vizualizarea web, încărcate numai la cerere; se păstrează hashul SHA256 și referința la fișierul original din Drive.
- Catalog de 565 de versiuni-sursă cu entityId, versionId, parentId, geometryId, perioadă 1930 și identificator extern.
- Diferențele de denumire nu distrug identități distincte: există 75 de nume de plăși repetate în același județ, dar ID-urile-sursă ale celor 494 de plăși sunt unice.

Sursa RoHGIS însuși observă ajustări necuprinse complet între 1929–1938. Prin urmare filtrarea temporală oferă RoHGIS NUMAI pentru anul 1930: niciun contur din set nu se extrapolează automat la alte date.

## Control topologic și reutilizare
Toate cele 565 poligoane-sursă sunt valide. Nu există plăși fără județ-părinte. Există 565 de geometrii distincte prin comparația exactă a coordonatelor WKB originale; nu s-a demonstrat nicio geometrie comună suplimentară în RoHGIS. Cele 14 aliasuri geometrice deja documentate în OHM rămân distincte de acest catalog. Reutilizarea cross-source OHM/RoHGIS necesită compararea coordonatelor în același CRS și stabilirea identității istorice: coincidența denumirilor ori asemănarea vizuală NU este suficientă.

În medie, plășile acoperă aproape integral județele, DAR există resturi geometrice: total cca. 1,109820 km² din județe neacoperiți de uniunea plășilor și cca. 1,037082 km² din plăși în afara județelor atribuite. Pentru niciunul dintre cele 71 județe uniunea plășilor nu coincide exact cu geometria județeană; nu s-au făcut snapping, buffer(0) sau modificări mascate. Fișierul de QA din docs/historical/import conține verificările individuale.

## Comitate, calificare documentară
- Csanád–Arad–Torontál: cadrul legislativ în legea 1923:XXXV §§11–12; menționare contemporană în Statistikai Szemle nr. 6/1928, p. 659. Se admite doar apartenența administrativă documentară pentru iunie 1928, sub un nod geometric nul al Regatului Ungariei interbelice. Nu se certifică hotarul OHM și nu se extrapolează 1923–1945.
- Ung: în sursa OHM este datată numai ziua 1876-06-19; HOLD pentru intervalul ulterior.
- Bereg–Ugocsa (1850–1860) și Békés–Csanád (1854–1860): HOLD până la surse austriece contemporane; nu sunt identice cu grupările maghiare administrative din 1923.
- Zaránd și reorganizările ante-1876: HOLD individual; 1911 nu poate valida retroactiv alte perioade.

## Surse, drepturi și verificare
RoHGIS: https://geo-spatial.org/vechi/download/rohgis
Geografia RoHGIS: https://rohgis.ro/geografic/
Harta 1930: https://geo-spatial.org/vechi/download/romania-limitele-administrative-ale-jude-elor-interbelice-1930
Legea 1923:XXXV: https://net.jogtar.hu/ezer-ev-torveny?docid=92300035.TV
KSH 1928: https://www.ksh.hu/statszemle_archive/all/1928/1928_06/1928_06_0648_0714.pdf
Original județe: https://drive.google.com/file/d/1Bz7JCOGI3p7f0nEgvsNXi5HbEt-t5CqJ/view
Original plăși: https://drive.google.com/file/d/1WLnoTCnxx41x-oP6aECkKlCS-HJlUTPp/view

Verificare: node --test tests/hist-ohm-tree4-rohgis-1930.test.mjs; npm test; npm run build.

Licență verificată: RoHGIS publică datele sub Creative Commons Attribution 4.0 International (https://rohgis.ro/despre/), cu obligația de atribuire; geometria județelor este atribuită lui Andrei Nacu și Cezar Buterez, cea a plășilor lui Cezar Buterez. Au fost reproiectate numai copiile de afișare WGS84, nu originalele EPSG:3844. Identitatea juridică a hotarelor rămâne necertificată. Baza OHM și fișierele Drive rămân nemodificate. Parentajul documentar suplimentar este păstrat în registrele -extensions.json, nu în registrul istoric înghețat.
