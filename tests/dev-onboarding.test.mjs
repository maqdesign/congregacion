import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import vm from "node:vm";
import {buildFixtureScenario} from "../app/dev-fixtures.mjs";
const ui=readFileSync(new URL("../app/dev-ui.mjs",import.meta.url),"utf8");
const sw=readFileSync(new URL("../app/sw.js",import.meta.url),"utf8");
const html=readFileSync(new URL("../app/index.html",import.meta.url),"utf8");
test("mock onboarding scripts parse and remain explicitly isolated",()=>{
 assert.doesNotThrow(()=>new vm.Script(ui));
 assert.doesNotThrow(()=>new vm.Script(sw));
 assert.match(ui,/if\(!active\(\)\)/);
 assert.match(ui,/await import\("\.\/dev-fixtures\.mjs"\)/);
 assert.doesNotMatch(ui,/fetch\(|supabase|localStorage|XMLHttpRequest/);
});
test("first-time user can explore signup, email confirmation and membership without credentials",()=>{
 for(const [action,next] of [["signup","signup-pending"],["confirm","unlinked"],["link","full"],["logout","guest"]]){
  assert.match(ui,new RegExp(action+':"'+next+'"'));
  assert.equal(buildFixtureScenario(next).scenarioId,next);
 }
 assert.match(ui,/data-fixture-action="confirm"/);
 assert.match(ui,/data-demo-invite="link"/);
 assert.match(ui,/Crear cuenta ficticia/);
 assert.match(ui,/No se envió ningún mensaje real/);
 assert.match(ui,/No se envía ningún mensaje real/);
 assert.match(ui,/No action signs in, creates accounts or links real congregations/);
});
test("re-render moves keyboard focus to next onboarding step",()=>{
 assert.match(ui,/const action=btn\.dataset\.fixtureAction/);
 assert.match(ui,/document\.querySelector\('\[data-fixture-action="confirm"\]'\)/);
 assert.match(ui,/document\.querySelector\('\[data-fixture-action="link"\]'\)/);
 assert.match(ui,/\?\.focus\(\)/);
 assert.match(html,/\.fixture-onboarding button\{min-height:44px\}/);
});
test("PWA offline installation precaches lifecycle script and a new version key",()=>{
 assert.match(sw,/mi-congregacion-shell-v4-20261024/);
 assert.match(sw,/"\/pwa-shell\.mjs"/);
 assert.match(sw,/if\(!STATIC.has\(url.pathname\)\|\|url.search\)return/);
});
