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
  assert.equal(workflow.split(expected).length-1,2,
    'upload-pages-artifact name and deploy-pages artifact_name must match');
  assert.match(workflow,/uses: actions\/upload-pages-artifact@v3\s*\n\s*with:\s*\n\s*name: github-pages-/);
  assert.match(workflow,/uses: actions\/deploy-pages@v4\s*\n\s*with:\s*\n\s*artifact_name: github-pages-/);
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
