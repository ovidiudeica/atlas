# Official boundary acquisition audit — Romania and Moldova

**Date:** 2026-11-06  
**Base:** protected `main` at `de6416f911ee3a603e79261afb353759f25667d0`  
**Outcome:** **BLOCKED: authoritative 2026 vector coordinates NOT obtained for the requested cases.**  
**Permitted work:** public read-only retrieval and verification; **no payments, orders, requests submitted, invented vectors, modifications to production data or website**.

## 1. Required objects

**Moldova — five official UAT boundary datasets:** Țînțăreni (CUATM `1050`, source relations `12496850` / `19090932`), Văratic (`7160`, `19045240` / `19045254`), satul Dondușeni (`3417`, `19055800` / `19055814`; distinguish orașul Dondușeni, CUATM `3401`), Recea din raionul Strășeni (`8034`, `19100165` / `19100169` / `19100182`; do not confuse with Recea din Rîșcani) and Fîrlădeni din Căușeni (`2714`, `12463200`). Obtain relevant neighbor district boundaries for the ~0.565217 km² detached Fîrlădeni component, and identify legally validated detached-area ownership. Compare effective boundaries for the October 2026 snapshot with any newer edition.

**Harghita — three 2026 UAT datasets:** Vlăhița, SIRUTA `83749`, Căpâlnița, `83963`, and Lueta, `84629`, ideally from ANCPI's exact **05 May 2026** release. The 2025 ANCPI-derived layer used in the previous audit is *not* a substitute.

## 2. What was actually retrieved and verified

- The official Moldovan INDS semestrul II 2025 monitoring PDF was downloaded and verified by SHA-256 `6d86b33219e58098b1c2547513500d471b387639b2a44dc385b0712831fcad8f` (286,716 bytes). On page 1, rows 13 and 14 under `Unități teritorial-administrative`, the **WMS view service is marked available** and **WFS and file-based download unavailable** for level 1/2 administrative polygons. Agency: IP Cadastrul Bunurilor Imobile. Source: https://inds.gov.md/wp-content/uploads/sites/6/2026/02/Monitorizare_INDS2025_2S.signed.pdf.
- Public official GeoServer at `map.cadastru.md` is listed online, but fresh direct `GetCapabilities` and index requests returned **HTTP 403**; a separate fetch route reported bot blocking. **No authorized vector feature extraction was completed**. Source endpoint: https://map.cadastru.md/geoserver/ows?service=WFS&version=2.0.0&request=GetCapabilities.
- IP CBI has a specific service to issue **digital graphical and textual information for registered UAT boundaries**, with posted 80 MDL fee and three-working-day processing for private applicants. The service could require an application and may not provide unrestricted public files. **No order or payment placed**. Source: https://www.ipcbi.gov.md/ro/eliberarea-informatiei-grafice-cu-privire-la-hotarele-unitatilor-administrativ-teritoriale.
- The official Agenția Proprietății Publice order `107/10.04.2023` concerning Fîrlădeni was retrieved and verified (529,776 bytes, SHA-256 `47c40d6036f2cc6bc73263a7c05e69212ce8536f4680030f6e03526e0a4a97e5`). It appoints a commission for *public-property parcel delimitation*, **not an adopted UAT boundary shapefile or adjudication of the detached OSMB territory**. Source: https://app.gov.md/wp-content/uploads/2024/11/O-R-D-I-N-Causeni-nr.-107-com.-Firladeni.semnat.pdf.
- The ANCPI official downloading application is indexed with title `Descarcare limite administrative — Actualizate la data 05.05.2026`, but opening it did not yield downloadable bytes: the host `geoportal.ancpi.ro` failed DNS resolution from the connected computer and external browser access returned a gateway error. The official ANCPI site also states that Geoportal's restart after 2026 August service disruptions would be staged. Sources: https://geoportal.ancpi.ro/portal/apps/webappviewer/index.html?id=faeba2d173374445b1f13512bd477bb2 ; https://www.ancpi.ro/.
- The accessible geo-spatial.org WFS subset belongs to **2025** (`2025-03-26`, 3 features, 63,059 bytes, SHA-256 `ed5e98e33bf0c1a4ef7acdaaace8e4b24732d466ed6513e167f47688c87e094`). It previously confirmed six Vlăhița components and no positive-area Căpâlnița/Lueta overlap in that **older** version; it cannot verify the ANCPI May 2026 release. Source: https://www.geo-spatial.org/descarcare/date/administrative-boundaries/.

## 3. Individual acquisition verdict

| Jurisdiction | Official identifier | Geometry received from authoritative current vector source? | Result |
| --- | --- | --- | --- |
| Moldova · Țînțăreni (Anenii Noi) | CUATM 1050 | **No** | Remote 17.721 km² source component still legally unverified |
| Moldova · Văratic (Rîșcani) | CUATM 7160 | **No** | Detached boundaries still unverified |
| Moldova · Dondușeni (village) | CUATM 3417 | **No** | Separate legally coded town 3401; do not conflate |
| Moldova · Recea (Strășeni) | CUATM 8034 | **No** | Three OSMB polygons not officially reconciled |
| Moldova · Fîrlădeni (Căușeni) | CUATM 2714 | **No** | Isolated source component inside Anenii Noi unresolved |
| România · Vlăhița | SIRUTA 83749 | **No, 2026** | ANCPI-derived March 2025 control only |
| România · Căpâlnița | SIRUTA 83963 | **No, 2026** | ANCPI-derived March 2025 control only |
| România · Lueta | SIRUTA 84629 | **No, 2026** | ANCPI-derived March 2025 control only |

## 4. Zero-payment acquisition route when permitted

Prepare **informational enquiries only**, not paid cadastral orders:

**For IP CBI** (`info@ipcbi.gov.md`): ask whether existing official boundary vectors for CUATM 1050, 7160, 3417, 8034, 2714 (plus adjacent administrative records where necessary) can be obtained through a publicly licensed dataset, permitted WFS endpoint, or non-fee research sharing route. Request format GeoPackage/GeoJSON/SHP; effective date, source register, coordinate reference system and official treatment of disconnected/exclave areas. Ask for conditions **before** any paid processing. No message has been sent.

**For ANCPI** (`inspire@ancpi.ro`): request a non-paid download endpoint or archive containing the **05 May 2026** geometry for UAT SIRUTA 83749, 83963 and 84629, including licence, CRS, version and documentation for multipart Vlăhița components. Ask whether the Geoportal is accessible after its announced staged recovery. No message has been sent.

## 5. Exact acceptance gate

Only change the state to `OFFICIAL_VECTOR_ACQUIRED` once the original authoritative polygon file exists with verifiable provenance, original bytes, hash, retrieval timestamp, licence, declared effective date, CRS and exact unit identity. Only mark `2026_BOUNDARIES_COMPARED` after an independent polygon overlay computes intersections, symmetric differences, multipart counts and source-to-official discrepancies and individual results are reviewed. Do not infer legal title from cartographic appearance, map tiles, PDF correspondence, public-property delimitation orders, or a CUATM table.

The original Phase 3 candidate and published Phase 4/5 catalogue and geometries remain immutable. **No production change, source “fix”, altered OSM ID, administrative reparenting, merge of OSM relations, or new fake shapefile is authorized or performed.**

## 6. Audit artifact

Per-territory decision status, source endpoints, SHA-256 of the two downloaded official PDFs and expected evidence for acceptance are recorded in `OFFICIAL-BOUNDARY-ACQUISITION-2026-11-06.json`. This is a **blocked acquisition register**, not a successful 2026 source certificate or legal boundary judgement.
