/** Pure, fail-closed per-reference safety policy. No network or deletion side effects. */
export function deletionDecision({ audited, observed, preservation, manifest } = {}) {
    const reasons = [];
    const eligible = new Set(['MERGED_EXACT_DELETE_ELIGIBLE', 'SQUASH_RECONCILED_DELETE_ELIGIBLE']);
    if (!audited || audited.name === 'main')
        reasons.push('MAIN_OR_MISSING_AUDIT');
    if (!eligible.has(audited?.verdict))
        reasons.push('NOT_DELETE_ELIGIBLE');
    if (!manifest?.validated || !/^[a-f0-9]{64}$/.test(manifest?.sha256 || ''))
        reasons.push('MANIFEST_NOT_VALIDATED');
    if (!manifest?.entries?.some(e => e.name === audited?.name && e.headSHA === audited?.headSHA))
        reasons.push('NOT_IN_EXPLICIT_EXACT_SHA_LIST');
    if (observed?.name !== audited?.name || observed?.headSHA !== audited?.headSHA)
        reasons.push('REMOTE_HEAD_CHANGED_OR_MISSING');
    if (observed?.protected !== false || audited?.protected === true)
        reasons.push('PROTECTION_NOT_CLEARED');
    if (observed?.openPRCount !== 0)
        reasons.push('OPEN_PR_OR_UNKNOWN_PR_STATE');
    if (observed?.activeWork !== false)
        reasons.push('ACTIVE_OR_UNCHECKED_WORK');
    const p = audited?.proof;
    const sameTree = /^[a-f0-9]{40}$/.test(p?.originalTree || '') && p.originalTree === p.integratedTree;
    if (!p?.verified || !p?.integratedCommitReachableFromMain || !(p?.mainAncestor || sameTree))
        reasons.push('INTEGRATION_EQUIVALENCE_NOT_PROVEN');
    if (preservation?.headSHA !== audited?.headSHA || preservation?.remoteTagVerified !== true || preservation?.headReachable !== true || !/^refs\/tags\/archive\//.test(preservation?.ref || '') || !/^[a-f0-9]{40}$/.test(preservation?.commitSHA || ''))
        reasons.push('ORIGINAL_HISTORY_NOT_DURABLY_ANCHORED');
    return { allowed: reasons.length === 0, reasons };
}
