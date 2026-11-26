# HIST-RASSM.OSM-RECON.2 — ICR/HURI/OSMB reconciliation of parallel sectors and gaps

Research **C** only — no legal/historical boundary A/B admission. 2026-11-19. Continues [OSM-RECON.1 PR #129](https://github.com/ovidiudeica/atlas/pull/129).

## Actual GIS result

- Compared 7 previously identified parallel OSMB fragments to ICR and HURI: **6 adopted as morphological GIS matches**, including **3 complete original OSMB arcs and 3 unmodified original-node subchains**. One overlapping/weakly supported candidate was rejected.
- Rebuilt and checked a valid, single **RASSM hybrid C polygon**.
- OSMB-based sectors: **59** (53+6), **331,858.775 m** of geometries vs **294,695.445 m** previously.
- Corresponding ICR chainage replaced: **317,112.338 m = 33.270%** (previously 280,963.773 m = 29.477%). New replaced ICR chainage **36,148.565 m**.
- Still fallback ICR: **636,036.333 m**, split into **60** intervals after insertion. The **54 original gaps** were each audited, not disregarded.
- **118** expressly artificial topological bridges, total **23,836.200 m**. Not represented as authentic OSMB or historic boundary.
- **Area 8,408.355 km² (UTM 35N)**; geodesic WGS84 area **8,407.949 km²**. Spatial validation: polygon valid, GPKG SQLite integrity OK, component perimeter matches polygon.
- **All 59 sectors independently compared directly against original MD/UA polygon boundaries:** 126 distinct OSM source relation IDs, max sampled coordinate deviation **2.08e-9 m**. This proves raw-source geometry lineage, *not* 1924–1940 authority.
- **10 official OSM relation edit histories checked** with the OSM API; first edit dates ranged 2011–2026. These are modern OSM edit timestamps, not historical RASSM jurisdictional epochs.
- Source archive pins: OSMB Moldova 2026-10-05; Ukraine 2026-11-09, both 2026 modern current snapshots. ICR has no exact historic validity date. HURI episodes are heterogeneous candidate geometries.

## Data package on Drive

- [Folder 23_HIST-RASSM_OSM-RECON_2](../../../docs/historical/rassm/osm-reconstruction/PROVENANCE.md)
- [Complete GeoPackage](../../../docs/historical/rassm/osm-reconstruction/PROVENANCE.md)
- [ZIP with GeoPackage, regenerating source script, 7 individual decisions, 54 gap audit, 60 current gaps, 10 OSM-history records and QA/sha256 manifest](../../../docs/historical/rassm/osm-reconstruction/PROVENANCE.md)
- [Research report](../../../docs/historical/rassm/osm-reconstruction/PROVENANCE.md)
- [Vector-only review map](../../../docs/historical/rassm/osm-reconstruction/PROVENANCE.md)

ZIP SHA-256: `13d23d72996a4233d4a2b81918047b9b744e895d9c2646e13ba3aaaa011439f3`

No ACTUAL, canonical geodata, user-facing Atlas site, QGIS CURRENT, earlier branches or previous PRs changed. **Draft** for research review only; no merge or publication requested.

© OpenStreetMap contributors, ODbL; follow ODbL requirements when sharing a derivative spatial database.

## Next evidence gate

HIST-RASSM.OSM-RECON.3: review longest unresolved gaps against directly retrievable OSM waterway/administrative ways and any real historical spatial source; keep chronology and geometric morphology distinct; use no fabricated segment or historical stamp.

## Discovered full local OSM history archive and provenance limits

Full local history PBF **history-261019.osm.pbf** exists on the authorized laptop at 163,893,678,040 bytes (~152.64 GiB). The existing download receipt status is **FULL_BASE_BYTES_VERIFIED_NOT_SOURCE_QUALIFIED**, and its documented SHA-256 was *not independently recomputed during this stage*. Selective preexisting **selected-base.osh.pbf** (15,100,527 bytes; verified SHA-256 dad0f923029c96046e3fbe90f793906fe07da0076380b1890bb2db413e4cfd34) contains 57,959 way-version records and 2,878,820 dense node-version records, **zero relation-version records**. It cannot be used to validate historic relation boundaries. The detailed audit is in [OSM_FULL_HISTORY_SOURCE_AUDIT.md](OSM_FULL_HISTORY_SOURCE_AUDIT.md) and linked Drive folder. Geometry 59-sector model is unchanged by this supplement. Full relation-history extraction is a future evidence gate; no claim of historical A/B admission or complete 1924–1940 accuracy is made. Research ZIP includes the reproducible base geometry script, source audit script and selected PBF scanner; excludes raw contributor-linked source dumps.
