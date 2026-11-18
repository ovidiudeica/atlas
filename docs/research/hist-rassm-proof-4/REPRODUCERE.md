# Reproducere PROOF.4

Python3 cu numpy, pandas, geopandas, pyogrio, shapely, pyproj, rasterio, Pillow și pypdf; QGIS3.44.13. Scripturile sunt păstrate cu traseele de lucru ale execuției originale. Sunt necesare intrările PROOF.3 verificate (GeoPackage SHA e810fa4ea28f3e764c35477451d71f2c439f2fa76382ed564506d546882b69b9), sursele native și manifestele acquisition_* în work/proof4. Toate sursele publice au URL și hash în provenance.json; fișierele temporare cu URL semnat nu sunt livrate.

1. Refaceți structura work/proof4/sources și outputs/12_HIST-RASSM_PROOF_3 din pachetele private referențiate. Configurați bibliotecile Python pentru mediul local în loc de work/python_deps dacă este necesar.
2. Rulați build_proof4.py. Variabila PROOF4_OUTPUT permite o destinație proaspătă. Nu se rulează reconcilierea generală HURI–ICR–OSMB.
3. Rulați reproduce.py pentru comparație efectivă într-un director gol: registrele byte-identice, toate geometriile/atributele și rasterul diagnostic pixel/transform.
4. Rulați write_report.py și qgis_proof4.py cu Python QGIS. Proiectul rezultat folosește căi relative, vectori4326 și afișare3857. Revizuiți vizual randările înainte de setarea visual_verified.

Noile coordonate sunt citiri pe graticul, nu repere fizice. Două FIT plus bara de scară nu produc HOLDOUT independent. Transformarea nominală nu autentifică datum-ul istoric. Geometriile de hotar nu au fost modificate în această etapă.
