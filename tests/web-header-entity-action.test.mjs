import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const app=readFileSync(new URL('../src/App.tsx',import.meta.url),'utf8');
const css=readFileSync(new URL('../src/styles.css',import.meta.url),'utf8');
const smoke=readFileSync(new URL('../scripts/ci/browser-smoke.mjs',import.meta.url),'utf8');

test('WEB-HEADER: entity details opener follows EN/RO in right-aligned header actions',()=>{
 const header=app.slice(app.indexOf('<header className="site-header">'),app.indexOf('</header>',app.indexOf('<header className="site-header">')));
 assert(header.includes('<div className="header-actions">'));
 assert(header.indexOf('<div className="brand">')<header.indexOf('<div className="header-actions">'));
 assert(header.indexOf('<div className="language" aria-label="Language">')>header.indexOf('<div className="header-actions">'));
 assert(header.indexOf('>EN</button>')<header.indexOf('>RO</button>'));
 assert(header.indexOf('>RO</button>')<header.indexOf('className="header-entity-action"'));
 assert.match(header,/aria-label=\{t\.openDetail\}/);
 assert.match(header,/aria-expanded=\{detailPanelOpen\}/);
 assert.match(header,/if\(detailPanelOpen\)\{closeDetailPanel\(\);return;\}/);
 assert.match(header,/setDrawer\('detail'\)/);
});

test('WEB-HEADER: all three controls share compact 44px dimensions and preserve responsive checks',()=>{
 assert.match(css,/\.header-actions\{display:flex;align-items:center;gap:6px;flex:0 0 auto;margin-left:auto\}/);
 assert.match(css,/\.header-actions \.language\{margin-left:0;flex:0 0 auto\}/);
 assert.match(css,/\.header-actions \.language button,[\s\S]*?\.header-actions \.header-entity-action\{[\s\S]*?width:44px;height:44px;min-width:44px;min-height:44px/);
 assert.match(smoke,/async function headerEntityButtonPlacement\(cdp\)/);
 assert.match(smoke,/for\(const width of \[1440,900,390,360\]\)/);
 assert.match(smoke,/await headerEntityButtonPlacement\(client\)/);
});
