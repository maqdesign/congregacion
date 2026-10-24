import test from "node:test";
import assert from "node:assert/strict";
import {prepareAgendaView} from "../src/ui/agenda-view-model.mjs";

const items = [
  {id:"m1",date:"2026-10-28",time:"19:00",category:"reuniones",title:"Reunión"},
  {id:"s1",date:"2026-10-29",time:"09:00",category:"servicio",title:"Salida",place:"Lugar aprobado"},
  {id:"a1",date:"2026-10-28",time:"18:00",category:"asignaciones",title:"Mi parte",isMine:true},
  {id:"a2",date:"2026-10-28",time:"18:30",category:"asignaciones",title:"Parte ajena"},
];
test("unlinked does not expose items or claim an empty authorized calendar",()=>{
  const view=prepareAgendaView({items});
  assert.equal(view.status,"unlinked");
  assert.equal(view.events.length,0);
  assert.match(view.message,/no está vinculada/);
});
test("ready sorts, counts dates and excludes unverified assignments",()=>{
  const view=prepareAgendaView({status:"ready",items});
  assert.deepEqual(view.events.map(x=>x.id),["a1","m1","s1"]);
  assert.equal(view.dayCounts["2026-10-28"],2);
  assert.equal(view.dayCounts["2026-10-29"],1);
});
test("day selection and category filters are composable",()=>{
  const view=prepareAgendaView({status:"ready",items,filter:"reuniones",selectedDate:"2026-10-28"});
  assert.deepEqual(view.events.map(x=>x.id),["m1"]);
  assert.deepEqual(prepareAgendaView({status:"ready",items,filter:"mis_asignaciones"}).events.map(x=>x.id),["a1"]);
});
test("next activity uses congregation-local date and time provided by caller",()=>{
  const view=prepareAgendaView({status:"ready",items,today:"2026-10-28",nowTime:"18:15"});
  assert.equal(view.next.id,"m1");
});
test("no results and no permission are different states, bilingual",()=>{
  assert.match(prepareAgendaView({status:"ready",items:[],language:"en"}).message,/No published activities/);
  const forbidden=prepareAgendaView({status:"forbidden",items,language:"en"});
  assert.equal(forbidden.events.length,0);
  assert.match(forbidden.message,/cannot access/);
});
test("invalid dates, unknown filters and malformed rows fail safely",()=>{
  assert.throws(()=>prepareAgendaView({selectedDate:"2026-02-30"}),TypeError);
  assert.throws(()=>prepareAgendaView({filter:"admin"}),TypeError);
  const view=prepareAgendaView({status:"ready",items:[{id:"bad",date:"2026-02-30",time:"19:00",category:"servicio"}]});
  assert.equal(view.events.length,0);
});
