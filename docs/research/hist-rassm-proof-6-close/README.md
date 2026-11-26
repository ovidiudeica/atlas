# HIST-RASSM.PROOF.6-CLOSE

Această etapă închide livrarea tehnică; verdictul istoric rămâne **PROOF.6-C — progres documentar fără admitere geometrică nouă**. Nu este o cercetare nouă și nu modifică geometriile, clasificările sau raportul original PROOF.6.

Inventarul inițial a identificat80fișiere originale:17prezente în dosarul de surse și63lipsă dinDrive, toate recuperabile binar din artefactele locale. Cele17fișiere existente au fost redescărcate și comparateSHA256 înainte de încărcări; nu sunt duplicate sau înlocuite. Originalul GeoPackage principal areSHA256 c482fdf9cff8b28ae1e3df3fb85d9b32927f212b5aa0dba2a28dd0b38726a990 și este păstrat binar.

Reproducerea offline într-un director inițial gol compară2238obiecte vectoriale și1071înregistrări atributive: WKB, atribute și scheme identice. Containerul SQLite reprodus are alți octeți, distincție explicită înPROOF6_CLOSE_REPRODUCTION.json; originalul binar este cel livrat. Logurile originale confirmă301teste locale trecute și buildTypeScript/Vite reușit. CI original este verificat pentruSHA32a1568ff8c8309ad510182a6410e3ce57df1a80, run44307779111.

## Deschiderea pachetului

Descarcă arhivaHIST-RASSM_PROOF_6_C.zip și extrage întregul director15_HIST-RASSM_PROOF_6. Deschide10_QGIS/RASSM_PROOF_6_C.qgz, păstrând structura directoarelor. Sunt31straturi/tabele QGIS, inclusiv28vectoriale/atributive și3rastere, dintre careOSMeste opțional și dezactivat. Cele4coridoare și512ID-uri pilot sunt accesibile. Toate sursele locale sunt în pachet; nu se folosesc directoareCodex sau alte pachetePROOF.

Cele2straturi de admitere sunt scheme memory cu0obiecte, exact ca în proiectul original, cu proprietăți care indică tabelele canoniceEXTERNAL_ADMITTED/INTERNAL_ADMITTED goale dinGeoPackage. Aceasta păstrează soluția documentată pentru extentul gol pe runtimeGDAL; nu introduce geometrii. Verificatorul controlează separat tabelele reale. FundalulOSMnu este necesar randării offline. Rasterele nominale și trasările sunt candidațiC, nu hotare juridice.

## Verificarea și reproducerea

Codul original rămâne în11_COD. Pentru reconstrucția originală se folosesc intrările PROOF.5 cu hashul fixat îninput_manifest.json și sursele păstrate în01_ACTE_SI_ANEXE/05_UCRAINA. Scriptulbuild_package.py original așteaptă structura workspace-ului original:work/proof6,work/proof5 șioutputs/14_HIST-RASSM_PROOF_5. Nu este necesar să reconstruiești cercetarea pentru a deschide pachetul livrat.

Pentru o reproducere completă: plasează sursele copiate înwork/proof6/sources; copiază1999_scope_per_arc.csv și1999_scope_per_corridor.csv din04_MOLDOVA_UCRAINA, crosswalk-ul din05_UCRAINA și registrul predecesorilor din12_RAPORT_FINAL înwork/proof6, cu numele așteptate înbuild_package.py. Furnizează pachetul originalPROOF.5 nemodificat și dependențele Pythongeopandas,pandas,shapely,pyogrio,pyproj. VariabilaPROOF6_OUTPUT alege un director nou. Scriptul de închiderereproduce_original.py execută scriptul original într-un director gol și compară toate tabelele/vectorii/registrele; nu pretinde identitate binară a containerelor SQLite reproduse.

verify_package.py verifică originalele pe manifest, toateGeoPackage-urile, WKB-ul fiecărui arc,ID-uri,categoriiM,lungimi și loguri. verify_QGIS.py se rulează prinPythonQGIS3.44.13, cu directorul extras și caleaJSONde ieșire. Verifică efectiv toate straturile, sursele relative,schemele goale,ID-urile și randarea offline cu proiect.transformContext().

## Manifeste și recipisă

SHA256SUMS.txt dinZIPacoperă conținutul arhivei fără autoreferință. Manifestul exterior adaugă hashulZIP-ului. Recipisa finală și inventarul de descărcare sunt documente de închidere exterioareZIP-ului pentru a evita ciclul în care o arhivă și-ar conține propriul hash sau propria verificare ulterioară. Inventarul final indică precis ce este înZIP și ce este doar dovadă exterioară a livrării.

Originalele Camenca1959/1969 șiGrigoriopol1958/1971, anexele metrice, albumulMD–UA și poligoanele istorice ale consiliilor ucrainene rămân nerecuperate. Sunt marcateINTENTIONALLY_NOT_PRODUCED, nu prezentate ca fișiere tehnice existente.512arce,0lanțuri complete,0kmM1/A/Bnoi,0GCPfizice și0reconstrucții istorice noi. Aceste restanțe rămân pentruPROOF.7.

PR119–126,ACTUAL,aplicațiaAtlas,geometriile canonice și folderulQGIS_CURRENT rămân nemodificate. Scripturile și documentația de închidere sunt separate de cercetarea originală. Scanurile cu drepturi neclarificate rămân numai în pachetul privat; registrul public nu conțineID-uri sau linkuri ale destinației privateDrive.
