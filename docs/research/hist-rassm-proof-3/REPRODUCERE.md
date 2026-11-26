# Reproducere PROOF.3

Sursele PROOF.2 rămân în pachetul11, nemodificate. GeoPackage SHA-256:4ae9ec315841246a07d3678bfda045d14c2e5a2567547835624c0172f605b494. Nu se rulează din nou reconcilierea generală.

Pentru un workspace nou, plasați scripturile în work/proof3, configurația traces_1930.json alături de ele și sursa MASSR1930_official_1280.png în work/proof3/sources. Rulați reconstruct_1930.py. Dependențe: numpy, geopandas, shapely, pyproj, Pillow, rasterio, pyogrio, pandas. Scriptul reproduce_new_traces.py creează un director nou gol și compară CSV, GeoJSON, WKB/atribute și rasterul.

Selecția se regenerează cu select_cases.py folosind pachetul PROOF.2 în outputs/11_HIST-RASSM_PROOF_2. build_package.py reutilizează numai sursele locale verificate și selecția; write_report.py generează dosarele și raportul. qgis_proof3.py necesită QGIS3.44 și generează proiectul portabil. Configurația Python a sesiunii este în environment.json.

Toate sursele noi și fișierele livrate sunt fixate prin SHA256SUMS.txt. Originalele și arhivele OSMB sunt referite prin hash și link, fără duplicare voluminoasă. Lipsa unei realizări de datum sau a unui HOLDOUT fizic nu se înlocuiește cu o eroare nominală a ajustării.
