const SHELL='hiu-yhct-atlas-shell-v0.3.0';
const DATA='hiu-yhct-atlas-data-v0.3.0';
const CORE=['/','/manifest.webmanifest','/favicon.svg','/data/meridians.json','/data/acupoints.json','/data/provenance.json'];

async function precacheShell(){
  const cache=await caches.open(SHELL);
  await cache.addAll(CORE);
  try{
    const response=await fetch('/',{cache:'no-store'});
    const html=await response.text();
    const assetUrls=[...html.matchAll(/(?:src|href)=["']([^"'#?]+)["']/g)]
      .map(match=>match[1])
      .filter(url=>url.startsWith('/')&&!url.startsWith('//'));
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
  event.respondWith(
    caches.match(event.request).then(hit=>hit||fetch(event.request).then(response=>{
      if(!response||!response.ok)return response;
      const copy=response.clone();
      caches.open(url.pathname.startsWith('/models/')?DATA:SHELL).then(cache=>cache.put(event.request,copy));
      return response;
    }).catch(()=>caches.match('/')))
  );
});
