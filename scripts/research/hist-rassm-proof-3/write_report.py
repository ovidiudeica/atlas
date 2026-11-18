import pathlib,json,sys,shutil,hashlib
ROOT=pathlib.Path.cwd();sys.path.insert(0,str(ROOT/'work/python_deps'))
import pandas as pd,geopandas as gpd
W=ROOT/'work/proof3';O=ROOT/'outputs/12_HIST-RASSM_PROOF_3';s=json.loads((O/'09_RAPORT_FINAL/summary.json').read_text());d=pd.read_csv(O/'09_RAPORT_FINAL/RASSM_PROOF3_decizii_per_arc.csv');b=json.loads((O/'08_REPRODUCIBILITATE/PROOF2_summary_unchanged.json').read_text());f=s['independently_traced_cartographic_symbols'];fmt=lambda x:f'{x:.3f}'.replace('.',',')
e=s['exterior_1937'];i=s['internal_1937'];drive='https://drive.google.com/drive/folders/1e8gelJThsFpoq6AdtlQYYiXu9fQMp3xh'
text=f'''# HIST-RASSM.PROOF.3 — Raport final

## 1. Verdict

**PROOF.3-C: progres probatoriu parțial, fără certificare nouă M1 sau A/B.** Sunt investigate țintit {len(d)} arce PROOF.2, cu dosare individuale și sursele OSMB exacte. Au fost construite patru trasări independente C din semnele unei reproduceri cartografice atribuite anului 1930. Nu este îndeplinit criteriul B în niciuna dintre cele două rețele. Nu se pretinde închiderea istorică a sistemului RASSM.

## 2. Arce investigate efectiv

{s['exterior_cases']} arce exterioare, câte șase în NW, SE și SC, și {s['internal_cases']} arce interioare: **{len(d)} arce**, {fmt(s['investigated_arc_km'])} km în episodul candidat 15 ianuarie 1937. Selecția este țintită, spațiată; nu reprezintă auditul tuturor celor 356,030 km de candidați. ID-urile, perechile raionale, obiectele moderne, distanțele PROOF.2 și motivele se găsesc în registrul per-arc. Reconcilierea celor 32.722 de înregistrări nu a fost reluată.

## 3. Dovezi istorice noi per arc

**0 arce au primit dovadă directă suficientă pentru identitatea precisă a traseului istoric.** Pentru {s['new_regional_context_arc_count']} arce exterioare există context cartografic regional nou în vecinătatea nominală de 5 km a trasărilor din 1930. Acesta este un indiciu, nu o certificare și nici o acoperire metrică demonstrată. Distanța este calculată după transformarea aproximativă a reproducerii; pragul de 5 km este de selecție a contextului, nu o eroare absolută estimată.

## 4. Promovări M2/M3 → M1

**0 km.** Geometriile OSMB sunt păstrate exact în stratul de proveniență, cu snapshot și identificator; nu au fost admise retrospectiv și nu au fost redigitizate sau folosite pentru snapping.

## 5. Exterior admis A/B

**0 km.** Identitatea administrativă, identitatea geometrică și validitatea juridică sunt câmpuri separate în fiecare dosar. O coincidență HURI–ICR–OSMB nu autentifică singură regula fluvială sau continuitatea traseului din 1937 până în 2026.

## 6. Interior admis A/B

**0 km.** Niciun hotar comun nou nu este admis B. Stratul `RASSM_INTERNAL_ADMITTED` este real, cu schema definită, dar fără obiecte. Pentru fiecare caz interior este nominalizată harta sau anexa lipsă.

## 7. Reconstrucții independente efective

Patru trasări ale semnelor tipărite: trei exterioare, **{fmt(f['external_symbol_km'])} km nominali**, și o porțiune de semn raional interior, **{fmt(f['internal_symbol_km'])} km nominali**. Acestea aparțin episodului distinct `PUBLICATION_1930_ADMINISTRATIVE_CONTENT_UNDATED`, în clasa C. Nu se însumează cu rețeaua din 1937. Perechea raională a porțiunii interioare rămâne neatribuită; nu este introdusă ca hotar comun al unor raioane identificate cert.

Transformarea folosește două intersecții ale meridianului tipărit de 30° cu paralelele 48° și 47°, orientarea cadrului și bara de scară de 45 km. Este o localizare aproximativă constrânsă de scară, fără autentificarea proiecției și a datum-ului istoric. Parametrii, pixelii, scara și sensibilitatea ±1% sunt livrate. Cinci pixeli corespund nominal la circa {fmt(5*f['east_m_per_pixel'])} m; acest lucru nu reprezintă eroarea absolută sau un interval de încredere. RMSE absolut: **nedeterminat**. Hotar juridic nou admis din aceste trasări: **0 km**.

## 8. Kilometri rămași M2/M3/M4/M5

Valorile PROOF.2 pentru episodul candidat 1937 sunt păstrate nemodificate:

| Rețea | Total km | M2 km | M3 coincident km | M3 divergent km | M4 km | M5 km |
|---|---:|---:|---:|---:|---:|---:|
| Exterior | {fmt(e['total_geodesic_km'])} | {fmt(e['M2_km'])} | {fmt(e['M3_coincident_km'])} | {fmt(e['M3_divergent_km'])} | {fmt(e['M4_km'])} | {fmt(e['M5_km'])} |
| Interior unic | {fmt(i['total_geodesic_km'])} | {fmt(i['M2_km'])} | {fmt(i['M3_coincident_km'])} | {fmt(i['M3_divergent_km'])} | {fmt(i['M4_km'])} | {fmt(i['M5_km'])} |

Toți acești kilometri necesită în continuare dovadă istorică independentă. Pentru celelalte șapte episoade HURI și ICR se păstrează registrele PROOF.2, cu hashul sursei în manifest; nu se însumează episoade diferite.

## 9. Segmente rezolvate

**Niciun arc PROOF.2 nu este declarat rezolvat istoric.** Au fost rezolvate distincții de sursă: foaia regională de atlas 1939 nu este harta administrativă RASSM 1:300.000; harta etnică în culori este o reconstrucție modernă, nu un facsimil din 1928. Cele patru obiecte cartografice construite au ID-urile `P3-MSE30-NW-01`, `P3-MSE30-SC-01`, `P3-MSE30-SE-01`, `P3-MSE30-IN-01`, toate C. Prima lectură interioară a fost respinsă la controlul vizual; fișierul livrat urmărește centrele punctelor tipărite.

## 10. Segmente nerezolvate și motive

Toate cele {len(d)} ID-uri sunt prezentate mai jos și în `RASSM_PROOF3_blocaje_individuale.csv`. Pentru fiecare există verdict individual și probă lipsă. M5 nu este transformat automat în obligație de redigitizare. `RASSM_UNRESOLVED_SEGMENTS` păstrează toate cazurile M4/M5 și părțile divergente M3 ale episodului candidat 1937, inclusiv pe cele neinvestigate în această selecție. Restanțele celorlalte episoade rămân în pachetul PROOF.2 intact.

## 11. Raioane afectate

Selecția include următoarele nume HURI: {', '.join(sorted(set(';'.join(d.adjacent_raion_names).split(';'))))}. Numele din sursă sunt păstrate ca atare; identitatea lor cu o unitate modernă nu este dedusă din asemănarea denumirii. Rețeaua interioară păstrează o singură muchie pentru ambele raioane.

## 12. Modificări documentate și cronologie

Nu a fost recuperat un act nou cu traseu anexat care să permită modificarea geometriei. Se păstrează cronologia verificată anterior: constituirea 1924, transferurile 1926, reorganizările 1933–1935, transferurile 1936 și reorganizarea 1937. Tiraspol este desființat în 1933 și reînființat în august 1937; poligonul HURI etichetat ianuarie 1937 nu este admis ca dovadă a existenței legale a raionului. Portalul istoric instituțional consultat descrie și desființarea Camencăi în 1959 și reînființarea în 1969 cu teritorii de pe malul drept: indiciu de discontinuitate administrativă ce impune verificarea actelor și planurilor, fără a demonstra singur deplasarea fiecărui arc.

## 13. Hărți recuperate efectiv

Două reproduceri oficiale noi au fost descărcate și verificate ca imagini: harta atribuită Micii Enciclopedii Sovietice din 1930, 1280 px lățime, și foaia regională din Atlasul URSS 1939, 960 px lățime. Originalele native au răspuns HTTP429 și nu au fost urmărite prin cereri repetate. Pentru harta din 1930 nu a fost autentificat volumul integral sau numărul paginii; atribuirea editorială provine din metadatele Commons. Nu se pretinde recuperarea originalului nativ, a hărții administrative Lațaș 1939, a originalului Tiraspol 1929 sau a planului Ananiev 1936.

## 14. Surse încă inaccesibile și piste exacte

Inventarul primar ANRM R-2947, inventarul 3, imaginea PDF 2, înregistrează: **unitatea 1 — hartă administrativă RASSM 1939, 1 cm = 3 km, Harkiv, limba ucraineană; unitatea 3 — harta raionului Ananiev 1936, 1 cm = 500 m, color, calc**. Inventarul nu conține aceste hărți. Publicația Institutului de Istorie al Ucrainei descrie limite sătești pe harta 1939; este descriere, nu facsimil.

DataCORE Tiraspol a furnizat din nou HTML de arhivă rece, nu TIFF; alternativa genealogică a răspuns503; indexul MapyWIG 1:100.000 nu a furnizat foaia țintă. Ediția Tiraspol 1944 identificată în catalog este ulterioară intervalului și nu substituie foaia 1929. Geoportalul RGO a prezentat o problemă de certificat TLS; validarea TLS nu a fost dezactivată. Nu au fost găsite public planurile comisiilor 1924–1926 sau planurile fondurilor sătești necesare. Nu au fost contactate instituții.

## 15. Datum Dubăsari

Ipoteza Bessel/Gauss–Krüger zona 5 rămâne compatibilă cu testul intern PROOF.2, RMSE nominal aproximativ 17,1 m pentru cele patru controale ale caroiajului. Nu autentifică realizarea efectivă a datum-ului, parametrii către WGS84 sau precizia absolută. Excluderile Ustia și Corjova omonimă sunt păstrate; nu sunt reintroduse.

## 16. GCP fizice independente admise

**0.** Au fost aprofundate patru piste: Ohrincea, Izbiște, Jevreni și Dubăsarii Vechi. Istoriile instituționale permit precizarea unor date și a reconstrucțiilor clădirilor, dar nu oferă împreună identitatea exactă a simbolului, continuitatea punctului material și coordonata măsurată independent. Coordonatele presupuse nu sunt fabricate. Nu a fost executată o ajustare cu puncte fizice FIT sau HOLDOUT pretins admise.

## 17. Precizie și incertitudine

Pentru Dubăsari, erorile cadrului și testul de elipsoid rămân verificări relative interne, cu precizia absolută nedeterminată. Axa hidrografică de 4,346950 km din PROOF.1 este rezultat anterior, nu hotar juridic nou și nu este numărată din nou. Pentru harta din 1930 transformarea aproximativă, scenariile ±1% și lectura de ±5 px sunt livrate ca analiză condițională; zero repere fizice de control. Norma juridică pentru linia fluvială nu a fost recuperată; centrul albiei nu primește automat statut de hotar.

## 18. Topologie și verificări

Geometriile selectate sunt WKB-identice cu PROOF.2; nodurile nu sunt mutate. Lungimile selectate sunt recalculate geodezic, cu diferență maximă {s['validation']['case_geodesic_length_max_delta_m']} m față de registrul original. Nu există ID-uri duplicate sau dublări ale aceleiași muchii interioare în episodul de referință. Trasările noi sunt valide, simple și continue individual; ele sunt eșantioane parțiale, nu o rețea istorică închisă. Nu au fost create poligoane noi ori schimbate suprafețe. Cele 14 poligoane candidate de referință rămân C.

Reproducerea izolată compară exact registrele, GeoJSON, WKB/atributele celor patru trasări și pixelii/transformarea rasterului. QGIS recitește proiectul și calculează independent lungimile; rezultatele și controlul vizual sunt în `06_VALIDARE`. Validitatea GIS nu constituie dovadă istorică.

## 19. Evoluție față de PROOF.2

| Indicator | PROOF.2 | PROOF.3 |
|---|---:|---:|
| Exterior M1 km | 0 | 0 |
| Exterior A/B km | 0 | 0 |
| Interior M1 km | 0 | 0 |
| Interior A/B km | 0 | 0 |
| Exterior fără corespondent verificat M4 km | {fmt(e['M4_km'])} | {fmt(e['M4_km'])} |
| Interior fără corespondent verificat M4 km | {fmt(i['M4_km'])} | {fmt(i['M4_km'])} |
| GCP fizice absolute admise | 0 | 0 |

Progresul verificabil constă în cele 36 de dosare țintite, calificarea surselor, patru trasări cartografice C reproductibile și aprofundarea pistelor fizice. Nu există creștere a lungimii admise istoric. Pachetul PROOF.2 și toate valorile sale sunt păstrate intacte.

## 20. Livrare GIS/QGIS și Drive

[Folderul privat PROOF.3]({drive}). Modelul este `RASSM_PROOF_3_temporal_C.gpkg`; proiectul portabil este `07_QGIS/RASSM_PROOF_3_C.qgz`. Cele nouă straturi cerute sunt prezente, inclusiv cele două straturi A/B goale. Toate straturile vectoriale sunt EPSG:4326; afișarea QGIS este EPSG:3857. Fundalul OSM necesită rețea; sursele locale și vectorii funcționează fără el. Pachetele precedente nu sunt duplicate integral.

## 21. GitHub

Branch de cercetare: `hist-rassm-proof-3`, creat din `main` la `51a55fac9bb9b02f4dadf666e150deac724569dc`. PR separat draft; numărul, URL-ul și SHA-ul efectiv sunt în `status_livrare.json` și în recipisa externă de livrare. PR-urile #119–#121 sunt păstrate fără modificări. ACTUAL, geometriile canonice și aplicația nu sunt modificate. Niciun merge.

## 22. Teste și CI

Rezultatele locale Atlas, TypeScript/Vite și rezultatul GitHub Actions pentru SHA-ul final sunt în `06_VALIDARE` și `status_livrare.json`. Acest raport nu substituie starea efectivă a rulării. Reproducerea și verificările GIS au rapoarte distincte. Rasterele și paginile instituționale rămân în pachetul privat; repository-ul primește metodele și registrele de cercetare admisibile.

## 23. Următoarea operațiune exactă

Obținerea facsimilului complet **ANRM R-2947, inventarul 3, unitatea 1, harta administrativă RASSM 1939**, cu legenda, graticulul, antetul și limitele sătești, este ținta principală pentru ambele rețele; pentru Ananiev: aceeași colecție, unitatea 3. Este necesară o copie publică ori acces distinct autorizat, fără ocolirea controalelor. În paralel, pentru Dubăsari: documentul de datum al foii L-35-35-A și măsurători independente ale unor puncte materiale identificate în hartă, cu FIT/HOLDOUT distincte, urmate de verificarea normei fluviale. Nu se înlocuiește proba lipsă cu snapping sau cu identitatea numelor.

## Registru sintetic al celor 36 de dosare

| ID PROOF.2 | Rețea | Sector | Raioane | M anterior → nou | Lungime m | Verdict |
|---|---|---|---|---|---:|---|
'''
for _,r in d.iterrows():text+=f"| {r.arc_id} | {r.kind} | {r.sector} | {r.adjacent_raion_names} | {r.previous_M} → {r.new_M} | {r.length_geodesic_m:.3f} | {r.verdict} |\n"
(O/'09_RAPORT_FINAL/RAPORT_FINAL.md').write_text(text,encoding='utf-8')
dos=['# Dosare individuale PROOF.3\n\nToate concluziile sunt provizorii C. Nu există admitere M1/A/B. Distanțele față de reproducerea1930 sunt doar context nominal, nu probă de identitate.\n']
for _,r in d.iterrows():
 dos.append(f'''\n## {r.arc_id}\n\nEpisod candidat: {r.episode}; rețea: {r.kind}; sector: {r.sector}; unități HURI: {r.unit_ids}; nume: {r.adjacent_raion_names}. Lungime: {r.length_geodesic_m:.6f} m. Clasificare: {r.previous_M} → {r.new_M}, C → C.\n\nIdentitate administrativă: **{r.historical_identity}**. Identitate geometrică: **{r.geometric_identity}**. Validitate juridică: **{r.legal_validity}**.\n\nArce OSMB: `{r.modern_arc_ids}`; ID-uri OSM-sursă: `{r.source_osm_ids}`. Obiecte moderne și snapshoturi exacte:\n\n```json\n{json.dumps(json.loads(r.modern_objects_json),ensure_ascii=False,indent=2)}\n```\n\nSurse verificate: {r.new_evidence}. Context cartografic regional nou: {r.new_regional_cartographic_context}; obiect apropiat nominal: {r.nearest_new_trace}; distanță nominală: {r.nominal_distance_to_new_trace_m:.1f} m. Această apropiere nu autentifică traseul sau data lui.\n\nVerdict: **{r.verdict}**. {r.reason}\n\nProbă precisă lipsă: {r.missing_evidence}\n\nGeometrie: {r.geometry_used}. SHA-256 WKB: `{r.geometry_sha256}`. Nu s-a schimbat geometria candidatului. Continuitatea de după1940 nu este demonstrată de un lanț complet de planuri; absența schimbărilor nu se presupune. Incertitudinea absolută rămâne nedeterminată.\n''')
(O/'02_CONTINUITATE_OSMB/DOSARE_INDIVIDUALE.md').write_text(''.join(dos),encoding='utf-8')
cases=gpd.read_file(O/'RASSM_PROOF_3_temporal_C.gpkg',layer='INVESTIGATED_CASES');cases[cases.kind=='INTERNAL'].to_file(O/'04_HOTARE_RAIONALE/cazuri_interioare_C.geojson',driver='GeoJSON');cases[cases.kind=='EXTERNAL'].to_file(O/'03_HOTAR_EXTERIOR/cazuri_exterioare_C.geojson',driver='GeoJSON');rec=gpd.read_file(O/'RASSM_PROOF_3_temporal_C.gpkg',layer='RASSM_HISTORICAL_RECONSTRUCTIONS');rec[rec.kind.str.startswith('INTERNAL')].to_file(O/'04_HOTARE_RAIONALE/semn_raional_1930_neatribuit_C.geojson',driver='GeoJSON')
shutil.copy2(W/'write_report.py',O/'08_REPRODUCIBILITATE/write_report.py')
for n in ['qgis_proof3.py','reproduce_new_traces.py']:shutil.copy2(W/n,O/'08_REPRODUCIBILITATE'/n)
(O/'08_REPRODUCIBILITATE/REPRODUCERE.md').write_text('''# Reproducere PROOF.3\n\nSursele PROOF.2 rămân în pachetul11, nemodificate. GeoPackage SHA-256:4ae9ec315841246a07d3678bfda045d14c2e5a2567547835624c0172f605b494. Nu se rulează din nou reconcilierea generală.\n\nPentru un workspace nou, plasați scripturile în work/proof3, configurația traces_1930.json alături de ele și sursa MASSR1930_official_1280.png în work/proof3/sources. Rulați reconstruct_1930.py. Dependențe: numpy, geopandas, shapely, pyproj, Pillow, rasterio, pyogrio, pandas. Scriptul reproduce_new_traces.py creează un director nou gol și compară CSV, GeoJSON, WKB/atribute și rasterul.\n\nSelecția se regenerează cu select_cases.py folosind pachetul PROOF.2 în outputs/11_HIST-RASSM_PROOF_2. build_package.py reutilizează numai sursele locale verificate și selecția; write_report.py generează dosarele și raportul. qgis_proof3.py necesită QGIS3.44 și generează proiectul portabil. Configurația Python a sesiunii este în environment.json.\n\nToate sursele noi și fișierele livrate sunt fixate prin SHA256SUMS.txt. Originalele și arhivele OSMB sunt referite prin hash și link, fără duplicare voluminoasă. Lipsa unei realizări de datum sau a unui HOLDOUT fizic nu se înlocuiește cu o eroare nominală a ajustării.\n''',encoding='utf-8')
shutil.copy2(ROOT/'outputs/11_HIST-RASSM_PROOF_2/08_COD_SI_REPRODUCIBILITATE/environment.json',O/'08_REPRODUCIBILITATE/environment.json')
(O/'README.md').write_text(f'''# HIST-RASSM.PROOF.3-C\n\n36 de dosare țintite, patru trasări independente de semne cartografice C; **0 km M1 și0 km A/B admise**. Raportul complet, cu23 de rezultate și tabelul de evoluție, este în09_RAPORT_FINAL/RAPORT_FINAL.md. Modelul real GeoPackage este la rădăcină; proiectul QGIS portabil este în07_QGIS.\n\n[Drive privat]({drive}). Rasterele au drepturi și proveniență documentate individual; nu sunt publicate în repository. OSM: © OpenStreetMap contributors, ODbL, https://www.openstreetmap.org/copyright.\n\nTrasările1930 au dată administrativă și datum neautentificate; nu se adună la totalurile candidatului1937. Perechea noului semn interior este neatribuită. Consultați status_livrare.json și recipisa externă pentru PR/SHA/CI și verificarea copiilor Drive.\n''',encoding='utf-8')
print(json.dumps(dict(report_sections=23,dossiers=len(d),new_cartographic_exterior_km=f['external_symbol_km'],new_cartographic_internal_km=f['internal_symbol_km'],M1_AB_km=0)),flush=True)
