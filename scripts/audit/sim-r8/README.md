# SIM-R8 — cercetare țintită și reproducere

Baza verificată: main0208ec5f2f0f3d71805b64f8883231431adc6751. Cercetarea nu rulează în build. Nu se repetă907 cereri. Documentele istorice sunt reutilizate prin cache exactURL; o cerere nouă necesită motiv documentat. Valorile cookie-urilor anonime e-monitor nu sunt salvate.

`01-gazette-recovery.mjs` reproduce fluxul calendarului public gratuit, cu limitare și checkpoint PDF; nu îl executați pentru simpla validare. Cele trei numere conțin efectiv actele și anexele inspectate la paginile2,10,52. Dosarul București11888 este proiect, nu anexă finală certificată. Taraclia241 este probă veche reutilizată, nu document nou recuperat.

Validare fără rețea:

```
node scripts/audit/sim-r7/12-verify-reproducibility.mjs
node scripts/audit/sim-r8/03-verify-reproducibility.mjs
npm test
npm run build
node scripts/ci/browser-smoke.mjs
```

Generatorul02 citește exclusiv registrele/probele comise. Fișierele PNG sunt decupaje literale ale paginilor randate Poppler; coordonatele, dimensiunile și hashurile sursă/rezultat se păstrează în replacement-provenance.json. Nu se regenerează imaginile cu un desenator automat. Testele verifică byte-identitatea fișierelor deja inspectate, distinct de determinismul registrelor gzip pe Windows/Linux.

Trei cazuri de drepturi sunt rezolvate prin înlocuire, nu prin certificarea retroactivă a vechilor opere. Cele41 rămase au impedimente individuale. Cele18 alternative în carantină și31 invalidări istorice rămân; invalidarea nouă Câmpulung este separată. Nu există derogări globale de selecție.

Testele istorice R6/R7 confruntă snapshotul etapei lor pentru verdictele legitim schimbate înR8; testele R8 verifică separat runtime-ul și împiedică fallback-ul vechi. Contractele negative și probele geografice nu sunt slăbite.

Gate-ul03 regenerează în work/sim-r8-repro-* și compară strict cele6 ieșiri cu artefactele sursă, fără rescrierea lor. Această izolare evită blocări temporare Windows ale fișierelor gzip și păstrează identitatea byte-cu-byte. Artefactele temporare rămân checkpointuri locale ignorate de Git.
