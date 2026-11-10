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
const site=process.env.ATLAS_AUDIT_SITE||'http://127.0.0.1:4184/atlas/';
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
async function measure(cdp){
const samples=[];
for(let trial=0;trial<3;trial++){
 const requests=new Map();let phase='cold';let sid;
 cdp.on('Network.requestWillBeSent',e=>{if(e.sessionId===sid)requests.set(e.params.requestId,{url:e.params.request.url,type:e.params.type,phase,started:e.params.timestamp});});
 cdp.on('Network.responseReceived',e=>{const r=requests.get(e.params.requestId);if(e.sessionId===sid&&r)Object.assign(r,{status:e.params.response.status,cache:e.params.response.fromDiskCache||e.params.response.fromServiceWorker,mime:e.params.response.mimeType});});
 cdp.on('Network.loadingFinished',e=>{const r=requests.get(e.params.requestId);if(e.sessionId===sid&&r)Object.assign(r,{encodedBytes:e.params.encodedDataLength,durationMs:(e.params.timestamp-r.started)*1000});});
 const p=await cdp.page(1440,900,false,'about:blank');sid=p.sid;await p.call('Network.enable');await p.call('Network.clearBrowserCache');const start=Date.now();await p.call('Page.navigate',{url:site});try{await p.wait("document.querySelector('.map-area')?.dataset.mapReady==='true'",'map ready');}catch(e){console.error(await p.eval("({url:location.href,text:document.body.innerText.slice(0,1200),ready:document.querySelector('.map-area')?.dataset,resources:performance.getEntriesByType('resource').map(r=>r.name)})"));await p.snap('measurement-failure.png');throw e;}const readyMs=Date.now()-start;console.log('Cold map ready',trial,readyMs);const paint=await p.eval("performance.getEntriesByType('paint').map(p=>({name:p.name,ms:p.startTime}))");
 phase='progressive-search';await p.eval("document.querySelector('.module-rail button:first-child').click()");
 const set=async(q)=>{await p.eval("(()=>{const e=document.querySelector('.search input');Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(e,"+JSON.stringify(q)+");e.dispatchEvent(new Event('input',{bubbles:true}));})()");};
 for(const name of ['Taraclia','Harghita','Bucharest','București']){for(let i=1;i<=name.length;i++){await set(name.slice(0,i));await pause(100);}await pause(1000);}
 phase='branch';await set('');await p.eval("document.querySelector('.tree-list .expand-button')?.click()");await pause(1200);
 phase='select-district';await set('Taraclia');await p.wait("[...document.querySelectorAll('.tree-line')].some(e=>e.textContent.includes('Taraclia'))",'Taraclia');await p.eval("[...document.querySelectorAll('.tree-line')].find(e=>e.textContent.includes('Taraclia')&&e.textContent.includes('ADM 4'))?.querySelector('.tree-label').click()");await pause(2000);
 const selected=await p.eval("({header:document.querySelector('.entity-title img')?.src||null,overflow:document.documentElement.scrollWidth-innerWidth})");assert(selected.overflow<=1);assert(selected.header?.includes('taraclia-coat.png'),'Exact district card local coat');
 phase='cached';const cachedStart=Date.now();await p.call('Page.reload');await p.wait("document.querySelector('.map-area')?.dataset.mapReady==='true'",'cached map ready');const cachedReadyMs=Date.now()-cachedStart;await pause(500);
 if(/after$/.test(process.env.AUDIT_LABEL||'')){const unnecessary=[...requests.values()].filter(r=>['progressive-search','branch'].includes(r.phase)&&r.type==='Image'&&!r.url.startsWith(new URL(site).origin+'/'));assert.deepEqual(unnecessary,[],'Unselected transient/expanded tree must not request external originals');}samples.push({trial,readyMs,cachedReadyMs,paint,selected,requests:[...requests.values()]});await p.snap('web-audit-5a-'+(process.env.AUDIT_LABEL||'sample')+'-'+trial+'.png');await p.close();}
const report={stage:'WEB-AUDIT.5a',label:process.env.AUDIT_LABEL||'sample',testedAt:new Date().toISOString(),conditions:{chrome:findChrome(),viewport:[1440,900],typingIntervalMs:100,settleMs:1000,network:'unthrottled actual network; no artificial image sizes; encoded transfer includes protocol/cache effects',trials:3},samples};await mkdir(resolve(outputRoot,'docs/audits/web-audit-5'),{recursive:true});await writeFile(resolve(outputRoot,'docs/audits/web-audit-5/image-network-'+report.label+'.json'),JSON.stringify(report,null,2)+'\n');console.log('Network samples recorded',report.label,samples.map(s=>({readyMs:s.readyMs,requests:s.requests.length,externalImages:s.requests.filter(r=>r.type==='Image'&&!r.url.startsWith(new URL(site).origin+'/')).length,imageEncodedBytes:s.requests.filter(r=>r.type==='Image').reduce((a,r)=>a+(r.encodedBytes||0),0)})));}

try{
  await mkdir(screenshots,{recursive:true});
  profile=await mkdtemp(join(tmpdir(),'atlas-smoke-'));
  if(!process.env.ATLAS_AUDIT_SITE)preview=spawn(process.execPath,[resolve(root,'node_modules/vite/bin/vite.js'),'preview','--host','127.0.0.1','--port','4184','--strictPort'],{cwd:root,stdio:'inherit'});
  if(!process.env.ATLAS_AUDIT_SITE)await until(async()=>(await fetch(site)).ok,'Vite preview');
  chrome=spawn(findChrome(),[
    '--headless=new','--no-sandbox','--disable-dev-shm-usage',
    '--enable-unsafe-swiftshader','--disable-gpu-sandbox',
    ...(process.env.ATLAS_CHROME_SOFTWARE==='1'?['--use-angle=swiftshader']:[]),
    '--no-first-run','--no-default-browser-check',
    '--user-data-dir='+profile,'--remote-debugging-port=9348','about:blank'
  ],{stdio:'ignore'});
  const details=await until(async()=>{
    const r=await fetch('http://127.0.0.1:9348/json/version');
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
  await measure(client);
  assert.deepEqual(runtimeErrors,[],'Uncaught browser exceptions');
  console.log('WEB-AUDIT.5a image request measurement complete.');
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
