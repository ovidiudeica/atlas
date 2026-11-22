#!/usr/bin/env python3
"""HIST-MODULE.3: replay each admitted cartographic HIST↔ACTUAL overlap.

This checks source *shapes* at known snapshots. It cannot prove that HistoGIS
outlines were legally operative, that modern OSMB outlines are legal borders,
or that two units are institutionally continuous. Nothing is overwritten.

Requires Shapely 2+, pyproj. Example:
 python scripts/historical/verify_independent_bridge.py \
 --catalog public/data/historical/v1/catalog.json \
 --historical public/data/historical/v1/geometry.geojson \
 --actual public/data/phase4/geometry/ro-adm-09-detailed.geojson.gz \
 --admissions public/data/historical/v1/admissions.json
"""
from __future__ import annotations
import argparse
import gzip
import hashlib
import json
from pathlib import Path
from shapely.geometry import shape
from shapely.ops import transform
from pyproj import Transformer


def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def read_json(path: Path) -> dict:
    raw = path.read_bytes()
    if raw[:2] == b"\x1f\x8b":
        raw = gzip.decompress(raw)
    return json.loads(raw)


def replay(catalog, hist_geo, actual_geo, admissions, *, raw_historical, raw_actual):
    if sha(raw_historical) != admissions["historicalGeometryGeojsonSha256"]:
        raise ValueError("Historical original source geometry checksum changed")
    if sha(raw_actual) != admissions["actualGeometryShardSha256"]:
        raise ValueError("ACTUAL 2026-10-05 original shard checksum changed")

    versions = {v["id"]: v for v in catalog["versions"]}
    geometries = {
        f["properties"]["geometryId"]: f["geometry"]
        for f in hist_geo["features"]
    }
    actual = {
        f["properties"]["atlasId"]: f["geometry"]
        for f in actual_geo["features"]
    }
    converter = Transformer.from_crs("EPSG:4326","EPSG:3035",always_xy=True).transform
    results = []
    for bridge in admissions["bridges"]:
        if bridge["kind"] != "territorial_overlap" or \
           bridge["referenceScope"] != "verified_intersection_between_source_polygons_only":
            raise ValueError("Unsupported bridge admission: " + bridge["id"])
        version = versions[bridge["historicalVersionId"]]
        info = bridge["geometryComparison"]
        if version["geometryId"] != info["historicalGeometryId"]:
            raise ValueError("Historical geometry reference mismatch")
        if bridge["actualId"] != info["actualGeometryId"]:
            raise ValueError("ACTUAL geometry reference mismatch")
        historical = transform(converter,shape(geometries[version["geometryId"]]))
        modern = transform(converter,shape(actual[bridge["actualId"]]))
        if not historical.is_valid or not modern.is_valid or historical.area <= 0 or modern.area <= 0:
            raise ValueError("Invalid geometry for bridge " + bridge["id"])
        intersection = historical.intersection(modern).area
        hpct=100*intersection/historical.area
        apct=100*intersection/modern.area
        if abs(hpct-info["historicalCoveragePercent"])>0.0001 or \
           abs(apct-info["actualCoveragePercent"])>0.0001:
            raise ValueError("Bridge percentage mismatch for "+bridge["id"])
        if intersection <= 0:
            raise ValueError("No geometric overlap "+bridge["id"])
        if (bridge["institutionalContinuityCertified"] or
            bridge["administrativeSuccessionCertified"] or
            bridge["identicalBoundaryCertified"] or bridge["legalBoundaryCertified"]):
            raise ValueError("Unjustified legal assertion "+bridge["id"])
        results.append({
            "id":bridge["id"], "historicalCoveragePercent":round(hpct,5),
            "actualCoveragePercent":round(apct,5),
            "intersectionKm2":round(intersection/1e6,5)})
    return results


def main():
    p=argparse.ArgumentParser()
    p.add_argument("--catalog",type=Path,required=True)
    p.add_argument("--historical",type=Path,required=True)
    p.add_argument("--actual",type=Path,required=True)
    p.add_argument("--admissions",type=Path,required=True)
    args=p.parse_args()
    admissions=read_json(args.admissions)
    results=replay(read_json(args.catalog),read_json(args.historical),
        read_json(args.actual),admissions,
        raw_historical=args.historical.read_bytes(),
        raw_actual=args.actual.read_bytes())
    print(json.dumps({
        "schema":"hist3-bridge-replay-v1",
        "scope":"source_geometry_intersection_only_not_legal_or_institutional",
        "count":len(results),"rows":results
    },ensure_ascii=False,indent=2))


if __name__=="__main__":
    main()
