# Territorial Atlas

**Geography · History · Communities**

**Website:** [Territorial Atlas](https://ovidiudeica.github.io/atlas/)

Territorial Atlas (Romanian: *Atlas Teritorial*) is a live bilingual cartographic website for Romanian and Moldovan administrative and statistical territories. Historical geography, ethnographic areas and communities are planned for later modules.

## Project status

**Phase 5 — refined interactive administrative and statistical atlas.** The bilingual website is active on GitHub Pages. Romania and the Republic of Moldova now have a certified-for-cartographic-use OSM-Boundaries snapshot dated 5 October 2026, with **4,283 searchable and navigable administrative/statistical entities**, original source metadata, official SIRUTA/CUATM codes, and detailed or topology-consistently simplified display geometry. Phase 5 adds ancestry breadcrumbs, sibling navigation, map fitting for selected/visible entities, keyboard search, shareable map links and browser-side GeoJSON/CSV exports. GeoJSON always uses the original detailed geometry independently of the simplified map display. Other modules remain planned. Source-exception acceptance does not constitute legal certification of borders.

## Planned modules

- **Administrative** — current administrative units and statistical regions.
- **Historical** — historical territories and administrative boundaries.
- **Historical Romanian Communities** — geographically documented communities.
- **Historical Regions** — historical geographic regions.
- **Ethnographic Areas** — documented ethnographic territories.
- **Administrative-Territorial Reform** — exploration of territorial reorganization proposals.

The modules will share one map. The active Administrative module supports English and Romanian, with English as the initial interface language.

## Initial administrative scope

The Administrative module covers Romania and the Republic of Moldova. OpenStreetMap boundary data distributed through **OSM-Boundaries** is the main geometry source. The initial reference archives are dated **5 October 2026**.

Romania uses OSM administrative levels **2, 4, 8**, and **9 only for Bucharest's six sectors**. The Republic of Moldova uses levels **2, 3, 4, 5, 7, and 8**. All approved statistical levels are included without duplicating entities that have both administrative and statistical roles.

Administrative identities and metadata are reconciled with **SIRUTA** (Romania) and **CUATM** (Republic of Moldova) wherever supported by the source. Complete original OSM tags and matched official register records are preserved. The communes of **Brețcu** and **Ojdula** use separately reviewed geometries; Brețcu does not have an OSM relation ID and its public OSM ID field remains blank. Four source-level CUATM multipart identity mappings remain marked as not legally established.

## Product principles

- A navigable parent–child hierarchy based on verified territorial relationships.
- Independent entity selection, map visibility, and hierarchy expansion.
- Short, human-readable names in the tree; full official names in entity cards.
- Original and topology-consistent simplified geometry display, controlled globally.
- Clear separation of source data, authoritative identifiers, derived fields, and geometry provenance.
- Responsive and accessible user interfaces for desktop and mobile.

## Documentation

See [PROJECT.md](PROJECT.md) for the initial scope, data policies, and approved design decisions. The accepted data certificate is documented in [Phase 3 certification](docs/data/PHASE-3-CERTIFICATION.md), the navigable application in [Phase 4 implementation](docs/implementation/PHASE-4.md), and interaction/export features in [Phase 5 implementation](docs/implementation/PHASE-5.md). Repository documentation and technical contributions are written in English; the website is bilingual.

## Licensing and attribution

No repository-wide license has been selected. Public availability does not grant permission to reuse the original code or documentation automatically. External datasets, map tiles, historical materials, and artwork will be reviewed under their respective licenses and attribution requirements before publication. OpenStreetMap data is subject to the ODbL and applicable attribution obligations.
