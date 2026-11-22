#!/usr/bin/env python3
"""HIST-MODULE.3c — ORIGINAL raster exploratory FIT/HOLDOUT with fail-closed QA.

The two original scans and modern gazetteer centre coordinates are independent
of HistoGIS digitisation. The map points are approximate, not surveyed physical
landmarks, and the holdout selection was not blind. This script *never* promotes
a historical geometry or administrative parent. It can optionally prepare
local-only VRTs for manual inspection with an explicit uncertified warning.

Use QGIS Python with NumPy, pyproj; optional osgeo.gdal for --trial-vrt-dir:
 python scripts/historical/replay_original_map_fit_holdout.py \
    --register public/data/historical/v1/georeferencing-3c.json \
    --streit "C:/.../Streit_1835_17090_original.pdf" \
    --raffelsperger "C:/.../Raffelsperger_Siebenburgen_1841_11381017.jp2" \
    --output docs/historical/qa/HIST-MODULE.3c-FIT-HOLDOUT.json \
    --trial-vrt-dir "C:/.../hist3c_trials"
"""
from __future__ import annotations
import argparse
import hashlib
import json
import math
from pathlib import Path
import numpy as np
from pyproj import Transformer


def checksum(path: Path):
    digest = hashlib.sha256()
    with path.open("rb") as fp:
        while chunk := fp.read(1024 * 1024):
            digest.update(chunk)
    return digest.hexdigest()


def native_xy(point: dict, map_source: dict):
    """Convert PREVIEW coordinates to full original native raster coordinates."""
    a, b = map_source["analysisPreview"]["width"], map_source["analysisPreview"]["height"]
    w, h = map_source["rasterNative"]["width"], map_source["rasterNative"]["height"]
    x, y = point["pixelPreview"]["x"], point["pixelPreview"]["y"]
    if not (0 <= x < a and 0 <= y < b):
        raise ValueError("Pixel GCP outside its preview image: " + point["id"])
    return [x * w / a, y * h / b]


def georef(source: dict, projection: Transformer, *, raster: Path|None = None):
    if raster is not None:
        if not raster.exists() or checksum(raster) != source["archiveSha256"]:
            raise ValueError("Original map missing or wrong SHA-256: " + source["id"])
        if raster.stat().st_size != source["archiveBytes"]:
            raise ValueError("Original raster byte length mismatch: " + source["id"])

    pts = source["controls"]
    fit = [p for p in pts if p["role"] == "FIT"]
    holdout = [p for p in pts if p["role"] == "HOLDOUT"]
    if len(fit) < 6 or len(holdout) < 3:
        raise ValueError("Insufficient FIT/HOLDOUT points: " + source["id"])
    ids = [p["id"] for p in pts]
    if len(set(ids)) != len(ids):
        raise ValueError("Duplicate GCP IDs: " + source["id"])
    if not all(p["pointQuality"] == "provisional_visual_only_not_ground_survey"
               and p["fitHoldoutIndependence"] == "disjoint_coordinates_but_not_blind_selection"
               and p["landmarkKind"] == "historic_town_center_map_symbol_or_label"
               for p in pts):
        raise ValueError("GCP confidence and method are not consistently documented")

    def X(rows):
        return np.array([native_xy(p, source) + [1.0] for p in rows], dtype=float)

    def Y(rows):
        return np.array([projection.transform(p["targetWgs84"]["lon"],
                    p["targetWgs84"]["lat"]) for p in rows], dtype=float)

    xfit, yfit = X(fit), Y(fit)
    if np.linalg.matrix_rank(xfit) < 3:
        raise ValueError("Degenerate collinear FIT samples")
    # Least-squares affine; NOT an 1835/1841 official cartographic projection.
    coeff, _, rank, _ = np.linalg.lstsq(xfit, yfit, rcond=None)
    if rank != 3 or not np.isfinite(coeff).all():
        raise ValueError("FIT affine is not finite/full-rank")
    A = coeff[:2,:]
    if abs(float(np.linalg.det(A))) < 0.001:
        raise ValueError("Degenerate map affine")

    rows = []
    for p in pts:
        xy = native_xy(p, source)
        observed = projection.transform(p["targetWgs84"]["lon"],
                                        p["targetWgs84"]["lat"])
        prediction = np.array([*xy, 1.0]) @ coeff
        error = float(np.linalg.norm(prediction - observed))
        rows.append({
            "id":p["id"], "placeName":p["placeName"], "role":p["role"],
            "pixelNative": [round(xy[0], 4), round(xy[1], 4)],
            "errorMeters":round(error, 4),
            "positionQuality":p["pointQuality"],
            "referenceSourceId":p["referenceSourceId"],
        })
    fit_errors=np.array([r["errorMeters"] for r in rows if r["role"]=="FIT"])
    hold_errors=np.array([r["errorMeters"] for r in rows if r["role"]=="HOLDOUT"])
    fit_rmse=float(np.sqrt(np.mean(fit_errors**2)))
    hold_rmse=float(np.sqrt(np.mean(hold_errors**2)))
    hold_max=float(hold_errors.max())
    # GeoTransform raster pixel x,y -> EPSG:3035 projected x,y, including rotation:
    # easting = gt[0] + x*gt[1] + y*gt[2]
    # northing = gt[3] + x*gt[4] + y*gt[5]
    gt=[float(coeff[2,0]),float(coeff[0,0]),float(coeff[1,0]),
        float(coeff[2,1]),float(coeff[0,1]),float(coeff[1,1])]
    return {
        "sourceId":source["id"],"year":source["year"],
        "archiveSha256":source["archiveSha256"],
        "sourceFileVerified":raster is not None,
        "targetCRS":"EPSG:3035",
        "model":"affine_2d_least_squares_no_historical_datum_assumed",
        "geotransformNative":[round(x,9) for x in gt],
        "fitCount":len(fit),"holdoutCount":len(holdout),
        "fitRMSEMeters":round(fit_rmse,4),
        "holdoutRMSEMeters":round(hold_rmse,4),
        "holdoutMaxMeters":round(hold_max,4),
        "points":rows,
        "fitHoldoutDisjoint":True,
        "blindIndependentHoldout":False,
        "fitReferenceIsIndependentOfHistoGIS":True,
        "approvedForBoundaryTracing":False,
        "historicalBoundaryCertified":False,
        "limitations":"Approximate manually interpreted town symbols; uncertain modern city-centre reference; holdout non-blind; source projection/datum unproven.",
    }


def run(register, rasters):
    if register.get("schema") != "atlas-historical-fit-holdout-review-v1":
        raise ValueError("Wrong input schema")
    transform = register["transformation"]
    if transform["targetCRS"]!="EPSG:3035" or \
       transform["model"]!="affine_2d_least_squares" or \
       transform["fitAndHoldoutDisjoint"] is not True or \
       transform["certifiedGeoreferencingAllowed"] is not False or \
       transform["groundSurveyedLandmarks"] != 0 or \
       transform["independentGeomorphicHoldouts"] != 0:
        raise ValueError("Georeferencing guard/independence status changed")
    if set(rasters)!= {"hist3c:map:streit-1835","hist3c:map:raffelsperger-1841"}:
        raise ValueError("Unexpected map IDs")
    projection = Transformer.from_crs("EPSG:4326", "EPSG:3035",always_xy=True)
    results=[georef(s,projection,raster=rasters[s["id"]])
             for s in register["originalRasterSources"]]
    if len(results)!=2:
        raise ValueError("Both original scans are mandatory")
    for r in results:
        r["passNumericTrialGates"] = bool(
          r["holdoutRMSEMeters"] <= transform["trialMaximumHoldoutRMSEMeters"] and
          r["holdoutMaxMeters"] <= transform["trialMaximumHoldoutErrorMeters"])
        r["certificationDecision"] = "HOLD"  # always; no blind/geomorphic holdout
        r["suitableForCanonicalHistoricalGeometry"] = False

    checks=[]
    for case in register["boundaryCases"]:
        if case["independentBoundaryLine1835"]!="not_traced" or \
           case["independentBoundaryLine1841"]!="not_traced" or \
           case["legalBoundaryCertified"] or case["newGeometryId"] is not None or \
           case["administrativeParentReassignment"] is not None:
            raise ValueError("Unauthorized boundary certification/reparenting")
        checks.append({
          "sourceRelationId":case["sourceRelationId"],
          "childName":case["childName"],"parentName":case["parentName"],
          "sourceOutsidePercent":case["baselineOutsidePercent"],
          "sourceBaselineDecision":case["baselineDecision"],
          "original1835LineDigitized":False,
          "original1841LineDigitized":False,
          "fitHoldoutGeoreferencingAccepted":False,
          "decision":case["decision"],
          "legalBoundaryCertified":False,
          "reassignedLegalParent":None,
          "newHistoricalGeometryId":None
        })
    if len(checks)!=8 or sum(x["decision"]=="BLOCKED_SOURCE_PARENT" for x in checks)!=2:
        raise ValueError("All eight exceptions not explicitly preserved")
    admissions=register["admissions"]
    if admissions["newCanonicalGeoreferencedRasters"] or \
       admissions["newHistoricalGeometryIds"] or \
       admissions["changedOriginalHistoGISGeometries"] or \
       admissions["changedHistoricalParents"] or \
       admissions["changedACTUAL"] or \
       admissions["directlyVerifiedOriginalBoundaryLines"]:
        raise ValueError("Unauthorized promotion of historical data")
    return {
     "schema":"atlas-historical-fit-holdout-results-v1",
     "scope":"exploratory_two_original_rasters_not_legal_or_canonical",
     "independentHistoGISDigitizationUsedInFit":False,
     "pointConfidence":"provisional_visual",
     "blindHoldout":False,
     "acceptedOriginalMapGeoreferencing":0,
     "acceptedLegalHistoricalBoundaryPolygons":0,
     "acceptedReparentings":0,
     "maps":results,"eightCases":checks
    }


def make_trial_vrt(source, result, path:Path, destination:Path):
    from osgeo import gdal,osr
    if source["year"]==1835:
        src="PDF:1:"+str(path)
    else:
        src=str(path)
    dataset=gdal.Open(src)
    if dataset is None:
        raise RuntimeError("Could not open original raster "+src)
    destination.parent.mkdir(parents=True,exist_ok=True)
    out=gdal.Translate(str(destination),dataset,format="VRT")
    if out is None:
        raise RuntimeError("VRT creation failed")
    out.SetGeoTransform(result["geotransformNative"])
    crs=osr.SpatialReference()
    crs.ImportFromEPSG(3035)
    out.SetProjection(crs.ExportToWkt())
    out.SetMetadataItem("HIST_STATUS","EXPLORATORY_NOT_FOR_CANONICAL_BOUNDARY_USE")
    out.SetMetadataItem("SOURCE_SHA256",source["archiveSha256"])
    out.SetMetadataItem("HOLDOUT_RMSE_METERS",str(result["holdoutRMSEMeters"]))
    out.FlushCache()
    out=None
    return str(destination)


def main():
    p=argparse.ArgumentParser()
    p.add_argument("--register",required=True,type=Path)
    p.add_argument("--streit",required=True,type=Path)
    p.add_argument("--raffelsperger",required=True,type=Path)
    p.add_argument("--output",required=True,type=Path)
    p.add_argument("--trial-vrt-dir",type=Path)
    a=p.parse_args()
    reg=json.loads(a.register.read_text(encoding="utf-8"))
    rasters={"hist3c:map:streit-1835":a.streit,
             "hist3c:map:raffelsperger-1841":a.raffelsperger}
    outcome=run(reg,rasters)
    a.output.parent.mkdir(parents=True,exist_ok=True)
    a.output.write_text(json.dumps(outcome,ensure_ascii=False,sort_keys=True,indent=2)+"\n",
                        encoding="utf-8")
    if a.trial_vrt_dir:
        for source,result in zip(reg["originalRasterSources"],outcome["maps"]):
            name="Streit_1835_EXPLORATORY_NOT_FOR_USE.vrt" if source["year"]==1835 \
                 else "Raffelsperger_1841_EXPLORATORY_NOT_FOR_USE.vrt"
            print("Trial local VRT:",make_trial_vrt(
                source,result,rasters[source["id"]],a.trial_vrt_dir/name))
    for m in outcome["maps"]:
        print(m["sourceId"],"FIT",m["fitCount"],"HOLDOUT",m["holdoutCount"],
              "FIT_RMSE_km",round(m["fitRMSEMeters"]/1000,3),
              "HOLD_RMSE_km",round(m["holdoutRMSEMeters"]/1000,3),
              "HOLD_MAX_km",round(m["holdoutMaxMeters"]/1000,3),
              "trial_pass",m["passNumericTrialGates"],
              "legal_geometry_accepted",m["historicalBoundaryCertified"])
    print("Eight boundaries:",len(outcome["eightCases"]),
          "new geometry:",outcome["acceptedLegalHistoricalBoundaryPolygons"])

if __name__=="__main__":
    main()
