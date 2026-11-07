# WEB-R4.2 — audit UX și accesibilitate înainte de orice remediere

**Data:** 2026-11-07. **Bază publicată, neschimbată:** `main` la `637493464c16af9c7e747b8d16aeb6071f0e1d86` (WEB-R4.1). **Domeniu:** exclusiv interfață, fără ACTUAL.

## Dovezi și limitări

Auditul a pornit din **capturile Chromium ale commitului publicat**, [workflow #42418782675](https://github.com/ovidiudeica/atlas/actions/runs/42418782675), artefactul `browser-smoke-637493464c16af9c7e747b8d16aeb6071f0e1d86` (90 de capturi), și din codul-sursă `src/App.tsx` / `src/styles.css`. Au fost inspectate cel puțin `desktop-web-r41-card-bucharest.png`, `desktop-web-r41-card-bender.png`, `mobile-web-r41-card-bucharest.png`, `mobile-web-r41-card-bucharest-end.png`, `mobile-web-r41-card-bender-end.png`, `mobile-360-detail-open.png`. Prima trecere este read-only. Capturile reproduc browserul CI pentru aplicația efectiv publicată; nu înlocuiesc un audit manual cu cititor de ecran real. Nicio plată.

## Constatări prioritizate

| Prioritate | Dovadă | Defect și risc | Remediere WEB-R4.2 |
| --- | --- | --- | --- |
| P1 | Captura mobilă `...bucharest-end.png`, capturi de început | Butonul `×` folosește `position:sticky; float:right` peste conținut; la scroll se suprapune peste coduri și notele cardului, inclusiv text în dreptul marginii din dreapta | Bară de închidere pe propriul rând, cu fundal opac, `sticky`, rezervare de înălțime și `scroll-padding` pentru focus |
| P1 | Analiză de cod `choose()`, `key={currentNode.id}` | Clicul pe părinte/frați schimbă cardul și poate demonta elementul activ; noul titlu nu primește focus explicit, iar drawerul poate rămâne derulat în jos | Transfer de focus exclusiv după navigarea **din interiorul cardului** către titlul nou și resetarea derulării panoului; nu altera selecția pe hartă |
| P1 | Cardurile București/Chișinău față de arborele existent | Fișa oferă breadcrumbs, frați, părinți, dar **nu** o listă de copii; persoana care folosește numai fișa este obligată să revină în arbore | Listă de copii strict din `createHierarchy(catalog,treeView,lang)`, ordonată în ordinea arborelui, cu încărcare vizuală progresivă de câte 12 |
| P2 | Capturile RO/MD și CSS (`font-size:10px/11px`) | Unele etichete de metadate sunt greu de citit la 360 px | Creșterea textului secundar la 11–12px și a zonelor interactive; borduri de focus vizibile |
| P2 | Capturile București/Transnistria | Codurile statistice sunt enumerate de două ori în aceeași secțiune (`<dl>` + lista de roluri) | Un singur inventar de coduri pe rol cu clasificare/versiune/cod/părinte, păstrând integral datele |
| P2 | HTML al drawerului | Numele accesibil al dialogului mobil este generic „Detalii”, indiferent de entitate | `aria-label` contextual, legat de entitatea selectată, în RO/EN |
| P2 | Fluxul de închidere desktop `closeDetailPanel` | La închiderea prin `×`, focusul poate rămâne pe un buton demontat (Escape avea deja restaurare) | Restaurare a focusului pe acțiunea de redeschidere, inclusiv închiderea prin click |

## Limitări și invariabile

- Nu alterăm `public/data/phase4/`, `data/` sau geometriile ACTUAL. Rămân 4.283 entități și hashul catalogului `1f930079194c92dc0e02d6e675165dddec6f49db0a62357bcc61be0705125482`.
- Relațiile din card sunt **de prezentare** din `hierarchy`; nu modifică părinții canonici, nu pretind identitate juridică sau existența de contururi distincte pentru roluri SIRUTA/NUTS/NTS.
- Navigarea părinte/copil/frate schimbă doar selecția și cardul; **nu** marchează geometria ca vizibilă și **nu** reîncadrează harta automat.
- Nu schimbăm semantica Escape, focus trap, exportul, permalinks ori înregistrările brute retractabile.
- Condiție de admitere: teste de contract + Chromium 1440/900/390/360, interacțiuni și capturi înainte/după, verificări CI pe SHA exact, merge protejat, Pages pe SHA final și acces public.
