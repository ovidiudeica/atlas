import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const workflow=readFileSync(new URL('../.github/workflows/website.yml',import.meta.url),'utf8');
test('WEB-R3 Pages deploy: main workflows serialize without cancelling in-progress deployment',()=>{
  assert.match(workflow,/concurrency:\s*\n\s*group: atlas-website-\$\{\{ github\.ref \}\}\s*\n\s*cancel-in-progress: false/);
  assert.match(workflow,/pull_request:\s*\n\s*branches: \[main\]/);
  assert.match(workflow,/push:\s*\n\s*branches: \[main\]/);
  assert.match(workflow,/needs: verify/);
  assert.match(workflow,/if: github\.event_name != 'pull_request'/);
});
test('WEB-R3 Pages deploy: artifact name uniquely matches workflow run and attempt',()=>{
  const expected='github-pages-${{ github.run_id }}-${{ github.run_attempt }}';
  assert.equal(workflow.split(expected).length-1,3,
    'one upload-pages-artifact name and two guarded deploy-pages artifact_name values must match');
  assert.match(workflow,/uses: actions\/upload-pages-artifact@v3\s*\n\s*with:\s*\n\s*name: github-pages-/);
  assert.match(workflow,/uses: actions\/deploy-pages@v4(?:\s*\n\s*continue-on-error: true)?\s*\n\s*with:\s*\n\s*artifact_name: github-pages-/);
  assert.equal(workflow.split('uses: actions/upload-pages-artifact@v3').length-1,1,
    'Pages artifact must be uploaded exactly once per workflow attempt');
  assert.equal(workflow.split('uses: actions/deploy-pages@v4').length-1,2,
    'Pages may be deployed initially and retried at most once');
  assert.match(workflow,/- id: deployment\s*\n\s*uses: actions\/deploy-pages@v4\s*\n\s*continue-on-error: true/);
  assert.match(workflow,/- id: deployment_retry\s*\n\s*if: steps\.deployment\.outcome == 'failure'\s*\n\s*uses: actions\/deploy-pages@v4/);
  assert.match(workflow,/- name: Allow Pages artifact metadata to become visible\s*\n\s*run: sleep 15/);
  assert.match(workflow,/- name: Allow additional artifact indexing time on deploy failure\s*\n\s*if: steps\.deployment\.outcome == 'failure'\s*\n\s*run: sleep 30/);
  assert.match(workflow,/url: \$\{\{ steps\.deployment\.outputs\.page_url \|\| steps\.deployment_retry\.outputs\.page_url \}\}/);
  assert.match(workflow,/uses: actions\/download-artifact@v4/);
  assert.match(workflow,/name: website-dist/);
});
test('WEB-R3 Pages deploy: required build, smoke and source read-only contract stays intact',()=>{
  for(const script of ['npm test','npm run build','node scripts/ci/browser-smoke.mjs'])
    assert(workflow.includes(script),script+' remains required');
  assert.match(workflow,/permissions:\s*\n\s*contents: read/);
  assert.match(workflow,/pages: write/);
  assert.match(workflow,/id-token: write/);
  assert.match(workflow,/name: github-pages/);
});
