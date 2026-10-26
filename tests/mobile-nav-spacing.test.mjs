import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import vm from "node:vm";
const html=readFileSync(new URL("../app/index.html",import.meta.url),"utf8");
const js=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
test("iOS bottom navigation reserves scrolling room and respects safe area",()=>{
 assert.match(html,/--bottom-nav-space:calc\(106px \+ env\(safe-area-inset-bottom,0px\)\)/);
 assert.match(html,/body\.dev-fixture-active:not\(\.dev-access-guided\) main\{padding-bottom:calc\(var\(--bottom-nav-space\) \+ 52px\)\}/);
 assert.match(html,/main :is\(button,input,select,textarea,\[tabindex\]\):focus\{scroll-margin-bottom/);
 assert.match(html,/\.bottom\{z-index:35;min-height:76px/);
 assert.match(html,/\.bottom button\{min-height:56px\}/);
 assert.match(html,/@media print\{\.bottom\{display:none!important\}/);
});
test("guided-access screen keeps its separate no-nav layout",()=>{
 assert.match(html,/body\.dev-access-guided \.bottom/);
 assert.match(html,/body\.dev-access-guided main\{padding-bottom:calc\(30px \+ env\(safe-area-inset-bottom\)\)\}/);
 assert.doesNotMatch(html,/body\.dev-access-guided:not\(\.dev-fixture-active\) main\{padding-bottom:calc\(var\(--bottom-nav-space\)/);
 assert.doesNotThrow(()=>new vm.Script(js));
});
