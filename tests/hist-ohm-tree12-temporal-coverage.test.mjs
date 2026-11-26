import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {geodataSourcesAtYear} from '../src/data/historicalGeodata.mjs';
import {buildHistoricalOhmTree} from '../src/data/historicalOhmTree.mjs';
import {rohgis1930VersionsAtYear} from '../src/data/historicalRohgis1930.mjs';
const root=new URL('../',import.meta.url);
const read=p=>JSON.parse(readFileSync(new URL(p,root),'utf8'));
const audit=read('docs/historical/import/HIST-OHM-TREE.12-TEMPORAL-COVERAGE.json');
const index=read('public/data/historical/v1/geodata/index.json');
const rohgis=read('public/data/historical/v1/rohgis/catalog-1930.json');
const base=read('public/data/historical/v1/ohm-parentage.json');
const ext=read('public/data/historical/v1/ohm-parentage-extensions.json');
const links={...base,links:[...base.links,...ext.links]};
const doc=read('public/data/historical/v1/documentary-parents.json');
const docExt=read('public/data/historical/v1/documentary-parents-extensions.json');
const docs={...doc,nodes:[...doc.nodes,...docExt.nodes]};
test('TREE.12 audit preserves its baseline and checks every calendar year',()=>{
  assert.equal(audit.years.length,1101);
  for(const item of audit.sourceBlobs){
    const bytes=readFileSync(new URL(item.path,root));
    assert.equal(createHash('sha1').update('blob '+bytes.length+'\0').update(bytes).digest('hex'),item.gitBlob,
      'Refresh the coverage audit explicitly after changing a baseline source: '+item.path);
  }
  for(let year=1000;year<=2100;year++){
    const row=audit.years[year-1000];
    assert.equal(row.year,year);
    const active=geodataSourcesAtYear(index,year);
    const groups=new Set(active.map(e=>e.sourceGroup));
    assert.equal(row.ohmVersions,active.length);
    assert.equal(row.ohmGeometryIds,new Set(active.map(e=>e.geometryId)).size);
    assert.equal(row.ohmGroups,groups.size);
    assert.equal(row.rohgisVersions,rohgis1930VersionsAtYear(rohgis,year).length);
    const annual=links.links.filter(l=>l.start<=year+'-12-31'&&l.end>=year+'-01-01');
    const counts=new Map();
    for(const l of annual)counts.set(l.childSourceGroup,(counts.get(l.childSourceGroup)||0)+1);
    const accepted=annual.filter(l=>counts.get(l.childSourceGroup)===1);
    assert.equal(row.documentaryLinks,accepted.length);
    assert.equal(row.activeGeometryChildLinks,accepted.filter(l=>groups.has(l.childSourceGroup)).length);
  }
  for(const year of [1000,1300,1800,1860,1865,1910,1911,1925,1930,1940,1950,1991,2100]){
    const actual=buildHistoricalOhmTree(index,links,year,docs);
    assert.equal(actual.activeLinks.length,audit.years[year-1000].documentaryLinks);
  }
});
test('TREE.12 staging accounting must not be mistaken for public admission',()=>{
  const s=audit.sourceStaging;
  assert.equal(s.sourceFamilies.reduce((n,f)=>n+f.versions,0),s.versionRecords);
  assert.equal(s.sourceFamilies.reduce((n,f)=>n+f.assets,0),s.distinctExactWkb2DAssets);
  assert.equal(s.versionRecords-s.distinctExactWkb2DAssets,s.reuses);
  assert.equal(s.publicAdmissions,0);
  assert.equal(s.notComparedAgainstExistingOhmOrRohgisAssets,true);
  assert.equal(audit.baseline.rohgisVersions,565);
  assert.equal(audit.baseline.ohmMissingEnd.length,13);
});
