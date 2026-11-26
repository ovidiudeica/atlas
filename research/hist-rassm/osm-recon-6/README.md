# HIST-RASSM.OSM-RECON.6 — full-history OSM deleted/replaced/relation-removed ways

**Research dated 2026-11-20. Class C, not a historically certified RASSM 1924–1940 border.** This PR is documentation only and must remain draft; no changes to ACTUAL, main GIS data, website, or QGIS CURRENT.

## Original source and exact extraction

Original user-authorized offline OSM history PBF `history-261019.osm.pbf`, **163,893,678,040 bytes**; 123,341-block pre-existing index. Source indexed object ordering was declared by the publisher, *not globally requalified*; a preliminary whole-world spatial scan was deliberately stopped because too resource-intensive and **there is no exhaustive worldwide deleted-way spatial inventory**.

The controlled inquiry retrieved:
- **189 relations, 6,899 relation versions**, including 9 additional local historic/admin relations around the three priority gaps;
- **12,137 relation member-way removal events**, **2,378 distinct ever-removed way IDs**, not equivalent to 2,378 deleted OSM objects;
- **369 local/corridor-linked removed way IDs, 2,994 way-version observations**, all found; **266 final versions marked deleted**, **103 still visible** in the PBF archive;
- **12,583/12,583 first/final way node IDs** reconstructed from **57,560 historical node-version observations**;
- **472 complete initial or final visible way-edition lines**, with node coordinates selected at the **way edit timestamp**, not present-day positions. Deleted terminal versions contain no node references, so they are not described as lines; earlier visible editions are available separately.
- **29 possible old/new OSM way pairs with shared nodes at relation membership edits**, provisional splits/replacements only.
- **26 unique formerly related ways within 10 km** of the three priority ICR gaps; **248 way/HURI dated-epoch comparisons**. Neither OSM deletion nor matching shapes certify a 1924–1940 border.

## Individual priority gap findings

- `GAP4-0084` **28.589 km**: 9 candidates within 10 km, 6 deleted. No substantive 500m buffered chainage overlap. Nearest old `way/28612699` about 1.72 km from reference.
- `GAP4-0095` **27.678 km**: added extinct local Ananyiv way `way/130190002`, about 3.962 km from reference; not a replacement.
- `GAP4-0107` **23.736 km**: 17 within 10 km, 14 deleted. Nearest old `way/28612699` and `way/28612964` ~102m from ICR but only ~450m of reference within a 500m corridor; `way/30546172` has ~390m. No continuous robust agreement.

**Geometry admission: NONE (0m).** The existing research C RASSM hybrid remains **116 OSM-substituted sections / 74.792% ICR-chainage coverage / 108 residual ICR sections (240.270km) / 216 technical connectors / 8,442.815km² (UTM35)**. Historical A/B admitted remains 0m. QA verified all **17 pre-existing source GIS layers bitwise identical by WKB**, the new research GeoPackage has **20 valid layers** and SQLite integrity `ok`.

## Immutable research deliverables

- [Stage 27 Drive folder](../../../docs/historical/rassm/osm-reconstruction/PROVENANCE.md)
- [Complete 61-file ZIP with scripts, receipts and SHA256 manifest](../../../docs/historical/rassm/osm-reconstruction/PROVENANCE.md)
- [20-layer GeoPackage](../../../docs/historical/rassm/osm-reconstruction/PROVENANCE.md)
- [Three-gap vector map](../../../docs/historical/rassm/osm-reconstruction/PROVENANCE.md)
- [Romanian evidence report](../../../docs/historical/rassm/osm-reconstruction/PROVENANCE.md)
- [OSM edit-time / HURI comparisons](../../../docs/historical/rassm/osm-reconstruction/PROVENANCE.md)
- [GIS final QA](../../../docs/historical/rassm/osm-reconstruction/PROVENANCE.md)

ZIP SHA256 `67544117426119e4690260b0fbd96f9dcb74d4a29ce00a94970785fc2bb406c5`. GPKG SHA256 `10f159ddf51957ea1e2d68c030ad664626ba139572ed2207cb4b8325c48e464f`.

License note: © OpenStreetMap contributors, ODbL. No automatic use of OSM edit timestamps as historic RASSM administrative validity. **Next possible action** is a separately planned indexed spatial scan of previously unseen, unlinked deleted ways with balanced resource budget; this stage does NOT claim it was done.
