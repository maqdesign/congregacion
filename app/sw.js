/* Mi Congregación: static shell only. No account, API, session or private feed caching. */
const CACHE="mi-congregacion-shell-v6-20261026";
const SHELL=[
 "/","/index.html","/manifest.webmanifest","/brand-isotype.svg",
 "/brand-logo-dark.svg","/brand-logo-light.svg","/lucide-icons.svg",
 "/account-ui.mjs","/account-privacy-gate.mjs","/holoteles-account-adapter.mjs","/holoteles-auth-config.mjs",
 "/dev-ui.mjs","/dev-fixtures.mjs","/dev-invitations.mjs","/pwa-shell.mjs"
];
const STATIC=new Set(SHELL);
self.addEventListener("install",event=>{
 event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)));
 // No skipWaiting here: don't interrupt an open editor or form.
});
self.addEventListener("activate",event=>{
 event.waitUntil((async()=>{
  for(const key of await caches.keys())if(key.startsWith("mi-congregacion-shell-")&&key!==CACHE)await caches.delete(key);
  await self.clients.claim();
 })());
});
self.addEventListener("message",event=>{
 if(event.data?.type==="ACTIVATE_UPDATE")self.skipWaiting();
});
self.addEventListener("fetch",event=>{
 const request=event.request;
 if(request.method!=="GET"||new URL(request.url).origin!==self.location.origin)return;
 const url=new URL(request.url);
 // Do not intercept or store API/auth/private URLs, query-string routes, or cross-origin requests.
 if(request.mode==="navigate"){
  if(url.pathname!=="/"&&url.pathname!=="/index.html")return;
  event.respondWith((async()=>{
   try{
    const response=await fetch(request,{cache:"no-store"});
    if(response.ok){const cache=await caches.open(CACHE);await cache.put("/index.html",response.clone())}
    return response;
   }catch{
    const cache=await caches.open(CACHE);
    return (await cache.match("/index.html"))||Response.error();
   }
  })());
  return;
 }
 if(!STATIC.has(url.pathname)||url.search)return;
 event.respondWith((async()=>{
  const cache=await caches.open(CACHE);
  const cached=await cache.match(url.pathname);
  if(cached)return cached;
  const response=await fetch(request);
  if(response.ok&&response.type==="basic")await cache.put(url.pathname,response.clone());
  return response;
 })());
});
