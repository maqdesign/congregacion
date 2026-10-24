import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import vm from "node:vm";
const read=x=>readFileSync(new URL("../app/"+x,import.meta.url),"utf8");
const sw=read("sw.js"),ui=read("pwa-shell.mjs"),html=read("index.html");
test("PWA worker and UI scripts parse",()=>{
 assert.doesNotThrow(()=>new vm.Script(sw));
 assert.doesNotThrow(()=>new vm.Script(ui));
 assert.match(html,/src="\/pwa-shell\.mjs"/);
});
test("only public first-party shell assets are cacheable",()=>{
 assert.match(sw,/const STATIC=new Set\(SHELL\)/);
 for(const name of ["dev-ui.mjs","dev-fixtures.mjs","account-ui.mjs","brand-isotype.svg","lucide-icons.svg"]){
  assert.match(sw,new RegExp(name.replace(".","\\.")));
 }
 assert.match(sw,/request.method!=="GET"/);
 assert.match(sw,/new URL\(request.url\).origin!==self.location.origin/);
 assert.match(sw,/!STATIC.has\(url.pathname\)\|\|url.search/);
 assert.doesNotMatch(sw,/\/api\/|service_role|localStorage|access_token|refresh_token/);
});
test("updates are opt-in and do not reload while user is working",()=>{
 assert.doesNotMatch(sw,/install"[\s\S]{0,150}skipWaiting/);
 assert.match(sw,/event.data\?\.type==="ACTIVATE_UPDATE"/);
 assert.match(ui,/registration.waiting.postMessage\(\{type:"ACTIVATE_UPDATE"\}\)/);
 assert.match(ui,/if\(updateRequested\)location.reload\(\)/);
 assert.doesNotMatch(ui,/setInterval\(/);
});
test("offline/online notices are explicit and do not claim synchronization",()=>{
 assert.match(ui,/window.addEventListener\("offline"/);
 assert.match(ui,/window.addEventListener\("online"/);
 assert.match(ui,/Aún no se han sincronizado datos/);
 assert.match(ui,/No data has been synced yet/);
 assert.match(ui,/setAttribute\("aria-live","polite"\)/);
 assert.match(html,/\.connection-banner\[hidden\],\.version-banner\[hidden\]/);
});
test("offline navigation only falls back to public shell",()=>{
 assert.match(sw,/request.mode==="navigate"/);
 assert.match(sw,/url.pathname!=="\/"&&url.pathname!=="\/index.html"/);
 assert.match(sw,/cache.match\("\/index.html"\)/);
 assert.match(sw,/fetch\(request,\{cache:"no-store"\}\)/);
});
