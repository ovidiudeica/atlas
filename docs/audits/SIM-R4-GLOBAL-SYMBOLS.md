# SIM-R4 — Global territorial symbols

Base: `02a96733e919be8af4db4c2f7216eecd2dc9e1da` (SIM-R3.1). Dedicated branch: `sim-r4-global-symbols`.

All 4,283 certified entities have one exact-ID registry row, separate coat/flag fields, explicit nulls, provenance and discovery state. No catalog, geometry, identifier, code or parent relationship was changed.

| Territory | Entities | Coat | Flag | Both | Neither | Any image |
|---|---:|---:|---:|---:|---:|---:|
| Moldova | 1034 | 159 | 161 | 140 | 854 | 17.41% |
| Nistrenia | 8 | 1 | 1 | 1 | 7 | 12.5% |
| Romania | 3241 | 1147 | 112 | 83 | 2065 | 36.29% |

Statistical-only entities are included in the territory totals above: 18 processed; no own symbols selected. Statistical regions do not inherit administrative or historical imagery.

## Registry and provenance

- `public/data/symbols/registry.json.gz`: complete inventory, selected symbols, all candidate records, Wikipedia revisions/languages, Wikidata statements, Commons metadata, source errors and identity review notes. Gzip JSON is an audit download; it is not loaded during normal browsing.
- `src/data/globalSymbolSelections.mjs`: generated compact presentation mapping. Only visible tree/card images are requested, using native lazy loading.
- `docs/audits/SIM-R4-IDENTITIES.json`: exact P402/OSM and P843/SIRUTA discovery evidence plus explicitly reviewed PMR holder identity. The geographic source catalog is unchanged.
- `docs/audits/SIM-R4-COVERAGE.json`: calculated country, territory, level/type and language breakdowns; missing-coat, missing-flag, neither and unprocessed ID lists.

Selected preliminary assignments: 1436. Candidate records retained: 2297. Existing 137 SIM-R3 images and eight SIM-R2a assets remain unchanged and take precedence. New assignments are CANDIDATE; prior source-reviewed symbols retain REVIEWED_SOURCE. Neither state claims a new legal or heraldic certification.

## Source process and limits

Discovery used the catalog’s explicit Wikidata/Wikipedia links, exact P402/P843 identifiers, multilingual Wikipedia introductory infobox fields (ro/en/ru/uk/hu/bg/gag, with other-language fallback), Commons imageinfo, and linked institutional homepages. Every candidate retains the exact Atlas holder; names alone are never a join key.

Institutional fallback attempted 2,620 entity entries. 1207 page errors remain recorded (timeouts, HTTP/HTTPS and unavailable endpoints). Homepage scanning is bounded and does not exhaust every authority subpage, PDF annex or uncatalogued institution. No usable result is not proof that a symbol does not exist. Cached errors remain distinguishable from successful empty searches and from unprocessed entities. The unprocessed list contains 0 IDs.

Conflicting exact identifiers, shared Wikidata holders, multiple current graphics, old/end-dated claims, obvious logos, national-symbol leakage and cross-holder authority-image collisions are withheld. The identical Filiāși coat/flag image was withheld from the flag slot. The two Ștefan cel Mare institutional collisions and the national Moldova coat at the recognised left-bank unit remain explicit review cases.

PMR/de facto imagery is attached only to its exact administrative identity, separately from the recognised Moldovan left-bank unit and statistical MD120; no legal status or classification changed.

## Verification

- Local: 213 tests passed, including inventory uniqueness, source identity, legacy preservation, homonyms, national-symbol leakage, coat/flag separation, computed coverage and certified geometry/catalog hashes.
- TypeScript/Vite production build is run before release; the required GitHub check is `Build and verify website`.
- Existing Chromium desktop/mobile suite extended with two-slot galleries, per-image source/alt text, lazy loading, broken-image fallback and statistical neutrality at 1440 and 390 px.
- Local Windows Chromium timed out at map initialization; the repository’s established Linux CI browser runner remains the release gate. No claim of local browser success is made.

## SIM-R5

Deferred: legal acts, authenticity, present graphic master, historical versions, exact administrative holder, licenses/reuse conditions and further correction of uncertain assignments. This change is preliminary population, not SIM-R5.
