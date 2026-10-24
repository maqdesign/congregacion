import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import vm from "node:vm";
const html=readFileSync(new URL("../app/index.html",import.meta.url),"utf8");
const script=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];

test("inline application JS parses without browser or network",()=>{
 assert.ok(script);
 assert.doesNotThrow(()=>new vm.Script(script));
});
test("unlinked congregation is not falsely represented as an empty authorized feed",()=>{
 assert.match(html,/<strong data-t="unlinked">Congregación no vinculada<\/strong>/);
 assert.doesNotMatch(html,/<strong data-t="none">No hay actividades disponibles<\/strong>/);
 assert.match(html,/id="agendaStatus" role="status" aria-live="polite"/);
 assert.match(html,/data-t="activityPending"/);
 assert.match(html,/data-t="agendaPending"/);
});
test("date selection, month reset and filters preserve accessible state",()=>{
 assert.match(html,/id="calendarSelection"[^>]*aria-live="polite"/);
 assert.match(script,/let selectedDate=null,activeFilter="todo"/);
 assert.match(script,/e\.setAttribute\("aria-pressed",String\(selectedDate===key\)\)/);
 assert.match(script,/selectedDate=selectedDate===key\?null:key;cal\(\)/);
 assert.equal((script.match(/selectedDate=null;cal\(\)/g)||[]).length,2);
 assert.match(script,/activeFilter=b\.dataset\.filter/);
});
test("account details are navigable without implying sign-in is enabled",()=>{
 assert.match(html,/id="accountDetails"/);
 assert.match(script,/\$\("accountDetails"\)\.addEventListener\("click",\(\)=>navigate\("yo"\)\)/);
 assert.match(html,/Cuenta Holoteles/);
 assert.match(html,/Sin datos conectados/);
});
test("PDF print background uses brand cream instead of transparent black",()=>{
 assert.match(html,/@media print\{html,body\{background:#F6EFE6!important/);
});
