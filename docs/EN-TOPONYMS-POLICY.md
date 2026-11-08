# English display names (EN-R1 / EN-R2)

The Territorial Atlas uses **English presentation labels with ASCII transliteration** in its EN interface. This is an editorial choice for this atlas; it is **not** a claim that English-language sources such as Wikipedia always omit Romanian diacritics.

## Data protection

The certified 5 October 2026 OSM-Boundaries snapshot, its 4,283 catalog identities, official names, OSM source tags, NUTS/NTS and SIRUTA/CUATM identifiers, parent relationships and all geometry files are **immutable** in this change. Display-only name overrides and role descriptions live in `src/data/treeNames.mjs`; distinct sibling descriptors are shown separately in the UI. No catalog, source record, parent ID or geometry was edited. `name:en` as originally recorded in OSM is preserved even if it contains diacritics.

## Display resolution

1. Reviewed English exonyms and reconciled toponyms by stable Atlas ID (Bucharest, Gagauzia, Chisinau, Floresti-Stoenesti, Camenca, Ribnita, Dubasari, Slobozia, Chitcani and Hlinaia), plus role-sensitive labels for administrative, statistical and de facto left-bank entities.
2. Reviewed English geographical translations for Romanian NUTS 1 and NUTS 2 entities keyed by their official code (e.g. Macroregion Three, North-West, Bucharest-Ilfov).
3. Explicit Moldovan NTS labels already established in the application (West, East, North, Centre, South).
4. Existing English catalogue label, normally originating from OSM `short_name:en` or `name:en`.
5. If no specific English name exists: the local **proper toponym**, ASCII-transliterated for display; this is **not** represented as a verified translated English exonym. Administrative type-only prefixes/suffixes are dropped for concise tree labels.

Names such as `Brașov` → `Brasov`, `Fălești` → `Falesti`, and `Chișinău` → `Chisinau` are ASCII forms, not official renamings. Native names remain accessible in RO, source metadata and searchable aliases. An Atlas entity's official statistical code, rather than its spelling, decides whether a geographical region should be translated.

## EN-R2: provenance, ambiguity, and distinct jurisdiction

- `stat-RO31` is displayed as **South-Muntenia** in the Atlas English descriptive layer, following the European Commission Country Compendium; the official NUTS original remains available unchanged. NUTS proper names are generally not translated when cited as NUTS names.
- `osm-r13799978` is **Floresti-Stoenesti** (RO **Florești-Stoenești**) and is not the separate commune `osm-r13799794` (**Stoenești**). This corrects an atlas display label, not an OSM source identity.
- Six left-bank labels choose English ASCII presentations of documented Romanian toponyms over Russian-derived English labels already in OSM. All original `name:en`/`short_name:en` and `shortName.en` fields remain intact and searchable as aliases.
- The original audit found 10 groups with identical EN names among siblings (22 entities). Restoring Florești-Stoenești resolves one group; the **remaining 9 groups (20 entities)** are distinguished by separately displayed *officially recorded type*, then a unique registry code or immutable OSM relation ID. None is artificially renamed.
- The labels **Pridnestrovie** (de facto separately administered territory), **ATULBD** (Moldovan administrative units), and **Transnistria** (NTS statistical region) remain distinct. Detail cards explicitly explain their statuses without implying recognition of statehood. **ATULBD** expands to **Administrative-Territorial Units of the Left Bank of the Dniester**.
- The grammatical detail/search label is **City of Chisinau**, while the nested tree keeps **Chisinau**. The native official name stays in the `Official name` metadata field; navigation, country names and EN tooltips are localized.

The UK PCGN Moldova factfile recommends authoritative Romanian names *with diacritics*. Atlas ASCII rendering is a **separate editorial convention**, not an assertion about official English or UK transliteration.

## Verification

`tests/english-territorial-names.test.mjs` checks all 4,283 EN display names, the unchanged catalog hash, source metadata, search aliases and representative exonyms. Chromium desktop/mobile smoke checks the English names actually rendered in both the tree and the details card. The previous regression tests that accidentally required Romanian names in EN have been brought into agreement.

## Source references

- European Commission, English Style Guide: https://commission.europa.eu/system/files/2023-11/styleguide_english_dgt_en.pdf
- European Commission, Country Compendium: https://commission.europa.eu/system/files/2023-11/styleguide_english_dgt_country_compendium_en.pdf
- OpenStreetMap multilingual names: https://wiki.openstreetmap.org/wiki/Multilingual_names
- English Wikipedia, Chișinău: https://en.wikipedia.org/wiki/Chi%C8%99in%C4%83u
- English Wikipedia, Gagauzia: https://en.wikipedia.org/wiki/Gagauzia
- UK PCGN, Moldova Toponymic Factfile (2024): https://assets.publishing.service.gov.uk/media/6634e8f21834d96a0aa6d0ed/Moldova_Toponymic_Factfile.pdf
- Florești-Stoenești commune statute: https://staging.floresti-stoenesti.ro/wp-content/uploads/2021/02/HCL14-25.02.2021.pdf
- European Commission Country Compendium (21 November 2025, Romania p. 125): https://knowledge-centre-translation-interpretation.ec.europa.eu/sites/default/files/ckeditor5-files/styleguide_english_dgt_country_compendium_en.pdf

No automated Wikipedia/Wikidata title has been imported or substituted for an official name. New exonyms must be manually reviewed and added by Atlas ID or statistical code with source justification.
