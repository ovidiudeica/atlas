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

const urls=['https://legislatie.just.ro/ImaginiDinActe/311970_A4649.jpg','https://legislatie.just.ro/Public/DetaliiDocument/309686','https://legislatie.just.ro/Public/FormaPrintabila/00000G0STVGKTKE913V0YATREHWFG071'];const rows=[];
try{profile=await mkdtemp(join(tmpdir(),'atlas-sim-r6-sources-'));chrome=spawn(findChrome(),['--headless=new','--no-sandbox','--no-first-run',...(process.env.ATLAS_SOURCE_HTTP1?['--disable-http2']:[]),'--disable-gpu','--remote-debugging-port=9234','--user-data-dir='+profile],{windowsHide:true,stdio:'ignore'});const version=await until(async()=>{const r=await fetch('http://127.0.0.1:9234/json/version');return r.ok?await r.json():null;},'Source browser',15000);const socket=new WebSocket(version.webSocketDebuggerUrl);await new Promise((ok,no)=>{socket.addEventListener('open',ok,{once:true});socket.addEventListener('error',no,{once:true});});client=new CDP(socket);
for(let i=0;i<urls.length;i++){const url=urls[i],r={url,checkedAt:new Date().toISOString(),method:'Chromium native network, ordinary certificate validation',http2Disabled:!!process.env.ATLAS_SOURCE_HTTP1};try{const p=await client.page(1000,800,false);await p.call('Network.enable');let response;client.on('Network.responseReceived',m=>{if(m.sessionId===p.sid&&m.params.type==='Document')response=m.params;});const nav=await p.call('Page.navigate',{url});await pause(3000);r.navigationError=nav.errorText||null;r.title=await p.eval('document.title');if(response){r.status=response.response.status;r.mimeType=response.response.mimeType;r.finalUrl=response.response.url;const body=await p.call('Network.getResponseBody',{requestId:response.requestId});const bytes=Buffer.from(body.body,body.base64Encoded?'base64':'utf8');r.bytes=bytes.length;const{createHash}=await import('node:crypto');r.sha256=createHash('sha256').update(bytes).digest('hex');await writeFile('work/sim-r6-evidence/chromium-source-'+i+'.bin',bytes);}await p.close();}catch(e){r.error=String(e);}rows.push(r);}await writeFile('docs/audits/sim-r6/browser-source'+(process.env.ATLAS_SOURCE_HTTP1?'-http1':'')+'-attempts.json',JSON.stringify(rows,null,2));console.log(rows);
}finally{client?.close();chrome?.kill('SIGKILL');if(profile&&resolve(profile).startsWith(join(resolve(tmpdir()),'atlas-sim-r6-sources-')))await rm(profile,{recursive:true,force:true}).catch(()=>{});}
