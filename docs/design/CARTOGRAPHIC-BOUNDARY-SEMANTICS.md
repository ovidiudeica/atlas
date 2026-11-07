# Cartographic boundaries — Atlas Teritorial

Accepted on 7 November 2026. The two national outlines are checked in the territorial tree and appear in the neutral reference style by default. All ADM/NUTS/NTS filter checkboxes begin unchecked, regardless of tree state. Filtering is additive to individual tree selection, not a second set of tree checkboxes. Visual geometries are deduplicated by source ID.

Active statistical levels (dashed violet strokes) take priority over active administrative levels (solid, level-specific strokes), which in turn take priority over neutral reference styling for the national roots. Moldova's ADM 2 and NTS 1 roles share one geometry; when NTS 1 is activated, its national border is rendered in the NTS 1 statistical color and dash, reverting to neutral when the filter is disabled and the root remains tree-visible. Other entity geometries use their native ADM or statistical role styling by default.

Color/width/dash tokens live in `src/data/cartographicStyle.mjs` and are reused in the MapLibre paint and the legend. Existing canonical data and original GeoJSON exports are not rewritten. Reset Geometries restores tree-visible national roots and clears level filters; Home changes only the map camera.
