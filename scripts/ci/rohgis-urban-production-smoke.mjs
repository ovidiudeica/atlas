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
  const paths=['data/historical/v1/rohgis/catalog-1930.json','data/historical/v1/rohgis/urban-classification-1930.json'];
  const expected=await Promise.all(paths.map(path=>readFile(resolve(root,'public',path))));
  const deadline=Date.now()+12*60*1000;
  // Do not certify a prior deployment. Wait boundedly for exact bytes from the merged commit.
  for(;;){
    try{
      const bodies=await Promise.all(paths.map(async path=>{
        const res=await fetch(site+path+'?audit=9c-e738bc6',{cache:'no-store',signal:AbortSignal.timeout(15000)});
        if(!res.ok)throw Error(path+' HTTP '+res.status);
        return Buffer.from(await res.arrayBuffer());
      }));
      if(bodies.every((body,i)=>body.equals(expected[i])))break;
    }catch(e){console.log('9c waiting for Pages deployment:',e.message)}
    if(Date.now()>deadline)throw Error('9c target deployment not visible within audit window');
    await pause(10000);
  }
  const c=JSON.parse(expected[0]),d=JSON.parse(expected[1]);
  assert.deepEqual(['judet','plasa','urban_unit'].map(k=>c.versions.filter(v=>v.kind===k).length),[71,322,172]);
  assert.deepEqual(['municipiu','oraș'].map(k=>d.records.filter(v=>v.subtype===k).length),[20,152]);
  assert.deepEqual(['OFFICIAL_TEXT_OCR_ATTESTATION','1930_STATISTICAL_SUBTYPE_ATTESTED_OCR','OTHER_OFFICIAL_ATTESTATION_OCR'].map(k=>d.records.filter(v=>v.evidenceLevel===k).length),[88,61,23]);
  assert.equal(d.records.filter(v=>v.population).length,7);
  assert.ok(d.records.every(v=>v.legalSubtypeCertified===false&&v.legalBoundaryCertified===false&&v.canonicalChangeAdmitted===false));
  console.log('9c live exact catalogue + documentary register bytes; 71/322/20/152, 88/61/23, 7 statistical discrepancies: PASS');
  for(const [width,lang] of [[1440,'ro'],[390,'ro'],[1440,'en'],[390,'en']]){
    const mobile=width<700,panel=mobile?'.drawer-tree':'.tree-sidebar',detail=mobile?'.drawer-detail':'.detail-sidebar';
    const p=await cdp.page(width,900,mobile,site+'?lang='+lang+'&audit=9c-e738bc6');
    const q=x=>JSON.stringify(panel+' '+x), card=JSON.stringify(detail+' .history-entity-detail');
    const tree=q('.history-rohgis-tree'), rows=k=>q('.history-rohgis-tree [data-rohgis-kind='+k+']');
    const subtypeRows=k=>q('.history-rohgis-tree [data-urban-subtype="'+k+'"]');
    const row=(kind,name)=>"[...document.querySelectorAll("+rows(kind)+")].find(x=>x.querySelector('.history-tree-name')?.textContent.trim()==="+JSON.stringify(name)+")";
    const tag=width+'-'+lang;
    const year=async y=>{
      await p.eval("(()=>{const el=document.querySelector("+q('.history-filter-year input')+");Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(el,'"+y+"');el.dispatchEvent(new Event('input',{bubbles:true}));})()");
      await p.wait("document.querySelector('.map-area')?.dataset.historyYear==='"+y+"'",'year '+y+' '+tag);
    };
    const search=async value=>p.eval("(()=>{const el=document.querySelector("+q('#history-catalog-search')+");Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(el,"+JSON.stringify(value)+");el.dispatchEvent(new Event('input',{bubbles:true}));})()");
    const total=lang==='ro'?'20 municipii / 152 orașe':'20 municipalities / 152 towns';
    const openTree=async()=>{
      if(!await p.eval("!!document.querySelector("+q('.history-geodata-pane')+")"))await p.eval("document.querySelector('.module-rail button:nth-child(2)').click()");
      await p.wait("!!document.querySelector("+q('.history-geodata-pane')+")",'history panel '+tag);
      await p.wait("document.querySelector("+q('.history-catalog-stat')+")?.textContent.includes("+JSON.stringify(total)+")",'subtype counts '+tag);
    };
    await p.wait("document.querySelector('.map-area')?.dataset.mapReady==='true'",'map ready '+tag);
    await p.eval("document.querySelector('.module-rail button:nth-child(2)').click()");
    await p.wait("!!document.querySelector("+q('.history-geodata-pane')+")",'history panel '+tag);
    await year(1930);await openTree();
    const kingdom=lang==='ro'?'Regatul României':'Kingdom of Romania';
    // Root label may be source Romanian even in EN; identify either verified name.
    await p.eval("(()=>{const r=[...document.querySelectorAll("+q('.history-tree-row')+")].find(x=>['Regatul României','Kingdom of Romania'].includes(x.querySelector('.history-tree-name')?.textContent.trim()));if(!r)throw Error('historical state root absent');r.querySelector('.history-tree-expand').click()})()");
    await p.wait("document.querySelectorAll("+tree+"+' > .history-tree-node').length===71",'71 counties '+tag);
    await search(lang==='ro'?'municipii':'municipalities');
    await p.wait("document.querySelectorAll("+subtypeRows('municipiu')+").length===20&&document.querySelectorAll("+subtypeRows('oraș')+").length===0",'20 municipalities search '+tag);
    await p.snap('9c-live-'+tag+'-municipalities.png');
    await search(lang==='ro'?'orașe':'towns');
    await p.wait("document.querySelectorAll("+subtypeRows('oraș')+").length===152&&document.querySelectorAll("+subtypeRows('municipiu')+").length===0",'152 towns search '+tag);
    await p.snap('9c-live-'+tag+'-towns.png');
    for(const [name,subtype,tier] of [['Arad','municipiu','OTHER_OFFICIAL_ATTESTATION_OCR'],['Medgidia','oraș','OFFICIAL_TEXT_OCR_ATTESTATION']]){
      await openTree();await search(name);
      const expr=row('urban_unit',name);
      await p.wait("!!("+expr+")",'search '+name+' '+tag);
      assert.equal(await p.eval(expr+'.dataset.urbanSubtype'),subtype);
      await p.eval(expr+".querySelector('input[type=checkbox]').click()");
      await p.wait("document.querySelector('.map-area')?.dataset.historyCheckedCount==='1'",'checked '+name+' '+tag);
      await p.eval(expr+".querySelector('.history-tree-name').click()");
      await p.wait("document.querySelector("+card+"+' [data-urban-subtype]')?.dataset.urbanSubtype==="+JSON.stringify(subtype),'card subtype '+name+' '+tag);
      assert.equal(await p.eval("document.querySelector("+card+"+' [data-urban-evidence]')?.dataset.urbanEvidence"),tier);
      const t=await p.eval("document.querySelector("+card+").textContent");
      assert.match(t,/CC BY 4\.0/);assert.match(t,/Cezar Buterez/);
      assert.match(t,lang==='ro'?/statut juridic și continuitate temporală necertificate/:/legal status and temporal continuity not certified/);
      assert.match(t,lang==='ro'?/rang-sursă III/:/source rank III/);
      assert.equal(await p.eval("document.querySelector('.map-area')?.dataset.historyDistinctAssets"),'1');
      const attest=lang==='ro'?'Atestări individuale':'Individual attestations';
      await p.eval("(()=>{const s=[...document.querySelector("+card+").querySelectorAll('summary')].find(x=>x.textContent.includes("+JSON.stringify(attest)+"));if(!s)throw Error('attestation disclosure missing');s.click()})()");
      const link=await p.eval("(()=>{const d=[...document.querySelector("+card+").querySelectorAll('details[open]')].find(x=>x.querySelector('summary')?.textContent.includes("+JSON.stringify(attest)+"));return d?.querySelector('a')?.href})()");
      assert.ok(link?.startsWith('https://'),'individual evidence source link');
      if(name==='Medgidia'){
        const pop=lang==='ro'?'Reconciliere demografică':'Population reconciliation';
        await p.eval("(()=>{const s=[...document.querySelector("+card+").querySelectorAll('summary')].find(x=>x.textContent.includes("+JSON.stringify(pop)+"));if(!s)throw Error('population disclosure missing');s.click()})()");
        const text=await p.eval("(()=>{const d=[...document.querySelector("+card+").querySelectorAll('details[open]')].find(x=>x.querySelector('summary')?.textContent.includes("+JSON.stringify(pop)+"));return d?.textContent})()");
        assert.match(text,/6466|6[.,\s]466/);assert.match(text,/2764/);
        assert.match(text,lang==='ro'?/Componența teritorială și facsimilul nu sunt verificate/:/Territorial scope and facsimile not verified/);
      }
      await p.snap('9c-live-'+tag+'-card-'+name+'.png');
      await openTree();await search(name);await p.wait("!!("+expr+")",'reopen '+name+' '+tag);
      await p.eval(expr+".querySelector('input[type=checkbox]').click()");
      await p.wait("document.querySelector('.map-area')?.dataset.historyCheckedCount==='0'",'cleared '+name+' '+tag);
      console.log('9c live '+tag+' '+name+' subtype, checkbox, evidence, card: PASS');
    }
    await search('');await year(1929);await p.wait("!document.querySelector("+tree+")",'1929 exclusion '+tag);
    await year(1930);await openTree();
    console.log('9c live '+tag+' category search 20/152, temporal exclusion/restoration: PASS');
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
  console.log('HIST-OHM-TREE.9c LIVE DESKTOP AND MOBILE RO/EN PASS');
}catch(err){
  console.error('Production smoke failure:',err);process.exitCode=1;
}finally{
  try{client?.close();}catch{}
  chrome?.kill('SIGKILL');
  if(profile&&resolve(profile).startsWith(join(resolve(tmpdir()),'atlas-smoke-')))
    await rm(profile,{recursive:true,force:true}).catch(()=>{});
}
