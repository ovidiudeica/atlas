import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {editorialSymbolsForEntity,SIM_R3_ENTITY_IDS,SIM_R3_COUNTS,
  symbolAssetUrl,symbolSourceUrl} from '../src/data/territorialSymbols.mjs';
import {officialSymbolsForEntity,REVIEWED_SYMBOL_IDS} from '../src/data/officialSymbols.mjs';

const audit=JSON.parse(readFileSync(
  new URL('../docs/audits/SIM-R31-ASSET-CHECK-20261108.json',import.meta.url),'utf8'));

test('SIM-R3.1: source registry accounts for all 137 editorial images and all 74 IDs',()=>{
  assert.equal(audit.schema,'atlas-sim-r31-source-verification-v1');
  assert.equal(audit.catalogBaseCommit,'17f5838e9e814a903b95cb07ed871877eb33e4c0');
  assert.equal(SIM_R3_ENTITY_IDS.length,74);
  assert.equal(audit.entities,74);
  assert.deepEqual(audit.counts,
    {imageReferences:137,commonsVerified:135,institutionalLinked:2,missing:0});
  assert.equal(audit.media.length,137);
  assert.equal(SIM_R3_COUNTS.coat,70);
  assert.equal(SIM_R3_COUNTS.flag,67);
  const expected=new Set(SIM_R3_ENTITY_IDS.flatMap(id=>
    ['coat','flag'].filter(k=>editorialSymbolsForEntity({id})[k]).map(k=>id+':'+k)));
  const seen=new Set();
  for(const row of audit.media){
    const key=row.id+':'+row.kind;
    assert(expected.has(key),'Unexpected audited symbol '+key);
    assert(!seen.has(key),'Duplicate audited symbol '+key);
    seen.add(key);
    const entry=editorialSymbolsForEntity({id:row.id});
    assert.equal(row.country,entry.country);
    assert.equal(row.territory,entry.name);
    const source=entry[row.kind];
    assert(source,'Audit without exact-ID media '+key);
    if(source.kind==='commons'){
      assert.equal(row.source,'wikimedia-commons');
      assert.equal(row.status,'mediawiki-imageinfo-present');
      assert.equal(source.tier,'B');
      assert.equal(row.file,source.file);
      assert.match(row.sha1,/^[a-f0-9]{40}$/,'SHA1 is a media checksum, not legal validation');
      assert(row.bytes>100&&row.mime.startsWith('image/'));
      assert.match(row.pageUrl,/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
      assert.match(row.mediaUrl,/^https:\/\/upload\.wikimedia\.org\/wikipedia\/commons\//);
      assert.equal(decodeURIComponent(symbolSourceUrl(source).replaceAll('_',' ')).includes(source.file.replaceAll('_',' ')),true);
    }else{
      assert.equal(row.source,'territorial-authority');
      assert.equal(row.status,'linked-in-authority-page');
      assert.equal(source.tier,'A');
      assert.equal(row.mediaUrl,symbolAssetUrl(source));
      assert.equal(row.pageUrl,symbolSourceUrl(source));
      assert.match(row.pageUrl,/raiontaraclia\.md/);
    }
  }
  assert.deepEqual(seen,expected);
});

test('SIM-R3.1: preserve SIM-R2a precedence and 2024/2026 neutral graphics',()=>{
  assert.equal(REVIEWED_SYMBOL_IDS.length,7);
  for(const id of REVIEWED_SYMBOL_IDS){
    assert(officialSymbolsForEntity({id}));
    assert.equal(editorialSymbolsForEntity({id}),null);
  }
  for(const id of ['osm-r377733','osm-r59002']){
    const row=editorialSymbolsForEntity({id});
    assert.equal(row.coat,null);assert.equal(row.flag,null);
  }
  assert.equal(editorialSymbolsForEntity({id:'osm-r2248660'}).coat,null);
  const smoke=readFileSync(new URL('../scripts/ci/browser-smoke.mjs',import.meta.url),'utf8');
  assert.match(smoke,/async function simR31MediaVisualAudit\(cdp\)/);
  assert.match(smoke,/await simR31MediaVisualAudit\(client\)/);
  assert.match(smoke,/desktop-sim-r31-bucharest-neutral\.png/);
  assert.match(smoke,/mobile-sim-r31-district-symbols\.png/);
});

test('SIM-R3.1: Wikimedia Commons and multilingual Wikipedia are candidate sources, not automatic assignments',()=>{
  const policy=readFileSync(new URL('../docs/audits/SIM-R3-EDITORIAL-SYMBOLS.md',import.meta.url),'utf8');
  assert.match(policy,/Wikipedia.*toate limbile|Wikipedia.*all languages/i);
  assert.match(policy,/ID.*exact|exact.*ID/i);
  assert.match(policy,/Wikimedia Commons/);
});
