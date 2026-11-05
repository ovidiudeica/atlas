"""Read-only conversion of the 2026-10-05 OSM-Boundaries nation outlines.

This is a release-specific *rendering subset*, not an authoritative registry.
"""
import gzip, hashlib, json, os, sys
from pathlib import Path
import shapely
from shapely.geometry import shape, mapping

ROOT=Path(__file__).resolve().parents[1]
OUTPUT=ROOT/'public'/'data'
FILES={
 'ro': ('Romania',90689,'Romania','România'),
 'md': ('Moldova',58974,'Republic of Moldova','Republica Moldova')
}
features=[]
source_records={}
for key,(country,rid,en,ro) in FILES.items():
 path=Path('/mnt/data')/f'OSMB-{country}-2026-10-05.geojson.gz'
 with gzip.open(path,'rt',encoding='utf-8') as fh:
  doc=json.load(fh)
 items=[f for f in doc['features'] if f['properties'].get('admin_level')==2 and abs(int(f['properties']['osm_id']))==rid]
 if len(items)!=1:raise ValueError(f'{country} expected 1 outline, got {len(items)}')
 ft=items[0]
 geom=shape(ft['geometry'])
 if not geom.is_valid:raise ValueError(f'{country}: invalid geometry')
 features.append({'type':'Feature','properties':{'id':key,'osmRelationId':rid,'adminLevel':2,'nameEn':en,'nameRo':ro},'geometry':mapping(geom)})
 source_records[key]={'archive':path.name,'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'osmRelationId':rid,'featureCount':1}

# Build two independent *rendering* variants without altering the OSMB geometries.
original={'type':'FeatureCollection','features':features}
(OUTPUT/'countries-original.geojson').write_text(json.dumps(original,ensure_ascii=False,separators=(',',':')),encoding='utf-8')

geoms=[shape(f['geometry']) for f in features]
print('Coverage valid?',shapely.coverage_is_valid(geoms))
if shapely.coverage_is_valid(geoms):
 simplified=list(shapely.coverage_simplify(geoms,tolerance=.02,simplify_boundary=True))
else:
 # Do NOT silently claim topology preservation for a non-coverage input.
 # This dataset shares contested boundaries; a full source topology reconciliation
 # is reserved for the later validated release. For MVP provide unchanged original
 # geometry as safe no-gap/no-new-overlap fallback and defer visible simplification.
 simplified=geoms
for i,geom in enumerate(simplified):
 if not geom.is_valid:raise ValueError(f'invalid geometry after simplify {i}')
simple={'type':'FeatureCollection','features':[
 {'type':'Feature','properties':f['properties'],'geometry':mapping(g)}
 for f,g in zip(features,simplified)]}
(OUTPUT/'countries-simplified.geojson').write_text(json.dumps(simple,ensure_ascii=False,separators=(',',':')),encoding='utf-8')
manifest={'schemaVersion':1,'source':'OSM-Boundaries','snapshotDate':'2026-10-05','sourceRecords':source_records,
 'renderingOnly':True,'original':{'file':'countries-original.geojson'},
 'simplified':{'file':'countries-simplified.geojson','toleranceDegrees':.02,'topologyPreservedIfCoverageValid':bool(shapely.coverage_is_valid(geoms))},
 'caveat':'National outlines only; no legal-boundary equivalence asserted. All source OSM tags remain in source archives.'}
for key in ('original','simplified'):
 f=OUTPUT/manifest[key]['file'];manifest[key]['sha256']=hashlib.sha256(f.read_bytes()).hexdigest()
(OUTPUT/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print({f.name:f.stat().st_size for f in OUTPUT.iterdir()})