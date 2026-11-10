# WEB-MAINTENANCE — stabilizare operațională limitată

Baza verificată: `2980bf186b50393b987e36a78900958ce1026b7f`, cu PR82/83/84 incluse prin verificare GitHub și ancestry local. [Baseline](baseline.json) trimite la manifestele certificate, validarea290/290 și artefactul website-dist13773237109 al [run42834709591](https://github.com/ovidiudeica/atlas/actions/runs/42834709591). Nu există un manifest concurent al datelor. Orele UTC și metoda sunt în fiecare registru.

## Ce s-a executat

- Inspectarea workflow-ului, condițiilor, pașilor și execuțiilor reale: verificările obligatorii sunt necondiționate în jobul verify; deploy depinde de verify și se omite legitim la PR. Workflow-ul rămâne byte-identic certificatului. Nu s-au adăugat Actions, scheduler, dependențe ori servicii.
- Recuperare independentă și comparație byte-cu-byte pentru11resurse publicate: index, JS/CSS, favicon, catalog, registre și4reproduceri locale. Suplimentar, ambele geometrii roots detaliată/simplificată au fost citite și comparate cu artefactul CI; câte2features originale. [Publicare](publication.json).
- Probe limitate pe website-ul real: desktop1440 și mobil390, AX cu un h1, șase module numite, EN/RO, bife cu stări, aria-controls pentru controalele extinse, căutare după nume și ID exact, Enter, Slash, Tab/ShiftTab, Escape cu restaurarea focusului, dialog mobil și permalink reîncărcat. Numele oficiale, rolurile, stemă/drapel și sursele/avertismentele din card sunt consemnate tehnic, fără a pretinde citire vocală.
- Indisponibilități503sintetice pentru Commons, tile-uri OSM și un document-sursă în context separat: fără acces repetitiv la serviciile respective. Stema devine substitut neutru, fără drapel substituit; identitatea/sursa rămân neschimbate și vectorii locali se încarcă. Nu s-a constatat o indisponibilitate reală a acestor servicii. [Probe](live-health.json).
- Toate273intrările manifestului protejat au hashuri neschimbate. Nu s-a modificat codul aplicației, geografia, identitatea, ierarhia, codurile, data5octombrie2026, simbolurile, registrele SIM/CLOSE, carantina sau invalidările.

## Modificări și clasificare

Numai documentația de mentenanță, un verificator manual limitat și două teste ale registrelor. [Registrul constatărilor](operational-health.json) folosește categoriile cerute: VERIFIED_HEALTHY, NO_ACTION_REQUIRED, ASSISTIVE_TECH_VALIDATION_PENDING și EXTERNAL_DEPENDENCY_LIMITATION. Nu s-au inventat defecte care să justifice remedieri funcționale. Ipotezele și secvențierea noului harness au fost corectate și documentate separat de defectele aplicației.

Nu este necesară schimbarea CI, infrastructurii de monitorizare sau arhitecturii. Lipsa tile-urilor poate lăsa basemapul gol; nu există o promisiune de alertă pentru fiecare tile. Sursele externe pot rămâne indisponibile temporar. Aceste limite S3ipotetice nu anulează catalogul și nu justifică atribuiri heraldice alternative.

## Accesibilitate asistivă

**ASSISTIVE_TECH_VALIDATION_PENDING**: NVDA/JAWS nu au fost identificate în verificările limitate documentate; niciun mediu Apple nu a fost disponibil. Nu s-a instalat software, schimbat setări personale sau utilizat efectiv un cititor de ecran. [Protocolul uman](assistive-technology-checklist.md) conține17cazuri, comenzi NVDA/VoiceOver, rezultat așteptat, observație necompletată și severitate/raportare. Nu se declară WCAG_AA_CERTIFIED.

## Continuare și închidere

[Procedura](maintenance-procedure.md) separă defectul funcțional, accesibilitatea, publicarea, dependențele externe și dosarele de proveniență/drepturi SIM-CLOSE. Redeschiderea acestora necesită probe noi conform politicii existente; nu s-a inițiat SIM-R9 ori o cercetare nouă. Atlasul poate continua dezvoltarea fără blocarea celorlalte module de validarea asistivă pending.

Rezultatele locale finale sunt în validation.json; [manifestul închiderii](closure-manifest.json) păstrează hashurile probelor acestei etape și referința manifestului certificat. Integrarea și publicarea noului PR necesită propriul CI pe SHA exact și atestare separată după merge; acest document nu pretinde anticipat reușita lor. Verdictul **WEB-MAINTENANCE CLOSED_WITH_ASSISTIVE_VALIDATION_PENDING** se aplică numai după confirmarea acestor operațiuni în PR.

Următoarea etapă recomandată: dezvoltarea modulului **ISTORIC**, separat de ACTUAL, cu inventar, proveniență și validări pentru OpenHistoricalMap; nu începe automat în această misiune. Nu s-a efectuat cleanup de branch-uri sau istoric.

## Validări locale executate

292/292teste reușite,0eșecuri și0omise; TypeScript/Vite reușit; SIM-R7/R8/CLOSE reproductibile byte-cu-byte. Buildul Windows proaspăt corespunde celor13resurse publice verificate (11resurse principale și2geometrii de bază). npmci și suita Chromium completă vor rula din nou pe SHA-ul exact în CI; nu sunt declarate executate anticipat pentru noul commit. [Rezultatele și hashurile jurnalelor](validation.json).
