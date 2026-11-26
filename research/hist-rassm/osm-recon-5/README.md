# HIST-RASSM.OSM-RECON.5 — three longest remaining gaps (research C)

**20 November 2026. Non-admission verdict; no changes to the candidate RASSM border geometry.** The three priority residual ICR arcs total **80.004 km**: `GAP4-0084` (28.589 km), `GAP4-0095` (27.678 km), and `GAP4-0107` (23.736 km).

## Executed comparison

- Three successful direct read-only OpenStreetMap 0.6 map API requests, expanded over the three gaps, produced **157 distinct individual OSM ways**. The three raw responses and SHA-256 validation are preserved in the dossier.
- **83 nearby ways** (24, 22, 37 respectively) underwent geographic proximity and shape screening, direction/progress and chain-length tests, with **664 individual OSM-way / HURI-epoch comparisons** and **24 ICR / HURI-epoch comparisons** across **all eight dated snapshots**. Thirty-two directional test windows are registered, none adopted.
- The authorized 163,893,678,040-byte local OSM full-history PBF was selectively read for **12/12 OSM ways, 254 way-version records**, and **795/795 original first-edition node IDs, 1,450 node versions**. First OSM edit versions of all 12 ways were geometrically replayed with node positions at those edit timestamps. These OSM edits are from 2011 onward, not evidence of administrative borders in 1924–1940. Global sorting/source historical completeness are not certified.
- Important distinctions: OSM `way/331592891` is part of a `boundary=place` relation, not `boundary=administrative`. `way/1018626239` is locally parallel in a single long straight node-to-node edge, insufficient by itself to prove border morphology. The Tiligul and Platonivska rivers cross or approach the ICR/HURI traces locally but do not reproduce the required continuous border.

## Audit and results

- **No additional geometry admitted:** 116 previous OSM-source sectors, **74.792%** ICR-chainage coverage, **108 ICR fallback arcs = 240.270 km**, **216 technical connectors**, and candidate area **8,442.815 km² (UTM 35N)** all unchanged.
- A new **17-layer GeoPackage** contains the identical **12 previous layers (WKB digest equality confirmed for each)** and five audit-only layers: three target gaps, 157 direct OSM ways, 24 local HURI dated references, 12 first-edit OSM ways and 32 morphological test windows. GeoPackage passes SQLite integrity check; original geometry remains valid.
- No A/B historical source admitted (0m). This is strictly **research class C**. Modern OSM history, historical HURI reference shapes and an undated ICR trace must remain separately qualified.

## Artifacts

- [Research dossier and all original data receipts (ZIP, 36 files)](../../../docs/historical/rassm/osm-reconstruction/PROVENANCE.md)
- [17-layer GeoPackage](../../../docs/historical/rassm/osm-reconstruction/PROVENANCE.md)
- [Precise three-gap vector overview](../../../docs/historical/rassm/osm-reconstruction/PROVENANCE.md)
- [Romanian probative report](../../../docs/historical/rassm/osm-reconstruction/PROVENANCE.md)
- [SHA/QA and metrics](../../../docs/historical/rassm/osm-reconstruction/PROVENANCE.md)

**Copyright:** © OpenStreetMap contributors (ODbL), plus independently attributed ICR/HURI research. No changes to canonical ACTUAL, website, main branch or QGIS CURRENT. Draft PR for evidence only; not intended for merge/promotion without separate approval.

Next investigation, only if needed: locate **deleted or relation-excluded OSM ways** from the local full-history archive, spatially index them in the three corridors, and replay synchronous way/node versions; modern map API cannot return complete deleted-way coverage.
