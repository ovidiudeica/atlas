# Phase 5 cleanup — maintenance audit and release ledger

**Baseline:** `main` at `6b335f9ba1aed1216851532b76600e6685b3661f` (Phase 5).  
**Scope:** documentation, dead CSS, dependency installation determinism, browser-based release QA.  
**Explicitly excluded:** changes to `data/candidates/phase3/`, `public/data/phase4/`, territorial identities, geometry simplification or original source attribution.

## Changes and findings

- Updated `PROJECT.md` and `README.md` to distinguish the live bilingual Phase 5 Administrative module from the remaining five planned modules. Original scope decisions are preserved.
- Removed the obsolete `.territory-overlay` selector. MapLibre native fill/outline layers are the active map implementation; `src/data/borders.ts` is deliberately **retained** as an interim initial-frame preview until the certified root geometry finishes loading.
- CI installs from the committed lockfile using `npm ci`, rather than installing with potential lockfile drift.
- Adds real Chromium desktop/mobile browser checks and screenshot artifacts in CI for PR and `main` builds, as a separate acceptance gate.

## Git and release hygiene requiring independent action

- `main` was **unprotected** and had no repository rulesets at audit time. Repository settings require an administrator to enable required `Build and verify website` checks, pull-request review/merge controls and non-force-push rules. A code-only PR cannot itself guarantee or activate branch protection.
- The nine original Phase 1–5 branches remain after squash merges. Their PRs are closed (PR #2 was closed unmerged). Their commit histories can diverge from `main` despite their accepted content being present after squashing. Do not delete automatically; first preserve unmerged source investigations and tag/archive relevant heads. Branch deletion is deliberately outside this PR.
- Original Phase 3 source manifests, validation reports and candidate versions are evidence, not cache. No cleanup of these files.
- No repository-wide licence is set. Determine code/docs permissions and OSM/OSMB data rights separately; do not invent rights in maintenance PR.
- No release tag exists yet. Create a verified release marker only after the CI, browser QA, actual GitHub Pages publication and explicit approval.

## Verification acceptance gate

1. Confirm the PR only edits this maintenance scope; assert **zero** changed files under `data/` and `public/data/`.
2. `npm ci --no-audit --no-fund`, `npm test`, `npm run build` must succeed on the exact head SHA.
3. Real Chromium at 1440×900 and 390×844 must load all 4,283 nodes, keep a usable map viewport, avoid horizontal overflow and uncaught JS exceptions, support EN/RO, mobile drawers, Brețcu null OSM ID, and original detailed-geometry GeoJSON / CSV downloads.
4. Review saved screenshots and the output of the browser job before protected integration. On success, merge with exact head SHA; verify `main` CI and published GitHub Pages.
5. Record any unverified step as incomplete; do not equate passing unit tests with full browser QA.

**Status of this document:** maintenance PR proposal, not a release certification.
