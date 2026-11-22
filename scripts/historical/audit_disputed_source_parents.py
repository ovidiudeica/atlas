#!/usr/bin/env python3
"""HIST-MODULE.3b: strictly spatial diagnostics for the eight HistoGIS disputes.

This is NOT independent verification against original cartography. HistoGIS
polygons are the inputs; original map FIT/HOLDOUT is a separate blocked gate.
Even a spatially containing alternate polygon NEVER becomes a legal parent.
No input geometry is changed; no new geometry is created.

Usage:
  python scripts/historical/audit_disputed_source_parents.py \
    --catalog public/data/historical/v1/catalog.json \
    --geometry public/data/historical/v1/geometry.geojson \
    --qualification public/data/historical/v1/qualification.json \
    --out docs/historical/qa/HIST-MODULE.3b-spatial-candidates.json
Requires Shapely 2, pyproj.
"""
from __future__ import annotations
import argparse
from pathlib import Path
import json
from shapely.geometry import shape
from shapely.ops import transform
from pyproj import Transformer

def as_day(date):
    if date is None:
        return None
    return date['year']*10000+date.get('month',1)*100+date.get('day',1)

def as_end_day(date):
    if date is None:
        return None
    return date['year']*10000+date.get('month',12)*100+date.get('day',31)

def active_1835(version):
    period=version['period']
    return period['kind']=='interval' and (
        (as_day(period['start']) or -10**12)<=18350701<=
        (as_end_day(period['end']) or 10**12))

def evaluate(catalog, features, qualification):
    if catalog['schema']!='atlas-historical-pilot-v1' or \
       qualification['sourceArchiveSha256']!=catalog['sourceArchiveSha256']:
        raise ValueError('Source catalogue qualification mismatch')
    by_version={v['id']:v for v in catalog['versions']}
    by_geometry={f['properties']['geometryId']:f['geometry'] for f in features['features']}
    project=Transformer.from_crs('EPSG:4326','EPSG:3035',always_xy=True).transform
    polygons={key:transform(project,shape(geo)) for key,geo in by_geometry.items()}
    for key,g in polygons.items():
        if not g.is_valid or g.area<=0:raise ValueError('Invalid historic source geometry '+key)
    qa={r['id']:r for r in qualification['relations']}
    disputes=[r for r in catalog['hierarchy']
              if qa[r['id']]['decision']!='spatially_consistent_source_candidate']
    if len(disputes)!=8:raise ValueError('Unexpected source QA problem count')
    candidates=[]
    for rel in disputes:
        child=by_version[rel['childVersionId']]
        source_parent=by_version[rel['parentVersionId']]
        childpoly=polygons[child['geometryId']]
        parentpoly=polygons[source_parent['geometryId']]
        outside=childpoly.difference(parentpoly).area/childpoly.area*100
        if abs(outside-qa[rel['id']]['outsidePercentEqualArea'])>0.0002:
            raise ValueError('EPSG:3035 source QA mismatch '+rel['id'])
        choices=[]
        for option in catalog['versions']:
            if option['id']==child['id'] or not active_1835(option):continue
            g=polygons[option['geometryId']]
            if g.area<=childpoly.area*1.01:continue
            coverage=childpoly.intersection(g).area/childpoly.area*100
            if coverage<70:continue
            choices.append({
              'versionId':option['id'],
              'sourceName':option['name']['ro'],
              'sourceOriginalType':option['sourceOriginalType'],
              'childAreaInsidePercent':round(coverage,6),
              'outsidePercent':round(100-coverage,6),
              'provesLegalParent':False
            })
        choices.sort(key=lambda x:(-x['childAreaInsidePercent'],x['sourceName']))
        candidates.append({
          'sourceRelationId':rel['id'],
          'childSourceName':child['name']['ro'],
          'assignedSourceParent':source_parent['name']['ro'],
          'sourceOutsidePercentEqualArea':round(outside,6),
          'originalSourceVerdict':qa[rel['id']]['decision'],
          'topContemporaneousSpatialContainers':choices[:6],
          'inferredAdministrativeParent':None,
          'boundaryCertified':False,
          'fitGcpCount':0,
          'holdoutGcpCount':0,
        })
    return {
      'schema':'hist-module-3b-spatial-candidates-v1',
      'sourceArchiveSha256':catalog['sourceArchiveSha256'],
      'crs':'EPSG:3035',
      'sourceGeometryOnly':True,
      'independentOriginalMapComparisonPerformed':False,
      'spatialParentageIsNotAdministrativeParentage':True,
      'count':len(candidates),
      'items':candidates
    }

def main():
    p=argparse.ArgumentParser()
    for x in ['catalog','geometry','qualification','out']:
        p.add_argument('--'+x,required=True,type=Path)
    a=p.parse_args()
    c=json.loads(a.catalog.read_text(encoding='utf-8'))
    g=json.loads(a.geometry.read_text(encoding='utf-8'))
    q=json.loads(a.qualification.read_text(encoding='utf-8'))
    result=evaluate(c,g,q)
    a.out.parent.mkdir(parents=True,exist_ok=True)
    a.out.write_text(json.dumps(result,ensure_ascii=False,indent=2,sort_keys=True)+'\n',encoding='utf-8')
    print(json.dumps({'qaCount':result['count'],
      'blocked':[(x['childSourceName'],x['assignedSourceParent'],
         x['topContemporaneousSpatialContainers'][:3])
         for x in result['items'] if x['originalSourceVerdict']=='blocked_spatial_contradiction'],
      'everLegalParentAssigned':False},ensure_ascii=False,indent=2))
if __name__=='__main__':
    main()
