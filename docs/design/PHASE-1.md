# Phase 1 — Interface Design Specification

**Status:** Design candidate for review (not the accepted production UI)  
**Target:** Territorial Atlas / Atlas Teritorial  
**Repository:** `ovidiudeica/atlas`  
**Date:** 2026-11-05

## Outcome

Establish a single coherent, responsive, bilingual (EN/RO) user experience for the six Atlas modules, starting with Administrative. Phase 1 fixes the proposed information architecture, design language, interaction contracts, and technical direction. It does **not** integrate the administrative catalogue or replace the live GitHub Pages site.

## Navigation and layout

### Desktop (reference width: 1440px)

1. **Top header:** compact atlas mark, product title and tagline, unobtrusive prototype/status text, EN/RO language switch.
2. **Left module rail (about 66px):** six vertically stacked icon buttons. Tooltip on hover and keyboard focus; descriptive accessible name at all times.
3. **Territorial tree (about 294px):** search field, RO and MD roots, expandable hierarchical branches, independent geometry checkboxes, selected row.
4. **Shared map (flexible):** occupies the primary central area. The basemap selector and global geometry-simplification control sit together at the top-left; zoom and Home controls at the top-right.
5. **Entity details (about 317px):** full official name, country/breadcrumb, informational tabs, code and classification fields, geometry/source information.

### Mobile (reference width: 390px)

- Header keeps the product title and EN/RO control.
- The map occupies the available screen.
- Six modules are accessed through compact bottom navigation with **visible short labels** and full accessible names; icon buttons have at least a 44px target.
- Tree and entity card become independent slide-in panels, opened with **Tree** and **Details** controls. Opening one closes the other.
- Basemap and simplification remain available without opening an administrative module.
- Dialog-like panels must ultimately manage focus and support Escape dismissal, tested with keyboard and screen readers.

### Tablet (reference width: 820px)

- Narrow module rail and tree remain visible; the entity card is opened as a side panel.
- Map controls avoid overlap with the card and zoom controls.

## Design foundations

| Token | Candidate value | Purpose |
| --- | --- | --- |
| `forest-900` | `#123C31` | Main navigation, headings, brand |
| `forest-700` | `#19503F` | Secondary emphasis |
| `sage-600` | `#547B69` | Secondary text and metadata |
| `mint-100` | `#D9E9E0` | Soft boundaries, selected surfaces |
| `mist-50` | `#F2F6F3` | Quiet panels |
| `white` | `#FFFFFF` | Content surfaces |
| `ink` | `#233B31` | Body text |
| `focus` | `#E6A73D` | Keyboard focus indicator |

Candidate typography: a readable UI sans-serif (Inter with system fallback), and a serif accent for the main product title and panel titles. Final branded logo artwork must follow the previously discussed real-geometry cartographic direction; the prototype icon is only a placeholder.

Prefer a calm map-first visual language over bright dashboards. Buttons must be consistent and have obvious pressed/selected/focus states. Avoid dense metadata in the map itself.

## Interaction contracts

### Initial state

- Active module: **Administrative**.
- Language: **English**, with permanent **EN/RO** choice.
- Only national geometries **Romania (OSM 90689)** and **Republic of Moldova (OSM 58974)** visible.
- All descendants hidden; tree expansion is independent of geometry visibility.
- Map viewport fits the two countries.
- Geometry display mode: **Original**, not simplified.

### Tree and detail card

- Name click selects an entity and populates its card; it does not toggle geometry visibility.
- Checkbox toggles only that entity's geometry; it does not toggle children.
- Chevron expands/collapses children without changing visibility or selected entity.
- Tree labels use short names; cards use official full names with normal proper-name capitalization.
- SIRUTA/CUATM remain the registry identifiers. Display an **OSM ID** row even if the entity lacks an authentic OSM ID; in that case display a **blank value**, not a dash or synthetic ID.
- Brețcu and Ojdula use the same ordinary public card design as other communes. Source provenance remains in technical lineage without a public correction badge.
- Administrative and statistical roles are separately stored. Statistical grouping in the tree must not be interpreted as a statutory parent.

### Shared map

- **Home** resets only viewport; it preserves selection, visibility, filters, basemap, and language.
- Basemap selector supports standard, grayscale, dark, and no-basemap modes. The Phase 1 preview uses **illustrative backgrounds**, not production tiles.
- **Simplified geometries** is a global on/off switch, adjacent to the basemap selector. It changes only display representation, not source geometry or selected layers.
- Production must precompute topology-safe simplified geometries at shared edges and verify absence of gaps/overlaps introduced by simplification.
- Export, when implemented, defaults to original source geometry independently of the current display mode.
- The map preserves provider attribution as appropriate; verified tile provider and policies are selected in Phase 2.

### Unimplemented modules

The five other module buttons are visible and accessible in the Phase 1 prototype, but their datasets and workflows are **not yet implemented**. Do not claim that a future module is usable merely because its navigation entry exists.

## Prototype scope and limitations

The accompanying stand-alone HTML design prototype demonstrates: the EN/RO switch, six-module navigation, initial RO/MD outlines, a subset of the administrative/statistical tree, independent expansion/selection/visibility, a Brețcu card with blank OSM ID, background visual variations, global simplified geometry switching, pan/zoom/Home, and mobile drawers.

The polygon paths used for national and Covasna *preview rendering* were derived from the supplied **OSM-Boundaries 2026-10-05** archives. They are reduced for illustration, not the production geometry catalogue. Brețcu/Ojdula geometries are **not** included in this Phase 1 prototype; their canonical geometry integration belongs to Phase 3. Example tree nodes are a navigation illustration, not the exhaustive validated hierarchy.

## Acceptance checklist (human review before Phase 2)

- [ ] Desktop and mobile composition approved.
- [ ] Position of tree, entity card, language control and six-module navigation approved.
- [ ] Basemap and global simplification controls approved.
- [ ] Typography, colors and real-geometry logo direction approved.
- [ ] Bilingual wording approved.
- [ ] Keyboard, zoom, selection and responsive panel behaviors accepted for implementation.
- [ ] Phase 2 technical stack approved through ADR-0001.

Until accepted, this branch is **not merged** and does **not** change GitHub Pages.
