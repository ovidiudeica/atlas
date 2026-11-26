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
    'upload, readiness gate and deploy must use the same attempt-specific artifact');
  const lines=workflow.split(/\r?\n/).map(line=>line.trim());
  for(const field of ['name','PAGES_ARTIFACT','artifact_name'])
    assert.equal(lines.filter(line=>line===field+': '+expected).length,1,
      field+' must identify the exact attempt-specific artifact');
  const upload=lines.indexOf('name: '+expected);
  const readiness=lines.indexOf('PAGES_ARTIFACT: '+expected);
  const deploy=lines.indexOf('artifact_name: '+expected);
  assert(upload<readiness && readiness<deploy,
    'readiness gate must run after upload and before deployment');
  assert.match(workflow,/actions: read/);
  assert.match(workflow,/\.expired == false/);
  assert.match(workflow,/Expected unique Pages artifact not visible in Actions REST API/);
  assert.match(workflow,/Verify published historical 1930 assets/);
  assert(workflow.indexOf('Verify published historical 1930 assets')>
    workflow.indexOf('uses: actions/deploy-pages@v4'),
    'public verification must follow the deployment');
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
