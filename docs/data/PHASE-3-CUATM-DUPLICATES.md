# Phase 3 — Six repeated CUATM references: per-relation geometric diagnosis

**Status:** Read-only source assessment; no geometry, canonical identity, or production website was modified.  
**Dataset:** `OSMB-Moldova-2026-10-05.geojson.gz` (SHA-256 `d29b600daa2857bacf8ec7d13369db8fc95353e89f62fe1c762dbc692c216dad`).  
**CUATM baseline:** 2025 registry snapshot as staged in `data/candidates/phase3/sources/cuatm-2025.json.gz`.

## Interpretation

A repeated CUATM code is **not necessarily a duplicate polygon, a geometric overlap, or a repeated legal entity**. This source problem has two distinct structures. A CUATM code can appear on a broad municipality boundary and also on its urban core. Alternatively, multiple `admin_level=8` OSM relations with the same label and code may be spatially separate, potentially representing components of one official unit or incorrectly attributed references.

All 13 implicated OSM relation geometries exist in the supplied original archive and are individually valid.

## Measurements and distinctions

Areas use WGS 84 GeoJSON geometry projected to EPSG:3035 (ETRS89 / LAEA Europe); they are approximate and **not official cadastral surface figures**. Zero overlap means zero shared *positive-area polygon intersection*, and the distances are shortest polygon-to-polygon distances, not distances between administrative centres.

| CUATM | Registry identity | Original OSM relation(s) | OSM levels | Geometry area(s), km² | Geometric finding | Classification |
| --- | --- | --- | --- | --- | --- | --- |
| `0500` | Bender (municipality, status 5) | `12463379`, `9581354` | 8 / 4 | 21.205 / 38.007 | Entire level-8 polygon lies within level 4; level-4 outer remainder 16.802 km² | **Nested representations**, not duplicated polygons |
| `0100` | Chișinău (municipality, status 5) | `1748490`, `1691801` | 8 / 4 | 122.134 / 575.690 | Entire level-8 polygon lies within level 4; level-4 outer remainder 453.556 km² | **Nested representations**, not duplicated polygons |
| `1050` | Țînțăreni (Anenii Noi, status 8) | `12496850`, `19090932` | 8 / 8 | 39.297 / 17.721 | Distinct non-overlapping areas, approximately 6,059 m apart | **Identity/territorial extent unresolved**; high-priority review |
| `7160` | Văratic (Rîșcani, status 8) | `19045240`, `19045254` | 8 / 8 | 5.771 / 19.015 | Distinct polygons with no overlap, minimum separation approximately 48 m | **Possible multipart source**, confirm before unification |
| `3417` | Dondușeni village (Dondușeni district, status 8) | `19055800`, `19055814` | 8 / 8 | 27.501 / 0.675 | Distinct non-overlapping polygons, approximately 410 m apart | **Possible multipart source**, confirm before unification |
| `8034` | Recea (Strășeni, status 8) | `19100165`, `19100169`, `19100182` | 8 / 8 / 8 | 0.660 / 1.207 / 24.975 | Three distinct non-overlapping polygons; minimum pairwise separations approximately 47 m, 1,182 m and 2,016 m | **Possible three-part source**, confirm before unification |

The geometries of the four same-level groups do not touch at their borders. Shared `name`, `wikidata`, and `ref:cuatm:codunic` tags exist for multiple component relations; these assertions are source facts, **not independent confirmation that those components form one legal unit**.

## Source-preservation decisions

1. **Codes 0500 and 0100 — classify as nested cartographic scopes.** Keep the larger municipality and smaller urban polygon separately, with their genuine OSM relation IDs. Their shared CUATM code may identify the same official municipality, but does not create two independent official municipal records. The website data model needs a separate *source geometry role* so nested map scopes do not masquerade as separate CUATM entities.
2. **Code 1050 — unresolved spatially separated same-level pair.** The two areas are over 6 km apart, so they must not be labelled geometrically identical, merged automatically, or presumed to be a valid multipart jurisdiction without documentary evidence.
3. **Codes 7160, 3417 and 8034 — candidate multipart boundaries.** Preserve all original source polygons; verify official extent and whether the excluded gaps/other intervening territories are legitimately separate before defining a shared multipart geometry for one logical unit.
4. Preserve the original `ref:cuatm:codunic` OSM tags for every relation. Distinguish original tag claims from the authoritative CUATM identity link and from the Atlas navigational parent.
5. In any UI detail card, display one official CUATM identity per validated entity. If a source component's independent identity is unverified, mark internal lineage as unresolved; **do not invent a second legal code**.
6. Do not accept source polygons merely because they visually match the Standard OpenStreetMap basemap: OSM-Boundaries and OSM Standard are both based on OSM data, and OSMB explicitly warns that data is supplied as-is and can be inaccurate.

## Next evidence gate

For 1050, 7160, 3417 and 8034, compare each component against the official CUATM parent and its legal settlement list, the surrounding same-level OSMB geometries, and the accepted territorial geometry source if available. Separate the **decision to retain an OSM boundary as cartographic data** from the **decision to bind it to one official legal entity**.

No deletions, geometry changes, or automatic CUATM reassignments are authorized by this report. PR #7 remains Draft with the full source available and the original release blocker intact.
