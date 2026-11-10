# HIST-0.2 — Calificare geometrică OHM (inventar, fără import)

**Verdict:** `GEOMETRIC_SCREENING_COMPLETED_WITH_DRAFT_SCOPE_LIMITATIONS`.

Au fost prelucrate 905 relații OHM, prin descărcarea `out geom` a membrilor lor originali (106 loturi; zero erori de transfer). Rezultate: **643** intersecții geometrice cu masca de studiu provizorie (498 traversări ale limitei, 145 contururi cu segmente în mască), **218** false pozitive ale filtrării BBOX față de aceeași mască, **44** geometrii incomplete/ambigue.

Cele 643 **nu reprezintă numărul definitiv al entităților istorice** din aria naturală, iar cele 218 **nu pot fi excluse definitiv** fără convenție montană și coastă certificate. Există variante multiple ale aceleiași entități în timp; gruparea de nume (364) nu este deduplicare semantică.

## Repere confirmate ca geometrii OHM candidate

| Denumire OHM afișată | Variante recuperate | Relații OHM |
|---|---:|---|
| Țara Românească | 4 | 2694164, 2929115, 2929116, 2929117 |
| Țara Moldovei | 2 | 2694163, 2746689 |
| Transilvania | 4 | 2690518, 2747433, 2829384, 2878295 |
| Bucovina | 4 | 2684081, 2746379, 2746380, 2746401 |
| Gubernia Basarabia | 2 | 2694153, 2694154 |
| Banatul Timișoarei | 2 | 2746573, 2747562 |
| Comitatul Maramureș | 3 | 2829353, 2829357, 2829358 |
| Comitatul Cluj | 1 | 2928936 |
| Țara Chioarului | 2 | 2747434, 2747435 |
| Scythia Minor | 1 | 2849328 |
| Moesia Inferior | 1 | 2849331 |
| Regatul Bulgariei | 7 | 2695478, 2742283, 2746680, 2848877, 2848878, 2855603, 2920397 |
| Principatul Bulgariei | 1 | 2854742 |
| Voivodina Sârbească și Banatul Timișan | 1 | 2694215 |
| Regiunea Odesa | 3 | 2960416, 2960417, 2960606 |
| Regiunea Mykolaiv | 5 | 2694783, 2694784, 2960355, 2960356, 2960357 |
| RSS Moldovenească | 1 | 2694777 |
| Regiunea Ismail | 1 | 2960607 |
| Akkerman Oblast | 1 | 2960608 |
| voievodatul Podolia | 1 | 2696429 |
| Bracław Voivodeship | 1 | 2696427 |
| Regiunea Transcarpatia | 1 | 2859183 |

## Probe și restricții

Relațiile cu `closed_outer_rings` și zero `unclosed_outer_rings` au trecut doar reconstruirea segmentelor; nu s-a efectuat un audit exhaustiv de validitate GIS / autopolie. Pentru 44 de relații, inclusiv subrelații istorice, închiderea contururilor nu este completă. Acest audit **nu** construiește o geometrie nouă a OHM; verifică numai datele originale și produce metadate. Nu a fost importată nicio geometrie în Atlas. Nu a fost definit arborele sau aspectul modulului ISTORIC.

## Conținut

- `geometry-qualified-905-per-id.csv`: clasificare individuală, perioadă, proveniență, avertismente și hash al membrilor.
- `overlap-with-DRAFT-643.csv`: geometrii intersectând masca DRAFT.
- `bbox-false-positive-218.csv`: contururi care nu ating masca DRAFT.
- `geometry-review-required-44.csv`: cazuri neconcludente.
- `names-variants-NOT-deduplicated.csv`: gruparea nominală a versiunilor.
- `manifest.json`: totaluri și checksum SHA256 pentru cele 106 arhive de răspunsuri OHM, păstrate separat pe computer.

**Pasul următor:** examinare editorială a variantelor și a cazurilor de la limita naturală; selecția entităților de importat se decide ulterior de utilizator. Fără creare, tăiere, corectare sau ajustare de geometrii.