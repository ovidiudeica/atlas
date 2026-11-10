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
const site=process.env.ATLAS_AUDIT_SITE||'http://127.0.0.1:4189/atlas/';
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
async function auditTargets(cdp){const out={stage:'WEB-AUDIT.5c',site,checkedAt:new Date().toISOString(),criterion:'https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html',method:'Semantic controls measured in CSS pixels; associated form labels count as effective click areas.24px circles assess undersize spacing. Inline/shape/equivalent exceptions remain contextual review, not full WCAG certification.',samples:[]};
for(const width of [360,390,700,900,1440]){const p=await cdp.page(width,900,width<=700,site+'?entity=osm-r2248660&lang=en&simple=1');await p.wait("document.querySelector('.map-area')?.dataset.mapReady==='true'&&!!document.querySelector('.entity-card')",'target audit ready');const collect=async state=>{const data=await p.eval(`(()=>{const visible=e=>e.getClientRects().length&&!e.closest('[inert]'),dialog=[...document.querySelectorAll('.drawer-screen .drawer,[aria-modal=true]')].find(visible),root=dialog||document;const nodes=[...root.querySelectorAll('button,input,select,summary,a[href],[role=button]')].filter(e=>visible(e)&&!e.disabled&&e.getAttribute('aria-disabled')!=='true');const effective=[];for(const e of nodes){const target=e.labels?.[0]||e;if(effective.some(t=>t.target===target))continue;const r=target.getBoundingClientRect();if(!r.width||!r.height)continue;effective.push({target,e,rect:{x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,bottom:r.bottom},small:r.width<23.99||r.height<23.99});}return effective.map((t,i)=>{const a=t.rect,cx=a.x+a.width/2,cy=a.y+a.height/2;const conflicts=t.small?effective.flatMap((u,j)=>{if(i===j||t.target.contains(u.target)||u.target.contains(t.target))return[];const b=u.rect,dx=Math.max(b.x-cx,0,cx-b.right),dy=Math.max(b.y-cy,0,cy-b.bottom),circleOverlap=u.small&&Math.hypot(cx-(b.x+b.width/2),cy-(b.y+b.height/2))<23.99;if(Math.hypot(dx,dy)<11.99||circleOverlap)return[{text:u.e.getAttribute('aria-label')||u.e.textContent?.trim().slice(0,90),tag:u.e.tagName,rect:b}];return[]}):[];return{tag:t.e.tagName,type:t.e.type||null,className:t.e.className,text:t.e.getAttribute('aria-label')||t.e.textContent?.trim().slice(0,100),href:t.e.href||null,usesLabel:t.target!==t.e,rect:a,small:t.small,inlineCandidate:t.e.tagName==='A'&&getComputedStyle(t.e).display==='inline',conflicts};});})()`);out.samples.push({width,state,targets:data,undersized:data.filter(t=>t.small).length,spacingConflicts:data.filter(t=>t.small&&t.conflicts.length),nonLinkSpacingCandidates:data.filter(t=>t.small&&t.conflicts.length&&t.tag!=='A')});};await collect('card');await p.eval("[...document.querySelectorAll('.detail-sidebar .pane-close,.drawer-close')].find(e=>e.getClientRects().length)?.click()");await collect('map');await p.eval("document.querySelector('.module-rail button:first-child').click()");await p.wait("[...document.querySelectorAll('.search input')].some(e=>e.getClientRects().length)",'tree targets');await p.eval("[...document.querySelectorAll('.osm-level-filter')].filter(e=>e.getClientRects().length).forEach(e=>e.open=true)");await collect('tree-and-filters');await p.eval("document.querySelector('.atlas-tools-toggle').click()");await p.wait("!!document.querySelector('[aria-controls=atlas-section-settings]')",'settings targets');await p.eval("document.querySelector('[aria-controls=atlas-section-settings]').click()");await collect('tools-settings');await p.close();}
 assert(out.samples.every(s=>s.nonLinkSpacingCandidates.length===0),'No unresolved non-link control spacing conflicts');
 await writeFile(resolve(root,'docs/audits/web-audit-5/target-areas-'+(process.env.AUDIT_LABEL||'local')+'.json'),JSON.stringify(out,null,2)+'\n');console.log('Target-area scan',out.samples.map(s=>({width:s.width,state:s.state,targets:s.targets.length,small:s.undersized,nonLinkCandidates:s.nonLinkSpacingCandidates.map(c=>({text:c.text,tag:c.tag,className:c.className,rect:c.rect,near:c.conflicts.map(x=>x.text)}))})));}

try{
  await mkdir(screenshots,{recursive:true});
  profile=await mkdtemp(join(tmpdir(),'atlas-smoke-'));
  if(!process.env.ATLAS_AUDIT_SITE)preview=spawn(process.execPath,[resolve(root,'node_modules/vite/bin/vite.js'),'preview','--host','127.0.0.1','--port','4189','--strictPort'],{cwd:root,stdio:'inherit'});
  if(!process.env.ATLAS_AUDIT_SITE)await until(async()=>(await fetch(site)).ok,'Vite preview');
  chrome=spawn(findChrome(),[
    '--headless=new','--no-sandbox','--disable-dev-shm-usage',
    '--enable-unsafe-swiftshader','--disable-gpu-sandbox',
    ...(process.env.ATLAS_CHROME_SOFTWARE==='1'?['--use-angle=swiftshader']:[]),
    '--no-first-run','--no-default-browser-check',
    '--user-data-dir='+profile,'--remote-debugging-port=9398','about:blank'
  ],{stdio:'ignore'});
  const details=await until(async()=>{
    const r=await fetch('http://127.0.0.1:9398/json/version');
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
  await auditTargets(client);
  assert.deepEqual(runtimeErrors,[],'Uncaught browser exceptions');
  console.log('WEB-AUDIT.5c target-area review recorded.');
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
