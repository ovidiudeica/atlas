# HIST-0.1 — Natural study perimeter (inventory / boundary qualification)

**Status:** `DRAFT / NATURAL_BOUNDARY_SOURCE_PENDING`. This file is a read-only architecture/audit record, **not** an authorized geometry to render or import.

**Base:** `main@5dc5327f3bca9ec1d8a75baf2a361d71b1d5a1b4`. Audit date: **2026-11-10**.

## Scope

The study zone is specified by **the Tisa River, Carpathian Mountains, Southern Bug River, Black Sea, Balkan Mountains, and Danube River**. This expressly extends beyond modern Romania and Moldova, to relevant areas in Ukraine, Bulgaria, Serbia, Hungary and the Carpathian region.

It is **not** synonymous with the union of current national borders. Historical entities crossing a natural delimiter must be assessed by **real geometric intersections**, without trimming or modifying their source OHM polygons.

## Direct OHM evidence

- Overpass endpoint: `https://overpass-api.openhistoricalmap.org/api/interpreter`.
- Broad survey bounds: `(41.8,18.0,50.0,33.5)` in `(south,west,north,east)` order.
- OHM snapshot: `2026-11-10T19:18:52Z`. **2,919** relation records in this broad rectangle; **1,789** with an `end_date`. These are **not** counts inside the final study perimeter.
- Tisa: OHM river relation **88555**, 34 way members; incomplete/disconnected branches prevent certification of a single unambiguous complete trace.
- Southern Bug: 24 OHM way records with `name:en=Southern Bug` returned a continuous sampled reach from about `(26.50294,49.61165)` to `(30.59859,48.13923)` (lon,lat), but the reach toward the Black Sea estuary is not complete in this extraction.
- Danube: OHM river relations **89652** and **2799900** identified; main-stem/branch and endpoint conventions still require evaluation.
- Carpathians and Balkan Mountains: the place names alone do **not** specify a unique legal/geometric boundary. Crest vs watershed vs foothill limits have different consequences.
- Coastline and estuaries: source coastline geometry, shoreline epoch, and closure rules remain to be specified.

## Controlled local validation (not source of a certified border)

A separate **provisional, approximate search envelope** was constructed using sampled OHM river anchors and manually declared connectors where source boundaries are missing. It is self-intersection-free and GIS-valid, with approximate geodetic area **469,734 km²**. The envelope was evaluated against the supplied 2026-10-05 OSMB national outer geometries: it covers **100%** of the Moldova country shape and **99.98741%** of Romania's area in planimetric diagnostic checks. Residual differences are attributable to coarse generalized Danube/coastal connectors.

All **32 OHM historical candidate BBOXes** from the previous audit intersect this DRAFT envelope, but this establishes only **possible** intersection. No candidate was approved based on a BBOX test.

**Do not publish or reuse the provisional envelope as a natural, juridical, historical, administrative, or cartographic boundary.** It is deliberately not part of the app's canonical `public` or `src/data` assets.

## Entry conditions for a certifiable HIST-0.1 boundary

1. Document an independent GIS/DEM-based **orographic convention** (crest / watershed / foothill) for both mountain ranges.
2. Recover and validate uninterrupted hydrographic reaches for Tisa, Danube and Southern Bug; choose the bank/centreline convention.
3. Recover the Black Sea coastline and establish estuary/delta and shore-epoch policy.
4. Ground each transition between river, mountain and coast in coordinates and cited source geometry.
5. Build GIS-valid multipolygons, validate topology and calculate sensitivity to alternative mountain-line conventions.
6. Preserve `source_id`, acquisition timestamp, licensing, source hash and method for every segment.
7. Perform **true polygon-to-polygon** OHM intersections; record spatial status per OHM relation **and historical time slice**, not per name alone.
8. Keep **ACTUAL / OSMB 2026-10-05 / 273 protected references / SIM / WEB** entirely unchanged.

## Non-decisions

No OHM data import, no change to the atlas interface, no historical tree, no translation normalization, no automatic historical legal validation, no change to workflow or dependencies. No attempt to certify undocumented mountain connectors.

**Verdict:** `HIST-0.1 INVENTORY_AND_DRAFT_VERIFIED / FINAL_PERIMETER_NOT_CERTIFIED`.

**Next gate:** source and approve a ridge/foothill convention, reconstruct natural-feature linework, and replace the approximate envelope with independently reproducible boundaries. Subsequent HIST-0 stages may use the **inventory** now but must not conflate the approximate envelope with an accepted boundary.
