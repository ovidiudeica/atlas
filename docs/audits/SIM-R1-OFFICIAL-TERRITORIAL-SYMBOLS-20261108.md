# SIM-R1 — exhaustive official-territorial-symbol audit (2026-11-08)

**Status:** evidence-only audit. No change to website, canonical identity, administrative parentage, registry records, legal status, or geometries.

**Certified Atlas catalogue:** 4,283 entities; source snapshot 2026-10-05; gzip SHA-256 `1f930079194c92dc0e02d6e675165dddec6f49db0a62357bcc61be0705125482`; baseline `main` `8a56ef47626e9739467e9e57d89e1fa8f9d7a541`.

**Per-ID evidence file:** [ATLAS-SYMBOL-AUDIT-ALL-4283-2026-11-08.csv](ATLAS-SYMBOL-AUDIT-ALL-4283-2026-11-08.csv) (4,283 data rows, read-only sourced from exact certified catalogue). Each record has country, type, administrative level, official name, exact Atlas ID, OSM ID, registry, Wikidata candidates, presentation flag, recommendation, status, authority URL and caution.

## Coverage

- Romania: **3,241 entities** (3,229 administrative, 12 statistical); Moldova: **1,042** (1,036 administrative, 6 statistical).
- Administrative levels include Romania ADM 4 **42** (41 counties plus Bucharest), ADM 8 **3,180**, ADM 9 **6**; Moldova ADM 4 **37** (32 districts, three municipal, two special), ADM 5 **10**, ADM 7 **5**, ADM 8 **982**. Statistical: **18**, not assumed to carry independent territorial symbols.
- Canonical OSM field `flag` exists for **3** IDs only: `osm-r90689` (RO), `osm-r58974` (MD), `osm-r58984` (Fălești district). An OSM or Wikimedia image URL is **not** independent proof of official adoption.
- `wikidata` source tags occur on **2,130** entities (2,123 distinct Q-IDs). We queried **800** Q-IDs; **200** had an image candidate (`P94` coat, `P41` flag, `P158` seal), linked to **201 Atlas IDs**. The Wikidata API rate-limited the other requests (**HTTP 429**). Unqueried is **not equivalent** to no symbol.

## Strict disposition across all 4,283 records

| Evidence status | Atlas IDs |
| --- | ---: |
| Existing national-flag display (Romania, Moldova) | 2 |
| Existing de facto Pridnestrovie flag display | 1 |
| Direct official authority identified, exact Atlas identity | **15** |
| Urban identity / territorial scope requires separate reconciliation (Orhei) | 1 |
| Incompatible symbol scope without further proof: village versus commune (Lăpușna) | 1 |
| OSM flag only, no independent legal verification (Fălești) | 1 |
| Unverified Wikidata image candidate | 195 |
| Wikidata checked: no heraldic image returned | 603 |
| Wikidata Q-ID query blocked/not performed due to HTTP 429 | 1,301 |
| No exact symbol source in the examined evidence | 2,145 |
| Statistical unit: no independent symbol presumed | 18 |
| **TOTAL** | **4,283** |

### Exact-ID official-symbol evidence (15 opportunities, NOT 15 ready-to-deploy graphics)

| Atlas ID | Unit | Identified official symbol | Official source |
| --- | --- | --- | --- |
| `osm-r1699032` | Găgăuzia (special territorial autonomy) | Coat + flag | https://www.gagauzia.md/ato-gagauziya/simvolika.html |
| `osm-r1748490` | Municipality/city of Chișinău, ADM8 | Coat | https://cnh.prm.md/ |
| `osm-r1813297` | Chișinău, Buiucani | Coat | https://cnh.prm.md/ |
| `osm-r1813306` | Chișinău, Botanica | Coat | https://cnh.prm.md/ |
| `osm-r1813315` | Chișinău, Ciocana | Coat | https://cnh.prm.md/ |
| `osm-r1813316` | Chișinău, Rîșcani | Coat | https://cnh.prm.md/ |
| `osm-r58512` | Chișinău, Centru | Coat | https://cnh.prm.md/ |
| `osm-r19118611` | Gaidar village, Găgăuzia | Coat + flag | https://presedinte.md/app/webroot/Decrete/1507.pdf |
| `osm-r377733` | Bucharest | Coat | https://legislatie.just.ro/public/DetaliiDocument/15899 |
| `osm-r14701115` | Calvini commune, Buzău | Coat | https://legislatie.just.ro/Public/DetaliiDocument/306319 |
| `osm-r14877201` | Mica commune, **Cluj** (not Mureș) | Coat | https://legislatie.just.ro/Public/FormaPrintabila/00000G3PKQ89C2J8N9Y0YVYFCUGJWE4V |
| `osm-r10520137` | Feldioara commune, Brașov | Flag | https://legislatie.just.ro/Public/FormaPrintabila/00000G37TJFESUSNMVW0QFG05B583FF9 |
| `osm-r14879156` | Ciucsângeorgiu commune, Harghita | Flag | https://legislatie.just.ro/Public/DetaliiDocument/310360 |
| `osm-r14871367` | Cămărașu commune, Cluj | Flag | https://legislatie.just.ro/Public/FormaPrintabila/00000G31N73CDI5SC3107NTD4S8BN1Q6 |
| `osm-r10643314` | Lugoj municipality, Timiș | Flag | https://legislatie.just.ro/Public/FormaPrintabila/00000G0NP2N3Z7J4MCG0VQRESDW9S8X6 |

**Not automatically applicable:** `osm-r19082513` Orhei — historic town emblem versus current municipality; `osm-r19110261` commune Lăpușna — armorial source concerns the village; `osm-r58984` Fălești — OSM GIF lacks an independently confirmed authorization.

## Editorial and legal guardrails

1. Territorial coat/flag is different from a **mayor's office / county council corporate logo**. Never substitute one for the other without explicit scope and approval.
2. Romania: coats of arms are governed by [Government Decision 25/2003](https://legislatie.just.ro/Public/DetaliiDocument/41564); local flags by [Law 141/2015](https://legislatie.just.ro/Public/DetaliiDocument/168736) and approval acts. Moldova: [Law on public symbols, Article 5](https://www.legis.md/cautare/downloadpdf/63684), CNH approval and entry into the [General Armorial](https://cnh.prm.md/armorial/). Avoid treating mere CNH meeting agendas as official registrations.
3. **Pridnestrovie** `osm-r65335` is a separate **de facto** flag context. Moldova's `osm-r2607033` ATULBD and `stat-MD120` Transnistria are not the same legal/territorial identity and must not inherit that flag automatically.
4. Statistical NUTS/NTS regions are classifications, not automatically holders of their own coat of arms or flag; an agency logo is corporate, not NUTS. See [Eurostat NUTS](https://ec.europa.eu/eurostat/web/nuts).
5. Image candidates from Wikidata (`P94`, `P41`) need **identity, approved design, validity, licensing, source** verification. `P154` corporate logo does not establish a territorial emblem. Beware of homonymous localities, historic vs current variants, and nested city vs municipality geographies.
6. Before adding SVG/PNG, record exact Atlas ID, owner/scope, image file hash, legal act and annex, approval date, license and a jurisdiction/status note. Keep these records **outside** the certified ACTUAL catalogue.

## Suggested implementation later (not included in this PR)

1. Verify and import the officially sourced Găgăuzia, Chișinău, its 5 sectors, Gaidar and Romanian examples; validate the graphical variant and its reuse rights individually.
2. Reconcile **42** Romanian ADM4 units and **32** Moldovan districts using official laws, the Armorial and original decision annexes. Any Commons lists are discovery tools, not legal proof.
3. Research the remaining 4,162 ADM8, sector and special-subdivision units individually, without inventing flags or inheriting symbols.
4. Show the verified **coat of arms first**, optionally the territorial flag separately; if neither exists, retain a neutral icon or clearly marked **country context flag**, never a fictitious local official emblem.

**Audit limitation:** all 4,283 catalogue records were classified, but the current work does **not** constitute exhaustive legal verification of 4,283 separate emblems. No website, canonical data or official symbols have been changed.
