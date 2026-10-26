import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const src=readFileSync(new URL("../app/account-ui.mjs",import.meta.url),"utf8");
test("DEV login shows verified identity while app private permissions remain locked",()=>{
 const fn=src.match(/async function showVerified\(user\)\{([\s\S]*?)\n\}\nfunction showMode/)?.[1];
 assert.ok(fn);
 const dev=fn.match(/if\(devAllowed\(\)\)\{([\s\S]*?)\n \}/)?.[1];
 assert.ok(dev);assert.match(dev,/\$\("connectedAccount"\)\.hidden=false/);
 assert.match(dev,/\$\("verifiedEmail"\)\.textContent=user\.email/);
 assert.match(fn,/lockAccount\(\)/);
 assert.doesNotMatch(dev,/gate\?\.unlock/);
});
test("authenticated sign-in does not lose feedback if Auth callback runs in parallel",()=>{
 assert.match(src,/if\(user\)await showVerified\(user\)/);
});
