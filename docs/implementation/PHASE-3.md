# Phase 3 — Administrative and Statistical Data Integration

**Status: CANDIDATE / BLOCKED — NOT AUTHORIZED FOR PRODUCTION.**

This branch stores a tangible candidate with preserved source attributes and provenance, plus explicit blockers. It is deliberately not merged into `main` and must not replace the website's functioning Phase 2 national-boundary layers before the full data gate succeeds.

## Input and output design

- Initial OSMB scope: snapshot **2026-10-05** (Romania and Republic of Moldova), retaining source relation IDs and raw OSM tag dictionaries. The exact user-supplied OSMB archives are the canonical baseline for reconciliation; the legacy `reforma-teritoriala` repository is **not** an independent substitute for that archive.
- Reviewed administrative shapes currently staged from the legacy ACTUAL release: 3,229 RO units (including Brețcu) and 1,025 MD units.
- SIRUTA 2026 snapshot: **16,978** official records, retained without discarding nonselected registry rows.
- CUATM 2025 snapshot: **1,721** official records, retained without discarding nonselected registry rows.
- Statistical roles: **54** RO NUTS 2024 (4 level 1, 8 level 2, and 42 shared county/Bucharest level 3), **9** MD NUTS-style 2017 (2 level 2, 6 level 3 and the shared state-level role).
- All original OSM relation IDs remain authentic; Brețcu's `osmRelationId` is `null` and its public "OSM ID" card row must remain blank. Ojdula remains `14735731`; the reviewed Brețcu–Ojdula hybrid geometry and evidence lineage are preserved in the working reviewed set without a public correction badge.

## Candidate files

Files are stored under `data/candidates/phase3/` rather than `public/` so a Draft pull request cannot accidentally publish incomplete map layers:

| File | Purpose |
| --- | --- |
| `actual/catalog-v1.json` | Stable entity IDs, separate administrative and tree parents, short/official names, all preserved source OSM tags, registry record when matched, administrative/statistical roles, geometry reference |
| `actual/ro-administrative-v1.geojson.gz` | Selected reviewed RO geometry, including separately identified Brețcu and Ojdula |
| `actual/md-administrative-v1.geojson.gz` | Selected reviewed MD geometry, **excluding** not-yet-integrated level 3/5 units |
| `sources/siruta-2026.json.gz` | Complete official source register snapshot |
| `sources/cuatm-2025.json.gz` | Complete official source register snapshot |
| `sources/nuts-ro-2024.json` | RO NUTS source classification |
| `sources/nuts-md-2017.json` | MD statistical nomenclature |
| `actual/validation-v1.json` | Explicit incomplete elements and hierarchy checks |
| `actual/manifest-v1.json` | Input/output SHA-256 hashes, counts, classification versions and release status |

The code used to generate this candidate is `scripts/data/build-phase3-candidate.mjs`. It expects the documented source paths in an external source directory and outputs to an external target directory; never implicitly downloads or modifies private source data.

## Exact blockers

1. **11 missing Moldovan administrative outlines** in the reviewed legacy administrative export: one level 3 (Nistrenia, relation `65335`) and ten level 5, including subdivisions of Nistrenia and Găgăuzia. These are present in the supplied October 5 OSMB Moldova archive and must be carried across with their original OSMB source tags, not invented.
2. **18 statistical-only regional outline geometries not yet staged:** 12 RO NUTS1/2 and 6 MD level2/3. Reuse existing polygons for RO NUTS3 and MD1/MD114/MD115, without geometry duplication.
3. **Exact archive cross-check:** compare the reviewed legacy geometry representation and original OSMB snapshot before release, and document source geometry transformations explicitly.
4. **Full geometry and topological QA:** verify polygon validity, shared boundaries, parent linkage, overlaps and coverage; generate an acceptable simplified display representation preserving common edges.

The current manifest must remain `BLOCKED_INCOMPLETE` until the above checks pass. Registry lookups for currently selected entities have been reconciled after converting the legacy RO county ordinal code to the actual 2026 SIRUTA county record ID; never conflate these two identifiers.

## Identity/semantics safeguards

- Country roots RO `90689` and MD `58974` retain OSM boundary role and MD1's shared statistical role.
- The administrative parent is never inferred from statistical membership. The UI tree may group by statistical roles without changing statutory relationships.
- Găgăuzia (`MD114`) and Chișinău (`MD115`) are *one* administrative entity each with statistical role; `MD120` does not replace or imply equivalence with Nistrenia.
- Official MD statistical code `MD120` wins over an inconsistent OSM tag `MD121` for identity; both source codes are retained with provenance.
- Short names are display only; original names and original source tags remain untouched.
- Public data reuse must include OSM/OSMB and SIRUTA/ANCPI source licenses and attribution.

## Acceptance gate

Release is permitted **only** when `manifest.status === "ready_for_release"`, every selected administrative/statistical geometry is present and verified, registry references remain valid, and UI regression tests and GitHub Pages CI succeed on the candidate's exact SHA. No merge of this Draft PR is authorized while the status is blocked.
