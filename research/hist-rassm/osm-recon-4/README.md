# HIST-RASSM.OSM-RECON.4 — Individual OSM ways versus ICR/HURI gaps

2026-11-19. **Research C only. A/B historical boundary admitted = 0 m.**

Executed 11 direct OSM API 0.6 regional map requests for the biggest gaps (11 successful, 0 failed), yielding 296 distinct ways, including rivers and historical/administrative relation members. Ten selected OSM-source subchains preserve original node coordinates and pass individual topology and ICR/HURI shape comparisons.

**Raw OSMB provenance audit:** exactly 3 selected ways are outside both original Moldova/Ukraine OSMB polygon boundaries: Codâma/Kodyma and Sukha Zhuravka river centerlines. Seven selected OSM ways are ALREADY in the original raw OSMB boundaries. Of those, six were in derived arc candidates and one (way 130189993) in raw historical Ukrainian raion polygons, not derived arc candidates. A historical tag in 2026 OSM does not establish RASSM 1924–1940 jurisdiction.

Result: 116 OSM selected sectors, 712,878.666 m = 74.792% of ICR chainage replaced geometrically, +80,597.394 m over stage 3; 240,270.006 m ICR fallback across 108 separate segments; 216 explicitly artificial connectors (43,121.106 m) and 8 sub-mm numeric Point joins. Valid 12-layer GeoPackage, valid hybrid polygon 8,442.815 km2 UTM35. No legal/historical A/B claims.

Original local 152.64 GiB OSM history PBF indexed lookups on authorized device: 10/10 OSM way IDs and 254 way-version observations; 2,248/2,248 node IDs, 4,166 node-version observations. Current API geometries match last PBF way/node versions **exactly** at OSM coordinate precision, with no missing nodes. Not a legal historical source, publisher ordering not exhaustively globally certified.

Research artifacts: [Complete 32-file ZIP](../../../docs/historical/rassm/osm-reconstruction/PROVENANCE.md), [12-layer GeoPackage](../../../docs/historical/rassm/osm-reconstruction/PROVENANCE.md), [WGS84 GeoJSON](../../../docs/historical/rassm/osm-reconstruction/PROVENANCE.md), [vector map](../../../docs/historical/rassm/osm-reconstruction/PROVENANCE.md), [Romanian evidence report](../../../docs/historical/rassm/osm-reconstruction/PROVENANCE.md), [full stage folder](../../../docs/historical/rassm/osm-reconstruction/PROVENANCE.md).

No changes to main, ACTUAL, Atlas website, QGIS CURRENT, or prior research branches. Draft only; no merge requested. River centerlines are not automatically historic legal boundaries; source geometry may be replaced on stronger historical evidence. © OpenStreetMap contributors, ODbL.

Next: prioritize 28.59km, 27.68km, 23.74km residual ICR gaps, explore additional individual OSM natural/hydrographic/administrative ways and evaluate dates and topology individually.
