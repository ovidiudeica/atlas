# Procedura permanentă de mentenanță

Baza certificată și dovezile istorice sunt referite în [baseline.json](baseline.json). Manifestul autoritativ al datelor protejate rămâne cel WEB-AUDIT.5; nu se înlocuiește și nu se rescrie retrospectiv.

1. Pornește un branch dedicat din HEAD-ul real al `main`; verifică arborele de lucru și păstrează commiturile ulterioare.
2. Reproduce problema pe un ID Atlas exact și înregistrează URL-ul/permalinkul, browserul, dimensiunea, limba, pașii, rezultatul așteptat/observat, ora și severitatea. Atașează numai dovezile relevante; nu include date personale.
3. Deschide PR către `main`, cu scop limitat, explicația remedierii și probele. O problemă funcțională substanțială primește un dosar separat; nu extinde automat un PR documentar.
4. Execută `npm ci --no-audit --no-fund`, `npm test`, `npm run build` și cele trei comenzi de reproductibilitate de mai jos. Verificările Chromium existente din workflow sunt obligatorii; nu elimina aserțiuni și nu considera SKIPPED drept executat.
5. Verifică CI pe SHA-ul exact al head-ului PR. Orice commit nou necesită propriul rezultat; nu reutiliza succesul unui SHA anterior.
6. Integrează protejat numai când verificările obligatorii trec și regulile repository-ului permit. Nu modifica protecțiile `main`, nu forța merge-ul.
7. Verifică separat CI post-merge și jobul de deploy GitHub Pages pe SHA-ul integrat.
8. Descarcă artefactul `website-dist` al acelui run; compară resursele publicate relevante byte-cu-byte, folosind `/atlas/`, fără a declara recuperate fișiere care nu au putut fi citite. Artefactele Actions expiră: păstrează identificatorul run-ului, hashurile și atestarea; dacă artefactul lipsește, documentează limita, nu substitui un build netestat.
9. Examinează website-ul real desktop/mobil și permalinkul relevant. Înregistrează separat atestarea post-merge dacă aceasta nu putea exista în commitul inițial.

## Comenzi existente

```text
node scripts/audit/sim-r7/12-verify-reproducibility.mjs
node scripts/audit/sim-r8/03-verify-reproducibility.mjs
node scripts/audit/sim-close/verify-reproducibility.mjs
node scripts/ci/browser-smoke.mjs
```

Workflow-ul `.github/workflows/website.yml` execută și verificările WEB-AUDIT.5 pentru imagini, accesibilitate/recuperare, zoom nativ, performanță, exporturi și ținte. Nu este necesar un scheduler, o nouă Action sau un serviciu SaaS. Modificările se verifică la PR/push; incidentele live raportate declanșează investigații punctuale, nu cercetare repetitivă automată.

Verificarea limitată de mentenanță (manuală, fără job programat):

```text
CHROME_BIN=<executabil Chromium> ATLAS_CHROME_SOFTWARE=1 node scripts/audit/web-maintenance/verify-live.mjs
```

Pe PowerShell setează variabilele prin `$env:CHROME_BIN=...`; nu modifica preferințele browserului personal. Scriptul utilizează un profil temporar izolat, portul local 9408, două dimensiuni și răspunsuri 503 sintetice. `MAINTENANCE_REPORT` permite salvarea rezultatului post-merge separat; `ATLAS_AUDIT_SITE` permite o bază alternativă. Aceste probe nu dovedesc vorbirea unui cititor de ecran.

## Triaj și responsabilitate

| Categorie | Dovadă necesară | Măsură proporțională / responsabil |
|---|---|---|
| Defect funcțional | Reproducere, ID și stare, excepție sau rezultat incorect | Responsabil aplicație; PR separat cu regresie testată |
| Regresie de accesibilitate | Control/focus/nume/stare afectată, mediu, eventual transcript AT | Responsabil interfață; test tehnic și, unde e necesar, validare umană |
| Eroare de publicare | SHA, run/deploy, URL și hash diferit sau resursă absentă | Responsabil release; verifică artefactul și deploy-ul, fără schimbarea datelor |
| Serviciu extern temporar indisponibil | URL/status/oră; separă eroarea simulată de cea reală | Responsabil operațional; verifică fallbackul și impactul; nu bloca întregul catalog |
| Proveniență/drepturi | Reproducere exactă, hash, probă nouă și concluzie afectată | Responsabil editorial; aplică politica SIM-CLOSE, fără audit SIM nou |

Severitate: S1 = catalog/identitate coruptă, acces esențial blocat ori incident major; S2 = flux important afectat cu alternativă; S3 = inconvenient limitat; PENDING = probă încă neexecutată, nu defect demonstrat. Nu atribui automat S1 unei imagini externe absente.

Atlasul continuă dezvoltarea fără să presupună soluționate dosarele heraldice. Următorul domeniu propus este **ISTORIC**, separat de ACTUAL, cu inventar, proveniență și validări OpenHistoricalMap proprii. Această mentenanță nu implementează acel modul.
