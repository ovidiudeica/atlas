# HIST-MODULE.1 — Shared geometry and chronological use in Entity panel

Status: **data contract and reusable Entity view component prepared, integrated with existing global i18n labels; historical datasets not yet admitted into the website**.

## Requirement

One unique physical geometry may serve any number of documented historical entities and temporal versions. The source geometry is stored **once**, while each historical use is a separate record pointing to the same `geometryId`. In the **Entity** detail panel, selecting the geometry must list **all uses of that geometry**, ordered chronologically, including uses outside the currently selected year.

The generic `GeometryUsesSection` implements this list for the **existing shared Entity panel**, to be wired in once the historical catalogue exists. It receives the shared geometry identifier, all temporal-use records, the **website-global `lang`**, and the corresponding labels from **the one `App.WORDS[lang]` translation registry**. It creates neither a separate RO/EN selector nor module-specific language state. It does not fetch, duplicate or infer boundaries.

### Canonical relationships

- `geometryId`: a physical polygon/multipolygon (topology and coordinate precision audited separately).
- `canonicalHash`: fingerprint calculated in the canonical GIS build step, after a declared CRS/precision/geometry-normalization policy. A fuzzy match is **not** sufficient to deduplicate.
- `entityId`: historical identity (a name change, administrative status or parent relationship is not automatically a new geometry).
- `useId`: independent temporal use referencing `geometryId` and `entityId`.
- `kind=reference`, `at`: an **observed year/date** of a mapped geometry; does not assert unchanged borders beyond that point (e.g., Mosaic Austro-Hungarian Empire **1910**).
- `kind=interval`, `from`/`to`: a documented period; either bound can be unknown. No default dates are invented.
- `sourceIds`, `evidenceStatus`, localized names and notes preserve provenance and editorial qualification.

### Entity presentation

Show all periods / reference dates chronologically (earliest first, BCE supported; undated uses last). For each use show the **actual historical name**, exact date/interval **at the available precision**, source identifiers, status (**cartographically accepted / candidate / under review**) and optional notes. Retain separate records even if they display the same temporal dates when sources or historical identities differ.

Card example (illustrative only, **not an assertion that the following entities share a verified geometry**):

- `1859–1862` — hypothetical historical entity, source X, under review
- `Reference date: 1910` — hypothetical historical entity, source Y, candidate
- `From 1945` — hypothetical historical entity, source Z, under review

### Historical evidence safeguards

- No extrapolation of 1910 boundaries to every year in 1867–1918.
- No false legal boundary certification from geometry validity alone.
- No automatic collapsing of slightly different contours based only on a Hausdorff tolerance.
- A single geometry can be shared across multiple entities *only after* equivalence is established in the GIS audit.
- Original-source records, licenses and attribution stay accessible.
- No changes to ACTUAL administrative/statistical geometries or existing Administrative Entity cards.

## Implementation scope

- `src/data/historicalGeometryUses.mjs` — validation, chronology, reference-vs-period formatting, deduplication integrity.
- `src/data/historicalGeometryUses.d.mts` — strict TypeScript contract.
- `src/components/GeometryUsesSection.tsx` — module-independent Entity panel section using global RO/EN labels and state, **ready to connect**.
- `src/App.tsx` — adds geometry-use UI labels to the existing global EN/RO translation registry, not a new translation system.
- `tests/historicalGeometryUses.test.mjs` — sorting, shared-geometry reuse, BCE, precision, invalid intervals, duplicate/dangling IDs.

**Next integration gate:** admit the first qualified historical geometry catalogue and connect `GeometryUsesSection` to historical selection inside the existing Entity pane. Until then, the existing Historical module remains a placeholder; the new component must not display fictional records.
