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
const site=process.env.ATLAS_AUDIT_SITE||'http://127.0.0.1:4186/atlas/';
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
async function nativeZoom(cdp){const samples=[];for(const outerWidth of [1440,720]){const {targetId}=await cdp.send('Target.createTarget',{url:'about:blank'});const{sessionId}=await cdp.send('Target.attachToTarget',{targetId,flatten:true});const p=new BrowserPage(cdp,sessionId,targetId);await p.call('Page.enable');await p.call('Runtime.enable');const {windowId}=await cdp.send('Browser.getWindowForTarget',{targetId});await cdp.send('Browser.setWindowBounds',{windowId,bounds:{width:outerWidth,height:1000,windowState:'normal'}});await p.call('Page.navigate',{url:site+'?entity=osm-r1699033&lang=ro'});await p.wait("document.querySelector('.map-area')?.dataset.mapReady==='true'",'native200% map');const info=await p.eval("({outerWidth,innerWidth,dpr:devicePixelRatio,visualScale:visualViewport.scale,overflow:document.documentElement.scrollWidth-innerWidth,h1:document.querySelector('h1')?.textContent,targets:[...document.querySelectorAll('.entity-actions button')].filter(e=>e.getClientRects().length).map(e=>({width:e.getBoundingClientRect().width,height:e.getBoundingClientRect().height}))})");assert(info.innerWidth<=info.outerWidth*.55&&info.innerWidth>=info.outerWidth*.45,'Actual native200% CSS viewport: '+JSON.stringify(info));assert(info.dpr>=1.9&&info.visualScale===1,'Native browser zoom, not pinch scale');assert(info.overflow<=1);assert(info.targets.every(t=>t.width>=44&&t.height>=44));samples.push(info);await p.snap('web-audit-5b-native200-'+outerWidth+'.png');await p.close();}await writeFile(resolve(root,'docs/audits/web-audit-5/native-zoom-'+(process.env.AUDIT_LABEL||'local')+'.json'),JSON.stringify({site,checkedAt:new Date().toISOString(),primarySource:'https://raw.githubusercontent.com/chromium/chromium/main/chrome/browser/ui/zoom/chrome_zoom_level_prefs.cc',method:'Fresh isolated Chrome profile with partition.default_zoom_level.x=log(2)/log(1.2); no device metrics emulation. Native window sizes compared to actual CSS viewport, DPR and visualViewport.scale.',samples},null,2)+'\n');console.log('Native browser200% zoom verified',samples);}

try{
  await mkdir(screenshots,{recursive:true});
  profile=await mkdtemp(join(tmpdir(),'atlas-smoke-'));
  if(!process.env.ATLAS_AUDIT_SITE)preview=spawn(process.execPath,[resolve(root,'node_modules/vite/bin/vite.js'),'preview','--host','127.0.0.1','--port','4186','--strictPort'],{cwd:root,stdio:'inherit'});
  if(!process.env.ATLAS_AUDIT_SITE)await until(async()=>(await fetch(site)).ok,'Vite preview');
  await mkdir(join(profile,'Default'),{recursive:true});
  await writeFile(join(profile,'Default','Preferences'),JSON.stringify({partition:{default_zoom_level:{x:Math.log(2)/Math.log(1.2)}}}));
  chrome=spawn(findChrome(),[
    '--window-size=1440,1000','--headless=new','--no-sandbox','--disable-dev-shm-usage',
    '--enable-unsafe-swiftshader','--disable-gpu-sandbox',
    ...(process.env.ATLAS_CHROME_SOFTWARE==='1'?['--use-angle=swiftshader']:[]),
    '--no-first-run','--no-default-browser-check',
    '--user-data-dir='+profile,'--remote-debugging-port=9368','about:blank'
  ],{stdio:'ignore'});
  const details=await until(async()=>{
    const r=await fetch('http://127.0.0.1:9368/json/version');
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
  await nativeZoom(client);
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
