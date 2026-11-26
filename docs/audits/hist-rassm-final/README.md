# HIST-RASSM.FINAL: partial evidence package, no production admission

The recovered RASSM boundaries do not yet establish a historically admissible outline for 1924–1940. This change records the reproducible technical results and keeps admission closed. It introduces no runtime geometry, catalogue entity, parent link or ACTUAL data change.

## Executed work

- Recursively listed Geodata GIS, including ICR Maps and GeoSpatial, and relevant additional RASSM, Transnistria, Odesa and Tiraspol folders. The private inventory contains 1,390 unique metadata records. Its content review is incomplete and 33 search-only paths remain unresolved; this is not a claim of exhaustive Drive content coverage.
- Downloaded and opened the preceding HIST-RASSM.4/.5/.5a/.5b GIS and evidence packages. All 39 hashes in the three recovered archive checksum lists match.
- Recalculated eight HURI snapshots, 91 district features, 514 difference components and 95 deterministic control segments. Two geometric groups emerge at the stated numerical tolerance, not two certified legal territorial episodes.
- Retained HURI coordinates unchanged. The working 1937-01-15 outline measures **8,477.165018594918 km²** geodesically. Independent `QgsDistanceArea`/WGS84 and PyProj calculations agree.
- Downloaded the complete 116-page 1935 atlas; visually examined the map and roster on PDF pages 96–97. Balta is inside the mapped external border. The schematic map lacks an admitted independent physical GCP network: no georeferencing or boundary accuracy is certified.
- Downloaded public legal transcriptions, including the 1924-10-12 formation act, 1924-11-26 Balta reorganisation and 1926-09-29 external-border regulation. The 1926 text identifies 11 transfer objects and a separate recognition of Hrabariivka; their historical polygons remain unavailable.
- Rechecked all 33 council names from the 1935 act. The 1937 Tiraspol register has one inherited spelling discrepancy: `Володимирівська` versus the act's accusative `Володимировську`. Preserve both; do not infer geographic identity.
- Reopened a relative-path QGIS project and rendered the working outline over OSM Standard at general and NE/SE/Dniester views. This demonstrates display positioning only, not historical boundary fidelity or absence of systematic displacement.

## Reproduced comparison controls

Local equal-area projection: `+proj=laea +lat_0=47.4 +lon_0=29.3 +datum=WGS84 +units=m +no_defs`. These reproduce the preceding audit's method; they are not geodesic areas.

| Comparison | Recomputed symmetric difference, km² |
| --- | ---: |
| ICR–HURI 1927/1928 | 507.0066217899094 |
| ICR–HURI 1932–1937 | 475.80911505128523 |
| HURI 1927–HURI 1937 | 77.75211368319479 |

No boundary correction is claimed, so there is no invented “after reconstruction” improvement. Component records remain unresolved individually. Modern administrative edges are screening references, not substitutes for historical boundaries or river geometry.

## Admission remains closed

Verdict **C — partial completion with documented outstanding work**. All candidate outlines and district shapes remain class C; missing historical council polygons are D. No geometrically certified validity interval exists. Three HURI Tiraspol records (1933-12-15, 1934-05-30 and 1937-01-15) cannot establish the legal existence of a district between its dissolution and re-creation.

Outstanding dependencies include the complete source-content review, early boundary-commission/council geometries, an independently controlled georeferencing network, the 1939 map facsimile, historical river-course reconciliation, source reuse qualification and individual resolution of the 514 differences. The 1929 original image returned HTTP 429, and bounded Overpass requests failed; no access controls were bypassed.

The private GIS package is delivered separately to the user's designated Drive folder. Private inventory metadata and rights-uncleared source rasters are not published in this repository. The Python audit scripts require the delivered private input package and the pinned GIS dependencies; see `scripts/audit/hist-rassm-final/`. Do not load these candidates into the production historical module until an independent release assessment satisfies every admission condition.

## Public source references

- [1935 schematic atlas](https://imwerden.de/pdf/karty_sssr_po_rajonam_i_respublikam_na_1935__ocr.pdf), PDF pages 96–97.
- [RGO record for sheet 47](https://geoportal.rgo.ru/record/15906).
- [1924 formation act](https://uk.wikisource.org/wiki/ЗУРРСУУ/1924/1/47/Про_утворення_Автономної_Молдавської_СРР).
- [1926 border regulation](https://uk.wikisource.org/wiki/ЗУРРСУУ/1926/1/59/Про_врегулювання_державного_кордону_Автономної_Молдавської_Соціялістичної_Радянської_Республіки).
- [1935 council composition act](https://uk.wikisource.org/wiki/ЗЗРРСУУ/1935/3/Про_склад_нових_адміністративних_районів_АМСРР).

Public transcriptions and catalogue records are not authenticated archival facsimiles. Numerical and software validation never upgrades historical evidence automatically.
