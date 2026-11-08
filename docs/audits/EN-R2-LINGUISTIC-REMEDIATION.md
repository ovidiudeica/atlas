# EN-R2: linguistic corrections and verified presentation identities

**Certified baseline:** `main` at `2429b65b5341d9a227a807f5f59aa030c146b5d3`.
**Scope:** 4,283 Atlas entities (4,265 administrative, 18 statistical). Presentation only; no modification to the catalog, geometries, source tags, registry codes or parent relations.

## EN-R2a — certain corrections

| Source identity | EN before | EN after | Evidence |
|---|---|---|---|
| `stat-RO31` | South Muntenia | **South-Muntenia** | EC Country Compendium, descriptive EN NUTS2 rendering |
| `osm-r13799978` | Stoenesti | **Floresti-Stoenesti** | Own commune statute; also RO = Florești-Stoenești |
| `osm-r13799794` | Stoenesti | **Stoenesti** (unchanged) | Separate Giurgiu commune |
| Card Country field | România / Republica Moldova | **Romania / Republic of Moldova** | English UI |
| Administrative parent link | Original officialName | **English display label** | Localized navigation, immutable official record |

## EN-R2b — independently reviewed toponyms

| Atlas ID | Old EN | New EN (ASCII) | Source retained |
|---|---|---|---|
| `osm-r1702216` | Kamenka | **Camenca** | `Kamenka District` |
| `osm-r1702217` | Rybnitsa | **Ribnita** | `Rybnitsa District` |
| `osm-r1702215` | Dubossary | **Dubasari** | `Dubossary District` |
| `osm-r1702218` | Slobdzeya | **Slobozia** | `Slobdzeya District` |
| `osm-r6879649` | Kitskany | **Chitcani** | `Kitskany` |
| `osm-r8291058` | Glinoye | **Hlinaia** | `Glinoye` |

Source forms are indexed as search aliases. PCGN recommends Romanian names for Moldova, including the left bank, and cross-references Russian forms where informative. The Atlas's ASCII style is editorial, not mandated by PCGN.

## EN-R2c — 9 remaining sibling homonym groups (20 entities)

Original EN-R2 audit found **10 groups / 22 entities**. The Giurgiu case is resolved via restored full commune toponym. For the remaining groups, the tree's geographical `.node-name` is kept verbatim; a secondary small hint and an accessible label disambiguate identities. If recorded type alone is not unique, use a distinct official registry code or immutable OSM relation ID.

| Group | Exact immutable OSM Atlas IDs |
|---|---|
| Cornesti | 10624607, 10624608 |
| Tintareni | 12496850, 19090932 |
| Ocnita | 19038433, 19038440 |
| Varatic | 19045240, 19045254 |
| Donduseni | 19055800, 19055801, 19055814 |
| Drochia | 19068255, 19068260 |
| Ghindesti | 19072238, 19072257 |
| Marculesti | 19072254, 19072273 |
| Recea | 19100165, 19100169, 19100182 |

## EN-R2d — decisions and context

- `osm-r65335` remains **Pridnestrovie**, the separately administered de facto entity; its caption expressly says no statehood recognition is implied.
- `osm-r2607033` remains **ATULBD**, explicitly expanded as *Administrative-Territorial Units of the Left Bank of the Dniester* in Moldova's administration.
- `stat-MD120` remains **Transnistria** as the statistical left-bank region, not an administrative sovereign unit.
- `osm-r1748490` remains **Chisinau** in the nested tree but **City of Chisinau** in the standalone detail and search context.
- The official-name field preserves the native text and diacritics. Navigational tooltip text follows EN.

## Regression and data-protection gates

- `tests/en-r2a-presentation.test.mjs` checks exact ID and original official names for the corrected commune and RO31.
- `tests/en-r2b-toponym-reconciliation.test.mjs` checks all six display corrections, original OSM aliases and de facto/de jure separation.
- `tests/en-r2c-homonyms.test.mjs` enumerates the exact nine groups and demands 20 distinct contextual descriptors.
- `tests/en-r2d-context.test.mjs` validates all three role-specific notes, Romanian counterparts and Chisinau.
- `tests/english-territorial-names.test.mjs` runs ASCII and immutable catalog SHA-256 checks across all 4,283 entities. The exact catalog SHA-256 must remain `1f930079194c92dc0e02d6e675165dddec6f49db0a62357bcc61be0705125482`.
- Full Node tests, TypeScript + Vite build, desktop and mobile Chromium smoke, and GitHub Pages are release gates. Never represent a skipped or pending check as successful.

**Limitation:** A no-diacritics label for one of the 4,029 administrative units lacking an English OSM name tag is not, by itself, an individually certified English toponym. Further semantic name-by-name research is separate from these specific verified corrections.

## Authorities

1. [European Commission Country Compendium, 21 November 2025, Romania p. 125](https://knowledge-centre-translation-interpretation.ec.europa.eu/sites/default/files/ckeditor5-files/styleguide_english_dgt_country_compendium_en.pdf).
2. [UK PCGN Moldova Toponymic Factfile, 2024, pp. 1–4](https://assets.publishing.service.gov.uk/media/6634e8f21834d96a0aa6d0ed/Moldova_Toponymic_Factfile.pdf).
3. [Florești-Stoenești commune statute](https://staging.floresti-stoenesti.ro/wp-content/uploads/2021/02/HCL14-25.02.2021.pdf).
4. [Getty TGN Chițcani variant list](https://www.getty.edu/vow/TGNFullDisplay?english=Y&subjectid=1055268).
