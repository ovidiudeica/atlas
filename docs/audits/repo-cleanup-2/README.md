# REPO-CLEANUP.2 — Controlled branch consolidation

**Baseline:** `55107339736731ea72d81c2af097c468760751fb` on `main` (15 November 2026). This is a *pre-execution* registry, not a claim that branches have already been deleted.

## Scope and evidence policy

- 34 remote branches at inventory: **1 `main` + 33 secondary**; no open PRs. Every secondary head matched the exact SHA of its corresponding PR head.
- **30 merged PR heads:** may be removed only after recording a durable archive reference preserving their actual commit histories, not merely the current code tree.
- **3 closed-unmerged PRs:** [#64](https://github.com/ovidiudeica/atlas/pull/64) (SIM-R1), [#69](https://github.com/ovidiudeica/atlas/pull/69) (SIM-R2b.1), and [#112](https://github.com/ovidiudeica/atlas/pull/112) (HIST-0.4s) include distinct research evidence. Do not silently merge older application code. Preserve their original commit DAGs and refer to them via their exact head SHAs in [manifest.json](manifest.json).
- PR #112 contains source observations in its own `docs/audits/hist-0-4s-evidence/` files that differ from the current main edition; preserve both versions by their hashes rather than clobbering either.
- Previous repo cleanup: [PR #86](https://github.com/ovidiudeica/atlas/pull/86) and [pre-cleanup evidence](../repo-cleanup/README.md). It is historical, not a current deletion authorization.

## Historical documentation consolidation

The `docs/audits/hist-0-*` directories form **source/evidence archives**, not active runtime content. Preserve facsimile registers, territorial locality crosswalks, legal references, source hashes, and individual evidentiary verdicts. Do **not** delete documentary evidence as though it were a cache. Treat the historical study as a territorial-reconstruction exercise: the fortress's restoration-phase foundation corners and synthetic GCPs are **not prerequisites** for mapping Ţara Chioarului. A coordinate for a fortress cannot certify a historic boundary. HIST-0.4x was prepared outside this repository and has not altered the Historical module.

**Navigation:** HIST-0.1–0.3 inventory/classification → HIST-0.4a–h source families and locality correspondence → HIST-0.4i–s original legal/cartographic witnesses → HIST-0.4t–w technical source qualification. All keep their original relative paths under `docs/audits/` for citation stability. No programmatic dependency or reference is rewritten in this maintenance PR.

## Exact retention and acceptance gates

1. Merge this documentation-only PR only on green CI. Assert no changes to `src/`, `data/`, `public/`, `scripts/`, tests, workflows, geometry or UI.
2. Re-read live refs and classify exceptions. Create a distinct **annotated tag** `archive/repo-cleanup-2-2026-11-15` pointing to a synthetic archival commit: its **tree equals integrated `main`**, while its parent set includes `main` and each of the 33 original branch heads, plus this PR's head. The synthetic commit is a preservation mechanism, **not a claim these investigations were merged**.
3. Verify the annotated tag object and commit parent set, original head reachability, main-tree equality, no open PRs, and individual branch SHA before each deletion. Stop for any changed ref or new protection rule.
4. Remove only the verified 33 secondary branches and the temporary maintenance branch; verify a complete post-deletion inventory. Do not remove tags, evidence files, local worktrees or the canonical package.
5. Check workflow outcome on exact merged SHA and published GitHub Pages. Log the final tag SHA, branch count, CI outcomes and any remaining exceptions in a permanent PR attestation; if a gate fails, publish partial status without claiming full completion.

**Data and interface freeze:** `main`'s certified geometry and the Atlas Historical module are out of scope. No administrative boundaries, OSMB data, source attribution or frontend behavior may change.
