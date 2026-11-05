# Phase 2 — First Functional Website

**Status:** Implementation candidate, pending CI and public deployment.  
**Source:** `feat/phase-2-map-shell`  
**Reference snapshot:** OSM-Boundaries 2026-10-05

## Delivered behavior

- One responsive application shell: six module entrances, shared MapLibre GL map, tree panel, entity panel and mobile drawers.
- English by default, Romanian switch available globally, persisted locally.
- On startup both national administrative boundaries are visible: Romania (OSM relation `90689`) and Republic of Moldova (OSM relation `58974`). Other geometries are not loaded or implied.
- Independent territory checkbox and name selection. Country selection updates the details panel without toggling visibility.
- Basemap modes: Standard, Grayscale, Dark, and None. Real raster tiles are requested from OpenStreetMap and attribution is displayed.
- Global simplified display switch, persisted locally. Zoom +/− and Home resets only the map extent.
- The five unfinished module entrances display a clear *coming soon* state rather than fabricated module content.
- Build checks and static regression tests run on pull requests, with GitHub Pages deployment from `main` after integration.

## Data quality limitations

The first release contains **two reduced render-only national outlines**, programmatically derived from the supplied archived OSM-Boundaries GeoJSON. The detailed preview has been reduced with a small tolerance, and the simplified preview is deliberately coarser. **Neither is the lossless full-resolution geometry.** The source archive remains unchanged; the complete authoritative provenance and raw national polygons must be released in Phase 3.

SIRUTA, CUATM, the full administrative and statistical hierarchies, regional geometries, Covasna's Brețcu/Ojdula overrides and original per-entity OSM tags are **not imported in this phase**. These are explicit Phase 3+ tasks. Country OSM relation IDs are authentic and linked to OpenStreetMap.

This design prevents accidentally representing incomplete Phase 2 country-only data as a certified full administrative atlas.

## Deployment policy

- GitHub Pages: Vite build output in `dist/`, via GitHub Actions.
- Paths are prefixed with `/atlas/`; no server-side runtime required.
- Tests run before deploying. Do not switch the Pages source to GitHub Actions or merge without a successful PR build and inspection.
- Preserve licence/provider requirements and OSM attribution. The public OSM tile service must not be treated as an unrestricted bulk tile provider; choose a production tile SLA before scaling.

## Verification checklist

- [ ] Dependency installation and production build pass.
- [ ] Static shape, URL/base path, and interface contract tests pass.
- [ ] Desktop viewport works, both country outlines are visible and clickable.
- [ ] Mobile viewport works without horizontal overflow.
- [ ] EN/RO updates labels and the page title.
- [ ] Basemap and geometry mode independently change their rendering.
- [ ] Selection and visibility stay independent.
- [ ] Home preserves active module, selection and layer visibility.
- [ ] Pages publishes build artifacts and the live URL serves the application.
- [ ] No full SIRUTA/CUATM/statistical release or geometry certification is claimed.

## Follow-up

Phase 3: source-verified catalogue and source-lineage data including full OSMB polygons, official SIRUTA/CUATM, selected statistical layers, and the approved Brețcu/Ojdula geometry policy.
