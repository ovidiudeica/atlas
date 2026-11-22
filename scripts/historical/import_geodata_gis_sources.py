#!/usr/bin/env python3
"""HIST-INTEGRATE.1: reproducible source-only importer from Geodata GIS / OHM-Boundaries.

Never modifies Drive inputs, source geometry coordinates, ACTUAL or canonical
historical hierarchy. Original OHM feature payload is retained in source shards.
"""
import argparse, hashlib, json, pathlib, re, unicodedata
from collections import Counter, defaultdict
from datetime import datetime, timezone
from shapely.geometry import shape

def stable(obj):
    return json.dumps(obj, ensure_ascii=False, separators=(",",":"), sort_keys=True)

def sha(b): return hashlib.sha256(b).hexdigest()

def main():
    p=argparse.ArgumentParser()
    p.add_argument("--input",default=r"G:\My Drive\Geodata GIS\OHM-Boundaries")
    p.add_argument("--repo",default=r"C:\Users\Public\Documents\atlas-hist-import-20261122")
    a=p.parse_args()
    root=pathlib.Path(a.input)
    repo=pathlib.Path(a.repo)
    destination=repo/"public/data/historical/v1/geodata"
    output_review=repo/"docs/historical/import"
    destination.mkdir(parents=True,exist_ok=True);output_review.mkdir(parents=True,exist_ok=True)
    assert root.is_dir(),str(root)
    files=sorted(root.rglob("OHM-r*.geojson"),key=lambda x:unicodedata.normalize("NFC",x.relative_to(root).as_posix()).casefold())
    seen=set()
    records=[]
    empty_dates=[]
    invalid=[]
    driveIDs={}
    for file in [destination/"index.json", *output_review.glob("ohm-*-source-*.json"),output_review/"ohm-core-directories.json",output_review/"ohm-other-directories-a.json",output_review/"ohm-other-directories-b.json"]:
        if not file.is_file():continue
        try:
            data=json.loads(file.read_text(encoding="utf-8-sig"))
            for item in data.get("entries",[]):
                if item.get("sourceFilename") and item.get("sourceDriveFileId"):
                    driveIDs[item["sourceFilename"].lower()]=item["sourceDriveFileId"]
            for d in data.get("dirs",data.get("directories",[])):
                for f in d.get("files",[]):
                    if f.get("name","").lower().endswith(".geojson"):
                        driveIDs[f["name"].lower()]=f.get("id")
        except (OSError,ValueError) as e:
            print("MANIFEST_FAIL",file.name,str(e))
    for file in files:
        binary=file.read_bytes()
        obj=json.loads(binary.decode("utf-8-sig"))
        if obj.get("type")!="FeatureCollection" or len(obj.get("features",[]))!=1:
            raise RuntimeError("Invalid OHM source FeatureCollection "+str(file))
        feature=obj["features"][0]
        props=feature.get("properties",{})
        code=props.get("ohm_relation_id")
        identity="ohm-r"+str(code)
        if not isinstance(code,int) or feature.get("id")!=identity or identity in seen:
            raise RuntimeError("OHM relation ID mismatch "+str(file))
        if props.get("atlas_historical_boundary_certified") is not False:
            raise RuntimeError("Forbidden artificial legal certification "+str(file))
        if feature.get("geometry",{}).get("type") not in ["Polygon","MultiPolygon"]:
            raise RuntimeError("Nonpolygon source "+str(file))
        seen.add(identity)
        valid = bool(shape(feature["geometry"]).is_valid)
        if not valid:invalid.append(identity)
        start=props.get("start_date")
        end=props.get("end_date")
        if not start or not end:empty_dates.append(identity)
        rel=file.relative_to(root).as_posix()
        gp="/".join(file.relative_to(root).parts[:-1])
        category=file.relative_to(root).parts[0]
        section="judete" if category.startswith("Jude") else "comitate" if category.startswith("Comitate") else "other"
        geomHash=sha(stable(feature["geometry"]).encode("utf-8"))
        original_ro=props.get("atlas_editorial_name_ro") or props.get("name:ro") or props.get("official_name:ro") or props.get("name") or str(code)
        original_en=props.get("name:en") or props.get("name") or original_ro
        orig_path="OHM-Boundaries/"+rel
        records.append(dict(section=section,id=identity,feature=feature,folder=gp,relativePath=orig_path,
            sourceName=file.name,sourceBytes=len(binary),sourceSha256=sha(binary),
            geometrySha256=geomHash,geomValid=valid,displayName={"ro":str(original_ro),"en":str(original_en)},
            sourcePeriod={"start":str(start) if start is not None else None,
                          "end":str(end) if end is not None else None,
                          "sourceOnly":True,"notes":props.get("start_date:note")},
            sourceType=props.get("border_type") or props.get("state") or props.get("admin_level"),
            sourceRelationId=code,driveFileId=driveIDs.get(file.name.lower()),
            sourceWarnings=[k+": "+v for k,v in props.items() if k.startswith("fixme") and isinstance(v,str)]))
    # Output reproducible shards in coherent source-family groups.
    groups=defaultdict(list)
    for record in records:groups[record["section"]].append(record)
    entries=[]
    shards=[]
    for section in ["other","judete","comitate"]:
        group=groups[section]
        for begin in range(0,len(group),5):
            batch=group[begin:begin+5]
            filename=f"ohm-source-{section}-{begin//5+1:02d}.geojson"
            sources=[]
            for record in batch:
                sources.append({"name":record["sourceName"],"driveFileId":record["driveFileId"],
                    "sourceRelativePath":record["relativePath"],"sourceBytes":record["sourceBytes"],
                    "sourceSha256":record["sourceSha256"],"featureId":record["id"],
                    "originalStart":record["sourcePeriod"]["start"],"originalEnd":record["sourcePeriod"]["end"],
                    "group":record["folder"]})
            fc={"type":"FeatureCollection","atlasImport":{
                "schema":"atlas-geodata-ohm-import-v1",
                "sourceFolder":"Geodata GIS/OHM-Boundaries",
                "importStatus":"SOURCE_GEOMETRY_UNCERTIFIED",
                "crs":"EPSG:4326","originalCoordinateGeometryUnmodified":True,
                "sourceFiles":sources},"features":[r["feature"] for r in batch]}
            (destination/filename).write_text(stable(fc)+"\n",encoding="utf-8")
            shards.append({"file":filename,"count":len(batch)})
            for record in batch:
                entries.append({"id":record["id"],"sourceFamily":"OHM","sourceGroup":record["folder"],
                    "displayName":record["displayName"],"sourcePeriod":record["sourcePeriod"],
                    "sourceType":record["sourceType"],"geometryId":None,"featureId":record["id"],
                    "geometryShard":filename,"sourceDriveFileId":record["driveFileId"],
                    "sourceFilename":record["sourceName"],"sourcePath":record["relativePath"],
                    "sourceFileSha256":record["sourceSha256"],
                    "sourceRelationId":record["sourceRelationId"],
                    "provenance":"Geodata GIS / OHM-Boundaries / 2026-11-10 snapshot",
                    "status":"source_candidate_not_certified",
                    "geometryValidSource":record["geomValid"],
                    "sourceTagWarnings":record["sourceWarnings"]})
    # Geometry aliases refer to same EXACT coordinate sequence, no topology repair.
    canonical={}
    geomMapping={}
    for rec in records:
        geomMapping[rec["id"]]=rec["geometrySha256"]
        canonical.setdefault(rec["geometrySha256"],rec["id"])
    aliases=[]
    for entry in entries:
        baseId=canonical[geomMapping[entry["id"]]]
        entry["geometryId"]="geom:"+baseId
        if entry["id"]!=baseId: aliases.append([baseId,entry["id"]])
    index={"schema":"atlas-geodata-historical-source-index-v1",
        "asOf":"2026-11-22","status":"INTEGRATED_SOURCE_CANDIDATES_NOT_LEGAL_BOUNDARIES",
        "sourceDomain":"Geodata GIS / OHM-Boundaries",
        "collection":"OHM historical entities, historical counties and comitates: source versions",
        "notCanonicalHierarchy":True,"notLegalBoundaryCertification":True,
        "coordinateReferenceSystem":"EPSG:4326","geometryDuplicates":aliases,
        "geometryAssets":len(canonical),
        "geometryAssetSemantics":"Logical assets deduplicated only by exact coordinate geometry SHA256, every original feature preserved.",
        "shards":shards,"entries":entries,
        "missingSources":"Other Geodata GIS source families are inventoried separately; raw OHM geometries are sources, not legal boundaries."}
    (destination/"index.json").write_text(json.dumps(index,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    qa={"schema":"atlas-hist-import-ohm-qa-v1","observedAt":"2026-11-22",
        "sourceRoot":"G:/My Drive/Geodata GIS/OHM-Boundaries",
        "originalSourceCount":len(files),"importedSourceVersions":len(entries),
        "geometryAssets":len(canonical),"exactDuplicateAliases":len(aliases),
        "polygonSourceInvalidCount":len(invalid),"invalidSourceIds":invalid,
        "sourceUnknownDateEndpointCount":len(empty_dates),
        "sourceUnknownDateEndpointIds":empty_dates,
        "shardCount":len(shards),"categories":dict(Counter(r["section"] for r in records)),
        "dataPolicy":"Original files and source coordinates unmodified. Rights and boundaries not automatically certified. No ACTUAL changes.",
        "sourceManifestCount":len(list(root.rglob("manifest.json"))),
        "metadataGzipCount":len(list(root.rglob("*.source.json.gz")))}
    (output_review/"HIST-INTEGRATE.1-OHM-IMPORT-QA.json").write_text(json.dumps(qa,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    # Replace older hand-collected shards to avoid redundant source geometry bytes.
    retired=[]
    for p in destination.glob("ohm-*.geojson"):
        if p.name.startswith("ohm-source-"):continue
        retired.append(p.name)
        p.unlink()
    print(json.dumps({"status":"IMPORTED","sourceVersions":len(entries),"logicalGeometryAssets":len(canonical),
        "shards":len(shards),"invalid":len(invalid),"unknownDateEnds":len(empty_dates),
        "duplicateAliases":len(aliases),"retiredManualShards":retired,
        "categoryCounts":qa["categories"]},ensure_ascii=False))
if __name__=="__main__":main()
