# Phase 1 — UX and Interaction Validation Matrix

**Scope:** Design prototype and future Phase 2 implementation contract  
**Date:** 2026-11-05

| ID | Scenario | Expected result | Phase 1 prototype |
| --- | --- | --- | --- |
| UX-01 | Open desktop | Shared map, six module icons, territory tree, detail card | Demonstrated |
| UX-02 | Open mobile at 390px | No horizontal scroll; map, global tools, mobile navigation | Demonstrated |
| UX-03 | Change EN to RO and back | Product name, controls, labels translated; source official names unchanged | Demonstrated |
| UX-04 | Open/close a tree branch | Does not alter map layer visibility | Demonstrated |
| UX-05 | Select Brețcu by its name | Card reads `Comuna Brețcu`, SIRUTA `64096` | Demonstrated |
| UX-06 | Inspect Brețcu OSM ID | Field exists and its value is blank | Demonstrated |
| UX-07 | Select Ojdula | Card reads `Comuna Ojdula`, OSM relation `14735731` | Demonstrated |
| UX-08 | Toggle Romania visibility | Romania changes; Moldova does not | Demonstrated |
| UX-09 | Toggle global simplification | Visible preview outlines swap representation; selections remain unchanged | Demonstrated |
| UX-10 | Change basemap style | Visual background changes; geometry identity remains stable | Demonstrated |
| UX-11 | Zoom and press Home | Home resets viewport without clearing state | Demonstrated |
| UX-12 | Open tree and details on mobile | Independent drawers; opening one closes the other | Demonstrated |
| UX-13 | Change to another module | Navigation communicates planned state rather than implying working content | Demonstrated |
| UX-14 | Render full 6,000+ entity catalogue | Tree virtualization and map profiling | Deferred to Phase 3/4 |
| UX-15 | Production topology-safe simplification | No introduced gaps/overlaps at shared edges | Deferred to Phase 6 |
| UX-16 | Complete keyboard and screen-reader UX | ARIA tree semantics, focus management, touch targets, contrast | Deferred for implementation/QA |
| UX-17 | Real basemap tiles and provider policy | Valid style URLs, attribution, usage rights | Deferred to Phase 2 |
| UX-18 | Original data provenance and export | Full source manifest + original geometries | Deferred to Phase 3/5 |
| UX-19 | Expand Moldova's statistical hierarchy | All official 2017 codes `MD1, MD11, MD12, MD111–115, MD120` appear exactly once | Demonstrated |
| UX-20 | Search by MD statistical code | Searching `MD120` finds the official left-bank statistical entity | Demonstrated |
| UX-21 | Select Chișinău from the statistical branch | One existing entity has `MD115`, administrative parent Moldova and statistical parent MD11 | Demonstrated |
| UX-22 | Compare MD120 and Nistrenia | Distinct nodes; no equivalence claim, no geometry inferred | Demonstrated |
| UX-23 | Unavailable Phase 1 regional geometry | Regional checkboxes disabled rather than silently toggling missing shapes | Demonstrated |

## Preview test notes

The standalone prototype was rendered with a headless Chromium browser on desktop (1440×900), tablet (820×900), and mobile (390×844). No page-level JavaScript exceptions were observed in the tested paths. The desktop test switched geometry mode and opened the Brețcu card. The mobile test opened the tree panel in Romanian. Additional desktop and mobile tests verified all nine Moldova statistical roles, their parentage, code-based search, shared Chișinău/Găgăuzia identity, the distinct Nistrenia/MD120 nodes, and disabled unavailable geometries.

This is a **visual and interaction smoke test**, not a completed accessibility or production GIS certification. The test does not establish that the future data integration, historical modules, or topology pipeline passes.

## Acceptance gate

Review the screenshots and interactive prototype together with `PHASE-1.md` and `ADR-0001-frontend.md`. After the design is accepted, Phase 2 can implement the production frontend. Until then the branch should remain unmerged and GitHub Pages must continue to serve the existing initial project page.
