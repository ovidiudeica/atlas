#!/usr/bin/env python3
"""Revalidate HIST-OHM-TREE.5 geometry evidence using original checked-in GeoJSON.

Usage:
  python -m pip install shapely pyproj
  python scripts/historical/reconcile_ohm_rohgis_1930.py

SOURCE-ONLY: no identity certification, no geometryId rewriting, no snapping.
The JS test suite independently checks the global bbox gate without Python.
"""
import collections
import hashlib
import json
from pathlib import Path
import sys
import unicodedata

from pyproj import Transformer
from shapely.geometry import shape
from shapely.ops import transform

ROOT = Path(__file__).resolve().parents[2]
BASE = ROOT / 'public/data/historical/v1'
OHM = BASE / 'geodata/index.json'
RO = BASE / 'rohgis/catalog-1930.json'
AUDIT = BASE / 'reconciliation/ohm-rohgis-1930.json'


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def normal(s):
    return ''.join(c for c in unicodedata.normalize('NFD', s)
                   if unicodedata.category(c) != 'Mn').lower().translate(
        str.maketrans({'ș': 's', 'ş': 's', 'ț': 't', 'ţ': 't'}))


def features(folder, shards):
    result = {}
    for name in shards:
        data = json.loads((folder / name).read_text(encoding='utf-8'))
        assert data['type'] == 'FeatureCollection', name
        for feat in data['features']:
            assert feat['id'] not in result, ('duplicate feature', feat['id'])
            geom = shape(feat['geometry'])
            assert geom.is_valid and not geom.is_empty, ('invalid geometry', feat['id'])
            result[feat['id']] = geom
    return result


def box_token(geom):
    # This is ONLY a prefilter: strict geometry equality implies equal bounds.
    # It is never accepted as a proof that borders are identical.
    return tuple(round(v, 8) for v in geom.bounds)


def area_stats(ohm, ro, project):
    a = transform(project, ohm)
    b = transform(project, ro)
    overlap = a.intersection(b).area
    union = a.union(b).area
    return {
        'intersectionOverUnion': overlap / union,
        'ohmSqKm': a.area / 1e6,
        'rohgisSqKm': b.area / 1e6,
        'onlyOhmSqKm': a.difference(b).area / 1e6,
        'onlyRohgisSqKm': b.difference(a).area / 1e6,
        'symmetricDifferenceSqKm': a.symmetric_difference(b).area / 1e6,
        'boundaryHausdorffKm': a.boundary.hausdorff_distance(b.boundary) / 1000,
    }


def main():
    assert AUDIT.exists(), AUDIT
    catalog_ohm = json.loads(OHM.read_text(encoding='utf-8'))
    catalog_ro = json.loads(RO.read_text(encoding='utf-8'))
    audit = json.loads(AUDIT.read_text(encoding='utf-8'))
    assert audit['provenance']['ohmIndexSha256'] == digest(OHM)
    assert audit['provenance']['rohgisIndexSha256'] == digest(RO)
    assert audit['stage'] == 'HIST-OHM-TREE.5'
    assert catalog_ro['yearFilterRestriction'] == 'ONLY_1930'
    assert not catalog_ro['historicalLegalBoundariesCertified']
    ohm = features(BASE / 'geodata',
                   [shard['file'] for shard in catalog_ohm['shards']])
    ro = features(BASE / 'rohgis',
                  [shard['path'] for shard in catalog_ro['geometryShards']])
    assert len(ohm) == len(catalog_ohm['entries']) == 139
    assert len(ro) == len(catalog_ro['versions']) == 565
    ver_ohm = {v['id']: v for v in catalog_ohm['entries']}
    ver_ro = {v['entityId']: v for v in catalog_ro['versions']}
    assert {v['featureId'] for v in ver_ohm.values()} == set(ohm)
    assert set(ver_ro) == set(ro)
    assert len(audit['ohmDispositions']) == 139
    assert len(audit['rohgisDispositions']) == 565
    assert len(audit['cases']) == 16
    assert len({v['geometryId'] for v in ver_ohm.values()}) == 125
    assert len({v['geometryId'] for v in ver_ro.values()}) == 565

    # All possible cross-family exact matches (including comitates and plasi).
    # Identical polygon sets must have identical min/max bounds, so this is a
    # complete sound screen for exact equality across all 78,535 version pairs.
    boxes = collections.defaultdict(list)
    for name, geom in ro.items():
        boxes[box_token(geom)].append(name)
    candidates = []
    actual_matches = []
    for name, geom in ohm.items():
        for other in boxes.get(box_token(geom), ()):
            candidates.append((name, other))
            if geom.equals(ro[other]):
                actual_matches.append((name, other))
    assert len(ohm) * len(ro) == audit['counters']['crossFamilyPairsScreened'] == 78535
    assert len(candidates) == audit['counters']['strictBoundingBoxPrefilterPairs'] == 0
    assert len(actual_matches) == audit['counters']['topologicallyEqualPairs'] == 0

    trans = Transformer.from_crs('EPSG:4326', 'EPSG:3844', always_xy=True)
    count_temporal = 0
    count_unknown_end = 0
    by_ro_name = {normal(v['nameRo']): v for v in ver_ro.values()
                  if v['kind'] == 'judet'}
    saw = set()
    for c in audit['cases']:
        assert c['ohmId'] in ver_ohm and c['rohgisEntityId'] in ver_ro
        ov, rv = ver_ohm[c['ohmId']], ver_ro[c['rohgisEntityId']]
        assert rv['kind'] == 'judet' and ov['sourceGroup'].startswith('Județe istorice/Județul ')
        assert normal(rv['nameRo']) == normal(c['nameRo'])
        assert normal(ov['sourceGroup'].split('Județul ', 1)[1]) == normal(c['nameRo'])
        assert by_ro_name[normal(c['nameRo'])]['entityId'] == rv['entityId']
        assert c['rohgisEntityId'] not in saw
        saw.add(c['rohgisEntityId'])
        assert c['geometryIds'] == {'ohm': ov['geometryId'], 'rohgis': rv['geometryId']}
        assert c['historicalIdentityCertified'] is False
        assert c['legalBoundaryCertified'] is False
        assert c['sharedGeometryIdEligible'] is False
        assert c['geometricComparison']['topologicallyEqual'] is False
        assert not ohm[ov['featureId']].equals(ro[rv['entityId']])
        period = ov['sourcePeriod']
        if period['end'] is None:
            count_unknown_end += 1
            assert c['temporalEvidenceStatus'] == 'END_UNKNOWN_CANNOT_INFER_1930'
        else:
            count_temporal += 1
            assert period['start'][:4] <= '1930' <= period['end'][:4]
        actual = area_stats(ohm[ov['featureId']], ro[rv['entityId']], trans.transform)
        stated = c['geometricComparison']
        for field, val in actual.items():
            # The sidecar stores projected metrics rounded to <= 6 digits.
            # PROJ/Shapely builds can differ in trailing fractions; 1 m2 or
            # 1 mm tolerance is strictly a numeric regression tolerance, not
            # a tolerance for declaring identical boundaries.
            tolerance = 1e-6 if field == 'intersectionOverUnion' else 0.002
            assert abs(stated[field] - val) < tolerance, (
                c['nameRo'], field, stated[field], val)
    assert [count_temporal, count_unknown_end] == [3, 13]
    assert all(v['crossFamilySharedGeometryId'] is False
               for v in audit['ohmDispositions'] + audit['rohgisDispositions'])
    assert len([v for v in audit['rohgisDispositions']
                if v['disposition'] == 'NO_OHM_PLASA_TIER']) == 494
    print('HIST-OHM-TREE.5: PASS')
    print('139 OHM + 565 RoHGIS polygons valid; 78,535 comparisons, 0 exact shared geometries.')
    print('16 same-name county cases; 3 OHM periods include 1930, 13 ends missing.')
    print('71 counties + 494 plasi retained, no cross-family geometryId promotions.')


if __name__ == '__main__':
    main()
