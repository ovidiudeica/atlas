#!/usr/bin/env python3
"""HIST-MODULE.2: reproducible source-pilot relation topology qualification.

This does NOT certify administrative or legal boundary relationships.
Use an equal-area projection to compare every source child to its source parent.
No source geometry is changed, repaired, unioned, or promoted.

Usage:
 python scripts/historical/qualify_pilot_geometry.py \
    --catalog public/data/historical/v1/catalog.json \
    --geometry public/data/historical/v1/geometry.geojson \
    --out public/data/historical/v1/qualification.json \
    --csv docs/historical/qa/HIST-MODULE.2-relations-qa.csv

Dependencies: shapely 2+, pyproj. Reproducible from the source subset.
"""
from __future__ import annotations
import argparse
from collections import Counter
import csv
import json
from pathlib import Path
from pyproj import Transformer
from shapely.geometry import shape
from shapely.ops import transform

REVIEW = "requires_boundary_reconciliation"
BLOCKED = "blocked_spatial_contradiction"
COHERENT = "spatially_consistent_source_candidate"
FIELDS = [
    "id", "parentId", "parentName", "childId", "childName",
    "parentType", "childType", "periodStart", "periodEnd",
    "wgs84OutsidePct", "equalAreaOutsidePct", "equalAreaOverlapPct",
    "childValid", "parentValid", "qualification",
    "legalBoundaryCertified", "directParentCertified"
]


def qualify(catalog, feature_collection):
    if catalog.get("schema") != "atlas-historical-pilot-v1":
        raise ValueError("Unexpected pilot schema")
    if feature_collection.get("type") != "FeatureCollection":
        raise ValueError("Expected a GeoJSON FeatureCollection")
    byversion = {v["id"]: v for v in catalog["versions"]}
    bygeom = {f["properties"]["geometryId"]: f["geometry"]
              for f in feature_collection["features"]}
    if len(bygeom) != len(catalog["geometries"]):
        raise ValueError("Geometry identifiers are missing or duplicated")
    converter = Transformer.from_crs("EPSG:4326", "EPSG:3035", always_xy=True).transform
    equal_area = {key: transform(converter, shape(geom))
                  for key, geom in bygeom.items()}
    rows = []
    for rel in catalog["hierarchy"]:
        parent = byversion[rel["parentVersionId"]]
        child = byversion[rel["childVersionId"]]
        parent_geometry = equal_area[parent["geometryId"]]
        child_geometry = equal_area[child["geometryId"]]
        if not parent_geometry.is_valid or not child_geometry.is_valid:
            raise ValueError("Source invalid or projected polygon invalid: " + rel["id"])
        if child_geometry.area <= 0:
            raise ValueError("Child polygon has zero area: " + rel["id"])
        outside = child_geometry.difference(parent_geometry).area / child_geometry.area * 100
        overlap = child_geometry.intersection(parent_geometry).area / child_geometry.area * 100
        verdict = (BLOCKED if outside >= 99.99 else
                   REVIEW if outside > 0.1 else COHERENT)
        rows.append({
            "id": rel["id"],
            "parentId": parent["sourceShapeId"],
            "parentName": parent["name"]["ro"],
            "childId": child["sourceShapeId"],
            "childName": child["name"]["ro"],
            "parentType": parent["sourceOriginalType"],
            "childType": child["sourceOriginalType"],
            "periodStart": rel["period"]["start"]["year"],
            "periodEnd": rel["period"]["end"]["year"],
            "wgs84OutsidePct": rel["outsideParentPercent"],
            "equalAreaOutsidePct": round(outside, 6),
            "equalAreaOverlapPct": round(overlap, 6),
            "childValid": child_geometry.is_valid,
            "parentValid": parent_geometry.is_valid,
            "qualification": verdict,
            "legalBoundaryCertified": False,
            "directParentCertified": False
        })
    decisions = Counter(row["qualification"] for row in rows)
    if len(rows) != 52 or (decisions[COHERENT], decisions[REVIEW], decisions[BLOCKED]) != (44, 6, 2):
        raise ValueError("The pilot QA totals changed; review each source record before release")
    manifest = {
        "schema": "hist-pilot-qualification-v1",
        "sourceArchiveSha256": catalog["sourceArchiveSha256"],
        "evaluation": {
            "projection": "EPSG:3035",
            "method": "Shapely intersection/difference, planar equal-area; geometries source unchanged",
            "temporal": "HistoGIS stated intervals only; no independent legal proof",
            "status": "geometry-topology-checked; institutional parentage unverified",
            "thresholds": {
                "excludeOutsidePercent": 99.99,
                "requiresReconciliationOutsidePercent": 0.1
            }
        },
        "counts": dict(decisions),
        "relations": [{
            "id": row["id"], "decision": row["qualification"],
            "outsidePercentEqualArea": row["equalAreaOutsidePct"],
            "overlapPercentEqualArea": row["equalAreaOverlapPct"],
            "qualifiedAsHistoricalBoundary": False,
            "note": (
                "Source relation; requires independent contemporary evidence."
                if row["qualification"] == COHERENT
                else "Spatial discordance; do not infer legal/administrative parentage."
            )
        } for row in rows]
    }
    return manifest, rows


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--catalog", type=Path, required=True)
    parser.add_argument("--geometry", type=Path, required=True)
    parser.add_argument("--out", type=Path, required=True)
    parser.add_argument("--csv", type=Path, required=True)
    args = parser.parse_args()
    catalog = json.loads(args.catalog.read_text(encoding="utf-8"))
    geojson = json.loads(args.geometry.read_text(encoding="utf-8"))
    manifest, rows = qualify(catalog, geojson)
    args.out.parent.mkdir(parents=True, exist_ok=True)
    with args.out.open("w", encoding="utf-8", newline="\n") as f:
        f.write(json.dumps(manifest, ensure_ascii=False, sort_keys=True,
            separators=(",", ":")) + "\n")
    args.csv.parent.mkdir(parents=True, exist_ok=True)
    with args.csv.open("w", encoding="utf-8-sig", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=FIELDS)
        writer.writeheader()
        writer.writerows(rows)
    print("Source relations:", len(rows))
    print("Equal-area qualification:", manifest["counts"])
    print("No candidate source claim has been promoted to legal certification.")


if __name__ == "__main__":
    main()
