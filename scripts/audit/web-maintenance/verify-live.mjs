/** Limited operational/AX checks. Not a screen-reader or full WCAG test. */
import { spawn, spawnSync } from 'node:child_process';
import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const outputRoot=fileURLToPath(new URL('../../../',import.meta.url));
const root=process.env.ATLAS_AUDIT_BASELINE_ROOT||outputRoot;
const screenshots=resolve(root,'artifacts/web-maintenance');
const site=process.env.ATLAS_AUDIT_SITE||'https://ovidiudeica.github.io/atlas/';
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
const key=async(p,key,code,k,text,modifiers=0)=>{await p.call('Input.dispatchKeyEvent',{type:'keyDown',key,code,windowsVirtualKeyCode:k,modifiers,...(text?{text}:{})});await p.call('Input.dispatchKeyEvent',{type:'keyUp',key,code,windowsVirtualKeyCode:k,modifiers});};
async function check(cdp){
 const report={stage:'WEB-MAINTENANCE',site,checkedAt:new Date().toISOString(),browser:await cdp.send('Browser.getVersion'),method:'Fresh isolated headless Chromium; real CDP key input, DOM and Accessibility tree; controlled synthetic503 before external network, not actual service outage.',assistiveTechnology:'ASSISTIVE_TECH_VALIDATION_PENDING',screenReaderActuallyUsed:false,widths:[],dependencies:{},limitations:['No NVDA/VoiceOver session. AX/DOM and key input are distinct from speech output.','Tile failure may leave a blank basemap; source-ready certifies local vector availability, not tile completion.']};
 for(const width of [1440,390]){console.log('Checking viewport',width);
  const p=await cdp.page(width,900,width===390,site+'?entity=osm-r1699033&lang=ro');await p.wait("document.querySelector('.map-area')?.dataset.mapReady==='true'&&!!document.querySelector('.entity-card')",'map and permalink card');
  const info=await p.eval("({language:document.documentElement.lang,title:document.querySelector('h1')?.textContent,moduleNames:[...document.querySelectorAll('.module-rail button')].map(e=>e.getAttribute('aria-label')),languages:[...document.querySelectorAll('.language button')].map(e=>({text:e.textContent,pressed:e.getAttribute('aria-pressed')})),entity:location.search,card:document.querySelector('.entity-title h3')?.textContent})");
  assert.equal(info.moduleNames.length,6);assert(info.moduleNames.every(Boolean));assert.equal(info.language,'ro');assert(info.title.includes('Atlas'));assert(info.languages.some(b=>b.text==='RO'&&b.pressed==='true'));assert(info.entity.includes('osm-r1699033'));info.initialRomanianMetadata=await p.eval("[...document.querySelectorAll('.entity-card dt,.entity-card dd')].map(e=>e.textContent)");
  if(width===390)await p.eval("document.querySelector('.drawer-close').click()");else await p.eval("document.querySelector('.detail-sidebar .pane-close').click()");
  await p.eval('document.activeElement?.blur()');await key(p,'/','Slash',191,'/');await p.wait("document.activeElement?.matches('.search input')",'Slash search focus');await p.call('Input.insertText',{text:'Harghita'});await p.wait("!!document.querySelector('.tree-label')&&document.querySelector('.tree-list')?.textContent.includes('Harghita')",'search result');info.nameSearchResults=await p.eval("[...document.querySelectorAll('.tree-label')].filter(e=>e.getClientRects().length).slice(0,6).map(e=>e.getAttribute('aria-label'))");await key(p,'a','KeyA',65,undefined,2);await p.call('Input.insertText',{text:'osm-r2248660'});await p.wait("[...document.querySelectorAll('.tree-line')].filter(e=>e.getClientRects().length).length===1&&document.activeElement.value==='osm-r2248660'",'exact-ID search result');await key(p,'Enter','Enter',13,'\r');await p.wait("[...document.querySelectorAll('.entity-title img')].some(e=>e.src.includes('harghita-coat.png'))",'Enter exact-ID');info.searchExactID='osm-r2248660';console.log('Exact search PASS',width);
  await key(p,'Escape','Escape',27);await p.wait("![...document.querySelectorAll('.entity-card')].some(e=>e.getClientRects().length)",'foremost Entity closes before module-only test');
  if(await p.eval("document.querySelector('.module-rail button:first-child').getAttribute('aria-expanded')==='true'"))await p.eval("document.querySelector('.module-rail button:first-child').click()");
  await p.wait("document.querySelector('.module-rail button:first-child').getAttribute('aria-expanded')==='false'",'module closed before key activation');await p.eval("document.querySelector('.module-rail button:first-child').focus()");await key(p,'Enter','Enter',13,'\r');await p.wait("document.querySelector('.module-rail button:first-child').getAttribute('aria-expanded')==='true'",'keyboard module open');
  info.expandedControls=await p.eval("[...document.querySelectorAll('[aria-expanded=true][aria-controls]')].map(e=>({name:e.getAttribute('aria-label')||e.textContent,id:e.getAttribute('aria-controls'),exists:!!document.getElementById(e.getAttribute('aria-controls'))}))");assert(info.expandedControls.every(e=>e.exists));
  const ax=await p.call('Accessibility.getFullAXTree');const nodes=ax.nodes.filter(n=>!n.ignored);info.headings=nodes.filter(n=>n.role?.value==='heading').map(n=>({name:n.name?.value,level:n.properties?.find(p=>p.name==='level')?.value.value}));assert.equal(info.headings.filter(h=>h.level===1).length,1);info.checkboxStates=nodes.filter(n=>n.role?.value==='checkbox').map(n=>({name:n.name?.value,checked:n.properties?.find(p=>p.name==='checked')?.value.value}));assert(info.checkboxStates.length>0&&info.checkboxStates.every(n=>n.name&&n.checked!==undefined));
  await key(p,'Tab','Tab',9);info.tabFocus=await p.eval("({tag:document.activeElement.tagName,name:document.activeElement.getAttribute('aria-label')||document.activeElement.textContent?.slice(0,80)})");await key(p,'Tab','Tab',9,undefined,8);info.shiftTabFocus=await p.eval("({tag:document.activeElement.tagName,name:document.activeElement.getAttribute('aria-label')||document.activeElement.textContent?.slice(0,80)})");
  await key(p,'Escape','Escape',27);await p.wait("document.querySelector('.module-rail button:first-child').getAttribute('aria-expanded')==='false'&&document.activeElement===document.querySelector('.module-rail button:first-child')",'Escape restores opener focus');info.escapeFocusReturned=true;
  await p.eval("[...document.querySelectorAll('.language button')].find(b=>b.textContent==='EN').click()");await p.wait("document.documentElement.lang==='en'",'EN language');if(!await p.eval("[...document.querySelectorAll('.entity-card')].some(e=>e.getClientRects().length)"))await p.eval("document.querySelector('.header-entity-action').click()");
  info.card=await p.eval("(()=>{const c=[...document.querySelectorAll('.entity-card')].find(e=>e.getClientRects().length);return{title:c.querySelector('.entity-title h3')?.textContent,headings:[...c.querySelectorAll('h3,h4')].map(e=>e.textContent),metadata:[...c.querySelectorAll('dt,dd')].map(e=>e.textContent),symbols:[...c.querySelectorAll('.territory-symbol-gallery figure')].map(e=>({caption:e.querySelector('figcaption')?.textContent,alt:e.querySelector('img')?.alt,fallback:e.querySelector('[role=img]')?.getAttribute('aria-label')})),sourceLinks:[...c.querySelectorAll('.territory-symbol-source')].map(e=>({text:e.textContent,url:e.href})),warnings:[...c.querySelectorAll('.source-caveat,.territory-symbol-status,.territory-symbol-note,.symbol-audit')].map(e=>e.textContent)}})()");assert(info.card.sourceLinks.length>0);assert.equal(info.card.symbols.length,2);const cardAX=await p.call('Accessibility.getFullAXTree');info.cardAccessibleControls=cardAX.nodes.filter(n=>!n.ignored&&['button','link','image','img','alert','status'].includes(n.role?.value)).map(n=>({role:n.role.value,name:n.name?.value}));
  const dialogs=await p.eval("[...document.querySelectorAll('[role=dialog]')].filter(e=>e.getClientRects().length).map(e=>({name:e.getAttribute('aria-label'),modal:e.getAttribute('aria-modal')}))");if(width===390){assert(dialogs.length>0&&dialogs.every(d=>d.name&&d.modal==='true'));}info.dialogs=dialogs;
  await p.call('Page.navigate',{url:site+'?entity=osm-r2248660&lang=en'});await p.wait("document.querySelector('.map-area')?.dataset.mapReady==='true'&&[...document.querySelectorAll('.entity-title img')].some(e=>e.src.includes('harghita-coat.png'))",'direct permalink');const origin=await p.eval('performance.timeOrigin');await p.call('Page.reload');await p.wait("performance.timeOrigin!=="+origin+"&&document.querySelector('.map-area')?.dataset.mapReady==='true'&&location.search.includes('osm-r2248660')&&document.documentElement.lang==='en'",'permalink reload');assert(await p.eval('document.documentElement.scrollWidth<=innerWidth+1'));info.permalinkRestored=true;report.widths.push({width,...info});console.log('Viewport PASS',width);await p.close();
 }
 console.log('Checking dependency isolation');const p=await cdp.page(1440,900,false,'about:blank'),failed=[],pending=[],protocolErrors=[],canceled=new Set();cdp.on('Network.loadingFailed',e=>{if(e.sessionId===p.sid&&e.params.canceled)canceled.add(e.params.requestId);});cdp.on('Fetch.requestPaused',e=>{if(e.sessionId!==p.sid)return;failed.push({url:e.params.request.url,resourceType:e.params.resourceType});pending.push(p.call('Fetch.fulfillRequest',{requestId:e.params.requestId,responseCode:503,responseHeaders:[{name:'Cache-Control',value:'no-store'}],body:Buffer.from('Controlled operational dependency failure').toString('base64')}).catch(err=>protocolErrors.push({networkID:e.params.networkId,error:err.message})));});
 await p.call('Network.enable');await p.call('Network.setCacheDisabled',{cacheDisabled:true});await p.call('Fetch.enable',{patterns:[{urlPattern:'https://upload.wikimedia.org/*',requestStage:'Request'},{urlPattern:'https://tile.openstreetmap.org/*',requestStage:'Request'}]});await p.call('Page.navigate',{url:site+'?entity=osm-r9982547&lang=en'});await p.wait("document.querySelector('.map-area')?.dataset.mapReady==='true'",'vectors survive tile outage');await p.wait("!!document.querySelector('.entity-title .territorial-symbol-fallback[data-symbol-state=unavailable]')",'neutral Commons failure');
 const state=()=>p.eval("({search:location.search,title:document.querySelector('.entity-title h3')?.textContent,neutral:!!document.querySelector('.entity-title .territorial-symbol-fallback[data-symbol-state=unavailable]'),headerImage:document.querySelector('.entity-title img')?.src||null,sources:[...document.querySelectorAll('.entity-card .territory-symbol-source')].map(e=>e.href),mapReady:document.querySelector('.map-area').dataset.mapReady,geometryError:!!document.querySelector('.geometry-retry')})");const before=await state();console.log('Dependency selected state',JSON.stringify(before));assert(before.search.includes('osm-r9982547')&&before.title==='Talmaciu'&&before.neutral&&before.headerImage===null&&before.sources.length>0&&!before.geometryError);assert(failed.some(r=>r.url.includes('upload.wikimedia.org')));await until(()=>failed.some(r=>r.url.includes('tile.openstreetmap.org')),'actual tile interception');
 const doc=await cdp.page(800,700,false,'about:blank');let docAttempt=null;const source=before.sources.find(u=>u.startsWith('https://'));assert(source);cdp.on('Fetch.requestPaused',e=>{if(e.sessionId!==doc.sid)return;docAttempt={url:e.params.request.url,syntheticStatus:503};doc.call('Fetch.fulfillRequest',{requestId:e.params.requestId,responseCode:503,responseHeaders:[{name:'Content-Type',value:'text/plain'}],body:Buffer.from('Controlled unavailable source document').toString('base64')}).catch(err=>runtimeErrors.push(err.message));});await doc.call('Fetch.enable',{patterns:[{urlPattern:source,requestStage:'Request'}]});await doc.call('Page.navigate',{url:source});await doc.wait("document.body?.textContent.includes('Controlled unavailable source document')",'source document failure');assert.deepEqual(await state(),before,'External source outage cannot change selected holder/source');await doc.close();
 await pause(300);await p.call('Fetch.disable');await Promise.all(pending);for(const e of protocolErrors)assert(e.error.includes('Invalid InterceptionId')&&canceled.has(e.networkID),'Protocol failure must match an actually canceled network request: '+JSON.stringify(e));report.dependencies={canceledIntercepts:protocolErrors,canceledNetworkIDs:[...canceled],syntheticHTTPStatus:503,requests:failed,selectedHolder:before,sourceDocument:docAttempt,neutralCoatNoFlagSubstitution:true,localVectorCatalogUnaffected:true};await p.close();
 assert.deepEqual(runtimeErrors,[],'No uncaught JavaScript exceptions');const output=process.env.MAINTENANCE_REPORT||'docs/audits/web-maintenance/live-health.json';await writeFile(resolve(root,output),JSON.stringify(report,null,2)+'\n');console.log('WEB-MAINTENANCE live checks PASS',report.widths.length,'widths; Commons, tiles and source-document synthetic failures isolated; no screen-reader claim');
}
try{
 await mkdir(screenshots,{recursive:true});profile=await mkdtemp(join(tmpdir(),'atlas-maintenance-'));
 chrome=spawn(findChrome(),['--headless=new','--no-sandbox','--disable-dev-shm-usage','--enable-unsafe-swiftshader','--disable-gpu-sandbox',...(process.env.ATLAS_CHROME_SOFTWARE==='1'?['--use-angle=swiftshader']:[]),'--no-first-run','--no-default-browser-check','--user-data-dir='+profile,'--remote-debugging-port=9408','about:blank'],{stdio:'ignore'});
 const details=await until(async()=>{const r=await fetch('http://127.0.0.1:9408/json/version');return r.ok?r.json():null;},'Chromium');const socket=new WebSocket(details.webSocketDebuggerUrl);await new Promise((ok,fail)=>{socket.addEventListener('open',ok,{once:true});socket.addEventListener('error',fail,{once:true});});client=new CDP(socket);client.on('Runtime.exceptionThrown',e=>runtimeErrors.push(e.params?.exceptionDetails?.exception?.description||e.params?.exceptionDetails?.text));await check(client);
}catch(e){console.error(e);process.exitCode=1;}finally{try{client?.close();}catch{}chrome?.kill('SIGKILL');const resolved=profile&&resolve(profile);if(resolved?.startsWith(join(resolve(tmpdir()),'atlas-maintenance-')))await rm(resolved,{recursive:true,force:true}).catch(()=>{});}
