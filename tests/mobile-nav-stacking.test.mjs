import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const html=readFileSync(new URL("../app/index.html",import.meta.url),"utf8");
test("mobile bottom navigation is above relative hero content and opaque",()=>{
 assert.match(html,/\.bottom\{z-index:90;background:#FFFCF8;border-top/);
 assert.match(html,/\.hero-copy\{position:relative;z-index:1/);
 assert.doesNotMatch(html,/\.bottom\{background:#FFFCF8F5/);
});
test("mobile navigation preserves safe-area padding and access-guide hiding",()=>{
 assert.match(html,/env\(safe-area-inset-bottom\)/);
 assert.match(html,/\.dev-access-guided \.bottom/);
 assert.match(html,/body\.access-unlinked:not\(\.dev-fixture-active\):not\(\.auth-locked\) \.bottom/);
});
