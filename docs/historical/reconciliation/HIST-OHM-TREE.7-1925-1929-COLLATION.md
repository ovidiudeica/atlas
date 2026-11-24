# HIST-OHM-TREE.7 — colationare țintită 1923–1925–1929 (progres documentar, fără promovare GIS)

**Data verificării:** 2026-11-24  
**Statut:** PARTIAL_1925_ORIGINAL_TEXT_COLLATED; 1929_ORIGINAL_ANNEX_MISSING; 1923_RENAMING_ORIGINAL_MISSING; BOUNDARIES_NOT_CERTIFIED.  
**Domeniu:** exact cele 13 versiuni OHM cu `sourcePeriod.start = 1859`, `end = null`: Bacău, Botoșani, Covurlui, Dorohoi, Fălciu, Iași, Neamț, Putna, Roman, Suceava (Moldova), Tecuci, Tutova, Vaslui.

## 1. Ierarhia surselor și controlul vizual

1. **Original juridic 1925, text verificat pe exemplarul digitalizat:** *Monitorul Oficial*, partea I, nr. 220, 7 octombrie 1925, p. 10923 și următoarele, Decretul regal nr. **2465** / 25 septembrie 1925, anexele administrative și listele aferente de comune și sate: https://www.resurse.net/mo/1925/19251007.pdf. Am examinat pasajele OCR ale anexei nominale, dar **nu pretind transcriere diplomatică completă**: cererile de captură/facsimil vizual ale PDF-ului nu au putut fi finalizate, iar tabelele lungi de comune și sate trebuie încă verificate rând cu rând. În OCR apar despărțiri de cuvinte și posibile amestecări de coloane.
2. **Original juridic 1929, încă nerecuperat integral:** Decretul nr. **4036/7 decembrie 1929**, *M.O.* nr. **274/9 decembrie 1929**, plus rectificările din nr. **281, 283, 285, 286, 287, 290 și 291/1929**. Referință de control: https://geo-spatial.org/vechi/download/romania-limitele-administrative-ale-jude-elor-interbelice-1930 ; ediția și rectificările sunt citate în transcrierea Legii pentru organizarea administrației locale: https://www.monitoruljuridic.ro/acte/lege/an-1929/ . **Niciun transfer din 1929 nu este declarat colationat juridic**.
3. **Actul exact de redenumire Suceava (Moldova) → Fălticeni din 1923:** **nu a fost recuperat**; ziua precisă nu se fixează. *M.O.* 1925 enumeră deja **două județe distincte**, Fălticeni și Suceava (Bucovina), fapt verificabil direct pe p. 10923. Succesiunea denumirilor este susținută secundar de *Revista Arhivelor* (1973): https://biblioteca-digitala.ro/reviste/Revista-arhivelor/050_Revista-arhivelor_L_3_1973.pdf . Este greșit să se asocieze automat OHM Suceava cu RoHGIS Suceava 1930.
4. **Hartă contemporană independentă, nivel județ:** Constantin Teodorescu, *România, harta administrativă* (1928), American Geographical Society Library / University of Wisconsin–Milwaukee: https://collections.lib.uwm.edu/digital/collection/agdm/id/26708/ . Datarea și proveniența sunt catalogate, însă **punctele de control și georeferențierea nu au fost efectuate**.
5. **Hărți retrospective utile, dar nu contemporane:** Andrei Nacu (2012), după reforma 1925: https://geo-spatial.org/vechi/galerii/?c=gal_administrative&p=2835 ; după reforma 1929: https://geo-spatial.org/vechi/galerii/?c=gal_administrative&p=2836 ; harta detaliată 1930: https://geo-spatial.org/vechi/galerii/?c=gal_administrative&p=2837 . Acestea nu înlocuiesc actele-sursă; sunt reconstrucții/cartografie derivată.

## 2. Cele 13 dosare: extragerea țintită din anexa 1925

| Județ / ID OHM | Constatare din enumerările 1925 (păstrează rangul de comună/sat) | Verdict și blocaj |
|---|---|---|
| **Bacău** / `ohm-r2943619` | Cedează către Neamț comunele **Blăgești, Buda, Valea lui Ion**, precum și **Racova** cu excepțiile nominalizate **Gura Văii și Hălmăcioaia**. Primește din Neamț **satele Balcani și Frumoasa** din comuna Tazlău; a nu le înscrie ca două comune întregi. | `TRANSFER_NOMINAL_1925_OCR`; 1929 și poligoanele comunale necertificate |
| **Botoșani** / `ohm-r2940712` | Relații nominalizate cu Iași (**Rediu, Comăndăreștii-Noi**, respectiv **Lupăria**), Dorohoi (**Vicoleni**, respectiv **Popeni**), județul Suceava (Bucovina: **Burdujeni**) și unități din Bălți. Direcția și categoria fiecărui sat se vor reverifica pe tabelele originale, OCR-ul intercalează coloane. | `TRANSFER_NOMINAL_1925_RECHECK_REQUIRED`; verificare facsimil obligatorie |
| **Covurlui** / `ohm-r2945088` | Anexa spune că se formează din **județul Covurlui existent**; nu identifică din această enumerare un transfer interjudețean explicativ pentru surplusul OHM/RoHGIS. | `NO_NAMED_1925_CHANGE_IN_COUNTY_SUMMARY`; 1929 încă necunoscut |
| **Dorohoi** / `ohm-r2937887` | Cedează **Verpolea** (sat) către Rădăuți și **Popeni** (sat) către Botoșani; primește **Cândești** (comună, din Siret), **Vicoleni** (sat, din Botoșani) și comune nominalizate din Hotin, inclusiv **Lopatnic, Bedragii-Noi, Pererita, Tetcani, Burlănești**. | `TRANSFER_NOMINAL_1925_OCR`; fără echivalare geom. |
| **Fălciu** / `ohm-r2943671` | Cedează către Tutova comunele **Stoeșești și Șuletea**, **fără satul Rășcani**; primește 11 comune din Cahul (Broșcoșești, Sărata-Răzeși, Pogonești, Gura-Cioarei, Călmățui, Leușeni, Minjir, Sărățeni, Orac, Covurlui, Tomai). | `TRANSFER_NOMINAL_1925_OCR`; hotarul Prutului necesită actul 1929 |
| **Iași** / `ohm-r2943493` | Schimburi cu Botoșani (satele **Rediu**, **Comăndăreștii-Noi**, **Lupăria**); primește din Vaslui **satul Mironeasa** și **comuna Schitu-Duca**; apar și comune din Bălți. | `TRANSFER_NOMINAL_1925_OCR`; 1929 necolationat |
| **Neamț** / `ohm-r2943485` | Cedează Fălticeni **Răucești, Timișești, Plăieșu, Țibucani, Păstrăveni**, către Roman **Budești-Ghicăi, Bozieni, Bârgăoani, Talpa**; primește de la Fălticeni **Farcașa, Borca, Mădei, Broșteni, Crucea**; primește de la Ciuc **Bicazul-Unguresc, Tulgheș, Corbu, Bilbor, Borsec** și schimbă unități cu Bacău. Verificarea tabelară va stabili dacă unele nume formează o comună compusă (de exemplu Borca–Mădei) sau sunt trecute separat. | `TRANSFER_NOMINAL_1925_OCR`; diferența geometrică mare nu poate fi corectată prin overlay |
| **Putna** / `ohm-r2943652` | Spre Râmnicu-Sărat: **Călieni, Nănești, Vulturu, Nămoloasa-Târg, Nămoloasa-Sat**; invers din Râmnicu-Sărat: **Mândrești, Faraoanele, Broșteni, Vârteșcoi**. | `TRANSFER_NOMINAL_1925_OCR`; hotare/sate verificare separată |
| **Roman** / `ohm-r2943496` | Primește din Neamț **Budești-Ghicăi, Bozieni, Bârgăoani, Talpa**; din Vaslui **satul Ezeru**. | `TRANSFER_NOMINAL_1925_OCR`; 1929 necolationat |
| **Suceava (Moldova)** / `ohm-r2940721` | Identitatea nominală din **1925** este **județul Fălticeni**, diferit de Suceava bucovineană. Fălticeni cedează Neamț **Farcașa, Borca, Mădei, Broșteni, Crucea**; cedează Câmpulung **Dorna, Neagra Șarului, Păltiniș, Șarul Dornei**; primește de la Suceava (Bucovina) **Bunești, Chilieni, Poieni**, din Gura Humorului **Băiașești** și de la Neamț cele cinci comune menționate mai sus. | `DISTINCT_1925_ENTITIES`; actul 1923 și 1929 încă lipsesc; OHM Suceava ≠ RoHGIS Suceava |
| **Tecuci** / `ohm-r2945087` | Enumerarea județeană din 1925 menține județul existent fără o mutare explicită în paragraful respectiv. | `NO_NAMED_1925_CHANGE_IN_COUNTY_SUMMARY`; 1929 și eroare de digitizare de separat |
| **Tutova** / `ohm-r2945089` | Primește de la Fălciu **Stoeșești și Șuletea**, fără satul Rășcani. | `TRANSFER_NOMINAL_1925_OCR`; trebuie verificat perimetrul fiecărei comune/sat |
| **Vaslui** / `ohm-r2943670` | Cedează Roman **satul Ezeru**, iar Iași **satul Mironeasa și comuna Schitu-Duca**. | `TRANSFER_NOMINAL_1925_OCR`; 1929 necolationat |

**Precizie:** aceste constatări se bazează pe enumerările publicate în originalul din 1925, accesate ca text OCR. Ele sunt **evidențe juridice nominale candidate** și nu certifică efectul exact asupra tuturor satelor, datelor de aplicare și contururilor. Compararea prospectivă se face cu **anexele tabulare 1925**, **decretul și rectificările 1929**, **harta originală 1928** și geometriile OHM/RoHGIS, în această ordine. Reconstituirea vizuală/scara hărții nu dă o limită juridică precisă la nivel comunal.

## 3. Precizie temporală

- Decretul 2465 a fost semnat **25.09.1925**, publicat **07.10.1925**. Expunerea de motive distinge începutul aplicării cadrului administrativ de funcționarea noilor circumscripții comunale și a finanțelor lor de la **01.01.1926**. **Nu se atribuie tuturor unităților aceeași dată efectivă fără articolul/anexa aplicabilă.**
- În 1925 existau simultan **Fălticeni** (Moldova) și **Suceava** (Bucovina); această observație dă numai un **terminus ante quem** pentru redenumirea din 1923, **nu data exactă a actului**.
- Fălticeni → Baia, asociat reformei 1929, este reținut ca succesiune istorică documentară, **nu editare definitivă de interval** până la colationarea M.O. nr. 274 și rectificărilor.

## 4. Reguli de protecție și criterii de admitere

**Statusul celor 13 cazuri:** `1925_NOMINAL_EVIDENCE_CANDIDATE`; `1929_ORIGINAL_UNVERIFIED`; `1923_DAY_UNVERIFIED`; `legalBoundaryCertified=false`; `geometrySharingAdmitted=false`; `sourcePeriod.end=null` (neschimbat).

Pentru promovare ulterioară a **unui transfer**, obligatorii: (1) copia verificată a actului și eventualelor rectificări; (2) unitatea identificată la **rangul contemporan** (sat/comună/plasă/județ) și părintele de atunci; (3) data intrării în vigoare per unitate; (4) continuitatea toponimică; (5) hotarul documentar din sursă cartografică suficient de detaliată; (6) audit GIS independent FIT/HOLDOUT, păstrând geometria-sursă.

**Interdicții:** NU modificați `sourcePeriod.end`, `geometryId`, poligoanele OHM/RoHGIS, identitățile entităților, relațiile părinte–copil sau modulul ACTUAL în baza acestui dosar. `IoU` și proximitatea sunt numai indicii spațiale. 1936 Neamț conține inclusiv propuneri neratificate, separate de mutările raportate retrospectiv. Colectivul RoHGIS de **494** plăși (1929–1933) nu este numărul certificat de **322** plăși în 1930.

## 5. Restanțe documentare individuale — HIST-OHM-TREE.7b

A. Recuperați facsimilul **M.O. 274/09.12.1929**, anexele integrale și **toate cele șapte rectificări**; comparați numele, rangul, județul vechi/nou și data schimbării pentru cele 13 cazuri.  
B. Recuperați actul original de **redenumire din 1923**, inclusiv articolul intrării în vigoare; nu deduceți data calendaristică din surse ulterioare contradictorii.  
C. Verificați vizual/tablolar paginile corespunzătoare ale **M.O. 220/07.10.1925** (inclusiv sat versus comună și cazurile compuse); stabiliți pentru fiecare mențiune imprimată pagina/coloana/linia.  
D. Georeferențiați independent harta originală **Teodorescu 1928**, cu holdout; hărțile Nacu 2012 se compară numai ca reconstrucții auxiliare.  
E. Actualizați sidecar-ul probatoriu individual abia după obținerea acestor acte; nu reutilizați geometrii pe baza unei simple asemănări de contur.

**Proveniență:** investigația continuă `docs/historical/reconciliation/HIST-OHM-TREE.6-DOCUMENTARY.md` și `public/data/historical/v1/reconciliation/ohm-rohgis-1930-documentary.json`, fără modificarea acestora.
