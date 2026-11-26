# Original production audits

- #160 preserved the completed production audit, the browser-smoke evidence and the comparison with the historical catalog at its own audit window. Production status is time-specific.
- #162 audit verdict FAILED. Run 45405996730, job Build and verify website, step Static regression tests. The production smoke raised “9c target deployment not visible within audit window” and exited with code 1. The log establishes the waiting timeout. The provider log does not establish the reason the deployment was not visible during the window.
