# WEB-R4.5 — Corectarea denumirii Chișinău ADM 8 în arbore

**Tip:** remediere punctuală a etichetei de prezentare.  
**Bază:** `main` la `e8bde03cd75e69fec4336b4733a5e5509e3e75c1`.  
**Constatare:** arborele eticheta entitatea de nivel **ADM 8** `osm-r1748490` doar `Oraș` (RO) / `City` (EN). Textul reprezenta tipul unității, nu numele propriu.

## Soluție

- În arbore, entitatea `osm-r1748490` se numește **Chișinău** atât în română, cât și în engleză. Eticheta sa de nivel **ADM 8** rămâne distinctă de municipiul părinte Chișinău **ADM 4**.
- În fișa entității, dialog și breadcrumbs rămâne denumirea contextuală **Orașul Chișinău / Chișinău city**, deja implementată în `cardNameOf`.
- Sub municipiu, orașul continuă să fie **primul dintre cei 19 copii de nivel ADM 8**; cele cinci sectoare rămân sub oraș **exclusiv în arborele de prezentare**. Relațiile administrative sursă sunt nemodificate.
- Nu se schimbă ID-urile `osm-r1691801` (municipiu ADM 4), `osm-r1748490` (oraș ADM 8), codurile CUATM, geometriile, numele oficiale sau catalogul ACTUAL.

## Dovezi și criterii de închidere

1. Unit tests `tests/web-r45-chisinau-adm8-tree-label.test.mjs` și suita de regresie a arborelui; actualizarea strictă a aserțiunilor istorice care impuneau eticheta greșită.
2. Chromium RO mobil și EN desktop — localizarea numelui propriu Chișinău ADM 8, deschiderea celor cinci sectoare și menținerea afișării corecte a fișei.
3. Catalog ACTUAL 4.283 de entități, digest gzip `1f930079194c92dc0e02d6e675165dddec6f49db0a62357bcc61be0705125482` verificat; PR fără modificări în `data/` ori `public/data/`.
4. CI complet pe head SHA exact, integrare în `main` protejat, CI post-merge și confirmarea publicării GitHub Pages pe exact merge SHA.

Această remediere nu extinde modulele, nu schimbă interfața de resetare WEB-R4.4 și nu curăță branchurile.
