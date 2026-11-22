#!/usr/bin/env python3
"""HIST-MODULE.1 reproducible HistoGIS v9.0 pilot, no ACTUAL mutations.
Usage: python scripts/historical/build_pilot_catalog.py --zip /path/histogis-data-v9.0.zip --out public/data/historical/v1
Requires Python 3.10+, shapely 2+. Historical source licensed CC BY 4.0.
Geometry hash is source-exact canonical JSON, NOT cross-source GIS equivalence.
"""
from __future__ import annotations
import argparse
from collections import Counter
from datetime import date, timedelta
import hashlib
import json
from pathlib import Path
import re
import zipfile
from shapely.geometry import shape

EXPECTED_ARCHIVE_SHA256 = "1e108156d8d21f5e47dc91849050f1e12e5d642f13095407f70270883004a5cd"
ROOT_IDS = (9915, 9936, 9970)
DOI = "https://doi.org/10.5281/zenodo.4432081"
LICENSE = "https://github.com/acdh-oeaw/histogis-data/blob/v9.0/LICENSE"


def compact(o):
    return json.dumps(o, ensure_ascii=False, sort_keys=True, separators=(",", ":"))


def dateobj(s):
    y, m, d = (int(p) for p in s.split("-"))
    if not 1 <= y <= 9999:
        raise ValueError("Pilot requires Gregorian CE source dates")
    date(y, m, d)
    return {"year": y, "month": m, "day": d}


def period(q):
    return {"kind": "interval", "start": dateobj(q["start_date"]),
            "end": dateobj(q["end_date"])}


def interval_intersection(a, b):
    start = max(a["start_date"], b["start_date"])
    end = min(a["end_date"], b["end_date"])
    return (start, end) if start <= end else None


def subtract_window(window, previous):
    """Subtract already claimed immediate-parent intervals at day precision."""
    output = [window]
    for p_start, p_end in previous:
        segments = []
        for start, end in output:
            if p_end < start or end < p_start:
                segments.append((start, end))
                continue
            if start < p_start:
                left = (date.fromisoformat(p_start) - timedelta(days=1)).isoformat()
                if start <= left:
                    segments.append((start, left))
            if end > p_end:
                right = (date.fromisoformat(p_end) + timedelta(days=1)).isoformat()
                if right <= end:
                    segments.append((right, end))
        output = segments
    return output


def read_source(zip_path):
    index = {}
    with zipfile.ZipFile(zip_path) as archive:
        for filename in archive.namelist():
            if not filename.endswith(".geojson"):
                continue
            record = json.loads(archive.read(filename))
            props = record.get("properties") or {}
            record_id = props.get("id")
            if not isinstance(record_id, int) or record_id in index:
                raise ValueError("Invalid or duplicate source shape ID: " + str(record_id))
            index[record_id] = (filename, record)
    return index


def build(index, zip_hash):
    selected = set(ROOT_IDS)
    for id, (_, document) in index.items():
        ancestors = document["properties"].get("parents") or []
        if any(p.get("id") in ROOT_IDS for p in ancestors):
            selected.add(id)
    if len(selected) != 54:
        raise ValueError("Source selection changed; expected 54 HistoGIS records, got " + str(len(selected)))
    docs = {id: index[id][1] for id in selected}
    sources, entities, versions, assets_by_hash, geometry_uses, features = {}, {}, [], {}, [], []
    source_types = Counter()
    for id in sorted(selected):
        filename, document = index[id]
        q = document["properties"]
        geometry = document.get("geometry")
        if not geometry or geometry["type"] not in ("Polygon", "MultiPolygon"):
            raise ValueError("Historical pilot requires polygon: " + str(id))
        geom = shape(geometry)
        if not geom.is_valid or geom.is_empty:
            raise ValueError("Invalid source geometry: " + str(id))
        digest = hashlib.sha256(compact(geometry).encode("utf-8")).hexdigest()
        geometry_id = "histogis-v9:geometry:" + digest[:24]
        previous = assets_by_hash.get(digest)
        if previous and previous["geometryId"] != geometry_id:
            raise ValueError("Geometry fingerprint collision")
        if not previous:
            previous = {
                "geometryId": geometry_id, "canonicalHash": digest,
                "hashMethod": "sha256:canonical-json-object:source-crs",
                "crs": "EPSG:4326", "sourceShapeIds": [],
                "evidenceStatus": "candidate",
                "boundaryCertification": "not_certified",
                "geometryAvailable": True
            }
            assets_by_hash[digest] = previous
            features.append({"type": "Feature", "id": geometry_id,
                "properties": {"geometryId": geometry_id, "canonicalHash": digest,
                    "boundaryCertification": "not_certified"}, "geometry": geometry})
        previous["sourceShapeIds"].append(id)

        # Same named Bucovina with same Wikidata ID and exact geometry:
        # candidate institutional identity, not certified legal continuity.
        entity_id = ("histogis-v9:entity:bukowina"
            if id in (9936, 9970) else "histogis-v9:entity:shape-" + str(id))
        label = q.get("name", "").strip()
        if not label:
            raise ValueError("Missing original title for " + str(id))
        if entity_id not in entities:
            entities[entity_id] = {
                "id": entity_id,
                "sourceName": label,
                "sourceLanguage": "de" if id in (9915, 9936, 9970) else "und",
                "names": {"ro": label, "en": label},
                "untranslatedSourceLabel": True,
                "wikidataId": q.get("wikidata_id"),
                "identityReviewStatus": "candidate", "sourceShapeIds": [],
                "startDate": None, "endDate": None
            }
        entity = entities[entity_id]
        entity["sourceShapeIds"].append(id)
        if entity["startDate"] is None or q["start_date"] < entity["startDate"]:
            entity["startDate"] = q["start_date"]
        if entity["endDate"] is None or q["end_date"] > entity["endDate"]:
            entity["endDate"] = q["end_date"]

        source_url = q.get("source", "")
        source_key = re.search(r"/source/(\d+)/", source_url)
        if not source_key:
            raise ValueError("Missing HistoGIS source identifier for " + str(id))
        source_id = "histogis:source:" + source_key.group(1)
        sources[source_id] = {"id": source_id,
            "name": q.get("source_name"), "url": source_url, "rights": "CC-BY-4.0"}
        version_id = "histogis-v9:version:" + str(id)
        versions.append({"id": version_id, "entityId": entity_id, "sourceShapeId": id,
            "sourceFile": filename, "wikidataId": q.get("wikidata_id"),
            "name": {"ro": label, "en": label}, "sourceOriginalType": q.get("adm_name"),
            "period": period(q), "sourceIds": [source_id],
            "geometryId": geometry_id, "evidenceStatus": "candidate",
            "boundaryCertification": "not_certified"})
        source_types[q.get("adm_name", "")] += 1
        geometry_uses.append({"useId": "histogis-v9:use:" + str(id), "geometryId": geometry_id,
            "entityId": entity_id, "versionId": version_id,
            "entityName": {"ro": label, "en": label},
            "period": period(q), "sourceIds": [source_id], "evidenceStatus": "candidate"})

    hierarchy = []
    for id in sorted(selected):
        if id in ROOT_IDS:
            continue
        q = docs[id]["properties"]
        # Source parents can contain distant ancestors and temporally different
        # parents. Choose nearest time-overlapping source parent for each window.
        ancestry = q.get("parents") or []
        seen_windows = []
        for ancestor in ancestry:
            parent_id = ancestor.get("id")
            if parent_id not in selected:
                continue
            window = interval_intersection(q, docs[parent_id]["properties"])
            if not window:
                continue
            for start, end in subtract_window(window, seen_windows):
                relation = {
                    "id": "histogis-v9:hierarchy:" + str(id) + ":" + str(parent_id) + ":" + start,
                    "parentVersionId": "histogis-v9:version:" + str(parent_id),
                    "childVersionId": "histogis-v9:version:" + str(id),
                    "kind": "administrative",
                    "perspectiveId": "histogis-v9:source-administration",
                    "period": {"kind": "interval", "start": dateobj(start), "end": dateobj(end)},
                    "sourceIds": ["histogis:source:" + re.search(
                        r"/source/(\d+)/", q["source"]).group(1)],
                    "evidenceStatus": "candidate",
                    "qualifiedHistoricalParentage": False
                }
                parent_geom = shape(docs[parent_id]["geometry"])
                child_geom = shape(docs[id]["geometry"])
                outside = 100 * child_geom.difference(parent_geom).area / max(child_geom.area, 1e-15)
                relation["outsideParentPercent"] = round(outside, 6)
                relation["topologicalReviewRequired"] = outside > 0.1
                hierarchy.append(relation)
                seen_windows.append((start, end))
    assets = sorted(assets_by_hash.values(), key=lambda item: item["geometryId"])
    features.sort(key=lambda item: item["properties"]["geometryId"])
    if len(assets) != 53 or len(geometry_uses) != 54 or not hierarchy:
        raise ValueError("Unexpected source duplicate/reuse/hierarchy count")
    catalog = {
        "schema": "atlas-historical-pilot-v1",
        "release": "HIST-MODULE.1",
        "sourceRelease": "HistoGIS v9.0",
        "sourceArchiveSha256": zip_hash,
        "citation": {"creator": "ACDH-CH, Austrian Academy of Sciences",
            "title": "HistoGIS Data v9.0 (2021)",
            "doi": DOI, "license": "CC-BY-4.0", "licenseUrl": LICENSE,
            "adaptation": "Subset extraction; repeated exact geometries deduplicated; identifiers, indexes, temporal relations and QA derived; raw originals unchanged."},
        "coverage": {"regions": ["Transilvania", "Bucovina"],
            "complete": False, "historicalBoundariesCertified": False,
            "actualInteroperabilityCoverage": "not_evaluated",
            "hierarchyQualified": False,
            "notes": "Source-derived pilot, not an authoritative administrative timeline; independent verification required."},
        "geometryFile": "geometry.geojson",
        "sources": sorted(sources.values(), key=lambda x: x["id"]),
        "entities": sorted(entities.values(), key=lambda x: x["id"]),
        "versions": sorted(versions, key=lambda x: x["id"]),
        "geometries": assets,
        "geometryUses": sorted(geometry_uses, key=lambda x: x["useId"]),
        "hierarchy": sorted(hierarchy, key=lambda x: x["id"]),
        "bridge": [], "events": [], "symbols": [], "geometryDecisions": [],
        "qa": {
            "topologicallyValidSourcePolygons": len(selected),
            "sourcePolygons": len(selected),
            "distinctGeometryAssets": len(assets),
            "geometryReuseCount": len(selected) - len(assets),
            "hierarchyLinks": len(hierarchy),
            "hierarchyLinksOutsideParentOver0_1pct":
                sum(item["topologicalReviewRequired"] for item in hierarchy),
            "maxOutsideParentPercent": round(max(
                (item["outsideParentPercent"] for item in hierarchy), default=0), 6),
            "sourceTypeCounts": dict(sorted(source_types.items())),
            "status": "candidate_unverified_legal_and_temporal"
        }
    }
    return catalog, {"type": "FeatureCollection", "features": features}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--zip", required=True)
    parser.add_argument("--out", required=True)
    args = parser.parse_args()
    path = Path(args.zip)
    digest = hashlib.sha256(path.read_bytes()).hexdigest()
    if digest != EXPECTED_ARCHIVE_SHA256:
        raise SystemExit("Unexpected source ZIP hash; requires individual source review: " + digest)
    index = read_source(path)
    catalog, geometry = build(index, digest)
    dest = Path(args.out)
    dest.mkdir(parents=True, exist_ok=True)
    for name, obj in [("catalog.json", catalog), ("geometry.geojson", geometry)]:
        path = dest / name
        with path.open("w", encoding="utf-8", newline="\n") as stream:
            stream.write(json.dumps(obj, ensure_ascii=False, sort_keys=True,
                separators=(",", ":")) + "\n")
        print(name, path.stat().st_size, hashlib.sha256(path.read_bytes()).hexdigest())
    print("PILOT", len(catalog["entities"]), "entities", len(catalog["versions"]),
        "versions", len(catalog["geometries"]), "unique geometries",
        len(catalog["hierarchy"]), "candidate hierarchy links",
        "topological warnings", catalog["qa"]["hierarchyLinksOutsideParentOver0_1pct"])


if __name__ == "__main__":
    main()
