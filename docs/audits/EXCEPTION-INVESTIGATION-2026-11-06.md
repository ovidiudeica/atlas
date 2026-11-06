# Exception investigation — RO/MD OSMB snapshot 2026-10-05

**Evidence date:** 2026-11-06. **Audit branch:** `audit/exception-evidence-20261106`.  
**Status:** source-geometry diagnosis completed for 5 recorded topology cases and 6 CUATM repeated-code groups; **no authoritative legal boundary adjustment certified**.  
**Baseline:** protected `main` at `9a26c854082511ef64e21e083e5d768ea21eaf72`.  
**Invariant:** no change to the 4,283-entity catalog, Phase 3 source files, Phase 4 assets, application, exports or original geometry.

## Sources and method

1. User-supplied **original OSM-Boundaries 2026-10-05** archives: RO, 3,395 features, SHA-256 `cc4fd15940550054d90fcadf907ed98352b68882735680093f77a624e3e04897`; MD, 2,734 features, SHA-256 `d29b600daa2857bacf8ec7d13369db8fc95353e89f62fe1c762dbc692c216dad`. Both digests recomputed from actual bytes. Negative OSMB relation IDs are normalized by absolute value strictly for lookup.
2. Independently parsed and analyzed original polygons with Shapely 2.1.2 / pyproj 3.7.2, using EPSG:3035 for indicative metric area and polygon-to-polygon distances. Tests included union/intersection, geometric difference, constituent components, and independent level-9 village geometry inclusion. These measurements are **not official cadastral areas**.
3. **Independent Romania reference**: geo-spatial.org WFS `administrative-boundaries:ro_admin_lau_polygon`, sourced from ANCPI-provided public UAT boundaries, source feature version `2025-03-26`. Queried only SIRUTA `83749`, `83963`, `84629`. Retrieved source 63,059 bytes, SHA-256 `ed5e98e33bf0c1a4ef7acdaaace8e4b24732d466ed6513e167f47688c87e094`. Compared with original Phase 3 RO features `ro-administrative-v2.geojson.gz`, SHA-256 `9b52cb8f6187440c2b613726c578b49885d2f0e7f67635b0782678afba6e120`, using Node.js `polygon-clipping@0.15.7`. WFS service: https://services.geo-spatial.org/geoserver/administrative-boundaries/ows ; catalogue and origin: https://geo-spatial.org/descarcare/date/administrative-boundaries/ . This reference is **2025**, not the separate ANCPI portal **May 2026** release and not an adjudicated court delimitation.
4. Official identity reference: project-staged BNS `CUATM_25.xlsx` / CUATM-2025 snapshot (1,721 records), with original source and parent chain. Source-specific independent checks: https://raiontaraclia.md/ro/primariile-raionului/ and https://tintareni.md/ . BNS CUATM changes published October 2025: https://statistica.gov.md/index.php/ro/clasificatorul-unitatilor-administrativ-teritoriale-al-republicii-moldova-cuatm--12_62048.html .
5. Derived numerical evidence is serialized in `EXCEPTION-EVIDENCE-2026-11-06.json`. Recheck with same exact original input hashes, not a fresh OSM/OSMB snapshot.

## A. Romania — why both level-8 overlaps occur

OSMB relation `10624200` Vlăhița (SIRUTA 83749) is a **six-component multipolygon**: one main component plus five detached components. Four small parts are geometrically **fully inside** the OSMB polygon for Căpâlnița `14879493` (SIRUTA 83963), jointly **0.896542 km²**. The fifth part is fully inside Lueta `14879461` (SIRUTA 84629), **0.161219 km²**. In the official-source-derived 2025 dataset **Vlăhița also consists of six components**, but the Căpâlnița and Lueta polygons contain the corresponding exclusions: both positive-area overlaps are **zero**. This corroborates the detached pieces as *source-represented Vlăhița areas* and diagnoses missing counterpart exclusions in the OSMB neighboring polygon geometry, rather than evidence that Vlăhița's components should be deleted.

The 2025 independent reference and OSMB October 2026 can differ in coordinates/version. Do **not** patch historical OSM relations or imply that GIS agreement alone confers legal title. A separately versioned derived noncanonical geometry, if later authorized, could exclude these components from neighboring map fills while leaving source geometry downloadable unchanged.

## B. Moldova — three recorded topology findings correspond to two distinct affected land fragments

### Cealîc / Svetlîi / Cortenul Nou: one correlated geometry problem

- Source Cealîc `19118040` (Taraclia) is a **two-component** polygon. One component is **exactly** the entire level-9 **Cortenul Nou** geometry `18967006`, area **0.2391202805 km²**. The component's symmetric difference with the village polygon is **0 m²** at EPSG:3035.
- That same component is **fully covered** by source Svetlîi `19118596` (UTA Găgăuzia). Thus the same-level overlap `19118040/19118596` is **0.2391202805 km²**.
- The part of Svetlîi **outside source Comrat subdivision `1706978`** is exactly the **same Cortenul Nou polygon**: the two polygons have **0 m² symmetric difference**. Therefore the same-level overlap and the `Svetlîi/Comrat` child-outside-parent exception are **two different checks of one identical land fragment**, not independent pieces of problematic land.
- Independent administrative evidence: the **Taraclia District Council** lists Cortenul Nou as a component of **Cealîc**. The OSMB level-9 source parent for Cortenul Nou is Cealîc/Taraclia, while the larger Svetlîi source geometry covers it. This makes the Svetlîi source inclusion a **high-confidence geometric inconsistency** relative to the separately mapped Taraclia boundary, but an exact statutory/cadastral correction still requires the authoritative boundary dataset.

### Fîrlădeni / Căușeni: full detached component across districts

OSMB Fîrlădeni `12463200` is a two-component multipolygon. Its large component is **51.609843 km²**, fully within Căușeni `65343`; its smaller component is **0.565217071 km²**, entirely outside Căușeni and inside the **Anenii Noi district** `1692078`. This is a whole cross-district detached polygon, **not** a thin boundary-sliver due to vertex rounding. Both original level-9 settlements Fîrlădeni and Fîrlădenii Noi are in the main component. The legal territorial owner of the isolated component **remains unverified**. Do not snap/delete/reassign it pending independently authoritative delimitation.

## C. Six repeated CUATM-code groups, 13 source polygons

The CUATM registry contains **one official identity record per code** below, whereas OSMB can supply multiple independent source geometry relations. Distinguish identity uniqueness from geometry cardinality.

| CUATM | Name | OSM relation(s) | New GIS diagnosis | Treatment |
|---|---|---|---|---|
| `0100` | Chișinău | 1691801 municipality (575.690 km²), 1748490 urban (122.134 km²) | Urban polygon is entirely inside municipal polygon | **Two nested cartographic scopes, one official CUATM identity** |
| `0500` | Bender | 9581354 municipality (38.007 km²), 12463379 urban (21.205 km²) | Urban polygon is entirely inside municipal polygon | **Two nested cartographic scopes, one official CUATM identity** |
| `1050` | Țînțăreni | 12496850 (39.297 km²), 19090932 (17.721 km²) | Separated by ~6.06 km. Both level-9 settlement polygons **Țînțăreni `18967632` and Crețoaia `18966900` are completely inside 12496850**; neither intersects 19090932. Source CUATM tag `1050` occurs on 19090932 but not on 12496850; Atlas registry bridges both to 1050. CUATM explicitly contains child `1025` Crețoaia. | **Priority 1** — the detached 17.721 km² is not a separate polygon for Crețoaia; potential remote extravilan or source misassignment unresolved |
| `7160` | Văratic | 19045240 (5.771 km²), 19045254 (19.015 km²) | ~47.8 m apart. The level-9 Văratic village polygon `18966798` is fully in 19045254, not 19045240. | Potential multipart source; verify detached area with authoritative cadastre |
| `3417` | Dondușeni (village) | 19055800 (27.501 km²), 19055814 (0.675 km²) | ~410 m apart. Level-9 village `18967876` is inside 19055800, not the detached polygon. **Dondușeni town is a separate legal identity `3401`**, reflected by a different OSM entity. | Do not confuse the village's repeated components with the separately coded town |
| `8034` | Recea | 19100165 (0.660 km²), 19100169 (1.207 km²), 19100182 (24.975 km²) | All three non-overlapping. Small polygons are ~47 m apart; nearest small–large gap ~1.18 km. No level-9 Recea polygon in the original OSMB set resolved these parts. | Potential disconnected territory; 3-part legal/cadastral linkage unverified |

The first two groups should receive an explicit **source geometry role** without inventing two legal records. The final four remain unresolved as legally validated multipart groups; all 9 relations and their original metadata must be preserved.

## D. Risk and release decisions

- **RO**: Reclassify the two overlap *diagnoses*, not the source data: **neighbor polygons omit exclusions for five Vlăhița components** against an independent ANCPI-derived 2025 geometry. Await stronger 2026 official boundary reference before producing any adjusted cartography.
- **MD Cealîc/Svetlîi**: Correlate two source exceptions under **one Cortenul Nou land fragment**; prioritize authoritative Taraclia/Găgăuzia boundary confirmation; keep all original relations.
- **MD Fîrlădeni**: unresolved cross-district detached area; do not force it into Căușeni or remove it on source-only evidence.
- **CUATM**: No duplicate *official* CUATM records are justified by repeated OSM shapes. Both nested municipalities can be classified. Investigate Țînțăreni first; then Văratic, Dondușeni and Recea against cadastral geometry and municipal records.
- **Separately**: Mapshaper retained a warning about three unrepaired MD arc intersections in simplified geometry. The accepted geometry QA measured zero invalid simplified polygons and no new material same-level overlaps. This is a **technical warning, not an additional adjudicated administrative case**.
- Preserve **Brețcu** (SIRUTA 64096, OSM ID null) and **Ojdula** (genuine OSM 14735731) as normal source identities, not entities labelled “corrected”. Keep Nistrenia's source geometry distinct from the official statistical code MD120.
- The 180 pending CUATM associations were already settled as **178 source-backed links + 2 representations with no independent code**. Do not reopen or invent codes.
- **Legal boundary certification is explicitly not claimed**, and source snapshot 2026-10-05 remains the cartographic production baseline.

## E. Remaining independent checks

1. Obtain a verifiable **2026 ANCPI boundary extract** (or statutory/cadastral record) for the three Harghita UATs; confirm excluded components and changes since March 2025.
2. Obtain **official Moldova spatial UAT/settlement boundaries** with metadata and effective dates for Țînțăreni/Crețoaia, Văratic, Dondușeni village versus town, Recea, Fîrlădeni/Anenii Noi and Cealîc/Svetlîi/Comrat.
3. Produce a per-ID legal/source decision register with explicit evidence hashes, no automatic geometry or CUATM reassignment. If a noncanonical adjusted display layer is authorized, version and certify it separately, retaining original OSMB geometry in exports.
4. Add optional source-exception status to the public entity details only after the source decisions are reviewed. No changes to production catalog or website are included in this audit.

This file is **read-only investigation evidence**, not a release authorization or source correction. Prior Phase 3 reports with an old `Draft PR #7` gate are historical snapshots; the current cartographic release remains integrated in protected `main`.
