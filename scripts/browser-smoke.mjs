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
  const methodTimeouts={'Page.captureScreenshot':45000,'Page.navigate':30000,'Page.reload':30000};
  const send=(method,params={},timeout=methodTimeouts[method]??15000)=>new Promise((resolve,reject)=>{
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
  await send('Page.navigate',{url:base});
  await waitFor(()=>evaluate("document.readyState==='complete'&&document.body.innerText.includes('HIU YHCT Atlas')"),{timeout:30000,label:'HIU Atlas UI'});
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

  await evaluate("document.querySelector('.yhct-launch').click()");
  await waitFor(()=>evaluate("!!document.querySelector('.yhct-panel')"),{label:'YHCT drawer'});
  await evaluate("(()=>{const i=document.querySelector('.yhct-search');const s=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set;s.call(i,'Phế');i.dispatchEvent(new Event('input',{bubbles:true}));return true})()");
  await waitFor(()=>evaluate("document.querySelector('.yhct-list')?.innerText.includes('LU')"),{label:'local meridian search'});
  const assistantResult=await evaluate("(()=>{const buttons=[...document.querySelectorAll('.yhct-tabs button')];buttons.find(b=>b.textContent.includes('Trợ lý'))?.click();return true})()");
  await sleep(100);
  await evaluate("(()=>{const t=document.querySelector('.yhct-assistant textarea');const s=Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,'value').set;s.call(t,'Kinh Phế có dữ liệu gì?');t.dispatchEvent(new Event('input',{bubbles:true}));document.querySelector('.yhct-assistant>button').click();return true})()");
  await waitFor(()=>evaluate("document.querySelector('.yhct-assistant p')?.innerText.includes('Kinh Phế')"),{label:'local study assistant'});
  await screenshot('desktop-study-panel.png');

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

  await waitFor(()=>evaluate("navigator.serviceWorker?Promise.race([navigator.serviceWorker.ready.then(()=>true),new Promise(resolve=>setTimeout(()=>resolve(false),1000))]):false"),{timeout:15000,label:'service worker ready'});
  await sleep(500);
  await send('Network.emulateNetworkConditions',{offline:true,latency:0,downloadThroughput:0,uploadThroughput:0});
  await send('Page.reload',{});
  const offlineOk=await waitFor(()=>evaluate("document.readyState==='complete'&&document.body.innerText.includes('HIU YHCT Atlas')"),{timeout:15000,label:'offline app-shell reload'});
  await screenshot('tablet-offline.png');
  await send('Network.emulateNetworkConditions',{offline:false,latency:0,downloadThroughput:-1,uploadThroughput:-1});

  const report={
    chrome:chromeBin,
    desktop:{viewport:[1440,900],rotateScreenshotChanged:rotateHash!==desktopBefore,zoomScreenshotChanged:zoomHash!==rotateHash},
    tablet:{viewport:[tabletViewport.w,tabletViewport.h],touchEnabled:true,touchScreenshotChanged:touchAfter!==touchBefore},
    modelResponses:responses.filter(r=>/\/models\//.test(r.url)&&r.status===200).length,
    localMeridianSearch:true,
    localStudyAssistant:true,
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
