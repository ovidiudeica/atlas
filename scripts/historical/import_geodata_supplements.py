#!/usr/bin/env python3
"""Append source-only HURI RASSM / undated Transilvania layers to the OHM Historical index.

Run AFTER import_geodata_gis_sources.py. Input originals stay read-only.
This is a source inventory and historical display pipeline, NOT certification.
"""
import argparse
import hashlib
import json
from pathlib import Path
from shapely.geometry import shape

ROOT = "public/data/historical/v1/geodata"
SPECS = [
    ("RASSM/RASSM (HURI)/01_HURI_date_vectoriale/HURI_RASSM_raioane_91_entitati_8_snapshoturi.geojson",
     "huri-rassm-raioane.geojson", "1RYz3eOdyyZHhyxKWso2IsM0LxsWAENCj",
     "60569c218122617c8d65daa6b3720a4fd5d0db1d91c508b11ceb8bd8bf9fa45b",
     "HURI", "RASSM / HURI / raioane", "raion", 91),
    ("RASSM/RASSM (HURI)/01_HURI_date_vectoriale/HURI_RASSM_contururi_8_snapshoturi_1927_1937.geojson",
     "huri-rassm-contururi.geojson", "1UuqrgZTymT4Rxa2exeN4W6XzoZBrXBbE",
     "b29dce1c55d6bb3ba027c9e93b73b9406f36a25be8f29d8dd3f244aa89422138",
     "HURI", "RASSM / HURI / contururi", "republic", 8),
    ("Transilvania 1860 (districte)/districte_transilvania_1860/districte_transilvania_1860.geojson",
     "transilvania-1860-districte.geojson", "1NUP3hl-bgGTr_Ln4o8GSUHGIGYFSuCLD",
     "2e72107cc06d035ce1337daca79520d37b42d4b30dfad464cd6aa4735c766091",
     "TRANSILVANIA_COLLECTION", "Transilvania / colectie nedatata sigur", "source_classification", 52),
]

def stable(geometry):
    return json.dumps(geometry, sort_keys=True, separators=(",", ":"), ensure_ascii=False)

def run(root, repo):
    destination = repo / ROOT
    index_path = destination / "index.json"
    index = json.loads(index_path.read_text(encoding="utf-8"))
    if index.get("schema") != "atlas-geodata-historical-source-index-v1":
        raise ValueError("Expected existing OHM source index")
    # Replaying this importer is idempotent, retaining OHM geometry identity.
    index["entries"] = [r for r in index["entries"] if r["sourceFamily"] == "OHM"]
    index["shards"] = [s for s in index["shards"] if s["file"].startswith("ohm-")]
    index["geometryDuplicates"] = [a for a in index["geometryDuplicates"] if a[0].startswith("ohm-") and a[1].startswith("ohm-")]
    if (len(index["entries"]), len(index["geometryDuplicates"])) != (139, 14):
        raise ValueError("OHM source baseline mismatch")
    geometry_keys = {}
    supplements = 0
    for relative, filename, drive_id, sha, family, group, kind, expected in SPECS:
        original = root / relative
        raw = original.read_bytes()
        if hashlib.sha256(raw).hexdigest() != sha:
            raise ValueError("Source SHA-256 mismatch: " + relative)
        content = raw.decode("utf-8-sig")
        data = json.loads(content)
        features = data["features"]
        if data.get("type") != "FeatureCollection" or len(features) != expected:
            raise ValueError("Original source count changed: " + relative)
        index["shards"].append({"file": filename, "count": len(features)})
        for j, feature in enumerate(features):
            if feature.get("type") != "Feature" or feature["geometry"]["type"] not in ("Polygon", "MultiPolygon"):
                raise ValueError("Nonpolygon source " + filename)
            if not shape(feature["geometry"]).is_valid:
                raise ValueError("Invalid source geometry " + filename + ":" + str(j))
            p = feature.get("properties", {})
            snapshot = p.get("huri_snapshot")
            if family == "HURI" and not (isinstance(snapshot, str) and len(snapshot) == 10):
                raise ValueError("HURI snapshot missing")
            key = (("raion" if kind == "raion" else "contur") + "-" + snapshot + "-" + str(j + 1)
                   if family == "HURI" else "district-" + str(j + 1))
            identity = ("huri-rassm-" if family == "HURI" else "transilvania-collection-") + key
            coord_key = stable(feature["geometry"])
            canonical = geometry_keys.setdefault(coord_key, identity)
            if canonical != identity:
                index["geometryDuplicates"].append([canonical, identity])
            if family == "HURI":
                name = "RASS Moldoveneasca (HURI)" if kind == "republic" else str(
                    p.get("ENG_Name") or p.get("UKR_Name") or p.get("LABEL") or (j + 1))
                period = {"start": snapshot, "end": snapshot, "kind": "snapshot",
                          "sourceOnly": True, "notes": "Data de instantaneu cartografic HURI, nu perioada legală de funcționare a hotarului."}
                warnings = ["Instantaneu de sursă: hotarul nu este certificat",
                            "Drepturile de republicare ale stratului HURI necesită verificare"]
            else:
                name = str(p.get("COMITATE") or p.get("REGIUNE") or "unitate") + " · " + str(
                    p.get("STATUT") or "categorie") + " #" + str(j + 1)
                period = {"start": None, "end": None, "kind": "undated", "sourceOnly": True,
                          "notes": "«1860» apare numai în numele colecției; datarea nu este verificată, posibil proveniență Mosaic 1910. Nu se atribuie un an."}
                warnings = ["Eticheta 1860 nu certifică datarea geometriilor",
                            "Drepturile pentru sursa Transilvania necesită verificare"]
            index["entries"].append({
                "id": identity, "sourceFamily": family, "sourceGroup": group,
                "displayName": {"ro": name, "en": "Moldavian ASSR (HURI)" if kind == "republic" else name},
                "sourcePeriod": period,
                "sourceType": (p.get("ADM_Type") or kind) if family == "HURI" else p.get("STATUT"),
                "geometryId": "geom:" + canonical, "featureId": identity, "sourceFeatureIndex": j,
                "geometryShard": filename, "sourceDriveFileId": drive_id,
                "sourceFilename": relative.split("/")[-1], "sourcePath": relative,
                "sourceFileSha256": sha, "sourceRelationId": None,
                "sourceExternalId": str(feature.get("id", p.get("id", j))),
                "provenance": ("HURI MAPA/master_admin → Geodata GIS/RASSM" if family == "HURI"
                               else "Geodata GIS/Transilvania 1860 (districte)"),
                "status": "source_candidate_not_certified", "geometryValidSource": True,
                "sourceRightsStatus": "HOLD_PENDING_REUSE_CONFIRMATION",
                "sourceTagWarnings": warnings
            })
            supplements += 1
        (destination / filename).write_text(content, encoding="utf-8")
    index["geometryAssets"] = 125 + len(geometry_keys)
    index["sourceFamilies"] = ["OHM", "HURI", "TRANSILVANIA_COLLECTION"]
    index["sourceFamilyStatus"] = "SOURCE_ONLY_UNCERTIFIED_NO_ADMIN_PARENTAGE"
    index["sourceRightsReviewRequired"] = True
    index["countsBySource"] = {"OHM": 139, "HURI": 99, "TRANSILVANIA_COLLECTION": 52}
    index["missingSources"] = ("Remaining Geodata GIS families (DARMC, Mosaic, full HistoGIS, ICR, "
        "Russian Empire 1897) require separate source and rights review; no source is "
        "promoted to a certified legal boundary.")
    if (len(index["entries"]), len(index["shards"]), len(index["geometryDuplicates"]),
            index["geometryAssets"]) != (290, 32, 78, 212):
        raise ValueError("Geometry registry/deduplication did not reproduce certified source counts")
    index_path.write_text(json.dumps(index, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    report = {"schema": "atlas-historical-geodata-supplement-qa-v1",
              "sourceOccurrences": supplements, "exactGeometryAssets": len(geometry_keys),
              "exactReuseAliases": 64, "topologicallyValid": supplements,
              "snapshotOnlyHuri": 99, "undatedTransilvania": 52,
              "boundaryCertified": 0, "administrativeParentEdges": 0,
              "reuseRights": "HOLD_PENDING_REUSE_CONFIRMATION"}
    qa_path = repo / "docs/historical/import/HIST-INTEGRATE.1-SUPPLEMENT-QA.json"
    qa_path.parent.mkdir(parents=True, exist_ok=True)
    qa_path.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(report, ensure_ascii=False))

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", type=Path, default=Path(r"G:\My Drive\Geodata GIS"))
    parser.add_argument("--repo", type=Path, default=Path(r"C:\Users\Public\Documents\atlas-hist-import-20261122"))
    args = parser.parse_args()
    run(args.input, args.repo)
