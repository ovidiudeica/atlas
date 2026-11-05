# ADR-0001 — Frontend and Cartographic Architecture

- **Status:** Proposed for Phase 1 acceptance
- **Date:** 2026-11-05
- **Decision scope:** First production implementation of the Atlas frontend
- **Implementation status:** Not started

## Context

Territorial Atlas must serve a bilingual static website through GitHub Pages; render thousands of complex RO/MD administrative polygons with many original OSM tags; integrate official SIRUTA/CUATM identities and statistical roles; support independent visibility, selection and tree expansion; and later accommodate five thematic modules on the same map.

The previous Reforma Teritorială project is a reference, **not** an application template or an automatically imported corpus.

## Proposed decision

Build a **static, client-side application** using:

- **Vite + TypeScript + React** for maintainable modular UI, localization, typed records, and responsive panel interactions.
- **MapLibre GL JS** for the shared interactive cartographic canvas and vector/raster styling.
- **Preprocessed static vector tiles**, with PMTiles as a candidate distribution format for large geometry corpora, and GeoJSON permitted for small boundaries and local development.
- A **separate, versioned JSON entity catalogue** for official identities, source metadata, role classifications and validated hierarchy, decoupled from geometry storage.
- A tree component that **virtualizes expanded rows** once large hierarchy performance is measured.

Use GitHub Actions only for necessary static build, schema validation and meaningful regressions; deploy to GitHub Pages only after reviewed changes have passed required checks. Avoid importing the previous project's oversized CI infrastructure.

## Module boundaries

```text
src/
  app/             navigation, layouts, language, global state
  components/      tree, search, entity card, toggles, dialogs
  map/             MapLibre adapter, basemap manager, camera, layer registry
  modules/
    administrative/
    historical/
    communities/
    historical-regions/
    ethnographic/
    reform/
  data/            typed schemas, catalogue client, provenance and normalization
  i18n/            en/ro dictionaries and locale-specific display selectors
public/
  data/            versioned, validated release artefacts (when ready)
```

Only the Administrative module is initially active. All modules register layers through the **same map controller**. The map DOM and its viewport are not recreated on module change.

## Identity and geometry contracts

A logical entity is identified by a stable Atlas internal ID and can have several external identity roles. An OSM relation ID is *optional*, while SIRUTA/CUATM values and their source versions are preserved separately.

Illustrative TypeScript types:

```ts
type TerritoryId = string;

interface ExternalIdentity {
  system: "OSM" | "SIRUTA" | "CUATM" | "NUTS" | "MD_STAT";
  code: string;
  sourceVersion: string;
}

interface Territory {
  id: TerritoryId;
  shortName: Record<string, string | undefined>;
  officialName: string;
  entityType: string;
  administrativeParentId: TerritoryId | null;
  treeParentId: TerritoryId | null;
  statisticalMemberships: string[];
  adminLevel: number | null;
  osmRelationId: number | null; // never invented
  identities: ExternalIdentity[];
  sourceTags: Record<string, string>; // original OSM tags, if present
  geometryRef: string | null;
  geometrySource: string | null;
}
```

`treeParentId` is navigational and must not silently assert the legal authority implied by `administrativeParentId`. Shared administrative/statistical roles refer to **one** entity; overlapping layers remain distinct as necessary.

**Brețcu:** SIRUTA `64096`, OSM relation ID `null`, geometry from the approved reviewed source. Its card includes an *empty* OSM ID value; no visible correction label.  
**Ojdula:** SIRUTA `64602`, existing OSM relation `14735731`, geometry from the approved reviewed source. No visible correction label.

Avoid using OSM tag assertions to manufacture legal status; retain every raw tag and clearly separate Atlas-inferred classification from original OSM tags.

## Independent application state

```ts
interface AtlasState {
  locale: "en" | "ro";
  activeModule: string;
  selectedEntityId: TerritoryId | null;
  expandedTreeIds: Set<TerritoryId>;
  visibleGeometryIds: Set<TerritoryId>;
  basemapId: string;
  displaySimplified: boolean;
  camera: { center: [number, number]; zoom: number; bearing: number };
}
```

Selecting a row does not set its visibility. Expanding a node does not affect selection. A parent's visibility does not cascade to children. Home changes only `camera`.

The initial `visibleGeometryIds` set contains only the two state borders. Locale and simplified display are candidates for local persistence; URL/history details can be decided during implementation without changing the interface contract.

## Geometry pipeline

1. Capture exact source snapshots, rights and hashes. Do not modify raw source files.
2. Validate identities, source tags, classifications, administrative/statistical roles and hierarchy separately.
3. Materialize canonical geometry references and render-ready geometry without replacing the canonical data.
4. Build topology-preserving simplified render layers **jointly**, so adjacent boundaries use the same shared edges.
5. Validate coverage, intersections, symmetric differences and changes to shared boundaries.
6. Generate immutable, versioned tiles/data manifests for the website; record source lineage and hashes.
7. Keep source geometry accessible for future data export, subject to licensing.

**Caution:** MapLibre's visual simplification or independent simplification of individual polygons is *not* a substitute for topological simplification at shared borders.

## Basemaps and attribution

Provide Standard, Grayscale, Dark and No-basemap choices as interface modes. Select and validate the actual tile service/style and usage policy **before Phase 2 publication**. Map overlays are sourced from OSM-Boundaries, not implicitly from the basemap. OSM attribution and ODbL obligations are preserved. Do not assume unrestricted public OSM tile usage at scale.

## Language and formatting

- UI translations: English initially, Romanian available globally.
- Navigation shows locale-appropriate short names where sourced; detail cards show source-backed full official names.
- Correct capitalization is applied to display selectors only; do not rewrite raw registry names or OSM tag values.
- User-facing source identifiers and card labels remain language-appropriate.
- Missing `osmRelationId` produces a **blank card cell**, not `0`, a dash, or a generated ID.

## Accessibility, security, and performance gates

- Semantic tree and keyboard navigation, visible focus, screen-reader names for module icons, and touch controls ≥44px.
- Responsive minimum tested widths: 390px mobile, 820px tablet, 1440px desktop; no horizontal scroll.
- No dynamic HTML interpolation of untrusted OSM tag values; use text content and safe URL handling.
- Profile initial map, tree, layer switching and geometry mode against actual full datasets before setting budgets.
- Test control independence (tree, map and module), locale persistence, Home behavior, missing OSM ID and shared-border topology.
- Static assets use content hashes and versioned manifests, preventing mismatched data releases.

## Alternatives considered

- **Leaflet plus un-tiled raw GeoJSON:** appealing for small prototypes, but problematic as the primary full-corpus rendering strategy.
- **Copying the old application framework:** risks importing unrelated legacy complexity and assumptions.
- **Moving data into a hosted database immediately:** adds operations and hosting dependencies without demonstrated need.

## Consequences

This approach is well suited to GitHub Pages and future modules, but it adds a preprocessing step and requires careful, independently verified data provenance and topology handling. It also avoids making a design prototype look like an authoritative administrative release.

**Decision still requiring acceptance:** use the proposed TypeScript/React/MapLibre stack for Phase 2. The Phase 1 prototype is standalone HTML/JS and intentionally does not pre-empt the production framework.
