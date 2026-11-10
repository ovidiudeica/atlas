# WEB-AUDIT.5b — accessibility and recovery

Base:82622896078bab8ce4ec25a7a8cac40c9bf6b87a, protected integration of PR82. This lot changes UI semantics/styles, retry scheduling and a local decorative favicon, not certified geography or heraldic selections.

## Changes and actual proof

- Search hint, tree levels/footer now use darker green; minimum computed ratio across the five tested layouts:5.405:1. Foreground/background pairs are recorded, including selected rows. Existing hover/focus states and disabled exceptions are retained; this is targeted evidence, not full-page WCAG certification.
- One accessible h1 represents the same visual brand; the decorative duplicate is aria-hidden. Hidden semantic h2 uses the actual toolbar title, while its existing visual span remains aria-hidden. No old static contract was removed or relaxed. Chromium AX heading records prove the accessible hierarchy.
- Card actions, siblings and breadcrumbs have44CSS-pixel minimum targets. Layouts360/390/700/900/1440 and native browser200% zoom have no document overflow. Native preference uses the partition dictionary documented in [Chromium source](https://raw.githubusercontent.com/chromium/chromium/main/chrome/browser/ui/zoom/chrome_zoom_level_prefs.cc); actual DPR2, visualScale1 and reduced CSS viewport are recorded, not inferred from the preference alone.
- A dedicated EN/RO retry uses only failed, currently required shard/mode entries. Successful/pending promises remain cached. State is preserved, root errors are independent, and stale mode/navigation results are guarded. Browser HTTP503 tests recover roots and Harghita's catalogue-derived ro-adm-03 shard with active ADM filters. Root setup had1failed request and Harghita setup2 during state/filter actions; the subsequent doubleRetry causes exactly1request in each case. This count is isolated from setup, not reported as2total for every scenario. Real-loader unit tests additionally verify simultaneous-request deduplication and exclusion of hidden/other-mode failures.
- Desktop Entity previously overlays the map stack at the same right edge. The stack now stays16px left of the340px card while present; actual hit tests at900/1440 confirm no occlusion. Attribution and scale are also moved beside the corresponding overlay panel and their rectangles are verified. The mobile modal is intentional, not forced into a desktop layout. Opening global tools retains existing panel/focus lifecycle.
- Local ring favicon matches existing decorative brand; Vite resolves /atlas/favicon.svg, fetched successfully. No coat/flag reproduction was created or edited.

## Validation and limits

288/288 tests; TypeScript/Vite; full existing Chromium desktop/mobile suite;5targeted widths;11exact-ID cards;2controlled HTTP503 recoveries; native200% zoom; SIM-R7/R8/CLOSE reproducibility: PASS. validation-5b.json and individual reports record actual results; exact-SHA CI and publication are attested separately after integration. The full smoke reads real CSV/GeoJSON downloads, tests detailed export in simplified mode, camera/permalink restoration, resets, hierarchy, symbols and focus return.

The selected-image rights and all SIM-CLOSE verdicts remain unchanged. The5a protected-input manifest is rechecked by the new tests. The907 institutional cases are not revisited. No SIM-R9, new dependency, paid service or new heraldic research.

No NVDA/VoiceOver session was available. Automated AX/contrast/targets, keyboard execution and manual screenshot inspection do not constitute integral WCAG2.2AA certification. Issues and unconfirmed/setup observations are separated in issues.json and not-reproduced.json.
