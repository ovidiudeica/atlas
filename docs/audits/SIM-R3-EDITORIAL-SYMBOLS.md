# SIM-R3 · Territorial symbols — pragmatic editorial rollout

**Scope:** 74 exact Atlas IDs at ADM4 — 42 Romanian counties/Bucharest and 32 Moldovan raions. This is a UI-only continuation of SIM-R2a, not a rebuild of OSMB, SIRUTA/CUATM, geometry, or parent–child relationships.

## Editorial rules

- **SIM-R2a prevails:** the seven reviewed local symbols already stored in `public/symbols/` remain unchanged, with their original owner, acts and evidence. The new catalog has no overlapping IDs.
- **A — institutional graphic:** the Taraclia district coat and flag, directly linked from the Taraclia District Council website (`raiontaraclia.md`), and attributed there.
- **B — documented reproduction:** a specific file from Wikimedia Commons' county/district heraldry categories, identified by an exact Atlas ID in `src/data/territorialSymbols.mjs`. Each card links the **file description**, where origin and license/terms are displayed. B does not imply that the graphic matches an authenticated legal annex.
- **C — neutral placeholder:** a graphic that is missing, older than a known amendment, contradictory or unavailable must not be guessed or inherited from the same-name city or a parent. The tree and card display ◇. A failed remote image load also falls back to ◇.

This finite scope deliberately **does not** require an individual annex download, per-image SHA-256 or correspondence with every territorial authority. Only simple sourced 1:1 attribution is needed. It does not represent symbols as branding or official certification.

### Current visual coverage

**74 assessed**: 70 coats, 67 flags, 65 entities with both, 2 entities with neither. The counts reflect catalog URLs, not a promise that every remote host can deliver an image in every network environment.

### Special version constraints

- **Bucharest** (`osm-r377733`): no old coat following the 2024 municipal amendment. Source: https://doc.pmb.ro/legis/acteinterne/2024/45550/h047_24.pdf
- **Harghita** (`osm-r2248660`): no pre-2026 coat. HG 510/2026: https://legislatie.just.ro/Public/DetaliiDocument/311970
- **Vrancea** (`osm-r2260187`): Commons reproduction `ROU VN VRANCEA COA.png`, dated 16 April 2026 and attributed to the county council (tier B), not the old 2007 image: https://commons.wikimedia.org/wiki/File:ROU_VN_VRANCEA_COA.png
- **Briceni** (`osm-r59002`): new symbols were registered in 2026 but no verified URL for a standalone display image is available. Neutral placeholders; institutional reference: https://briceni.md/stema-raionului-briceni/

### Non-goals

No inferred heraldry for statistical entities, Nistrenia/PMR legal identity, municipalities or communes outside the 74-ID cohort. No modification to `public/data/phase4/`, `data/`, geographic geometries, source tags, owner IDs or the canonical release. Images are editorial-only third-party URLs and are **not** added to the static Atlas asset package.

### Sources

- https://commons.wikimedia.org/wiki/Category:Coats_of_arms_of_counties_of_Romania
- https://commons.wikimedia.org/wiki/Category:Flags_of_counties_of_Romania
- https://commons.wikimedia.org/wiki/Category:Coats_of_arms_of_districts_of_Moldova
- https://commons.wikimedia.org/wiki/Category:Flags_of_districts_of_Moldova
- https://raiontaraclia.md/ro/simbolica-raionului/
- [Previous SIM-R2a evidence](SIM-R2A-VERIFIED-SYMBOL-PILOT.md)

## Acceptance

Run `npm test`, `npm run build`, existing Chromium desktop/mobile smoke via `.github/workflows/website.yml`; require no UI regressions and a clean `main` merge. Publish only through the existing workflow after successful gates.


## SIM-R3.1 — operational media and responsive UI audit (8 November 2026)

The 74-ID editorial catalog has **137 image references**. Wikimedia Commons' MediaWiki **imageinfo** API returned an actual file record, media URL, MIME type, byte count, and file SHA-1 for **all 135 Commons files** (zero missing). The two remaining images are district council-hosted coat and flag links on the [Taraclia official symbolism page](https://raiontaraclia.md/ro/simbolica-raionului/). These checks are a practical *media existence* audit, **not** an official legal-graphic certification or a guarantee of third-party server uptime.

The mechanical per-ID registry is [SIM-R31-ASSET-CHECK-20261108.json](SIM-R31-ASSET-CHECK-20261108.json). File SHAs identify the uploaded Wikimedia media; they do not authenticate current legal annex versions. Source links and fallback semantics remain active in desktop and mobile cards. The browser smoke adds reference screenshots for a Romanian county, a Moldovan district, Taraclia, Bucharest's neutral placeholders, and the mobile two-column layout.

### Permanent evidence discovery rule for future SIM phases

**Wikipedia (în toate limbile / in all languages)** may be used to **discover candidates** for local steme și drapele (coats of arms and flags), including pages and infoboxes in Romanian, English, Russian, Ukrainian, Hungarian, Bulgarian, Gagauz and other language editions. Search all relevant editions rather than limiting discovery to Romanian/English.

A Wikipedia or Wikidata infobox alone is **not** sufficient to assign a symbol. Inspect its linked Wikimedia Commons file page, source/history, copyright status, version/date, administrative holder and exact territorial scope. Correlate the candidate with the **exact Atlas ID and official SIRUTA/CUATM identity** and available local/government institutional evidence; avoid matching a village's coat to its commune, a city to a raion or an administrative overlay to a statistical unit. Never assume symbols inherit from a parent or from an identically named unit.

Use the existing A/B/C tiers. When the design is disputed, older than an identified legal amendment, or inaccessible, show the **neutral placeholder** and record the unresolved reason. This rule guides future municipal/communal coverage without introducing a new blanket certification requirement.

### Acceptance and limitations

- Node/TypeScript regression, website build and Chromium desktop/mobile smoke must succeed on the exact change SHA before protected merge.
- Canonical geographic files, SIM-R2a local imagery and geometry remain unchanged.
- Browser screenshot samples establish UI behavior, but complete real-time image loading at all 137 external URLs cannot be guaranteed indefinitely. A failed network image displays ◇; existing source and license links remain available.
