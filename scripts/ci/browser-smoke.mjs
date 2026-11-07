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
async function until(fn,what,limit=30000){
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
  async page(width,height,mobile){
    const {targetId}=await this.send('Target.createTarget',{url:'about:blank'});
    const {sessionId}=await this.send('Target.attachToTarget',{targetId,flatten:true});
    await this.send('Page.enable',{},sessionId);
    await this.send('Runtime.enable',{},sessionId);
    await this.send('Emulation.setDeviceMetricsOverride',{
      width,height,mobile,deviceScaleFactor:1,screenWidth:width,screenHeight:height
    },sessionId);
    await this.send('Page.navigate',{url:site},sessionId);
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
async function desktop(cdp){
  const p=await cdp.page(1440,900,false);
  await p.wait("!!document.querySelector('.map-area .zoom-controls')",'desktop app mounted');
  await p.wait("document.querySelector('.map-area')?.dataset.mapReady==='true'",
    'source polygons and map ready on desktop');
  await pause(850);
  assert.equal(await p.eval("!!document.querySelector('.tree-sidebar')"),false,'Initial module panel absent');
  assert.equal(await p.eval("!!document.querySelector('.detail-sidebar')"),false,'Initial detail panel absent');
  await p.wait("!document.querySelector('.map-boot-status')",'certified national contours');
  const frame=await p.eval("({screen:innerWidth,scroll:document.documentElement.scrollWidth,map:document.querySelector('.map-area').getBoundingClientRect().width,phase:document.querySelector('.version')?.textContent})");
  assert(frame.scroll<=frame.screen+1,'Desktop horizontal overflow');
  assert(frame.map>1300,'Map-first desktop must use available width');
  assert.match(frame.phase,/Phase 5/);
  assert.equal(await p.eval("document.querySelectorAll('.map-area .zoom-controls button').length"),3,'Only zoom/−/Home permanent');
  assert.equal(await p.eval("!!document.querySelector('.map-area .map-quick-actions,.map-area .map-controls,.map-area .map-legend,.map-area .map-note,.map-area .mobile-controls')"),false,
    'Secondary commands, legend, source note and mobile buttons absent from map');
  const accessibleMap=await p.eval("({attribution:!!document.querySelector('.maplibregl-ctrl-attrib'),scale:!!document.querySelector('.maplibregl-ctrl-scale'),zoom:[...document.querySelectorAll('.zoom-controls button')].map(b=>({label:b.getAttribute('aria-label'),w:b.getBoundingClientRect().width,h:b.getBoundingClientRect().height}))})");
  assert(accessibleMap.attribution&&accessibleMap.scale,'Attribution and scale stay available');
  assert(accessibleMap.zoom.every(b=>b.label&&b.w>=44&&b.h>=44),'Map buttons accessible and 44px minimum');
  await p.snap('desktop-initial.png');
  // Real Escape-key regression for the module without resetting geometry.
  await p.eval("document.querySelector('.module-rail button:first-child').click()");
  await p.wait("!!document.querySelector('.tree-sidebar')",'keyboard module opened');
  await p.eval("document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true}))");
  await p.wait("!document.querySelector('.tree-sidebar')",'Escape closes module panel');
  await p.wait("document.activeElement===document.querySelector('.module-rail button:first-child')",
    'Escape returns focus to module trigger');
  await p.eval("document.querySelector('.module-rail button:first-child').click()");
  await p.wait("document.querySelector('.tree-footnote')?.textContent.includes('4,283')",'desktop catalog after opening module');
  assert.equal(await p.eval("!!document.querySelector('.tree-sidebar .atlas-map-tools,.atlas-global-tools-panel')"),false,
    'Administrative panel is limited to tree, filters and reset; global tools are closed');
  assert.equal(await p.eval("document.querySelector('.atlas-tools-toggle')?.getAttribute('aria-expanded')"),'false',
    'Independent map-tool opener defaults to closed');
  assert.equal(await p.eval("!!document.querySelector('.tree-sidebar .atlas-admin-reset')"),true,
    'Reset display remains in the Administrative module');
  const englishRoots=await p.eval("Array.from(document.querySelectorAll('.tree-sidebar .tree-list > .territory-branch > .tree-line .node-name')).map(x=>x.textContent.trim())");
  assert.deepEqual(englishRoots,['Romania','Moldova'],'English tree uses concise national names');
  await p.snap('desktop-module-open.png');
  // WEB-R3.15 Nistrenia/Pridnestrovie: Tiraspol, Bender, then five raions south-to-north.
  // Both mixed and administrative tree views must expose the same 7 identities.
  for(const view of ['all','administrative']){
    if(view==='administrative')
      await p.eval("document.querySelector('.tree-sidebar .tree-filters button:nth-child(2)').click()");
    await p.eval("Array.from(document.querySelectorAll('.tree-sidebar .tree-line')).find(x=>x.querySelector('.node-name')?.textContent.trim()==='Moldova').querySelector('.expand-button').click()");
    await p.wait("Array.from(document.querySelectorAll('.tree-sidebar .tree-line .node-name')).some(x=>x.textContent.trim()==='Pridnestrovie')",
      'Nistrenia appears under Moldova');
    await p.eval("Array.from(document.querySelectorAll('.tree-sidebar .tree-line')).find(x=>x.querySelector('.node-name')?.textContent.trim()==='Pridnestrovie').querySelector('.expand-button').click()");
    const order=await p.eval("(()=>{const line=Array.from(document.querySelectorAll('.tree-sidebar .tree-line')).find(x=>x.querySelector('.node-name')?.textContent.trim()==='Pridnestrovie');return Array.from(line.closest('.territory-branch').querySelectorAll(':scope > .tree-children > .territory-branch > .tree-line .node-name')).map(x=>x.textContent.trim());})()");
    assert.deepEqual(order,['Tiraspol','Bender','Slobdzeya','Grigoriopol','Dubossary','Rybnitsa','Kamenka'],
      'English Nistrenia children: Tiraspol/Bender followed by five raions south-to-north, '+view);
    await p.eval("Array.from(document.querySelectorAll('.tree-sidebar .tree-line')).find(x=>x.querySelector('.node-name')?.textContent.trim()==='Pridnestrovie').scrollIntoView({block:'center'})");
    await p.snap('desktop-nistrenia-web-r315-fixed-order-en-'+view+'.png');
    await p.eval("Array.from(document.querySelectorAll('.tree-sidebar .tree-line')).find(x=>x.querySelector('.node-name')?.textContent.trim()==='Pridnestrovie').querySelector('.expand-button').click()");
    await p.eval("Array.from(document.querySelectorAll('.tree-sidebar .tree-line')).find(x=>x.querySelector('.node-name')?.textContent.trim()==='Moldova').querySelector('.expand-button').click()");
  }
  // WEB-R3.9: check real nested children rather than obsolete flat counts.
  const desktopRow=(name,level)=>"Array.from(document.querySelectorAll('.tree-sidebar .tree-line')).find(x=>x.querySelector('.node-name')?.textContent.trim()==="+JSON.stringify(name)+"&&x.querySelector('.node-level')?.textContent.trim().startsWith("+JSON.stringify(level)+"))";
  const desktopChildren=async expr=>await p.eval("(()=>{const l="+expr+";return Array.from(l.closest('.territory-branch').querySelectorAll(':scope > .tree-children > .territory-branch > .tree-line')).map(x=>({name:x.querySelector('.node-name')?.textContent.trim(),level:x.querySelector('.node-level')?.textContent.trim()}));})()");
  for(const view of ['all','administrative']){
    await p.eval("document.querySelector('.tree-sidebar .tree-filters button:nth-child("+(view==='all'?'1':'2')+")').click()");
    await p.eval("Array.from(document.querySelectorAll('.tree-sidebar .tree-line')).find(x=>x.querySelector('.node-name')?.textContent.trim()==='Moldova').querySelector('.expand-button').click()");
    if(view==='all'){
      await p.wait("Array.from(document.querySelectorAll('.tree-sidebar .tree-line .node-name')).some(x=>x.textContent.trim()==='West')",'West statistical node available');
      await p.eval("Array.from(document.querySelectorAll('.tree-sidebar .tree-line')).find(x=>x.querySelector('.node-name')?.textContent.trim()==='West').querySelector('.expand-button').click()");
      // WEB-R3.16: verify the five direct West children without moving them
      // in the canonical tree. Chișinău comes before NTS3 regions.
      const westExpr=desktopRow('West','NTS 2');
      const westChildren=await desktopChildren(westExpr);
      assert.deepEqual(westChildren.map(x=>x.name),
        ['Chișinău','North','Centre','South','Gagauzia'],
        'West children: Chișinău first, all others retain their relative order');
      assert.deepEqual(westChildren.map(x=>x.level),
        ['ADM 4 · NTS 3','NTS 3','NTS 3','NTS 3','ADM 4 · NTS 3']);
      await p.eval(westExpr+".scrollIntoView({block:'center'})");
      await p.snap('desktop-west-chisinau-first-en.png');
    }
    for(const parentName of ['Gagauzia','Chișinău']){
      const root=desktopRow(parentName,'ADM 4');
      await p.wait("!!("+root+")",parentName+' found in '+view);
      await p.eval(root+".querySelector('.expand-button').click()");
      const direct=await desktopChildren(root);
      if(parentName==='Gagauzia'){
        assert.deepEqual(direct.map(x=>x.name),['Comrat','Ceadîr-Lunga','Vulcănești']);
        assert(direct.every(x=>x.level==='ADM 5'));
        for(const [name,count] of [['Comrat',13],['Ceadîr-Lunga',9],['Vulcănești',4]]){
          const raion=desktopRow(name,'ADM 5');
          await p.eval(raion+".querySelector('.expand-button').click()");
          const kids=await desktopChildren(raion);
          assert.equal(kids.length,count,name+' nested ADM8 count '+view);
          assert(kids.every(x=>x.level==='ADM 8'));
          assert.deepEqual(kids.map(x=>x.name),[...kids.map(x=>x.name)].sort((a,b)=>a.localeCompare(b,'en')),
            name+' children alphabetically sorted '+view);
          await p.eval(raion+".scrollIntoView({block:'center'})");
          await p.snap('desktop-gagauzia-'+name.replace(/[^a-z]/gi,'').toLowerCase()+'-nested-en-'+view+'.png');
          await p.eval(raion+".querySelector('.expand-button').click()");
        }
      }else{
        assert.equal(direct.length,19,'Chișinău city plus 18 ADM8 localities '+view);
        assert.deepEqual(direct[0],{name:'Chișinău',level:'ADM 8'});
        assert(direct.slice(1).every(x=>x.level==='ADM 8'));
        const city=desktopRow('Chișinău','ADM 8');
        await p.eval(city+".querySelector('.expand-button').click()");
        const sectors=await desktopChildren(city);
        assert.deepEqual(sectors.map(x=>x.name),['Botanica','Buiucani','Centru','Ciocana','Rîșcani']);
        assert(sectors.every(x=>x.level==='ADM 7'));
        await p.eval(city+".scrollIntoView({block:'center'})");
        await p.snap('desktop-chisinau-sectors-nested-en-'+view+'.png');
        await p.eval(city+".querySelector('.expand-button').click()");
      }
      await p.eval(root+".querySelector('.expand-button').click()");
    }
    if(view==='all')
      await p.eval("Array.from(document.querySelectorAll('.tree-sidebar .tree-line')).find(x=>x.querySelector('.node-name')?.textContent.trim()==='West').querySelector('.expand-button').click()");
    await p.eval("Array.from(document.querySelectorAll('.tree-sidebar .tree-line')).find(x=>x.querySelector('.node-name')?.textContent.trim()==='Moldova').querySelector('.expand-button').click()");
  }
  // WEB-R3.10: the NTS3 regions group ADM4 only in All; each ADM4
  // already owns its ADM8 children. Check regional seat then local seat.
  await p.eval("document.querySelector('.tree-sidebar .tree-filters button:first-child').click()");
  await p.eval("Array.from(document.querySelectorAll('.tree-sidebar .tree-line')).find(x=>x.querySelector('.node-name')?.textContent.trim()==='Moldova').querySelector('.expand-button').click()");
  await p.wait("Array.from(document.querySelectorAll('.tree-sidebar .node-name')).some(x=>x.textContent.trim()==='West')",'NTS2 West exists');
  await p.eval("Array.from(document.querySelectorAll('.tree-sidebar .tree-line')).find(x=>x.querySelector('.node-name')?.textContent.trim()==='West').querySelector('.expand-button').click()");
  for(const [region,seat,expected] of [['North','Bălți',12],['Centre','Ialoveni',13],['South','Cimișlia',8]]){
    const regionExpr=desktopRow(region,'NTS 3');
    await p.wait("!!("+regionExpr+")",'NTS3 region '+region);
    await p.eval(regionExpr+".querySelector('.expand-button').click()");
    await p.wait("(()=>{const e="+regionExpr+";return e?.closest('.territory-branch')?.querySelectorAll(':scope > .tree-children > .territory-branch').length==="+expected+";})()",
      'Region '+region+' ADM4 children');
    const districts=await desktopChildren(regionExpr);
    assert.equal(districts.length,expected);
    assert.equal(districts[0].name,seat,region+' agency seat first');
    assert(districts.every(x=>x.level.startsWith('ADM 4')),region+' children are ADM4');
    const districtExpr=desktopRow(seat,'ADM 4');
    await p.eval(districtExpr+".querySelector('.expand-button').click()");
    await p.wait("(()=>{const x="+districtExpr+";return !!x?.closest('.territory-branch')?.querySelector('.tree-children .territory-branch');})()",
      'ADM8 children shown for '+seat);
    const locals=await desktopChildren(districtExpr);
    assert.equal(locals[0].name,seat,seat+' locality first');
    assert(locals.every(x=>x.level.startsWith('ADM 8')),seat+' children are ADM8');
    await p.eval(districtExpr+".scrollIntoView({block:'center'})");
    await p.snap('desktop-md-'+region.toLowerCase()+'-seats-en.png');
    await p.eval(districtExpr+".querySelector('.expand-button').click()");
    await p.eval(regionExpr+".querySelector('.expand-button').click()");
  }
  await p.eval("Array.from(document.querySelectorAll('.tree-sidebar .tree-line')).find(x=>x.querySelector('.node-name')?.textContent.trim()==='West').querySelector('.expand-button').click()");
  await p.eval("Array.from(document.querySelectorAll('.tree-sidebar .tree-line')).find(x=>x.querySelector('.node-name')?.textContent.trim()==='Moldova').querySelector('.expand-button').click()");
  // WEB-R3.13: browse the actual East NTS3 → Bender / UATSN structure.
  // Exact identities are retained; CUATM distinguishes both Hlinaia rows.
  await p.eval("Array.from(document.querySelectorAll('.tree-sidebar .tree-line')).find(x=>x.querySelector('.node-name')?.textContent.trim()==='Moldova').querySelector('.expand-button').click()");
  const eastStat=desktopRow('East','NTS 2');
  await p.wait("!!("+eastStat+")",'East NTS2 appears');
  await p.eval(eastStat+".querySelector('.expand-button').click()");
  const eastNts3=desktopRow('Transnistria','NTS 3');
  await p.wait("!!("+eastNts3+")",'Eastern Transnistria NTS3 appears');
  await p.eval(eastNts3+".querySelector('.expand-button').click()");
  const eastParents=await desktopChildren(eastNts3);
  assert.equal(await p.eval(eastNts3+".querySelector('.node-name').textContent.trim()"),'Transnistria');
  assert.deepEqual(eastParents.map(x=>x.name),['ATULBD','Bender']);
  assert(eastParents.every(x=>x.level==='ADM 4'));
  const benderAdm4=desktopRow('Bender','ADM 4');
  await p.eval(benderAdm4+".querySelector('.expand-button').click()");
  const benderAdms=await desktopChildren(benderAdm4);
  assert.deepEqual(benderAdms.map(x=>x.name),['Bender','Proteagailovca']);
  assert(benderAdms.every(x=>x.level==='ADM 8'));
  await p.eval(benderAdm4+".scrollIntoView({block:'center'})");
  await p.snap('desktop-east-bender-hierarchy-en.png');
  await p.eval(benderAdm4+".querySelector('.expand-button').click()");
  const uatsnAdm4=desktopRow('ATULBD','ADM 4');
  await p.eval(uatsnAdm4+".querySelector('.expand-button').click()");
  const uatsnChildren=await desktopChildren(uatsnAdm4);
  assert.equal(uatsnChildren.length,79);
  assert(uatsnChildren.every(x=>x.level.startsWith('ADM 8')),'Level tags may also show CUATM for duplicate Hlinaia');
  const enNames=uatsnChildren.map(x=>x.name);
  assert.deepEqual(enNames,[...enNames].sort((a,b)=>a.localeCompare(b,'en')),'English alphabetic UATSN');
  await p.eval(uatsnAdm4+".scrollIntoView({block:'center'})");
  await p.snap('desktop-east-uatsn-en.png');
  await p.eval("Array.from(document.querySelectorAll('.language button')).find(x=>x.textContent==='RO').click()");
  await p.wait("document.documentElement.lang==='ro'",'Romanian UATSN switch');
  const uatsnRo=desktopRow('UATSN','ADM 4');
  const roKids=await desktopChildren(uatsnRo);
  assert.equal(roKids.length,79);
  assert.deepEqual(roKids.map(x=>x.name),[...roKids.map(x=>x.name)].sort((a,b)=>a.localeCompare(b,'ro')),
    'Romanian alphabetic UATSN');
  const hlinaia=await p.eval("(()=>{const node="+uatsnRo+";return [...node.closest('.territory-branch').querySelectorAll(':scope > .tree-children > .territory-branch > .tree-line')].filter(x=>x.querySelector('.node-name')?.textContent.trim()==='Hlinaia').map(x=>({level:x.querySelector('.node-level')?.textContent.trim(),accessible:x.querySelector('.tree-label')?.getAttribute('aria-label')}));})()");
  assert.deepEqual(hlinaia.map(x=>x.level),['ADM 8 · CUATM 7625','ADM 8 · CUATM 5029']);
  assert(hlinaia[0].accessible?.includes('7625')&&hlinaia[1].accessible?.includes('5029'));
  await p.eval("(()=>{const parent="+uatsnRo+";const rows=[...parent.closest('.territory-branch').querySelectorAll(':scope > .tree-children > .territory-branch > .tree-line')];const first=rows.find(x=>x.querySelector('.node-level')?.textContent.includes('CUATM 7625'));first.scrollIntoView({block:'center'});})()");
  const visibleHlinaia=await p.eval("(()=>{const r=[...document.querySelectorAll('.tree-sidebar .tree-line')].filter(x=>x.querySelector('.node-level')?.textContent.includes('CUATM '));return r.filter(x=>{const b=x.getBoundingClientRect(),v=document.querySelector('.tree-sidebar').getBoundingClientRect();return b.bottom>=v.top&&b.top<=v.bottom;}).map(x=>x.querySelector('.node-level')?.textContent.trim());})()");
  assert(visibleHlinaia.includes('ADM 8 · CUATM 7625')&&visibleHlinaia.includes('ADM 8 · CUATM 5029'),
    'Both CUATM homonym badges must be simultaneously visible in Chromium capture');
  await p.snap('desktop-east-uatsn-ro-hlinaia.png');
  await p.eval(uatsnRo+".querySelector('.expand-button').click()");
  const ntsRo=desktopRow('Transnistria','NTS 3');
  await p.eval(ntsRo+".querySelector('.expand-button').click()");
  await p.eval(desktopRow('Est','NTS 2')+".querySelector('.expand-button').click()");
  await p.eval("Array.from(document.querySelectorAll('.tree-sidebar .tree-line')).find(x=>x.querySelector('.node-name')?.textContent.trim()==='Moldova').querySelector('.expand-button').click()");
  await p.eval("Array.from(document.querySelectorAll('.language button')).find(x=>x.textContent==='EN').click()");
  await p.wait("document.documentElement.lang==='en'",'Restore original desktop test locale');
  await p.eval("document.querySelector('.tree-sidebar .tree-filters button:first-child').click()");
  await p.eval("document.querySelector('.module-rail button:first-child').click()");
  assert.equal(await p.eval("!!document.querySelector('.tree-sidebar')"),false,'Repeated module click closes panel');
  await p.eval("document.querySelector('.module-rail button:nth-child(2)').click()");
  await p.wait("!!document.querySelector('.tree-sidebar .planned-module-description')",'Other module panel opens');
  assert.equal(await p.eval("!!document.querySelector('.module-notice')"),false,'No planned-module notice over map');
  await p.eval("document.querySelector('.module-rail button:first-child').click()");
  await p.wait("!!document.querySelector('.tree-sidebar input[type=search]')",'Returning to administrative module');
  await p.eval("document.querySelector('.tree-sidebar input[type=search]').focus()");
  await p.call('Input.insertText',{text:'Brețcu'});
  await p.wait("Array.from(document.querySelectorAll('.tree-sidebar .tree-label')).some(b=>b.textContent.includes('Brețcu'))",'Brețcu search results');
  await p.eval("Array.from(document.querySelectorAll('.tree-sidebar .tree-label')).find(b=>b.textContent.includes('Brețcu')).click()");
  await p.wait("document.querySelector('.detail-sidebar .entity-title h3')?.textContent.includes('Brețcu')",'Brețcu entity details');
  await p.eval("document.querySelector('.detail-sidebar .pane-close').click()");
  assert.equal(await p.eval("!!document.querySelector('.detail-sidebar')"),false,'Details × hides panel');
  assert.equal(await p.eval("!!document.querySelector('.tree-sidebar .tree-line[aria-selected=true]')"),true,
    'Details close preserves selection');
  assert.equal(await p.eval("!!document.querySelector('.header-entity-action')"),true,
    'Header detail button available when entity remains selected');
  await p.eval("document.querySelector('.header-entity-action').click()");
  await p.wait("!!document.querySelector('.detail-sidebar .entity-card')",'Header button reopens selected entity details');
  await p.eval("document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true}))");
  await p.wait("!document.querySelector('.detail-sidebar')",'Escape closes Details');
  await p.wait("document.activeElement===document.querySelector('.header-entity-action')",
    'Focus returned to Detail opener');
  await p.eval("document.querySelector('.header-entity-action').click()");
  await p.wait("!!document.querySelector('.detail-sidebar .entity-card')",'Details reopen again');
  await p.eval("document.querySelector('.detail-sidebar .atlas-detail-export>summary').click()");
  assert.equal(await p.eval("document.querySelectorAll('.detail-sidebar .atlas-detail-export button').length"),3,
    'Entity details support GeoJSON/CSV/permalink');
  const osm=await p.eval("Array.from(document.querySelectorAll('.detail-sidebar .metadata dt')).find(x=>x.textContent.trim()==='OSM ID')?.nextElementSibling?.textContent.trim()");
  assert.equal(osm,'','Brețcu must retain blank authentic OSM ID');
  // Global tools must be independent of the selected module and details.
  await p.eval("document.querySelector('.atlas-tools-toggle').click()");
  await p.wait("!!document.querySelector('.atlas-global-tools-panel')",'global tools opened from map');
  assert.equal(await p.eval("!!document.querySelector('.tree-sidebar')"),false,
    'Global tools reclaim map space by closing the module panel');
  assert.equal(await p.eval("!!document.querySelector('.detail-sidebar')"),false,
    'Global tools close the entity details without clearing selection');
  assert.equal(await p.eval("document.activeElement===document.querySelector('.atlas-tools-close')"),true,
    'Global tool dialog focuses its Close button');
  assert.equal(await p.eval("document.querySelectorAll('.atlas-tools-entry').length"),3,
    'Exactly three map tool sections: Appearance, Legend, Export');
  assert.equal(await p.eval("!!document.querySelector('.atlas-tools-about-link')"),true,
    'About Atlas is a low-priority footer action, not a fourth primary entry');
  assert.equal(await p.eval("!!document.querySelector('.atlas-tools-content')"),false,
    'Global menu starts with all secondary sections collapsed');
  await p.snap('desktop-global-tools-menu.png');
  await p.eval("document.querySelector('.atlas-tools-entry[aria-controls=atlas-section-settings]').click()");
  assert.equal(await p.eval("!!document.querySelector('#atlas-section-settings')"),true);
  assert.equal(await p.eval("!!document.querySelector('#atlas-section-settings .atlas-tools-fit-button')"),true,
    'Fit Visible is grouped with basemap and geometry simplification');
  await p.eval("document.querySelector('.atlas-tools-about-link').click()");
  assert.equal(await p.eval("!!document.querySelector('#atlas-section-settings')"),false,
    'Opening About collapses Settings (one global section open)');
  assert.equal(await p.eval("!!document.querySelector('#atlas-section-about')"),true,
    'Source caveats relocated to About Atlas');
  await p.eval("document.querySelector('.atlas-tools-entry[aria-controls=phase5-export-panel]').click()");
  assert.equal(await p.eval("!!document.querySelector('#atlas-section-about')"),false,
    'Opening Export collapses About');
  await p.wait("!!document.querySelector('#phase5-export-panel select')",'export controls relocated to global menu');
  await p.eval("(()=>{const s=document.querySelector('#phase5-export-panel select');s.value='selected';s.dispatchEvent(new Event('change',{bubbles:true}));})()");
  await p.wait("document.querySelector('#phase5-export-panel select')?.value==='selected'",'export scope');
  await p.eval("document.querySelector('#phase5-export-panel .export-buttons button:first-child').click()");
  const geo=JSON.parse(await readFile(await downloaded('.geojson'),'utf8'));
  assert.equal(geo.type,'FeatureCollection');
  assert.equal(geo.atlasExport.count,1);
  assert.equal(geo.atlasExport.geometryMode,'detailed');
  assert.equal(geo.atlasExport.legalBoundaryCertification,false);
  assert.equal(geo.features[0].properties.atlasId,'siruta-u64096');
  await p.wait("!document.querySelector('#phase5-export-panel .export-buttons button:nth-child(2)').disabled",'next export');
  await p.eval("document.querySelector('#phase5-export-panel .export-buttons button:nth-child(2)').click()");
  const csv=await readFile(await downloaded('.csv'),'utf8');
  assert(csv.includes('siruta-u64096'));
  assert(csv.includes('"Comuna Brețcu","",'),'CSV must preserve blank OSM ID');
  await p.snap('desktop-export-bretcu.png');
  await p.eval("document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true}))");
  await p.wait("!document.querySelector('.atlas-global-tools-panel')",'Escape closes global tools');
  await p.wait("document.activeElement===document.querySelector('.atlas-tools-toggle')",
    'Escape returns focus to global tools trigger');
  await p.eval("document.querySelector('.header-entity-action').click()");
  await p.wait("!!document.querySelector('.detail-sidebar .entity-card')",
    'Global tools do not clear selected Brețcu or its details');
  await p.eval("document.querySelector('.module-rail button:first-child').click()");
  await p.wait("!!document.querySelector('.tree-sidebar .osm-level-filter')",
    'Administrative tree is independently re-openable after global export');

  // Tree-visible entities are independent of initially unchecked level filters.
  await p.eval("document.querySelector('.detail-sidebar .entity-actions button:first-child').click()");
  await p.wait("JSON.parse(localStorage.getItem('atlas-visible-phase4')).includes('siruta-u64096')",
    'Brețcu explicitly tree-visible before cartographic filter checks');
  await p.eval("document.querySelector('.tree-sidebar .osm-level-filter>summary').click()");
  const filterState=await p.eval("(()=>{const panel=document.querySelector('.tree-sidebar .tree-content');const children=[...panel.children];const order=x=>children.findIndex(el=>el.matches(x));const levels=[...panel.querySelectorAll('.osm-level-choices label')];return {heading:panel.querySelector('.osm-level-filter>summary').textContent.trim(),columns:[...panel.querySelectorAll('.osm-level-columns>fieldset')].map(el=>el.getAttribute('data-column')),scopes:panel.querySelectorAll('.osm-level-scopes input').length,actions:panel.querySelectorAll('.osm-level-actions button').length,ordering:[order('.osm-level-filter'),order('.tree-filters'),order('.tree-list')],levels:levels.map(el=>({name:el.querySelector('span').textContent.trim(),checked:el.querySelector('input').checked,mixed:el.querySelector('input').indeterminate})),ro:document.querySelector('.map-area').dataset.roStyle,md:document.querySelector('.map-area').dataset.mdStyle,visible:document.querySelector('.map-area').dataset.mapVisibleCount};})()");
  assert.equal(filterState.heading,'Filters');
  assert.deepEqual(filterState.columns,['administrative','statistical']);
  assert.equal(filterState.scopes,0,'No duplicated country selectors in Filters');
  assert.equal(filterState.actions,0,'No Show/Hide buttons in Filters');
  assert(filterState.ordering[0]>=0&&filterState.ordering[0]<filterState.ordering[1]&&filterState.ordering[1]<filterState.ordering[2],
    'Tree-mode selector belongs directly above the tree');
  assert(filterState.levels.every(x=>!x.checked&&!x.mixed),
    'All ADM/NUTS/NTS filters start unchecked even when national roots and Brețcu are tree-visible');
  assert.equal(filterState.ro,'reference');
  assert.equal(filterState.md,'reference');
  assert.equal(filterState.visible,'3','Two roots and selected Brețcu visible');
  const statisticalChoices=await p.eval("Array.from(document.querySelectorAll('.tree-sidebar .osm-level-choices label[data-level-kind=statistical]')).map(x=>({label:x.querySelector('span').textContent.trim(),count:Number(x.querySelector('small').textContent.trim()),checked:x.querySelector('input').checked}))");
  assert.deepEqual(statisticalChoices.map(x=>x.label),['NUTS 1','NUTS 2','NUTS 3','NTS 1','NTS 2','NTS 3']);
  assert.deepEqual(statisticalChoices.map(x=>x.count),[4,8,42,1,2,6]);
  await p.snap('desktop-levels-two-columns.png');

  // NTS 1 is the SAME national geometry as the Moldova tree checkbox, but
  // it now receives the statistical stroke instead of the neutral reference.
  await p.eval("document.querySelector('.tree-sidebar .osm-level-choices input[aria-label=\"NTS 1\"]').click()");
  await p.wait("document.querySelector('.map-area')?.dataset.mdStyle==='NTS 1'",
    'NTS 1 changes shared Moldova country boundary to the statistical style');
  assert.equal(await p.eval("document.querySelector('.map-area').dataset.mapVisibleCount"),'3',
    'NTS 1 must not duplicate national polygons');
  assert.equal(await p.eval("document.querySelector('.map-area').dataset.roStyle"),'reference');
  await pause(750);
  await p.snap('desktop-nts1-statistical-outline.png');

  // ADM 2 applies to the two root boundaries, but active NTS 1 has priority.
  await p.eval("document.querySelector('.tree-sidebar .osm-level-choices input[aria-label=\"OSM 2\"]').click()");
  await p.wait("document.querySelector('.map-area')?.dataset.roStyle==='ADM 2'");
  assert.equal(await p.eval("document.querySelector('.map-area').dataset.mdStyle"),'NTS 1');
  await p.eval("document.querySelector('.tree-sidebar .osm-level-choices input[aria-label=\"NTS 1\"]').click()");
  await p.wait("document.querySelector('.map-area')?.dataset.mdStyle==='ADM 2'",
    'Removing NTS 1 exposes still-active administrative ADM 2 style');
  await p.eval("document.querySelector('.tree-sidebar .osm-level-choices input[aria-label=\"OSM 2\"]').click()");
  await p.wait("document.querySelector('.map-area')?.dataset.mdStyle==='reference'");
  assert.equal(await p.eval("document.querySelector('.map-area').dataset.roStyle"),'reference');
  assert.equal(await p.eval("document.querySelector('.map-area').dataset.mapVisibleCount"),'3');

  // The contextual legend starts with only currently rendered boundary styles,
  // including an individually tree-visible ADM 8 entity (Brețcu).
  await p.eval("document.querySelector('.atlas-tools-toggle').click()");
  await p.wait("!!document.querySelector('.atlas-global-tools-panel')",'global legend available independently');
  await p.eval("document.querySelector('.atlas-tools-entry[aria-controls=atlas-section-legend]').click()");
  const activeLegend=await p.eval("Array.from(document.querySelectorAll('.atlas-tools-legend .legend-row')).map(x=>x.dataset.styleKey)");
  assert.deepEqual(activeLegend,['reference','ADM 8'],
    'Contextual legend shows neutral national outlines plus tree-selected ADM 8, not all 13 levels');
  await p.snap('desktop-legend-active-only.png');
  await p.eval("document.querySelector('.atlas-legend-expand').click()");
  const legend=await p.eval("(()=>{const l=document.querySelector('.atlas-tools-legend .map-legend');return [...l.querySelectorAll('.legend-row')].map(x=>({key:x.dataset.styleKey,color:getComputedStyle(x.querySelector('.legend-line')).borderTopColor,dash:getComputedStyle(x.querySelector('.legend-line')).borderTopStyle}));})()");
  assert.equal(legend.length,14,'Full legend expands to reference, seven ADM and six NUTS/NTS entries');
  assert.equal(new Set(legend.map(x=>x.color)).size,14,'Each cartographic border level has a unique color');
  assert.equal(legend.find(x=>x.key==='NTS 1')?.dash,'dashed');
  assert.equal(legend.find(x=>x.key==='ADM 2')?.dash,'solid');
  await p.eval("document.querySelector('.atlas-tools-legend .map-legend').scrollIntoView({block:'center'})");
  await pause(200);
  await p.snap('desktop-cartographic-legend.png');
  await p.eval("document.querySelector('.atlas-legend-expand').click()");
  assert.deepEqual(await p.eval("Array.from(document.querySelectorAll('.atlas-tools-legend .legend-row')).map(x=>x.dataset.styleKey)"),
    ['reference','ADM 8'],'Full legend collapses back to the styles on the map');
  await p.eval("document.querySelector('.atlas-tools-close').click()");
  await p.eval("document.querySelector('.module-rail button:first-child').click()");
  await p.wait("!!document.querySelector('.tree-sidebar .osm-level-filter')",'tree reopened after global legend');

  // A tree toggle changes individual selection, not filter checkboxes.
  await p.eval("document.querySelector('.tree-sidebar input[type=search]').focus()");
  await p.call('Input.insertText',{text:'Brețcu'});
  await p.wait("Array.from(document.querySelectorAll('.tree-sidebar .tree-line .tree-label')).some(x=>x.textContent.includes('Brețcu'))",
    'Brețcu tree search result visible');
  await p.eval("document.querySelector('.tree-sidebar .tree-line input[type=checkbox]').click()");
  await p.wait("!JSON.parse(localStorage.getItem('atlas-visible-phase4')).includes('siruta-u64096')",
    'Individual Brețcu checkbox hides its geometry');
  assert.equal(await p.eval("document.querySelector('.tree-sidebar .osm-level-choices input[aria-label=\"OSM 8\"]').checked"),false,
    'ADM 8 filter stays off after individual tree visibility toggle');
  assert.equal(await p.eval("document.querySelector('.map-area').dataset.mapVisibleCount"),'2');
  await p.snap('desktop-level8-hidden.png');

  // Selecting NUTS 1 and NTS 2 adds distinct geometries without changing the
  // persisted individual tree selection, and unchecking removes only overlays.
  await p.eval("document.querySelector('.tree-sidebar .osm-level-choices input[aria-label=\"NUTS 1\"]').click()");
  await p.wait("document.querySelector('.map-area')?.dataset.mapVisibleCount==='6'",
    'NUTS 1 shows four regions immediately');
  assert.equal(await p.eval("JSON.parse(localStorage.getItem('atlas-visible-phase4')).length"),2,
    'NUTS filter does not modify the tree-visible entity set');
  await p.eval("document.querySelector('.tree-sidebar .osm-level-choices input[aria-label=\"NTS 2\"]').click()");
  await p.wait("document.querySelector('.map-area')?.dataset.mapVisibleCount==='8'",
    'NTS 2 adds two regions to NUTS 1 without duplicates');
  assert.equal(await p.eval("!!document.querySelector('.atlas-global-tools-panel,#phase5-export-panel')"),false,
    'Global Export stays closed while Administrative filters are used');
  await pause(1000);
  await p.snap('desktop-statistical-regions-shown.png');
  await p.eval("document.querySelector('.tree-sidebar .osm-level-choices input[aria-label=\"NUTS 1\"]').click()");
  await p.wait("document.querySelector('.map-area')?.dataset.mapVisibleCount==='4'",
    'Unchecking NUTS 1 removes only its four regions');
  await p.eval("document.querySelector('.tree-sidebar .osm-level-choices input[aria-label=\"NTS 2\"]').click()");
  await p.wait("document.querySelector('.map-area')?.dataset.mapVisibleCount==='2'",
    'Unchecking NTS 2 leaves two neutral national reference contours');
  assert.equal(await p.eval("JSON.parse(localStorage.getItem('atlas-visible-phase4')).length"),2);
  await p.snap('desktop-statistical-regions-hidden.png');

  const rootsBeforeTreeView=await p.eval("localStorage.getItem('atlas-visible-phase4')");
  await p.eval("document.querySelector('.tree-sidebar .tree-filters button:nth-child(3)').click()");
  assert.equal(await p.eval("localStorage.getItem('atlas-visible-phase4')"),rootsBeforeTreeView,
    'Changing tree view does not change map visibility');
  await p.eval("document.querySelector('.tree-sidebar .tree-filters button:first-child').click()");

  // Reset selected polygons (not merely the camera), with storage, permalink and
  // user-preference persistence. Home must remain a camera-only operation.
  await p.eval("document.querySelector('.header-entity-action').click()");
  await p.wait("!!document.querySelector('.detail-sidebar .entity-actions button:first-child')",
    'Details reopened after independent global legend');
  await p.eval("document.querySelector('.detail-sidebar .entity-actions button:first-child').click()");
  await p.wait("JSON.parse(localStorage.getItem('atlas-visible-phase4')).length===3",'Brețcu displayed with national roots');
  await p.eval("document.querySelector('.zoom-controls button:last-child').click()");
  assert.equal(await p.eval("JSON.parse(localStorage.getItem('atlas-visible-phase4')).length"),3,
    'Home must not reset selected geometries');
  await p.eval("document.querySelector('.atlas-tools-toggle').click()");
  await p.eval("document.querySelector('.atlas-tools-entry[aria-controls=atlas-section-settings]').click()");
  await p.eval("document.querySelector('#atlas-section-settings .simplify-control input').click()");
  await p.wait("document.querySelector('#atlas-section-settings .simplify-control input').checked",
    'Global setting enables simplified geometries');
  await p.eval("(()=>{const s=document.querySelector('#atlas-section-settings .basemap-select select');s.value='grayscale';s.dispatchEvent(new Event('change',{bubbles:true}));})()");
  await p.wait("document.querySelector('#atlas-section-settings .basemap-select select').value==='grayscale'",
    'Global basemap setting chooses grayscale');
  await p.snap('desktop-map-settings.png');
  await p.eval("document.querySelector('.atlas-tools-close').click()");
  await p.eval("document.querySelector('.module-rail button:first-child').click()");
  await p.wait("!!document.querySelector('.tree-sidebar .atlas-admin-reset')",
    'Administrative panel reopened for its own geometry reset');
  await p.eval("Array.from(document.querySelectorAll('.language button')).find(b=>b.textContent==='RO').click()");
  await p.wait("document.documentElement.lang==='ro'",'Romanian reset label');
  await p.eval("history.replaceState(history.state,'','?utm=preserved&entity=siruta-u64096&lng=26.4&lat=45.9&zoom=9')");
  await p.eval("document.querySelector('.tree-sidebar .atlas-admin-reset').click()");
  await p.wait("(()=>{const v=JSON.parse(localStorage.getItem('atlas-visible-phase4'));return v.length===2&&v.includes('osm-r90689')&&v.includes('osm-r58974')})()",'default national preview restored');
  assert.equal(await p.eval("!!document.querySelector('.detail-sidebar')"),false,
    'Geometry reset closes the entity detail panel');
  await p.eval("document.querySelector('.module-rail button:first-child').click()");
  await p.wait("!!document.querySelector('.tree-sidebar input[type=search]')",'reopen tree after geometry reset');
  const resetState=await p.eval("({selected:!!document.querySelector('.detail-sidebar .entity-card'),rows:[...document.querySelectorAll('.tree-sidebar .tree-line input[type=checkbox]')].map(x=>x.checked),language:document.documentElement.lang,search:document.querySelector('.tree-sidebar input[type=search]').value,query:location.search})");
  assert.equal(resetState.selected,false,'Entity selection/detail must clear on geometry reset');
  assert.deepEqual(resetState.rows,[true,true],'Only two national root geometries must remain selected');
  assert.equal(resetState.search,'','Reset should restore unfiltered tree overview');
  assert.equal(resetState.language,'ro','Language must survive geometry reset');
  const romanianRoots=await p.eval("Array.from(document.querySelectorAll('.tree-sidebar .tree-list > .territory-branch > .tree-line .node-name')).map(x=>x.textContent.trim())");
  assert.deepEqual(romanianRoots,['România','Moldova'],'Romanian tree uses concise national names');
  await p.eval("document.querySelector('.atlas-tools-toggle').click()");
  await p.eval("document.querySelector('.atlas-tools-entry[aria-controls=atlas-section-settings]').click()");
  assert.equal(await p.eval("document.querySelector('#atlas-section-settings .simplify-control input').checked"),true,
    'Simplification preference survives geometry reset');
  assert.equal(await p.eval("document.querySelector('#atlas-section-settings .basemap-select select').value"),'grayscale',
    'Basemap preference survives geometry reset');
  await p.eval("document.querySelector('.atlas-tools-close').click()");
  assert(resetState.query.includes('utm=preserved'),'Unrelated permalink arguments must survive reset');
  for(const key of ['entity','lng','lat','zoom'])assert(!new URLSearchParams(resetState.query).has(key),
    'Reset must remove stale shared-URL '+key);
  await p.wait("!document.querySelector('.map-boot-status')",'original national preview reloaded');
  await p.snap('desktop-reset-geometries.png');

  await p.call('Page.reload',{ignoreCache:true});
  await p.wait("!!document.querySelector('.module-rail button:first-child')",'module rail after page reload');
  await p.eval("document.querySelector('.module-rail button:first-child').click()");
  await p.wait("document.querySelector('.tree-footnote')?.textContent.includes('4.283')",'catalog after geometry-reset reload');
  await p.wait("(()=>{const v=JSON.parse(localStorage.getItem('atlas-visible-phase4'));return v.length===2&&v.includes('osm-r90689')&&v.includes('osm-r58974')})()",'persisted reset roots after reload');
  assert.equal(await p.eval("!!document.querySelector('.detail-sidebar .entity-card')"),false,
    'Reset permalink cannot revive the old selected entity on reload');
  await p.eval("document.querySelector('.atlas-tools-toggle').click()");
  await p.eval("document.querySelector('.atlas-tools-entry[aria-controls=atlas-section-settings]').click()");
  assert.equal(await p.eval("document.querySelector('#atlas-section-settings .simplify-control input').checked"),true,
    'Simplification preference survives reset and page reload');
  await p.eval("document.querySelector('.atlas-tools-close').click()");
  await p.eval("document.querySelector('.module-rail button:first-child').click()");
  await p.wait("!!document.querySelector('.tree-sidebar input[type=search]')",
    'Reopen Administrative tree after global Settings before alias search');
  await p.eval("document.querySelector('.tree-sidebar input[type=search]').focus()");
  await p.call('Input.insertText',{text:'Unitățile din stânga Nistrului'});
  await pause(700);
  const aliasResult=await p.eval("(()=>({query:document.querySelector('.tree-sidebar input[type=search]')?.value,view:[...document.querySelectorAll('.tree-sidebar .tree-filters button')].filter(x=>x.getAttribute('aria-pressed')==='true').map(x=>x.textContent.trim()),matches:[...document.querySelectorAll('.tree-sidebar .tree-list .tree-label .node-name')].map(x=>x.textContent.trim()),count:document.querySelector('.tree-sidebar .results-heading')?.textContent.trim()}))()");
  assert(aliasResult.matches.includes('Transnistria'),
    'Official MD120 search must resolve to short label: '+JSON.stringify(aliasResult));
  await p.snap('desktop-east-transnistria-short-ro.png');
  await p.eval("Array.from(document.querySelectorAll('.language button')).find(x=>x.textContent==='EN').click()");
  await p.wait("document.documentElement.lang==='en'",'English language switch');
  await p.wait("Array.from(document.querySelectorAll('.tree-sidebar .tree-list .tree-label .node-name')).some(x=>x.textContent.trim()==='Transnistria')",
    'Same MD120 source alias resolves to Transnistria in English');
  await p.snap('desktop-east-transnistria-short-en.png');
  // The certified administrative left-bank relation has its own ID and must
  // be short just like the distinct statistical MD120 entity.
  await p.eval("document.querySelector('.tree-sidebar input[type=search]').focus();document.querySelector('.tree-sidebar input[type=search]').select()");
  await p.call('Input.insertText',{text:'Unitățile administrativ-teritoriale din stînga Nistrului'});
  await p.wait("Array.from(document.querySelectorAll('.tree-sidebar .tree-list .tree-label .node-name')).filter(x=>['Transnistria','ATULBD'].includes(x.textContent.trim())).length===2",
    'Original full-name search resolves distinct Transnistria NTS3 and ATULBD ADM4 labels');
  await p.snap('desktop-east-distinct-stat-admin-en.png');
  await p.eval("document.querySelector('.tree-sidebar input[type=search]').focus();document.querySelector('.tree-sidebar input[type=search]').select()");
  await p.call('Input.insertText',{text:'Basarabeasca District'});
  await p.wait("Array.from(document.querySelectorAll('.tree-sidebar .tree-list .tree-label .node-name')).some(x=>x.textContent.trim()==='Basarabeasca')",
    'District can be searched by full English name but appears without District');
  await p.snap('desktop-district-short-en.png');
  await p.eval("document.querySelector('.tree-sidebar input[type=search]').focus();document.querySelector('.tree-sidebar input[type=search]').select()");
  await p.call('Input.insertText',{text:'Bălți Municipality'});
  await p.wait("Array.from(document.querySelectorAll('.tree-sidebar .tree-list .tree-label .node-name')).some(x=>x.textContent.trim()==='Bălți')",
    'Municipality can be searched by original name but appears without Municipality');
  await p.snap('desktop-municipality-short-en.png');
  // WEB-R3.11: the historical OSMB council label remains a valid search alias;
  // only the Romanian tree display is shortened. English remains Kitskany.
  await p.eval("document.querySelector('.tree-sidebar input[type=search]').focus();document.querySelector('.tree-sidebar input[type=search]').select()");
  await p.call('Input.insertText',{text:'Sovetul sătesc Chițcani'});
  await p.wait("Array.from(document.querySelectorAll('.tree-sidebar .tree-list .tree-label .node-name')).some(x=>x.textContent.trim()==='Kitskany')",
    'Chițcani source alias resolves to original English short name');
  await p.snap('desktop-chitcani-short-en.png');
  await p.eval("Array.from(document.querySelectorAll('.language button')).find(x=>x.textContent==='RO').click()");
  await p.wait("document.documentElement.lang==='ro'",'Romanian locale for Chițcani');
  await p.wait("Array.from(document.querySelectorAll('.tree-sidebar .tree-list .tree-label .node-name')).some(x=>x.textContent.trim()==='Chițcani')",
    'Romanian tree presents Chițcani without the OSMB council descriptor');
  assert.equal(await p.eval("Array.from(document.querySelectorAll('.tree-sidebar .tree-list .tree-label')).find(x=>x.querySelector('.node-name')?.textContent.trim()==='Chițcani')?.title"),
    'Sovetul sătesc Chițcani','Original OSMB descriptor retained in the tree title');
  await p.snap('desktop-chitcani-short-ro.png');
  // WEB-R3.12 — source aliases must stay searchable after UATSN name overrides.
  await p.eval("document.querySelector('.tree-sidebar input[type=search]').focus();document.querySelector('.tree-sidebar input[type=search]').select()");
  await p.call('Input.insertText',{text:'Sovetul sătesc Popencu'});
  await p.wait("Array.from(document.querySelectorAll('.tree-sidebar .tree-list .tree-label .node-name')).some(x=>x.textContent.trim()==='Popencu')",
    'Popencu retains source alias and has concise Romanian display name');
  const popencuTitle=await p.eval("Array.from(document.querySelectorAll('.tree-sidebar .tree-list .tree-label')).find(x=>x.querySelector('.node-name')?.textContent.trim()==='Popencu')?.title");
  assert.equal(popencuTitle,'comuna Popencu','CUATM official name retained in tree title; original OSMB name remains searchable');
  await p.snap('desktop-uatsn-popencu-ro.png');
  await p.eval("Array.from(document.querySelectorAll('.language button')).find(x=>x.textContent==='EN').click()");
  await p.wait("document.documentElement.lang==='en'",'English locale for Popencu');
  await p.wait("Array.from(document.querySelectorAll('.tree-sidebar .tree-list .tree-label .node-name')).some(x=>x.textContent.trim()==='Popencu')",
    'Popencu also concise in English');
  await p.snap('desktop-uatsn-popencu-en.png');
  await p.eval("Array.from(document.querySelectorAll('.language button')).find(x=>x.textContent==='RO').click()");
  await p.wait("document.documentElement.lang==='ro'",'Romanian locale for Pervomaisc');
  await p.eval("document.querySelector('.tree-sidebar input[type=search]').focus();document.querySelector('.tree-sidebar input[type=search]').select()");
  await p.call('Input.insertText',{text:'Satul Pervomaisc'});
  await p.wait("Array.from(document.querySelectorAll('.tree-sidebar .tree-list .tree-label .node-name')).some(x=>x.textContent.trim()==='Pervomaisc')",
    'Original official name finds Pervomaisc despite misleading Slobozia source name');
  await p.snap('desktop-uatsn-pervomaisc-ro.png');
  await p.eval("document.querySelector('.tree-sidebar input[type=search]').focus();document.querySelector('.tree-sidebar input[type=search]').select()");
  await p.call('Input.insertText',{text:'Sovetul orășenesc Dubăsari'});
  await p.wait("Array.from(document.querySelectorAll('.tree-sidebar .tree-list .tree-label .node-name')).some(x=>x.textContent.trim()==='Dubăsari')",
    'Dubăsari city council shows geographical Romanian short label');
  await p.snap('desktop-uatsn-dubasari-ro.png');
  await p.close();
}
async function tablet(cdp){
  const p=await cdp.page(900,780,false);
  await p.wait("!!document.querySelector('.zoom-controls')",'tablet map');
  await p.wait("document.querySelector('.map-area')?.dataset.mapReady==='true'",
    'source polygons and map ready on tablet');
  await pause(850);
  assert.equal(await p.eval("!!document.querySelector('.tree-sidebar')"),false,'Tablet module starts closed');
  assert.equal(await p.eval("!!document.querySelector('.detail-sidebar')"),false,'Tablet details start closed');
  assert((await p.eval("document.querySelector('.map-area').getBoundingClientRect().width"))>820,
    'Tablet map uses the available width');
  await p.snap('tablet-initial.png');
  await p.eval("document.querySelector('.module-rail button:first-child').click()");
  await p.wait("!!document.querySelector('.tree-sidebar .tree-line')",'tablet module opened');
  await p.snap('tablet-module-open.png');
  await p.eval("document.querySelector('.tree-sidebar .tree-line .tree-label').click()");
  await p.wait("!!document.querySelector('.detail-sidebar .entity-card')",'tablet entity details opened');
  assert.equal(await p.eval("!!document.querySelector('.tree-sidebar')"),false,
    'Tablet details replace module panel to keep one overlay');
  await p.snap('tablet-detail-open.png');
  await p.eval("document.querySelector('.detail-sidebar .pane-close').click()");
  assert.equal(await p.eval("!!document.querySelector('.detail-sidebar')"),false,'Tablet detail closed');
  await p.eval("document.querySelector('.module-rail button:first-child').click()");
  await p.wait("!!document.querySelector('.tree-sidebar .tree-line[aria-selected=true]')",
    'Tablet closing detail must preserve entity selection');
  await p.eval("document.querySelector('.tree-sidebar .pane-close').click()");
  assert.equal(await p.eval("!!document.querySelector('.tree-sidebar')"),false,
    'Tablet module close button restores map');
  await p.close();
}
async function assertMobileScalePlacement(p,label){
  const geometry=await p.eval("(()=>{const area=document.querySelector('.map-area').getBoundingClientRect();const rail=document.querySelector('.module-rail').getBoundingClientRect();const scale=document.querySelector('.maplibregl-ctrl-scale').getBoundingClientRect();const attr=document.querySelector('.maplibregl-ctrl-attrib').getBoundingClientRect();const paddedIntersection=!(scale.right+4<=attr.left||attr.right+4<=scale.left||scale.bottom+4<=attr.top||attr.bottom+4<=scale.top);return {mapBottom:area.bottom,railTop:rail.top,scaleBottom:scale.bottom,scaleLeft:scale.left,mapLeft:area.left,scaleRight:scale.right,attributionLeft:attr.left,overlapsAttribution:paddedIntersection};})()");
  assert(geometry.mapBottom-geometry.scaleBottom>=5&&geometry.mapBottom-geometry.scaleBottom<=28,
    label+' scale must sit near bottom of map, not float above it: '+JSON.stringify(geometry));
  assert(geometry.scaleLeft>=geometry.mapLeft+5&&geometry.scaleBottom<=geometry.railTop-5,
    label+' scale must remain inside the map, clear of module bar: '+JSON.stringify(geometry));
  assert(!geometry.overlapsAttribution,
    label+' scale must not cover OpenStreetMap attribution: '+JSON.stringify(geometry));
}
async function mobile(cdp){
  const p=await cdp.page(390,844,true);
  await p.wait("!!document.querySelector('.map-area .zoom-controls')",'mobile app mounted');
  await p.wait("document.querySelector('.map-area')?.dataset.mapReady==='true'",
    'source polygons and map ready on mobile');
  await pause(850);
  assert.equal(await p.eval("!!document.querySelector('.detail-sidebar')"),false,'Mobile starts without empty detail panel');
  await p.wait("!document.querySelector('.map-boot-status')",'mobile national contours');
  const geometry=await p.eval("({width:innerWidth,scroll:document.documentElement.scrollWidth,height:document.querySelector('.map-area').getBoundingClientRect().height,zoomButtons:document.querySelectorAll('.map-area .zoom-controls button').length})");
  assert(geometry.scroll<=geometry.width+1,'Mobile horizontal overflow');
  assert(geometry.height>300,'Map is hidden on mobile');
  assert.equal(geometry.zoomButtons,3,'Mobile map contains only zoom and Home');
  assert.equal(await p.eval("!!document.querySelector('.map-area .mobile-controls')"),false,
    'Duplicate mobile floating buttons removed');
  await assertMobileScalePlacement(p,'390px');
  await p.snap('mobile-initial.png');
  // Tools are a separate modal; only one secondary category expands at a time.
  await p.eval("document.querySelector('.atlas-tools-toggle').click()");
  await p.wait("!!document.querySelector('.atlas-global-tools-panel')",'mobile global map tools');
  assert.equal(await p.eval("document.querySelector('.atlas-global-tools-panel').getAttribute('aria-modal')"),'true');
  assert.equal(await p.eval("document.activeElement===document.querySelector('.atlas-tools-close')"),true);
  const mobileMenu=await p.eval("(()=>{const panel=document.querySelector('.atlas-global-tools-panel');const rc=panel.getBoundingClientRect();const map=document.querySelector('.map-area').getBoundingClientRect(),rail=document.querySelector('.module-rail').getBoundingClientRect();return {entries:panel.querySelectorAll('.atlas-tools-entry').length,width:rc.width,bottom:rc.bottom,top:rc.top,rail:rail.top,mapTop:map.top,scroll:document.documentElement.scrollWidth,handle:!!panel.querySelector('.atlas-tools-grab'),about:!!panel.querySelector('.atlas-tools-about-link')}})()");
  assert(mobileMenu.entries===3&&mobileMenu.width>=389&&mobileMenu.bottom<=mobileMenu.rail+1
    &&mobileMenu.top>mobileMenu.mapTop+70&&mobileMenu.handle&&mobileMenu.about&&mobileMenu.scroll<=391,
    'Adaptive bottom sheet uses the full phone width, starts below map header, clears module bar');
  await p.snap('mobile-global-tools-menu.png');
  await p.eval("document.querySelector('.atlas-tools-entry[aria-controls=atlas-section-legend]').click()");
  assert.deepEqual(await p.eval("Array.from(document.querySelectorAll('.atlas-tools-legend .legend-row')).map(x=>x.dataset.styleKey)"),
    ['reference'],'Mobile legend starts with only two national neutral reference contours');
  await p.snap('mobile-global-legend-contextual.png');
  await p.eval("document.querySelector('.atlas-legend-expand').click()");
  assert.equal(await p.eval("document.querySelectorAll('.atlas-tools-legend .legend-row').length"),14);
  await p.snap('mobile-global-legend.png');
  await p.eval("document.querySelector('.atlas-tools-entry[aria-controls=phase5-export-panel]').click()");
  assert.equal(await p.eval("!!document.querySelector('.atlas-tools-legend .map-legend')"),false,
    'Opening Export collapses the mobile Legend');
  assert.equal(await p.eval("!!document.querySelector('#phase5-export-panel select')"),true,
    'Export is available without opening any module');
  // Gesture dismissal is a real touch sequence on the non-interactive grip.
  const grab=await p.eval("(()=>{const r=document.querySelector('.atlas-tools-grab').getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2};})()");
  await p.call('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:grab.x,y:grab.y}]});
  await p.call('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:grab.x,y:grab.y+112}]});
  await p.call('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  await p.wait("!document.querySelector('.atlas-global-tools-panel')",'Swipe-down grip dismisses the sheet');
  await p.wait("document.activeElement===document.querySelector('.atlas-tools-toggle')",
    'Swipe dismiss returns focus to map tools icon');
  await p.eval("document.querySelector('.atlas-tools-toggle').click()");
  await p.wait("!!document.querySelector('.atlas-global-tools-panel')",'Sheet reopens after swipe');
  await p.eval("document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true}))");
  await p.wait("!document.querySelector('.atlas-global-tools-panel')",'Mobile Escape closes bottom sheet');
  await p.wait("document.activeElement===document.querySelector('.atlas-tools-toggle')",
    'Mobile global tool Escape returns focus to opener');
  await p.eval("document.querySelector('.module-rail button:first-child').click()");
  await p.wait("!!document.querySelector('.drawer[role=dialog] .tree-content')",'mobile tree drawer');
  await p.wait("!!document.querySelector('.drawer .tree-footnote strong')",'mobile catalog shown in drawer');
  assert(await p.eval("document.querySelector('.drawer[role=dialog]')?.getAttribute('aria-modal')==='true'"));
  await p.snap('mobile-tree-drawer.png');
  // WEB-R3.10 mobile: same regional/ADM4/ADM8 nesting in the drawer,
  // regardless of the persisted Romanian/English locale preference.
  const regionalLocale=await p.eval("document.documentElement.lang==='ro'?'Nord':'North'");
  const westernLocale=await p.eval("document.documentElement.lang==='ro'?'Vest':'West'");
  const drawerLine=(name)=>"Array.from(document.querySelectorAll('.drawer .tree-line')).find(x=>x.querySelector('.node-name')?.textContent.trim()==="+JSON.stringify(name)+")";
  await p.eval(drawerLine('Moldova')+".querySelector('.expand-button').click()");
  await p.wait("!!("+drawerLine(westernLocale)+")",'mobile western statistical region');
  await p.eval(drawerLine(westernLocale)+".querySelector('.expand-button').click()");
  const westMobileChildren=await p.eval("(()=>{const x="+drawerLine(westernLocale)+";return [...x.closest('.territory-branch').querySelectorAll(':scope > .tree-children > .territory-branch > .tree-line')].map(x=>x.querySelector('.node-name')?.textContent.trim());})()");
  assert.deepEqual(westMobileChildren,await p.eval("document.documentElement.lang==='ro'")?
    ['Chișinău','Nord','Centru','Sud','Găgăuzia']:
    ['Chișinău','North','Centre','South','Gagauzia'],
    'Mobile West children start with Chișinău in either locale');
  await p.eval(drawerLine(westernLocale)+".scrollIntoView({block:'start'})");
  await p.snap('mobile-west-chisinau-first.png');
  await p.wait("!!("+drawerLine(regionalLocale)+")",'mobile northern statistical region');
  await p.eval(drawerLine(regionalLocale)+".querySelector('.expand-button').click()");
  const firstNorthern=await p.eval("(()=>{const x="+drawerLine(regionalLocale)+";return [...x.closest('.territory-branch').querySelectorAll(':scope > .tree-children > .territory-branch > .tree-line .node-name')].map(x=>x.textContent.trim());})()");
  assert.equal(firstNorthern.length,12);
  assert.equal(firstNorthern[0],'Bălți','Mobile northern region puts agency seat first');
  const baltiDistrict="Array.from(document.querySelectorAll('.drawer .tree-line')).find(x=>x.querySelector('.node-name')?.textContent.trim()==='Bălți'&&x.querySelector('.node-level')?.textContent.trim().startsWith('ADM 4'))";
  await p.eval(baltiDistrict+".querySelector('.expand-button').click()");
  await p.wait("(()=>{const x="+baltiDistrict+";return !!x?.closest('.territory-branch')?.querySelector('.tree-children .territory-branch');})()",
    'Mobile Bălți ADM8 expanded');
  const mobileBaltiFirst=await p.eval("(()=>{const x="+baltiDistrict+";return x.closest('.territory-branch').querySelector(':scope > .tree-children > .territory-branch > .tree-line .node-name')?.textContent.trim();})()");
  assert.equal(mobileBaltiFirst,'Bălți','Mobile seat locality first');
  await p.eval(baltiDistrict+".scrollIntoView({block:'center'})");
  await p.snap('mobile-md-north-balti-nested.png');
  await p.eval(baltiDistrict+".querySelector('.expand-button').click()");
  await p.eval(drawerLine(regionalLocale)+".querySelector('.expand-button').click()");
  await p.eval(drawerLine(westernLocale)+".querySelector('.expand-button').click()");
  await p.eval(drawerLine('Moldova')+".querySelector('.expand-button').click()");
  // WEB-R3.13 mobile: verify East hierarchy and distinguish both UATSN Hlinaia.
  const originalEastMobileLocale=await p.eval("document.documentElement.lang");
  if(originalEastMobileLocale!=='ro')
    await p.eval("Array.from(document.querySelectorAll('.language button')).find(x=>x.textContent==='RO').click()");
  await p.wait("document.documentElement.lang==='ro'",'Mobile Romanian East tree');
  const eastDrawerRow=(name,level)=>"Array.from(document.querySelectorAll('.drawer .tree-line')).find(x=>x.querySelector('.node-name')?.textContent.trim()==="+JSON.stringify(name)+"&&x.querySelector('.node-level')?.textContent.trim().startsWith("+JSON.stringify(level)+"))";
  await p.eval(drawerLine('Moldova')+".querySelector('.expand-button').click()");
  await p.eval(eastDrawerRow('Est','NTS 2')+".querySelector('.expand-button').click()");
  await p.eval(eastDrawerRow('Transnistria','NTS 3')+".querySelector('.expand-button').click()");
  const mobileEastOrder=await p.eval("(()=>{const x="+eastDrawerRow('Transnistria','NTS 3')+";return [...x.closest('.territory-branch').querySelectorAll(':scope > .tree-children > .territory-branch > .tree-line')].map(x=>x.querySelector('.node-name')?.textContent.trim());})()");
  assert.deepEqual(mobileEastOrder,['UATSN','Bender']);
  await p.eval(eastDrawerRow('UATSN','ADM 4')+".querySelector('.expand-button').click()");
  const mobileEastKids=await p.eval("(()=>{const x="+eastDrawerRow('UATSN','ADM 4')+";return [...x.closest('.territory-branch').querySelectorAll(':scope > .tree-children > .territory-branch > .tree-line')].map(x=>({name:x.querySelector('.node-name')?.textContent.trim(),level:x.querySelector('.node-level')?.textContent.trim()}));})()");
  assert.equal(mobileEastKids.length,79);
  assert.deepEqual(mobileEastKids.map(x=>x.name),[...mobileEastKids.map(x=>x.name)].sort((a,b)=>a.localeCompare(b,'ro')));
  assert.deepEqual(mobileEastKids.filter(x=>x.name==='Hlinaia').map(x=>x.level),
    ['ADM 8 · CUATM 7625','ADM 8 · CUATM 5029']);
  await p.eval("(()=>{const x="+eastDrawerRow('UATSN','ADM 4')+";const rows=[...x.closest('.territory-branch').querySelectorAll(':scope > .tree-children > .territory-branch > .tree-line')];rows.find(x=>x.querySelector('.node-level')?.textContent.includes('CUATM 7625')).scrollIntoView({block:'center'});})()");
  await p.snap('mobile-east-uatsn-hlinaia-ro.png');
  await p.eval(eastDrawerRow('UATSN','ADM 4')+".querySelector('.expand-button').click()");
  await p.eval(eastDrawerRow('Transnistria','NTS 3')+".querySelector('.expand-button').click()");
  await p.eval(eastDrawerRow('Est','NTS 2')+".querySelector('.expand-button').click()");
  await p.eval(drawerLine('Moldova')+".querySelector('.expand-button').click()");
  if(originalEastMobileLocale!=='ro')
    await p.eval("Array.from(document.querySelectorAll('.language button')).find(x=>x.textContent==='EN').click()");
  await p.wait("document.documentElement.lang==="+JSON.stringify(originalEastMobileLocale),
    'Mobile locale restored after East QA');
  await p.eval("document.querySelector('.drawer .tree-line .tree-label').click()");
  await p.wait("!!document.querySelector('.drawer-detail .entity-card')",'Mobile selection opens details');
  await p.eval("document.querySelector('.drawer-close').click()");
  await p.wait("!document.querySelector('.drawer-screen')",'Mobile detail close');
  assert.equal(await p.eval("!!document.querySelector('.header-entity-action')"),true,'Header entity opener exists');
  await p.eval("document.querySelector('.header-entity-action').click()");
  await p.wait("!!document.querySelector('.drawer-detail .entity-card')",'Mobile detail reopened');
  await p.eval("document.querySelector('.drawer-close').click()");
  await p.eval("document.querySelector('.module-rail button:first-child').click()");
  await p.wait("!!document.querySelector('.drawer .osm-level-filter')",'Tree drawer reopened');
  await p.eval("document.querySelector('.drawer .osm-level-filter>summary').click()");
  const mobileFilterTitle=await p.eval("({title:document.querySelector('.drawer .osm-level-filter>summary').textContent.trim(),lang:document.documentElement.lang})");
  assert.equal(mobileFilterTitle.title,mobileFilterTitle.lang==='ro'?'Filtre':'Filters',
    'Mobile unified filter title follows saved locale');
  const mobileFilters=await p.eval("(()=>{const root=document.querySelector('.drawer .tree-content');const children=[...root.children];const order=x=>children.findIndex(el=>el.matches(x));return {columns:[...root.querySelectorAll('.osm-level-columns>fieldset')].map(x=>x.getAttribute('data-column')),scopes:root.querySelectorAll('.osm-level-scopes label').length,actions:root.querySelectorAll('.osm-level-actions button').length,statistical:root.querySelectorAll('.osm-level-choices label[data-level-kind=statistical]').length,active:[...root.querySelectorAll('.osm-level-choices input')].filter(x=>x.checked).length,adm2:root.querySelector('.osm-level-choices input[aria-label=\"OSM 2\"]').checked,ordering:[order('.osm-level-filter'),order('.tree-filters'),order('.tree-list')],ro:document.querySelector('.map-area').dataset.roStyle,md:document.querySelector('.map-area').dataset.mdStyle};})()");
  assert.deepEqual(mobileFilters.columns,['administrative','statistical']);
  assert.equal(mobileFilters.scopes,0,'No country checkboxes in mobile Filters');
  assert.equal(mobileFilters.actions,0,'No Show/Hide buttons on mobile');
  assert.equal(mobileFilters.statistical,6,'All NUTS/NTS levels in right-hand column');
  assert.equal(mobileFilters.active,0,'All filters start unchecked on mobile');
  assert.equal(mobileFilters.adm2,false,'Tree-visible national outlines do not tick ADM 2');
  assert.equal(mobileFilters.ro,'reference');
  assert.equal(mobileFilters.md,'reference');
  assert(mobileFilters.ordering[0]<mobileFilters.ordering[1]&&mobileFilters.ordering[1]<mobileFilters.ordering[2]);
  await p.snap('mobile-osm-level-filter.png');
  await p.eval("document.querySelector('.drawer .osm-level-choices input[aria-label=\"NTS 1\"]').click()");
  await p.wait("document.querySelector('.map-area')?.dataset.mdStyle==='NTS 1'",
    'Mobile NTS 1 restyles Moldova national boundary');
  assert.equal(await p.eval("document.querySelector('.map-area').dataset.mapVisibleCount"),'2');
  await p.snap('mobile-nts1-statistical-outline.png');
  // A separate full-map capture is needed: the open mobile drawer covers the border.
  await p.eval("document.querySelector('.module-rail button:first-child').click()");
  await p.wait("!document.querySelector('.drawer-screen')",'Mobile NTS 1 map unobstructed');
  await pause(700);
  await p.snap('mobile-nts1-map-visible.png');
  await p.eval("document.querySelector('.module-rail button:first-child').click()");
  await p.wait("!!document.querySelector('.drawer .osm-level-filter>summary')",
    'Mobile filter drawer reopened after map-style capture');
  await p.eval("document.querySelector('.drawer .osm-level-filter>summary').click()");
  await p.wait("document.querySelector('.drawer .osm-level-choices input[aria-label=\"NTS 1\"]')?.checked",
    'NTS 1 filter stays checked after closing and reopening the drawer');
  await p.eval("document.querySelector('.drawer .osm-level-choices input[aria-label=\"NTS 1\"]').click()");
  await p.wait("document.querySelector('.map-area')?.dataset.mdStyle==='reference'",
    'Mobile NTS 1 unchecked restores Moldova reference outline');
  await p.eval("document.querySelector('.drawer .osm-level-choices input[aria-label=\"NUTS 1\"]').click()");
  await p.wait("document.querySelector('.map-area')?.dataset.mapVisibleCount==='6'",
    'Mobile NUTS 1 instantly displays four regions');
  await p.snap('mobile-statistical-regions-shown.png');
  await p.eval("document.querySelector('.drawer .osm-level-choices input[aria-label=\"NUTS 1\"]').click()");
  await p.wait("document.querySelector('.map-area')?.dataset.mapVisibleCount==='2'",
    'Mobile NUTS 1 unchecked restores the two national outlines');
  assert.equal(await p.eval("JSON.parse(localStorage.getItem('atlas-visible-phase4')).length"),2);
  await p.eval("document.querySelector('.module-rail button:first-child').click()");
  await p.wait("!document.querySelector('.drawer-screen')",'Repeated mobile module click closes drawer');
  await p.eval("Array.from(document.querySelectorAll('.language button')).find(b=>b.textContent==='RO').click()");
  await p.wait("document.documentElement.lang==='ro'",'Romanian language');
  await p.snap('mobile-ro.png');
  assert((await p.eval('document.documentElement.scrollWidth'))<=391,'Mobile overflow in Romanian');
  await p.eval("document.querySelector('.module-rail button:first-child').click()");
  await p.wait("!!document.querySelector('.drawer[role=dialog] .tree-content')",'mobile tree for geometry reset');
  await p.eval("document.querySelector('.drawer .tree-line input[type=checkbox]').click()");
  await p.wait("JSON.parse(localStorage.getItem('atlas-visible-phase4')).length===1",'mobile country outline deselected');
  assert.equal(await p.eval("document.querySelector('.drawer .atlas-admin-reset').textContent.includes('Restabilește afișarea inițială')"),true);
  await p.eval("document.querySelector('.drawer .atlas-admin-reset').click()");
  await p.wait("(()=>{const v=JSON.parse(localStorage.getItem('atlas-visible-phase4'));return v.length===2&&v.includes('osm-r90689')&&v.includes('osm-r58974')})()",'mobile default national preview');
  assert((await p.eval('document.documentElement.scrollWidth'))<=391,'Mobile reset action must not introduce overflow');
  await p.snap('mobile-reset-geometries.png');
  await p.eval("if(!document.querySelector('.drawer .tree-content'))document.querySelector('.module-rail button:first-child').click()");
  await p.wait("!!document.querySelector('.drawer .tree-line .node-name')",
    'mobile Administrative tree is open for Nistrenia verification');
  await p.eval("Array.from(document.querySelectorAll('.drawer .tree-line')).find(x=>x.querySelector('.node-name')?.textContent.trim()==='Moldova').querySelector('.expand-button').click()");
  await p.wait("Array.from(document.querySelectorAll('.drawer .tree-line .node-name')).some(x=>x.textContent.trim()==='Nistrenia')",
    'Romanian Nistrenia appears beneath Moldova on mobile');
  await p.eval("Array.from(document.querySelectorAll('.drawer .tree-line')).find(x=>x.querySelector('.node-name')?.textContent.trim()==='Nistrenia').querySelector('.expand-button').click()");
  const pmrRomanian=await p.eval("(()=>{const line=Array.from(document.querySelectorAll('.drawer .tree-line')).find(x=>x.querySelector('.node-name')?.textContent.trim()==='Nistrenia');return Array.from(line.closest('.territory-branch').querySelectorAll(':scope > .tree-children > .territory-branch > .tree-line .node-name')).map(x=>x.textContent.trim());})()");
  assert.deepEqual(pmrRomanian,['Tiraspol','Bender','Slobozia','Grigoriopol','Dubăsari','Rîbnița','Camenca'],
    'Romanian mobile Nistrenia: Tiraspol, Bender then raions south-to-north');
  await p.eval("Array.from(document.querySelectorAll('.drawer .tree-line')).find(x=>x.querySelector('.node-name')?.textContent.trim()==='Nistrenia').scrollIntoView({block:'start'})");
  await p.snap('mobile-nistrenia-web-r315-fixed-order-ro.png');
  await p.eval("Array.from(document.querySelectorAll('.drawer .tree-line')).find(x=>x.querySelector('.node-name')?.textContent.trim()==='Nistrenia').querySelector('.expand-button').click()");
  // Mobile, Romanian Administrative view: Găgăuzia and Chișinău are
  // direct administrative children of Moldova (the mixed tree is verified
  // separately on desktop through their statistical parent Vest).
  await p.eval("document.querySelector('.drawer .tree-filters button:nth-child(2)').click()");
  await p.wait("document.querySelector('.drawer .tree-filters button:nth-child(2)').getAttribute('aria-pressed')==='true'",
    'Administrative tree view selected explicitly');
  await p.eval("(()=>{const line=Array.from(document.querySelectorAll('.drawer .tree-line')).find(x=>x.querySelector('.node-name')?.textContent.trim()==='Moldova');if(line?.getAttribute('aria-expanded')!=='true')line?.querySelector('.expand-button')?.click();})()");
  await pause(450);
  const mobileBranchDebug=await p.eval("(()=>{const root=Array.from(document.querySelectorAll('.drawer .tree-line')).find(x=>x.querySelector('.node-name')?.textContent.trim()==='Moldova');return {lang:document.documentElement.lang,view:[...document.querySelectorAll('.drawer .tree-filters button')].map(x=>({text:x.textContent.trim(),selected:x.getAttribute('aria-pressed')})),rootExpanded:root?.getAttribute('aria-expanded'),visibleNames:[...document.querySelectorAll('.drawer .tree-line .node-name')].map(x=>x.textContent.trim()).slice(0,70),search:document.querySelector('.drawer input[type=search]')?.value}})()");
  assert(mobileBranchDebug.visibleNames.includes('Găgăuzia')&&mobileBranchDebug.visibleNames.includes('Chișinău'),
    'Găgăuzia/Chișinău must be direct mobile Administrative children: '+JSON.stringify(mobileBranchDebug));
  // WEB-R3.9: mobile Romanian nesting. The unit identities stay intact.
  const mobileRow=(name,level)=>"Array.from(document.querySelectorAll('.drawer .tree-line')).find(x=>x.querySelector('.node-name')?.textContent.trim()==="+JSON.stringify(name)+"&&x.querySelector('.node-level')?.textContent.trim().startsWith("+JSON.stringify(level)+"))";
  const mobileChildren=async expr=>await p.eval("(()=>{const l="+expr+";return Array.from(l.closest('.territory-branch').querySelectorAll(':scope > .tree-children > .territory-branch > .tree-line')).map(x=>({name:x.querySelector('.node-name')?.textContent.trim(),level:x.querySelector('.node-level')?.textContent.trim()}));})()");
  for(const parentName of ['Găgăuzia','Chișinău']){
    const root=mobileRow(parentName,'ADM 4');
    await p.wait("!!("+root+")",parentName+' visible on mobile');
    await p.eval(root+".querySelector('.expand-button').click()");
    const direct=await mobileChildren(root);
    if(parentName==='Găgăuzia'){
      assert.deepEqual(direct.map(x=>x.name),['Comrat','Ceadîr-Lunga','Vulcănești']);
      assert(direct.every(x=>x.level==='ADM 5'));
      const raion=mobileRow('Comrat','ADM 5');
      await p.eval(raion+".querySelector('.expand-button').click()");
      const kids=await mobileChildren(raion);
      assert.equal(kids.length,13,'Comrat raion ADM8 localities indented');
      assert(kids.every(x=>x.level==='ADM 8'));
      await p.eval(raion+".scrollIntoView({block:'start'})");
      await p.snap('mobile-gagauzia-raion-nested-ro.png');
      await p.eval(raion+".querySelector('.expand-button').click()");
    }else{
      assert.equal(direct.length,19,'City Chișinău and 18 other ADM8 localities');
      assert.deepEqual(direct[0],{name:'Chișinău',level:'ADM 8'});
      assert(direct.slice(1).every(x=>x.level==='ADM 8'));
      const city=mobileRow('Chișinău','ADM 8');
      await p.eval(city+".querySelector('.expand-button').click()");
      const sectors=await mobileChildren(city);
      assert.deepEqual(sectors.map(x=>x.name),['Botanica','Buiucani','Centru','Ciocana','Rîșcani']);
      assert(sectors.every(x=>x.level==='ADM 7'));
      await p.eval(city+".scrollIntoView({block:'start'})");
      await p.snap('mobile-chisinau-city-sectors-nested-ro.png');
      await p.eval(city+".querySelector('.expand-button').click()");
    }
    await p.eval(root+".querySelector('.expand-button').click()");
  }
  await p.eval("Array.from(document.querySelectorAll('.drawer .tree-line')).find(x=>x.querySelector('.node-name')?.textContent.trim()==='Moldova').querySelector('.expand-button').click()");
  // The pre-existing short-name search verifies two identities, one ADM and
  // one statistical, so it must run in All view after the new ADM-only audit.
  await p.eval("document.querySelector('.drawer .tree-filters button:first-child').click()");
  await p.wait("document.querySelector('.drawer .tree-filters button:first-child').getAttribute('aria-pressed')==='true'",
    'Restore All view for dual administrative/statistical identity search');
  await p.wait("!!document.querySelector('.drawer input[type=search]')",
    'Mobile tree available for short-name verification');
  await p.eval("document.querySelector('.drawer input[type=search]').focus()");
  await p.call('Input.insertText',{text:'Unitățile administrativ-teritoriale din stînga Nistrului'});
  await p.wait("Array.from(document.querySelectorAll('.drawer .tree-list .node-name')).filter(x=>['Transnistria','UATSN'].includes(x.textContent.trim())).length===2",
    'Mobile Romanian tree differentiates Transnistria and UATSN');
  await p.snap('mobile-east-distinct-stat-admin-ro.png');
  await p.eval("Array.from(document.querySelectorAll('.language button')).find(x=>x.textContent==='EN').click()");
  await p.wait("Array.from(document.querySelectorAll('.drawer .tree-list .node-name')).filter(x=>['Transnistria','ATULBD'].includes(x.textContent.trim())).length===2",
    'Mobile English distinguishes statistical Transnistria from ATULBD');
  await p.snap('mobile-east-distinct-stat-admin-en.png');
  await p.close();
}
async function narrowMobile(cdp){
  const p=await cdp.page(360,780,true);
  await p.wait("document.querySelector('.map-area')?.dataset.mapReady==='true'",
    '360px source geometry loaded');
  await pause(700);
  const metrics=await p.eval("(()=>{const z=document.querySelector('.zoom-controls').getBoundingClientRect();const rail=document.querySelector('.module-rail').getBoundingClientRect();const map=document.querySelector('.map-area').getBoundingClientRect();return {width:innerWidth,scroll:document.documentElement.scrollWidth,zoomTop:z.top,zoomBottom:z.bottom,zoomRight:z.right,railTop:rail.top,mapTop:map.top,mapWidth:map.width,zoomButtons:document.querySelectorAll('.zoom-controls button').length}})()");
  assert(metrics.scroll<=metrics.width+1,'360px viewport has no horizontal scrolling');
  assert(metrics.mapWidth>=350&&metrics.zoomButtons===3,'360px map is full width with only three controls');
  assert(metrics.zoomTop>=metrics.mapTop&&metrics.zoomBottom<metrics.railTop,
    'Zoom/Home toolbar does not overlap the header or module bar');
  assert(metrics.zoomRight<=metrics.width,'Zoom toolbar stays inside viewport');
  await assertMobileScalePlacement(p,'360px');
  await p.snap('mobile-360-initial.png');
  await p.eval("document.querySelector('.atlas-tools-toggle').click()");
  await p.wait("!!document.querySelector('.atlas-global-tools-panel')",'360px global tools opened');
  await p.eval("document.querySelector('.atlas-tools-entry[aria-controls=atlas-section-settings]').click()");
  const settings360=await p.eval("(()=>{const panel=document.querySelector('.atlas-global-tools-panel'),rect=panel.getBoundingClientRect(),rail=document.querySelector('.module-rail').getBoundingClientRect(),entry=panel.querySelector('.atlas-tools-entry').getBoundingClientRect();return {width:rect.width,top:rect.top,bottom:rect.bottom,railTop:rail.top,entryHeight:entry.height,scroll:document.documentElement.scrollWidth}})()");
  assert(settings360.width<=360&&settings360.bottom<=settings360.railTop+1&&
    settings360.scroll<=361&&settings360.entryHeight>=44,
    '360px global tools fit between header and module rail with accessible targets');
  await p.snap('mobile-360-map-settings.png');
  const toolsTab=await p.eval("(()=>{const dialog=document.querySelector('.atlas-global-tools-panel');const a=[...dialog.querySelectorAll('button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex=\"-1\"])')].filter(e=>e.getClientRects().length>0);a.at(-1).focus();const e=new KeyboardEvent('keydown',{key:'Tab',bubbles:true,cancelable:true});document.dispatchEvent(e);return {trapped:e.defaultPrevented,wrapped:document.activeElement===a[0],count:a.length};})()");
  assert(toolsTab.count>=5&&toolsTab.trapped&&toolsTab.wrapped,'Global mobile tools must trap Tab focus');
  await p.eval("document.querySelector('.atlas-tools-close').click()");
  await p.wait("!document.querySelector('.atlas-global-tools-panel')",'360px global tools closed');

  await p.eval("document.querySelector('.module-rail button:first-child').click()");
  await p.wait("!!document.querySelector('.drawer-screen .drawer')",'360px module drawer');
  assert.equal(await p.eval("document.activeElement===document.querySelector('.drawer .drawer-close')"),true,
    'Modal drawer focuses Close on open');
  assert.equal(await p.eval("document.querySelector('.drawer').getAttribute('aria-modal')"),'true');
  const trap=await p.eval("(()=>{const root=document.querySelector('.drawer');const a=[...root.querySelectorAll('button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),summary,[tabindex]:not([tabindex=\"-1\"])')].filter(e=>{const closed=e.closest('details:not([open])');return e.getClientRects().length>0&&!e.closest('[inert]')&&(!closed||(e.tagName==='SUMMARY'&&e.parentElement===closed&&!closed.parentElement?.closest('details:not([open])')))});a.at(-1).focus();const before=document.activeElement;const e=new KeyboardEvent('keydown',{key:'Tab',bubbles:true,cancelable:true});document.dispatchEvent(e);return {trapped:e.defaultPrevented,wrapped:document.activeElement===a[0],count:a.length,wasLast:before===a.at(-1),before:before?.outerHTML?.slice(0,130),first:a[0]?.outerHTML?.slice(0,130),last:a.at(-1)?.outerHTML?.slice(0,130),after:document.activeElement?.outerHTML?.slice(0,130)}})()");
  assert(trap.count>=3&&trap.trapped&&trap.wrapped,
    'Tab focus trap must wrap correctly: '+JSON.stringify(trap));
  await p.snap('mobile-360-drawer-open.png');
  await p.eval("document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true}))");
  await p.wait("!document.querySelector('.drawer-screen')",'Escape closes narrow drawer');
  await p.wait("document.activeElement===document.querySelector('.module-rail button:first-child')",
    'Escape returns keyboard focus to module icon');

  await p.eval("document.querySelector('.module-rail button:first-child').click()");
  await p.wait("!!document.querySelector('.drawer .tree-line .tree-label')",'360px tree');
  await p.eval("document.querySelector('.drawer .tree-line .tree-label').click()");
  await p.wait("!!document.querySelector('.drawer-detail .entity-card')",'360px selected details');
  const detailMetrics=await p.eval("({header:document.querySelector('.header-entity-action')?.getBoundingClientRect().width,scroll:document.documentElement.scrollWidth,dialog:document.querySelector('.drawer-detail').getBoundingClientRect().width})");
  assert(detailMetrics.header>=44&&detailMetrics.scroll<=361&&detailMetrics.dialog<=360,
    '360px detail opener has safe touch target and drawer does not overflow');
  await p.eval("document.querySelector('.drawer-detail .atlas-detail-export>summary').click()");
  assert.equal(await p.eval("document.querySelectorAll('.drawer-detail .atlas-detail-export button').length"),3,
    'Full-geometry export, CSV and permalink retained inside mobile details');
  await p.snap('mobile-360-detail-open.png');
  await p.eval("document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true}))");
  await p.wait("!document.querySelector('.drawer-screen')",'Escape closes mobile details');
  await p.wait("document.activeElement===document.querySelector('.header-entity-action')",
    'Mobile detail Escape returns focus to header entity icon');
  await p.close();
}
try{
  await mkdir(screenshots,{recursive:true});
  profile=await mkdtemp(join(tmpdir(),'atlas-smoke-'));
  preview=spawn('npm',['run','preview','--','--host','127.0.0.1','--port','4174','--strictPort'],{cwd:root,stdio:'inherit'});
  await until(async()=>(await fetch(site)).ok,'Vite preview');
  chrome=spawn(findChrome(),[
    '--headless=new','--no-sandbox','--disable-dev-shm-usage',
    '--enable-unsafe-swiftshader','--disable-gpu-sandbox',
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
  await desktop(client);
  await tablet(client);
  await mobile(client);
  await narrowMobile(client);
  assert.deepEqual(runtimeErrors,[],'Uncaught browser exceptions');
  console.log('Browser smoke: WEB-R3.3 acceptance 1440/900/390/360, map controls, Escape/focus, modal Tab, exports, filters, geometry reset and permalink OK.');
}catch(err){
  console.error('Browser smoke failure:',err);
  process.exitCode=1;
}finally{
  try{client?.close();}catch{}
  chrome?.kill('SIGKILL');
  preview?.kill('SIGKILL');
  if(profile)await rm(profile,{recursive:true,force:true}).catch(()=>{});
}
