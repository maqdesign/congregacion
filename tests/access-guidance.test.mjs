import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import vm from "node:vm";
const read=p=>readFileSync(new URL("../app/"+p,import.meta.url),"utf8");
const html=read("index.html"),ui=read("dev-ui.mjs");
const script=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
test("access guidance scripts parse",()=>{assert.doesNotThrow(()=>new vm.Script(script));assert.doesNotThrow(()=>new vm.Script(ui));});
test("normal unsigned state has a standalone access page instead of empty routes",()=>{
 assert.match(html,/id="normalAccessGuide"/);
 assert.match(html,/id="openAccessGuideAccount"/);
 assert.match(html,/body:not\(\.dev-fixture-active\):not\(\.auth-locked\) main>#tablero/);
 assert.match(html,/body:not\(\.dev-fixture-active\):not\(\.auth-locked\) \.bottom/);
 assert.match(script,/main section\[id=tablero\],main section\[id=agenda\],main section\[id=yo\]/);
});
test("unlinked DEV mode shows only guided identity and invite steps",()=>{
 assert.match(ui,/const guided=f\.agendaState!=="ready"/);
 assert.match(ui,/document\.body\.classList\.toggle\("dev-access-guided",guided\)/);
 assert.match(html,/body\.dev-access-guided #tablero,body\.dev-access-guided #agenda/);
 assert.match(html,/body\.dev-access-guided #yo\{display:block!important\}/);
 assert.match(ui,/\(guided\?'':card\(t\("Mis asignaciones"/);
 assert.match(ui,/\[data-tab="yo"\]/);
});
test("restored pages, scenario switches and native navigation start at top",()=>{
 assert.match(script,/history\.scrollRestoration="manual"/);
 assert.match(script,/addEventListener\("pageshow",\(\)=>window\.scrollTo\(0,0\)\)/);
 assert.match(script,/addEventListener\("load",\(\)=>window\.scrollTo\(0,0\)\)/);
 assert.match(ui,/if\(guideKey!==lastGuidedKey\)/);
 assert.match(ui,/window\.scrollTo\(0,0\)/);
});
