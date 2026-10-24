import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import vm from "node:vm";
const read=x=>readFileSync(new URL("../app/"+x,import.meta.url),"utf8");
const html=read("index.html"),sprite=read("lucide-icons.svg");
const js=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
test("inline JS remains valid and no old header language button survives",()=>{
 assert.doesNotThrow(()=>new vm.Script(js));
 assert.doesNotMatch(html,/id="language"/);
 assert.match(html,/id="accountMenu"/);
 assert.match(html,/id="settingsDialog"/);
 assert.match(html,/id="aboutDialog"/);
 assert.doesNotMatch(html,/<div class="card" id="aboutApp">/);
});
test("domain-based initial language and manual override in preferences",()=>{
 assert.match(js,/location\.hostname==="congregation\.holoteles\.app"\?"en":"es"/);
 assert.match(js,/localStorage\.getItem\(localeKey\)/);
 assert.match(js,/localStorage\.setItem\(localeKey,lang\)/);
 assert.match(html,/name="appLanguage" value="es"/);
 assert.match(html,/name="appLanguage" value="en"/);
});
test("all referenced Lucide symbols exist, especially formerly invisible search/plus/bell",()=>{
 const ids=new Set([...sprite.matchAll(/<symbol id="([^"]+)"/g)].map(x=>x[1]));
 for(const [,id] of html.matchAll(/<use href="\/lucide-icons\.svg#([^"]+)"/g))assert.ok(ids.has(id),"missing icon "+id);
 for(const id of ["search","plus","bell","user-round"])assert.ok(ids.has(id));
});
test("DEV is explicit and isolated from real account data",()=>{
 assert.match(js,/sessionStorage\.getItem\(devKey\)/);
 assert.match(js,/devParams\.get\("dev"\)==="1"/);
 assert.match(html,/Datos ficticios · Sin sesión ni sincronización real/);
 assert.match(html,/src="\/dev-ui\.mjs"/);
 assert.match(html,/src="\/pwa-shell\.mjs"/);
 assert.match(read("holoteles-auth-config.mjs"),/enabled:false/);
 assert.match(read("holoteles-auth-config.mjs"),/allowProduction:false/);
});
test("account onboarding distinguishes existing and new accounts without asking for credentials when disabled",()=>{
 assert.match(html,/data-auth-view="login"/);
 assert.match(html,/data-auth-view="signup"/);
 assert.match(html,/id="accountForm" class="account-form" hidden/);
 assert.match(html,/Core todavía no ha habilitado/);
 assert.match(html,/id="authPassword"/);
 assert.match(html,/id="accountDialog"/);
});
