import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validateHistoricalPeriod} from '../src/data/historicalAdminBridge.mjs';
import {
  projectGeodataHistoricalSourceCatalog,federatedHistoricalSourceOverview
} from '../src/data/historicalGeodataTemporal.mjs';
const base=new URL('../public/data/historical/v1/',import.meta.url);
const read=path=>JSON.parse(readFileSync(new URL(path,base),'utf8'));
const index=read('geodata/index.json');
const pilot=read('catalog.json');

test('OHM, HURI and undated Transilvania map into one source-qualified Historical model',()=>{
 const c=projectGeodataHistoricalSourceCatalog(index);
 assert.equal(c.schema,'atlas-historical-geodata-temporal-projection-v1');
 assert.equal(c.entities.length,290);
 assert.equal(c.versions.length,238);
 assert.equal(c.geometryUses.length,238);
 assert.equal(c.geometries.length,212);
 assert.equal(c.undatedGeometryReferences.length,52);
 assert.deepEqual([c.hierarchy.length,c.bridge.length,c.events.length,c.symbols.length],[0,0,0,0]);
 assert.equal(c.legalBoundariesCertified,false);
 for(const version of c.versions){
   assert.equal(validateHistoricalPeriod(version.period),true);
   assert.equal(version.evidenceStatus,'in_review');
   assert.equal(version.boundaryCertification,'not_certified');
 }
 for(const u of c.geometryUses)assert.ok(c.geometries.some(g=>g.geometryId===u.geometryId));
 for(const u of c.undatedGeometryReferences){
   assert.equal(u.reason,'NO_VALID_HISTORICAL_PERIOD');
   assert.equal(c.versions.some(v=>v.entityId===u.entityId),false);
 }
});
test('HistoGIS pilot and Geodata source catalog remain federated but not identity-merged',()=>{
 const proj=projectGeodataHistoricalSourceCatalog(index);
 const overview=federatedHistoricalSourceOverview(pilot,proj);
 assert.equal(overview.histogisEntities,53);
 assert.equal(overview.histogisVersions,54);
 assert.equal(overview.histogisGeometries,53);
 assert.equal(overview.geodataProvisionalEntities,290);
 assert.equal(overview.geodataDatedSourceVersions,238);
 assert.equal(overview.geodataUndatedGeometryReferences,52);
 assert.equal(overview.geodataGeometryAssets,212);
 assert.equal(overview.qualifiedCrossCatalogueIdentityLinks,0);
 assert.equal(overview.historicalHierarchyMerge,'prohibited_without_independent_evidence');
});
test('source-only projection fails closed on forged evidence promotion',()=>{
 const copy=structuredClone(index);
 copy.entries[150].status='legal_boundary_certified';
 assert.throws(()=>projectGeodataHistoricalSourceCatalog(copy),/invalid/);
});
