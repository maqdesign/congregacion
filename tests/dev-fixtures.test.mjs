import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import vm from "node:vm";
import {FIXTURE_SCENARIOS,buildFixtureScenario,filterFixtureActivities,fixturePersonalAssignments} from "../app/dev-fixtures.mjs";
const today=new Date(2026,9,23);
const scenario=id=>buildFixtureScenario(id,{today});
test("all DEV scenarios have unique names, stable state and synthetic-only identities",()=>{
 assert.equal(FIXTURE_SCENARIOS.length,13);
 assert.equal(new Set(FIXTURE_SCENARIOS.map(x=>x.id)).size,FIXTURE_SCENARIOS.length);
 for(const s of FIXTURE_SCENARIOS){
  const f=scenario(s.id);
  assert.equal(f.fixture,true);
  assert.ok(["guest","expired","verified"].includes(f.account));
  assert.ok(["ready","unlinked","forbidden","offline","loading","unavailable"].includes(f.agendaState));
  assert.ok(f.activities.every(a=>a.date>="2026-10-23"));
  assert.ok(f.activities.every(a=>!a.email&&!a.organizationId&&!a.personId));
  assert.ok(!JSON.stringify(f).includes("@gmail.com"));
 }
});
test("full fixture shows public and personal activities with filters",()=>{
 const f=scenario("full");
 assert.ok(f.activities.length>=5);
 assert.ok(filterFixtureActivities(f,{filter:"reuniones"}).every(x=>x.category==="reuniones"));
 assert.ok(filterFixtureActivities(f,{filter:"servicio"}).every(x=>x.category==="servicio"));
 assert.ok(filterFixtureActivities(f,{filter:"mis_asignaciones"}).every(x=>x.isMine));
 assert.equal(fixturePersonalAssignments(f).length,3);
 const one=f.activities[0];
 assert.deepEqual(filterFixtureActivities(f,{date:one.date}).map(x=>x.date),[one.date]);
});
test("forbidden, revoked, unlinked, offline and expired never reveal agenda or assignments",()=>{
 for(const id of ["guest","unlinked","no-permission","offline","loading","expired","revoked","error","signup-pending"]){
  const f=scenario(id);
  assert.equal(f.activities.length,0,id);
  assert.deepEqual(filterFixtureActivities(f),[],id);
  assert.deepEqual(fixturePersonalAssignments(f),[],id);
 }
});
test("empty and no-assignments are distinct authorized states",()=>{
 assert.equal(scenario("empty").agendaState,"ready");
 assert.deepEqual(scenario("empty").activities,[]);
 assert.ok(scenario("no-assignments").activities.length>0);
 assert.equal(fixturePersonalAssignments(scenario("no-assignments")).length,0);
});
test("cancelled and rescheduled remain visibly distinguishable, cancelled not personal",()=>{
 const f=scenario("cancelled");
 assert.ok(f.activities.some(x=>x.status==="cancelled"));
 assert.ok(f.activities.some(x=>x.status==="rescheduled"));
 assert.ok(fixturePersonalAssignments(f).every(x=>x.status!=="cancelled"));
});
test("invalid fixtures and filters fail closed",()=>{
 assert.throws(()=>scenario("unknown"),RangeError);
 assert.throws(()=>buildFixtureScenario("full",{today:new Date("invalid")}),TypeError);
 assert.throws(()=>filterFixtureActivities(scenario("full"),{filter:"private-all"}),RangeError);
 assert.deepEqual(filterFixtureActivities({fixture:false,agendaState:"ready",activities:[{isMine:true}]}),[]);
});
test("DEV JS parses and fixtures are imported only after explicit opt-in",()=>{
 const html=readFileSync(new URL("../app/index.html",import.meta.url),"utf8");
 const devUi=readFileSync(new URL("../app/dev-ui.mjs",import.meta.url),"utf8");
 const script=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
 assert.doesNotThrow(()=>new vm.Script(script));
 assert.doesNotThrow(()=>new vm.Script(devUi));
 assert.match(devUi,/if\(!active\(\)\)/);
 assert.match(devUi,/await import\("\.\/dev-fixtures\.mjs"\)/);
 assert.doesNotMatch(devUi,/fetch\(|localStorage|supabase|service_role/);
 assert.match(html,/src="\/dev-ui\.mjs"/);
 assert.match(html,/mi-congregacion:dev-change/);
 assert.match(html,/mi-congregacion:locale-change/);
 assert.match(html,/\.dev-fixture-active #tablero>:not\(\.fixture-panel\)/);
});
