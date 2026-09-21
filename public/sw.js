const BASE=new URL('./',self.location.href).pathname;
const asset=path=>BASE+path.replace(/^\//,'');
const SHELL='hiu-yhct-atlas-shell-v0.3.4';
const DATA='hiu-yhct-atlas-data-v0.3.4';
const CORE=[BASE,asset('manifest.webmanifest'),asset('favicon.svg'),asset('data/meridians.json'),asset('data/acupoints.json'),asset('data/registration-pilot.json'),asset('data/provenance.json')];

async function precacheShell(){
  const cache=await caches.open(SHELL);
  await cache.addAll(CORE);
  try{
    const response=await fetch(BASE,{cache:'no-store'});
    const html=await response.text();
    const assetUrls=[...html.matchAll(/(?:src|href)=["']([^"'#?]+)["']/g)]
      .map(match=>new URL(match[1],self.location.origin+BASE).pathname)
      .filter(url=>url.startsWith(BASE));
    if(assetUrls.length)await cache.addAll([...new Set(assetUrls)]);
  }catch(error){
    console.warn('PWA shell asset discovery failed',error);
  }
}
self.addEventListener('install',event=>event.waitUntil(precacheShell().then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(
  caches.keys()
    .then(keys=>Promise.all(keys.filter(key=>![SHELL,DATA].includes(key)).map(key=>caches.delete(key))))
    .then(()=>self.clients.claim())
));
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url);
  if(url.origin!==location.origin)return;
  const fresh=event.request.mode==='navigate'||url.pathname.startsWith(asset('data/'));
  const network=async()=>{
    const response=await fetch(event.request,{signal:AbortSignal.timeout(15000)});
    if(response.ok){const cache=await caches.open(url.pathname.startsWith(asset('models/'))?DATA:SHELL);await cache.put(event.request,response.clone());}
    return response;
  };
  event.respondWith((async()=>{
    const cached=await caches.match(event.request);
    try{
      if(fresh){const response=await network();return !response.ok&&cached?cached:response;}
      return cached||await network();
    }catch{
      if(cached)return cached;
      if(event.request.mode==='navigate'){const shell=await caches.match(BASE);if(shell)return shell;}
      return Response.error();
    }
  })());
});
