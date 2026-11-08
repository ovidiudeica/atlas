# English display names (EN-R1)

The Territorial Atlas uses **English presentation labels with ASCII transliteration** in its EN interface. This is an editorial choice for this atlas; it is **not** a claim that English-language sources such as Wikipedia always omit Romanian diacritics.

## Data protection

The certified 5 October 2026 OSM-Boundaries snapshot, its 4,283 catalog identities, official names, OSM source tags, NUTS/NTS and SIRUTA/CUATM identifiers, parent relationships and all geometry files are **immutable** in this change. Only `src/data/treeNames.mjs` determines the displayed label. `name:en` as originally recorded in OSM is preserved even if it contains diacritics.

## Display resolution

1. Reviewed English exonyms by stable Atlas ID (Bucharest, Gagauzia, Chisinau), plus distinct role-sensitive labels for the administrative and statistical units on the left bank.
2. Reviewed English geographical translations for Romanian NUTS 1 and NUTS 2 entities keyed by their official code (e.g. Macroregion Three, North-West, Bucharest-Ilfov).
3. Explicit Moldovan NTS labels already established in the application (West, East, North, Centre, South).
4. Existing English catalogue label, normally originating from OSM `short_name:en` or `name:en`.
5. If no specific English name exists: the local **proper toponym**, ASCII-transliterated for display; this is **not** represented as a verified translated English exonym. Administrative type-only prefixes/suffixes are dropped for concise tree labels.

Names such as `Brașov` → `Brasov`, `Fălești` → `Falesti`, and `Chișinău` → `Chisinau` are ASCII forms, not official renamings. Native names remain accessible in RO, source metadata and searchable aliases. An Atlas entity's official statistical code, rather than its spelling, decides whether a geographical region should be translated.

## Verification

`tests/english-territorial-names.test.mjs` checks all 4,283 EN display names, the unchanged catalog hash, source metadata, search aliases and representative exonyms. Chromium desktop/mobile smoke checks the English names actually rendered in both the tree and the details card. The previous regression tests that accidentally required Romanian names in EN have been brought into agreement.

## Source references

- European Commission, English Style Guide: https://commission.europa.eu/system/files/2023-11/styleguide_english_dgt_en.pdf
- European Commission, Country Compendium: https://commission.europa.eu/system/files/2023-11/styleguide_english_dgt_country_compendium_en.pdf
- OpenStreetMap multilingual names: https://wiki.openstreetmap.org/wiki/Multilingual_names
- English Wikipedia, Chișinău: https://en.wikipedia.org/wiki/Chi%C8%99in%C4%83u
- English Wikipedia, Gagauzia: https://en.wikipedia.org/wiki/Gagauzia

No automated Wikipedia/Wikidata title has been imported or substituted for an official name. New exonyms must be manually reviewed and added by Atlas ID or statistical code with source justification.
