# HIST-UI.1 — rafinarea interfeței modulului Istoric

**Context:** captura de ecran din 22 noiembrie 2026 arăta titlu OHM prea mare, explicații repetate, căutarea și filtrele temporale prost aliniate și contrast slab. Nu era defect de date OHM sau de hartă.

## Modificări vizuale

- Titlu compact, bilingv: „Entități istorice / Historical entities”, plus indicator textual OHM.
- Antet de inventar: 76 grupuri editoriale ale sursei, 139 versiuni OHM; fără a le numi 76 de identități administrative certificate.
- Căutare cu etichetă/placeholder dedicat și comandă de ștergere; căutarea este insensibilă la diacritice (ș/ş, ț/ţ în forme decompozabile).
- Anul și filtrul temporal într-un rând compact; schimbarea anului activează automat filtrarea, fără a extrapola perioadele OHM incomplete.
- Categorii pliante state/regiuni (43), județe (19), comitate (77). Prima categorie este deschisă inițial.
- În fiecare categorie, un grup cu o singură versiune permite selecție directă; grupurile cu mai multe versiuni prezintă intervalele în ordine și relația OHM din dreptul perioadei.
- Căutarea deschide categoriile și grupurile relevante; lista revine la starea normală după ștergerea termenului.
- Avertismentul general este disponibil în secțiunea retractabilă „Despre sursă și limite / About the source and limitations”; certificarea geometriilor rămâne vizibilă în cardul Entitate.
- Layout și stări hover/focus/selected pentru panoul desktop 300–320px și drawer mobil, fără modificarea interfeței ACTUAL.

## Contracte păstrate

Nu se certifică administrativ apartenența grupurilor OHM, nu se inventează succesiuni, nu se creează poligoane sintetice și nu se extind perioade neconfirmate. `sourceGroup` este un grup editorial, nu o relație juridică părinte–copil. Datele și numărul de versiuni OHM sunt neschimbate. Geometriile HistoGIS rămân excluse din interfața activă și disponibile numai în arhiva Geodata GIS pentru completarea finală. Județele și plășile din 1930 sunt etapa următoare, separată.

## Verificare

`npm test`, `npm run build`, testele Chromium desktop/mobil `scripts/ci/browser-smoke.mjs` (inclusiv verificare de aliniere filtre, căutare și selecție) și workflow-ul protejat GitHub Actions înainte de merge/deploy.
