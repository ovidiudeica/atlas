# Phase 2 — First functional map (implementation candidate)

This is the first production-code increment, implementing the approved Phase 1 architecture with Vite, TypeScript, React, and MapLibre GL JS.

## Included

- Shared WebGL map for all six modules; module navigation labels in English and Romanian.
- OSM-Boundaries **2026-10-05** national outlines for Romania (relation `90689`) and Republic of Moldova (relation `58974`), both initially visible.
- Independent visibility, tree expansion and entity selection; Home resets the map viewport only.
- Global simplified-outline switch, independently of visibility and language.
- Basemap choices: OSM Standard, grayscale, CARTO dark, and no basemap. Attribution retained.
- Responsive desktop and mobile territory tree, card and navigation controls.
- **Statistical tree navigation preview:** Romania four macroregions; Moldova all nine 2017 statistical roles, with Gagauzia and Chisinau as single dual-role nodes and MD120 separated from Nistrenia. Their geometry checkboxes are disabled pending validated datasets.
- Blank OSM ID row for entities without an authentic relation ID.

## Explicitly deferred

- Complete RO/MD administrative and statistical geometry inventories, SIRUTA/CUATM reconciliation, source tags, and approved Brețcu/Ojdula polygon integration (Phase 3 onward).
- Production shared-edge topology certification for all hierarchical levels.
- Five later module data libraries and workflows.
- Full keyboard/screen-reader acceptance, cross-browser matrix and large-corpus performance profiling.

## Geographic source and build

`public/data/countries-original.geojson` contains original geometry coordinates from the two archived 2026-10-05 OSM-Boundaries national relations. `countries-simplified.geojson` is produced with Shapely `coverage_simplify`, only after verifying a valid polygon coverage. Both are rendering variants and are **not asserted as legal boundary authority**. The preview release contains **no fictional OSM IDs** and no altered source archive. `manifest.json` records archive hashes and variant hashes. To regenerate from the supplied archives, run `python scripts/build-country-preview.py` in an environment with Shapely 2.1+ and the original two archives available under `/mnt/data` (the input path should be parameterized before production use).

## Build/test

`npm ci && npm run test && npm run build`. Build output is `dist/`, with base path `/atlas/`. The GitHub Actions workflow checks PRs and publishes `dist` to GitHub Pages only for `main`, after switching the Pages source to GitHub Actions.

## Publishing guardrail

Do not merge this branch until build checks pass on its final SHA, and do not change the production Pages source until the artifact is verified. Initial source code PR is separate from the existing published documentation-only page.