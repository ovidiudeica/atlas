/** Explicit phase-C preparation. Creates ONE new archival tag; never rewrites/deletes refs. */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { execFileSync, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
const root = fileURLToPath(new URL('../../../', import.meta.url));
process.chdir(root);
const args = process.argv.slice(2), apply = args.includes('--apply'), prNumber = Number(args[args.indexOf('--pr') + 1]);
if (!apply || !Number.isInteger(prNumber) || prNumber < 1)
    throw Error('Explicit --apply --pr NUMBER required; no operation performed.');
const out = resolve(root, '../../outputs/REPO-CLEANUP');
await mkdir(out, { recursive: true });
const hash = b => createHash('sha256').update(b).digest('hex'), json = async (p) => JSON.parse((await readFile(p, 'utf8')).replace(/^\uFEFF/, ''));
const git = (...a) => execFileSync('git', a, { encoding: 'utf8', maxBuffer: 40e6, timeout: 120000 }).trim(), api = p => JSON.parse(execFileSync('C:/Program Files/GitHub CLI/gh.exe', ['api', 'repos/ovidiudeica/atlas/' + p], { encoding: 'utf8', maxBuffer: 40e6, timeout: 60000 }));
assert.equal(git('remote', 'get-url', 'origin'), 'https://github.com/ovidiudeica/atlas.git');
const manifestPath = 'docs/audits/repo-cleanup/preservation-manifest.json', manifestBytes = await readFile(manifestPath), m = JSON.parse(manifestBytes), manifestHash = hash(manifestBytes);
for (const f of m.proofFiles)
    assert.equal(hash(await readFile(f.path)), f.sha256, f.path);
const pr = api('pulls/' + prNumber), main = api('branches/main'), sha = main.commit.sha;
assert(pr.merged && pr.base.ref === 'main' && pr.head.ref === m.temporaryCleanupBranch.name);
assert.equal(pr.merge_commit_sha, sha, 'Main moved: new release evidence required');
assert(main.protected);
assert.equal(git('rev-parse', 'origin/main'), sha, 'Fetch main before preparation');
assert.equal(git('diff', '--name-only', 'HEAD', 'origin/main'), '');
assert.equal(git('rev-parse', pr.head.sha + '^{tree}'), git('rev-parse', sha + '^{tree}'), 'Cleanup self tree equivalence');
const phase = await json(join(out, 'phase-b-validation.json'));
assert.equal(phase.mainSHA, sha);
assert(phase.ciPassed && phase.pagesPassed && phase.publishedHashesMatch && phase.liveMaintenancePassed && phase.liveExportsPassed, 'Phase B not verified');
for (const f of phase.evidenceHashes)
    assert.equal(hash(await readFile(join(out, f.file))), f.sha256, f.file);
const run = api('actions/runs/' + phase.ciRun);
assert.equal(run.head_sha, sha);
assert.equal(run.conclusion, 'success');
const jobs = api('actions/runs/' + phase.ciRun + '/jobs').jobs;
for (const name of ['Build and verify website', 'Deploy GitHub Pages'])
    assert.equal(jobs.find(j => j.name === name)?.conclusion, 'success', name);
assert(jobs.find(j => j.name === 'Build and verify website').steps.every(s => s.conclusion === 'success'), 'Every mandatory verification step must have executed');
const cert = await json('docs/audits/web-audit-5/integrity-5a.json');
for (const f of cert.files)
    assert.equal(hash(await readFile(f.path)), f.sha256, f.path);
const source = await json('docs/audits/repo-cleanup/branch-decisions.json'), ref = m.archivePlan.ref, short = ref.replace(/^refs\/tags\//, ''), heads = m.archivePlan.originalHeadsToConserve.map(b => b.sha), all = [...new Set([sha, ...heads, pr.head.sha])], independent = git('merge-base', '--independent', ...all).split(/\r?\n/), parents = [sha, ...independent.filter(p => p !== sha)];
const remoteTags = () => new Map(git('ls-remote', '--tags', 'origin').split(/\r?\n/).filter(Boolean).map(s => { const [oid, r] = s.split(/\s+/); return [r, oid]; }));
let rem = remoteTags();
for (const t of m.existingTags) {
    assert.equal(rem.get(t.ref), t.objectSHA, t.ref);
    assert.equal(rem.get(t.ref + '^{}') || rem.get(t.ref), t.peeledCommit);
}
let archive, tagObject, resumed = false;
const message = 'Atlas repository cleanup archival DAG anchor\n\nBase ' + m.baseMain + '\nIntegrated cleanup ' + sha + '\nPre-cleanup manifest SHA256 ' + manifestHash + '\n\nTree equals integrated main. Additional parents preserve original branch histories only; no old code was merged into main.\n' + m.archivePlan.originalHeadsToConserve.map(b => b.name + ' ' + b.sha).join('\n') + '\nCleanup PR head ' + pr.head.sha + '\n';
if (rem.has(ref)) {
    resumed = true;
    git('fetch', 'origin', ref + ':' + ref);
    tagObject = rem.get(ref);
    archive = git('rev-parse', ref + '^{}');
    assert(git('cat-file', '-p', ref).includes(manifestHash), 'Existing archive tag has a different audit; never replace it');
    assert.equal(git('rev-parse', archive + '^{tree}'), git('rev-parse', sha + '^{tree}'));
}
else {
    assert.equal(spawnSync('git', ['show-ref', '--verify', '--quiet', ref]).status, 1, 'Local tag collision; never replace it');
    const file = join(out, 'archive-message.txt');
    await writeFile(file, message);
    archive = git('commit-tree', git('rev-parse', sha + '^{tree}'), ...parents.flatMap(p => ['-p', p]), '-F', file);
    git('tag', '-a', short, archive, '-F', file);
    git('push', 'origin', ref);
    rem = remoteTags();
    tagObject = git('rev-parse', ref);
    assert.equal(rem.get(ref), tagObject);
    assert.equal(rem.get(ref + '^{}'), archive);
}
const publishedTag = api('git/tags/' + tagObject), publishedCommit = api('git/commits/' + archive);
assert.equal(publishedTag.object.sha, archive);
assert.equal(publishedCommit.tree.sha, git('rev-parse', sha + '^{tree}'));
assert.deepEqual([...publishedCommit.parents.map(p => p.sha)].sort(), [...git('show', '-s', '--format=%P', archive).split(' ')].sort());
for (const head of all)
    assert.equal(spawnSync('git', ['merge-base', '--is-ancestor', head, archive]).status, 0, head);
const commits = await json('docs/audits/repo-cleanup/commit-index.json');
for (const c of commits.commits)
    assert.equal(spawnSync('git', ['merge-base', '--is-ancestor', c.sha, archive]).status, 0, c.sha);
const confirmation = { createdOrVerifiedAt: new Date().toISOString(), resumedExistingAnchor: resumed, ref, tagObjectSHA: tagObject, archiveCommitSHA: archive, archiveTreeSHA: publishedCommit.tree.sha, mainSHA: sha, parents: publishedCommit.parents.map(p => p.sha), remoteTagVerified: true, remoteCommitMetadataVerified: true, headsVerified: all.length, originalNonMainCommitsVerified: commits.count, originalTagsPreserved: m.existingTags.length, preCleanupManifestSHA256: manifestHash, method: 'One new unsigned annotated tag on an explicitly synthetic archival commit; main history unchanged, remote object/parents verified independently, all original DAG ancestry checked. No file copies or old code integrated into main.' };
await writeFile(join(out, 'preservation-confirmation.json'), JSON.stringify(confirmation, null, 2) + '\n');
const entries = m.eligibleBranches.map(e => { const a = source.branches.find(b => b.name === e.name); assert(a.proof.verified && a.proof.originalTree === a.proof.integratedTree); return { ...a, protected: false }; });
entries.push({ name: pr.head.ref, headSHA: pr.head.sha, protected: false, verdict: 'SQUASH_RECONCILED_DELETE_ELIGIBLE', proof: { originalTree: git('rev-parse', pr.head.sha + '^{tree}'), integratedTree: git('rev-parse', sha + '^{tree}'), integrationCommit: sha, mergedPR: prNumber, headMatchesMergedPR: true, integratedCommitReachableFromMain: true, treeEquivalent: true, mainAncestor: false, verified: true, method: 'Cleanup self complete tree equivalence after protected merge' }, reason: 'Explicitly authorized temporary branch, integrated and its original head conserved in the verified remote archive; delete last.' });
const pre = { stage: 'REPO-CLEANUP', validatedAt: new Date().toISOString(), status: 'VALIDATED_AWAITING_FRESH_PER_REFERENCE_GATES', pr: prNumber, mainSHA: sha, sourceManifest: manifestPath, sourceManifestSHA256: manifestHash, preservationRef: ref, archiveCommitSHA: archive, tagObjectSHA: tagObject, preservationConfirmationSHA256: hash(await readFile(join(out, 'preservation-confirmation.json'))), entries, mustKeep: m.mustKeep, ownBranchLast: pr.head.ref, actualDeletionsAtCreation: 0 };
await writeFile(join(out, 'pre-deletion-manifest.json'), JSON.stringify(pre, null, 2) + '\n');
console.log('Remote archival anchor verified:', ref, tagObject, archive, 'heads', all.length, 'original commits', commits.count, 'explicit deletion entries', entries.length, 'NO BRANCH DELETED');
