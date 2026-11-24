#!/usr/bin/env python3
"""Read-only HIST-OHM-TREE.8 verification. Requires Shapely >= 2.
Usage: python scripts/historical/audit_rohgis_1930_rank.py /path/to/source.gpkg
Run from repository root. Does not modify any catalog or geometry.
"""
import argparse
import collections
import hashlib
import json
import sqlite3
from pathlib import Path
import shapely

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("gpkg", type=Path)
    parser.add_argument("--root", type=Path, default=Path("."))
    args = parser.parse_args()
    audit = json.loads((args.root / "docs/historical/reconciliation/HIST-OHM-TREE.8-RANK-AUDIT.json").read_text(encoding="utf-8"))
    catalog = json.loads((args.root / audit["catalog"]["path"]).read_text(encoding="utf-8"))
    assert hashlib.sha256(args.gpkg.read_bytes()).hexdigest() == audit["source"]["sha256"]
    assert args.gpkg.stat().st_size == audit["source"]["bytes"]
    conn = sqlite3.connect(args.gpkg.resolve().as_uri() + "?mode=ro", uri=True)
    assert conn.execute("select srs_id from gpkg_geometry_columns where table_name='rohgis_plasi_1929_1933'").fetchone() == (3844,)
    source = conn.execute('select id,Nume,"Județ",Rang,geometry from rohgis_plasi_1929_1933 order by id').fetchall()
    conn.close()
    records = {r["sourceRecordId"]: r for r in audit["records"]}
    versions = {int(v["sourceRecordId"]):v for v in catalog["versions"] if v["kind"] == "plasa"}
    assert len(source) == len(records) == len(versions) == 494
    assert set(records) == set(versions) == {r[0] for r in source}
    county_counts = collections.Counter()
    name_counts = collections.Counter()
    ranked_names = collections.Counter()
    areas = collections.Counter()
    for i, name, county, rank, blob in source:
        assert blob[:2] == b"GP"
        offset = 8 + {0:0,1:32,2:48,3:48,4:64}[(blob[3] >> 1) & 7]
        geometry = shapely.from_wkb(blob[offset:])
        digest = hashlib.sha256(geometry.wkb).hexdigest()[:24]
        a, v = records[i], versions[i]
        assert (name, county, rank) == (a["name"], a["county"], a["sourceRank"])
        assert (name, county) == (v["nameRo"], v["sourceParentLabel"])
        assert v["geometryId"] == a["geometryId"] == "rohgis:geom:" + digest
        assert v["entityId"] == a["entityId"] and v["versionId"] == a["versionId"]
        assert rank in {"II", "III"}
        assert a["legalBoundaryCertified"] is False
        assert a["classification"] == ("PLASA_SOURCE_RANK_II" if rank == "II" else "URBAN_UNIT_SOURCE_RANK_III")
        county_counts[(county,rank)] += 1
        name_counts[(county,name)] += 1
        ranked_names[(county,name,rank)] += 1
        areas[rank] += geometry.area / 1e6
    assert len(audit["counties"]) == 71
    assert set(c for c,r in county_counts) == {r["county"] for r in audit["counties"]}
    for c in audit["counties"]:
        assert county_counts[(c["county"],"II")] == c["rankII"] == c["officialPlasi"]
        assert county_counts[(c["county"],"III")] == c["rankIII"]
    assert sum(n for (c,r),n in county_counts.items() if r=="II") == 322
    assert sum(n for (c,r),n in county_counts.items() if r=="III") == 172
    assert sum(n-1 for n in name_counts.values()) == 75
    assert max(ranked_names.values()) == 1
    assert abs(areas["II"] - audit["summary"]["sumAreaKm2RankII"]) < 0.001
    assert abs(areas["III"] - audit["summary"]["sumAreaKm2RankIII"]) < 0.001
    print("PASS: 494 source records, 322 rank II, 172 rank III, 71 county counts, 75 cross-rank names. All names, IDs, ranks and geometry fingerprints match. Legal nominal collation is not certified.")

if __name__ == "__main__":
    main()
