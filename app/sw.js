/* Mi Congregación: static shell only. No account, API, session or private feed caching. */
const CACHE="mi-congregacion-shell-v11-20261112";
const SHELL=[
 "/","/index.html","/manifest.webmanifest","/brand-isotype.svg",
 "/brand-logo-dark.svg","/brand-logo-light.svg","/lucide-icons.svg",
 "/account-ui.mjs","/account-privacy-gate.mjs","/holoteles-account-adapter.mjs","/holoteles-auth-config.mjs",
 "/dev-ui.mjs","/dev-fixtures.mjs","/dev-invitations.mjs","/dev-membership-status-ui.mjs","/pwa-shell.mjs"
];
const STATIC=new Set(SHELL);
const AUTH_ASSETS=new Set(["/account-ui.mjs","/holoteles-auth-config.mjs","/holoteles-account-adapter.mjs","/account-privacy-gate.mjs"]);
const publicResponse=response=>response.ok&&response.type==="basic"&&!response.redirected&&
 !/(?:no-store|private)/i.test(response.headers.get("cache-control")||"");
self.addEventListener("install",event=>{
 event.waitUntil((async()=>{
  // Access login pages or private/no-store responses are never shell assets.
  // Validate the entire set before writing so a failed install leaves old data intact.
  const assets=await Promise.all(SHELL.map(async path=>{
   const response=await fetch(path,{cache:"no-store",redirect:"error"});
   if(!publicResponse(response))throw Error("public shell only");
   return [path,response];
  }));
  const cache=await caches.open(CACHE);
  await Promise.all(assets.map(([path,response])=>cache.put(path,response)));
 })());
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
 if(url.search||request.headers?.has("authorization"))return;
 // Do not intercept or store API/auth/private URLs, query-string routes, or cross-origin requests.
 if(request.mode==="navigate"){
  if(url.pathname!=="/"&&url.pathname!=="/index.html")return;
  event.respondWith((async()=>{
   try{
    const response=await fetch(request,{cache:"no-store"});
    if(publicResponse(response)){const cache=await caches.open(CACHE);await cache.put("/index.html",response.clone())}
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
  if(AUTH_ASSETS.has(url.pathname)){
   try{
    const fresh=await fetch(request,{cache:"no-store"});
    if(publicResponse(fresh))await cache.put(url.pathname,fresh.clone());
    return fresh;
   }catch{return (await cache.match(url.pathname))||Response.error()}
  }
  const cached=await cache.match(url.pathname);
  if(cached)return cached;
  const response=await fetch(request);
  if(publicResponse(response))await cache.put(url.pathname,response.clone());
  return response;
 })());
});
