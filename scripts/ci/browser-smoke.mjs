/**
 * Chromium smoke test for the built /atlas/ site, without third-party test dependencies.
 * Captures evidence and checks responsive UI, search, source identity and real downloads.
 */
import { spawn, spawnSync } from 'node:child_process';
import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const root=fileURLToPath(new URL('../../',import.meta.url));
const screenshots=resolve(root,'artifacts/browser-smoke');
const site='http://127.0.0.1:4174/atlas/';
const pause=ms=>new Promise(done=>setTimeout(done,ms));
const runtimeErrors=[];
let chrome, preview, profile, client;

function findChrome(){
  if(process.env.CHROME_BIN)return process.env.CHROME_BIN;
  for(const command of ['google-chrome','google-chrome-stable','chromium','chromium-browser']){
    const found=spawnSync('which',[command],{encoding:'utf8'});
    if(found.status===0)return found.stdout.trim();
  }
  throw Error('Chromium/Google Chrome is required for UI verification');
}
async function until(fn,what,limit=30000){
  const end=Date.now()+limit;
  let last;
  while(Date.now()<end){
    try{const r=await fn();if(r)return r;}catch(e){last=e;}
    await pause(180);
  }
  throw Error('Timeout: '+what+(last?' ('+last.message+')':''));
}
class CDP{
  constructor(socket){
    this.socket=socket;this.next=0;this.pending=new Map();this.callbacks=new Map();
    socket.addEventListener('message',event=>{
      const msg=JSON.parse(String(event.data));
      if(msg.id){
        const p=this.pending.get(msg.id);if(!p)return;
        this.pending.delete(msg.id);
        msg.error?p.reject(Error(p.method+': '+JSON.stringify(msg.error))):p.resolve(msg.result||{});
      }else if(msg.method){
        for(const callback of this.callbacks.get(msg.method)||[])callback(msg);
      }
    });
  }
  on(event,fn){const arr=this.callbacks.get(event)||[];arr.push(fn);this.callbacks.set(event,arr);}
  send(method,params={},sessionId){
    return new Promise((resolve,reject)=>{
      const id=++this.next;
      this.pending.set(id,{method,resolve,reject});
      this.socket.send(JSON.stringify({id,method,params,...(sessionId?{sessionId}:{})}));
    });
  }
  async page(width,height,mobile){
    const {targetId}=await this.send('Target.createTarget',{url:'about:blank'});
    const {sessionId}=await this.send('Target.attachToTarget',{targetId,flatten:true});
    await this.send('Page.enable',{},sessionId);
    await this.send('Runtime.enable',{},sessionId);
    await this.send('Emulation.setDeviceMetricsOverride',{
      width,height,mobile,deviceScaleFactor:1,screenWidth:width,screenHeight:height
    },sessionId);
    await this.send('Page.navigate',{url:site},sessionId);
    return new BrowserPage(this,sessionId,targetId);
  }
  close(){this.socket.close();}
}
class BrowserPage{
  constructor(cdp,sid,id){this.cdp=cdp;this.sid=sid;this.id=id;}
  call(method,params={}){return this.cdp.send(method,params,this.sid);}
  async eval(js){
    const r=await this.call('Runtime.evaluate',{
      expression:js,returnByValue:true,awaitPromise:true,userGesture:true
    });
    if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);
    return r.result?.value;
  }
  wait(js,what){return until(()=>this.eval(js),what);}
  async snap(name){
    const r=await this.call('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});
    await writeFile(join(screenshots,name),Buffer.from(r.data,'base64'));
  }
  close(){return this.cdp.send('Target.closeTarget',{targetId:this.id});}
}
async function downloaded(ext){
  return until(async()=>{
    const names=await readdir(screenshots);
    const filename=names.find(f=>f.endsWith(ext)&&!f.endsWith('.crdownload'));
    return filename?join(screenshots,filename):null;
  },'download '+ext,25000);
}
async function desktop(cdp){
  const p=await cdp.page(1440,900,false);
  await p.wait("document.querySelector('.tree-footnote')?.textContent.includes('4,283')",'desktop catalog');
  await p.wait("!document.querySelector('.map-boot-status')",'certified national contours');
  const frame=await p.eval("({screen:innerWidth,scroll:document.documentElement.scrollWidth,map:document.querySelector('.map-area').getBoundingClientRect().width,phase:document.querySelector('.version')?.textContent})");
  assert(frame.scroll<=frame.screen+1,'Desktop horizontal overflow');
  assert(frame.map>400,'Desktop map missing');
  assert.match(frame.phase,/Phase 5/);
  await p.snap('desktop-initial.png');
  await p.eval("document.querySelector('.tree-sidebar input[type=search]').focus()");
  await p.call('Input.insertText',{text:'Brețcu'});
  await p.wait("Array.from(document.querySelectorAll('.tree-sidebar .tree-label')).some(b=>b.textContent.includes('Brețcu'))",'Brețcu search results');
  await p.eval("Array.from(document.querySelectorAll('.tree-sidebar .tree-label')).find(b=>b.textContent.includes('Brețcu')).click()");
  await p.wait("document.querySelector('.detail-sidebar .entity-title h3')?.textContent.includes('Brețcu')",'Brețcu entity details');
  const osm=await p.eval("Array.from(document.querySelectorAll('.detail-sidebar .metadata dt')).find(x=>x.textContent.trim()==='OSM ID')?.nextElementSibling?.textContent.trim()");
  assert.equal(osm,'','Brețcu must retain blank authentic OSM ID');
  await p.eval("document.querySelector('.map-quick-actions button[aria-controls=phase5-export-panel]').click()");
  await p.wait("!!document.querySelector('#phase5-export-panel select')",'export controls');
  await p.eval("(()=>{const s=document.querySelector('#phase5-export-panel select');s.value='selected';s.dispatchEvent(new Event('change',{bubbles:true}));})()");
  await p.wait("document.querySelector('#phase5-export-panel select')?.value==='selected'",'export scope');
  await p.eval("document.querySelector('#phase5-export-panel .export-buttons button:first-child').click()");
  const geo=JSON.parse(await readFile(await downloaded('.geojson'),'utf8'));
  assert.equal(geo.type,'FeatureCollection');
  assert.equal(geo.atlasExport.count,1);
  assert.equal(geo.atlasExport.geometryMode,'detailed');
  assert.equal(geo.atlasExport.legalBoundaryCertification,false);
  assert.equal(geo.features[0].properties.atlasId,'siruta-u64096');
  await p.wait("!document.querySelector('#phase5-export-panel .export-buttons button:nth-child(2)').disabled",'next export');
  await p.eval("document.querySelector('#phase5-export-panel .export-buttons button:nth-child(2)').click()");
  const csv=await readFile(await downloaded('.csv'),'utf8');
  assert(csv.includes('siruta-u64096'));
  assert(csv.includes('"Comuna Brețcu","",'),'CSV must preserve blank OSM ID');
  await p.snap('desktop-export-bretcu.png');

  // Administrative OSM-level filter: initially selected level 8 in the two
  // catalog-derived country scopes must remove Brețcu without altering other
  // levels, the selected detail card, or the tree.
  await p.eval("document.querySelector('.detail-sidebar .entity-actions button:first-child').click()");
  await p.wait("JSON.parse(localStorage.getItem('atlas-visible-phase4')).includes('siruta-u64096')",'Brețcu visible for level 8 filter');
  await p.eval("document.querySelector('.tree-sidebar .osm-level-filter>summary').click()");
  const filterState=await p.eval("({scopes:[...document.querySelectorAll('.tree-sidebar .osm-level-scopes label')].map(x=>({name:x.textContent.trim(),checked:x.querySelector('input').checked})),levels:[...document.querySelectorAll('.tree-sidebar .osm-level-choices label')].map(x=>({name:x.textContent.trim(),checked:x.querySelector('input').checked}))})");
  assert.equal(filterState.scopes.length,2,'Two current geography sets are derived from the catalog');
  assert(filterState.scopes.every(x=>x.checked),'Both current geography sets are checked by default');
  assert(filterState.levels.some(x=>x.name.startsWith('ADM 8')&&x.checked),'Level 8 must be preselected');
  await p.eval("document.querySelector('.tree-sidebar .osm-level-actions button:last-child').click()");
  await p.wait("!JSON.parse(localStorage.getItem('atlas-visible-phase4')).includes('siruta-u64096')",'all selected level 8 geometry hidden');
  assert.equal(await p.eval("document.querySelector('.detail-sidebar .entity-title h3')?.textContent.includes('Brețcu')"),true,
    'Bulk visibility must not clear the active entity');
  assert.equal(await p.eval("(()=>{const a=JSON.parse(localStorage.getItem('atlas-visible-phase4'));return a.length===2&&a.includes('osm-r90689')&&a.includes('osm-r58974')})()"),true,
    'Bulk level 8 hide preserves both country outlines');
  await p.snap('desktop-level8-hidden.png');

  // Statistical regions use the same territory scopes but distinct controls.
  // This must not accidentally execute the preselected ADM 8 hide action.
  const statisticalChoices=await p.eval("Array.from(document.querySelectorAll('.tree-sidebar .osm-stat-choices label')).map(x=>({label:x.querySelector('span').textContent.trim(),count:x.querySelector('small').textContent.trim(),checked:x.querySelector('input').checked}))");
  assert.deepEqual(statisticalChoices.map(x=>x.label),['NUTS 1','NUTS 2','NUTS 3','NTS 1','NTS 2','NTS 3']);
  assert.deepEqual(statisticalChoices.map(x=>Number(x.count)),[4,8,42,1,2,6],
    'Statistical options and counts must reflect certified RO/MD catalogue');
  assert(statisticalChoices.every(x=>!x.checked),'Statistical groups must not be selected implicitly');
  await p.eval("document.querySelector('.tree-sidebar .osm-stat-choices input[aria-label=\"NUTS 1\"]').click()");
  await p.eval("document.querySelector('.tree-sidebar .osm-stat-choices input[aria-label=\"NTS 2\"]').click()");
  assert.equal(await p.eval("document.querySelector('.tree-sidebar .osm-stat-actions button:first-child').disabled"),false,
    'Statistical bulk show should enable when at least one level is selected');
  await p.eval("document.querySelector('.tree-sidebar .osm-stat-actions button:first-child').click()");
  await p.wait("(()=>{const ids=JSON.parse(localStorage.getItem('atlas-visible-phase4'));return ids.length===8&&ids.includes('stat-RO1')&&ids.includes('stat-MD11')&&ids.includes('stat-MD12')&&!ids.includes('siruta-u64096')})()",
    'NUTS 1 and NTS 2 regions shown without changing ADM 8');
  await p.snap('desktop-statistical-regions-shown.png');
  await p.eval("document.querySelector('.tree-sidebar .osm-stat-actions button:last-child').click()");
  await p.wait("(()=>{const ids=JSON.parse(localStorage.getItem('atlas-visible-phase4'));return ids.length===2&&ids.includes('osm-r90689')&&ids.includes('osm-r58974')})()",
    'Statistical bulk hide restores two roots and does not affect other admin levels');
  assert.equal(await p.eval("document.querySelector('.detail-sidebar .entity-title h3')?.textContent.includes('Brețcu')"),true,
    'Statistical bulk actions must preserve selected administrative detail');
  await p.snap('desktop-statistical-regions-hidden.png');

  // Reset selected polygons (not merely the camera), with storage, permalink and
  // user-preference persistence. Home must remain a camera-only operation.
  await p.eval("document.querySelector('.detail-sidebar .entity-actions button:first-child').click()");
  await p.wait("JSON.parse(localStorage.getItem('atlas-visible-phase4')).length===3",'Brețcu displayed with national roots');
  await p.eval("document.querySelector('.zoom-controls button:last-child').click()");
  assert.equal(await p.eval("JSON.parse(localStorage.getItem('atlas-visible-phase4')).length"),3,
    'Home must not reset selected geometries');
  await p.eval("document.querySelector('.simplify-control input').click()");
  await p.wait("document.querySelector('.simplify-control input').checked",'simplified display preference');
  await p.eval("(()=>{const s=document.querySelector('.basemap-select select');s.value='grayscale';s.dispatchEvent(new Event('change',{bubbles:true}));})()");
  await p.wait("document.querySelector('.basemap-select select').value==='grayscale'",'grayscale basemap');
  await p.eval("Array.from(document.querySelectorAll('.language button')).find(b=>b.textContent==='RO').click()");
  await p.wait("document.documentElement.lang==='ro'",'Romanian reset label');
  await p.eval("history.replaceState(history.state,'','?utm=preserved&entity=siruta-u64096&lng=26.4&lat=45.9&zoom=9')");
  await p.eval("document.querySelector('.map-quick-actions .reset-geometries').click()");
  await p.wait("(()=>{const v=JSON.parse(localStorage.getItem('atlas-visible-phase4'));return v.length===2&&v.includes('osm-r90689')&&v.includes('osm-r58974')})()",'default national preview restored');
  const resetState=await p.eval("({selected:!!document.querySelector('.detail-sidebar .entity-card'),rows:[...document.querySelectorAll('.tree-sidebar .tree-line input[type=checkbox]')].map(x=>x.checked),language:document.documentElement.lang,simplified:document.querySelector('.simplify-control input').checked,basemap:document.querySelector('.basemap-select select').value,search:document.querySelector('.tree-sidebar input[type=search]').value,query:location.search})");
  assert.equal(resetState.selected,false,'Entity selection/detail must clear on geometry reset');
  assert.deepEqual(resetState.rows,[true,true],'Only two national root geometries must remain selected');
  assert.equal(resetState.search,'','Reset should restore unfiltered tree overview');
  assert.equal(resetState.language,'ro','Language must survive geometry reset');
  assert.equal(resetState.simplified,true,'Simplification choice must survive geometry reset');
  assert.equal(resetState.basemap,'grayscale','Basemap must survive geometry reset');
  assert(resetState.query.includes('utm=preserved'),'Unrelated permalink arguments must survive reset');
  for(const key of ['entity','lng','lat','zoom'])assert(!new URLSearchParams(resetState.query).has(key),
    'Reset must remove stale shared-URL '+key);
  await p.wait("!document.querySelector('.map-boot-status')",'original national preview reloaded');
  await p.snap('desktop-reset-geometries.png');

  await p.call('Page.reload',{ignoreCache:true});
  await p.wait("document.querySelector('.tree-footnote')?.textContent.includes('4.283')",'catalog after geometry-reset reload');
  await p.wait("(()=>{const v=JSON.parse(localStorage.getItem('atlas-visible-phase4'));return v.length===2&&v.includes('osm-r90689')&&v.includes('osm-r58974')})()",'persisted reset roots after reload');
  assert.equal(await p.eval("!!document.querySelector('.detail-sidebar .entity-card')"),false,
    'Reset permalink cannot revive the old selected entity on reload');
  assert.equal(await p.eval("document.querySelector('.simplify-control input').checked"),true,
    'Simplification preference survives reset and page reload');
  await p.close();
}
async function mobile(cdp){
  const p=await cdp.page(390,844,true);
  await p.wait("document.querySelector('.tree-footnote strong')?.textContent.replace(/\\D/g,'').includes('4283')",'mobile catalog (locale-independent)');
  await p.wait("!document.querySelector('.map-boot-status')",'mobile national contours');
  const geometry=await p.eval("({width:innerWidth,scroll:document.documentElement.scrollWidth,height:document.querySelector('.map-area').getBoundingClientRect().height,buttons:getComputedStyle(document.querySelector('.mobile-controls')).display})");
  assert(geometry.scroll<=geometry.width+1,'Mobile horizontal overflow');
  assert(geometry.height>300,'Map is hidden on mobile');
  assert.notEqual(geometry.buttons,'none','Mobile controls hidden');
  await p.snap('mobile-initial.png');
  await p.eval("document.querySelector('.mobile-controls button:first-child').click()");
  await p.wait("!!document.querySelector('.drawer[role=dialog] .tree-content')",'mobile tree drawer');
  assert(await p.eval("document.querySelector('.drawer[role=dialog]')?.getAttribute('aria-modal')==='true'"));
  await p.snap('mobile-tree-drawer.png');
  await p.eval("document.querySelector('.drawer .osm-level-filter>summary').click()");
  assert.equal(await p.eval("document.querySelectorAll('.drawer .osm-level-scopes input').length"),2,
    'Mobile filter must expose catalog-derived scopes');
  assert.equal(await p.eval("[...document.querySelectorAll('.drawer .osm-level-choices label')].some(x=>x.textContent.includes('ADM 8'))"),true,
    'Mobile filter must expose level 8');
  assert.equal(await p.eval("document.querySelectorAll('.drawer .osm-stat-choices input').length"),6,
    'Mobile filter must expose both NUTS and NTS statistical levels');
  assert.equal(await p.eval("document.querySelector('.drawer .osm-stat-actions button:first-child').disabled"),true,
    'Statistical controls must be disabled without a selected level');
  await p.snap('mobile-osm-level-filter.png');
  await p.eval("document.querySelector('.drawer .osm-stat-choices input[aria-label=\"NUTS 1\"]').click()");
  await p.eval("document.querySelector('.drawer .osm-stat-actions button:first-child').click()");
  await p.wait("(()=>{const ids=JSON.parse(localStorage.getItem('atlas-visible-phase4'));return ids.length===6&&ids.includes('stat-RO1')})()",
    'Mobile statistical NUTS 1 display');
  await p.snap('mobile-statistical-regions-shown.png');
  await p.eval("document.querySelector('.drawer .osm-stat-actions button:last-child').click()");
  await p.wait("JSON.parse(localStorage.getItem('atlas-visible-phase4')).length===2",
    'Mobile statistical NUTS 1 hide without changing roots');
  await p.eval("document.querySelector('.drawer-close').click()");
  await p.eval("Array.from(document.querySelectorAll('.language button')).find(b=>b.textContent==='RO').click()");
  await p.wait("document.documentElement.lang==='ro'",'Romanian language');
  await p.snap('mobile-ro.png');
  assert((await p.eval('document.documentElement.scrollWidth'))<=391,'Mobile overflow in Romanian');
  await p.eval("document.querySelector('.mobile-controls button:first-child').click()");
  await p.wait("!!document.querySelector('.drawer[role=dialog] .tree-content')",'mobile tree for geometry reset');
  await p.eval("document.querySelector('.drawer .tree-line input[type=checkbox]').click()");
  await p.wait("JSON.parse(localStorage.getItem('atlas-visible-phase4')).length===1",'mobile country outline deselected');
  await p.eval("document.querySelector('.drawer-close').click()");
  assert.equal(await p.eval("document.querySelector('.map-quick-actions .reset-geometries').textContent.includes('Resetează geometriile')"),true);
  await p.eval("document.querySelector('.map-quick-actions .reset-geometries').click()");
  await p.wait("(()=>{const v=JSON.parse(localStorage.getItem('atlas-visible-phase4'));return v.length===2&&v.includes('osm-r90689')&&v.includes('osm-r58974')})()",'mobile default national preview');
  assert((await p.eval('document.documentElement.scrollWidth'))<=391,'Mobile reset action must not introduce overflow');
  await p.snap('mobile-reset-geometries.png');
  await p.close();
}
try{
  await mkdir(screenshots,{recursive:true});
  profile=await mkdtemp(join(tmpdir(),'atlas-smoke-'));
  preview=spawn('npm',['run','preview','--','--host','127.0.0.1','--port','4174','--strictPort'],{cwd:root,stdio:'inherit'});
  await until(async()=>(await fetch(site)).ok,'Vite preview');
  chrome=spawn(findChrome(),[
    '--headless=new','--no-sandbox','--disable-dev-shm-usage',
    '--enable-unsafe-swiftshader','--disable-gpu-sandbox',
    '--no-first-run','--no-default-browser-check',
    '--user-data-dir='+profile,'--remote-debugging-port=9338','about:blank'
  ],{stdio:'ignore'});
  const details=await until(async()=>{
    const r=await fetch('http://127.0.0.1:9338/json/version');
    return r.ok?r.json():null;
  },'Chromium DevTools');
  const socket=new WebSocket(details.webSocketDebuggerUrl);
  await new Promise((ok,fail)=>{
    socket.addEventListener('open',ok,{once:true});
    socket.addEventListener('error',fail,{once:true});
  });
  client=new CDP(socket);
  client.on('Runtime.exceptionThrown',event=>runtimeErrors.push(event.params?.exceptionDetails?.exception?.description||event.params?.exceptionDetails?.text));
  await client.send('Browser.setDownloadBehavior',{
    behavior:'allow',downloadPath:screenshots,eventsEnabled:true
  });
  await desktop(client);
  await mobile(client);
  assert.deepEqual(runtimeErrors,[],'Uncaught browser exceptions');
  console.log('Browser smoke: desktop/mobile, NUTS/NTS statistical levels, OSM level 8, geometry reset, Brețcu, GeoJSON, CSV and screenshots OK.');
}catch(err){
  console.error('Browser smoke failure:',err);
  process.exitCode=1;
}finally{
  try{client?.close();}catch{}
  chrome?.kill('SIGKILL');
  preview?.kill('SIGKILL');
  if(profile)await rm(profile,{recursive:true,force:true}).catch(()=>{});
}
