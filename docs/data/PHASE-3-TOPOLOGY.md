# Phase 3 — Full-Snapshot Topological Audit

**Status:** Source geometry inventory complete; topology exceptions remain under review.  
**Reference:** OSM-Boundaries GeoJSON archives dated **2026-10-05**.  
**Release:** Draft PR #7, not deployed or merged.

## Audited source geometry

| Country | Selected raw OSMB administrative polygons | Invalid individual polygons | Additional reviewed polygon |
| --- | ---: | ---: | --- |
| Romania | 3,228 | 0 | Brețcu, SIRUTA 64096 (reviewed source, not a fictitious OSM relation) |
| Moldova | 1,036 | 0 | — |

Original compressed-archive SHA-256:
- RO: `cc4fd15940550054d90fcadf907ed98352b68882735680093f77a624e3e04897`
- MD: `d29b600daa2857bacf8ec7d13369db8fc95353e89f62fe1c762dbc692c216dad`

All **11** formerly missing Moldova administrative boundaries and the **18** standalone statistical boundaries (RO 12, MD 6) have been staged. Along with two statistical boundary representations reused by Moldovan administrative entities (MD114/MD115), **31 source geometry identities** were tested by a canonical SHA-256 digest of sorted, undirected edges at seven coordinate decimals. Results: **31/31 exact edge matches** and **31/31 original OSMB tag-set matches**. The exact comparison references are in `data/candidates/phase3/sources/edge-match-evidence.json` and `tag-match-evidence.json`.

## Spatial method

The original selected GeoJSON was examined using Shapely/GEOS and projected equal-area surface comparisons. The audit tested individual polygon validity; same-level polygon overlap via spatial indexing and pair intersections; child polygons outside their selected parent; and county coverage for selected Romanian level-8 children. Positive-area overlap and outside-parent discrepancies above **1 square metre** are distinguished from boundaries merely touching. Areas are indicative source-geometry discrepancies, **not** legal corrections.

## Significant same-level overlaps

| Group | Relations | Count | Total overlap |
| --- | --- | ---: | ---: |
| Romania level 8 | 14879493 / 10624200; 14879461 / 10624200 | 2 | **1.057760 km²** |
| Moldova level 8 | 19118040 / 19118596 | 1 | **0.239120 km²** |
| Romania levels 4 and 9 | No material overlap | 0 | 0 |
| Moldova levels 3, 4, 5, 7 | No material overlap | 0 | 0 |

The two Romanian overlap areas are **0.896542 km²** and **0.161219 km²**, respectively. No source coordinates were silently modified to erase these areas.

## Material parent–child outside areas in Moldova

| Child relation | Name | Parent relation | Outside area |
| --- | --- | --- | ---: |
| `12463200` | Fîrlădeni | `65343` (Căușeni) | **565,217.071 m²** |
| `19118596` | Svetlîi | `1706978` (Comrat subdivision) | **239,120.281 m²** |
| **Total** | | | **804,337.352 m²** |

The selected Romanian level-8 units have no material outside-parent area under the tested parent relations. The 41 tested Romanian county parents show no significant coverage gap or excess above **0.01 km²** in the reviewed parent-child coverage test; Bucharest has a different sector hierarchy and is not treated as an ordinary county in that aggregation.

Parent-to-child symmetric differences at other levels, particularly Nistrenia and statistical overlays, are **not automatically defects**: levels and groupings differ, and no geographic coincidence implies equivalent legal authority.

## Statistical source checks

- Romania: **12** standalone NUTS1/NUTS2 geometries; NUTS3 reuses the 42 counties/Bucharest without geometry duplication.
- Moldova: **6** standalone NUTS-style level2/level3 statistical geometries; MD1, MD114 (Găgăuzia), and MD115 (Chișinău) reuse existing administrative entities and source-equivalent geometry.
- MD12 and MD120 are separate statistical identities even when their OSMB polygon borders coincide. Source tag `MD121` on the MD120 geometry is preserved as an OSM tag; the official BNS statistical identifier stays `MD120`.
- Nistrenia administrative level 3 and statistical MD120 are distinct; no legal or geometric equivalence is inferred.

## Identity anomalies also blocking release

The pending **180** CUATM associations have been classified into **178 source-backed matches** and **two representations without separate CUATM codes**: OSM relation `58512` (Centru sector, Chișinău) and `12207955` (Bălți city component). These two cases intentionally retain a blank CUATM value.

Six existing source-reference collision groups remain, involving CUATM codes `0500`, `1050`, `0100`, `7160`, `3417`, and `8034`. All related original OSM relation IDs and geometries remain present. See `data/candidates/phase3/actual/md-cuatm-source-collisions.json`.

## Release disposition

**GEOMETRY_COMPLETE_NOT_PROMOTABLE.** Do not merge the Phase 3 candidate or present it as a certified legal boundary release while the three same-level overlap pairs, two outside-parent cases, and six CUATM collision groups remain without individual source-scoped decisions. The global simplified-geometry production layer also requires topology-safe generation and independent validation; no full-corpus simplified release is claimed by this audit.

The existing GitHub Pages website must continue to serve the accepted Phase 2 national-outline application until Phase 3 is admitted through a separate, verified release decision.
