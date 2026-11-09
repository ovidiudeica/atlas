import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import {applySymbolAudit,symbolAuditFor} from '../src/data/symbolAudit.mjs';
import {coatImageForEntity} from '../src/data/entityCoat.mjs';
import {globalSymbolsForEntity,withGlobalSymbols} from '../src/data/globalSymbols.mjs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url));
const gz=p=>JSON.parse(gunzipSync(read(p)));
const audit=gz('public/data/symbols/audit.json.gz');
const baseline=gz('public/data/symbols/registry.json.gz').entities;
const current=gz('public/data/symbols/registry-current.json.gz').entities;
const nodes=gz('public/data/phase4/catalog.json.gz').entities;
const report=JSON.parse(read('docs/audits/SIM-R5-RESULTS.json'));
const allowed=new Set(['VERIFIED_OFFICIAL','SOURCE_CORROBORATED','CANDIDATE_UNVERIFIED','HISTORICAL_ONLY','MISATTRIBUTED','OUTDATED_VERSION','DISPUTED','RIGHTS_UNCLEAR','MISSING']);
test('SIM-R5: 4283 exact identities, 8566 separate slots, all existing assignments investigated',()=>{
 assert.equal(nodes.length,4283);assert.equal(Object.keys(audit.entities).length,4283);
 assert.equal(audit.catalogSHA256,createHash('sha256').update(read('public/data/phase4/catalog.json.gz')).digest('hex'));
 assert.deepEqual(audit.method.unsearched,[]);
 let slots=0,images=0;
 for(const n of nodes){const e=audit.entities[n.id];assert(e);assert.equal(e.atlasId,n.id);assert.equal(e.parentId,n.administrativeParentId);assert.equal(e.treeParentId,n.treeParentId);assert.equal(e.registryCode,n.registry?.code||null);
  for(const kind of ['coat','flag']){slots++;const i=e.symbols[kind];assert.equal(i.atlasId,n.id);assert.equal(i.kind,kind);assert(allowed.has(i.verdict));assert.deepEqual(i.existingImage,baseline[n.id][kind]);assert.deepEqual(i.recommendedImage,current[n.id][kind]);
   if(i.existingImage){images++;assert.equal(i.investigation.state,'COMPLETED_AVAILABLE_RESEARCH');assert(i.evidence.some(e=>e.type==='DOCUMENT_DISCOVERY_ONLY'));assert(i.rights.verdict);assert(i.graphicVersion);assert(i.identity.certifiedOSM===n.osmRelationId);}
   else {assert.equal(i.verdict,'MISSING');assert.equal(i.recommendedImage,null);}
  }
 }
 assert.equal(slots,8566);assert.equal(images,1824);assert.equal(report.results.examined,1824);
});
test('SIM-R5: only evidenced wrong-holder assignment removed; no resurrection through legacy fallback',()=>{
 const changed=[];
 for(const n of nodes)for(const kind of ['coat','flag'])if(JSON.stringify(current[n.id][kind])!==JSON.stringify(baseline[n.id][kind]))changed.push(n.id+':'+kind);
 assert.deepEqual(changed.sort(),['osm-r10494274:coat','osm-r1216705:flag','osm-r14772859:coat','osm-r19095396:flag']);
 const n=nodes.find(n=>n.id==='osm-r14772859');const i=audit.entities[n.id].symbols.coat;
 assert.equal(n.registry.code,'122613');assert.equal(n.registry.record.county_name,'JUDEȚUL NEAMȚ');
 assert.equal(i.verdict,'MISATTRIBUTED');assert.match(i.contradictions.join(' '),/Brăila/);
 assert.equal(coatImageForEntity(n,'/atlas/'),null);assert.equal(globalSymbolsForEntity(n).coat,null);
 assert.equal(withGlobalSymbols(n,{coat:baseline[n.id].coat,flag:null}).coat,null);
 assert.equal(applySymbolAudit(n,{coat:baseline[n.id].coat}).coat,null);
 assert.notEqual(symbolAuditFor('osm-r9882384','coat').verdict,'MISATTRIBUTED','Jilava filename IL is not proof of wrong county');
 assert.equal(audit.entities['osm-r10494274'].symbols.coat.verdict,'HISTORICAL_ONLY');
 assert.equal(audit.entities['osm-r9982547'].symbols.flag.verdict,'DISPUTED');assert(audit.entities['osm-r9982547'].symbols.flag.recommendedImage,'A contradictory historical label alone does not delete the image');
 for(const id of ['osm-r1216705','osm-r19095396']){
  const i=audit.entities[id].symbols.flag;assert.equal(i.verdict,'OUTDATED_VERSION');assert.equal(i.recommendedVerdict,'VERIFIED_OFFICIAL');
  assert.equal(createHash('sha256').update(read('public/'+i.recommendedImage.url)).digest('hex'),i.recommendedImageHashes.sha256);
  assert.equal(i.recommendedRights.verdict,'EXEMPT_OFFICIAL_ACT');assert.match(i.contradictions.join(' '),/white lower quarter/);
  assert.equal(withGlobalSymbols(nodes.find(n=>n.id===id),{coat:null,flag:baseline[id].flag}).flag.file,i.recommendedImage.file);
 }
});
test('SIM-R5: no automatic certification; official findings require documented act and graphic comparison',()=>{
 for(const e of Object.values(audit.entities))for(const i of Object.values(e.symbols)){
  if(i.verdict==='VERIFIED_OFFICIAL'){const proof=i.evidence.find(e=>e.type==='DOCUMENTED_DECISION');assert(proof?.act);assert(proof.graphicComparison);assert(proof.sources.every(s=>/^https:\/\//.test(s)));assert.equal(i.graphicVersion,'CURRENT_REPRESENTATION_CONFIRMED');}
  if(i.existingImage&&!i.changes.length)assert.deepEqual(i.recommendedImage,i.existingImage,'Missing acts must not delete images');
  if(i.imageHashes?.commonsReportedOriginalSHA1)assert.match(i.imageHashes.scope,/source-reported/);
  if(i.imageHashes?.download?.sha256)assert.equal(i.imageHashes.download.status,200);
 }
 const coat=audit.entities['osm-r1699033'].symbols.coat;
 assert.equal(coat.verdict,'VERIFIED_OFFICIAL');assert.equal(coat.rights.verdict,'RIGHTS_UNCLEAR','Authenticity does not clear reproduction rights');
 assert.equal(audit.entities['osm-r1699033'].symbols.flag.verdict,'SOURCE_CORROBORATED','Proportional differences must remain explicit');
 for(const [id,kind] of [['osm-r18822476','coat'],['osm-r9300562','flag']])assert.equal(audit.entities[id].symbols[kind].authenticity,'VILLAGE_VERSUS_COMMUNE_SCOPE_UNRESOLVED','Village decree does not certify the whole commune '+id);
});
test('SIM-R5: all 18 statistical entities have individual research and no borrowed symbols',()=>{
 assert.equal(report.statisticalRegions.length,18);
 for(const r of report.statisticalRegions){const e=audit.entities[r.atlasId];assert.notEqual(r.search,'NOT_STARTED');assert.equal(e.symbols.coat.recommendedImage,null);assert.equal(e.symbols.flag.recommendedImage,null);assert.equal(coatImageForEntity(nodes.find(n=>n.id===r.atlasId)),null);}
});
test('SIM-R5: every institutional access error has a recorded reinvestigation outcome',()=>{
 const access=gz('docs/audits/sim-r5/access-reinvestigation.json.gz');
 assert.equal(access.cases.length,1207);assert.equal(access.recovered+access.stillInaccessible,1207);
 assert.equal(new Set(access.cases.map(c=>c.atlasId+'|'+c.originalUrl)).size,1207,'An access case is an exact holder plus URL; seven holders have two failing URLs');
});
test('SIM-R5: reporting is computed from rows, including unresolved rights and exact SVG check',()=>{
 const rows=Object.values(audit.entities).flatMap(e=>Object.values(e.symbols));
 for(const[verdict,count]of Object.entries(report.results.verdicts))assert.equal(rows.filter(i=>i.verdict===verdict).length,count);
 assert.equal(rows.filter(i=>i.rights.verdict==='RIGHTS_UNCLEAR').length,report.results.rightsUnclear);
 const graphic=JSON.parse(read('docs/audits/sim-r5/graphic-checks.json'));assert(graphic.viewBox&&graphic.colours&&graphic.rectangles);assert.equal(graphic.sha256,audit.entities['osm-r90689'].symbols.flag.imageHashes.download.sha256);
 const manifest=JSON.parse(read('docs/audits/sim-r5/protected-files.json'));
 for(const file of manifest.files){const bytes=read(file.path);const actual=createHash('sha1').update('blob '+bytes.length+'\0').update(bytes).digest('hex');assert.equal(actual,file.blobSHA1,'Certified geography/legacy symbol changed: '+file.path);}
});
