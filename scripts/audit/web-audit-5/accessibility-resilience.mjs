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
const root=process.env.ATLAS_AUDIT_BASELINE_ROOT||outputRoot;
const screenshots=resolve(root,'artifacts/browser-smoke');
const site=process.env.ATLAS_AUDIT_SITE||'http://127.0.0.1:4185/atlas/';
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
async function certify(cdp){
const report={stage:'WEB-AUDIT.5b',site,testedAt:new Date().toISOString(),widths:[],recovery:[],cards:[],limitations:['No NVDA/VoiceOver session was available; no full WCAG conformance claim.','CDP visual zoom2x and narrow CSS viewport reflow are recorded separately from a native browser chrome zoom audit.']};
for(const width of [360,390,700,900,1440]){
 const start=Date.now(),p=await cdp.page(width,900,width<=700,site+'?entity=osm-r1699033&lang=ro');await p.wait("document.querySelector('.map-area')?.dataset.mapReady==='true'",'ready '+width);const readyMs=Date.now()-start;
 await p.wait("!!document.querySelector('.entity-card')",'card '+width);
 const info=await p.eval(`(()=>{const box=e=>{const r=e.getBoundingClientRect();return{width:r.width,height:r.height,left:r.left,right:r.right,top:r.top,bottom:r.bottom}};return{h1:[...document.querySelectorAll('h1')].map(e=>e.textContent),overflow:document.documentElement.scrollWidth-innerWidth,targets:[...document.querySelectorAll('.entity-card .entity-actions button,.entity-card .sibling-navigation button,.entity-card .entity-breadcrumbs button,.entity-card .entity-parent-link')].filter(e=>e.getClientRects().length&&!e.disabled).map(e=>({text:e.textContent,...box(e)})),controls:[...document.querySelectorAll('.map-action-stack button')].map(e=>{const r=e.getBoundingClientRect(),hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return{...box(e),uncovered:e===hit||e.contains(hit)}}),favicon:document.querySelector('link[rel=icon]')?.href,heading2:document.querySelector('h2.sr-only')?.textContent};})()`);
 const ax=await p.call('Accessibility.getFullAXTree');const headings=ax.nodes.filter(n=>!n.ignored&&n.role?.value==='heading').map(n=>({name:n.name?.value,level:n.properties?.find(p=>p.name==='level')?.value?.value}));assert.equal(headings.filter(h=>h.level===1).length,1,'Single accessible site h1');info.accessibleHeadings=headings;assert.equal(info.h1.length,1);assert(info.h1[0].includes('Atlas'));assert(info.overflow<=1,'overflow '+width);assert(info.targets.every(t=>t.width>=44&&t.height>=44),'44px card targets '+width+JSON.stringify(info.targets));if(width>700){assert(info.controls.every(c=>c.uncovered),'Entity card covers map controls '+width);const attribution=await p.eval("(()=>{const a=document.querySelector('.maplibregl-ctrl-attrib'),r=a.getBoundingClientRect(),panel=document.querySelector('.detail-sidebar').getBoundingClientRect();return{right:r.right,panelLeft:panel.left}})()");assert(attribution.right<=attribution.panelLeft,'Attribution readable beside Entity');info.attributionBesideCard=attribution;}assert(info.heading2,'Real toolbar heading');const icon=await fetch(info.favicon);assert.equal(icon.status,200);assert(info.favicon.includes('/atlas/favicon.svg'));
 if(width<=700)await p.eval("document.querySelector('.drawer-close').click()");else await p.eval("document.querySelector('.detail-sidebar .pane-close').click()");
 await p.eval("document.querySelector('.module-rail button:first-child').click()");await p.wait("!!document.querySelector('.search-tip')",'tree');
 if(width>700){const scale=await p.eval("(()=>{const s=document.querySelector('.maplibregl-ctrl-scale').getBoundingClientRect(),t=document.querySelector('.tree-sidebar').getBoundingClientRect();return{scaleLeft:s.left,treeRight:t.right}})()");assert(scale.scaleLeft>=scale.treeRight,'Scale not covered by tree');info.scaleBesideTree=scale;}
 const contrast=await p.eval(`(()=>{const rgb=s=>(s.match(/[\\d.]+/g)||[]).map(Number),lin=v=>(v/=255)<=.04045?v/12.92:((v+.055)/1.055)**2.4,L=c=>.2126*lin(c[0])+.7152*lin(c[1])+.0722*lin(c[2]);const out=[];for(const e of document.querySelectorAll('.search-tip,.node-level,.tree-footnote')){let n=e,b;while(n){b=rgb(getComputedStyle(n).backgroundColor);if(b.length===3||b[3]===1)break;n=n.parentElement;}b=b?.length>=3?b:[255,255,255];const c=rgb(getComputedStyle(e).color),a=L(c),z=L(b);out.push({selector:e.className,color:getComputedStyle(e).color,background:b,ratio:(Math.max(a,z)+.05)/(Math.min(a,z)+.05)});}return out;})()`);assert(contrast.length>=3&&contrast.every(c=>c.ratio>=4.5),'Text contrast '+width+JSON.stringify(contrast));
 await p.snap('web-audit-5b-'+width+'.png');await p.call('Emulation.setPageScaleFactor',{pageScaleFactor:2});const zoom=await p.eval("({scale:visualViewport.scale,viewport:visualViewport.width,documentOverflow:document.documentElement.scrollWidth-innerWidth})");assert.equal(zoom.scale,2);assert(zoom.documentOverflow<=1);await p.call('Emulation.setPageScaleFactor',{pageScaleFactor:1});report.widths.push({width,readyMs,info,contrast,visualZoom2x:zoom});await p.close();
}
// Real HTTP503 interception; native retry retains exact identity and user preferences.
for(const scenario of [{lang:'ro',id:'osm-r1699033',shard:'roots-detailed',root:true},{lang:'en',id:'osm-r2248660',shard:'ro-adm-04-detailed',root:false}]){
 if(!scenario.root){const catalog=JSON.parse((await import('node:zlib')).gunzipSync(await readFile(resolve(root,'public/data/phase4/catalog.json.gz'))));const holder=catalog.entities.find(n=>n.id===scenario.id);assert(holder,'Exact holder in certified catalogue');scenario.shard=holder.geometryShard+'-detailed';}console.log('Recovery scenario',scenario);const p=await cdp.page(1440,900,false,'about:blank');let blocked=true,attempts=0;
 cdp.on('Fetch.requestPaused',e=>{if(e.sessionId!==p.sid)return;attempts++;const params={requestId:e.params.requestId};p.call(blocked?'Fetch.fulfillRequest':'Fetch.continueRequest',blocked?{...params,responseCode:503,responseHeaders:[{name:'Cache-Control',value:'no-store'}],body:Buffer.from('Controlled test failure').toString('base64')}:params).catch(err=>runtimeErrors.push(err.message));});
 await p.call('Network.enable');await p.call('Network.clearBrowserCache');await p.call('Fetch.enable',{patterns:[{urlPattern:'*data/phase4/geometry/'+scenario.shard+'.geojson.gz*',requestStage:'Request'}]});await p.call('Page.navigate',{url:site+'?entity='+scenario.id+'&lang='+scenario.lang+'&simple=0'});
 if(!scenario.root){await p.wait("document.querySelector('.map-area')?.dataset.mapReady==='true'",'before entity failure');await p.eval("document.querySelector('.module-rail button:first-child').click()");await p.wait("!!document.querySelector('input[aria-label=\"OSM 4\"]')",'active filter available');await p.eval("document.querySelector('.osm-level-filter').open=true;document.querySelector('input[aria-label=\"OSM 4\"]').click()");await p.wait("!!document.querySelector('.entity-actions button')",'show action');await p.eval("document.querySelector('.entity-actions button').click()");}
 try{await p.wait("!!document.querySelector('.geometry-retry')&&!document.querySelector('.geometry-retry').disabled",'geometry error visible');}catch(e){console.error('Recovery failure',scenario,attempts,await p.eval("({text:document.body.innerText.slice(-1800),files:performance.getEntriesByType('resource').filter(r=>r.name.includes('geometry/')).map(r=>r.name)})"));await p.snap('recovery-failure.png');throw e;}
 if(scenario.root){await p.eval("document.querySelector('.module-rail button:first-child').click()");await p.wait("!!document.querySelector('input[aria-label=\"OSM 2\"]')",'root active filter available');await p.eval("document.querySelector('.osm-level-filter').open=true;document.querySelector('input[aria-label=\"OSM 2\"]').click()");}
 const state=()=>p.eval("({url:location.href,language:document.documentElement.lang,title:document.querySelector('.entity-title h3')?.textContent,checked:[...document.querySelectorAll('input[type=checkbox]')].map(e=>[e.getAttribute('aria-label'),e.checked]),message:document.querySelector('.atlas-map-status')?.textContent})");const before=await state();assert(before.checked.some(([name,value])=>name==='OSM '+(scenario.root?'2':'4')&&value),'Non-empty active filter proof');assert(before.title,'Selected card retained with filter panel open');assert(before.message.includes(scenario.lang==='ro'?'Reîncearcă':'Retry'));const attemptsBeforeRetry=attempts;console.log('Before manual retry',scenario.id,attemptsBeforeRetry);blocked=false;const retryStart=Date.now();await p.eval("const b=document.querySelector('.geometry-retry');b.click();b.click()");await p.wait("!document.querySelector('.geometry-retry')&&!document.querySelector('.atlas-map-status[role=alert]')&&document.querySelector('.map-area')?.dataset.mapReady==='true'",'retry recovered');const elapsedMs=Date.now()-retryStart,after=await state();assert(attemptsBeforeRetry>=1,'A controlled failure really occurred');assert.equal(attempts-attemptsBeforeRetry,1,'Double Retry click starts exactly one request, independently of earlier filter actions');for(const k of ['url','language','title','checked'])assert.deepEqual(after[k],before[k],'Retry preserves '+k);report.recovery.push({scenario,attemptsBeforeRetry,attemptsAfterRetry:attempts,manualRetryRequests:attempts-attemptsBeforeRetry,elapsedMs,before,after});await p.snap('web-audit-5b-recovery-'+scenario.lang+'.png');await p.close();
}
for(const id of ['osm-r90689','osm-r58974','osm-r377733','osm-r1748490','osm-r1691801','osm-r2248660','osm-r2260187','osm-r10664180','osm-r1699033','osm-r9982547','osm-r14772859']){
 const p=await cdp.page(1440,900,false,site+'?entity='+id+'&lang=ro');await p.wait("!!document.querySelector('.entity-card .symbol-audit')",'symbol record '+id);const info=await p.eval(`(()=>{const c=document.querySelector('.entity-card');return{id:${JSON.stringify(id)},identity:c.querySelector('.metadata')?.textContent,text:c.innerText,header:c.querySelector('.entity-title img')?.src||null,gallery:[...c.querySelectorAll('.territory-symbol-gallery figure')].map(e=>({image:e.querySelector('img')?.src||null,neutral:!!e.querySelector('.territorial-symbol-fallback'),source:[...e.querySelectorAll('a')].map(a=>a.href)})),audit:[...c.querySelectorAll('[data-symbol-verdict]')].map(e=>e.dataset.symbolVerdict),overflow:document.documentElement.scrollWidth-innerWidth};})()`);assert(info.overflow<=1);assert(info.text.includes(id.slice(5))||info.text.includes(id),'Card exact ID '+id);if(['osm-r2248660','osm-r10664180','osm-r1699033'].includes(id))assert(info.header?.includes('/symbols/sim-r8/'),'Exact approved local coat '+id);if(id==='osm-r377733'||id==='osm-r14772859')assert.equal(info.header,null,'Neutral absent/invalidated coat');report.cards.push(info);await p.close();
}
await mkdir(resolve(root,'docs/audits/web-audit-5'),{recursive:true});await writeFile(resolve(root,'docs/audits/web-audit-5/accessibility-resilience-'+(process.env.AUDIT_LABEL||'local')+'.json'),JSON.stringify(report,null,2)+'\n');console.log('WEB-AUDIT.5b browser checks PASS',report.widths.length,'viewports',report.recovery.length,'controlled network failures',report.cards.length,'exact-ID cards');
}

try{
  await mkdir(screenshots,{recursive:true});
  profile=await mkdtemp(join(tmpdir(),'atlas-smoke-'));
  if(!process.env.ATLAS_AUDIT_SITE)preview=spawn(process.execPath,[resolve(root,'node_modules/vite/bin/vite.js'),'preview','--host','127.0.0.1','--port','4185','--strictPort'],{cwd:root,stdio:'inherit'});
  if(!process.env.ATLAS_AUDIT_SITE)await until(async()=>(await fetch(site)).ok,'Vite preview');
  chrome=spawn(findChrome(),[
    '--headless=new','--no-sandbox','--disable-dev-shm-usage',
    '--enable-unsafe-swiftshader','--disable-gpu-sandbox',
    ...(process.env.ATLAS_CHROME_SOFTWARE==='1'?['--use-angle=swiftshader']:[]),
    '--no-first-run','--no-default-browser-check',
    '--user-data-dir='+profile,'--remote-debugging-port=9358','about:blank'
  ],{stdio:'ignore'});
  const details=await until(async()=>{
    const r=await fetch('http://127.0.0.1:9358/json/version');
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
  await certify(client);
  assert.deepEqual(runtimeErrors,[],'Uncaught browser exceptions');
  console.log('WEB-AUDIT.5b browser verification complete.');
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
