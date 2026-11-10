# WEB-AUDIT.5 — raport final de remediere și certificare

**WEB-AUDIT.5 CERTIFIED — pentru buildul aplicației b77c748b790aa96aaa41ba175cdcd45e247896e4, verificat efectiv pe GitHub Pages.** Nu este o atestare integrală WCAG și nu este certificare juridică/heraldică. Publicarea commitului care arhivează această certificare va avea o atestare post-merge separată, în PR-ul său; acest raport nu pretinde executarea anticipată a unui CI viitor.

## Integrări funcționale și dovezi

- [PR82 /5a](https://github.com/ovidiudeica/atlas/pull/82):82622896078bab8ce4ec25a7a8cac40c9bf6b87a; CI exact42807696004 și post-merge/Pages42808340688:succes.
- [PR83 /5b](https://github.com/ovidiudeica/atlas/pull/83):b77c748b790aa96aaa41ba175cdcd45e247896e4; CI exact42817224872 și post-merge/Pages42818468090:succes.
- [Registrul CI](ci-5ab.json) separă explicit deploy-urile PR neexecutate de joburile efectiv reușite. Commitul5c conține numai instrumente/probe de certificare; nicio schimbare suplimentară a aplicației. [Perimetrul](certification-scope.json) păstrează toate aserțiunile și secvența testului Chromium existent.

## Remedieri și verdicte

| Problemă | Remediere / verificare | Verdict |
|---|---|---|
| EXCESSIVE_TREE_ORIGINALS | 5a: remote tree originals require exact-ID selection or reuse; zero unselected external search/branch requests in3after trials and3live trials. | FIXED_AND_VERIFIED |
| SEARCH_HINT_CONTRAST | Computed foreground/background contrast >=4.5 at all5widths. | FIXED_AND_VERIFIED |
| TREE_LEVEL_CONTRAST | Administrative/statistical label colors darkened without palette redesign; computed ratios recorded. | FIXED_AND_VERIFIED |
| TREE_FOOTNOTE_CONTRAST | Footer foreground darkened; actual computed ratios recorded. | FIXED_AND_VERIFIED |
| MISSING_SEMANTIC_H1 | One accessible site h1; visual brand hidden from AT to avoid duplicate title; real panel h2 and existing entity h3/section h4. | FIXED_AND_VERIFIED |
| CARD_AND_BREADCRUMB_TARGETS | 44CSS-pixel card controls and breadcrumbs;5viewports and actual native200% zoom. Disabled controls are not treated as normal contrast failures. | FIXED_AND_VERIFIED |
| KEYBOARD_FOCUS_AND_EXPORTS | Complete existing Chromium suite passed: Escape/focus return, Tab/ShiftTab, filters, CSV/GeoJSON content, original geometry in simplified mode, resets and permalink. Existing behavior retained. | NO_DEFECT_CONFIRMED |
| GEOMETRY_RECOVERY | Dedicated EN/RO retry; only failed currently-required shard/mode; existing successful/pending cache retained. Root and exact Harghita shard HTTP503 recovered with active ADM filters and one request from doubleRetry. | FIXED_AND_VERIFIED |
| ENTITY_MAP_CONTROL_OVERLAP | Desktop stack moves left of340px card only while card is present; hit tests verify exposed controls at900/1440; attribution and scale remain beside their overlay panels; mobile modal remains intentional. | FIXED_AND_VERIFIED |
| FAVICON_BASE_PATH | Local decorative atlas ring favicon and Vite BASE_URL; actual /atlas/favicon.svg HTTP200. Domain-root /favicon.ico is not a resource under this Pages project. | FIXED_AND_VERIFIED |
| NATIVE_BROWSER_ZOOM | Actual default host zoom200% validated by CSS viewport/DPR2/visualScale1 with no emulated device metrics; no horizontal overflow. | NO_DEFECT_CONFIRMED |
| FULL_SCREEN_READER_CONFORMANCE | No NVDA/VoiceOver session available; AX tree, keyboard and visual checks are not full WCAG2.2AA certification. No claim of complete WCAG conformance. | BLOCKED_WITH_EVIDENCE |
| EFFECTIVE_SMALL_TARGET_SPACING | 760semantic-target observations in20responsive states, including120undersized observations: zero computed spacing conflicts. Associated labels count as actual click area; no blanket full-WCAG claim. | NO_DEFECT_CONFIRMED |
| REAL_VISIBLE_EXPORT_CONTENT | Certification coverage completed: selected/visible CSV and original detailed GeoJSON downloaded live and compared against exact IDs/codes/parentage/source coordinates in simplified display. | FIXED_AND_VERIFIED |
| EXISTING_BUNDLE_WARNING | Existing Vite large-chunk warning remains. This mission fixes demonstrated unsolicited original-image traffic; broader map/library splitting would require separate profiling and justified scope, not an unrequested architecture change. | DEFERRED_WITH_JUSTIFICATION |

## Performanță înainte/după

Aceleași3probe locale:52/62/60cereri externe în căutarea progresivă înainte,20.940.437/22.367.382/41.127.001octeți observați; după,0/0/0cereri externe în căutare și extindere. Fluxul complet după a transferat1.161.669octeți de imagini în fiecare probă, pentru resursele necesare. [Datele înainte/după](performance-5a.json) și jurnalele brute păstrează URL-uri, faze, statusuri și octeți CDP; finalizările lipsă nu sunt dovezi de resurse cu dimensiune zero. Nu s-au creat thumbnailuri sau reproduceri grafice noi. O imagine externă selectată explicit poate încă solicita originalul.

Șase probe finale live au folosit profil izolat, cache rece apoi reload cald,3probe per viewport, tastare75ms,250msstabilizare, aceleași4căutări, ramura Harghita,3cicluri Escape/Slash, Enter și schimbarea modului geometric. Nu a rulat în paralel alt browser al auditului în această serie live. Încărcarea generală a sistemului/rețeaua nu sunt controlate statistic.

| Viewport | Pregătire sursă rece ms (3probe) | Pregătire caldă ms | Schimbare geometrie ms | Originale nesolicitate |
|---|---|---|---|---|
| 1440 | 7329 / 3615 / 5515 | 3446 / 3327 / 3214 | 239 / 1451 / 626 | 0 / 0 / 0 |
| 390 | 2134 / 2120 / 1831 | 1736 / 897 / 1204 | 230 / 421 / 267 | 0 / 0 / 0 |

[FCP, timpi, cereri și octeți pe faze](performance-summary-final.json), [jurnal live](final-performance-public.json), [jurnal local](final-performance-local.json). Timpii măsoară starea source-ready, nu garantează GPU-idle; intervalele prescrise de tastare/stabilizare sunt documentate. Nu se compară direct cu vechea probă singulară7,17s/13,23s și nu se inventează procente.

## Accesibilitate și funcționalitate

Contrastul minim calculat pentru textele vizate este5,405:1. Au fost verificate360/390/700/900/1440px, un singur h1 în AX tree, h2 de panou/h3 de entitate/h4 de secțiune, ținte de44CSSpx pentru card/breadcrumb, focus și suprapuneri. [Scanarea țintelor](target-areas-public.json) cu760observații în20stări include120observații sub24px, fără conflicte de spațiere calculate; suprafața etichetelor formularului contează, nu doar bifa/textul. Criteriul și excepțiile se verifică în context, conform [W3C2.5.8](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html). Nu se echivalează această scanare cu un audit WCAG integral.

[Zoomul nativ200%](native-zoom-public.json) este dovedit prin DPR2, scalare vizuală1 și viewport CSS redus, nu doar printr-o preferință configurată. [Probele live5b](accessibility-resilience-public.json) verifică11carduri per-ID, două erori503controlate, păstrarea limbii/selecției/filtrelor ADM active și exact1cerere produsă de dublul Retry. Fake503 este interceptare în browser, nu o constatare de indisponibilitate a serverului. O probă separată de imagine503 păstrează sursa și arată substitutul neutru în antet/galerie, fără drapel substituit.

Testul Chromium complet a rulat pe website-ul real, cu aceleași aserțiuni și cu descărcări într-un director proaspăt. [Exporturile live](exports-public.json) includ toate4combinațiile selectat/vizibil × CSV/GeoJSON: ID-uri/coduri/părinți corecți și coordonate identice sursei detaliate în modul de afișare simplificat; resetarea elimină selecția și parametrul de permalink. Harta, filtrele, ierarhiile, exporturile, restaurarea linkului și focusul au trecut suita existentă.

## Integritate, build și limite

4283identități /8566sloturi;1500steme /299drapele /2778entități fără imagini. Hashurile tuturor celor273intrări protejate din [manifestul5a](integrity-5a.json) sunt neschimbate. Data cartografică rămâne5octombrie2026. Registrele SIM-CLOSE,41dosare de drepturi, șase excepții, carantina și invalidările rămân neschimbate; nu s-a redeschis cercetarea heraldică sau SIM-R9.

Instalare curată npmci;290/290teste Node reușite la momentul acestei înregistrări; TypeScript/Vite; [SIM-R7/R8/CLOSE](reproducibility-5c.json):succes. Testele noi ale certificatului și rezultatul final al CI se atestă pe SHA-ul exact, separat de această bază deja publicată. [Egalitatea Windows/Linux](windows-linux-build-equality.json) și [publicarea5b](publication-5b.json) confirmă11fișiere identice, inclusiv JS/CSS, favicon, registre și geometrie. Gzipul canonic al arhivelor rămâne reproductibil.

NVDA/VoiceOver nu au fost disponibile; verificările AX/tastatură/contrast/ținte și inspecția capturilor nu certifică integral WCAG2.2AA. Warningul Vite privind chunkul mare este preexistent și documentat; restructurarea bibliotecii hărții nu a fost introdusă pentru a cosmetiza un scor. Nu s-au efectuat plăți sau adăugat dependențe. Următoarea etapă recomandată: **WEB-MAINTENANCE — monitorizarea regresiilor și o sesiune asistivă NVDA/VoiceOver când este disponibilă**, fără etapă SIM automată.
