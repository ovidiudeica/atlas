# Phase 3 — Cartographic Source Certification

**Status:** Certified for source-faithful cartographic integration, **not** for independent legal boundary certification.  
**Scope:** Romania and Republic of Moldova, OSM-Boundaries 2026-10-05, selected administrative and official statistical roles.  
**Release:** Atlas phase 3 data candidate v3 (PR #7).

## Canonical geometry and source identity

The v2 source geometry remains byte-for-byte unchanged and is pinned by SHA-256 in `manifest-v3.json`. The selected release contains **3,229 RO** and **1,036 MD** administrative polygons and **12 RO / 6 MD** standalone statistical polygons, with **54 RO and 9 MD statistical roles**. The SIRUTA 2026 and CUATM 2025 source snapshots and the existing per-ID registry bridges are preserved. Brețcu retains `osmRelationId: null`; Ojdula retains authentic relation `14735731`. The statistical `MD120` legal code stays distinct from the OSMB `MD121` source tag and Nistrenia's administrative identity.

There are **31/31 exact OSMB source geometry-edge checks** and **31/31 original tag-set checks** for reconstructed relations.

## Individual source-exception dispositions

The accepted source-exception decision register `actual/source-exception-decisions-v1.json` contains exactly **five topological cases** (three pairwise overlaps; two child-outside-parent cases) and **six repeated-CUATM-code groups**. All original relation IDs, their source tags and original coordinates remain intact.

- RO overlaps `14879493/10624200` and `14879461/10624200`, and MD overlap `19118040/19118596`, are accepted as *known original-source cartographic exceptions*; they are not declared legally correct.
- MD out-of-parent geometries `12463200` (against `65343`) and `19118596` (against `1706978`) are preserved without snapping or geometric alterations.
- CUATM `0100` (Chișinău) and `0500` (Bender) refer to municipality/urban-core nested source scopes, not independent duplicate legal records.
- CUATM `1050` (Țînțăreni), `7160` (Văratic), `3417` (Dondușeni), `8034` (Recea) retain separate source polygons. Their asserted shared CUATM references remain **legally unresolved as component mappings**; they must not be treated as automatically validated multipart legal jurisdictions.
- The 180 previously absent CUATM associations have an evidence-led decision: 178 matched; two source representations have no independent CUATM code (Centru sector and Bălți component). No code was invented.

The user's authorization allows a **source-based cartographic release with disclosed exceptions**. Matching the Standard OpenStreetMap map is **not an independent verification** because OSM and OSM-Boundaries share underlying data. This certification makes no statutory, cadastral or legal-equivalence assertion.

## Topology-safe simplified display layers

Build settings: **Mapshaper 0.7.101**, weighted Visvalingam **50% keep**, `keep-shapes`, and `combine-files` for administrative + statistical layers within each country, constructing shared arcs. Display-only layers are stored as new compressed GeoJSON, separate from the canonical originals.

| Layer | Source vertices | Simplified vertices | Reduction | Invalid polygons |
| --- | ---: | ---: | ---: | ---: |
| RO administrative | 1,763,447 | 889,997 | 49.53% | 0 |
| RO statistical | 157,765 | 74,035 | 53.07% | 0 |
| MD administrative | 362,889 | 189,526 | 47.77% | 0 |
| MD statistical | 45,472 | 29,639 | 34.82% | 0 |

Verification:
- **0** invalid simplified features out of **4,283** selected feature geometries.
- **0** simplified polygon features with area drift over **1%**; largest single drift **0.6045%**.
- **15,643** same-level possible-overlap pairs checked using geometric intersection. **Zero new material positive-area overlap pairs** and **zero original material overlap pairs lost**: the original 2 RO and 1 MD pairs remain.
- **79** RO/MD selected parent-boundary coverage unions compared before and after simplification. **Zero new gap or outside-area growth above 0.01 km²**; the largest increase is approximately **0.000310 km²** (310 m²).
- Original-source overlaps and child-outside areas are still present, not silently erased.
- Mapshaper's internal diagnostic reported three unrepaired arc intersections on the **MD administrative layer** even at a 99% retention setting; this is retained as an engine/source warning, not hidden. Independent polygon validity, same-level overlap and parent coverage checks above passed. It does **not** certify cross-level/cross-system legal consistency.

These are explicit, measurable checks. Topological simplification is not a substitute for jurisdictional or legal adjudication. The website's original geometry remains the source for future exports; simplified layers are only for display.

## Evidence and immutable versioning

- `actual/manifest-v3.json` — SHA-256 source baseline, four simplified layer files, audit evidence, exception-decision hash, explicit scope/limitations.
- `actual/simplification-qa-v1.json` — all per-layer validity and area-drift measurements.
- `actual/simplification-overlaps-v1.json` — pairwise same-level source/simplified overlap comparison.
- `actual/simplification-parent-cover-v1.json` — 79 source/simplified parent coverage checks.
- `scripts/data/build-phase3-simplified.mjs` — regeneration with pinned Mapshaper 0.7.101.
- `tests/phase-3-certified.test.mjs` — exact hashes, geometry-to-ID bijection, decision register, acceptance gate assertions.

## Integration protocol

Do not merge until the **exact SHA** containing the certificate, source exceptions, simplified files and tests passes the website CI/build. Mark PR #7 Ready and merge with SHA protection only after success. Confirm the resulting `main` checks and GitHub Pages deployment. This integration commits the **catalogue and cartographic display assets in the repository**; the Phase 4 tree/UI layer must separately import these data and is **not** automatically enabled by adding Phase 3 assets.
