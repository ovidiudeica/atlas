# WEB-R3.6 — Audit exhaustiv al denumirilor scurte din arbore

Data: 7 noiembrie 2026. Corpus certificat: 4.283 de entități, câte două variante lingvistice.

Auditul inițial a identificat 40 de etichete administrative englezești cu sufixul District,
3 cu sufixul Municipality și o relație administrativă suplimentară cu denumirea
Unitățile administrativ-teritoriale din stînga Nistrului, care nu fusese corectată
de regula aplicată anterior nodului statistic MD120.

Regula de prezentare elimină calificativele administrative redundante, păstrând
variantele proprii de nume și excepțiile geografice (ex. Satul Nou).
Atât relația administrativă osm-r2607033, cât și nodul statistic stat-MD120
sunt afișate Stânga Nistrului (RO) și Left Bank (EN).

Rezultat așteptat: 44 etichete englezești și una românească scurtate.
Termenii lungi rămân căutabili din name, shortName, officialName și din aliasuri.
Metadatele originale, structura administrativă, geometriile și sursele OSMB rămân nemodificate.
Testul de corpus verifică toate cele 8.566 variante de afișare și cazurile specifice.
