import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
const read=p=>readFileSync(new URL('../'+p,import.meta.url));
const json=p=>JSON.parse(read(p));
const dir='docs/audits/web-maintenance/';
test('Maintenance snapshot refers to certified evidence and distinguishes technical checks from screen-reader use',()=>{
 const b=json(dir+'baseline.json'),h=json(dir+'operational-health.json');
 assert.match(b.certifiedSHA,/^[a-f0-9]{40}$/);assert.equal(b.prs.length,3);assert.equal(new Set(b.prs.map(p=>p.number)).size,3);assert(b.prs.every(p=>p.merged));assert.equal(b.prs.find(p=>p.number===84).mergeCommit,b.certifiedSHA);
 for(const p of [b.certificationManifest,b.protectedInputsManifest,b.historicalValidation])assert(existsSync(new URL('../'+p,import.meta.url)),p);
 assert.equal(b.certifiedCI.sha,b.certifiedSHA);assert.equal(b.certifiedCI.conclusion,'success');assert.equal(b.buildArtifact.name,'website-dist');assert.equal(b.referenceDate,'2026-10-05');
 const live=json(dir+h.liveEvidence);assert.equal(live.screenReaderActuallyUsed,false);assert.equal(h.assistiveTechnology.status,'ASSISTIVE_TECH_VALIDATION_PENDING');assert.equal(h.fullWCAGConformanceClaim,false);assert.equal(h.assistiveTechnology.installationOrPersonalSettingsChanges,false);
 const protocol=read(dir+'assistive-technology-checklist.md').toString();assert.match(protocol,/NVDA\+Space/);assert.match(protocol,/VO\+U/);assert.equal((protocol.match(/\| AT\d\d \|/g)||[]).length,17);assert.equal((protocol.match(/\| NEEXECUTAT \| PENDING \|/g)||[]).length,17);
 const allowed=new Set(['VERIFIED_HEALTHY','FIXED_AND_VERIFIED','NO_ACTION_REQUIRED','ASSISTIVE_TECH_VALIDATION_PENDING','EXTERNAL_DEPENDENCY_LIMITATION','BLOCKED_WITH_EVIDENCE']);assert(h.findings.every(f=>allowed.has(f.status)&&f.evidence&&f.owner));assert.equal(new Set(h.findings.map(f=>f.id)).size,h.findings.length);
});
test('Maintenance closure evidence hashes and isolated external-failure observations reconcile without replacing canonical manifests',()=>{
 const m=json(dir+'closure-manifest.json'),h=json(dir+'operational-health.json'),live=json(dir+h.liveEvidence);
 assert.equal(m.protectedInputs.manifest,'docs/audits/web-audit-5/integrity-5a.json');assert.equal(m.protectedInputs.allUnchanged,true);
 for(const f of m.evidence){assert(f.path.startsWith(dir)||f.path==='scripts/audit/web-maintenance/verify-live.mjs');assert.equal(createHash('sha256').update(read(f.path)).digest('hex'),f.sha256,f.path);}
 assert.equal(live.widths.length,2);assert(live.widths.every(w=>w.moduleNames.length===6&&w.escapeFocusReturned&&w.permalinkRestored&&w.searchExactID==='osm-r2248660'));
 assert.equal(live.dependencies.syntheticHTTPStatus,503);assert.equal(live.dependencies.neutralCoatNoFlagSubstitution,true);assert.equal(live.dependencies.localVectorCatalogUnaffected,true);assert(live.dependencies.requests.some(r=>r.url.includes('upload.wikimedia.org')));assert(live.dependencies.requests.some(r=>r.url.includes('tile.openstreetmap.org')));assert.equal(live.dependencies.sourceDocument.syntheticStatus,503);
 assert.equal(m.workflowChanged,false);assert.equal(m.applicationChanged,false);assert.equal(m.dependenciesChanged,false);assert.equal(m.postMergeEvidenceInInitialCommit,false);
});
