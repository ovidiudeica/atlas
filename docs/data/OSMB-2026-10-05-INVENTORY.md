# OSM-Boundaries baseline — 2026-10-05

This inventory was calculated directly from the two supplied **OSM-Boundaries GeoJSON gzip archives**. It is evidence of selected source coverage, not a validated geometry release.

## Source integrity

| Archive | SHA-256 (compressed original) | Total features |
| --- | --- | ---: |
| `OSMB-Romania-2026-10-05.geojson.gz` | `cc4fd15940550054d90fcadf907ed98352b68882735680093f77a624e3e04897` | 3,395 |
| `OSMB-Moldova-2026-10-05.geojson.gz` | `d29b600daa2857bacf8ec7d13369db8fc95353e89f62fe1c762dbc692c216dad` | 2,734 |

## Selected original OSMB administrative polygons

| Country | 2 | 3 | 4 | 5 | 7 | 8 | 9 | Total |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Romania | 1 | — | 42 | — | — | 3,179 | 6 Bucharest sectors | **3,228** |
| Moldova | 1 | 1 | 37 | 10 | 5 | 982 | excluded | **1,036** |

Romania's **Brețcu** adds one separate reviewed entity absent from raw OSMB. Together with the reviewed Ojdula partition, the expected Romanian administrative candidate count is **3,229**. Raw OSMB Ojdula must **not** silently replace the approved reviewed partition.

The two original OSMB archives additionally contain **13 RO** and **8 MD** features tagged as statistical. These are **raw counts**, not the official statistical entity counts: RO has 12 standalone NUTS1/NUTS2 entities and MD has 6 standalone level2/level3 statistical entities. Official identities follow NUTS/MD nomenclature, not an unverified OSM statistical tag. MD114 and MD115 reuse existing administrative entities and geometries; RO NUTS3 reuses the 42 county/Bucharest entities.

## Moldova level3/5 geometry: integrated and source-verified in v2

The old v1 legacy administrative export did **not** contain the following OSMB relation IDs, now present in the **v2 candidate**:
`65335` (level 3), and level 5 relations
`1702216`, `944727`, `1702215`, `1706978`, `1706979`, `7103068`, `1702219`, `1702218`, `1702217`, `1702214`.

These **eleven have been integrated into candidate v2** with original OSMB tags and individually compared geometric edges (11/11 exact), as recorded in `data/candidates/phase3/sources/md-admin-additional.geojson.gz`. Some belong to the special Nistrenia tree, others to Găgăuzia. The candidate also contains all 12 standalone RO and six standalone MD statistical polygons, while preserving statistical vs administrative semantics. Source geometries were not invented.

## Source-only extracted archive

An offline source-only archive was generated during the audit with:
- RO selected administrative features (3,228), MD selected administrative features (1,036);
- RO statistical OSMB source features (13), MD statistical OSMB source features (8);
- file-specific hashes and inventory.

Its products have these compressed SHA-256 digests:

| Product | SHA-256 |
| --- | --- |
| RO administrative | `b1ef7931db6e3ad64c1132b336ca92dc53c608866ce9429161803006cfa343a5` |
| MD administrative | `a7791327f0fdfd9473e6ac0fff873b7f6264155f1476dd0b901d480b07325929` |
| RO raw statistical | `46c0924847b97014a2f5951e1b4986c26d65e72e92e75452fedc074c457484e2` |
| MD raw statistical | `c3683ef2443db598acd9f7fd22d4b81bed5608ad1f06f3ff0425680799e1399c` |

The complete extracted source products are **provenance evidence**. Their approved subsets are now staged separately in the v2 candidate (not the public website) and have exact source edge/tag evidence for all 31 cross-checked relations. The unresolved topology and CUATM collision cases still prevent merge and public release; see `docs/data/PHASE-3-TOPOLOGY.md`.
