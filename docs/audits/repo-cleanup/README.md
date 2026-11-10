# REPO-CLEANUP — pre-cleanup evidence and navigation

This is the **pre-deletion snapshot**, based on main `2b679e65ad2da2e964ee6ad91347a96f107eeab6`. No deletion has occurred at this snapshot. Post-merge/deletion facts will be published separately in the cleanup PR and local delivery; they are not fabricated here.

## Inventory and decisions

- [Baseline and pagination](baseline.json):59remote branches,0open PRs,23existing tags,0releases;282Actions runs and415artifact metadata records inventoried without downloading their contents.
- [Every branch](branches-before.json), [individual decisions](branch-decisions.json), [original commit index](commit-index.json), [preservation gates and explicit56-name/SHA deletion list](preservation-manifest.json).
-56heads have an **identical complete Git tree** to their matching merged PR integration commit, which is reachable from main. Original head SHAs are not treated as identical merely because PRs say merged. One-parent replay is distinguished from exact graph ancestry; squash versus rebase is not inferred uniquely from one-parent history alone. Tree equality proves content; the archive additionally preserves intermediate commits and metadata.
- Keep `main` and two **UNIQUE_HISTORY_PRESERVE** branches: `audit/official-territorial-symbols-20261108` (closed-unmerged PR64; original SIM-R1 report/inventory) and `audit/sim-r2b1-county-district-evidence-20261108` (closed-unmerged PR69; original evidence files). Five original files are absent from baseline main; they are not discarded or imported as current code.
- [Worktree review](worktree-review.json):286stat/index entries in the old SIM-CLOSE worktree were286raw-byte-identical files, with zero Git content diffs. No reset, file deletion, local branch deletion or global Git setting change was performed. All local worktrees remain available.

## Conservation and deletion gates

1. Integrate this evidence PR only after exact-head CI succeeds; verify post-merge CI, Pages and live resources.
2. Create at most one new annotated tag, `archive/repo-cleanup-2026-11-10`, pointing at an archival commit whose tree equals integrated main and whose parent set anchors all audited heads plus the cleanup PR head. This synthetic DAG anchor is explicitly archival; it is not a historical claim that those branches were merged into the application. No main-history rewrite and no existing tag replacement.
3. Verify the remote tag object and peeled commit and prove every original head is an ancestor. Publish the actual tag/commit SHAs and the exact-SHA supplemental list (including the cleanup branch only after its own merge/tree-equivalence proof) before any deletion. A PR URL alone is not the preservation mechanism.
4. For each explicit eligible branch, recheck remote SHA, protection, open PRs and local work. Abort/reclassify only that branch if conditions changed. A task-local pre-push guard checks Git's advertised oldOID against the audited SHA; ordinary Git deletion uses that oldOID transaction and rejects a concurrent ref change. No force push or wildcard deletion.
5. Journal every attempt, verify absence, re-fetch the complete paginated branch inventory, and reconcile all successes/failures/new refs. Delete the temporary cleanup remote branch last, only after its code/evidence head has been anchored and the immutable pre-self journal hash/results have been published in the merged PR. The executor pauses for that attestation and resumes without repeating successful deletions. Local worktrees/branches are not deleted.

The fail-closed policy is [deletion-policy.mjs](../../../scripts/audit/repo-cleanup/deletion-policy.mjs); tests exercise protected/main/moved-head/open-PR/unpreserved/unique-history/unknown-state rejection. The executor must additionally perform live GitHub/Git checks; a pure-policy unit test alone is not deletion evidence.

## Repository structure

[File review](repository-file-review.json) and [539-file content snapshot](tracked-files-before.json) cover191,766,086tracked bytes. No accidental tracked temporary/build file was found. Both duplicate groups are retained: versioned Romania source geometry snapshots have distinct reproducibility roles; the Romania SVG is both a public asset and an inspected evidence copy. Large metadata/PDF/source archives remain evidence. `dist`, `node_modules`, task `work` and browser artifacts are already ignored.

No dependency or workflow change is justified. The single website workflow continues install, tests, three distinct reproducibility checks, typecheck/build, WEB-AUDIT.5 and full Chromium desktop/mobile, with main-only Pages deployment. A PR deploy marked SKIPPED is not an executed deployment.

## Current versus historical documentation

- **ACTUAL:** [data certificate](../../data/PHASE-3-CERTIFICATION.md), original snapshot5October2026; data/source/public paths remain intact.
- **SIM archives:** [administrative closure](../SIM-CLOSE-FINAL-REPORT.md), permanent exceptions and rights dossiers; no SIM-R9 or renewed research. Historical branch names in reports are interpreted through the exact-SHA mappings above and the verified archival anchor, not rewritten retrospectively.
- **WEB certification:** [WEB-AUDIT.5](../web-audit-5/WEB-AUDIT-5-FINAL-REPORT.md), [WEB-MAINTENANCE](../web-maintenance/WEB-MAINTENANCE-FINAL-REPORT.md), durable post-merge attestations in their PRs. Human NVDA/VoiceOver validation remains pending and does not block this cleanup; no full WCAG claim.
- **Future:** HIST-0 is recommended only after this cleanup, with separate OpenHistoricalMap inventory/provenance/validation and certified ACTUAL preserved. No HIST implementation is included here.

## Final evidence location

`branches-after.json`, `deletion-log.json`, `preservation-confirmation.json` and `closure-report.md` are intentionally absent before execution. They will be generated from actual results under `outputs/REPO-CLEANUP/` and published as a verifiable post-merge PR attestation, with hashes and machine-readable records. The pre-cleanup manifest remains a historical snapshot. If any gate cannot be completed, the final verdict must report the exact partial/blocking condition instead of claiming success.

## Explicit manual executor commands

After verified phase-B evidence is saved and main fetched: `node scripts/audit/repo-cleanup/archive-and-validate.mjs --apply --pr NUMBER`. Verify/publish its exact pre-deletion manifest hash/list and remote archive confirmation in the merged PR. Then run `node scripts/audit/repo-cleanup/delete-eligible.mjs --apply`. It first verifies its task-local hook in a real dry-run with unchanged remote ref; actual results are logged separately. It pauses before self deletion until its pre-self journal hash has been published. No existing user pre-push hook may be bypassed: a detected hook stops the executor for reviewed chaining. These helpers are not scheduled Actions and do not execute on import of the pure policy.
