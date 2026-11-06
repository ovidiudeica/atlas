# Phase 4 — Interactive Territorial Tree and Administrative/Statistical Map

**Reference:** `ovidiudeica/atlas`, branch `feat/phase-4-live-territory-tree`.  
**Input:** Phase 3 accepted cartographic certificate (`data/candidates/phase3/actual/manifest-v3.json`).  
**Dataset snapshot:** OSM-Boundaries 5 October 2026.  
**Goal:** Make the certified RO/MD catalogue directly usable in the public Atlas website.

## Implemented functionality

- The shared MapLibre map now loads the **certified original country contours** and all selected administrative/statistical territory polygons when their explicit checkboxes are enabled.
- The bilingual territory tree has **4,283 unique nodes** (RO 3,241 and MD 1,042), with three user-controlled views: *All* (statistical grouping and administrative units), *Administrative* (statutory administrative-parent links), and *Statistical* (official NUTS/MD nomenclature, sharing county, Găgăuzia and Chișinău entities). These are **alternate tree views of the same identities**, not duplicated geometry records.
- Parents may be expanded/collapsed, selected, and made visible/hidden **independently**. Opening a branch or selecting an entity never toggles descendants. Explicit per-branch show/hide commands affect **only its immediate children**, not the parent or grandchildren.
- The initial display shows **only Romania and the Republic of Moldova**; no descendants are enabled by default. Search across official names, aliases, OSM IDs, SIRUTA, CUATM, statistical codes, and Wikidata returns a bounded result list and reveals the selected entity's path.
- The detail card shows the authentic OSM relation ID (a **blank value**, not a placeholder, when no OSM ID exists), official full name, administrative level, statistical roles, registry code, independent legal and tree parent references, and expandable full original OSM tags and official SIRUTA/CUATM record.
- **Brețcu:** SIRUTA `64096`, no OSM ID, normal entity in the public tree/card; original reviewed geometry retained. **Ojdula:** OSM `14735731`, SIRUTA `64602`.
- **Moldova:** MD1, MD11, MD12, MD111–115 and MD120 roles; MD114 and MD115 reuse Găgăuzia and Chișinău, Nistrenia administrative level 3 remains distinct from statistical MD120 and source `MD121` tags.
- Entity polygons load from immutable source or topology-preserving simplified versions. The global simplified-geometry preference works for all map layers and persists, along with EN/RO language and explicit geometry visibility, across reloads.
- Basemap options and map zoom/Home are preserved. **Home resets only the map extent**, not visibility, selection, filters, or chosen module.
- Desktop/touch/mobile use the approved navigation rail and responsive territory/details drawers. The other five modules remain marked as planned, with no fictitious content.

## Data delivery and loading performance

The source data is not blindly bundled into a multi-megabyte JavaScript file. `scripts/data/build-phase4-assets.mjs` reads the Phase 3 certificate and creates deterministic, hash-pinned static assets under `public/data/phase4/`:

- `catalog.json.gz` — complete 4,283-node register including full original OSM tags and full matched official records, ~354 KB compressed.
- `manifest.json` — exact source-certificate SHA-256, per-asset SHA-256, counts, and shard mapping.
- 21 **geometry shards**, each in *detailed* and *simplified* variants (42 compressed geojson files). There are 12 administrative buckets for RO, six for MD, one statistical bucket per country, and one country-root bucket shared by both.
- All descendants of the same root administrative unit are assigned deterministically to a common bucket (FNV-1a on the top administrative ancestor), preserving lazy-load access without a database or network server.
- Geometry is fetched and cached **only after explicit display or locate commands**. Switching global simplification picks the corresponding certified geometry shard. `fflate` tolerates static hosts that auto-decompress `Content-Encoding: gzip`, as well as hosts that serve the compressed bytes unchanged.
- The original React/MapLibre frontend is retained; no production server infrastructure or client tracking is added.

The builder is idempotent with the same inputs and source-bucket policy:

```bash
node scripts/data/build-phase4-assets.mjs
npm test
npm run build
```

## Source and legal distinctions

The current reference boundaries represent **OSMB cartographic source shapes with accepted and documented source exceptions**, not legally certified administrative boundaries. The Phase 3 certificate retains three overlapping same-level pairs, two outside-parent cases, and six repeated CUATM reference groups. In the four separate-component CUATM cases, source tags are preserved but legal component equivalence remains unproven. The public UI does not declare those cases legally validated. Statistical groupings do not overwrite real administrative parent references.

The OSM original tags and the official SIRUTA/CUATM source records are **read-only**, and display-only normalisation is not written back into them. Atlas-derived geometry buckets and tree groupings are clearly separate from source records.

## Acceptance checks

- `tests/phase-4-live.test.mjs`: source manifest hashes, 4,283-node inventory, 21 geometry-shard identities, both geometry modes, original metadata, hierarchy semantics and special entities.
- Existing Phase 3 candidate and certification tests remain active. Stale Phase 2 UI-only assertions are replaced with tests for the native MapLibre polygon layers and Phase 4 catalog.
- Chromium smoke tests validate desktop (1440×900) and mobile (390×844), EN/RO switching, country roots, search, Brețcu's **blank OSM ID**, MD120, independent visibility, lazy geometry fetch, simplified mode persistence, and responsive drawer.

**The acceptance gate:** pass all GitHub Actions tests and production build on the exact PR head; review the desktop/mobile captures and real geometry-loading HTTP requests; merge with exact-SHA protection; verify `main` CI and GitHub Pages HTTP 200. No alteration of the prior `reforma-teritoriala` repository is permitted.
