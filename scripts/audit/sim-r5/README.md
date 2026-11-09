# SIM-R5 — reproducible evidence and conservative decisions

The certified catalog and SIM-R4 registry are immutable inputs. `registry-current.json.gz` is the corrected display snapshot; `audit.json.gz` retains both old and recommended images. Each of 4,283 IDs has two audit slots. Do not replace the certified catalog or reconstruct the administrative tree.

## Replay from checked-in evidence (no live research required)

```sh
node scripts/audit/sim-r5/00-inventory.mjs
node scripts/audit/sim-r5/04-finalize.mjs
npm test
npm run build
node scripts/ci/browser-smoke.mjs
```

The finalizer consumes the checked-in documentary/search/history checkpoints and `manual-decisions.json`. Local search checkpoints, if present, override older records for the same exact ID. It cannot silently certify a Commons/Wikipedia match as legally official. The Romanian flag geometry is recomputed from the inspected public-domain SVG; its SHA256 must match the independently downloaded file. Manual official findings require an applicable act and a documented graphic comparison.

## Live research and resumption

`01-collect-evidence.mjs` retrieves current Wikidata identities/claims, all linked language editions, Commons metadata and up to five image versions, then attempts original-image checksums and linked primary sources. `02-retry-access.mjs` reopens the 1,207 SIM-R4 failing holder/URL cases, tries HTTPS/host variants and updated exact-Wikidata authority URLs, and follows relevant observed symbol/PDF links. `03-documentary-sources.mjs` crawls observed county-armorial pagination and the presidential territorial-decree index. None of these scripts assigns a newly discovered image automatically.

The 1,547 per-holder document searches were executed through the public web-search tool, four queries per batch. Their exact queries, timestamps, URLs and discovery outcomes are in `docs/audits/sim-r5/document-searches.json.gz`. Search hits, including unrelated namesakes, are discovery evidence only. This checked-in checkpoint is an input to the finalizer, not a claim that a CLI search service is available.

`05-article-history.mjs --retry --limit=100` resumes article-history metadata collection conservatively, one request at a time with a delay. A 429 stops further network retries in that run. Unattempted retries are explicitly deferred, not called examined historical diffs. Increase the bounded limit only for an intentional longer run. The shared network layer caches responses by URL SHA256, stores binary checksums, records HTTP failures, and enforces host cooldowns after 429. Do not delete the cache and restart a bulk image download during a rate limit.

The `work/sim-r5-cache/` cache is ignored by Git. Directly downloaded SHA256 and Commons-reported original SHA1 are separate fields: the latter is not an independently computed hash of a displayed thumbnail. An HTTP failure does not establish that a symbol is wrong or absent.

## Graphic review

Primary PDFs were read with pypdf and rendered with Poppler; actual selected SVG/raster images were rendered with Sharp for read-only comparisons. Forty-eight exact-name source pairs were inspected, including deliberately rejected village/commune, city/district and recognized/de facto scope matches. The ledger records which documents apply and which do not. Similarity alone never establishes legal identity.

The two new flag files are literal crops of the colour pages of presidential decrees 1539-IX/2024 and 51-X/2025, resized to 512px. Crop coordinates, source/output hashes and image dimensions are in `replacement-provenance.json`. The source scans' colour cast and slight distortion are retained; no generative drawing, recolouring or heraldic redesign was used. Reuse assessment is specific to the normative annex reproductions under the AGEPI-published Law 230/2022 article 8; it is not blanket copyright clearance for third-party heraldic illustrations.

## Browser verification

The existing full smoke suite includes SIM-R2a, R3/R3.1, R4 and R4.1 behavior. SIM-R5 additionally verifies the wrong-county neutral placeholder, preservation of Jilava, historical Hunedoara replacement, audit source/license details, progressive loading and the white lower quarter of each corrected flag on desktop/mobile. On Windows set `CHROME_BIN` to Chrome; `ATLAS_CHROME_SOFTWARE=1` enables software rendering and `ATLAS_SMOKE_TIMEOUT_MS=120000` accommodates local map initialization. CI retains the default complete suite and timeout.

Public UI loads only compact audit labels/attribution; the complete compressed ledger is downloaded on request. Tree and card heading continue to use the same coat selector, with no flag fallback. All pre-existing local symbols and protected geography files are checked against the starting main Git blob IDs.
