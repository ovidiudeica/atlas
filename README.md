# Territorial Atlas

**Geography · History · Communities**

**Website:** [Territorial Atlas](https://ovidiudeica.github.io/atlas/)

Territorial Atlas (Romanian: *Atlas Teritorial*) is a planned bilingual geographic atlas for exploring administrative territories, statistical regions, historical geography, and communities through an interactive map.

## Project status

**Planning and initial design.** This repository currently contains documentation only. A project information page is published via GitHub Pages; the interactive map, data catalogue, and modules have not yet been implemented.

## Planned modules

- **Administrative** — current administrative units and statistical regions.
- **Historical** — historical territories and administrative boundaries.
- **Historical Romanian Communities** — geographically documented communities.
- **Historical Regions** — historical geographic regions.
- **Ethnographic Areas** — documented ethnographic territories.
- **Administrative-Territorial Reform** — exploration of territorial reorganization proposals.

The modules will share one map. The website will support English and Romanian, with English as the initial interface language.

## Initial administrative scope

The Administrative module will initially cover Romania and the Republic of Moldova. OpenStreetMap boundary data distributed through **OSM-Boundaries** is the main geometry source. The initial reference archives are dated **5 October 2026**.

Romania uses OSM administrative levels **2, 4, 8**, and **9 only for Bucharest's six sectors**. The Republic of Moldova uses levels **2, 3, 4, 5, 7, and 8**. All selected statistical levels are planned for inclusion, without duplicating entities that have both administrative and statistical roles.

Administrative identities and metadata will be reconciled with **SIRUTA** (Romania) and **CUATM** (Republic of Moldova). Original OSM tags and identifiers will be retained when available. The communes of **Brețcu** and **Ojdula** will use separately reviewed geometries; Brețcu will not be assigned a fictitious OSM identifier.

## Product principles

- A navigable parent–child hierarchy based on verified territorial relationships.
- Independent entity selection, map visibility, and hierarchy expansion.
- Short, human-readable names in the tree; full official names in entity cards.
- Original and topology-consistent simplified geometry display, controlled globally.
- Clear separation of source data, authoritative identifiers, derived fields, and geometry provenance.
- Responsive and accessible user interfaces for desktop and mobile.

## Documentation

See [PROJECT.md](PROJECT.md) for the initial scope, data policies, and approved design decisions. Repository documentation and technical contributions are written in English; the website will be bilingual.

## Licensing and attribution

No repository-wide license has been selected. Public availability does not grant permission to reuse the original code or documentation automatically. External datasets, map tiles, historical materials, and artwork will be reviewed under their respective licenses and attribution requirements before publication. OpenStreetMap data is subject to the ODbL and applicable attribution obligations.
