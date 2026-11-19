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

- [Folder 23_HIST-RASSM_OSM-RECON_2](https://drive.google.com/drive/folders/1v1zfkN9hfa1itI93zXTBu84jXJFLMr7N)
- [Complete GeoPackage](https://drive.google.com/file/d/1YHrG99HM23LpbyGJLzMzSiYOb9ghcnn7/view)
- [ZIP with GeoPackage, regenerating source script, 7 individual decisions, 54 gap audit, 60 current gaps, 10 OSM-history records and QA/sha256 manifest](https://drive.google.com/file/d/1KVFfVJM0l-t36XSoyspl-gy3ED4bRYm5/view)
- [Research report](https://drive.google.com/file/d/1xr9wrub7DxwKxPhSDfk9FVOK5rOgApD4/view)
- [Vector-only review map](https://drive.google.com/file/d/1QOx9G65uFzTJQv7fhWQ2Exm5ApCHXpZu/view)

ZIP SHA-256: `6cec57d76e5f2c263b86e995bb409a59afb5c47b420747520fc330d08408ba3c`

No ACTUAL, canonical geodata, user-facing Atlas site, QGIS CURRENT, earlier branches or previous PRs changed. **Draft** for research review only; no merge or publication requested.

© OpenStreetMap contributors, ODbL; follow ODbL requirements when sharing a derivative spatial database.

## Next evidence gate

HIST-RASSM.OSM-RECON.3: review longest unresolved gaps against directly retrievable OSM waterway/administrative ways and any real historical spatial source; keep chronology and geometric morphology distinct; use no fabricated segment or historical stamp.
