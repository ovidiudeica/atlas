import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const app=readFileSync(new URL('../src/App.tsx',import.meta.url),'utf8');
const css=readFileSync(new URL('../src/styles.css',import.meta.url),'utf8');
const smoke=readFileSync(new URL('../scripts/ci/browser-smoke.mjs',import.meta.url),'utf8');

test('WEB-R4.6: internal Phase 5 label removed from both public header locales',()=>{
  assert.doesNotMatch(app,/Administrative & statistical atlas · Phase 5/);
  assert.doesNotMatch(app,/Atlas administrativ și statistic · Etapa 5/);
  assert.doesNotMatch(app,/<span className="version">/);
  assert.doesNotMatch(app,/\{t\.version\}/);
  assert.doesNotMatch(app,/^\s*version: '[^']*', tree:/m);
  assert.doesNotMatch(css,/\.version\s*\{/);
});

test('WEB-R4.6: name, tagline and language switcher remain in the header',()=>{
  const header=app.slice(app.indexOf('<header className="site-header">'),
    app.indexOf('</header>',app.indexOf('<header className="site-header">')));
  assert.match(header,/<div className="brand"><strong>\{t\.title\}<\/strong><small>\{t\.tagline\}<\/small><\/div>/);
  assert.match(header,/className="language" aria-label="Language"/);
  assert.match(header,/aria-pressed=\{lang==='en'\}/);
  assert.match(header,/aria-pressed=\{lang==='ro'\}/);
  assert.match(app,/title: 'Territorial Atlas', tagline: 'Geography · History · Communities'/);
  assert.match(app,/title: 'Atlas Teritorial', tagline: 'Geografie · Istorie · Comunități'/);
  assert.match(css,/\.language\{margin-left:auto;display:flex/);
});

test('WEB-R4.6: Chromium checks header on desktop and RO mobile',()=>{
  assert.match(smoke,/phasePresent:!!document\.querySelector\('\.site-header \.version'\)/);
  assert.match(smoke,/assert\.equal\(frame\.phasePresent,false/);
  assert.match(smoke,/Romanian mobile header omits internal phase banner/);
});
