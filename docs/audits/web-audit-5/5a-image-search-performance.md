# WEB-AUDIT.5a — image and search performance

Base: d1ff22c8844ea1b460a0fa9f822fc938e9eba624. Scope: image request scheduling only, no new graphics, no thumbnail URL transformation, no source selection changes.

## Cause and correction

Every immediate search update mounted up to81 tree results, with original remote URLs. Browser lazy loading still fetched nearby originals. Large-file cost therefore occurred before the user selected a holder. Local tree coats remain lazy-loaded. Remote tree originals now require explicit exact-ID selection, or prior decoding of the exact card URL; deferred rows use the neutral placeholder. Card and tree still share coatImageForEntity; flags remain separate. This deliberately avoids unverified thumbnail derivatives. An explicitly selected remote card can still load its original; no size or rights claim is made for that necessary request.

## Actual repeated measurements

Same Chromium/CDP script,1440x900,100ms typing interval,1000ms settle, unthrottled actual network, three fresh-cache trials per variant plus cached reload. Queries: Taraclia, Harghita, Bucharest, București; branch expansion; exact Taraclia district selection. Complete request URLs/status/encoded bytes are in image-network-before.json and image-network-after.json; derived per-phase totals in performance-5a.json. CDP bytes are observed encoded transfers, not declared file sizes; unfinished requests have unknown transfer size. Timing is descriptive: concurrent Windows load varied, so no causal timing improvement percentage is asserted. The initially failed baseline attempt timed out and is not included in successful samples; the baseline was repeated after its build finished.

| Variant | Trial | Search external images | Search bytes | Branch external images | Branch bytes | Cold map ready ms | Cached map ready ms |
|---|---:|---:|---:|---:|---:|---:|---:|
| before | 1 | 52 | 20940437 | 2 | 0 | 9740 | 4621 |
| before | 2 | 62 | 22367382 | 2 | 0 | 26802 | 6079 |
| before | 3 | 60 | 41127001 | 2 | 0 | 14580 | 5736 |
| after | 1 | 0 | 0 | 0 | 0 | 7455 | 2777 |
| after | 2 | 0 | 0 | 0 | 0 | 4298 | 4004 |
| after | 3 | 0 | 0 | 0 | 0 | 5423 | 2599 |

The after-run assertion rejects any external Image request initiated during progressive search or branch expansion. Images of the basemap and explicit card selection are reported separately rather than described as unnecessary territorial imagery. Card identity assertion requires the district's local taraclia-coat.png, not the city original. No blanket bandwidth or WCAG certification is inferred.

## Verification and integrity

npm ci completed from lockfile;284/284 tests pass. TypeScript/Vite passes. SIM-R7(7 outputs), SIM-R8(6), and SIM-CLOSE(6) reproduce byte-for-byte. integrity-5a.json proves 273 protected input files unchanged, including public geography, data, symbols and historical SIM archives. Full Chromium desktop/mobile and exact-SHA CI/publication are recorded separately when actually completed. No previous result is used to certify a new SHA.

Run: AUDIT_LABEL=after node scripts/audit/web-audit-5/image-network.mjs after npm run build. Windows: set CHROME_BIN to Chrome and ATLAS_CHROME_SOFTWARE=1. The CI includes the same request regression in addition to the complete existing browser smoke. Deferred remote originals are a loading state, not a missing-symbol or licensing verdict.
