# WEB-R4.8: entity-card flag display (desktop and mobile)

The original card used RO/MD Unicode flag emoji. Some Windows desktops render emoji as the letters **RO** and **MD**. Bundled self-contained SVG assets remove that dependency.

| Immutable entity or scope | Canonical country | Decorative flag | Notes |
| --- | --- | --- | --- |
| `osm-r65335` | MD | `public/flags/pridnestrovie.svg` | Flag used by separately administered **de facto** Pridnestrovie; not a claim of independent statehood |
| Other RO entities | RO | `public/flags/romania.svg` | Romanian national flag |
| Other MD entities | MD | `public/flags/moldova.svg` | Moldovan national flag |

ATULBD `osm-r2607033` and the NTS statistical region `stat-MD120` remain separate from the de facto territory and retain Moldova's flag. No OSM tags, borders, state affiliations, identities, roles, statistical codes or administrative parentage are altered.

## Files and sources

- Romania: [Wikimedia Commons Flag of Romania.svg](https://commons.wikimedia.org/wiki/File:Flag_of_Romania.svg), original SVG, public-domain flag.
- Republic of Moldova: [Wikimedia Commons Flag of Moldova.svg](https://commons.wikimedia.org/wiki/File:Flag_of_Moldova.svg), original SVG, public-domain state emblem.
- Pridnestrovie: [Wikimedia Commons Flag of Transnistria (state).svg](https://commons.wikimedia.org/wiki/File:Flag_of_Transnistria_(state).svg), full *obverse* SVG, with star and hammer-and-sickle, not the simplified reverse.

Assets are stored within `public/flags/` and use Vite's `import.meta.env.BASE_URL`, to support the GitHub Pages `/atlas/` subpath without third-party requests. The icon remains decorative; exact entity name and context note are available in the card.
