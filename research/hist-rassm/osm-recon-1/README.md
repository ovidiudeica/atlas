# HIST-RASSM.OSM-RECON.1 — Geometric reconciliation ICR–HURI–OSMB

**Date:** 2026-11-19. **Status:** Research C; NOT a historically certified RASSM boundary. No ACTUAL, Atlas or QGIS CURRENT changes.

## Executed

- Re-read the undated ICR RASSM polygon (1,130 distinct exterior vertices) and all eight HURI temporal candidate outlines (3,003 vertices in 1927/1928; 987 in 1937).
- Compared against the pinned OSMB Moldova **2026-10-05** and Ukraine **2026-11-09** archives. They contain 2,734 and 15,031 polygon features respectively; these are **current OSM snapshots, not historical OpenStreetMap revisions**.
- From 1,402 previously prepared OSMB candidate arcs, evaluated 352 arcs in a 500 m ICR search band, yielding 125 geometric candidate fragments. Chose **53 shape-matched sectors** from the original OSMB coordinates while retaining ICR fallbacks for unresolved sections. Orientation, monotonic chainage and offset were screened, not just proximity. A second 1.8 km search identified **7 parallel segments for review**; these are NOT adopted.
- Built a **valid hybrid candidate polygon** in EPSG:4326: **8,399.057 km²** (area measured in UTM 35N); **294.695 km of OSMB shape-matched arc** replaces **280.964 km of original ICR chainage (29.48%)**. The hybrid retains **672.185 km of ICR fallback**, with **106 explicitly labelled artificial connectors totaling 19.413 km**, across 54 gaps. This is **NOT a polygon exclusively composed of OSM boundaries**.
- Independently verified all 53 selected sectors against the ORIGINAL raw OSMB polygon boundaries, not only upstream derived arc geometry: **121 distinct OSM relation IDs**, **3,705 sample positions**, maximum numerical deviation approximately 2.1 × 10⁻⁹ m, i.e. effectively identical coordinates. This checks provenance, **NOT historical accuracy**.
- GeoPackage SQLite integrity check OK; all seven GIS layers load, every selected geometry valid, polygon valid; perimeter equals component sum to ~0.006 m.

## Research delivery on Drive

- [Stage folder](../../../docs/historical/rassm/osm-reconstruction/PROVENANCE.md)
- [GIS GeoPackage](../../../docs/historical/rassm/osm-reconstruction/PROVENANCE.md)
- [Full package including reproduce scripts, data registers, QA, SHA-256 manifest](../../../docs/historical/rassm/osm-reconstruction/PROVENANCE.md)
- [Detailed research report](../../../docs/historical/rassm/osm-reconstruction/PROVENANCE.md)
- [Visual map](../../../docs/historical/rassm/osm-reconstruction/PROVENANCE.md)

Exact SHA-256 of the uploaded ZIP (verified after Drive download):
`176daa6ed25bef505d14106a20586bf8a7f1b8eb41b152f9ef581e45ff57b0c6`.
GeoPackage SHA-256:
`e31c3d864c8ff73d012fa074677640feaf0fd4357c063927c491b84d688b83bf`.

## Do NOT conflate

1. Morphological matching to a modern OSM relation and historic validity of its boundary in 1924–1940.
2. ICR fallbacks/artificial joining segments and authentic OSM source geometry.
3. HURI snapshot dates, ICR's generic 1924–1940 label, and legal effective dates.

**A/B historical admissions:** 0. **ACTUAL/Atlas modifications:** 0. **Publication:** none. **No institutional requests or payments.**

**Next:** OSM-RECON.2: individual audit of 7 parallel segments and 54 unresolved gaps; retrieve independently dated historical OSM/linked relation evidence, then assess any additional substitutions without fabricating missing boundary portions.

© OpenStreetMap contributors, ODbL. Research-only reference to source geometry; observe the ODbL obligations for any downstream public derivative database.
