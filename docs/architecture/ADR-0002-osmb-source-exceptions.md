# ADR-0002 — Permanent acceptance of documented OSMB source exceptions

- **Status:** Accepted — project decision, 2026-11-06
- **Scope:** Current Administrative module for Romania and Republic of Moldova
- **Frozen source snapshot:** OSM-Boundaries, 2026-10-05
- **Decision:** Keep known source exceptions in the production cartographic corpus, without artificial geometry edits or invented administrative identities.
- **Certification boundary:** Accepted for source-faithful cartographic representation; **not** legal, cadastral, or statutory boundary certification.

## Context

Atlas Phase 3 candidate v3 was certified and Phase 4/5 published a 4,283-entity administrative/statistical catalogue. The release intentionally preserved authentic OSMB polygon coordinates, original relation IDs/tags and reconciled official SIRUTA/CUATM records, together with the explicitly documented exceptions. Later independent read-only investigations did not establish complete legally certified replacements for the requested boundaries; their evidence is preserved in the audit registers.

Users should be able to explore the source faithfully without mistaking cartographic polygons for independently adjudicated legal limits. Development must not be blocked indefinitely by inaccessible official cadastral vectors where the original-source exception is documented and the provenance is disclosed.

## Decision

1. **Freeze the reference, not the whole project.** The accepted current release uses the OSMB 2026-10-05 snapshot and the already accepted separately reviewed source polygons. Preserve their original geometry, metadata, attribution and SHA-256 evidence. Do not silently replace this corpus with a newer OSM download or a different cadastral product.
2. **Keep the five recorded topological findings:** two same-level overlapping pairs in Harghita involving Vlăhița and Căpâlnița/Lueta; one same-level overlap Cealîc/Svetlîi; and two child-outside-parent findings for Fîrlădeni/Căușeni and Svetlîi/Comrat. They are accepted **OSMB cartographic-source exceptions**, not certified legal delineations. In the follow-up evidence, Cealîc/Svetlîi overlap and Svetlîi/Comrat outside-parent refer to the same Cortenul Nou geometry; keep both audit assertions but do not double-count its land area.
3. **Keep all six repeated-CUATM reference groups:** municipality and contained urban-core geometries for Chișinău (0100) and Bender (0500) are distinct *source geometry scopes* tied to one official CUATM identity apiece, not proof of duplicate legal municipalities. The separate-component groups Țînțăreni (1050), Văratic (7160), Dondușeni village (3417) and Recea (8034) keep every genuine OSM relation and source polygon, with their **legal component mapping unresolved**. A repeated source code never authorizes automatic union, removal, reassignment or creation of a new legal entity.
4. **Retain already reconciled special cases.** Brețcu is a normal commune with SIRUTA 64096 and `osmRelationId: null` (the public OSM ID field remains empty); Ojdula keeps genuine OSM relation 14735731. Neither is shown as “corrected”. Of the earlier 180 pending CUATM links, 178 are accepted evidence-backed matches and two OSM representations have no distinct CUATM code; leave those code fields blank. Keep Nistrenia administrative identity independent of statistical MD120 and the original OSMB tag MD121.
5. **Preserve simplified and original roles.** Simplified polygons remain for display only, with accepted independent validity, same-level overlap and parent-coverage checks; full original source geometries remain the export baseline. The three Mapshaper Moldova arc-intersection warnings remain documented technical source/engine warnings, not new proven legal exceptions.
6. **Maintain explicit source and legal caveats.** The website, exports and any future exception presentation must not assert that OSMB boundaries are authoritative legal boundaries or that the four uncertain CUATM multipart groupings are legally established. No blanket “fixed”, “corrected”, “fully resolved”, “legally certified” or red-warning badges are to be added solely because an exception is recorded. Status should distinguish *accepted for cartographic release* from *unresolved legal mapping*.
7. **Close the current release gate, not the evidence question.** These known exceptions are **not blockers for the existing published cartographic version or for unrelated UI/module development**. Their legal interpretation remains unresolved where stated, and the accepted source exceptions remain traceable in technical evidence. Reopening them is warranted only by a demonstrably authoritative independent source, a new source snapshot or a material regression, with explicit review and a separate versioned change proposal.
8. **No silent changes.** Future proposal(s) to adjust boundaries, identities, parental hierarchy, source codes, data transformations or source-snapshot version require distinct evidence, a candidate branch, per-ID impact and provenance hashes, topology QA, regression and browser verification, and explicit acceptance before promotion. Never overwrite original OSM relation IDs, source tags or geometry evidence.

## Source of truth

- Cartographic certification and original exception decisions:
  - [Phase 3 certificate](../data/PHASE-3-CERTIFICATION.md)
  - [Source exception decisions v1](../../data/candidates/phase3/actual/source-exception-decisions-v1.json)
  - [Phase 3 manifest v3](../../data/candidates/phase3/actual/manifest-v3.json)
- Independent read-only analyses:
  - [Exception investigation](../audits/EXCEPTION-INVESTIGATION-2026-11-06.md)
  - [Exception measurements](../audits/EXCEPTION-EVIDENCE-2026-11-06.json)
  - [Official boundary acquisition outcome](../audits/OFFICIAL-BOUNDARY-ACQUISITION-2026-11-06.md)
  - [Acquisition case register](../audits/OFFICIAL-BOUNDARY-ACQUISITION-2026-11-06.json)

The legal-evidence records above remain in their own historical state; this decision does not retroactively modify their observations, labels or hashes.

## Consequences

- The published 4,283-entity catalogue, detailed/simplified geometry shards, OSM IDs, registry mappings, parent links and official source snapshots are **unchanged**.
- No paid order, document request, correction upstream to OSM, legal recategorization or data rewrite is required to keep developing the Atlas.
- The accepted-release operational review is closed; a request for actual cadastral/legal certification would be a **different scope** with its own evidence gate.
