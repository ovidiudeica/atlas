# WEB-R3.5 — Compact map tools and responsive contextual legend

Accepted: 7 November 2026. The global Map Tools menu is independent of all six
modules and keeps exactly three primary sections: **Map appearance**, **Legend**,
**Export & share**. Appearance contains basemap, simplified geometries and Fit
Visible; Home remains a map-camera-only control. About Atlas is a quiet link at
the end, not a fourth primary menu entry. Only one secondary section expands.

The Legend defaults to **styles actually visible on the map**: it derives its
keys from the union of tree-visible and level-filtered entity IDs and the
rendered role priority (statistical active > administrative active > reference
for national roots). The user can choose Show all levels and switch back to
Show only visible. Reference borders remain shown on startup, while unselected
ADM/NUTS/NTS levels are absent from the default legend. All legend colors,
line weights and dash patterns still originate from the same tokens as MapLibre.

Desktop retains a compact anchored floating menu. Under 700px, the menu becomes
an adaptive-height **bottom sheet above the fixed six-module rail**, with a
44px Close button, decorative drag handle and downward-swipe dismissal (from
non-interactive content at scroll top). Escape restores focus to its opener,
and mobile Tab remains trapped in the dialog. Tapping a module closes tools.

No source dataset, canonical geometry, map role, selection, export geometry,
or permalink data is changed. WEB-R3.5 can only be integrated after all exact-
SHA CI checks and desktop/mobile Chromium captures pass.
