# Reproducerea PROOF.1-C

Python 3.12+ și numpy, pandas, geopandas, shapely, pyproj, rasterio, Pillow. Versiunile folosite sunt înenvironment.json. QGIS 3.44.13 este folosit separat.

Dintr-un director gol, cu o copie completă a pachetului într-un director separat:

```text
python /cale/pachet/06_REPRODUCIBILITATE/build_proof.py --package /cale/copie-pachet
```

Sursa originală din 01, GCP-urile fixe descrise în cod și extrasele din 06 sunt suficiente. Nu se cere reinventariereaDrive, re-descărcareaAtlasului sau accesareaHURI. Scriptul generează doar artefactele derivate în copia indicată. Nu rulați pe originalele arhivistice. Rasterele păstrate în 01 nu sunt modificate.

CSV-urile și GeoJSON-urile se comparăSHA-256 între execuții; pentruGPKG se verifică straturile, CRS, numărul, geometria și atributele, deoareceSQLite poate avea metadate temporale. Nu tratați precizia numerică a coordonatelor ca acuratețe istorică. Nu admiteți un hotar cândabsolute_positional_uncertainty_m esteNULL.

`qgis_proof.py` este scriptul din mediul de execuție; variabila root de la început se adaptează la copia-pachet. Nu este cerută repetarea descărcăriiOSM pentru regenerarea geometriei. Rapoartele și manifestele de proveniență se păstrează ca dovezi; document_proof.py este autorul raportului din mediul de lucru și nu constituie o inferență GIS.
