import {spawn,execFileSync} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';

const base='http://127.0.0.1:4173/';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function waitFor(fn,{timeout=30000,interval=250,label='condition'}={}){
  const start=Date.now();let last;
  while(Date.now()-start<timeout){try{last=await fn();if(last)return last}catch(error){last=error}await sleep(interval)}
  throw new Error('Timeout waiting for '+label+(last instanceof Error?': '+last.message:''));
}
function command(){
  return execFileSync('sh',['-lc','command -v google-chrome || command -v google-chrome-stable || command -v chromium || command -v chromium-browser'],{encoding:'utf8'}).trim();
}
const vite=spawn('./node_modules/.bin/vite',['preview','--host','127.0.0.1','--port','4173'],{stdio:['ignore','pipe','pipe']});
let viteLog='';vite.stdout.on('data',d=>viteLog+=d);vite.stderr.on('data',d=>viteLog+=d);
let chrome;
try{
  await waitFor(async()=>{const r=await fetch(base);return r.ok},{label:'Vite preview'});
  const chromeBin=command();
  chrome=spawn(chromeBin,['--headless=new','--no-sandbox','--disable-dev-shm-usage','--ignore-gpu-blocklist','--enable-webgl','--use-gl=angle','--use-angle=swiftshader','--remote-debugging-port=9222','--user-data-dir=/tmp/hiu-atlas-chrome','--window-size=1440,900','about:blank'],{stdio:'ignore'});
  const target=await waitFor(async()=>{
    const list=await fetch('http://127.0.0.1:9222/json/list').then(r=>r.json());
    return list.find(x=>x.type==='page'&&x.webSocketDebuggerUrl);
  },{label:'Chrome DevTools target'});
  const ws=new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve,reject)=>{ws.addEventListener('open',resolve,{once:true});ws.addEventListener('error',reject,{once:true})});
  let nextId=1;const pending=new Map();const responses=[];const consoleErrors=[];
  ws.addEventListener('message',event=>{
    const msg=JSON.parse(event.data);
    if(msg.id&&pending.has(msg.id)){const {resolve,reject}=pending.get(msg.id);pending.delete(msg.id);if(msg.error)reject(new Error(msg.error.message));else resolve(msg.result);return}
    if(msg.method==='Network.responseReceived')responses.push({url:msg.params.response.url,status:msg.params.response.status,mimeType:msg.params.response.mimeType});
    if(msg.method==='Runtime.consoleAPICalled'&&msg.params.type==='error')consoleErrors.push(msg.params.args.map(a=>a.value||a.description||'').join(' '));
  });
  const methodTimeouts={
    'Page.captureScreenshot':60000,
    'Page.navigate':45000,
    'Page.reload':45000,
    'Runtime.evaluate':30000,
    'Input.dispatchMouseEvent':45000,
    'Input.dispatchTouchEvent':45000,
    'Emulation.setDeviceMetricsOverride':30000,
    'Emulation.setTouchEmulationEnabled':30000,
    'Network.emulateNetworkConditions':30000
  };
  const send=(method,params={},timeout=methodTimeouts[method]??30000)=>new Promise((resolve,reject)=>{
    const id=nextId++;
    const timer=setTimeout(()=>{pending.delete(id);reject(new Error('CDP timeout after '+timeout+'ms: '+method))},timeout);
    pending.set(id,{resolve:value=>{clearTimeout(timer);resolve(value)},reject:error=>{clearTimeout(timer);reject(error)}});
    ws.send(JSON.stringify({id,method,params}));
  });
  const evaluate=async(expression)=>{
    const result=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});
    if(result.exceptionDetails)throw new Error(result.exceptionDetails.text||'Runtime evaluation failed');
    return result.result?.value;
  };
  const screenshot=async name=>{
    let lastError;
    for(let attempt=1;attempt<=3;attempt++){
      try{
        const shot=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});
        const bytes=Buffer.from(shot.data,'base64');
        await writeFile('artifacts/'+name,bytes);
        return createHash('sha256').update(bytes).digest('hex');
      }catch(error){
        lastError=error;
        if(attempt<3)await sleep(750*attempt);
      }
    }
    throw new Error('Screenshot failed after 3 attempts: '+(lastError?.message||lastError));
  };
  await mkdir('artifacts',{recursive:true});
  await send('Page.enable');await send('Runtime.enable');await send('Network.enable');
  await send('Network.setBlockedURLs',{urls:['*data/schematic-spatial.json*']});
  await send('Page.navigate',{url:base});
  await waitFor(()=>evaluate("document.readyState==='complete'&&document.body.innerText.includes('HIU YHCT Atlas')"),{timeout:30000,label:'HIU Atlas UI'});
  await evaluate("document.querySelector('[data-meridian3d-launch=true]').click()");
  await waitFor(()=>evaluate("!!document.querySelector('[data-meridian3d-load-error=true]')"),{label:'meridian load failure is visible'});
  await send('Network.setBlockedURLs',{urls:[]});
  await evaluate("document.querySelector('[data-meridian3d-load-error=true] button').click()");
  await waitFor(()=>evaluate("!document.querySelector('[data-meridian3d-load-error=true]')&&document.querySelector('[data-meridian3d-launch=true]')?.innerText.includes('361 huyệt')"),{label:'meridian retry recovers data'});
  console.log('SMOKE_LOAD_FAILURE_RECOVERY_PASS');
  await evaluate("document.querySelector('[data-effect-master=true]').click()");
  await evaluate("document.querySelector('.meridian3d-head button').click()");
  await waitFor(()=>evaluate("document.querySelector('canvas')?.width>0&&document.querySelector('canvas')?.height>0"),{label:'3D canvas'});
  await waitFor(()=>responses.filter(r=>r.url.includes('/models/')&&!r.url.includes('/models/atlas.json')&&r.status===200).length>0,{timeout:30000,label:'3D binary model response'});
  await sleep(1200);

  const canvas=await evaluate("(()=>{const r=document.querySelector('canvas').getBoundingClientRect();return{x:r.x,y:r.y,w:r.width,h:r.height}})()");
  const x=canvas.x+canvas.w*0.5,y=canvas.y+canvas.h*0.45;
  const desktopBefore=await screenshot('desktop-before.png');
  await send('Input.dispatchMouseEvent',{type:'mousePressed',x,y,button:'left',buttons:1,clickCount:1});
  await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:x+110,y:y+35,button:'left',buttons:1});
  await send('Input.dispatchMouseEvent',{type:'mouseReleased',x:x+110,y:y+35,button:'left',buttons:0,clickCount:1});
  await sleep(500);
  const rotateHash=await screenshot('desktop-rotated.png');
  if(rotateHash===desktopBefore)throw new Error('Desktop rotate did not change rendered screenshot');
  await send('Input.dispatchMouseEvent',{type:'mouseWheel',x,y,deltaX:0,deltaY:-420});
  await sleep(500);
  const zoomHash=await screenshot('desktop-zoomed.png');
  if(zoomHash===rotateHash)throw new Error('Desktop wheel zoom did not change rendered screenshot');
  await send('Input.dispatchMouseEvent',{type:'mousePressed',x,y,button:'right',buttons:2,clickCount:1});
  await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:x+90,y:y+45,button:'right',buttons:2});
  await send('Input.dispatchMouseEvent',{type:'mouseReleased',x:x+90,y:y+45,button:'right',buttons:0,clickCount:1});
  await sleep(500);
  const panHash=await screenshot('desktop-panned.png');
  if(panHash===zoomHash)throw new Error('Desktop pan did not change rendered screenshot');

  const clickAria=async label=>evaluate("(()=>{const b=document.querySelector('[aria-label=\\\""+label+"\\\"]');if(!b)return false;b.click();return true})()");
  for(const [label,file] of [['front view','desktop-front.png'],['back view','desktop-back.png'],['side view','desktop-side.png']]){
    const motionSeqBefore=await evaluate("Number(document.querySelector('canvas')?.dataset.cameraMotionSeq||0)");
    if(!await clickAria(label))throw new Error('Missing camera control: '+label);
    await waitFor(()=>evaluate("document.querySelector('[aria-label=\\\""+label+"\\\"]')?.getAttribute('aria-pressed')==='true'"),{label:'camera '+label});
    await waitFor(()=>evaluate("Number(document.querySelector('canvas')?.dataset.cameraMotionSeq||0)>"+motionSeqBefore),{label:'camera '+label+' smooth motion sequence'});
    await waitFor(()=>evaluate("document.querySelector('canvas')?.dataset.cameraMotion==='idle'"),{timeout:30000,label:'camera '+label+' smooth motion completes'});
    await screenshot(file);
  }
  const sideHash=await screenshot('desktop-side-confirm.png');
  const resetMotionSeqBefore=await evaluate("Number(document.querySelector('canvas')?.dataset.cameraMotionSeq||0)");
  if(!await clickAria('Reset view and layers'))throw new Error('Missing reset camera control');
  await waitFor(()=>evaluate("document.querySelector('[aria-label=\\\"three-quarter view\\\"]')?.getAttribute('aria-pressed')==='true'"),{label:'camera reset'});
  await waitFor(()=>evaluate("Number(document.querySelector('canvas')?.dataset.cameraMotionSeq||0)>"+resetMotionSeqBefore),{label:'camera reset smooth motion sequence'});
  await waitFor(()=>evaluate("document.querySelector('canvas')?.dataset.cameraMotion==='idle'"),{timeout:30000,label:'camera reset smooth motion completes'});
  const resetHash=await screenshot('desktop-reset.png');
  if(resetHash===sideHash)throw new Error('Camera reset did not change rendered screenshot');

  const skeletonPreset=await evaluate("(()=>{const b=[...document.querySelectorAll('.layer-presets button')].find(x=>x.textContent.trim()==='Skeleton');if(!b)return false;b.click();return true})()");
  if(!skeletonPreset)throw new Error('Skeleton layer preset missing');
  await waitFor(()=>evaluate("(()=>{const b=[...document.querySelectorAll('.layer-presets button')].find(x=>x.textContent.trim()==='Skeleton');return b?.getAttribute('aria-pressed')==='true'})()"),{label:'skeleton layer preset'});
  await sleep(250);
  const skeletonHash=await screenshot('desktop-skeleton.png');
  if(skeletonHash===resetHash)throw new Error('Skeleton preset did not change rendered screenshot');
  const allPreset=await evaluate("(()=>{const b=[...document.querySelectorAll('.layer-presets button')].find(x=>x.textContent.trim()==='All');if(!b)return false;b.click();return true})()");
  if(!allPreset)throw new Error('All layer preset missing');
  await waitFor(()=>evaluate("(()=>{const b=[...document.querySelectorAll('.layer-presets button')].find(x=>x.textContent.trim()==='All');return b?.getAttribute('aria-pressed')==='true'})()"),{label:'all layer preset'});
  await sleep(250);
  const allHash=await screenshot('desktop-all-layers.png');
  if(allHash===skeletonHash)throw new Error('All layer preset did not change rendered screenshot');

  await evaluate("document.querySelector('.yhct-launch').click()");
  await waitFor(()=>evaluate("!!document.querySelector('.yhct-panel')"),{label:'YHCT drawer'});
  await evaluate("(()=>{const i=document.querySelector('.yhct-search');const s=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set;s.call(i,'Phế');i.dispatchEvent(new Event('input',{bubbles:true}));return true})()");
  await waitFor(()=>evaluate("document.querySelector('.yhct-list')?.innerText.includes('LU')"),{label:'local meridian search'});
  const catalogueCount=await evaluate("document.querySelector('.yhct-launch')?.innerText||''");
  if(!catalogueCount.includes('361 huyệt'))throw new Error('361-point catalogue count not visible: '+catalogueCount);
  await evaluate("(()=>{const buttons=[...document.querySelectorAll('.yhct-tabs button')];buttons.find(b=>b.textContent.includes('Huyệt'))?.click();return true})()");
  await sleep(100);
  await evaluate("(()=>{const i=document.querySelector('.yhct-search');const s=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set;s.call(i,'ST36');i.dispatchEvent(new Event('input',{bubbles:true}));return true})()");
  await waitFor(()=>evaluate("document.querySelector('.yhct-list')?.innerText.includes('ST-36')"),{label:'ST36 catalogue search'});
  await evaluate("(()=>{const buttons=[...document.querySelectorAll('.yhct-tabs button')];buttons.find(b=>b.textContent.includes('Trợ lý'))?.click();return true})()");
  await sleep(100);
  await evaluate("(()=>{const t=document.querySelector('.yhct-assistant textarea');const s=Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,'value').set;s.call(t,'ST36 thuộc kinh nào?');t.dispatchEvent(new Event('input',{bubbles:true}));document.querySelector('.yhct-assistant>button').click();return true})()");
  await waitFor(()=>evaluate("document.querySelector('.yhct-assistant p')?.innerText.includes('Kinh Vị')"),{label:'local study assistant ST36'});
  await screenshot('desktop-study-panel.png');
  await evaluate("document.querySelector('.yhct-head>button')?.click()");
  await evaluate("document.querySelector('[data-meridian3d-launch=true]')?.click()");
  await waitFor(()=>evaluate("!!document.querySelector('[data-meridian3d-panel=true]')"),{label:'3D meridian panel'});
  await waitFor(()=>evaluate("document.querySelector('[data-meridian3d-panel=true]')?.innerText.includes('Kinh Vị')&&document.querySelector('[data-meridian3d-panel=true]')?.innerText.includes('Chưa có path 3D đã kiểm duyệt')"),{label:'3D meridian clean-room gate'});
  await waitFor(()=>evaluate("document.querySelector('canvas')?.dataset.meridianEffect==='flow'&&Number(document.querySelector('canvas')?.dataset.meridianPulseMarkers||0)>0&&Number(document.querySelector('canvas')?.dataset.meridianFlowParticles||0)>0"),{label:'animated meridian flow and pulse effect'});
  const effectFrameBefore=await evaluate("Number(document.querySelector('canvas')?.dataset.meridianEffectFrame||0)");
  await waitFor(()=>evaluate("Number(document.querySelector('canvas')?.dataset.meridianEffectFrame||0)>"+effectFrameBefore),{timeout:30000,label:'meridian animation frame advances'});
  const effectFrameAfter=await evaluate("Number(document.querySelector('canvas')?.dataset.meridianEffectFrame||0)");
  console.log('SMOKE_MERIDIAN_FLOW_EFFECT_PASS '+JSON.stringify({effectFrameBefore,effectFrameAfter,pulseMarkers:await evaluate("Number(document.querySelector('canvas')?.dataset.meridianPulseMarkers||0)"),flowParticles:await evaluate("Number(document.querySelector('canvas')?.dataset.meridianFlowParticles||0)")}));
  const schematicCoverage=[];
  const meridianCodes=await evaluate("[...document.querySelectorAll('.meridian3d-controls select')[0].options].map(o=>o.value)");
  if(meridianCodes.length!==14)throw new Error('Expected 14 meridians');
  for(const code of meridianCodes){
    await evaluate("(()=>{const s=document.querySelectorAll('.meridian3d-controls select')[0];s.value="+JSON.stringify(code)+";s.dispatchEvent(new Event('change',{bubbles:true}));})()");
    await waitFor(()=>evaluate("document.querySelector('canvas')?.dataset.meridianId==="+JSON.stringify(code)+"&&Number(document.querySelector('canvas')?.dataset.meridianSchematicAnchors)>0&&Number(document.querySelector('canvas')?.dataset.meridianSchematicPaths)>0"),{label:code+' schematic markers and paths'});
    schematicCoverage.push({code,...await evaluate("({...document.querySelector('canvas').dataset})")});
  }
  console.log('SMOKE_ALL_14_SCHEMATIC_MERIDIANS_PASS '+JSON.stringify(schematicCoverage));
  await evaluate("(()=>{const s=document.querySelectorAll('.meridian3d-controls select')[0];s.value='ST';s.dispatchEvent(new Event('change',{bubbles:true}));})()");
  await waitFor(()=>evaluate("document.querySelector('.meridian3d-summary').innerText.includes('Kinh Vị')"),{label:'restore stomach meridian'});
  const bilateralCount=await waitFor(()=>evaluate("Number(document.querySelector('canvas')?.dataset.meridianSchematicAnchors)===90?90:0"),{label:'90 bilateral stomach markers'});
  await evaluate("(()=>{const s=document.querySelectorAll('.meridian3d-controls select')[1];s.value='LEFT';s.dispatchEvent(new Event('change',{bubbles:true}));})()");
  await waitFor(()=>evaluate("Number(document.querySelector('canvas')?.dataset.meridianSchematicAnchors)===45"),{label:'left filter halves bilateral stomach markers'});
  await evaluate("(()=>{const s=document.querySelectorAll('.meridian3d-controls select')[1];s.value='BOTH';s.dispatchEvent(new Event('change',{bubbles:true}));})()");
  await waitFor(()=>evaluate("Number(document.querySelector('canvas')?.dataset.meridianSchematicAnchors)===90"),{label:'restore bilateral markers'});
  for(const [input,code] of [['LI4','LI-4'],['ST36','ST-36']]){
    await evaluate("(()=>{const i=document.querySelector('.meridian3d-search');Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(i,"+JSON.stringify(input)+");i.dispatchEvent(new Event('input',{bubbles:true}));})()");
    await waitFor(()=>evaluate("!!document.querySelector('[data-meridian3d-point=\""+code+"\"]')"),{label:input+' cross-meridian search'});
    await evaluate("document.querySelector('[data-meridian3d-point=\""+code+"\"]').click()");
    await waitFor(()=>evaluate("document.querySelectorAll('.meridian3d-controls select')[0].value==="+JSON.stringify(code.split('-')[0])),{label:code+' selects its meridian'});
    await waitFor(()=>evaluate("document.querySelector('canvas')?.dataset.cameraMotion==='active'"),{label:code+' fly-to starts'});
    await waitFor(()=>evaluate("document.querySelector('canvas')?.dataset.cameraMotion==='idle'"),{timeout:30000,label:code+' fly-to completes'});
  }
  await evaluate("(()=>{const i=document.querySelector('.meridian3d-search');const s=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set;s.call(i,'ST-36');i.dispatchEvent(new Event('input',{bubbles:true}));return true})()");
  await waitFor(()=>evaluate("!!document.querySelector('[data-meridian3d-point=\\\"ST-36\\\"]')"),{label:'3D meridian ST36 search'});
  await evaluate("document.querySelector('[data-meridian3d-point=\\\"ST-36\\\"]')?.click()");
  await waitFor(()=>evaluate("document.querySelector('[data-meridian3d-detail=true]')?.innerText.includes('Chưa có tọa độ BodyParts3D')"),{label:'3D unregistered point gate'});
  await screenshot('desktop-meridian3d-panel.png');
  await evaluate("document.querySelector('[data-meridian3d-panel=true] [aria-label=\\\"Đóng mô hình kinh lạc 3D\\\"]')?.click()");

  await send('Emulation.setDeviceMetricsOverride',{width:1024,height:768,deviceScaleFactor:1,mobile:false,screenWidth:1024,screenHeight:768});
  await send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:5});
  await sleep(300);
  const tabletViewport=await evaluate("({w:innerWidth,h:innerHeight,canvas:!!document.querySelector('canvas'),panel:!!document.querySelector('.yhct-panel')})");
  if(tabletViewport.w!==1024||tabletViewport.h!==768||!tabletViewport.canvas)throw new Error('Tablet viewport assertion failed: '+JSON.stringify(tabletViewport));
  await evaluate("document.querySelector('.yhct-head>button')?.click()");
  await sleep(200);
  const tc=await evaluate("(()=>{const r=document.querySelector('canvas').getBoundingClientRect();return{x:r.x+r.width*.5,y:r.y+r.height*.45}})()");
  const touchBefore=await screenshot('tablet-before-touch.png');
  await send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:tc.x,y:tc.y,id:1,radiusX:1,radiusY:1,force:1}]});
  await send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:tc.x+90,y:tc.y+25,id:1,radiusX:1,radiusY:1,force:1}]});
  await send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  await sleep(500);
  const touchAfter=await screenshot('tablet-after-touch.png');
  if(touchAfter===touchBefore)throw new Error('Tablet touch orbit did not change rendered screenshot');
  const pinchBefore=touchAfter;
  await send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:tc.x-45,y:tc.y,id:11,radiusX:1,radiusY:1,force:1},{x:tc.x+45,y:tc.y,id:12,radiusX:1,radiusY:1,force:1}]});
  await send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:tc.x-95,y:tc.y,id:11,radiusX:1,radiusY:1,force:1},{x:tc.x+95,y:tc.y,id:12,radiusX:1,radiusY:1,force:1}]});
  await send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  await sleep(500);
  const pinchAfter=await screenshot('tablet-after-pinch.png');
  if(pinchAfter===pinchBefore)throw new Error('Tablet pinch zoom did not change rendered screenshot');

  await send('Page.navigate',{url:base+'?register=1'});
  await waitFor(()=>evaluate("document.readyState==='complete'&&!!document.querySelector('[data-registration-panel=true]')"),{timeout:30000,label:'registration workspace'});
  await waitFor(()=>evaluate("document.querySelector('canvas')?.width>0&&document.querySelector('canvas')?.height>0"),{label:'registration 3D canvas'});
  await waitFor(()=>evaluate("!document.querySelector('.loading')"),{timeout:180000,label:'registration anatomy ready'});
  await waitFor(()=>evaluate("document.querySelector('[data-registration-references=true]')?.innerText.includes('Bộ Y tế')&&document.querySelector('[data-registration-references=true]')?.innerText.includes('Huyệt Vị Kinh Lạc')"),{timeout:30000,label:'registration reference evidence'});
  await waitFor(()=>evaluate("document.querySelector('[data-registration-progress=true]')?.innerText.includes('0/10')"),{timeout:30000,label:'registration pilot progress initial'});
  await sleep(500);
  const rc=await evaluate("(()=>{const r=document.querySelector('canvas').getBoundingClientRect();return{x:r.x,y:r.y,w:r.width,h:r.height}})()");
  let registrationEvidence=null;
  for(const xFraction of [.50,.54,.58]){
    for(const yFraction of [.38,.46,.54,.62,.70]){
      const px=rc.x+rc.w*xFraction,py=rc.y+rc.h*yFraction;
      await send('Input.dispatchMouseEvent',{type:'mousePressed',x:px,y:py,button:'left',buttons:1,clickCount:1});
      await send('Input.dispatchMouseEvent',{type:'mouseReleased',x:px,y:py,button:'left',buttons:0,clickCount:1});
      await sleep(120);
      registrationEvidence=await evaluate("(()=>{try{const rows=JSON.parse(localStorage.getItem('hiu-yhct-registration-drafts-v0.1')||'[]');const d=rows.find(x=>x.pointCode==='ST-36'&&x.side==='LEFT');return d?{pointCode:d.pointCode,side:d.side,status:d.verificationStatus,triangleIndex:d.triangleIndex,barycentric:d.barycentric,structure:d.surfaceStructureId}:null}catch{return null}})()");
      if(registrationEvidence)break;
    }
    if(registrationEvidence)break;
  }
  if(!registrationEvidence)throw new Error('Registration workspace did not capture a BodyParts3D surface anchor');
  if(registrationEvidence.status!=='UNVERIFIED'||!Number.isInteger(registrationEvidence.triangleIndex)||!Array.isArray(registrationEvidence.barycentric)||registrationEvidence.barycentric.length!==3)throw new Error('Registration evidence gate failed: '+JSON.stringify(registrationEvidence));
  const barySum=registrationEvidence.barycentric.reduce((a,b)=>a+b,0);
  if(Math.abs(barySum-1)>1e-4)throw new Error('Registration barycentric sum invalid: '+barySum);
  await waitFor(()=>evaluate("document.querySelector('[data-registration-progress=true]')?.innerText.includes('1/10')"),{label:'registration pilot progress after capture'});
  await evaluate("document.querySelector('[data-meridian3d-launch=true]')?.click()");
  await waitFor(()=>evaluate("!!document.querySelector('[data-meridian3d-panel=true]')"),{label:'registration 3D meridian panel'});
  await waitFor(()=>evaluate("document.querySelector('.meridian3d-summary')?.innerText.includes('1 anchor nháp local')"),{label:'3D meridian local draft count'});
  await waitFor(()=>evaluate("document.querySelector('canvas')?.dataset.meridianAnchors==='1'"),{label:'3D local anchor rendered'});
  await waitFor(()=>evaluate("document.querySelector('canvas')?.dataset.meridianPaths==='0'"),{label:'no fabricated 3D meridian path'});
  await evaluate("(()=>{const i=document.querySelector('.meridian3d-search');const s=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set;s.call(i,'ST-36');i.dispatchEvent(new Event('input',{bubbles:true}));return true})()");
  await waitFor(()=>evaluate("!!document.querySelector('[data-meridian3d-point=\\\"ST-36\\\"]')"),{label:'registration 3D ST36 result'});
  await evaluate("document.querySelector('[data-meridian3d-point=\\\"ST-36\\\"]')?.click()");
  await waitFor(()=>evaluate("document.querySelector('[data-meridian3d-detail=true]')?.innerText.includes('UNVERIFIED')"),{label:'local draft remains unverified in 3D viewer'});
  await screenshot('tablet-meridian3d-local-anchor.png');
  await evaluate("document.querySelector('[data-meridian3d-panel=true] [aria-label=\\\"Đóng mô hình kinh lạc 3D\\\"]')?.click()");
  await waitFor(()=>evaluate("document.querySelector('[data-registration-next-missing=true]')?.innerText.includes('ST-36 · RIGHT')"),{label:'next missing pilot anchor'});
  const nextMissingClicked=await evaluate("(()=>{const b=document.querySelector('[data-registration-next-missing=true]');if(!b)return false;b.click();return true})()");
  if(!nextMissingClicked)throw new Error('Next-missing pilot control unavailable');
  await waitFor(()=>evaluate("(()=>{const selects=document.querySelectorAll('.registration-grid select');return selects[0]?.value==='ST-36'&&selects[1]?.value==='RIGHT'})()"),{label:'next missing pilot target selected'});
  await screenshot('tablet-registration-workspace.png');

  await waitFor(()=>evaluate("navigator.serviceWorker?Promise.race([navigator.serviceWorker.ready.then(()=>true),new Promise(resolve=>setTimeout(()=>resolve(false),1000))]):false"),{timeout:15000,label:'service worker ready'});
  await sleep(500);
  await send('Network.emulateNetworkConditions',{offline:true,latency:0,downloadThroughput:0,uploadThroughput:0});
  await send('Page.reload',{});
  const offlineOk=await waitFor(()=>evaluate("document.readyState==='complete'&&document.body.innerText.includes('HIU YHCT Atlas')"),{timeout:15000,label:'offline app-shell reload'});
  await screenshot('tablet-offline.png');
  await send('Network.emulateNetworkConditions',{offline:false,latency:0,downloadThroughput:-1,uploadThroughput:-1});

  const report={
    chrome:chromeBin,
    desktop:{viewport:[1440,900],rotateScreenshotChanged:rotateHash!==desktopBefore,zoomScreenshotChanged:zoomHash!==rotateHash,panScreenshotChanged:panHash!==zoomHash,cameraPresets:true,cameraReset:true,layerPresets:true},
    tablet:{viewport:[tabletViewport.w,tabletViewport.h],touchEnabled:true,touchScreenshotChanged:touchAfter!==touchBefore,pinchScreenshotChanged:pinchAfter!==pinchBefore},
    modelResponses:responses.filter(r=>/\/models\//.test(r.url)&&r.status===200).length,
    localMeridianSearch:true,
    localStudyAssistant:true,
    meridian3dExplorer:true,
    meridian3dLoadRetry:true,
    meridian3dSchematicCoverage:schematicCoverage,
    meridian3dSideFilter:{both:bilateralCount,left:45},
    meridian3dCompactCodeSearch:true,
    smoothCameraPresets:true,
    acupointFlyToMotion:true,
    meridian3dDraftOverlay:true,
    meridian3dNoFabricatedPath:true,
    registrationReferences:true,
    registrationPilotProgress:true,
    registrationNextMissing:true,
    registrationCapture:{pointCode:registrationEvidence.pointCode,side:registrationEvidence.side,status:registrationEvidence.status,triangleIndex:registrationEvidence.triangleIndex,barycentricValid:true},
    pwaOfflineReload:Boolean(offlineOk),
    consoleErrors
  };
  await writeFile('artifacts/browser-smoke.json',JSON.stringify(report,null,2)+'\n');
  console.log('BROWSER_SMOKE_PASS '+JSON.stringify(report));
  ws.close();
} finally {
  chrome?.kill('SIGTERM');
  vite.kill('SIGTERM');
}
