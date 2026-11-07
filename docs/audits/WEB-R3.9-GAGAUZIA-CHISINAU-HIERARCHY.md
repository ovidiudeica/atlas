# WEB-R3.9 — indentare bazată pe OSMB (7 noiembrie 2026)

Arhivă sursă: `OSMB-Moldova-2026-10-05.geojson.gz`, SHA-256
`d29b600daa2857bacf8ec7d13369db8fc95353e89f62fe1c762dbc692c216dad`.

**Găgăuzia:** `parents_administrative` din OSMB confirmă apartenența celor
26 entități ADM8 la: Comrat 13, Ceadîr-Lunga 9, Vulcănești 4. Comrat,
raionul reședinței regiunii, este primul. Fiecare raion are copiii ADM8
indentați și ordonați alfabetic după limba interfeței. Analiza geometriilor
arată congruență exactă pentru Ceadîr-Lunga și Vulcănești; pentru Comrat
diferența simetrică este ~0,02791% din suprafața raionului.

**Chișinău:** orașul `osm-r1748490`, ADM8, este primul sub municipiu
`osm-r1691801`, ADM4. Cele cinci sectoare ADM7 sunt indentate sub
oraș și urmate, la nivelul municipiului, de celelalte 18 ADM8.
Reuniunea geometrică a sectoarelor coincide exact cu orașul (diferența
simetrică zero). Totuși, `parents_administrative` OSMB al sectoarelor
indică **municipiul ADM4**, nu orașul ADM8: această indentare este doar
**grupare cartografică**, nu o rectificare a ierarhiei juridice.

Funcția `presentationParentId` este folosită doar pentru arbore,
breadcrumbs, navigarea între frați, extinderea căutării și deep-linkuri
în modurile „Toate”/„Administrative”. Datele canonice, codurile,
`administrativeParentId`, `treeParentId` și poligoanele nu se ating.
