# WEB-R3.0 — Spațiul hărții și panouri retractabile

**Stadiu:** specificație UX propusă, numai pentru revizuire — **nu este implementată**  
**Data:** 2026-11-06  
**Bază verificată:** `main` la `b26356a11342e50a3926683ef4515bb07da0c29e`  
**Sursă de audit:** codul `src/App.tsx`, `src/styles.css` și capturile desktop/mobil generate de GitHub Actions, rularea [42296564871](https://github.com/ovidiudeica/atlas/actions/runs/42296564871).

## Obiectiv

**Harta este ecranul principal.** Doar comenzile indispensabile navigării rămân permanent peste suprafața cartografică; navigarea prin module, selecția geometriilor, exportul și setările sunt accesibile în panouri retractabile. Niciun comportament acceptat anterior al datelor și filtrelor nu este eliminat.

## Diagnosticul actual, confirmat în cod și capturi

- Desktop: bara modulelor este o coloană fixă de **70 px**, panoul arborelui **290 px**, panoul „Detalii” **302 px**. La o lățime de 1440 px, harta primește în mod normal **778 px**. Închiderea celor două panouri recuperează **592 px**, iar o bară modulelor de 56 px mai recuperează 14 px.
- Panoul detaliilor este randat chiar dacă `selected === null` (mesajul gol „Choose an entity”), ocupând spațiu fără utilitate.
- Modul activ se schimbă la click pe buton, dar apăsarea repetată a aceluiași modul nu deschide/închide panoul.
- `map-controls` ocupă primul rând (fundal, simplificare), `map-quick-actions` al doilea (încadrează vizibile, încadrează selectata, resetează geometrii, exportă), iar `zoom-controls` un al treilea grup; la 390 px aceste comenzi acoperă vizibil harta.
- Legenda, avertismentul sursei și inscripția despre module neimplementate sunt simultan vizibile în zona hărții.
- Pe mobil există două comenzi „Teritorii” și „Detalii”, deși există deja o bară cu module.

## Design aprobat în principiu de cerința utilizatorului; plasarea propusă

### 1. Harta, permanent vizibilă

În interiorul hărții rămân permanent numai trei butoane pictografice, într-o singură coloană compactă **dreapta sus**:

| Icon | Funcție | Observație |
| --- | --- | --- |
| `+` | Mărește | Buton accesibil; zoom prin scroll/pinch păstrat |
| `−` | Micșorează | La fel |
| `⌂` | Acasă / reîncadrare RO+MD | **Doar camera**, fără modificarea selecțiilor |

Păstrăm vizibile obligațiile cartografice: atribuirea OSM/MapLibre și scara grafică. Erorile de date/loading pot apărea temporar ca toast/status accesibil. Legenda și nota despre proveniență sunt accesibile din zona „Informații & legendă” a panoului, prin expandare, nu printr-o etichetă permanentă peste hartă. Avertismentele despre valoarea juridică a contururilor rămân păstrate și accesibile.

### 2. Bara modulelor: iconițe care comută panoul stâng

- Desktop: bară verticală redusă la **56 px**; mobil: bară cu iconițe în partea de jos, respectând safe-area. Fără texte lungi vizibile permanent, însă iconițele au etichetă `aria-label`, `title` și tooltip vizibil la hover/focus (nu doar hover, inaccesibil pe mobil).
- **Prima apăsare** pe iconul modulului închise deschide panoul acelui modul.
- **A doua apăsare** pe același icon îl închide și readuce spațiul hărții.
- Apăsarea altui icon schimbă modulul și deschide noul panou. Nu mai există caseta `module-notice` peste hartă; descrierea modulelor planificate apare în propriul panou.
- **La prima intrare:** modulul Administrativ este selectat ca context, dar panoul stâng este **închis**, astfel încât harta ocupă spațiul maxim. Pentru o aplicație de atlas orientată spre hartă, panoul se deschide la cerere.
- Nu pierde starea arborelui, a filtrelor sau a geometriilor vizibile prin simpla închidere a panoului. Butonul de închidere „×” și Escape sunt disponibile. **Închiderea panoului nu echivalează cu resetarea geometriilor.**

### 3. Panoul modulului Administrativ: secțiuni extensibile

Panoul stâng de aproximativ **320 px** (sub 390 px pe ecrane înguste) are următoarea ierarhie:

1. **Căutare & arbore** — comportamentul și datele existente.
2. **Filtre** — aceeași listă combinată ADM/NUTS/NTS, cu România înaintea Republicii Moldova.
3. **Setări de afișare** (închisă implicit) — tipul hărții de fundal, opțiunea globală geometrii detaliate/simplificate.
4. **Acțiuni pentru geometrii** (închisă implicit) — `Încadrează toate vizibile`, `Resetează geometriile` (revine la două contururi inițiale, distinct de Acasă).
5. **Export & partajare** (închisă implicit) — GeoJSON, CSV, link permanent; exportul entității selectate rămâne disponibil și din Detalii.
6. **Informații & legendă** (închisă implicit) — legendă ADM/statistic, proveniență, nota privind hotarele necertificate juridic.

Nu apar duplicate de butoane. Secțiunile din panou folosesc titluri ușor de deschis și forme compacte, cu texte numai când sunt expandate.

### 4. Detaliile entității: panou drept condițional

- Fără entitate selectată, **niciun panou drept nu este randat**, niciun mesaj „Selectează o entitate” nu consumă spațiu.
- Alegerea unei entități din arbore, rezultate de căutare sau hartă deschide automat detaliile într-un panou drept de aproximativ **340 px**, retractabil.
- Butonul **×** sau Escape închide **doar panoul detaliilor**, păstrând selecția și geometria vizibilă. Reapăsarea pe entitatea selectată poate redeschide detaliile.
- Alegerea alteia reafișează detaliile actualizate. După `Resetează geometriile`, selecția este golită, iar panoul drept se închide.
- Butonul `Încadrează entitatea`, detaliile OSM/registru și exportul individual sunt păstrate aici; exportul loturilor rămâne în panoul modulului.
- Dacă un permalink cu entitate este valid, poate deschide direct Detalii. Un URL fără entitate nu creează panou gol.

### 5. Desktop, tabletă și mobil

**Desktop (de la ~1100 px):** harta ocupă toată zona aflată la dreapta barei modulelor. Panourile stâng/drept sunt retractabile, de preferat **overlay ancorat în margini** peste hartă pentru a evita o schimbare permanentă a lățimii canvasului și pentru ca închiderea să redea spațiul instantaneu. Utilizatorul le poate deschide simultan, dar le poate închide independent.

**Tabletă (701–1099 px):** maximum un panou peste hartă la un moment dat; deschiderea Detaliilor poate închide panoul din stânga.

**Mobil (≤700 px):** bara de module rămâne accesibilă jos; panoul modulului este un drawer din lateral, iar Detaliile sunt un bottom sheet sau drawer cu buton de închidere. Eliminăm duplicatele plutitoare „Teritorii” și „Detalii” când aceeași acțiune este deja accesibilă din bara de module, respectiv din selecția entității. Touch target minim 44×44 px; controalele de zoom și Acasă nu se suprapun cu barele de sistem.

## Schițe de structură

```text
DESKTOP, la pornire (panouri închise)
┌────────────────────────────────────────────────────────────────────┐
│ Atlas Teritorial                                      EN / RO      │
├─────┬──────────────────────────────────────────────────────────────┤
│  ▤  │                                                    [+]       │
│  ◷  │                    H A R T Ă                       [−]       │
│  ♙  │                                                    [⌂]       │
│  ◇  │                                                              │
│  ✦  │     contururile România + Moldova, fără alte comenzi         │
│  ⇄  │                                              scară / OSM      │
└─────┴──────────────────────────────────────────────────────────────┘

DESKTOP, modul și entitate deschise
┌─────┬─────────────────┬─────────────────────────┬────────────────┐
│  ▤  │  Administrativ × │                         │  Detalii     × │
│  ◷  │  Căutare         │           HARTĂ         │  Entitate      │
│  ♙  │  Arbore          │                   + − ⌂ │  Încadrare     │
│  ◇  │  ▸ Filtre        │                         │  Metadate      │
│  ✦  │  ▸ Setări hartă  │                         │  Date sursă    │
│  ⇄  │  ▸ Export        │                         │  Export        │
└─────┴─────────────────┴─────────────────────────┴────────────────┘
```

Această schemă reprezintă intenția de interacțiune, **nu o captură a unei interfețe implementate**.

## Reguli de accesibilitate și persistență

- Orice icon are `aria-label` și `title`, etichetă la focus și stare `aria-expanded`/ `aria-controls` unde este cazul.
- Tastele Tab/Shift+Tab navighează logic; Escape închide panoul activ și readuce focusul la declanșator. În mobil, focusul rămâne în dialog până la închidere; nu se poate accesa accidental harta din spatele lui.
- **Nu ascundem funcții exclusiv în hover**: la mobil deschiderea se face prin click/tap.
- Închiderea unui panou păstrează `visible`, `selected`, `expanded`, `treeView`, `basemap`, `simplified`, limba și permalinkul; resetarea este o acțiune explicită separată.
- La deschiderea Detaliilor de pe o hartă densă, geometria și selecția trebuie să rămână inteligibile; nu resetăm automat zoomul și nu suprascriem URL-ul.
- Retractarea panourilor nu regenerează catalogul și nu resetează MapLibre. Dacă se schimbă efectiv dimensiunea containerului, apelăm `map.resize()`; dacă sunt overlay-uri, nu forțăm un remount.

## Etape de implementare și verificare

**WEB-R3.1 — panouri și starea interfeței:** separă `activeModule` de `openModulePanel` și `selectedEntity` de `detailPanelOpen`; implementează toggle, X, Escape, click outside, selecție și deschidere condițională, fără pierderea datelor.

**WEB-R3.2 — relocarea comenzilor:** păstrează pe hartă strict `+`, `−`, `Acasă`; mută fundalul, simplificarea, încadrarea, resetarea, exportul, partajarea, legenda și informarea în panourile retractabile. Elimină duplicatele de comenzi, nu funcțiile.

**WEB-R3.3 — adaptare și regresii:** Chromium desktop 1440, tabletă 900 și mobil 390/360; screenshot închis/deschis, detalii selectate/ne-selectate, două module comutate, navigare cu tastatura, Escape și focus, export GeoJSON/CSV, Filtre ADM/NUTS/NTS, resetare, permalink, mod simplificat, starea de încărcare și atribuirea OSM.

### Criterii de acceptare

1. La 1440 px, fără panouri deschise, harta ocupă aproximativ `1440 − 56 = 1384 px`, comparativ cu `778 px` înainte; diferența estimată este de **606 px**.
2. La pornirea fără entitate, panoul Detalii nu ocupă **niciun pixel**.
3. Click/tap repetat pe același modul comută deschis/închis; schimbarea modulului deschide panoul potrivit.
4. Nicio funcție actuală de selecție, filtre, resetare, export sau permalink nu se pierde; data OSMB și geometria originală/simplificată rămân neschimbate.
5. Mobile Chromium nu prezintă derulare orizontală, iar butoanele de control ale hărții nu se suprapun.
6. Întregul CI obligatoriu trece pe SHA-ul exact; inspectăm capturile desktop/tabletă/mobil **înainte de integrare** și repetăm auditul GitHub Pages **după integrare**.

## Limită de autorizare

Aceasta este o **specificație UX pentru discuție și acceptare**, nu o modificare a site-ului publicat. Implementarea se face în PR-uri separate, fără intervenții asupra `data/`, `public/data/`, snapshotului OSMB 2026-10-05, celor 4.283 entități, codurilor SIRUTA/CUATM sau ADR-0002 privind excepțiile cartografice.
