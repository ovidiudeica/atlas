# SIM-R5 — auditul stemelor și drapelelor

Inventar exhaustiv, cercetare disponibilă și corecții conservatoare. Acest raport nu declară toate imaginile autentificate și nu echivalează o căutare sau o asociere Wikidata cu certificarea juridică.

## Bază și integritate

Pornire de la main verificat: `7288b44f2b0e355b4c4b585ee5b87e6574fae60b`. Catalogul are 4283 de identități exacte și 8566 de înregistrări distincte stemă/drapel. SHA256 al catalogului certificat: `1f930079194c92dc0e02d6e675165dddec6f49db0a62357bcc61be0705125482`. Geometriile, codurile, clasificările și relațiile părinte–copil nu au fost modificate. Cele 84 de fișiere protejate din manifest sunt confruntate cu bloburile Git ale bazei, inclusiv toate imaginile locale SIM-R2a.

SIM-R4 rămâne snapshot imuabil: 1518 steme, 306 drapele, 297 entități cu ambele, 2756 fără imagini și 1679 atribuiri CANDIDATE. Snapshotul corectat are 1517 steme, 306 drapele, 297 entități cu ambele și 2757 fără imagini.

## Rezultate

Au fost examinate 1824 atribuiri existente, prin verificări per-ID ale metadatelor, identităților, surselor și căutărilor documentare. Comparațiile grafice aprofundate sunt un subset documentat: 48 perechi de surse și 93 decizii per simbol, inclusiv verificarea geometrică a drapelului României. Pentru celelalte reprezentări fidelitatea față de o anexă actuală rămâne explicit neconfirmată.

| Verdict asupra imaginii inițiale | Număr |
| --- | --- |
| MISSING | 6742 |
| SOURCE_CORROBORATED | 1132 |
| CANDIDATE_UNVERIFIED | 683 |
| OUTDATED_VERSION | 2 |
| VERIFIED_OFFICIAL | 3 |
| HISTORICAL_ONLY | 1 |
| DISPUTED | 2 |
| MISATTRIBUTED | 1 |

Au fost eliminate 1 atribuiri și înlocuite 3 imagini. După corecții există 2 steme și 3 drapele cu reprezentarea curentă confirmată prin probele descrise. 1818 imagini păstrate nu au certificare completă. 45 reproduceri inițiale au drepturi neclarificate; acest verdict este separat de autenticitate. 1821 cazuri necesită o verificare suplimentară de identitate, versiune, drepturi sau alternativă pentru atribuirea eliminată.

Verdictul inițial OUTDATED_VERSION/HISTORICAL_ONLY rămâne în audit chiar după înlocuire; verdictul și drepturile imaginii recomandate sunt câmpuri separate. MISSING numără sloturile inițial nule, nu șterge istoricul corecției.

| Verdict în snapshotul curent | Număr |
| --- | --- |
| MISSING | 6743 |
| SOURCE_CORROBORATED | 1133 |
| CANDIDATE_UNVERIFIED | 683 |
| VERIFIED_OFFICIAL | 5 |
| DISPUTED | 2 |

## Jurisdicții și titulari

| Grup din catalog | Atribuiri examinate | Steme curente | Drapele curente | Steme confirmate | Drapele confirmate | Înlocuite | Eliminate |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Moldova | 387 | 197 | 190 | 2 | 2 | 2 | 0 |
| Nistrenia_de_facto | 2 | 1 | 1 | 0 | 0 | 0 | 0 |
| Romania | 1435 | 1319 | 115 | 0 | 1 | 1 | 1 |

Clasificarea de raportare urmează părinții administrativi certificați. Nistrenia de facto are aici 8 identități distincte, inclusiv cele șapte ADM5; simbolurile orașelor nu au fost propagate automat acestor unități. Separat, grupul recunoscut CUATM din stânga Nistrului are 80 identități, 7 steme și 7 drapele curente, incluse în Moldova. Acesta nu este reclasificat drept administrație de facto. Bender rămâne în propria identitate certificată; sursele de facto sunt marcate ca atare în decizia sa.

Găgăuzia este subset al Moldovei: 30 identități, 13 atribuiri examinate, 8 steme și 5 drapele curente; 1 stemă și 0 drapele confirmate. Stema UTA este coroborată cu legea și imaginea actuală a autorității; nuanțele drapelului diferă între SVG și GIF-ul instituțional și nu au fost inventate corecții de culoare.

## Corecții documentate

| Atlas ID | Simbol | Acțiune | Verdict inițial | Verdict imagine recomandată |
| --- | --- | --- | --- | --- |
| osm-r14772859 | coat | REMOVE | MISATTRIBUTED | null — substitut neutru |
| osm-r1216705 | flag | REPLACE | OUTDATED_VERSION | VERIFIED_OFFICIAL |
| osm-r19095396 | flag | REPLACE | OUTDATED_VERSION | VERIFIED_OFFICIAL |
| osm-r10494274 | coat | REPLACE | HISTORICAL_ONLY | SOURCE_CORROBORATED |

- Făurei, Neamț (SIRUTA 122613): fișierul descrie explicit Făurei, Brăila. Atribuirea a fost eliminată, cu imaginea veche și contradicția păstrate în audit.
- Hunedoara: stema istorică cu un singur câmp și corb străpuns de săgeată a fost înlocuită cu reproducerea compoziției din HG 685/1998. Documentul municipal folosit pentru comparație este intitulat proiect de statut; nu este prezentat drept act adoptat. Noua imagine are SOURCE_CORROBORATED, fără certificarea integrală a anexei naționale.
- Copanca și Vălcineț: reproducerile inițiale omiteau talpa albă de un sfert prevăzută și desenată în anexele prezidențiale. Noile PNG-uri sunt decupaje literale ale anexelor, redimensionate tehnic, cu coordonate și hashuri în replacement-provenance.json. Nu s-au redesenat simbolurile și nu s-au recolorat scanările.
- Jilava este păstrată: tokenul IL din numele fișierului nu prevalează asupra descrierii Ilfov și HG 1338/2022. Exemplul protejează împotriva eliminării automate după abrevieri.
- Câmpulung: PNG-ul, SVG-ul alternativ și descrierea municipală diferă asupra culorii și acvilei superioare; verdict DISPUTED, fără înlocuire inventată. Creditarea unor părți din logoul Lions Club impune separat RIGHTS_UNCLEAR pentru PNG.
- Drapelul Tălmaciu: descrierea înainte de 1918 contrazice indicii din reprezentarea încărcată în 2013 și utilizarea contemporană în articol. DISPUTED, păstrat; nu este eliminat doar din cauza titlului.
- Bender: autoritatea de facto documentează readoptarea unui desen istoric în 2003. Originea istorică nu este singură dovadă de utilizare exclusiv istorică. Versiunea și aplicabilitatea pentru identitatea recunoscută rămân neconfirmate.

## Cazuri prioritare și limite documentare

| Atlas ID | Act / referință | Concluzie |
| --- | --- | --- |
| osm-r377733 | HCGMB 47/31 January 2024 amending 76/1993 | Both baseline slots are null. The retrieved two-page decision changes the saint to Dimitrie cel Nou in monastic dress; its replacement graphic annex is not in the retrieved PDF. Preserve nulls, do not introduce the older soldier representation. |
| osm-r2248660 | HG 510/26 June 2026, MO 544/2 July 2026 | Primary act text recovered through legislative portal extraction; graphic annex retrieval failed. Coat was already null. Flag is independent: the new coat act does not demonstrate that the selected flag has been superseded. |
| osm-r2260187 | HG 228/16 April 2026, MO 315/21 April 2026 | Official legislative index corroborates the 2026 act. Full primary act/graphic retrieval failed. Existing coat and flag retained without a new official certification; no proven obsolete assignment is inferred. |
| osm-r59002 | Decree 721-X/7 August 2026; district decision 3/3/3 June 2026 | Official five-page decree and blazons recovered. Baseline slots are null. Symbol existence is documented, but no new reproduction is introduced in this audit without a reuse assessment. |
| osm-r1748490 | Decree 1475-VIII/2 March 2020; council decision 5/2/19 December 2019 | Official gazette index reconfirms decree identity. Fresh CNH coat bytes match the existing local JPEG. Full original decree graphic annex not recovered; source corroboration does not newly certify the entire legal chain. |
| osm-r1691801 | Vezi sursele per-ID | City and municipality are distinct certified IDs. Preserve the city assignment as unconfirmed; do not propagate the municipality's 2019 symbol to the city solely because both are named Chișinău. |
| osm-r90689 | Law 102/1992 as amended by 146/2016; Law 75/1994 as amended by 176/2023 and 12/2024 | Primary legislative texts checked. Crown introduced in 2016; current flag annex includes 2023 RGB values. Existing image bytes downloaded and hashed. No full primary coat annex comparison completed; do not claim full graphic certification. Actual selected coat inspected: crowned eagle, divided chest shield, sword and sceptre are present. Full primary graphic fidelity remains unconfirmed. |
| osm-r58974 | Law 32/7 March 2013; Law 217/17 September 2010, as cited by current presidency pages | Current primary descriptions checked; selected image bytes downloaded and hashed. Independent full annex/version-chain comparison remains incomplete. Actual selected coat inspected: eagle, divided ox-head shield, cross, olive branch and sceptre present; no independent full-annex certification. |
| osm-r65335 | Vezi sursele per-ID | Sources are explicitly de facto authority sources. Indexed constitutional/symbol descriptions corroborate use; presidential direct endpoint returned 404. Selected bytes downloaded and hashed. No international-recognition claim or automatic transfer to Moldova-recognized administrative IDs. Actual selected coat inspected: hammer/sickle, rising sun over river, agricultural wreath and trilingual ribbons. Corroboration concerns de facto use only. |

Taraclia: decretul 241-IX/22.11.2021 și anexele au fost recuperate. Stema are aceeași compoziție cu reproducerea districtului; proporția leului din drapel diferă între JPEG și anexă, astfel că drapelul rămâne SOURCE_CORROBORATED. Licențierea JPEG-urilor instituționale este evaluată separat.

Chișinău și sectoare: indexul Monitorului Oficial reconfirmă decretul 1475-VIII/2020; JPEG-ul CNH și planșa sursă au aceleași hashuri ca în SIM-R2a. Decodările independente ale JPEG-ului pot diferi cu până la 3/255 pe canal, deci nu sunt declarate identice pixel cu pixel. Anexa originală integrală a decretului rămâne necesară pentru certificarea completă. Un act pentru satul reședință nu este extins automat comunei: cazurile Gangura și Scumpia au această rezervă explicită. Cojușna este identificată în catalog drept sat, nu este reclasificată drept comună.

## Cele 18 entități exclusiv statistice

| Atlas ID | Denumire certificată | Căutare | Stemă | Drapel | Rezultat |
| --- | --- | --- | --- | --- | --- |
| stat-MD11 | Partea de Vest (partea dreapta a Nistrului) | SEARCH_EXECUTED | MISSING | MISSING | No own symbol established; both nulls preserved, not a claim of nonexistence. |
| stat-MD111 | Regiunea Nord | SEARCH_EXECUTED | MISSING | MISSING | No own symbol established; both nulls preserved, not a claim of nonexistence. |
| stat-MD112 | Regiunea Centru | SEARCH_EXECUTED | MISSING | MISSING | No own symbol established; both nulls preserved, not a claim of nonexistence. |
| stat-MD113 | Regiunea Sud | SEARCH_EXECUTED | MISSING | MISSING | No own symbol established; both nulls preserved, not a claim of nonexistence. |
| stat-MD12 | Partea de Est (partea stîngă a Nistrului) | SEARCH_EXECUTED | MISSING | MISSING | No own symbol established; both nulls preserved, not a claim of nonexistence. |
| stat-MD120 | Unitățile administrativ-teritoriale din stînga Nistrului | SEARCH_EXECUTED | MISSING | MISSING | No own symbol established; both nulls preserved, not a claim of nonexistence. |
| stat-RO1 | Macroregiunea Unu | SEARCH_EXECUTED | MISSING | MISSING | No own symbol established; both nulls preserved, not a claim of nonexistence. |
| stat-RO11 | Nord-Vest | SEARCH_EXECUTED | MISSING | MISSING | No own symbol established; both nulls preserved, not a claim of nonexistence. |
| stat-RO12 | Centru | SEARCH_EXECUTED | MISSING | MISSING | No own symbol established; both nulls preserved, not a claim of nonexistence. |
| stat-RO2 | Macroregiunea Doi | SEARCH_EXECUTED | MISSING | MISSING | No own symbol established; both nulls preserved, not a claim of nonexistence. |
| stat-RO21 | Nord-Est | SEARCH_EXECUTED | MISSING | MISSING | No own symbol established; both nulls preserved, not a claim of nonexistence. |
| stat-RO22 | Sud-Est | SEARCH_EXECUTED | MISSING | MISSING | No own symbol established; both nulls preserved, not a claim of nonexistence. |
| stat-RO3 | Macroregiunea Trei | SEARCH_EXECUTED | MISSING | MISSING | No own symbol established; both nulls preserved, not a claim of nonexistence. |
| stat-RO31 | Sud-Muntenia | SEARCH_EXECUTED | MISSING | MISSING | No own symbol established; both nulls preserved, not a claim of nonexistence. |
| stat-RO32 | Bucureşti-Ilfov | SEARCH_EXECUTED | MISSING | MISSING | No own symbol established; both nulls preserved, not a claim of nonexistence. |
| stat-RO4 | Macroregiunea Patru | SEARCH_EXECUTED | MISSING | MISSING | No own symbol established; both nulls preserved, not a claim of nonexistence. |
| stat-RO41 | Sud-Vest Oltenia | SEARCH_EXECUTED | MISSING | MISSING | No own symbol established; both nulls preserved, not a claim of nonexistence. |
| stat-RO42 | Vest | SEARCH_EXECUTED | MISSING | MISSING | No own symbol established; both nulls preserved, not a claim of nonexistence. |

Nu a fost stabilit un simbol propriu pentru niciuna. Aceasta este limita cercetării, nu dovada inexistenței juridice. Nu au fost atribuite simboluri istorice, naționale, ale județelor componente sau ale instituțiilor statistice.

## Acoperire pe tip și nivel

| Tip certificat | Atribuiri examinate | Steme curente | Drapele curente | Confirmate curente | Revizuire suplimentară |
| --- | --- | --- | --- | --- | --- |
| level_1_uat | 114 | 57 | 57 | 0 | 114 |
| commune_or_independent_village_uat | 94 | 49 | 45 | 2 | 92 |
| town_uat | 72 | 37 | 35 | 0 | 72 |
| district | 62 | 31 | 31 | 1 | 62 |
| municipality_or_city_uat | 25 | 13 | 12 | 0 | 25 |
| level_2_municipality | 6 | 3 | 3 | 0 | 6 |
| special_territorial_unit | 2 | 1 | 1 | 1 | 2 |
| subdivision_level_5 | 0 | 0 | 0 | 0 | 0 |
| chisinau_sector | 8 | 4 | 4 | 0 | 8 |
| unclassified | 2 | 1 | 1 | 0 | 2 |
| state | 4 | 2 | 2 | 1 | 3 |
| nistrenia_administrative | 2 | 1 | 1 | 0 | 2 |
| statistical_region | 0 | 0 | 0 | 0 | 0 |
| commune | 1042 | 1010 | 31 | 0 | 1042 |
| town | 203 | 185 | 18 | 0 | 203 |
| municipality | 106 | 82 | 24 | 0 | 106 |
| county | 81 | 40 | 41 | 0 | 81 |
| sector | 1 | 1 | 0 | 0 | 1 |

| Nivel administrativ | Atribuiri examinate | Steme curente | Drapele curente | Revizuire suplimentară |
| --- | --- | --- | --- | --- |
| 2 | 4 | 2 | 2 | 3 |
| 3 | 2 | 1 | 1 | 2 |
| 4 | 151 | 75 | 76 | 151 |
| 5 | 0 | 0 | 0 | 0 |
| 7 | 10 | 5 | 5 | 10 |
| 8 | 1656 | 1433 | 222 | 1654 |
| 9 | 1 | 1 | 0 | 1 |
| null | 0 | 0 | 0 | 0 |

## Surse și acces

| Operațiune / probă | Număr |
| --- | --- |
| wikidataEntities | 1542 |
| commonsFiles | 2268 |
| wikipediaAttempts | 38494 |
| wikipediaRetrieved | 38494 |
| documentSearchEntities | 1547 |
| armorialPages | 174 |
| presidentialDecreePDFs | 61 |
| independentImageSHA256 | 195 |
| sourceReportedOriginalSHA1 | 1780 |

Cele 1207 erori instituționale SIM-R4 sunt cazuri titular+URL, pentru 1200 de titulari distincți: 300 adrese recuperate, 907 încă inaccesibile. Variantele de protocol/gazdă, URL-urile actuale Wikidata și paginile secundare sunt în registrul separat. Serviciul de disponibilitate Wayback a răspuns 429; nu sunt pretinse cercetări de arhivă care nu au avut loc.

Istorice de articole: {"RETRIEVED":1387,"NO_EXACT_LINKED_MATCHING_ARTICLE":140}. Sunt cel mult cinci revizii ale unui articol legat exact și care folosește fișierul selectat, nu o certificare a întregului istoric sau examinarea fiecărui diff. Stările fără articol corespunzător, rate-limited și deferred rămân distincte. Hashurile Commons sunt raportate de sursă pentru original; SHA256 independente există numai pentru descărcările reușite. Restricțiile HTTP nu sunt dovezi de atribuire greșită.

## Registre și verificare tehnică

- Registru inițial complet: public/data/symbols/audit-initial.json.gz.
- Registru final per-ID și per simbol, cu contradicții, drepturi, hashuri, imagini vechi/recomandate și limite: public/data/symbols/audit.json.gz.
- Snapshot corectat: public/data/symbols/registry-current.json.gz; snapshotul SIM-R4 nu este suprascris.
- Export tabelar complet: docs/audits/sim-r5/per-symbol-verdicts.csv; rezultate calculate: SIM-R5-RESULTS.json.
- Sursele și deciziile documentate: docs/audits/sim-r5/; reluare/reproducere: scripts/audit/sim-r5/README.md.

Testele obligatorii sunt npm test, npm run build și suita Chromium completă scripts/ci/browser-smoke.mjs. Acestea verifică inventarul, nulurile, sursele, lipsa certificărilor automate, conservarea, corecțiile, aceeași stemă în arbore și antet, lipsa substituirii cu drapel, scalarea desktop/mobil, accesibilitatea, fallbackul și încărcarea progresivă. Verificarea CI a SHA-ului exact și publicarea se consultă în [workflow-ul repository-ului](https://github.com/ovidiudeica/atlas/actions/workflows/website.yml). Integrarea folosește exclusiv branch-ul sim-r5-authenticity și protecțiile main.

Concluzia rămâne limitată la probele efectiv documentate. Cazurile CANDIDATE_UNVERIFIED, DISPUTED și RIGHTS_UNCLEAR sunt păstrate pentru cercetare suplimentară, fără certificări inventate.
