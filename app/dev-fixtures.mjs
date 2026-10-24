// Synthetic, intentionally non-personal data. Import ONLY inside the explicit DEV experience.
// Never feed these records into authenticated endpoints, app storage, or production projections.
export const FIXTURE_SCENARIOS=Object.freeze([
 {id:"full",es:"Todo conectado",en:"Fully connected",hintEs:"Cuenta, reuniones, servicio y asignaciones",hintEn:"Account, meetings, service and assignments"},
 {id:"guest",es:"Visitante sin cuenta",en:"Guest without account",hintEs:"Primer acceso y registro",hintEn:"First visit and signup"},
 {id:"unlinked",es:"Cuenta sin congregación",en:"Account not linked",hintEs:"Identidad sin vinculación",hintEn:"Identity without membership"},
 {id:"no-permission",es:"Sin permiso de agenda",en:"No agenda permission",hintEs:"Acceso denegado",hintEn:"Access denied"},
 {id:"empty",es:"Sin actividades",en:"No activities",hintEs:"Estado vacío legítimo",hintEn:"Genuinely empty calendar"},
 {id:"offline",es:"Sin conexión",en:"Offline",hintEs:"No mostrar datos nuevos",hintEn:"Do not show new data"},
 {id:"loading",es:"Cargando",en:"Loading",hintEs:"Espera y progreso",hintEn:"Waiting and progress"},
 {id:"cancelled",es:"Cambios y cancelaciones",en:"Changes and cancellations",hintEs:"Actividades reprogramadas",hintEn:"Rescheduled activities"},
 {id:"no-assignments",es:"Sin asignaciones propias",en:"No personal assignments",hintEs:"Agenda pública disponible",hintEn:"Public calendar available"},
 {id:"signup-pending",es:"Registro por confirmar",en:"Signup pending",hintEs:"Confirmación de correo",hintEn:"Email confirmation"},
 {id:"expired",es:"Sesión vencida",en:"Session expired",hintEs:"Volver a iniciar sesión",hintEn:"Sign in again"},
 {id:"revoked",es:"Acceso revocado",en:"Access revoked",hintEs:"Sin mostrar datos privados",hintEn:"Private data hidden"},
 {id:"error",es:"Servicio no disponible",en:"Service unavailable",hintEs:"Error recuperable",hintEn:"Recoverable error"}
]);
const iso=d=>[d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-");
const shift=(d,n)=>new Date(d.getFullYear(),d.getMonth(),d.getDate()+n);
const activity=(id,offset,time,category,titleEs,titleEn,placeEs,placeEn,extra={})=>({
 id,dateOffset:offset,time,category,titleEs,titleEn,placeEs,placeEn,
 isMine:false,status:"published",...extra
});
const EXAMPLES=Object.freeze([
 activity("meeting-midweek",1,"19:00","reuniones","Reunión de entre semana","Midweek meeting","Salón del Reino","Kingdom Hall"),
 activity("cart-service",2,"09:30","servicio","Predicación con carrito","Cart witnessing","Punto de encuentro","Meeting point",{isMine:true,assignmentEs:"Participar en el carrito",assignmentEn:"Cart assignment"}),
 activity("meeting-weekend",4,"09:00","reuniones","Reunión del fin de semana","Weekend meeting","Salón del Reino","Kingdom Hall",{isMine:true,assignmentEs:"Lectura asignada",assignmentEn:"Assigned reading"}),
 activity("field-service",5,"08:30","servicio","Predicación en grupo","Group field service","Punto de encuentro","Meeting point"),
 activity("public-talk",8,"09:00","reuniones","Discurso público","Public talk","Salón del Reino","Kingdom Hall"),
 activity("cart-followup",11,"16:00","servicio","Turno de carrito","Cart shift","Plaza del sector","Neighborhood square",{isMine:true,assignmentEs:"Turno de apoyo",assignmentEn:"Support shift"}),
 activity("rescheduled",6,"18:30","reuniones","Reunión reprogramada","Rescheduled meeting","Salón del Reino","Kingdom Hall",{status:"rescheduled"}),
 activity("cancelled",3,"10:00","servicio","Salida de predicación cancelada","Cancelled field service","Punto de encuentro","Meeting point",{status:"cancelled"})
]);
const clone=(o)=>({...o});
export function buildFixtureScenario(id,{today=new Date()}={}){
 const scenario=FIXTURE_SCENARIOS.find(s=>s.id===id);
 if(!scenario)throw new RangeError("Unknown fixture scenario");
 if(!(today instanceof Date)||!Number.isFinite(today.getTime()))throw new TypeError("Invalid fixture date");
 const account=["guest","signup-pending"].includes(id)?"guest":id==="expired"?"expired":"verified";
 const membership=["guest","unlinked","signup-pending","expired"].includes(id)?"unlinked":id==="revoked"?"revoked":"active";
 const agendaState=["guest","unlinked","signup-pending","expired"].includes(id)?"unlinked":
  id==="revoked"||id==="no-permission"?"forbidden":
  id==="offline"?"offline":id==="loading"?"loading":id==="error"?"unavailable":"ready";
 const base=id==="cancelled"?EXAMPLES:EXAMPLES.filter(a=>!["cancelled","rescheduled"].includes(a.id));
 const activities=agendaState==="ready"&&!["empty"].includes(id)?
  base.map(a=>({...clone(a),date:iso(shift(today,a.dateOffset)),isMine:id==="no-assignments"?false:a.isMine})): [];
 return Object.freeze({
  fixture:true,scenarioId:id,account,membership,agendaState,
  displayName:account==="verified"?"Alex Ejemplo":null,
  email:account==="verified"?"alex.ejemplo@example.test":null,
  organization:membership==="active"?"Congregación Ejemplo":null,
  activities:Object.freeze(activities.map(a=>Object.freeze(a))),
  generatedAt:iso(today)
 });
}
export function filterFixtureActivities(fixture,{filter="todo",date=null}={}){
 if(!fixture?.fixture||fixture.agendaState!=="ready")return [];
 if(!["todo","reuniones","servicio","mis_asignaciones"].includes(filter))throw new RangeError("Unknown filter");
 return fixture.activities.filter(a=>(filter==="todo"||filter==="mis_asignaciones"&&a.isMine||a.category===filter)&&(!date||a.date===date));
}
export function fixturePersonalAssignments(fixture){
 return filterFixtureActivities(fixture,{filter:"mis_asignaciones"}).filter(a=>a.status!=="cancelled");
}
