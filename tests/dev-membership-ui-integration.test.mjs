import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {buildFixtureScenario} from "../app/dev-fixtures.mjs";
import {getDemoMembershipView} from "../app/dev-membership-status-ui.mjs";
const ui=readFileSync(new URL("../app/dev-ui.mjs",import.meta.url),"utf8");
test("all existing fixture scenarios produce a safe demonstration state",()=>{
 for(const s of ["full","guest","unlinked","no-permission","empty","offline","loading","cancelled","no-assignments","signup-pending","expired","revoked","error"]){
  const f=buildFixtureScenario(s);
  assert.equal(f.fixture,true);
  const view=getDemoMembershipView(f.scenarioId==="no-permission"?"permission_limited":f.scenarioId==="revoked"?"revoked":"unavailable");
  assert.equal(view.authorized,false);
 }
});
test("Yo receives guided explicitly and renders no private request from membership UI",()=>{
 assert.match(ui,/function renderMe\(f,guided\)/);
 assert.match(ui,/renderMe\(f,guided\);/);
 assert.match(ui,/renderMembershipPreview\(f\)\+actions/);
 assert.doesNotMatch(ui,/(fetch\(|XMLHttpRequest|supabase|localStorage)/);
});
test("fake request statuses override the fixture-only membership card",()=>{
 assert.match(ui,/accessRequest\?\.status==="pending_review"\?"pending_review"/);
 assert.match(ui,/accessRequest\?\.status==="rejected"\?"rejected"/);
 assert.match(ui,/"no-permission":"permission_limited"/);
});
test("Auth DEV is mutually exclusive with fixture sandbox",()=>{
 assert.match(ui,/get\("authTest"\)!=="1"/);
 assert.match(ui,/sessionStorage\.getItem\(key\)==="1"/);
 assert.match(ui,/await import\("\.\/dev-membership-status-ui\.mjs"\)/);
});
