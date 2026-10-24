// First-party PWA lifecycle. No sync claims or authenticated data caching.
const english=()=>document.documentElement.lang==="en";
const say=(es,en)=>english()?en:es;
let registration=null,updateRequested=false,restoredTimer=null;
const bar=document.createElement("div");
bar.id="connectionBanner";
bar.className="connection-banner";
bar.setAttribute("role","status");
bar.setAttribute("aria-live","polite");
bar.hidden=true;
const label=document.createElement("span");
bar.append(label);
document.body.append(bar);
const updateBar=document.createElement("div");
updateBar.id="versionBanner";
updateBar.className="version-banner";
updateBar.setAttribute("role","status");
updateBar.setAttribute("aria-live","polite");
updateBar.hidden=true;
const versionText=document.createElement("span");
const updateButton=document.createElement("button");
updateButton.type="button";
updateButton.className="secondary";
updateButton.addEventListener("click",()=>{
 if(!registration?.waiting)return;
 updateRequested=true;
 updateButton.disabled=true;
 registration.waiting.postMessage({type:"ACTIVATE_UPDATE"});
});
updateBar.append(versionText,updateButton);
document.body.append(updateBar);
function paintNetwork(restored=false){
 clearTimeout(restoredTimer);
 if(!navigator.onLine){
  label.textContent=say("Sin conexión · La información nueva no está disponible","Offline · New information is unavailable");
  bar.hidden=false;
 }else if(restored){
  label.textContent=say("Conexión restablecida · Aún no se han sincronizado datos","Connection restored · No data has been synced yet");
  bar.hidden=false;
  restoredTimer=setTimeout(()=>{if(navigator.onLine)bar.hidden=true},4500);
 }else bar.hidden=true;
}
function paintVersion(){
 const ready=!!registration?.waiting;
 updateBar.hidden=!ready;
 if(ready){
  versionText.textContent=say("Hay una nueva versión disponible","A new version is available");
  updateButton.textContent=say("Actualizar ahora","Update now");
 }
}
window.addEventListener("offline",()=>paintNetwork());
window.addEventListener("online",()=>paintNetwork(true));
window.addEventListener("mi-congregacion:locale-change",()=>{paintNetwork();paintVersion()});
paintNetwork();
if("serviceWorker" in navigator && location.protocol==="https:"){
 navigator.serviceWorker.addEventListener("controllerchange",()=>{
  if(updateRequested)location.reload();
 });
 window.addEventListener("load",async()=>{
  try{
   registration=await navigator.serviceWorker.register("/sw.js",{scope:"/",updateViaCache:"none"});
   paintVersion();
   registration.addEventListener("updatefound",()=>{
    const worker=registration.installing;
    worker?.addEventListener("statechange",()=>{
     if(worker.state==="installed"&&navigator.serviceWorker.controller)paintVersion();
    });
   });
   document.addEventListener("visibilitychange",()=>{
    if(document.visibilityState==="visible"){
     registration.update().then(paintVersion).catch(()=>{});
    }
   });
  }catch{
   // No fake offline capability if registration is unsupported or fails.
  }
 });
}
