import {spawn,execFileSync} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';

const base=process.env.LIVE_PREVIEW_URL||'https://hiu-yhct-3d-atlas-preview.onrender.com/';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function waitFor(fn,{timeout=60000,interval=250,label='condition'}={}){
  const start=Date.now();let last;
  while(Date.now()-start<timeout){try{last=await fn();if(last)return last}catch(error){last=error}await sleep(interval)}
  throw new Error('Timeout waiting for '+label+(last instanceof Error?': '+last.message:''));
}
function chromeCommand(){
  return execFileSync('sh',['-lc','command -v google-chrome || command -v google-chrome-stable || command -v chromium || command -v chromium-browser'],{encoding:'utf8'}).trim();
}
await mkdir('artifacts/live-preview',{recursive:true});
const chromeBin=chromeCommand();
const port=9333;
const chrome=spawn(chromeBin,['--headless=new','--no-sandbox','--disable-dev-shm-usage','--ignore-gpu-blocklist','--enable-webgl','--use-gl=angle','--use-angle=swiftshader','--remote-debugging-port='+port,'--user-data-dir=/tmp/hiu-atlas-live-preview-chrome','--window-size=1440,900','about:blank'],{stdio:'ignore'});
try{
  const target=await waitFor(async()=>{const list=await fetch('http://127.0.0.1:'+port+'/json/list').then(r=>r.json());return list.find(x=>x.type==='page'&&x.webSocketDebuggerUrl)},{label:'Chrome DevTools target'});
  const ws=new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve,reject)=>{ws.addEventListener('open',resolve,{once:true});ws.addEventListener('error',reject,{once:true})});
  let nextId=1;const pending=new Map();const consoleErrors=[];const responses=[];
  ws.addEventListener('message',event=>{
    const msg=JSON.parse(event.data);
    if(msg.id&&pending.has(msg.id)){const {resolve,reject}=pending.get(msg.id);pending.delete(msg.id);if(msg.error)reject(new Error(msg.error.message));else resolve(msg.result);return}
    if(msg.method==='Runtime.consoleAPICalled'&&msg.params.type==='error')consoleErrors.push(msg.params.args.map(a=>a.value||a.description||'').join(' '));
    if(msg.method==='Network.responseReceived')responses.push({url:msg.params.response.url,status:msg.params.response.status,mimeType:msg.params.response.mimeType});
  });
  const send=(method,params={},timeout=60000)=>new Promise((resolve,reject)=>{
    const id=nextId++;const timer=setTimeout(()=>{pending.delete(id);reject(new Error('CDP timeout: '+method))},timeout);
    pending.set(id,{resolve:v=>{clearTimeout(timer);resolve(v)},reject:e=>{clearTimeout(timer);reject(e)}});ws.send(JSON.stringify({id,method,params}));
  });
  const evaluate=async expression=>{const result=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(result.exceptionDetails)throw new Error(result.exceptionDetails.text||'Runtime evaluation failed');return result.result?.value};
  const screenshot=async name=>{const shot=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});const bytes=Buffer.from(shot.data,'base64');await writeFile('artifacts/live-preview/'+name,bytes);return {name,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')}};

  await send('Page.enable');await send('Runtime.enable');await send('Network.enable');
  await send('Page.navigate',{url:base});
  await waitFor(()=>evaluate("document.readyState==='complete'&&document.body.innerText.includes('HIU YHCT Atlas')"),{timeout:90000,label:'live preview app'});
  await waitFor(()=>evaluate("document.querySelector('canvas')?.width>0&&document.querySelector('canvas')?.height>0"),{timeout:90000,label:'live WebGL canvas'});
  await waitFor(()=>evaluate("!document.querySelector('.loading')"),{timeout:180000,label:'live anatomy ready'});
  await evaluate("document.querySelector('[data-meridian3d-launch=true]')?.click()");
  await waitFor(()=>evaluate("!!document.querySelector('[data-meridian3d-panel=true]')"),{label:'live 3D meridian panel'});
  await waitFor(()=>evaluate("document.querySelector('canvas')?.dataset.meridianEffect==='flow'&&Number(document.querySelector('canvas')?.dataset.meridianPulseMarkers||0)>0&&Number(document.querySelector('canvas')?.dataset.meridianFlowParticles||0)>0"),{label:'live meridian flow and pulse primitives'});

  const before=await evaluate("(()=>{const c=document.querySelector('canvas');const r=c.getBoundingClientRect();return {id:c.dataset.meridianId,effect:c.dataset.meridianEffect,frame:Number(c.dataset.meridianEffectFrame||0),anchors:Number(c.dataset.meridianSchematicAnchors||0),paths:Number(c.dataset.meridianSchematicPaths||0),rect:{x:r.x,y:r.y,w:r.width,h:r.height}}})()");
  const effectA=await screenshot('effect-a.png');
  await waitFor(()=>evaluate("Number(document.querySelector('canvas')?.dataset.meridianEffectFrame||0)>"+(before.frame+3)),{timeout:30000,label:'live flow frame advance'});
  await sleep(220);
  const effectB=await screenshot('effect-b.png');
  const after=await evaluate("(()=>{const c=document.querySelector('canvas');return {id:c.dataset.meridianId,effect:c.dataset.meridianEffect,frame:Number(c.dataset.meridianEffectFrame||0),anchors:Number(c.dataset.meridianSchematicAnchors||0),paths:Number(c.dataset.meridianSchematicPaths||0)}})()");
  if(after.frame<=before.frame)throw new Error('Meridian flow frame did not advance');
  if(effectA.sha256===effectB.sha256)throw new Error('Rendered meridian effect screenshot did not change');

  await evaluate("(()=>{const s=document.querySelectorAll('.meridian3d-controls select')[0];s.value='ST';s.dispatchEvent(new Event('change',{bubbles:true}));return true})()");
  await waitFor(()=>evaluate("document.querySelector('canvas')?.dataset.meridianId==='ST'&&Number(document.querySelector('canvas')?.dataset.meridianSchematicAnchors)>0&&Number(document.querySelector('canvas')?.dataset.meridianSchematicPaths)>0"),{label:'live ST overlay'});
  const st=await evaluate("(()=>{const c=document.querySelector('canvas');return {id:c.dataset.meridianId,effect:c.dataset.meridianEffect,anchors:Number(c.dataset.meridianSchematicAnchors||0),paths:Number(c.dataset.meridianSchematicPaths||0),pulseMarkers:Number(c.dataset.meridianPulseMarkers||0),flowParticles:Number(c.dataset.meridianFlowParticles||0),legend:document.querySelector('.meridian3d-effect-note')?.innerText||''}})()");if(!st.legend.includes('Huyệt nhịp')||!st.legend.includes('Dòng kinh'))throw new Error('Meridian effect legend missing');

  await evaluate("(()=>{const i=document.querySelector('.meridian3d-search');Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(i,'ST36');i.dispatchEvent(new Event('input',{bubbles:true}));return true})()");
  await waitFor(()=>evaluate("!!document.querySelector('[data-meridian3d-point=\"ST-36\"]')"),{label:'live ST-36 search'});
  await evaluate("document.querySelector('[data-meridian3d-point=\"ST-36\"]').click()");
  await waitFor(()=>evaluate("document.querySelector('canvas')?.dataset.cameraMotion==='active'"),{label:'live ST-36 camera focus starts'});
  const focusA=await screenshot('focus-active.png');
  await waitFor(()=>evaluate("document.querySelector('canvas')?.dataset.cameraMotion==='idle'"),{timeout:30000,label:'live ST-36 camera focus completes'});
  const focusB=await screenshot('focus-idle.png');
  if(focusA.sha256===focusB.sha256)throw new Error('Camera focus rendered screenshot did not change');

  const report={base,chrome:chromeBin,flow:{before,after,screenshotChanged:true,effectA,effectB},st,focus:{started:true,completed:true,screenshotChanged:true,focusA,focusB},model200:responses.filter(r=>r.status===200&&r.url.includes('/models/')).length,consoleErrors};
  await writeFile('artifacts/live-preview/runtime-report.json',JSON.stringify(report,null,2)+'\n');
  console.log('LIVE_PREVIEW_RUNTIME_PASS '+JSON.stringify(report));
  ws.close();
}finally{chrome.kill('SIGTERM')}
