# SIM-R6 evidence workflow

Start from main ce078147bc8500f2454b409676f6f1fad622bdba. No certified geography or historical snapshot is regenerated.

1. node scripts/audit/sim-r6/00-baseline.mjs
2. node scripts/audit/sim-r6/01-investigate.mjs (bounded concurrency, URL cache, source hashes and failures; reuses SIM-R5 network helper)
3. python scripts/audit/sim-r6/extract-pdf-images.py (requires pypdf and Pillow)
4. node scripts/audit/sim-r6/04-extract-annexes.mjs (requires Sharp; optionally set ATLAS_SHARP_MODULE to an installed module file URL)
5. Individually inspect the retrieved images and normative documents. 02-finalize.mjs encodes the documented HUMAN/MODEL visual decisions; fetching is not an automatic legal certification.
6. node scripts/audit/sim-r6/02-finalize.mjs
7. node scripts/audit/sim-r6/03-report.mjs

The 45 rights cases were individually examined using actual images, local institutional originals, source pages and the retrieved use regulation. One current image request failed; its image and rights remain unconfirmed. The use regulation is linked by the official Ciocana page and is a scanned eight-page PDF, not a graphic annex. Informative use with exact-holder attribution is distinguished from ceremonial, commercial or trademark use.

907 prior failures remain separately DEFERRED_NOT_RETRIED. No fresh HTTP response is invented. Priority document retrieval does not automatically recover a prior institutional URL.

Run npm test, npm run build and the full scripts/ci/browser-smoke.mjs. On Windows set CHROME_BIN and ATLAS_CHROME_SOFTWARE=1; ATLAS_SMOKE_TIMEOUT_MS=120000 accommodates map startup. CI runs the same complete suite.

Current downloads: public/data/symbols/audit-r6.json.gz and registry-r6.json.gz. Historical R4/R5 files remain immutable.
Rights outcome: 1 of45 cleared (byte-identical Gagauzia flag SVG, explicit CC BY-SA2.5, source/author/licence credited);44 unresolved. Permission to illustrate official symbols is not a reproduction licence. Briceni new crops assessed independently as literal normative-annex reproductions. Historical snapshot hashes are checked separately.
Run 05-priority-media.mjs for current priority-file hashes; locked visual findings are reused only for identical bytes. Run 07-image-metadata.py for EXIF/XMP/SVG author/licence fields (Pillow). Taraclia author Iurie CAMINSCHI is embedded in the actual coat JPEG; absence of an explicit reproduction licence keeps rights unresolved.