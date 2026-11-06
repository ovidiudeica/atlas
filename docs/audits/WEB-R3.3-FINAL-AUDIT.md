# WEB-R3.3 — Auditul final al interfeței „Harta în prim-plan”

**Stadiu:** candidat pentru certificare — rezultatele se înscriu numai după închiderea efectivă a CI, inspectarea capturilor și auditul post-merge GitHub Pages.  
**Data:** 2026-11-06  
**Repository:** `ovidiudeica/atlas`  
**Bază:** `main` după WEB-R3.2, commit `410f380ba32f1b46ac6c549f5867d6d09f5da724`.

## Domeniu și interdicții

Auditul final verifică implementarea acceptată în WEB-R3.0, introdusă în WEB-R3.1 și WEB-R3.2: harta în prim-plan, panouri ale modulelor și detaliilor la cerere, comenzi cartografice compacte, filtre, exporturi și accesibilitate.

**Nu se schimbă** fișierele `data/`, `public/data/`, geometriile canonice detaliate și simplificate, setul OSMB 2026-10-05, registrul surselor, codurile SIRUTA/CUATM sau cele 4.283 de identități.

## Criterii obligatorii de certificare

| Criteriu | Probă automată / vizuală | Stadiu |
| --- | --- | --- |
| Harta domină interfața desktop la 1440 px | canvas utilizabil > 1.300 px, panourile inițial închise | CI |
| Doar 3 comenzi permanente pe hartă | zoom +, zoom −, Acasă; atribuirea OSM și scara rămân | CI |
| Panouri de module retractabile | click, click repetat, schimbare modul, X și Escape | CI |
| Detalii numai la selecția entității | selecție, închidere/reopen, stare de geometrie păstrată | CI |
| Setări și acțiuni secundare accesibile | fundal, simplificare, încadrare, resetare, informații și legendă | CI |
| Export valid și identitate de sursă fidelă | GeoJSON detaliat Brețcu cu OSM ID gol și CSV, URL/permalink | CI |
| Filtru ADM/NUTS/NTS păstrat | țări în ordinea RO–MD, combinare și vizibilitate fără dublare | CI |
| Tabletă 900 px | un singur panou overlay, zoom fără suprapuneri | CI + captură |
| Mobil 390 și 360 px | fără scroll orizontal, trei butoane hartă, module jos | CI + captură |
| Tastatură | Escape închide și întoarce focusul, drawer modal captează Tab | CI |
| Zone tactile | minimum 44×44 px pentru zoom, X, Detalii, acțiuni principale | CI + captură |
| Date canonice intacte | PR-ul conține exclusiv `src/`, `scripts/ci/`, `docs/` | GitHub diff |
| Integrare și publicare | SHA exact, protecție main, GitHub Pages SUCCESS, HTTP 200 asset | Post-merge |

## Neconformități identificate și tratate

În urma examinării mecanismului WEB-R3.2, navigarea de tastatură în dialogurile mobile nu limita Tab la interiorul panoului, iar focusul putea rămâne într-un element demontat după închidere. Se adaugă un trap Tab în dialogul mobil și revenirea focusului la iconul modulului, respectiv la butonul Detalii. Controalele compacte sunt aduse la un minim de 44 px pentru utilizare tactilă.

Nu se relaxează niciun test și nu se modifică rezultatele anterioare pentru a simula un succes.

## Probe și închidere

Rezultatele numerice definitive, SHA-ul certificat, rularea Chromium, capturile verificate, verdictul de integrare și starea GitHub Pages se completează după finalizarea verificărilor; acest document rămâne **candidat** până atunci.
