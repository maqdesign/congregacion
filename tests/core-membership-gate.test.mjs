import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const src=readFileSync(new URL("../app/account-ui.mjs",import.meta.url),"utf8");
const config=readFileSync(new URL("../app/holoteles-auth-config.mjs",import.meta.url),"utf8");
test("an authenticated identity cannot unlock congregation content without a Core authorization decision",()=>{
 const verified=src.match(/async function showVerified\(user\)\{([\s\S]*?)\n\}/)?.[1];
 assert.ok(verified,"showVerified present");
 assert.match(verified,/lockAccount\(\)/);
 const diagnostic=verified.slice(0,verified.indexOf('if(!configAllowed())return;'));
 assert.doesNotMatch(diagnostic,/gate\?\.unlock\(/);
 assert.match(verified,/result\?\.authorized===true&&result.identityVerified===true&&result.sessionActive===true&&result.membershipActive===true&&result.scopeGranted===true&&result.consentActive===true/);
 assert.match(verified,/if\(ticket!==generation\|\|devAllowed\(\)\|\|!configAllowed\(\)\)return/);
});
test("private account remains disabled in production until Core gates pass",()=>{
 assert.match(config,/enabled:true/);
 assert.match(config,/allowProduction:false/);
});
test("signout revokes local private view before calling remote logout",()=>{
 assert.match(src,/busy=true;lockAccount\(\);\s*try\{await adapter\.signOut\(\)/);
});
