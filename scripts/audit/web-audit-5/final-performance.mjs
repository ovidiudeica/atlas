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

const outputRoot=fileURLToPath(new URL('../../../',import.meta.url));
const root=outputRoot;
const screenshots=resolve(root,'artifacts/browser-smoke');
const site=process.env.ATLAS_AUDIT_SITE||'http://127.0.0.1:4187/atlas/';
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
async function until(fn,what,limit=Number(process.env.ATLAS_SMOKE_TIMEOUT_MS)||30000){
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
  async page(width,height,mobile,url=site){
    const {targetId}=await this.send('Target.createTarget',{url:'about:blank'});
    const {sessionId}=await this.send('Target.attachToTarget',{targetId,flatten:true});
    await this.send('Page.enable',{},sessionId);
    await this.send('Runtime.enable',{},sessionId);
    await this.send('Emulation.setDeviceMetricsOverride',{
      width,height,mobile,deviceScaleFactor:1,screenWidth:width,screenHeight:height
    },sessionId);
    await this.send('Page.navigate',{url},sessionId);
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
async function finalPerformance(cdp){
 const registry=JSON.parse((await import('node:zlib')).gunzipSync(await readFile(resolve(root,'public/data/symbols/registry-r8.json.gz'))));const {symbolAssetUrl}=await import('../../../src/data/territorialSymbols.mjs');
 const report={stage:'WEB-AUDIT.5c',site,checkedAt:new Date().toISOString(),conditions:{trialsPerViewport:3,viewports:[[1440,900],[390,844]],network:'Actual unthrottled network; isolated profile; cache cleared before cold; warm reload retains HTTP cache. Atlas preferences reset before each navigation for consistent detailed default.',typingMs:75,querySettleMs:250,meaning:'Map timings measure application source-ready state, not a GPU-idle claim. Scripted phase durations include explicit typing/settling. Transfer totals cover completed requests; unfinished requests remain unknown. No comparison to historical single7.17s/13.23s sample.'},samples:[]};
 report.conditions.browser=await cdp.send('Browser.getVersion');report.conditions.node=process.version;report.conditions.platform=process.platform;report.conditions.softwareRendering=process.env.ATLAS_CHROME_SOFTWARE==='1';
 const key=async(p,key,code,keyCode,text)=>{await p.call('Input.dispatchKeyEvent',{type:'keyDown',key,code,windowsVirtualKeyCode:keyCode,...(text?{text}:{})});await p.call('Input.dispatchKeyEvent',{type:'keyUp',key,code,windowsVirtualKeyCode:keyCode});};
 const searchVisible="[...document.querySelectorAll('.search input')].find(e=>e.getClientRects().length)";
 for(const width of [1440,390])for(let trial=0;trial<3;trial++){
  const p=await cdp.page(width,width===390?844:900,width===390,'about:blank'),requests=new Map(),durations={};let phase='cold';
  cdp.on('Network.requestWillBeSent',e=>{if(e.sessionId!==p.sid)return;const q=e.params,old=requests.get(q.requestId);if(old&&q.redirectResponse){old.redirects.push({url:old.url,status:q.redirectResponse.status});old.url=q.request.url;return;}requests.set(q.requestId,{url:q.request.url,initialURL:q.request.url,type:q.type,phase,started:q.timestamp,redirects:[]});});
  cdp.on('Network.responseReceived',e=>{if(e.sessionId!==p.sid)return;const r=requests.get(e.params.requestId);if(r)Object.assign(r,{status:e.params.response.status,cache:!!(e.params.response.fromDiskCache||e.params.response.fromServiceWorker),mime:e.params.response.mimeType});});
  cdp.on('Network.loadingFinished',e=>{if(e.sessionId!==p.sid)return;const r=requests.get(e.params.requestId);if(r)Object.assign(r,{finished:true,encodedBytes:e.params.encodedDataLength,resourceMs:(e.params.timestamp-r.started)*1000});});
  cdp.on('Network.loadingFailed',e=>{if(e.sessionId!==p.sid)return;const r=requests.get(e.params.requestId);if(r)Object.assign(r,{failed:true,canceled:!!e.params.canceled,error:e.params.errorText});});
  await p.call('Network.enable');await p.call('Network.clearBrowserCache');await p.call('Page.addScriptToEvaluateOnNewDocument',{source:"try{Object.keys(localStorage).filter(k=>k.startsWith('atlas-')).forEach(k=>localStorage.removeItem(k));}catch{}"});
  const step=async(name,fn)=>{phase=name;const start=Date.now(),value=await fn();durations[name]=Date.now()-start;return value;};
  await step('cold',async()=>{await p.call('Page.navigate',{url:site+'?lang=en&simple=0'});await p.wait("document.querySelector('.map-area')?.dataset.mapReady==='true'",'cold source-ready');});const coldPaint=await p.eval("performance.getEntriesByType('paint').map(e=>({name:e.name,ms:e.startTime}))");
  const oldOrigin=await p.eval('performance.timeOrigin');await step('warm',async()=>{await p.call('Page.reload');await p.wait('performance.timeOrigin!=='+oldOrigin+"&&document.querySelector('.map-area')?.dataset.mapReady==='true'",'new-document warm source-ready');});const warmPaint=await p.eval("performance.getEntriesByType('paint').map(e=>({name:e.name,ms:e.startTime}))");
  const ensureSearch=async()=>{if(!await p.eval('!!('+searchVisible+')'))await key(p,'/','Slash',191,'/');await p.wait('!!('+searchVisible+')','visible search');await p.eval('('+searchVisible+').focus()');};
  const set=async value=>{await p.eval("(()=>{const e="+searchVisible+";if(!e)throw Error('Visible search missing');Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(e,"+JSON.stringify(value)+");e.dispatchEvent(new Event('input',{bubbles:true}));})()");};
  await step('progressive-search',async()=>{await ensureSearch();assert(await p.eval('document.activeElement===('+searchVisible+')'),'Slash focuses visible search');for(const q of ['Taraclia','Harghita','Bucharest','București']){for(let i=1;i<=q.length;i++){await set(q.slice(0,i));await pause(75);}await pause(250);}});
  const tar=await step('open-taraclia-card',async()=>{await set('osm-r1699033');await p.wait("[...document.querySelectorAll('.tree-line')].filter(e=>e.getClientRects().length).length===1",'exact district result');await key(p,'Enter','Enter',13);await p.wait("[...document.querySelectorAll('.entity-title')].some(e=>e.getClientRects().length&&e.querySelector('img')?.src.includes('taraclia-coat.png'))",'exact Taraclia district coat');return p.eval("[...document.querySelectorAll('.entity-title')].find(e=>e.getClientRects().length)?.querySelector('img')?.src");});
  let intentSources=[];await step('open-harghita-card',async()=>{await ensureSearch();await set('osm-r2248660');await p.wait("[...document.querySelectorAll('.tree-line')].filter(e=>e.getClientRects().length).length===1",'exact Harghita result');await key(p,'Enter','Enter',13);await p.wait("[...document.querySelectorAll('.entity-title')].some(e=>e.getClientRects().length&&e.querySelector('img')?.src.includes('harghita-coat.png'))",'Harghita approved coat');intentSources=[...new Set([...(await p.eval("[...document.querySelectorAll('.entity-card img')].map(i=>i.src)")),...['coat','flag'].map(k=>symbolAssetUrl(registry.entities['osm-r2248660'][k])).filter(Boolean).map(url=>new URL(url,site).href)])];await pause(350);});
  let branchChildren;await step('large-branch',async()=>{await ensureSearch();await p.eval("(()=>{const row=[...document.querySelectorAll('.tree-line[aria-selected=true]')].find(e=>e.getClientRects().length);row.scrollIntoView({block:'center'});if(row.getAttribute('aria-expanded')==='false')row.querySelector('.expand-button').click();})()");await pause(500);branchChildren=await p.eval("(()=>{const r=[...document.querySelectorAll('.tree-line[aria-selected=true]')].find(e=>e.getClientRects().length);return r.closest('.territory-branch').querySelectorAll(':scope > .tree-children > .territory-branch').length})()");assert(branchChildren>10,'Large certified branch really expanded');});
  await p.eval("[...document.querySelectorAll('.detail-sidebar .pane-close')].find(e=>e.getClientRects().length)?.click()");await step('panel-keyboard-cycles',async()=>{for(let i=0;i<3;i++){await key(p,'Escape','Escape',27);await p.wait('!('+searchVisible+')','Escape closes module');await key(p,'/','Slash',191,'/');await p.wait('document.activeElement===('+searchVisible+')','Slash restores search focus');}});
  await key(p,'Escape','Escape',27);let switchedMode;await step('geometry-switch',async()=>{await p.eval("document.querySelector('.atlas-tools-toggle').click()");await p.wait("!!document.querySelector('[aria-controls=atlas-section-settings]')",'geometry settings opener');await p.eval("document.querySelector('[aria-controls=atlas-section-settings]').click()");await p.wait("!!document.querySelector('#atlas-section-settings input[type=checkbox]')",'geometry mode control');switchedMode=await p.eval("(()=>{const c=document.querySelector('#atlas-section-settings input[type=checkbox]');c.click();return c.checked?'simplified':'detailed'})()");await until(async()=>[...requests.values()].some(r=>r.phase==='geometry-switch'&&r.url.includes('geometry/roots-'+switchedMode+'.geojson.gz')&&r.finished)&&await p.eval("document.querySelector('.map-area')?.dataset.mapReady==='true'&&!document.querySelector('.atlas-map-status')"),'switched certified source ready',120000);});
  const remoteSymbol=r=>r.type==='Image'&&!r.initialURL.startsWith(new URL(site).origin+'/')&&!/tile\.openstreetmap\.org\//.test(r.initialURL);const unsolicited=[...requests.values()].filter(r=>remoteSymbol(r)&&(r.phase==='progressive-search'||(['large-branch','panel-keyboard-cycles'].includes(r.phase)&&!intentSources.includes(r.initialURL))));assert.deepEqual(unsolicited,[],'No unselected original requests in search, large branch or repeated panels');
  const phaseTotals={};for(const name of new Set([...requests.values()].map(r=>r.phase))){const list=[...requests.values()].filter(r=>r.phase===name);phaseTotals[name]={requests:list.length,completed:list.filter(r=>r.finished).length,unfinished:list.filter(r=>!r.finished&&!r.failed).length,failed:list.filter(r=>r.failed).length,knownEncodedBytes:list.reduce((n,r)=>n+(r.finished?r.encodedBytes:0),0),externalImages:list.filter(remoteSymbol).length};}assert(await p.eval('document.documentElement.scrollWidth<=innerWidth+1'),'No horizontal overflow');report.samples.push({width,trial,durations,coldPaint,warmPaint,selectedTaracliaCoat:tar,selectedHarghitaImageIntentSources:intentSources,branchChildren,switchedMode,unsolicitedOriginalRequests:unsolicited.length,phaseTotals,requests:[...requests.values()]});if(trial===0)await p.snap('web-audit-5c-performance-'+width+'.png');await p.close();console.log('Final performance sample PASS',width,trial,durations);
 }
 const p=await cdp.page(390,844,true,'about:blank');let failedRequests=0;cdp.on('Fetch.requestPaused',e=>{if(e.sessionId!==p.sid)return;failedRequests++;p.call('Fetch.fulfillRequest',{requestId:e.params.requestId,responseCode:503,responseHeaders:[{name:'Cache-Control',value:'no-store'}],body:Buffer.from('Controlled image failure').toString('base64')}).catch(err=>runtimeErrors.push(err.message));});await p.call('Network.enable');await p.call('Network.setCacheDisabled',{cacheDisabled:true});await p.call('Fetch.enable',{patterns:[{urlPattern:'*symbols/sim-r8/harghita-coat.png*',requestStage:'Request'}]});await p.call('Page.navigate',{url:site+'?entity=osm-r2248660&lang=en&simple=0'});await p.wait("document.querySelector('.map-area')?.dataset.mapReady==='true'",'map survives image failure');await p.wait("[...document.querySelectorAll('.entity-card')].some(c=>c.getClientRects().length&&c.querySelector('.entity-title .territorial-symbol-fallback')&&c.querySelector('.territory-symbol-gallery figure:first-child .territorial-symbol-fallback'))",'neutral unavailable coat fallback');report.unavailableImage=await p.eval("(()=>{const c=[...document.querySelectorAll('.entity-card')].find(c=>c.getClientRects().length);return{headerNeutral:!!c.querySelector('.entity-title .territorial-symbol-fallback'),headerImage:c.querySelector('.entity-title img')?.src||null,coatNeutral:!!c.querySelector('.territory-symbol-gallery figure:first-child .territorial-symbol-fallback'),coatSources:[...c.querySelectorAll('.territory-symbol-gallery figure:first-child a')].map(a=>a.href),overflow:document.documentElement.scrollWidth-innerWidth}})()");assert(failedRequests>0);assert(report.unavailableImage.headerNeutral&&report.unavailableImage.coatNeutral&&report.unavailableImage.headerImage===null&&report.unavailableImage.coatSources.length>0&&report.unavailableImage.overflow<=1);Object.assign(report.unavailableImage,{syntheticHTTPStatus:503,failedRequests,exactAtlasID:'osm-r2248660',scope:'Controlled rendering failure only; no source, rights verdict or published image changed.'});await p.snap('web-audit-5c-unavailable-image.png');await p.close();await writeFile(resolve(root,'docs/audits/web-audit-5/final-performance-'+(process.env.AUDIT_LABEL||'local')+'.json'),JSON.stringify(report,null,2)+'\n');console.log('WEB-AUDIT.5c six repeated performance flows and unavailable-image fallback PASS');
}

try{
  await mkdir(screenshots,{recursive:true});
  profile=await mkdtemp(join(tmpdir(),'atlas-smoke-'));
  if(!process.env.ATLAS_AUDIT_SITE)preview=spawn(process.execPath,[resolve(root,'node_modules/vite/bin/vite.js'),'preview','--host','127.0.0.1','--port','4187','--strictPort'],{cwd:root,stdio:'inherit'});
  if(!process.env.ATLAS_AUDIT_SITE)await until(async()=>(await fetch(site)).ok,'Vite preview');
  chrome=spawn(findChrome(),[
    '--headless=new','--no-sandbox','--disable-dev-shm-usage',
    '--enable-unsafe-swiftshader','--disable-gpu-sandbox',
    ...(process.env.ATLAS_CHROME_SOFTWARE==='1'?['--use-angle=swiftshader']:[]),
    '--no-first-run','--no-default-browser-check',
    '--user-data-dir='+profile,'--remote-debugging-port=9378','about:blank'
  ],{stdio:'ignore'});
  const details=await until(async()=>{
    const r=await fetch('http://127.0.0.1:9378/json/version');
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
  await finalPerformance(client);
  assert.deepEqual(runtimeErrors,[],'Uncaught browser exceptions');
  console.log('WEB-AUDIT.5c final measurements complete.');
}catch(err){
  console.error('Browser smoke failure:',err);
  console.error('Uncaught browser exceptions:',JSON.stringify(runtimeErrors));
  process.exitCode=1;
}finally{
  try{client?.close();}catch{}
  chrome?.kill('SIGKILL');
  preview?.kill('SIGKILL');
  if(profile&&resolve(profile).startsWith(join(resolve(tmpdir()),'atlas-smoke-')))
    await rm(profile,{recursive:true,force:true}).catch(()=>{});
}
