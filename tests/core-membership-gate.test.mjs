import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const src=readFileSync(new URL("../app/account-ui.mjs",import.meta.url),"utf8");
const config=readFileSync(new URL("../app/holoteles-auth-config.mjs",import.meta.url),"utf8");
test("an authenticated identity cannot unlock congregation content without a Core authorization decision",()=>{
 const verified=src.match(/async function showVerified\(user\)\{([\s\S]*?)\n\}/)?.[1];
 assert.ok(verified,"showVerified present");
 assert.doesNotMatch(verified,/gate\?\.unlock\(/);
 assert.match(verified,/lockAccount\(\)/);
 assert.match(verified,/gate\?\.notice\(safeMessage\("signedIn"\)\)/);
});
test("private account remains disabled in production until Core gates pass",()=>{
 assert.match(config,/enabled:true/);
 assert.match(config,/allowProduction:false/);
});
test("signout revokes local private view before calling remote logout",()=>{
 assert.match(src,/busy=true;lockAccount\(\);\s*try\{await adapter\.signOut\(\)/);
});
