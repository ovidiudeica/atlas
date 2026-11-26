# HIST-OHM-TREE.12a — supplemental historical source adapter

Status: implementation candidate; admission to production requires protected CI and post-publication confirmation.

## Architecture
The OHM and RoHGIS 1930 catalogs, geometries, source IDs and membership rules remain unchanged. The supplemental registry uses an independent source-family contract, version/asset references, explicit source period, reuse attribution and candidate source relations. A failure loading the supplemental catalog does not block the existing historical tree. Geometry is lazy-loaded and reused per asset ID. The tree projects only unique, non-cyclic candidate relations valid for the selected calendar year and passing the source spatial review (outside-parent area at most 0.1%). Eight relations requiring topological review remain in the registry and are not promoted into the tree. Calendar-year filtering requires both source interval bounds; it does not extend undated or open-ended periods. A source interval is not an independently certified boundary or administrative tenure.

## First lot: HistoGIS v9.0
The first lot restores only previously published HistoGIS regional pilot source assets, using the original pilot geometry blob 3331fc364075edbef32742adf01f54e4ee6c6171 byte-for-byte; no new coordinate transformation, simplification or interpolation. Source archive SHA-256: 1e108156d8d21f5e47dc91849050f1e12e5d642f13095407f70270883004a5cd. The prior stage's staging registry and archive LICENSE identify CC BY 4.0, with attribution to ACDH-CH / Austrian Academy of Sciences. Upstream historical source rights and dates have not been independently requalified. The SHA-256 recorded on source entries identifies the archive rather than individual members; the original member path identifies each source file.

- 54 versions (34 Transylvania, 20 Bukovina), 53 distinct source entities and 53 assets.
- 52 source relation candidates, 44 eligible for temporal projection, 8 held for topology; eligibility does not mean documentary qualification.
- Bukovina versions 9936 and 9970 reuse exactly one geometric asset.
- Historical names are preserved as source labels, not presented as modern standardized translations.
- ICR, HURI, Mosaic and DARMC remain outside the new public supplemental registry until their separate rights and admission checks are resolved. No new legal boundary, cross-family identity, or administrative membership is certified.
- The 33 HOLD positions from 1930 documentary reconciliation are not modified.

## Acceptance
Static tests verify schema, dates, attribution, source geometry blob integrity, exact-coordinate comparison against OHM and RoHGIS, lazy asset reuse and conservative parent projection. Chromium smoke exercises 1869 Bucovina > Radautz, selection and provenance, 1930 exclusion, and the unchanged 71-county RoHGIS tree on desktop and mobile. Existing tests remain intact.
