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
const site=process.env.ATLAS_AUDIT_SITE||'http://127.0.0.1:4188/atlas/';
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
async function verifyExports(cdp){
 const {gunzipSync}=await import('node:zlib'),{createHash}=await import('node:crypto'),{relative}=await import('node:path');const hash=b=>createHash('sha256').update(b).digest('hex');const catalog=JSON.parse(gunzipSync(await readFile(resolve(root,'public/data/phase4/catalog.json.gz')))),nodes=new Map(catalog.entities.map(n=>[n.id,n]));await mkdir(resolve(root,'artifacts'),{recursive:true});const downloadDir=await mkdtemp(resolve(root,'artifacts/web-audit-5c-exports-'));await cdp.send('Browser.setDownloadBehavior',{behavior:'allow',downloadPath:downloadDir,eventsEnabled:true});
 const p=await cdp.page(1440,900,false,'about:blank'),geometryRequests=[];cdp.on('Network.requestWillBeSent',e=>{if(e.sessionId===p.sid&&e.params.request.url.includes('/geometry/'))geometryRequests.push(e.params.request.url)});await p.call('Network.enable');await p.call('Network.clearBrowserCache');await p.call('Page.navigate',{url:site+'?entity=osm-r1699033&lang=en&simple=1'});await p.wait("document.querySelector('.map-area')?.dataset.mapReady==='true'&&!!document.querySelector('.entity-actions button')",'simplified map and exact district');assert(await p.eval("localStorage.getItem('atlas-simple')==='true'"),'Simplified display really active');await p.eval("(()=>{const b=document.querySelector('.entity-actions button');if(b.textContent.includes('Show'))b.click();})()");await p.wait("document.querySelector('.map-area')?.dataset.mapVisibleCount==='3'&&!document.querySelector('.atlas-map-status')",'three visible exact holders');
 const report={stage:'WEB-AUDIT.5c',site,checkedAt:new Date().toISOString(),artifactDirectory:relative(root,downloadDir).replaceAll('\\','/'),displayGeometryMode:'simplified',files:[],geometryRequests};const shapes=new Map();
 const csvRows=text=>{const rows=[];let row=[],cell='',quoted=false;for(let i=0;i<text.length;i++){const c=text[i];if(c==='"'){if(quoted&&text[i+1]==='"'){cell+='"';i++;}else quoted=!quoted;}else if(c===','&&!quoted){row.push(cell);cell='';}else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&text[i+1]==='\n')i++;row.push(cell);if(row.some(v=>v.length))rows.push(row);row=[];cell='';}else cell+=c;}if(cell.length||row.length){row.push(cell);rows.push(row);}return rows;};
 const inspect=async(scope,format,expected)=>{const name='territorial-atlas-2026-10-05-'+scope+'.'+format;const path=join(downloadDir,name);const bytes=await until(async()=>{try{const b=await readFile(path);return b.length?b:null;}catch{return null;}},'real '+scope+' '+format+' download',120000);const info={filename:name,scope,format,bytes:bytes.length,sha256:hash(bytes),expectedIDs:expected};
 if(format==='csv'){const [header,...rows]=csvRows(bytes.toString('utf8').replace(/^\uFEFF/,''));const records=rows.map(row=>Object.fromEntries(header.map((key,i)=>[key,row[i]])));assert.deepEqual(records.map(r=>r.atlas_id).sort(),[...expected].sort());for(const r of records){const n=nodes.get(r.atlas_id);assert(n);assert.equal(r.source_snapshot,'2026-10-05');assert.equal(r.registry_code,String(n.registry?.code??''));assert.equal(r.registry_system,n.registry?.system??'');assert.equal(r.administrative_parent_id,n.administrativeParentId??'');assert.equal(r.tree_parent_id,n.treeParentId??'');assert.equal(r.osm_relation_id,String(n.osmRelationId));}Object.assign(info,{actualIDs:records.map(r=>r.atlas_id),codesParentsSnapshotMatch:true});}
 else{const d=JSON.parse(bytes);assert.equal(d.type,'FeatureCollection');assert.equal(d.atlasExport.geometryMode,'detailed');assert.equal(d.atlasExport.sourceSnapshot,'2026-10-05');assert.equal(d.atlasExport.sourceGeometryUnmodified,true);assert.equal(d.atlasExport.count,expected.length);assert.deepEqual(d.features.map(f=>f.properties.atlasId).sort(),[...expected].sort());const proofs=[];for(const f of d.features){const n=nodes.get(f.properties.atlasId);assert(n);const source='public/data/phase4/geometry/'+n.geometryShard+'-detailed.geojson.gz';if(!shapes.has(source))shapes.set(source,JSON.parse(gunzipSync(await readFile(resolve(root,source)))).features);const original=shapes.get(source).find(x=>x.properties.atlasId===n.id);assert(original);assert.deepEqual(f.geometry,original.geometry,'Unmodified detailed source geometry '+n.id);proofs.push({atlasID:n.id,source,geometrySHA256:hash(Buffer.from(JSON.stringify(f.geometry))),matchesOriginal:true});}Object.assign(info,{actualIDs:d.features.map(f=>f.properties.atlasId),sourceSnapshot:d.atlasExport.sourceSnapshot,geometryMode:d.atlasExport.geometryMode,geometry:proofs});}report.files.push(info);console.log('Verified real download',scope,format,info.actualIDs);};
 await p.eval("document.querySelector('.atlas-detail-export summary').click()");for(const format of ['csv','geojson']){const label=format==='csv'?'CSV':'GeoJSON';await p.wait("[...document.querySelectorAll('.atlas-detail-export-actions button')].some(b=>b.textContent.includes('"+label+"')&&!b.disabled)",'selected export ready');await p.eval("[...document.querySelectorAll('.atlas-detail-export-actions button')].find(b=>b.textContent.includes('"+label+"')).click()");await inspect('selected',format,['osm-r1699033']);}
 await p.eval("document.querySelector('.atlas-tools-toggle').click()");await p.wait("!!document.querySelector('[aria-controls=phase5-export-panel]')",'global export opener');await p.eval("document.querySelector('[aria-controls=phase5-export-panel]').click()");await p.wait("!!document.querySelector('#phase5-export-panel select')",'visible export scope');await p.eval("const s=document.querySelector('#phase5-export-panel select');s.value='visible';s.dispatchEvent(new Event('change',{bubbles:true}))");for(const format of ['csv','geojson']){const label=format==='csv'?'CSV':'GeoJSON';await p.wait("[...document.querySelectorAll('#phase5-export-panel button')].some(b=>b.textContent.includes('"+label+"')&&!b.disabled)",'visible export ready');await p.eval("[...document.querySelectorAll('#phase5-export-panel button')].find(b=>b.textContent.includes('"+label+"')).click()");await inspect('visible',format,['osm-r90689','osm-r58974','osm-r1699033']);}
 await p.eval("document.querySelector('.atlas-tools-close').click()");await p.eval("document.querySelector('.map-reset-global').click()");await p.wait("!document.querySelector('.header-entity-action')&&!new URL(location.href).searchParams.has('entity')&&document.querySelector('.map-area')?.dataset.mapVisibleCount==='2'",'global reset clears selection URL');report.resetClearsSelectionAndPermalink=true;assert(geometryRequests.some(u=>u.includes('roots-simplified.geojson.gz')));assert(geometryRequests.some(u=>u.includes('-detailed.geojson.gz')));await p.close();await writeFile(resolve(root,'docs/audits/web-audit-5/exports-'+(process.env.AUDIT_LABEL||'local')+'.json'),JSON.stringify(report,null,2)+'\n');console.log('Selected and visible CSV/GeoJSON: all4 real downloads verified against exact original source; reset verified.');
}

try{
  await mkdir(screenshots,{recursive:true});
  profile=await mkdtemp(join(tmpdir(),'atlas-smoke-'));
  if(!process.env.ATLAS_AUDIT_SITE)preview=spawn(process.execPath,[resolve(root,'node_modules/vite/bin/vite.js'),'preview','--host','127.0.0.1','--port','4188','--strictPort'],{cwd:root,stdio:'inherit'});
  if(!process.env.ATLAS_AUDIT_SITE)await until(async()=>(await fetch(site)).ok,'Vite preview');
  chrome=spawn(findChrome(),[
    '--headless=new','--no-sandbox','--disable-dev-shm-usage',
    '--enable-unsafe-swiftshader','--disable-gpu-sandbox',
    ...(process.env.ATLAS_CHROME_SOFTWARE==='1'?['--use-angle=swiftshader']:[]),
    '--no-first-run','--no-default-browser-check',
    '--user-data-dir='+profile,'--remote-debugging-port=9388','about:blank'
  ],{stdio:'ignore'});
  const details=await until(async()=>{
    const r=await fetch('http://127.0.0.1:9388/json/version');
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
  await verifyExports(client);
  assert.deepEqual(runtimeErrors,[],'Uncaught browser exceptions');
  console.log('WEB-AUDIT.5c export verification complete.');
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
