# HIST-RASSM.PROOF.1-C

Eight newly recovered gazette pages (1924/1926), official Eftodiev1929 raster and Dubasari topographic scan cataloged1936 underpin new research evidence. A4.347km historical river axis, two paint envelopes and a water-area polygon were traced independently of HURI/ICR. All geometries remainC; no legal boundary is admittedA/B.

22 independent printed-frame controls are split14FIT/8HOLDOUT. Affine holdoutRMSE4.616m is internal nominal-frame consistency, not absolute accuracy. Historical datum, independent physical holdouts and the legal river-boundary rule remain unresolved. Absolute uncertainty is deliberatelyNULL.

Read[RAPORT_PROBATORIU.md](RAPORT_PROBATORIU.md). Full source scans, diagnosticGeoTIFF, GeoPackage and relative-pathQGIS project are in the authorized[private Drive package](https://drive.google.com/drive/folders/1pp4MlXhylRl3gVss3Ttuv5FcS96fw-CJ). No raw map scan or derived imagery is redistributed here; see source-rights caveats inmanifest_surse.json.

The code is in`scripts/research/hist-rassm-proof-1`. Regeneration takes the full external package via`build_proof.py --package /path/to/copy`. The isolated readback check verifies deterministic CSV/GeoJSON and exact GPKG geometries/attributes. It does not infer historical admission from technical success.

This branch starts frommain51a55fac9bb9b02f4dadf666e150deac724569dc. PR119 and its branch are separate and unchanged. ACTUAL and canonical map layers are untouched.
