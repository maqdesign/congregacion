import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import vm from "node:vm";
import {DEMO_INVITE_CODE,createDemoAccessRequest,reviewDemoAccessRequest} from "../app/dev-invitations.mjs";
const ui=readFileSync(new URL("../app/dev-ui.mjs",import.meta.url),"utf8");
test("direct, sample link and valid manual code create pending requests, never grant access",()=>{
 for(const input of [{method:"direct"},{method:"link"},{method:"code",code:DEMO_INVITE_CODE}]){
  const r=createDemoAccessRequest(input);
  assert.equal(r.status,"pending_review");
  assert.equal(r.grantsAccess,false);
  assert.equal(r.reference,"MC-4821");
 }
});
test("invalid code and invalid methods fail closed",()=>{
 assert.equal(createDemoAccessRequest({method:"code",code:"wrong"}).status,"invalid");
 assert.throws(()=>createDemoAccessRequest({method:"admin"}),TypeError);
});
test("only simulated approval grants sample access; re-review fails",()=>{
 const pending=createDemoAccessRequest();
 const approved=reviewDemoAccessRequest(pending,"approve"),rejected=reviewDemoAccessRequest(pending,"reject");
 assert.equal(approved.grantsAccess,true);
 assert.equal(rejected.grantsAccess,false);
 assert.throws(()=>reviewDemoAccessRequest(approved,"approve"),TypeError);
 assert.throws(()=>reviewDemoAccessRequest(pending,"unknown"),TypeError);
});
test("DEV UI imports fixture module only after opt-in and exposes reviewer controls",()=>{
 assert.doesNotThrow(()=>new vm.Script(ui));
 assert.match(ui,/await import\("\.\/dev-invitations\.mjs"\)/);
 assert.match(ui,/data-demo-invite="link"/);
 assert.match(ui,/data-demo-invite="code"/);
 assert.match(ui,/data-demo-invite="approve"/);
 assert.match(ui,/data-demo-invite="reject"/);
 assert.doesNotMatch(ui,/fetch\(|supabase|XMLHttpRequest|localStorage/);
});
