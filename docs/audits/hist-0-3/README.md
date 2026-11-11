# HIST-0.3 — Audit editorial al inventarului OpenHistoricalMap

**Data evaluării:** 11 noiembrie 2026. **Baza:** main SHA 7f49e880c971e6e18bf05071b883dcf8a701c977. **Date OHM:** interogări live din 10 noiembrie 2026 (snapshot de referință 2026-11-10T19:18:52Z).

**Verdict: HIST-0.3 EDITORIAL_INDEX_COMPILED / USER_SELECTION_PENDING.** Registru de examinare, NU decizie de integrare. Nicio geometrie OHM sau ACTUAL nu a fost creată, corectată, decupată sau importată. Nu s-a proiectat niciun arbore și nu s-a modificat interfața.

## 1. Univers și limite

Au fost examinate **905 relații OHM** din lotul HIST-0.2, fiecare păstrată cu ID-ul ei original și intervalul temporal. Lotul provine dintr-un inventar brut de 2.919 relații în dreptunghiul exploratoriu. Screeningul geometric anterior a identificat **643** variante cu intersecție față de o mască de studiu provizorie, **218** fără intersecție față de acea mască și **44** cu geometrie neconcludentă. Aceste rezultate NU sunt numărul definitiv al entităților din perimetrul natural Tisa–Carpați–Bugul de Sud–Dunăre–Balcani–Marea Neagră. Nistrul este reper interior.

Există și ways administrative, obiecte istorice non-administrative și elemente arheologice inventariate separat; ele nu au fost incluse automat în cele 905 relații. Un simplu segment de frontieră nu devine entitate istorică independentă.

## 2. Tipologie istorică provizorie

Etichetele sunt clasificate prin border_type când există, apoi prin place. Admin_level este conservat ca atribut OHM, fără a fi transpus asupra nivelelor actuale ale Atlasului. Categoriile sunt indicații editoriale, nu verdicte juridice.

| Etichetă de clasificare OHM | Număr variante |
|---|---:|
| NECLASIFICAT | 177 |
| IMPERIU | 153 |
| COMITAT_JUDET | 115 |
| REGAT | 81 |
| STAT_NESPECIFICAT | 76 |
| DISTRICT | 66 |
| STATUT_NECALIFICAT | 47 |
| OBLAST | 33 |
| UEZD | 29 |
| REPUBLICA_SOVIETICA_FEDERATIVA | 27 |
| REPUBLICA | 21 |
| PROVINCIE | 12 |
| PRINCIPAT | 9 |
| REPUBLICA_SOVIETICA | 9 |
| VOIEVODAT | 8 |
| CERC | 8 |
| EIALET | 7 |
| DUCAT | 4 |
| OBIECT_ISTORIC_NETERITORIAL | 4 |
| FORMAȚIUNE_IPOTETICA | 3 |
| HANAT | 3 |
| GUBERNIE | 2 |

Total: **30 clase de lucru**. **177** variante sunt NECLASIFICAT și încă **47** sunt STATUT_NECALIFICAT. Nu li se va atribui automat o categorie administrativă. Același admin_level în imperii diferite nu descrie obligatoriu aceeași categorie juridică.

## 3. Perioade de examinare (încadrări multiple)

O relație poate intersecta mai multe epoci; totalurile nu se însumează la 905. Intervalele sunt deduse numai din start_date și end_date declarate în OHM. Pentru datele fără sfârșit declarat, clasificarea în epocile ulterioare este doar o proiecție de indexare.

| Interval editorial | Variante OHM care ating intervalul | Din acestea, intersecție DRAFT |
|---|---:|---:|
| Antichitate, până în 476 | 62 | 42 |
| Evul Mediu, 477–1492 | 74 | 54 |
| 1493–1789 | 108 | 77 |
| 1790–1918 | 465 | 351 |
| 1919–1945 | 292 | 199 |
| 1946–1991 | 95 | 85 |
| 1992–2026 | 30 | 28 |

## 4. Exemple pentru consultare — fără selecție

| Grup de examinare | Relații OHM de exemplu |
|---|---|
| Dacia și provinciile romane | [OHM 2684680](https://www.openhistoricalmap.org/relation/2684680), [OHM 2684675](https://www.openhistoricalmap.org/relation/2684675), [OHM 2849331](https://www.openhistoricalmap.org/relation/2849331), [OHM 2849328](https://www.openhistoricalmap.org/relation/2849328) |
| Țara Românească | [OHM 2694164](https://www.openhistoricalmap.org/relation/2694164), [OHM 2929115](https://www.openhistoricalmap.org/relation/2929115), [OHM 2929116](https://www.openhistoricalmap.org/relation/2929116), [OHM 2929117](https://www.openhistoricalmap.org/relation/2929117) |
| Țara Moldovei | [OHM 2694163](https://www.openhistoricalmap.org/relation/2694163), [OHM 2746689](https://www.openhistoricalmap.org/relation/2746689) |
| Transilvania | [OHM 2690518](https://www.openhistoricalmap.org/relation/2690518), [OHM 2747433](https://www.openhistoricalmap.org/relation/2747433), [OHM 2829384](https://www.openhistoricalmap.org/relation/2829384), [OHM 2878295](https://www.openhistoricalmap.org/relation/2878295) |
| Bucovina și Districtul Bucovina | [OHM 2746380](https://www.openhistoricalmap.org/relation/2746380), [OHM 2746744](https://www.openhistoricalmap.org/relation/2746744), [OHM 2684081](https://www.openhistoricalmap.org/relation/2684081), [OHM 2746401](https://www.openhistoricalmap.org/relation/2746401) |
| Gubernia Basarabia | [OHM 2694153](https://www.openhistoricalmap.org/relation/2694153), [OHM 2694154](https://www.openhistoricalmap.org/relation/2694154) |
| Banatul Timișoarei | [OHM 2746573](https://www.openhistoricalmap.org/relation/2746573), [OHM 2747562](https://www.openhistoricalmap.org/relation/2747562) |
| Țara Chioarului | [OHM 2747434](https://www.openhistoricalmap.org/relation/2747434), [OHM 2747435](https://www.openhistoricalmap.org/relation/2747435) |
| Comitate / județe istorice | [OHM 2928936](https://www.openhistoricalmap.org/relation/2928936), [OHM 2928934](https://www.openhistoricalmap.org/relation/2928934), [OHM 2829528](https://www.openhistoricalmap.org/relation/2829528) |
| Uezduri din Basarabia și vecinătate | [OHM 2962384](https://www.openhistoricalmap.org/relation/2962384), [OHM 2962385](https://www.openhistoricalmap.org/relation/2962385), [OHM 2962382](https://www.openhistoricalmap.org/relation/2962382) |
| Principatele Unite | [OHM 2692354](https://www.openhistoricalmap.org/relation/2692354), [OHM 2746400](https://www.openhistoricalmap.org/relation/2746400) |
| Regatul României | [OHM 2692219](https://www.openhistoricalmap.org/relation/2692219), [OHM 2693259](https://www.openhistoricalmap.org/relation/2693259), [OHM 2693255](https://www.openhistoricalmap.org/relation/2693255) |
| Principatul și Regatul Bulgariei | [OHM 2854742](https://www.openhistoricalmap.org/relation/2854742), [OHM 2742283](https://www.openhistoricalmap.org/relation/2742283) |
| RSS Moldovenească | [OHM 2694777](https://www.openhistoricalmap.org/relation/2694777) |
| Oblasturi istorice sud-ucrainene | [OHM 2960607](https://www.openhistoricalmap.org/relation/2960607), [OHM 2960416](https://www.openhistoricalmap.org/relation/2960416), [OHM 2960355](https://www.openhistoricalmap.org/relation/2960355) |
| Județe din administrația românească de la est de Nistru | [OHM 2698191](https://www.openhistoricalmap.org/relation/2698191), [OHM 2698192](https://www.openhistoricalmap.org/relation/2698192), [OHM 2698193](https://www.openhistoricalmap.org/relation/2698193) |

Aceste exemple nu înseamnă aprobarea entităților și nu implică importarea unor imperii ori a teritoriilor lor integrale.

## 5. Identitate, schimbări de nume, cronologie

Din cele 905 relații rezultă **364 grupări de nume**, care NU echivalează cu entități distincte. Au fost identificate **26 valori Wikidata prezente sub etichete diferite**, **10 grupuri cu același nume dar identificatori Wikidata diferiți** și **30 suprapuneri între intervalele cu aceeași etichetă la nivel de an**. Acestea sunt semnale de examinare, nu erori dovedite.

Cazuri de urmărit: Q971609 este asociat în OHM cu Dacia, Dacia Superior, Dacia Inferior, Dacia Apulensis și Dacia Porolissensis; Q875795 cu Comitatul Trei Scaune și Comitatul Ciuc; Q2620867 cu Regiunea Ismail și Akkerman Oblast; Q170895 cu RSS Moldovenească și Republic of Moldova. NICIO unificare sau schimbare de Wikidata nu este autorizată pe baza acestei liste.

## 6. Proveniență și calitatea datelor

Din 905 relații, **525** au un avertisment fixme:s și **210** au un câmp de sursă identificat la nivelul relației. Absența sursei pe relație nu exclude existența unei surse pe un way component. Denumirile RO/EN au fost preluate exclusiv din OHM, fără traduceri sintetice. Etichetele OHM nu certifică situația juridică sau precizia istorică.

Documentație OHM: [limite administrative](https://wiki.openstreetmap.org/wiki/OpenHistoricalMap/Boundaries), [date și etichete](https://wiki.openstreetmap.org/wiki/OpenHistoricalMap/Tags), [surse](https://wiki.openstreetmap.org/wiki/OpenHistoricalMap/Tags/Key/source), [licențiere](https://www.openhistoricalmap.org/copyright).

## 7. Lista de examinare și lacunele

Registrul thematic-review-worklist.csv organizează **37 grupe de lucru**. Sunt grupări editoriale de navigare, nu arbori și nu identități juridice. Țara Moldovei (2 versiuni) este separată de RSS Moldovenească. Județele administrației românești din 1941–1944 (Jugastru, Tulcin, Moghilău) sunt separate de unitățile germane de ocupație.

Nu au fost identificate sub denumiri explicite în acest subset de 905: **Dobrogea regională; Bugeacul ca regiune; RASS Moldovenească; Guvernământul Transnistriei ca întreg**. Aceasta NU demonstrează absența lor din întreaga bază OHM: pot exista alte denumiri, ways, clasificări și relații neextrase.

## 8. Ce urmează

Păstrăm toate variantele temporale și înscrierile incomplete. Următoarea etapă este **selecția explicită a utilizatorului**, cu opțiunea de a examina, amâna sau exclude fiecare familie. Doar după selecție definim relațiile istorice părinte–copil, arborele/arborii și designul modulului ISTORIC.

Fișierele aferente: editorial-per-id-905.csv, typologies-summary.csv, epochs-overlap.csv, thematic-review-worklist.csv, name-groups-not-identities.csv și cele trei registre de conflicte/temporalitate, plus manifest.json.
