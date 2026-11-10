# Protocol de validare prin tehnologie asistivă

**ASSISTIVE_TECH_VALIDATION_PENDING**. Nu s-a executat NVDA sau VoiceOver în această etapă. Nu se declară WCAG_AA_CERTIFIED. Verificările AX/DOM, tastatura CDP și probele vizuale sunt categorii distincte de citirea efectivă cu sinteză vocală.

Mediu recomandat: NVDA deja instalat și autorizat + Chrome/Edge stabil pe Windows; alternativ VoiceOver + Safari numai pe un dispozitiv macOS/iOS efectiv disponibil. Nu instala software și nu modifica setări personale fără autorizare. Verificarea Windows a proceselor, PATH, celor două căi Program Files și intrărilor Uninstall nu a identificat NVDA/JAWS; aceasta nu exclude o copie portabilă într-o altă locație. VoiceOver/Safari pe un dispozitiv Apple nu sunt disponibile în mediul curent.

Înaintea sesiunii completează: tester, dată/oră, SHA/publicare, URL, OS, browser/versiune, cititor/versiune, limba vocii, viewport/zoom. Păstrează separat rezultatele EN și RO. Nu completa rezultatul observat din presupuneri.

Comenzi NVDA: Insert+T (titlul ferestrei), NVDA+Space (browse/focus), H/Shift+H (titluri), D/Shift+D (regiuni), B/Shift+B (butoane), E (câmp), X (bifă), Tab/Shift+Tab, Enter/Space, Escape. Slash `/` activează căutarea aplicației numai când tasta ajunge la aplicație: în browse mode folosește întâi modul focus; nu interpreta capturarea tastei de cititor ca defect automat. VoiceOver macOS: VO=Control+Option, VO+U (rotor), VO+săgeți, VO+Space; dezactivează Quick Nav doar cu acordul testerului dacă este necesar. Pe iOS folosește rotorul și gesturile echivalente; nu pretinde echivalență perfectă între platforme.

| ID | Pași / comenzi | Rezultat așteptat | Rezultat observat | Severitate / dosar |
|---|---|---|---|---|
| AT01 | Deschide `/atlas/`; Insert+T; H | Titlul Atlas; un h1, fără dublarea brandului; titluri de panou/entitate/secțiune ordonate | NEEXECUTAT | PENDING |
| AT02 | D, apoi Tab în bara de module | Regiuni inteligibile și șase module cu nume, fără butoane mute | NEEXECUTAT | PENDING |
| AT03 | Tab la EN și RO; Space | Limba documentului și etichetele se schimbă; butonul activ este identificabil | NEEXECUTAT | PENDING |
| AT04 | Enter pe Administrativ; Escape | Panou numit; starea expanded se schimbă; focusul revine la declanșator | NEEXECUTAT | PENDING |
| AT05 | Slash în focus mode; tastează Harghita; examinează rezultatele; caută apoi ID-ul osm-r2248660; Enter | Câmp de căutare numit; rezultat exact; selecție `osm-r2248660` | NEEXECUTAT | PENDING |
| AT06 | Caută nume/cod; navighează arborele și extinderea | Denumiri, părinte/copii și niveluri ADM/NUTS/NTS inteligibile; identități păstrate | NEEXECUTAT | PENDING |
| AT07 | X/Tab la bifele de vizibilitate; Space | Nume și checked/unchecked corecte, fără schimbarea titularului | NEEXECUTAT | PENDING |
| AT08 | Deschide permalink Taraclia `?entity=osm-r1699033&lang=ro`; schimbă EN/RO | Numele scurt/oficial, ID și roluri se citesc în limba selectată | NEEXECUTAT | PENDING |
| AT09 | Tab la instrumentele hărții, zoom/reset | Comenzi numite, activabile; resetarea păstrează contractul modul/global | NEEXECUTAT | PENDING |
| AT10 | Navighează titlurile și conținutul fișei Entity | Părinte/copii, coduri și roluri accesibile fără capcană de focus | NEEXECUTAT | PENDING |
| AT11 | Citește secțiunea Simboluri teritoriale | Stemă și drapel distincte; alt/nume neutru la lipsă; drapelul nu substituie stema | NEEXECUTAT | PENDING |
| AT12 | Citește sursa, proveniența și avertismentele | Incertitudinea nu se anunță ca certificare sau utilizare liberă | NEEXECUTAT | PENDING |
| AT13 | Tab/Enter pe exporturile CSV/GeoJSON | Butoane numite; descărcare; focus recuperabil după încheiere | NEEXECUTAT | PENDING |
| AT14 | Mobil/viewport390; deschide module/Entity; Tab și Shift+Tab; Escape | Dialog numit/modal, ordine logică, ieșire accesibilă și focus restaurat | NEEXECUTAT | PENDING |
| AT15 | Pe mediu de test, injectează eroare geometrie apoi Retry | Mesaj EN/RO perceptibil; retry disponibil; selecția/filtrele nu se pierd | NEEXECUTAT | PENDING |
| AT16 | Pe mediu de test, fă indisponibilă o imagine/sursă externă | Substitut neutru și sursă păstrată; catalogul rămâne navigabil | NEEXECUTAT | PENDING |
| AT17 | Reîncarcă permalinkul, apoi resetează | Selecția se restaurează, apoi parametrul se elimină conform comenzii; focus logic | NEEXECUTAT | PENDING |

Pentru fiecare eșec: înregistrează cuvintele efectiv rostite sau transcriptul, controlul, pașii, ID Atlas, mediul și rezultatul așteptat/observat; evită înregistrări cu date personale. Raportează prin issue/dosar în `ovidiudeica/atlas`, cu severitatea din procedura de mentenanță și referința ATxx. Nu transforma o limitare de cititor într-o modificare geografică/heraldică. Un rezultat pending nu blochează automat dezvoltarea celorlalte module. O certificare viitoare necesită probele umane efective, nu simpla bifare a protocolului.
