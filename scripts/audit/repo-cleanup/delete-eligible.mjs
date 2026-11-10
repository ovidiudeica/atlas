/** Explicit per-ref deletion with fresh gates and an oldOID pre-push CAS guard. Never runs on import/CI. */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { readFileSync, existsSync } from 'node:fs';
import { execFileSync, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import { deletionDecision } from './deletion-policy.mjs';
const root = fileURLToPath(new URL('../../../', import.meta.url));
process.chdir(root);
const out = resolve(root, '../../outputs/REPO-CLEANUP'), hash = b => createHash('sha256').update(b).digest('hex'), json = async (p) => JSON.parse((await readFile(p, 'utf8')).replace(/^\uFEFF/, ''));
if (process.argv.includes('--hook')) {
    const c = JSON.parse(readFileSync(process.env.ATLAS_RC_CONTROL, 'utf8')), bytes = readFileSync(c.preManifestPath);
    assert.equal(hash(bytes), c.manifest.sha256);
    const lines = readFileSync(0, 'utf8').trim().split(/\r?\n/).filter(Boolean);
    assert.equal(lines.length, 1, 'Exactly one explicitly audited deletion per push');
    for (const line of lines) {
        const [localRef, localOID, remoteRef, remoteOID] = line.split(/\s+/);
        assert.equal(localRef, '(delete)');
        assert.equal(localOID, '0'.repeat(40));
        assert.equal(remoteRef, 'refs/heads/' + c.audited.name);
        assert.equal(remoteOID, c.audited.headSHA, 'Advertised oldOID changed; deletion refused');
        const gate = deletionDecision({ ...c, observed: { ...c.observed, headSHA: remoteOID } });
        assert(gate.allowed, gate.reasons.join(','));
        console.log('RC_PRE_PUSH_GUARD_OK', remoteRef, remoteOID);
    }
    process.exit(0);
}
if (!process.argv.includes('--apply'))
    throw Error('Explicit --apply required. No deletion performed.');
await mkdir(out, { recursive: true });
const git = (...a) => execFileSync('git', a, { encoding: 'utf8', maxBuffer: 50e6, timeout: 120000 }).trim(), api = p => JSON.parse(execFileSync('C:/Program Files/GitHub CLI/gh.exe', ['api', 'repos/ovidiudeica/atlas/' + p], { encoding: 'utf8', maxBuffer: 30e6, timeout: 60000 }));
assert.equal(git('remote', 'get-url', 'origin'), 'https://github.com/ovidiudeica/atlas.git');
const prePath = join(out, 'pre-deletion-manifest.json'), preBytes = await readFile(prePath), pre = JSON.parse(preBytes), preHash = hash(preBytes), source = await json(pre.sourceManifest);
assert.equal(hash(await readFile(pre.sourceManifest)), pre.sourceManifestSHA256);
assert.equal(hash(await readFile(join(out, 'preservation-confirmation.json'))), pre.preservationConfirmationSHA256);
const pr = api('pulls/' + pre.pr);
assert(pr.merged && pr.merge_commit_sha === pre.mainSHA);
assert(pr.body.includes(preHash), 'Exact pre-deletion manifest hash must already be published in PR');
for (const e of pre.entries)
    assert(pr.body.includes(e.name) && pr.body.includes(e.headSHA), 'Published exact list missing ' + e.name);
assert.equal(new Set(pre.entries.map(e => e.name)).size, pre.entries.length);
for (const e of pre.entries) {
    assert(!pre.mustKeep.some(k => k.name === e.name));
    const listed = source.eligibleBranches.some(a => a.name === e.name && a.headSHA === e.headSHA);
    assert(listed || (e.name === source.temporaryCleanupBranch.name && e.headSHA === pr.head.sha), 'Not in original or authorized self supplement');
}
const tagRemote = () => { const a = new Map(git('ls-remote', '--tags', 'origin', pre.preservationRef, pre.preservationRef + '^{}').split(/\r?\n/).filter(Boolean).map(s => { const [sha, r] = s.split(/\s+/); return [r, sha]; })); assert.equal(a.get(pre.preservationRef), pre.tagObjectSHA); assert.equal(a.get(pre.preservationRef + '^{}'), pre.archiveCommitSHA); };
async function activeWork(name) { const blocks = git('worktree', 'list', '--porcelain').split(/\r?\n\r?\n/); for (const b of blocks) {
    const lines = b.split(/\r?\n/), branch = lines.find(s => s.startsWith('branch refs/heads/'))?.slice(18);
    if (branch !== name)
        continue;
    const path = lines.find(s => s.startsWith('worktree ')).slice(9), raw = execFileSync('git', ['-C', path, 'status', '--porcelain=v1', '-z'], { encoding: 'utf8', maxBuffer: 20e6 }).split('\0').filter(Boolean);
    if (raw.some(s => s.startsWith('??') || s.startsWith('R') || s.startsWith(' R')))
        return true;
    for (const s of raw) {
        const file = s.slice(3);
        if (!existsSync(join(path, file)))
            return true;
        const a = await readFile(join(path, file)), h = execFileSync('git', ['-C', path, 'show', 'HEAD:' + file], { maxBuffer: 40e6 });
        if (!a.equals(h))
            return true;
    }
    if (spawnSync('git', ['-C', path, 'diff', '--cached', '--quiet']).status !== 0)
        return true;
} return false; }
const hooks = resolve(root, 'work/repo-cleanup-hooks');
await mkdir(hooks, { recursive: true });
const priorHooks = spawnSync('git', ['config', '--get', 'core.hooksPath'], { encoding: 'utf8' }).stdout.trim(), priorHook = git('rev-parse', '--git-path', 'hooks/pre-push');
assert(!priorHooks && !existsSync(priorHook), 'An existing pre-push hook requires explicit reviewed chaining; do not bypass it');
const quote = s => "'" + s.replace(/'/g, "'\\''") + "'";
await writeFile(join(hooks, 'pre-push'), '#!/bin/sh\n' + quote(process.execPath) + ' ' + quote(fileURLToPath(import.meta.url)) + ' --hook "$@"\n', { mode: 0o755 });
const journalPath = join(out, 'deletion-log.json');
let journal = existsSync(journalPath) ? await json(journalPath) : { stage: 'REPO-CLEANUP', startedAt: new Date().toISOString(), preDeletionManifestSHA256: preHash, archiveRef: pre.preservationRef, attempts: [] };
assert.equal(journal.preDeletionManifestSHA256, preHash);
const save = () => writeFile(journalPath, JSON.stringify(journal, null, 2) + '\n');
await save();
const entries = [...pre.entries.filter(e => e.name !== pre.ownBranchLast), ...pre.entries.filter(e => e.name === pre.ownBranchLast)];
for (const audited of entries) {
    if (journal.attempts.some(r => r.name === audited.name && r.result === 'DELETED'))
        continue;
    if (audited.name === pre.ownBranchLast && !journal.selfDeletionCheckpoint) {
        const file = 'pre-self-deletion-log.json', bytes = Buffer.from(JSON.stringify(journal, null, 2) + '\n');
        await writeFile(join(out, file), bytes);
        journal.selfDeletionCheckpoint = { file, sha256: hash(bytes), createdAt: new Date().toISOString() };
        await save();
    }
    const row = { name: audited.name, auditedSHA: audited.headSHA, verdict: audited.verdict, integrationCommit: audited.proof.integrationCommit, startedAt: new Date().toISOString(), result: 'CHECKING', checks: {} };
    journal.attempts.push(row);
    await save();
    try {
        if (audited.name === pre.ownBranchLast) {
            const checkpoint = journal.selfDeletionCheckpoint;
            assert.equal(hash(await readFile(join(out, checkpoint.file))), checkpoint.sha256);
            const latest = api('pulls/' + pre.pr);
            if (!latest.body.includes(checkpoint.sha256)) {
                row.result = 'WAITING_SELF_ATTESTATION';
                row.reason = 'Publish immutable pre-self checkpoint hash/results in merged PR before self deletion, then resume --apply.';
                console.log(row.result, checkpoint.sha256);
                continue;
            }
        }
        tagRemote();
        row.checks.archiveStillPublished = true;
        assert.equal(spawnSync('git', ['merge-base', '--is-ancestor', audited.headSHA, pre.archiveCommitSHA]).status, 0);
        let branch;
        try {
            branch = api('branches/' + encodeURIComponent(audited.name));
        }
        catch (e) {
            row.result = 'SKIPPED_REMOTE_UNREADABLE_OR_ABSENT';
            row.reason = String(e.stderr || e.message).slice(0, 1500);
            continue;
        }
        let open = [], page = 1;
        for (;; page++) {
            const a = api('pulls?state=open&head=' + encodeURIComponent('ovidiudeica:' + audited.name) + '&per_page=100&page=' + page);
            open.push(...a);
            if (a.length < 100)
                break;
        }
        const observed = { name: branch.name, headSHA: branch.commit.sha, protected: branch.protected, openPRCount: open.length, activeWork: await activeWork(audited.name) };
        row.confirmedBeforeDeleteSHA = observed.headSHA;
        row.checkedAt = new Date().toISOString();
        row.checks.observed = observed;
        const control = { audited, observed, preservation: { headSHA: audited.headSHA, remoteTagVerified: true, headReachable: true, ref: pre.preservationRef, commitSHA: pre.archiveCommitSHA }, manifest: { validated: true, sha256: preHash, entries: pre.entries }, preManifestPath: prePath };
        const gate = deletionDecision(control);
        if (!gate.allowed) {
            row.result = 'SKIPPED_GATE_FAILED';
            row.reason = gate.reasons;
            continue;
        }
        const controlPath = join(out, 'current-delete-control.json');
        await writeFile(controlPath, JSON.stringify(control, null, 2) + '\n');
        const env = { ...process.env, ATLAS_RC_CONTROL: controlPath };
        if (!journal.preflight) {
            const r = spawnSync('git', ['-c', 'core.hooksPath=' + hooks, 'push', '--dry-run', 'origin', '--delete', audited.name], { encoding: 'utf8', env, timeout: 120000 });
            const log = (r.stdout || '') + (r.stderr || '');
            assert.equal(r.status, 0, log);
            assert(log.includes('RC_PRE_PUSH_GUARD_OK'), 'Dry-run did not execute guard');
            assert.equal(git('ls-remote', '--heads', 'origin', 'refs/heads/' + audited.name).split(/\s+/)[0], audited.headSHA);
            journal.preflight = { name: audited.name, sha: audited.headSHA, checkedAt: new Date().toISOString(), dryRunOnly: true, remoteUnchanged: true, guardExecuted: true, output: log };
            await save();
        }
        row.result = 'ATTEMPTING_DELETE';
        await save();
        const r = spawnSync('git', ['-c', 'core.hooksPath=' + hooks, 'push', 'origin', '--delete', audited.name], { encoding: 'utf8', env, timeout: 120000 });
        const log = (r.stdout || '') + (r.stderr || '');
        row.exitCode = r.status;
        row.output = log;
        row.prePushGuardExecuted = log.includes('RC_PRE_PUSH_GUARD_OK');
        if (r.status !== 0) {
            row.result = 'DELETE_FAILED';
            row.reason = 'Git refused or network failed; never retried by forcing';
            continue;
        }
        assert(row.prePushGuardExecuted, 'Guard evidence missing');
        const still = git('ls-remote', '--heads', 'origin', 'refs/heads/' + audited.name);
        if (still) {
            row.result = 'DELETE_NOT_CONFIRMED_OR_RECREATED';
            row.remainingRef = still;
        }
        else {
            row.result = 'DELETED';
            row.deletedAt = new Date().toISOString();
        }
        console.log(row.result, audited.name, audited.headSHA);
    }
    catch (e) {
        row.result = row.result === 'ATTEMPTING_DELETE' ? 'OUTCOME_REQUIRES_RECONCILIATION' : 'SKIPPED_GATE_ERROR';
        row.reason = String(e.stack || e.message).slice(0, 2000);
        console.error(row.result, audited.name, row.reason);
    }
    finally {
        row.finishedAt = new Date().toISOString();
        await save();
    }
    await new Promise(r => setTimeout(r, 250));
}
journal.completedAt = new Date().toISOString();
await save();
console.log('Deletion loop complete', journal.attempts.reduce((o, r) => (o[r.result] = (o[r.result] || 0) + 1, o), {}), 'Final independent inventory still required.');
