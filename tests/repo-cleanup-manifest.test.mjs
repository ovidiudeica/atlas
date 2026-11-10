import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { deletionDecision } from '../scripts/audit/repo-cleanup/deletion-policy.mjs';
const read = p => readFileSync(new URL('../' + p, import.meta.url)), json = p => JSON.parse(read(p)), d = 'docs/audits/repo-cleanup/';
test('RC snapshot inventories every branch with one decision and preserves unmerged originals', () => { const b = json(d + 'branches-before.json'), v = json(d + 'branch-decisions.json'), m = json(d + 'preservation-manifest.json'), c = json(d + 'commit-index.json'); assert.equal(b.branches.length, b.counts.branches); assert.equal(new Set(b.branches.map(x => x.name)).size, b.branches.length); assert.equal(v.branches.length, b.branches.length); assert.equal(v.branches.find(x => x.name === 'main').verdict, 'PROTECTED_KEEP'); const valid = new Set(['PROTECTED_KEEP', 'MERGED_EXACT_DELETE_ELIGIBLE', 'SQUASH_RECONCILED_DELETE_ELIGIBLE', 'UNIQUE_HISTORY_PRESERVE', 'ACTIVE_WORK_KEEP', 'UNCERTAIN_KEEP']); for (const row of v.branches) {
    assert(valid.has(row.verdict));
    assert.equal(b.branches.find(x => x.name === row.name).headSHA, row.headSHA);
} assert.equal(m.eligibleBranches.length + m.mustKeep.length, b.branches.length); for (const row of m.eligibleBranches) {
    const r = v.branches.find(x => x.name === row.name);
    assert(r.proof.verified && r.proof.integratedCommitReachableFromMain && r.proof.treeEquivalent);
    assert.equal(row.headSHA, r.headSHA);
} for (const row of v.branches.filter(x => x.verdict === 'UNIQUE_HISTORY_PRESERVE'))
    assert(row.uniqueFileEvidence.some(f => f.mainObject === null)); assert.equal(c.count, c.commits.length); const ids = new Set(c.commits.map(x => x.sha)); for (const row of b.branches)
    for (const id of row.relationship.uniqueToMain)
        assert(ids.has(id)); assert.equal(m.archivePlan.status, 'PLANNED_NOT_YET_CREATED'); assert.equal(m.destructiveOperationsExecuted, 0); });
test('RC proof hashes and repository-content snapshot remain coherent without locking future application development', () => { const m = json(d + 'preservation-manifest.json'), files = json(d + 'tracked-files-before.json'), r = json(d + 'repository-file-review.json'); for (const f of m.proofFiles)
    assert.equal(createHash('sha256').update(read(f.path)).digest('hex'), f.sha256, f.path); assert.equal(files.files.length, r.trackedFiles); assert.equal(new Set(files.files.map(f => f.path)).size, files.files.length); assert(files.files.every(f => /^[a-f0-9]{40}$/.test(f.gitBlob) && /^[a-f0-9]{64}$/.test(f.sha256))); assert.deepEqual(r.filesApprovedForRemoval, []); assert.equal(r.workflowReview.decision, 'KEEP_UNCHANGED'); assert.equal(r.dependencyReview.decision, 'KEEP_UNCHANGED'); assert.equal(m.existingTags.length, json(d + 'baseline.json').counts.tags); });
const good = () => { const a = { name: 'fixture/reconciled', headSHA: 'a'.repeat(40), protected: false, verdict: 'SQUASH_RECONCILED_DELETE_ELIGIBLE', proof: { originalTree: 'b'.repeat(40), integratedTree: 'b'.repeat(40), verified: true, integratedCommitReachableFromMain: true, mainAncestor: false } }; return { audited: a, observed: { name: a.name, headSHA: a.headSHA, protected: false, openPRCount: 0, activeWork: false }, preservation: { headSHA: a.headSHA, remoteTagVerified: true, headReachable: true, ref: 'refs/tags/archive/fixture', commitSHA: 'c'.repeat(40) }, manifest: { validated: true, sha256: 'd'.repeat(64), entries: [{ name: a.name, headSHA: a.headSHA }] } }; };
test('RC delete gate accepts only an explicit, reconciled, unchanged and durably preserved reference', () => { assert.equal(deletionDecision(good()).allowed, true); assert.equal(deletionDecision().allowed, false); for (const mutate of [x => x.audited.name = 'main', x => x.observed.headSHA = 'e'.repeat(40), x => x.observed.protected = true, x => x.observed.openPRCount = 1, x => x.observed.activeWork = true, x => x.preservation.remoteTagVerified = false, x => x.preservation.headReachable = false, x => x.manifest.entries = [], x => x.audited.proof.integratedTree = 'f'.repeat(40), x => x.audited.verdict = 'UNIQUE_HISTORY_PRESERVE', x => delete x.observed.openPRCount]) {
    const x = good();
    mutate(x);
    assert.equal(deletionDecision(x).allowed, false);
} });
