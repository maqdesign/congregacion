import test from "node:test";
import assert from "node:assert/strict";
import {AgendaUnavailableError,loadAuthorizedAgenda,projectAuthorizedFeed} from "../src/integrations/authorized-feed.mjs";

const context={authenticated:true,membership:{organizationId:"org-synthetic",status:"active"},verifiedPersonId:"person-1"};
const pub={organizationId:"org-synthetic",publicationStatus:"published",classification:"non_confidential",publishedAt:"2026-10-01T00:00:00Z",deliveredByAuthorizedEndpoint:true};
const schedule={...pub,id:"s1",seriesId:"monday",sourceApp:"reuniones",category:"reuniones",effectiveFrom:"2026-10-01",weekdays:[1],time:"19:00",title:"Reunión de prueba"};
const assignment={...pub,id:"a1",sourceApp:"reuniones",category:"asignaciones",date:"2026-10-26",time:"19:00",personId:"person-1",personalDelivery:true,title:"Asignación sintética"};
const envelope={schemaVersion:1,organizationId:"org-synthetic",state:"published",timeZone:"America/Santo_Domingo",generatedAt:"2026-10-20T00:00:00Z",expiresAt:"2026-11-01T00:00:00Z",schedules:[schedule],exceptions:[],activities:[assignment]};
const args={context,from:"2026-10-26",to:"2026-10-26",now:Date.parse("2026-10-22T00:00:00Z")};
function expectCode(fn,code){assert.throws(fn,e=>e instanceof AgendaUnavailableError&&e.code===code)}
test("expande agenda publicada y asignación propia en la fecha solicitada",()=>{
 const r=projectAuthorizedFeed({...args,envelope});assert.equal(r.items.length,2);assert.equal(r.timeZone,"America/Santo_Domingo");
 assert.equal(projectAuthorizedFeed({...args,envelope,filter:"mis_asignaciones"}).items.length,1);
});
test("membresía inactiva y otra congregación se rechazan",()=>{
 expectCode(()=>projectAuthorizedFeed({...args,envelope,context:{...context,membership:{...context.membership,status:"pending"}}}),"not-authorized");
 expectCode(()=>projectAuthorizedFeed({...args,envelope:{...envelope,organizationId:"org-other"}}),"invalid-envelope");
});
test("fila de otra organización, confidencial o no publicada se rechaza completa",()=>{
 for(const change of [{organizationId:"other"},{classification:"confidential"},{publicationStatus:"draft"}]){
  expectCode(()=>projectAuthorizedFeed({...args,envelope:{...envelope,schedules:[{...schedule,...change}]}}),"invalid-records");
 }
});
test("snapshot caducado o fecha de publicación futura se rechazan",()=>{
 expectCode(()=>projectAuthorizedFeed({...args,envelope:{...envelope,expiresAt:"2026-10-21T00:00:00Z"}}),"stale");
 expectCode(()=>projectAuthorizedFeed({...args,envelope:{...envelope,activities:[{...assignment,publishedAt:"2027-01-01T00:00:00Z"}]}}),"invalid-records");
});
test("no revela asignaciones ajenas ni las entrega como actividades generales",()=>{
 const other={...assignment,id:"a2",personId:"person-2"};
 const result=projectAuthorizedFeed({...args,envelope:{...envelope,activities:[assignment,other]}});
 assert.equal(result.items.filter(x=>x.category==="asignaciones").length,1);
});
test("no acepta zona horaria inválida ni excepciones de otro productor",()=>{
 expectCode(()=>projectAuthorizedFeed({...args,envelope:{...envelope,timeZone:"Mars/Colony"}}),"invalid-envelope");
 const ex={...pub,id:"e1",sourceApp:"servicio",scheduleId:"s1",date:"2026-10-26",kind:"cancelled"};
 expectCode(()=>projectAuthorizedFeed({...args,envelope:{...envelope,exceptions:[ex]}}),"invalid-records");
});
test("la carga solo acepta endpoint fijo del mismo origen",async()=>{
 await assert.rejects(loadAuthorizedAgenda({...args,endpoint:"https://example.com/agenda",fetchImpl:()=>{throw Error("should not fetch")}}),e=>e.code==="unapproved-endpoint");
});
test("fetch: GET sin caché, credenciales del mismo origen y sin IDs de usuario",async(t)=>{
 // Freeze only this test's JavaScript clock at the fixture snapshot, never the system clock.
 t.mock.method(Date,"now",()=>args.now);
 let request;
 const fetchImpl=async(url,options)=>{request={url,options};return {ok:true,status:200,headers:{get:k=>k==="content-type"?"application/json":null},text:async()=>JSON.stringify(envelope)}};
 const r=await loadAuthorizedAgenda({...args,fetchImpl});
 assert.equal(r.items.length,2);assert.equal(request.url.startsWith("/api/congregation/agenda?from="),true);
 assert.equal(request.options.credentials,"same-origin");assert.equal(request.options.cache,"no-store");
 assert.equal(request.url.includes("person-1"),false);assert.equal(request.url.includes("org-synthetic"),false);
});
test("fetch: 403, no JSON y respuesta grande fallan cerrados",async()=>{
 const response=(status,ct,body)=>({status,ok:status===200,headers:{get:k=>k==="content-type"?ct:null},text:async()=>body});
 for(const [resp,code] of [[response(403,"application/json","{}"),"not-authorized"],[response(200,"text/html","<html>"),"invalid-response"],[response(200,"application/json","x".repeat(350001)),"invalid-response"]]){
  await assert.rejects(loadAuthorizedAgenda({...args,fetchImpl:async()=>resp}),e=>e.code===code);
 }
});
test("reloj inválido, expiración exacta y autenticación no booleana fallan cerrados",()=>{
 for(const now of [NaN,Infinity,Date.parse(envelope.expiresAt)])expectCode(()=>projectAuthorizedFeed({...args,envelope,now}),'stale');
 expectCode(()=>projectAuthorizedFeed({...args,envelope,context:{...context,authenticated:'true'}}),'not-authorized');
});
test("fetch: 401, MIME engañoso y límite real UTF-8 se rechazan",async()=>{
 const response=(status,ct,body)=>({status,ok:status===200,headers:new Headers({'content-type':ct}),text:async()=>body});
 for(const [resp,code] of [[response(401,'application/json','{}'),'not-authorized'],[response(200,'text/html; note=application/json','{}'),'invalid-response'],[response(200,'application/json',JSON.stringify({padding:'á'.repeat(180000)})),'invalid-response']]){
  await assert.rejects(loadAuthorizedAgenda({...args,fetchImpl:async()=>resp}),e=>e.code===code);
 }
});
test("una solicitud abortada nunca proyecta datos aunque fetch ignore la cancelación",async()=>{
 const controller=new AbortController();controller.abort();let calls=0;
 await assert.rejects(loadAuthorizedAgenda({...args,signal:controller.signal,fetchImpl:async()=>{calls++}}),e=>e.code==='aborted');
 assert.equal(calls,0);
 const second=new AbortController();
 await assert.rejects(loadAuthorizedAgenda({...args,signal:second.signal,fetchImpl:async()=>({ok:true,status:200,headers:new Headers({'content-type':'application/json'}),text:async()=>{second.abort();return JSON.stringify(envelope)}})}),e=>e.code==='aborted');
});
test("feed permite cambio de lugar sin hora y rechaza excepciones malformadas",()=>{
 const exception={...pub,id:'ex',sourceApp:'reuniones',scheduleId:schedule.id,date:'2026-10-26',kind:'changed',place:'Lugar sintético'};
 const changed={...envelope,exceptions:[exception]};
 assert.equal(projectAuthorizedFeed({...args,envelope:changed}).items.find(x=>x.sourceId===schedule.id).place,exception.place);
 for(const change of [{time:'25:00'},{kind:'unknown'}])expectCode(()=>projectAuthorizedFeed({...args,envelope:{...changed,exceptions:[{...exception,...change}]}}),'invalid-records');
});
