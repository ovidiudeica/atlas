import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validateHistoricalPeriod} from '../src/data/historicalAdminBridge.mjs';
import {projectGeodataHistoricalSourceCatalog} from '../src/data/historicalGeodataTemporal.mjs';

const base=new URL('../public/data/historical/v1/geodata/',import.meta.url);
const index=JSON.parse(readFileSync(new URL('index.json',base),'utf8'));

test('OHM source groups yield provisional entities, 139 dated versions and 125 geometry assets',()=>{
 const p=projectGeodataHistoricalSourceCatalog(index);
 assert.equal(p.schema,'atlas-historical-geodata-temporal-projection-v1');
 assert.deepEqual(p.sourceFamilies,['OHM']);
 assert.equal(p.entities.length,76);
 assert.equal(p.versions.length,139);
 assert.equal(p.geometryUses.length,139);
 assert.equal(p.geometries.length,125);
 assert.equal(p.undatedGeometryReferences.length,0);
 assert.equal(new Set(p.versions.map(v=>v.entityId)).size,p.entities.length);
 assert.ok(p.entities.every(e=>e.groupingBasis==='editorial_directory_only' &&
   e.institutionalContinuityQualified===false));
 assert.deepEqual([p.hierarchy,p.bridge,p.events,p.symbols],[[],[],[],[]]);
 assert.equal(p.legalBoundariesCertified,false);
 for(const v of p.versions){
   assert.equal(validateHistoricalPeriod(v.period),true);
   assert.equal(v.evidenceStatus,'in_review');
   assert.equal(v.boundaryCertification,'not_certified');
 }
 for(const u of p.geometryUses)assert.ok(p.geometries.some(g=>g.geometryId===u.geometryId));
});

test('OHM grouping preserves multiple source versions without claiming historical continuity',()=>{
 const p=projectGeodataHistoricalSourceCatalog(index);
 const group=index.entries.filter(x=>x.sourceGroup==='Regatul României');
 assert.equal(group.length,9);
 const ids=new Set(group.map(e=>p.versions.find(v=>v.sourceIds.includes(e.id))?.entityId));
 assert.equal(ids.size,1);
 assert.equal(p.hierarchy.length,0);
 assert.equal(p.crossModuleIdentityQualified,0);
});

test('OHM-only projection refuses fictional certificate or other families',()=>{
 const copy=structuredClone(index);
 copy.entries[0].status='legal_boundary_certified';
 assert.throws(()=>projectGeodataHistoricalSourceCatalog(copy),/invalid/);
 const copy2=structuredClone(index);
 copy2.entries[0].sourceFamily='HURI';
 assert.throws(()=>projectGeodataHistoricalSourceCatalog(copy2),/invalid/);
});
