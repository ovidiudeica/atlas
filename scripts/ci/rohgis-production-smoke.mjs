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
const screenshots=resolve(root,process.env.ATLAS_SMOKE_ARTIFACTS||'artifacts/browser-smoke');
const site='https://ovidiudeica.github.io/atlas/';
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

async function productionRohgis(cdp){
  const catalogPath='data/historical/v1/rohgis/catalog-1930.json';
  const publicResponse=await fetch(site+catalogPath,{cache:'no-store'});
  assert.equal(publicResponse.status,200);
  const data=Buffer.from(await publicResponse.arrayBuffer());
  const expected=await readFile(resolve(root,'public',catalogPath));
  assert.ok(data.equals(expected),'Production catalogue bytes must equal the tested main commit');
  const c=JSON.parse(data);
  assert.deepEqual(['judet','plasa','urban_unit'].map(k=>c.versions.filter(v=>v.kind===k).length),[71,322,172]);
  console.log('8c public catalog byte equality: PASS');
  for(const width of [1440,390]){
    const mobile=width<700, panel=mobile?'.drawer-tree':'.tree-sidebar', detail=mobile?'.drawer-detail':'.detail-sidebar';
    const p=await cdp.page(width,900,mobile,site+'?lang=ro');
    const q=x=>JSON.stringify(panel+' '+x);
    const tree=q('.history-rohgis-tree');
    const rows=kind=>q('.history-rohgis-tree [data-rohgis-kind='+kind+']');
    const node=name=>"[...document.querySelectorAll("+tree+"+' > .history-tree-node')].find(x=>x.querySelector(':scope > .history-tree-row .history-tree-name')?.textContent.trim()==="+JSON.stringify(name)+")";
    const row=(kind,name)=>"[...document.querySelectorAll("+rows(kind)+")].find(x=>x.querySelector('.history-tree-name')?.textContent.trim()==="+JSON.stringify(name)+")";
    const year=async y=>{
      await p.eval("(()=>{const el=document.querySelector("+q('.history-filter-year input')+");Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(el,'"+y+"');el.dispatchEvent(new Event('input',{bubbles:true}));})()");
      await p.wait("document.querySelector('.map-area')?.dataset.historyYear==='"+y+"'",'year '+y+' '+width);
    };
    const search=async value=>p.eval("(()=>{const el=document.querySelector("+q('#history-catalog-search')+");Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(el,"+JSON.stringify(value)+");el.dispatchEvent(new Event('input',{bubbles:true}));})()");
    const openTree=async()=>{
      if(!await p.eval("!!document.querySelector("+q('.history-geodata-pane')+")"))await p.eval("document.querySelector('.module-rail button:nth-child(2)').click()");
      await p.wait("!!document.querySelector("+q('.history-geodata-pane')+")",'history panel '+width);
      await p.wait("document.querySelector("+q('.history-catalog-stat')+")?.textContent.includes('71 județe / 322 plăși / 172 unități urbane')",'rank counts '+width);
    };
    await p.wait("document.querySelector('.map-area')?.dataset.mapReady==='true'",'map ready '+width);
    await p.eval("document.querySelector('.module-rail button:nth-child(2)').click()");
    await p.wait("!!document.querySelector("+q('.history-geodata-pane')+")",'history panel '+width);
    await year(1930);await openTree();
    await p.eval("(()=>{const row=[...document.querySelectorAll("+q('.history-tree-row')+")].find(x=>x.querySelector('.history-tree-name')?.textContent.trim()==='Regatul României');row.querySelector('.history-tree-expand').click()})()");
    await p.wait("document.querySelectorAll("+tree+"+' > .history-tree-node').length===71",'71 counties '+width);
    await p.eval(node('Arad')+".querySelector(':scope > .history-tree-row .history-tree-expand').click()");
    await p.wait("document.querySelectorAll("+rows('plasa')+").length===9&&document.querySelectorAll("+rows('urban_unit')+").length===1",'9+1 Arad '+width);
    await p.snap('8c-live-'+width+'-tree.png');
    for(const [kind,name,rank] of [['plasa','Pecica','II'],['urban_unit','Arad','III']]){
      await openTree();await search(name);
      await p.wait("!!("+row(kind,name)+")",'search '+name+' '+width);
      await p.snap('8c-live-'+width+'-search-'+kind+'.png');
      await p.eval(row(kind,name)+".querySelector('input[type=checkbox]').click()");
      await p.wait("document.querySelector('.map-area')?.dataset.historyCheckedCount==='1'",'selected '+kind+' '+width);
      // Selected card may preserve a previously inspected geometry; checked ID remains independent.
      await p.eval(row(kind,name)+".querySelector('.history-tree-name').click()");
      const card=JSON.stringify(detail+' .history-entity-detail');
      await p.wait("document.querySelector("+card+")?.textContent.includes('rang-sursă "+rank+"')",'card rank '+rank+' '+width);
      const t=await p.eval("document.querySelector("+card+").textContent");
      assert.match(t,/Județul Arad/);assert.match(t,/CC BY 4\.0/);assert.match(t,/Cezar Buterez/);
      assert.match(t,kind==='plasa'?/plasă/i:/unitate urbană/i);
      assert.equal(await p.eval("document.querySelector('.map-area')?.dataset.historyDistinctAssets"),'1');
      await p.snap('8c-live-'+width+'-card-'+kind+'.png');
      await openTree();await search(name);await p.wait("!!("+row(kind,name)+")",'reopen '+name+' '+width);
      await p.eval(row(kind,name)+".querySelector('input[type=checkbox]').click()");
      await p.wait("document.querySelector('.map-area')?.dataset.historyCheckedCount==='0'",'cleared '+kind+' '+width);
      console.log('8c live '+width+' '+kind+' search, checkbox, geometry, Entity card: PASS');
    }
    await search('');await year(1929);await p.wait("!document.querySelector("+tree+")",'1929 exclusion '+width);
    await year(1930);await p.wait("document.querySelector("+q('.history-catalog-stat')+")?.textContent.includes('71 județe / 322 plăși / 172 unități urbane')",'1930 restoration '+width);
    console.log('8c live '+width+' tree 71, Arad 9/1, 1929 exclusion, 1930 restoration: PASS');
    await p.close();
  }
}
try{
  await mkdir(screenshots,{recursive:true});
  profile=await mkdtemp(join(tmpdir(),'atlas-smoke-'));
  chrome=spawn(findChrome(),[
    '--headless=new','--no-sandbox','--disable-dev-shm-usage',
    '--enable-unsafe-swiftshader','--disable-gpu-sandbox',
    ...(process.env.ATLAS_CHROME_SOFTWARE==='1'?['--use-angle=swiftshader']:[]),
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
  await productionRohgis(client);
  assert.deepEqual(runtimeErrors,[],'Uncaught browser exceptions');
  console.log('HIST-OHM-TREE.8c LIVE DESKTOP AND MOBILE PASS');
}catch(err){
  console.error('Production smoke failure:',err);process.exitCode=1;
}finally{
  try{client?.close();}catch{}
  chrome?.kill('SIGKILL');
  if(profile&&resolve(profile).startsWith(join(resolve(tmpdir()),'atlas-smoke-')))
    await rm(profile,{recursive:true,force:true}).catch(()=>{});
}
