import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = name => readFileSync(new URL('../' + name, import.meta.url), 'utf8');

test('Maintenance changes preserve native MapLibre layers and remove dead SVG overlay styling', () => {
  const css=read('src/styles.css'), app=read('src/App.tsx');
  assert.doesNotMatch(css,/\.territory-overlay\s*\{/);
  assert.match(app,/instance\.addLayer\(\{id:'entity-outline'/);
  assert.match(app,/getCountryGeoJSON\('simplified'\)/);
});

test('Project scope is updated to live Phase 5 while source certification remains explicitly limited', () => {
  const project=read('PROJECT.md');
  assert.match(project,/Live bilingual website through Phase 5/);
  assert.doesNotMatch(project,/implementation has not started|GitHub Pages will remain inactive/);
  assert.match(project,/no repository-wide `LICENSE`/);
  assert.match(read('README.md'),/Phase 5/);
});

test('Locked CI builds and browser smoke are part of both PR and main verification', () => {
  const workflow=read('.github/workflows/website.yml');
  assert.match(workflow,/pull_request:/);
  assert.match(workflow,/github\.event\.pull_request\.head\.sha \|\| github\.sha/);
  assert.match(workflow,/push:/);
  assert.match(workflow,/npm ci --no-audit --no-fund/);
  assert.match(workflow,/node scripts\/ci\/browser-smoke\.mjs/);
  assert.match(workflow,/name: browser-smoke-/);
});
