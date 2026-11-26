# Temporal coverage at the original baseline

PR #167 kept an annual audit from 1000 through 2100 inclusive at baseline dd1b961405af50e3f1a77fc118a048a407979ad9. There are 1101 years, 942 with at least one eligible OHM or RoHGIS geometry and 159 without one. The original publicly eligible source baseline has 139 OHM versions and 565 RoHGIS versions. The later integration of HistoGIS in #169 is separate from this historical audit.

The original JSON and its unchanged two-test historical fixture are recoverable in the Git archive. The pin check takes file bytes into account. Reproduce with a detached checkout of the original commit and core.autocrlf=false, then run Node's test runner on tests/hist-ohm-tree12-temporal-coverage.test.mjs. The audit counts eligible releases and distinguishes the summary describing nonpublic GIS staging.
