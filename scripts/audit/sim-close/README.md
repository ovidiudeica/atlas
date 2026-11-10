# SIM-CLOSE — consolidare fără cercetare nouă

Baza: be7b1a033d7482e419a0aba0ed9cc8765b83ee87, cu SIM-R8/PR80 inclus. Nu se modifică imaginile, sursele funcționale, geografiile, workflow-ul sau testele istorice.

```
node scripts/audit/sim-close/generate.mjs
node scripts/audit/sim-close/verify-scope.mjs
node scripts/audit/sim-close/verify-reproducibility.mjs
node scripts/audit/sim-r7/12-verify-reproducibility.mjs
node scripts/audit/sim-r8/03-verify-reproducibility.mjs
npm test
npm run build
node scripts/ci/browser-smoke.mjs
```

Generatorul citește numai snapshoturile R8 și inventarul fixat source-index.json; nu folosește rețeaua, timpul curent, noua stare a unui website sau catalogul funcțional viitor pentru numărătorile istorice. Produce șase artefacte deterministe. Verificarea izolată scrie exclusiv în work/sim-close-repro-* și compară hashurile fără a modifica sursele.

verify-scope confruntă efectiv Git cu baza și admite numai documentele SIM-CLOSE, scripturile auxiliare ale închiderii și testul nou. Dovada este un snapshot al implementării, nu o constrângere globală asupra commiturilor WEB viitoare. Testele numerice citesc arhivele R8 și nu impun mărimea globală a viitoarelor registre.

Validatorul reopening-policy verifică doar eligibilitatea formală pentru revizuire individuală. Nu certifică acte, licențe sau drepturi, nu acordă permisiune de publicare și nu pornește un audit nou. Exemplele din teste sunt marcate TEST_ONLY și nu reprezintă acte reale.

Rezultatele locale reale sunt consemnate în docs/audits/sim-close/validation.json. CI pe SHA exact și atestarea post-merge/Pages se verifică separat. Raportul generat nu pretinde că acestea erau deja executate la generare.
