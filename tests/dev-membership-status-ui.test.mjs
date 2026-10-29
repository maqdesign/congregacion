import test from "node:test";
import assert from "node:assert/strict";
import {DEMO_MEMBERSHIP_STATES,getDemoMembershipView,renderDemoMembershipCard} from "../app/dev-membership-status-ui.mjs";
test("every synthetic membership state is safe and visibly labelled",()=>{
 for(const status of DEMO_MEMBERSHIP_STATES){
  const model=getDemoMembershipView(status);
  const html=renderDemoMembershipCard(status);
  assert.equal(model.synthetic,true);
  assert.equal(model.authorized,false);
  assert.equal(model.mayRequest,false);
  assert.match(html,/DEV · Ejemplo ficticio · Sin conexión real/);
  assert.match(html,/No modifica tu cuenta ni concede permisos/);
  assert.doesNotMatch(html,/<form|fetch\(|on(click|submit)=/i);
 }
});
test("a pending or denied request never exposes a submission button",()=>{
 for(const state of ["pending_review","rejected","revoked","person_verification_required","approved"])
  assert.doesNotMatch(renderDemoMembershipCard(state),/<button/);
});
test("unlinked shows disabled demonstration, not a live action",()=>{
 assert.match(renderDemoMembershipCard("unlinked"),/disabled aria-disabled="true"/);
});
test("unknown/untrusted states fail closed and do not inject HTML",()=>{
 assert.equal(getDemoMembershipView("<img src=x onerror=alert(1)>").state,"unavailable");
 assert.doesNotMatch(renderDemoMembershipCard("<img src=x onerror=alert(1)>"),/<img/);
});
