# HIST-0.4c — completare arhivistică țintită și control independent

**Data:** 11 noiembrie 2026. **Bază verificată:** `main@fa550a7dbaf52ccb97861078810eb617abe7042f`, PR #92. **Statut:** `INDEPENDENT_REGISTER_RECHECK_PASS / P0_OPEN / ZERO_ADMISSIONS`.

Această completare este **documentație de cercetare**, nu un nou certificat geometric. Nu schimbă verdictul, prioritățile, datele sau fișierele inițiale HIST-0.4c. Nu a fost creată, decupată, modificată sau importată nicio geometrie. Arborii și UI rămân nemodificate.

## 1. Recontrolul registrului HIST-0.4c

- **37/37 ID-uri OHM** unice și prezente în registrul HIST-0.4b; toate fișele au `documentary_research_completed=true`, `import_authorization=NO`, `independent_legal_geometric_certification=NOT_CERTIFIED`.
- Repartiția din rândurile CSV corespunde manifestului: **3 P0, 25 P1 și 9 P2**.
- **6/6** fișiere documentare cu SHA256 enumerat în manifest au hash identic cu probele locale; registrele P0 (3) și excepțiile transversale (7) sunt prezente; fiecare cod de sursă din dosarele per-ID se rezolvă la registrul bibliografic.
- Registrul include **18 intrări de surse, dar 17 URL-uri distincte**: S09 și S18 trimit la același catalog de fonduri al Arhivelor Voivodinei. Distincția este bibliografică/editorială, **nu** 18 publicații digitale independente.
- CI și GitHub Pages pentru `main@fa550a7d...` au `success`. Aceste verificări certifică integrarea tehnică, nu adecvarea istorică a frontierelor.

## 2. Reper arhivistic suplimentar pentru Țara Chioarului

**Înregistrare complementară S19-ADDENDUM (nu modifică S01–S18):**

- **Autor:** Lucia-Augusta Șerdan.
- **Titlu:** „Tipuri de instrumente contemporane de evidență și informare existente în tezaurul arhivistic clujean”.
- **Publicație:** *Buletin de informare și documentare arhivistică*, Arhivele Naționale ale României, 2005, pp. **45–46** (paginația tipărită).
- **Sursă:** https://biblioteca-digitala.ro/reviste/buletin-informare-documentare-arhivistic/buletin-informare-documentare-arhivistica_2005.pdf
- **Grad probatoriu:** `ARCHIVAL_FINDING_AID_SECONDARY_SOURCE / INDEX_TEXT_EXTRACTED / ORIGINAL_RECORDS_NOT_EXAMINED / NO_GIS_CERTIFICATION`.

Textul indexat al lucrării menționează Fondul **Districtul Chioar** la Direcția Județeană Cluj a Arhivelor Naționale, cu instrumente de evidență și indexe pentru perioada 1851–1876. Sunt indicate subcercurile Șomcuta Mare, Copalnic Mănăștur, Buteasa și plășile Șomcuta Mare, Berchez, Mireșul Mare, Șoimușeni, Vad, Bojul Mare. **Acestea sunt nume administrative din document, nu noduri ale unui arbore HISTORIC aprobat.**

### Cote de arhivă pentru recuperarea originalelor

| Cota citată în publicația din 2005 | Document indicat | Ce poate fi verificat |
|---|---|---|
| Fond Districtul Chioar, nr. **10/1851** | Registru administrativ, subcercul Buteasa | Funcționare administrativă în 1851 |
| Fond Districtul Chioar, nr. **126/1861** | Registru pentru cauze civile, plasa Berchez | Activitate judiciară în 1861 |
| Fond Districtul Chioar, nr. **206/1863** | Registru prezidial al Districtului Chioar | Activitatea districtului în 1863 |
| Fond Districtul Chioar, nr. **425/1875** | Registrul inginerului | Posibilă urmă către planuri teritoriale |
| Fond Districtul Chioar, nr. **427/1876** | Registrul inginerului | Posibilă urmă către planuri de reorganizare |

**Control de corroborare:** *Izvoare de demografie istorică*, vol. II, Arhivele Statului, 1987, pp. 28–29, descrie districtul Chioar în 1839 și împărțirea din 1876 între Solnoc-Dăbâca și Sătmar, cu grupuri de 48, respectiv 43 comune. URL: https://biblioteca-digitala.ro/reviste/carte/arhivele-nationale/dl.asp?filename=fenesan_izvoare-demografie-istorica_vol-II_XlX_transilvania_1987.pdf

**Limită de verificare:** extrasele bibliografice au fost consultate prin indexare web; încercarea de captură vizuală a PDF-ului a eșuat, iar descărcarea directă în mediul local a primit HTTP 403 (deși HEAD a răspuns HTTP 200). Nu deținem în acest audit o copie a PDF-ului cu hash verificat și nu pretindem că am verificat fizic originalele de arhivă. Cotele sunt **piste de achiziție/verificare**, nu certificate asupra perimetrului.

## 3. Actualizarea evaluării P0 — fără reclasificare sau completări artificiale

| OHM | Informație nouă | Verdict neschimbat |
|---|---|---|
| [2747435](https://www.openhistoricalmap.org/relation/2747435) — Chioar 1650–1851 | Indicii suplimentare pentru evidența administrativă din 1851 | **P0 deschis**: cei 15 membri `way` fără surse; geografia istorică neprobată |
| [2747434](https://www.openhistoricalmap.org/relation/2747434) — Chioar 1860–1876 | Indicii pentru registre 1861, 1863, 1875, 1876 | **P0 deschis**: contur fără surse; lacună OHM 3.517 zile între variante |
| [2747433](https://www.openhistoricalmap.org/relation/2747433) — Transilvania 1711–1732 | Nicio dovadă nouă asupra anului 1732 | **P0 deschis**: `end_event` se referă la Compromisul din 1867 |

**Interpretare:** existența unei administrații într-un an nu permite interpolarea intervalului OHM lipsă și nici adoptarea aceleiași geometrii pentru toată perioada. Niciun contur nu a fost ajustat sau creat. Sursa pentru fiecare segment și actul de delimitare rămân de obținut.

## 4. Acțiuni probatorii permise ulterior

- Recuperarea **copiilor documentelor arhivistice identificate prin cote**, plus cataloagele de planuri și hărți ale inginerului districtual (1875–1876).
- Identificarea actelor originale despre organizarea Chioarului între 1851 și 1860, fără umplerea automată a lacunei temporale OHM.
- Confruntarea documentelor istorice și cartografice cu **fiecare membru al contururilor OHM originale**, fără editarea datelor.

**Poartă neschimbată:** `HIST-0.4c DOCUMENTARY_RESEARCH_COMPLETED_WITH_OPEN_PROBATIVE_GAPS`; **0/37** frontiere istorice certificate, **0/37** variante admise la import.