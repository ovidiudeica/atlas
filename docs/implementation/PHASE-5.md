# Phase 5 — Interface, Map Navigation and Export

**Repository:** ovidiudeica/atlas  
**Baseline:** existing Phase 4 public website and Phase 3 certified-for-cartographic-use assets.  
**Invariant:** no rebuild of the 4,283-entity catalog, no changes to original source geometries, and no modifications to Phase 3/4 data files.

## Navigation and interface

- Clickable ancestry breadcrumbs in entity details follow the current tree view (Administrative uses administrative parents; other views use tree parents).
- Previous/next sibling buttons stay within the same parent and do not change map visibility.
- Enter in search selects its first match; Escape clears search; / focuses search, using the territory drawer on mobile.
- Fit-visible camera action loads existing Phase 4 shards for the exact visible selection. The selected-entity framing command, Home, zoom and global simplification remain independent.
- Entity hover outline and metric scale provide map context.
- A copyable permalink restores a valid selected entity, tree view, language, basemap, simplification state, map center and zoom. Invalid URL parameters are ignored. Bulk visibility and expansion remain local preferences.

## Export formats

**Scope:** the selected entity or the exact set of visible entities. Expanding a parent never implicitly exports descendants.

**GeoJSON:** a standard FeatureCollection containing original detailed features loaded from the Phase 4 compressed geometry shards, with their original feature properties preserved. The global simplified display setting does not change exported coordinates. The additional top-level atlasExport metadata identifies the snapshot (2026-10-05), original OSM-Boundaries provenance, geometry mode, count and lack of legal boundary certification.

**CSV:** UTF-8 with BOM; quoted cells; official names, Atlas IDs, country, genuine/blank OSM relation IDs, administrative levels, roles, statistical codes, SIRUTA/CUATM code, both parent links and source snapshot. Formula-like values are neutralized for spreadsheet safety.

Export occurs entirely in the browser on explicit request, with progress feedback. Clipboard access uses HTTPS with a selectable manual fallback. Large exports may require significant memory and download time.

## Source and legal guarantees

- Phase 3 and 4 source catalogs and geometry assets are read-only; no source corrections or reclassification.
- Brețcu retains its null OSM ID; Ojdula retains relation 14735731. Blank OSM identities are not replaced with invented values.
- Accepted OSMB overlaps/parent exceptions and unresolved CUATM source-identity cases remain documented, without treating cartographic correspondence as independent legal certification.
- The new exports do not grant a code/data license or supersede OSM/OSMB reuse and attribution obligations.
- Other five modules remain explicitly planned rather than populated with synthetic content.

## Validation and merge gate

1. Run npm test and npm run build on the exact PR SHA, including Phase 3/4 regression tests and new Phase 5 helper tests.
2. Browser-check desktop 1440×900 and mobile 390×844: search, breadcrumb ancestry, sibling navigation, framing, permalink camera, copying, export of Brețcu and mixed RO/MD visible selections.
3. Verify downloaded CSV blank OSM cells and escaping; GeoJSON full detailed coordinates, feature counts and documented provenance; verify no browser exceptions and no horizontal overflow.
4. Integrate only after green CI and browser checks, then audit GitHub Pages publication and main CI. Do not change the previous reforma-teritoriala repository.

## Limitations

Large visible exports can be memory-intensive. The URL does not serialize thousands of visibility checkboxes. Original OSMB source geometry is not a legally certified boundary determination.
