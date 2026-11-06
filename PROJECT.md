# Territorial Atlas — Project Definition

**Status:** Live bilingual website through Phase 5 (6 November 2026); Administrative module implemented, other five modules planned. This file retains the approved product scope and records subsequent implementation status.

## 1. Purpose and identity

Territorial Atlas / Atlas Teritorial is a single bilingual (English/Romanian) cartographic website with six modules:

1. Administrative
2. Historical
3. Historical Romanian Communities
4. Historical Regions
5. Ethnographic Areas
6. Administrative-Territorial Reform

English is the default website language, with permanent **EN** and **RO** language controls. All modules use a shared interactive map. This GitHub repository is documented in English.

## 2. Administrative data scope

| Territory | Selected OSM administrative levels | Special handling |
| --- | --- | --- |
| Romania | 2, 4, 8, 9 | Level 9 is limited to the six sectors of Bucharest. |
| Republic of Moldova | 2, 3, 4, 5, 7, 8 | Special territorial and de facto administrative structures must retain their distinct classifications. |

The main boundary source is **OSM-Boundaries (OSMB)**, initially from archives dated **2026-10-05**. The reference OSM relations for national outlines are Romania `90689` and Republic of Moldova `58974`.

All selected statistical territorial levels will be included. In Romania, counties (and Bucharest at the corresponding statistical level) have both administrative and statistical roles, represented by **one entity and one reused geometry**. Administrative and statistical membership must remain semantically distinguishable.

### Identity and provenance

- **SIRUTA** is the authoritative administrative identity catalogue for Romania.
- **CUATM** is the authoritative administrative identity catalogue for the Republic of Moldova.
- OSM/OSMB supplies the main cartographic representations, original OSM identifiers where present, and source tags.
- Preserve original source records, multilingual and alternative names, official codes, source versions, and original OSM tags. Do not overwrite source values with display formatting or inferred fields.
- Reconcile source identities and parentage explicitly. A geometric containment result does not by itself establish legal or statistical parentage.
- Keep the original geometry and provenance, even if a separate display representation is produced.

### Brețcu and Ojdula

Two previously reviewed territorial geometries in Covasna County will be included:

- **Brețcu** — SIRUTA `64096`, administrative level 8, no authentic OSM relation ID.
- **Ojdula** — SIRUTA `64602`, administrative level 8, OSM relation `14735731`.

Both will appear as ordinary communes in the public tree and entity cards, without a correction badge or special warning. Brețcu receives the same application fields as other units, but its **OSM ID remains `null` in structured data and displays as an empty field in its card**. Never invent an OSM relation ID or misattribute original OSM tags. Underlying geometry lineage and source distinctions remain recorded in technical metadata.

## 3. Administrative tree

The Administrative module has two main roots: **Romania** and **Republic of Moldova**. It follows the **parent–child navigation pattern** of OSM-Boundaries while using independently validated administrative and statistical relationships.

- One direct parent per tree node, except roots.
- No fabricated intermediate administrative levels.
- Expand or collapse a branch independently of map geometry visibility.
- Select or highlight a unit without automatically displaying all descendants.
- Administrative and statistical roles may coexist on one entity; the geometry is not duplicated.
- Statistical groupings are not presented as legal administrative authorities.
- In the tree, show **short names** (for example, “Covasna”, “Brețcu”, “Chișinău”). In entity cards, show **complete official names** (for example, “Județul Covasna”, “Comuna Brețcu”).
- Use normal Romanian title capitalization for proper names, not all capitals. Preserve the original source strings separately.
- An **OSM ID** field exists for all applicable entity cards. Its value is blank when there is no genuine identifier.

## 4. Map and display behavior

The initial map shows only the national outlines of Romania and the Republic of Moldova; the initial viewport fits both. A map **Home** action restores the initial geographic extent without resetting the selected modules, layers, filters, language, or basemap.

A global **Simplified geometries** control is placed in the map toolbar next to the basemap control. The default is **off** (original geometry). When enabled, all modules use simplified display representations where available. Simplification must preserve shared-border topology; it does not alter source geometries or exports. Changing this setting does not alter tree selection, displayed layers, or map extent.

Basemap choices include an OpenStreetMap-based map and the ability to hide the basemap, subject to applicable provider terms and attribution. A compact module toolbar is planned for desktop, with an accessible mobile equivalent. The Phase 2–5 implementation uses React, MapLibre GL and static certified cartographic assets; interface decisions and testing are documented in `docs/implementation/`.

## 5. Data handling and licensing

Data sources can have distinct rights and attribution requirements. Document the source, dataset version, retrieval date, identifiers, licensing basis, and transformations. Do not claim that cartographic boundaries automatically have legal authority.

### Permanent source-exception acceptance (2026-11-06)

The accepted OSMB 2026-10-05 cartographic baseline, including all documented geometry and CUATM-source exceptions, is preserved without artificial corrections. These cases do **not** block continued website/module development or the present cartographic release; legal boundary certification and four uncertain CUATM multipart mappings remain expressly unproven. Any later adjustment requires independently verifiable official evidence, versioned data, topology and regression checks, and an explicit separate release decision. See [ADR-0002](docs/architecture/ADR-0002-osmb-source-exceptions.md).

The repository still has no repository-wide `LICENSE` file. The code/documentation licence and the data-rights policy require a separate explicit decision; public access does not grant unrestricted reuse. GitHub Pages is active at https://ovidiudeica.github.io/atlas/ and retains OpenStreetMap/OSMB attribution and source caveats.

## 6. Implemented scope and boundaries

This is a **new project**, not a wholesale migration of the previous Reforma Teritorială repository. Previously reviewed Covasna geometries, source mappings, and relevant technical approaches may be adopted individually with validation; unrelated code, data, and workflow infrastructure are not imported automatically.

The live Administrative module now serves the certified-for-cartographic-use Phase 3 RO/MD source snapshot via the Phase 4 4,283-entity tree and Phase 5 navigation, share links and source-faithful exports. Phase 3/4 files, original geometries and evidence remain immutable during UI maintenance. See `docs/implementation/PHASE-4.md`, `docs/implementation/PHASE-5.md` and the Phase 3 certification. The other five modules remain future work.
