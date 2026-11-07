# WEB-R3 — remediere CI GitHub Pages, fără modificarea atlasului

Incident observat la închiderea WEB-R3.21 / Etapa I, 7 noiembrie 2026:

1. PR #47 pe SHA `48f2d7a1ab3dd8d61c98c4235b450a56b8ba7907` a trecut integral testele, TypeScript/build și Chromium desktop/mobil și a fost integrat protejat la `d824dde063cb0e1da5abf72d1ab9771f31a9a024`.
2. Run-ul post-merge `42407379793` al SHA `39e22edf19c1892bed59a189f16dd6a214197dbf` a păstrat deschis deploy-ul Pages până la expirarea/eroarea sa, blocând publicarea imediată a ultimului SHA. Run-ul `42408006178` a primit HTTP 400: «Deployment request failed ... due to in progress deployment».
3. Reexecutarea jobului eșuat în același run, attempt 2, a produs **două artefacte cu numele `github-pages`** și `deploy-pages@v4` a refuzat explicit ambiguitatea: «Multiple artifacts named github-pages ... Artifact count is 2.»
4. Testele de cod și artefactele au rămas conforme; eșecurile sunt de infrastructură Pages, nu dovezi că website-ul actualizat ar fi publicat.

## Remediere minimală

- `.github/workflows/website.yml`: `concurrency.group: atlas-website-${{ github.ref }}`, `cancel-in-progress: false`: serializarea fluxurilor din aceeași referință, inclusiv a publicării `main`.
- Nume de artefact unic `github-pages-${{ github.run_id }}-${{ github.run_attempt }}` transmis identic acțiunilor `actions/upload-pages-artifact@v3` și `actions/deploy-pages@v4`. Nu se șterg alte artefacte și nu se falsifică verdele CI.
- `tests/pages-publish-reliability.test.mjs` impune invarianta perechii numelor, serializarea și menținerea testelor obligatorii.

## Criteriul de închidere

Apariția **unui nou run de main**, cu `head_sha` exact SHA-ul integrat, `Build and verify website = success`, `Deploy GitHub Pages = success`, plus dovada artefactelor și a adresei publicate. Nu se certifică până la succesul efectiv.

Această modificare privește doar CI și teste; `public/data/**` / catalogul ACTUAL / geometriile / identitățile / interfața rămân byte-for-byte neschimbate. Verificarea comparativă locală a celor două artefacte `catalog.json.gz` (la începutul WEB-R3.19a și la ultimul build WEB-R3.21) a produs același SHA-256: `1f930079194c92dc0e02d6e675165dddec6f49db0a62357bcc61be0705125482`, respectiv 4.283 entități.
