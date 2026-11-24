#!/usr/bin/env python3
"""HIST-OHM-TREE.4: Source-only 1930 RoHGIS county/plasa historical package.

Does NOT certify legal boundaries, infer identity with OHM source groups, alter
original GPKGs, or extrapolate 1930 polygons across 1929-1938/1929-1933.
"""
from __future__ import annotations
import argparse, collections, datetime, hashlib, json, pathlib, re, shutil, unicodedata, zipfile
import geopandas as gpd
from shapely.ops import unary_union

SOURCES = {
    "judete": {"name":"rohgis_judete_1930.gpkg","driveId":"1Bz7JCOGI3p7f0nEgvsNXi5HbEt-t5CqJ", "url":"https://drive.google.com/file/d/1Bz7JCOGI3p7f0nEgvsNXi5HbEt-t5CqJ/view", "periodLabel":"1929–1938", "layer":"rohgis_judete_1930"},
    "plasi": {"name":"rohgis_plasi_1929_1933.gpkg","driveId":"1WLnoTCnxx41x-oP6aECkKlCS-HJlUTPp", "url":"https://drive.google.com/file/d/1WLnoTCnxx41x-oP6aECkKlCS-HJlUTPp/view", "periodLabel":"1929–1933", "layer":"rohgis_plasi_1929_1933"}
}
PRIMARY = [
    "https://rohgis.ro/geografic/",
    "https://geo-spatial.org/vechi/download/rohgis",
    "https://geo-spatial.org/vechi/download/romania-limitele-administrative-ale-jude-elor-interbelice-1930",
]

def digest(path):
    return hashlib.file_digest(open(path,'rb'),'sha256').hexdigest()

def slug(name):
    n=unicodedata.normalize('NFKD', str(name));n=''.join(x for x in n if not unicodedata.combining(x));n=n.casefold().replace('ț','t').replace('ţ','t').replace('ș','s').replace('ş','s');return re.sub('[^a-z0-9]+','-',n).strip('-')

def save_json(path,obj):
    path.parent.mkdir(parents=True,exist_ok=True)
    path.write_text(json.dumps(obj,ensure_ascii=False,sort_keys=True,indent=2,allow_nan=False)+'\n','utf-8')

def build(countyfile,plasafile,out):
    out.mkdir(parents=True,exist_ok=True)
    county=gpd.read_file(countyfile,layer=SOURCES['judete']['layer'])
    plasa=gpd.read_file(plasafile,layer=SOURCES['plasi']['layer'])
    assert county.crs.to_epsg()==3844 and plasa.crs.to_epsg()==3844
    assert len(county)==71 and len(plasa)==494
    assert plasa['Rang'].value_counts().to_dict()=={'II':322,'III':172}
    assert county['Nume'].is_unique and plasa['id'].is_unique
    assert county.geometry.notnull().all() and plasa.geometry.notnull().all()
    assert county.is_valid.all() and plasa.is_valid.all()
    assert set(plasa['Județ'])==set(county['Nume'])
    original_hashes={"judete":digest(countyfile),"plasi":digest(plasafile)}
    county_names=set(county['Nume']);county_ids={n:'rohgis:county:1930:'+slug(n) for n in county_names}
    assert len(county_ids)==71 and len(set(county_ids.values()))==71
    county=county.sort_values('Nume',key=lambda s:s.str.casefold()).reset_index(drop=True)
    plasa=plasa.sort_values('id').reset_index(drop=True)
    county['entity_id']=county.Nume.map(county_ids)
    county['parent_id']='ohm:provisional-entity:Regatul%20Rom%C3%A2niei'
    county['geometry_id']=None
    plasa['entity_id']=plasa.id.map(lambda x:'rohgis:plasa:1930:'+str(x))
    plasa['parent_id']=plasa['Județ'].map(county_ids)
    plasa['geometry_id']=None
    geom_assets={}; source_versions=[]; duplicate_uses=[]
    for kind,rows,name_field,source_key in [('judet',county,'Nume','judete'),('plasa',plasa,'Nume','plasi')]:
        for _,r in rows.iterrows():
            # Exact source coordinate comparison in original EPSG:3844, no normalization.
            geomhash=hashlib.sha256(r.geometry.wkb).hexdigest()
            geometry_id=geom_assets.setdefault(geomhash,'rohgis:geom:'+geomhash[:24])
            if sum(1 for ver in source_versions if ver['geometryId']==geometry_id):
                duplicate_uses.append({'geometryId':geometry_id,'entityId':r.entity_id})
            if kind=='judet': county.loc[county.entity_id==r.entity_id,'geometry_id']=geometry_id
            else: plasa.loc[plasa.entity_id==r.entity_id,'geometry_id']=geometry_id
            source_versions.append({
                'entityId':r.entity_id,'versionId':r.entity_id+':version:1930','geometryId':geometry_id,
                'parentId':r.parent_id,'nameRo':str(r[name_field]),'kind':kind if kind=='judet' or r['Rang']=='II' else 'urban_unit',
                **({'sourceRank':str(r['Rang'])} if kind=='plasa' else {}),
                'start':'1930-01-01','end':'1930-12-31',
                'temporalStatus':'DOCUMENTARY_1930_SNAPSHOT_ONLY',
                'sourceCollectionPeriod':SOURCES[source_key]['periodLabel'],
                'sourceDriveFileId':SOURCES[source_key]['driveId'],
                'sourceHashSha256':original_hashes[source_key],
                'sourceRecordId':str(r.id) if kind=='plasa' else str(r.Nume),
                'sourceParentLabel':str(r['Județ']) if kind=='plasa' else 'Regatul României',
                'parentageEvidenceStatus':'SOURCE_ATTRIBUTE' if kind=='plasa' else 'DOCUMENTARY_STATE_MEMBERSHIP',
                'boundaryCertified':False,'crossFamilyIdentityCertified':False,
            })
    # Exact fingerprint reuse; where none is discovered no reuse is imposed.
    assert len(source_versions)==565
    # Preserve source native CRS in reviewable QGIS layers; original files untouched.
    gpkg=out/'rohgis_1930_historical_catalog.gpkg'
    if gpkg.exists(): gpkg.unlink()  # Repeatable build; never append to a previous output.
    for key,df,lyr in [('judete',county,'judete_1930'),('plasi',plasa,'plasi_1930')]:
        layer=df.copy()
        if key=='judete':
            layer=layer[['entity_id','parent_id','geometry_id','Nume','Directorat','Supraf','Pop_tot','geometry']]
        else:
            layer=layer[['entity_id','parent_id','geometry_id','id','Nume','Județ','Rang','Pop_1930','geometry']]
        layer.to_file(gpkg,layer=lyr,driver='GPKG',mode='w' if key=='judete' else 'a',index=False)
    county_geom={r.Nume:r.geometry for _,r in county.iterrows()}
    county_qa=[]
    for name,group in plasa.groupby('Județ'):
        pg=unary_union(group.geometry.to_list());cg=county_geom[name]
        gap=cg.difference(pg);outside=pg.difference(cg)
        overlap=sum(g.area for g in group.geometry)-pg.area
        county_qa.append({
            'county':name,'plasi':len(group),'countySqKm':round(cg.area/1e6,6),
            'plasiUnionSqKm':round(pg.area/1e6,6),'countyNotInPlasiSqKm':round(gap.area/1e6,6),
            'plasiOutsideCountySqKm':round(outside.area/1e6,6),
            'plasiPairOverlapSqKm':round(max(0,overlap)/1e6,8),
            'gapShare':round(gap.area/cg.area,9),'outsideShare':round(outside.area/cg.area,9),
            'geometryIdentical':cg.equals_exact(pg,0),
        })
    county_qa.sort(key=lambda r:r['county'].casefold())
    qa={
        'schema':'hist-ohm-tree4-rohgis-1930-qa-v1',
        'observedAt':datetime.date.today().isoformat(),'sourceCrs':'EPSG:3844',
        'countyCount':len(county),'plasaCount':int((plasa['Rang']=='II').sum()),'urbanUnitCount':int((plasa['Rang']=='III').sum()),'subunitSourceFeatureCount':len(plasa),
        'countyUniqueNames':len(county_ids),'plasaUniqueSourceIds':int(plasa.id.nunique()),
        'invalidGeometries':int((~county.is_valid).sum()+(~plasa.is_valid).sum()),
        'orphans':int((~plasa['Județ'].isin(county_names)).sum()),
        'geometryUniqueExactWkb':len(geom_assets),'exactGeometryAliases':len(duplicate_uses),
        'duplicatePlasaLabelsWithinSameCounty':int(plasa[plasa['Rang']=='II'].duplicated(['Județ','Nume']).sum()),
        'duplicateSourceLabelsAcrossRanks':int(plasa.duplicated(['Județ','Nume']).sum()),
        'countyGapTotalSqKm':round(sum(r['countyNotInPlasiSqKm'] for r in county_qa),6),
        'plasiExcessTotalSqKm':round(sum(r['plasiOutsideCountySqKm'] for r in county_qa),6),
        'plasiPairOverlapTotalSqKm':round(sum(r['plasiPairOverlapSqKm'] for r in county_qa),6),
        'countyPlasiExactUnionMatches':sum(r['geometryIdentical'] for r in county_qa),
        'sameInstitutionAcrossOHMAndRoHGISNotAssumed':True,
        'geometryCertified':False,'originalSourceFilesUnmodified':True,
        'originalSourceSha256':original_hashes,
        'perCounty':county_qa,
    }
    save_json(out/'qa_rohgis_1930.json',qa)
    save_json(out/'catalog_rohgis_1930.json',{
        'schema':'hist-ohm-tree4-rohgis-1930-catalog-v1',
        'sourceFamily':'ROHGIS','spatialReference':'EPSG:3844',
        'admittedSnapshot':'1930', 'yearFilterRestriction':'ONLY_1930',
        'sourceCollectionYearsAreNotEvidenceOfStableBoundaries':True,
        'documentaryStateRoot':'ohm:provisional-entity:Regatul%20Rom%C3%A2niei',
        'provenance':SOURCES,'referenceUrls':PRIMARY,
        'geometryAssetCount':len(geom_assets),'geometryAssetIds':list(geom_assets.values()),
        'versions':source_versions,'duplicateGeometryUses':duplicate_uses,
        'plasaParentRelationKind':'SOURCE_REPORTED_JUDET_COLUMN',
        'historicalLegalBoundariesCertified':False,
    })
    # Explicit list of unresolved and admitted administrative time windows;
    # this is not a geometry chronology certification.
    comitate=[
        {'sourceGroup':'Comitate istorice/Comitatul Csanád-Arad-Torontál',
         'sourceId':'ohm-r2829215','sourcePeriod':'1923–1945',
         'administrativeEvidenceDate':'1923-09-27','status':'LEGAL_BASIS_1923_CONFIRMED_IMPLEMENTATION_DATE_HOLD',
         'sourceEvidence':'https://net.jogtar.hu/ezer-ev-torveny?docid=92300035.TV',
         'explanation':'1923:XXXV §§11–12 establishes the legal basis on 1923-09-27, not proof of same-day administrative implementation. Independent records confirm operation by 1928. No unbroken 1923–1945 tenure or OHM border certified.'},
        {'sourceGroup':'Comitate istorice/Comitatul Ung','sourceId':'ohm-r2929703','sourcePeriod':'1876-06-19 to 1876-06-19',
         'status':'HOLD_TEMPORAL_SOURCE_INVALID','explanation':'Same-day OHM period cannot be extrapolated to 1911 or attached from name similarity.'},
        {'sourceGroup':'Comitate istorice/Comitatul Bereg-Ugocsa','sourceId':'ohm-r2829534',
         'sourcePeriod':'1850–1860','status':'HOLD_CONTEMPORARY_PARENTAGE_EVIDENCE',
         'explanation':'1850–60 administrative structure requires period-specific primary documents; not equal to 1923 Szatmár-Ugocsa-Bereg.'},
        {'sourceGroup':'Comitate istorice/Comitatul Békés-Csanád','sourceId':'ohm-r2829205',
         'sourcePeriod':'1854–1860','status':'HOLD_CONTEMPORARY_PARENTAGE_EVIDENCE',
         'explanation':'Austrian 1854–60 reorganization requires independent primary sources; not the 1923 entity.'},
        {'sourceGroup':'Comitate istorice/Comitatul Zaránd','status':'HOLD_ALTERNATIVE_ADMINISTRATION_CHRONOLOGY',
         'explanation':'1732/1850/1876 reorganizations prevent blanket Transylvania parentage.'},
        {'sourceGroup':'Comitate istorice/Țara Chioarului','status':'HOLD_PARTIUM_PERIOD_IDENTITY',
         'explanation':'Distinguish estate, district, county and changing legal dependence for undemonstrated intervals.'},
    ]
    save_json(out/'qualification_comitate_remaining.json',{
        'schema':'hist-ohm-tree4-comitate-qualification-v1','sourceFamily':'OHM',
        'qualifiedMembershipOnlyNoBoundaryCertification':True,'items':comitate,
        'otherNon1911PeriodsRemainHOLDUnlessIndividuallyEvidenced':True,
    })
    readme=f"""# HIST-OHM-TREE.4 — 1930, inventar şi geometrii de lucru

**Stare: pachet local de integrare, nu integrare în producție.** Fișierele originale din Google Drive nu au fost modificate. Straturile din GeoPackage sunt copii derivate pentru QGIS, în **EPSG:3844**.

* `rohgis_1930_historical_catalog.gpkg`: straturile **judete_1930** ({len(county)} entități) și **plasi_1930** ({len(plasa)} entități), fiecare cu `entity_id`, `parent_id`, `geometry_id`.
* `catalog_rohgis_1930.json`: entitate, versiune **1930**, sursă, SHA256, părinte din sursă, referinţă la activ geometric; sursele OHM rămân separate.
* `qa_rohgis_1930.json`: control topologic, egalitate geometrică exactă, discrepanțe între județe și uniunea plășilor.
* `qualification_comitate_remaining.json`: temei normativ din 1923 pentru Csanád–Arad–Torontál, fără datare automată a implementării, şi cazuri rămase HOLD.

## Reguli

- Datele „1929–1938” / „1929–1933” din numele colecţiilor **nu justifică** invariabilitatea hotarului în toţi aceşti ani. Afişarea temporală automată este limitată la fotografia **1930**.
- Fiecare dintre {len(plasa)} înregistrări (322 plăși, 172 unități urbane) are un judeţ-părinte **raportat de câmpul sursei** `Județ`; asocierea nu este certificare juridică independentă.
- La nivelul 1930, `Regatul României → județe → plăși și unități urbane` este legătura de navigaţie vizată. Reconcilierea identităţilor OHM/RoHGIS rămâne neaprobată până la surse şi verificări individuale. În special, „Suceava” veche OHM (cu Fălticeni) nu trebuie confundată cu județul Bucovinei din 1930.
- `geometry_id` se refoloseşte **numai** dacă SHA256 din WKB-ul EPSG:3844 este identic. Nu se aproximează, nu se repară automat, nu se face `snap` sau uniune pentru a forţa egalitatea.
- Diferențele între poligoanele județene și totalul plășilor: {qa['countyGapTotalSqKm']:.6f} km² din județe nu intră în uniunea plășilor; {qa['plasiExcessTotalSqKm']:.6f} km² din plăși depășesc poligoanele județelor. Acestea sunt **diferențe tehnice ale setului de date**, nu modificări istorice demonstrate.

## Provenienţă

- RoHGIS: https://rohgis.ro/geografic/
- geo-spatial.org: https://geo-spatial.org/vechi/download/rohgis
- Fișierul de judeţe: {SOURCES['judete']['url']}, SHA256 `{original_hashes['judete']}`.
- Fișierul de plăşi: {SOURCES['plasi']['url']}, SHA256 `{original_hashes['plasi']}`.
- Comitate, legea 1923:XXXV: https://net.jogtar.hu/ezer-ev-torveny?docid=92300035.TV

## Integrarea în aplicația atlas

Acest pachet nu modifică modulele ACTUAL, nici indexul OHM existent. În aplicaţie trebuie încă adăugată familia RoHGIS la un **catalog temporal comun** care agregă OHM şi RoHGIS; adaptoare pentru încărcarea celor două straturi în `HistoricalGeodataBrowser`; restricţia de an pentru 1930; conflictul de identitate între surse; teste browser şi publicare CI. Nici un rezultat de mai sus nu pretinde că aceste modificări de website sunt publicate.

Pentru regenerare rulați `python build_hist_ohm_tree4_rohgis.py --counties <rohgis_judete_1930.gpkg> --plasi <rohgis_plasi_1929_1933.gpkg> --out <folder>` cu GeoPandas, Shapely, Fiona/pyogrio.
"""
    (out/'README.md').write_text(readme,encoding='utf-8')
    shutil.copy2(pathlib.Path(__file__),out/'build_hist_ohm_tree4_rohgis.py')
    return qa

if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--counties',default='/mnt/data/rohgis_judete_1930.gpkg.bin');p.add_argument('--plasi',default='/mnt/data/rohgis_plasi_1929_1933.gpkg.bin');p.add_argument('--out',default='/mnt/data/HIST-OHM-TREE.4-1930');a=p.parse_args()
    output=pathlib.Path(a.out)
    qa=build(pathlib.Path(a.counties),pathlib.Path(a.plasi),output)
    filename=output.parent/(output.name+'.zip')
    with zipfile.ZipFile(filename,'w',zipfile.ZIP_DEFLATED,compresslevel=7) as z:
        for item in output.iterdir():z.write(item,arcname=output.name+'/'+item.name)
    print(json.dumps({'zip':str(filename),'gpkg':str(output/'rohgis_1930_historical_catalog.gpkg'),'qa':{k:qa[k] for k in ['countyCount','plasaCount','invalidGeometries','orphans','geometryUniqueExactWkb','exactGeometryAliases','countyGapTotalSqKm','plasiExcessTotalSqKm','countyPlasiExactUnionMatches']}},ensure_ascii=False))