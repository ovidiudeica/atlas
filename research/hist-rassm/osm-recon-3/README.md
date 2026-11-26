# HIST-RASSM.OSM-RECON.3 — Targeted original OSM full-history extraction and 106-sector GIS polygon

**Date:** 2026-11-19. **Status:** **research C only**, morphologically reconstructed from current OSMB boundaries, *NOT historically certified 1924–1940 (A/B = 0 m)*.

## Direct source work completed
- On authorized local computer, indexed **original 163,893,678,040 byte** full-history PBF (`history-261019.osm.pbf`, 2026-10-19) using its 123,341-block framing index. No new global download.
- Found **180/180 targeted OSM relations and 6,607 relation version observations**; 3,731 distinct member way references in latest observed relation versions. Searched raw original PBF, not just API metadata or derived OSMB.
- Targeted **12/12 shared OSM way histories (88 way versions)** and **906/906 source node histories (1,407 node versions)**. Seven reconstructed ways align fully with matched OSM sectors, five have partial correspondence / extended course.
- Extraction conditional on publisher's `Sort.Type_then_ID` declaration. Original source integrity receipt: `FULL_BASE_BYTES_VERIFIED_NOT_SOURCE_QUALIFIED`; no fresh independent full 152.64 GiB hash or exhaustive global sort certification. **OSM edit timestamps from 2008–2026 are not period-of-validity timestamps for RASSM 1924–1940.**

## Rebuilt polygon using source polygon vertices — new progress
- Original OSMB archives: Moldova 2026-10-05, Ukraine 2026-11-09; ICR undated and HURI eight historical candidate epochs.
- Baseline stage2 **59 segments** increased by **47 new source-preserving, topology-tested OSMB subchains** = **106 segments**. Accepted **47 out of 68 trial subchains** with nonoverlapping chainage.
- **632,281.272 m of original ICR chainage substituted, 66.336%** (baseline 317,112.338m / 33.27%). OSMB sector line length **666,487.736 m**.
- **320,867.399 m of ICR fallback** remains across **104 residual intervals**; **212 separately tagged non-OSM technical connectors**, total **39,584.345 m**. Do not describe this as an exclusively OSM sourced polygon.
- Reconstructed valid EPSG:32635 hybrid polygon: **8,433.536 km²**. Additional EPSG:4326 valid polygon for overlays on standard OSM, removing only 3 zero-area degenerate vertices induced by reprojection; original source sectors maintained separately and intact.
- Direct raw source OSMB polygon geometry verification: **all 106 sectors, 6,695 points, max numerical deviation 2.71375e-9 m**. Comparisons include separate HURI 1927 and 1937 distances, not legal acceptance tests.
- SQLite GPKG integrity `ok`, 8 vector layers, source hash manifests in ZIP.

## Immutable research deliverables on Google Drive

- [Stage 24 folder](../../../docs/historical/rassm/osm-reconstruction/PROVENANCE.md)
- [Complete research ZIP, 41 files, source extraction scripts, registries, QA, self-checking SHA256 manifest](../../../docs/historical/rassm/osm-reconstruction/PROVENANCE.md)
- [GeoPackage](../../../docs/historical/rassm/osm-reconstruction/PROVENANCE.md)
- [RASSM hybrid WGS84 GeoJSON](../../../docs/historical/rassm/osm-reconstruction/PROVENANCE.md)
- [Detailed audit report](../../../docs/historical/rassm/osm-reconstruction/PROVENANCE.md)
- [Vector map](../../../docs/historical/rassm/osm-reconstruction/PROVENANCE.md)

SHA256 of ZIP **6717236ed5c80863e9b21bc3024cb290cc2e0e29c4b9ba3951567e5aa1dde60e**. SHA256 of GPKG **3ddbf21203af817b8ca5adc15cc616a3a07128ea42a06419ccd7d9d56f4c9f9e**.

This branch records evidence only; **no ACTUAL, application, published Atlas GIS, QGIS CURRENT or previous PR modifications and no merge**. License: © OpenStreetMap contributors, ODbL; downstream database reuse must respect licensing. This draft follows PR #130.

**Next:** Target the remaining largest gaps (45.3, 29.5, 28.6 km etc.) using original OSM waterway ways, other boundary/admin ways beyond polygon layer, and HURI cross-epoch corroboration. Do not fabricate any missing sections or claim legal historic certification.
