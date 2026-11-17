# Reproducerea PROOF.2a

Instalați versiunile dinenvironment.json: Python,numpy,pandas,geopandas,shapely,pyproj,pyogrio,Pillow. QGIS3.44.13 este folosit separat pentru afișare și verificările independente.

Intrările fixe sunt îninputs/, cuSHA-256 îninput_manifest.json. Sunt incluse geometriile necesare și registrele anterioare, nu se cer inventariereaDrive sau redescărcarea atlaselor. SnapshoturileOSMB originale sunt identificate prinDriveID,dimensiune,SHA-256 și verificareCRCgzip.

```text
python run_reproduction.py --package /cale/pachet --scratch /cale/director-gol
```

Scriptul reconstruiește rețeaua și potrivirile într-un spațiu nou, fără cache-ul rulării inițiale, apoi asamblează91 de raioane și confruntăOSMBhistoric/statistical. CSV-urile sunt comparate prinSHA-256, iar straturileGeoPackage pringeometrieWKB șiatribute. Nu se cere identitate binară a containerelorGPKG, care pot avea metadate temporale.

QGIS:qgis_proof2.py folosește mediulQGIS, cuQT_QPA_PLATFORM=offscreen. Rădăcina se adaptează la copia-pachet. AfișareaOSM și capturile sunt verificări actuale, nu dovezi ale unui hotar1924–1940.

Punctele fizice nu se inventează. Dubasari_4_GK_internal_holdouts.csv este o observație manuală a grilei imprimate, separată de22GCPPROOF.1 și de repere fizice. Rasterul-sursă și întregulPROOF.1 sunt referite prinproveniență/SHA, fără duplicare inutilă.
