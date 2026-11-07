import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const app=readFileSync(new URL('../src/App.tsx',import.meta.url),'utf8');
const smoke=readFileSync(new URL('../scripts/ci/browser-smoke.mjs',import.meta.url),'utf8');

test('WEB-R4.2 hotfix: closing selected details restores focus before a competing dialog opens',()=>{
  const from=app.indexOf('function closeDetailPanel(){');
  const to=app.indexOf('// Home restores only the camera',from);
  assert(from>=0&&to>from);
  const close=app.slice(from,to);
  assert(close.indexOf("document.querySelector<HTMLButtonElement>('.header-entity-action')?.focus()")>=0);
  assert(close.indexOf("document.querySelector<HTMLButtonElement>('.header-entity-action')?.focus()") <
    close.indexOf('setDetailPanelOpen(false)'));
  assert.doesNotMatch(close,/requestAnimationFrame|setTimeout/);
  assert.match(close,/if\(drawer!=='detail'\)/);
});

test('WEB-R4.2 hotfix: Escape restore is synchronous and tools retain their own focus lifecycle',()=>{
  const start=app.indexOf("const onEscape=(event:KeyboardEvent)=>{");
  const end=app.indexOf("window.addEventListener('keydown',onEscape)",start);
  assert(start>=0&&end>start);
  const escape=app.slice(start,end);
  assert.doesNotMatch(escape,/requestAnimationFrame/);
  assert.match(escape,/opener\?\.focus\(\)/);
  assert.match(escape,/setDetailPanelOpen\(false\)/);
  assert.match(app,/dialog\?\.querySelector<HTMLButtonElement>\('\.atlas-tools-close'\)\?\.focus\(\)/);
  assert.match(smoke,/await pause\(100\);\s*assert\.equal\(await p\.eval\("document\.activeElement===document\.querySelector\('\.atlas-tools-close'\)"\)/);
});
