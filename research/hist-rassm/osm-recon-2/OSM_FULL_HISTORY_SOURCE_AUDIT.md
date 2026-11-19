# HIST-RASSM.OSM-RECON.2 — Auditul arhivei OSM istorice de pe laptop

**Data verificării:** 19 noiembrie 2026. **Starea acestui rezultat:** audit de sursă locală; nu reprezintă reconstruirea frontierelor RASSM din OSM înainte de 1940.

## 1. Arhiva completă găsită

`history-261019.osm.pbf` există în spațiul local Codex de pe laptop; **163,893,678,040 bytes (152,64 GiB)**. Registrul de achiziție existent pe laptop declară:

- `status=FULL_BASE_BYTES_VERIFIED_NOT_SOURCE_QUALIFIED`
- `expected_bytes=verified_downloaded_bytes=163893678040`
- `source_qualified=false`
- SHA-256 documentat în registrul anterior: `149ce6e8d1d4aad41e94fddb8f9721f80697d42d51e5f612879c98d1c236e5a9`
- MD5 documentat în registrul anterior: `0587abc2f5a3a29a81ce3b067357933b`

**Precizare:** în acest audit nu am recitit și rehashat integral fișierul de 152,64 GiB; statutul de verificare a octeților este citat din registrul de achiziție, nu recompus independent. Integritatea probatorie finală a sursei este încă necalificată.

## 2. Extrasul selectiv inspectat binar

`selected-base.osh.pbf`: **15.100.527 bytes**, SHA-256 `dad0f923029c96046e3fbe90f793906fe07da0076380b1890bb2db413e4cfd34`, identic pe laptop și după copiere și recitire din Drive.

Antet OSM PBF recunoscut: `OsmSchema-V0.6`, `DenseNodes`, `HistoricalInformation`, `Sort.Type_then_ID`, producător `osmium/1.19.1`.

Am citit toate cele **368 blocuri OSMData**, rezultând **57.959 înregistrări way** și **2.878.820 înregistrări dense node**. În acest extras sunt **zero înregistrări relation**. Pentru 10 ID-uri de relații administrative verificate anterior prin API-ul OSM, extrasul nu furnizează deci nicio versiune de relație, niciun lanț membru–cale certificat.

Registrul care însoțește extrasul declară `CAPTURED_NOT_COMPLETENESS_VALIDATED`, `missing_ids_verified=false`, `epoch_replayed=false`, `source_qualified=false`. Acest fișier nu poate fi folosit drept dovadă că toată zona RASSM sau toate versiunile administrative au fost recuperate.

## 3. Efect asupra reconstrucției

- **Geometria RECON.2 rămâne neschimbată:** 59 de sectoare OSMB actuale, 33,27% din parcursul ICR substituit morfologic.
- **Nu promovăm niciun sector ca geografie istorică A/B** pe baza timestampurilor OSM, a metadatelor arhivei sau a extrasului incomplet.
- Etapa următoare de istoric OSM trebuie să extragă explicit **relațiile de frontieră relevante plus istoricul tuturor căilor și nodurilor membre**, să valideze completitudinea ID-urilor și să compare versiunile georeferențiate. Nu este necesară redescărcarea arhivei de 152,64 GiB.

**Trasabilitate:** `SOURCE_HISTORY_AUDIT.json` păstrează mărimile, hashurile, validările și statutul calificării; scriptul `selected_pbf_probe.py` reproduce inspecția din extrasul local, dacă fișierul original este furnizat pentru reexecuție. Nu publicăm în repository copia brută a extrasului OSM care ar putea conține metadate ale contribuitorilor.
