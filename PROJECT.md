# Territorial Atlas — Project Definition

**Status:** Approved initial product scope; implementation has not started.

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

Basemap choices include an OpenStreetMap-based map and the ability to hide the basemap, subject to applicable provider terms and attribution. A compact module toolbar is planned for desktop, with an accessible mobile equivalent. Final UI details and implementation technology remain to be selected and tested.

## 5. Data handling and licensing

Data sources can have distinct rights and attribution requirements. Document the source, dataset version, retrieval date, identifiers, licensing basis, and transformations. Do not claim that cartographic boundaries automatically have legal authority.

The repository begins without a `LICENSE` file. A code/documentation license and the data-rights policy will be chosen separately before distribution requiring those permissions. GitHub Pages will remain inactive until a first working website is reviewed and accepted.

## 6. Current implementation boundary

This is a **new project**, not a wholesale migration of the previous Reforma Teritorială repository. Previously reviewed Covasna geometries, source mappings, and relevant technical approaches may be adopted individually with validation; unrelated code, data, and workflow infrastructure are not imported automatically.

The initial repository contains only `README.md` and `PROJECT.md`. No website implementation, dataset import, or publication is implied by these documents.
