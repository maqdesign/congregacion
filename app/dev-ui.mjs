// A fully isolated visual sandbox: no fetch, no auth calls, no shared data stores.
// Fixtures are dynamically imported only after explicit DEV opt-in.
const $=id=>document.getElementById(id);
const key="mi-congregacion-dev-ui-v1",scenarioKey="mi-congregacion-fixture-scenario-v1";
const active=()=>{try{return sessionStorage.getItem(key)==="1"&&new URLSearchParams(location.search).get("authTest")!=="1"}catch{return false}};
const locale=()=>document.documentElement.lang==="en"?"en":"es";
const t=(es,en)=>locale()==="en"?en:es;
const safe=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const formatDate=s=>new Intl.DateTimeFormat(locale()==="en"?"en-US":"es-DO",{weekday:"short",day:"numeric",month:"short"}).format(new Date(s+"T12:00:00"));
let source=null,scenario="full",month=new Date(),selectedDate=null,filter="todo",extra=[],completed=new Set(),version=0;
month=new Date(month.getFullYear(),month.getMonth(),1);
function scenarioFromStorage(){try{return sessionStorage.getItem(scenarioKey)||"full"}catch{return "full"}}
function storeScenario(){try{sessionStorage.setItem(scenarioKey,scenario)}catch{}}
function fixture(){
 const base=source.buildFixtureScenario(scenario);
 return {...base,activities:[...base.activities,...(base.agendaState==="ready"?extra:[])]};
}
function stateLabel(state){
 return ({ready:t("Conectada","Connected"),unlinked:t("Sin vincular","Not linked"),
 forbidden:t("Sin permiso","No permission"),offline:t("Sin conexión","Offline"),
 loading:t("Cargando…","Loading…"),unavailable:t("No disponible","Unavailable")})[state]||state;
}
function stateMessage(f){
 if(f.agendaState==="ready")return f.activities.length===0?t("No hay actividades publicadas para mostrar.","There are no published activities to show."):t("Datos ficticios listos para explorar.","Sample data ready to explore.");
 return ({
 unlinked:t("Vincula tu congregación para consultar la agenda.","Link your congregation to view the calendar."),
 forbidden:t("Esta cuenta no tiene permiso. No se muestran actividades.","This account has no permission. No activities are shown."),
 offline:t("No hay conexión. Los datos nuevos no están disponibles.","Offline. New data is not available."),
 loading:t("Consultando información autorizada…","Checking authorized information…"),
 unavailable:t("No se pudo cargar la agenda. Inténtalo de nuevo.","The calendar could not load. Please try again.")
 })[f.agendaState];
}
function card(title,body,klass=""){return '<div class="card '+klass+'"><h2>'+safe(title)+'</h2>'+body+'</div>'}
function itemHtml(a,{personal=false}={}){
 const title=locale()==="en"?a.titleEn:a.titleEs;
 const place=locale()==="en"?a.placeEn:a.placeEs;
 const assignment=locale()==="en"?a.assignmentEn:a.assignmentEs;
 const state=a.status==="cancelled"?t("Cancelada","Cancelled"):a.status==="rescheduled"?t("Reprogramada","Rescheduled"):"";
 return '<article class="fixture-item'+(a.status==="cancelled"?' fixture-cancelled':'')+'"><div><div class="fixture-date">'+safe(formatDate(a.date))+' · '+safe(a.time)+'</div><strong>'+safe(personal&&assignment?assignment:title)+'</strong><p>'+safe(personal?title+" · "+place:place)+'</p></div><div class="fixture-item-meta"><span class="fixture-chip">'+safe(a.category==="reuniones"?t("Reuniones","Meetings"):t("Servicio","Service"))+'</span>'+(state?'<span class="fixture-chip fixture-warning">'+safe(state)+'</span>':'')+(a.isMine?'<span class="fixture-chip fixture-personal">'+t("Mi asignación","My assignment")+'</span>':'')+(personal?'<button type="button" data-fixture-complete="'+safe(a.id)+'" class="secondary">'+(completed.has(a.id)?t("Hecha","Done"):t("Marcar hecha","Mark done"))+'</button>':'')+'</div></article>'
}
function renderBoard(f){
 const next=f.agendaState==="ready"?f.activities.filter(a=>a.status!=="cancelled"&&a.date>=f.generatedAt).sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time))[0]:null;
 const nextBody=next?itemHtml(next):'<div class="empty"><strong>'+safe(stateLabel(f.agendaState))+'</strong><span>'+safe(stateMessage(f))+'</span></div>';
 const scheduled=f.agendaState==="ready"?f.activities.filter(a=>a.status!=="cancelled").length:0;
 const assignments=source.fixturePersonalAssignments(f).length;
 $("tablero").querySelector(".fixture-panel").innerHTML=
 '<div class="dashboard-hero"><div class="hero-copy"><div class="kicker">'+t("TU ESPACIO · DEMOSTRACIÓN","YOUR SPACE · DEMO")+'</div><h1>'+t("Bienvenido a Mi Congregación","Welcome to My Congregation")+'</h1><p>'+t("Así se vería la información de una congregación vinculada.","Here is how a linked congregation would look.")+'</p></div><img class="hero-isotype" src="/brand-isotype.svg" alt="" width="120" height="120"></div>'+
 '<div class="grid"><div>'+card(t("Próxima actividad","Next activity"),nextBody)+card(t("Resumen de la agenda","Calendar summary"),'<div class="fixture-metrics"><div><strong>'+scheduled+'</strong><span>'+t("Actividades","Activities")+'</span></div><div><strong>'+assignments+'</strong><span>'+t("Mis asignaciones","My assignments")+'</span></div></div>')+'</div><div>'+card(t("Estado de conexión","Connection status"),'<span class="fixture-chip">'+safe(stateLabel(f.agendaState))+'</span><p>'+safe(stateMessage(f))+'</p><p class="small">'+safe(f.organization||t("Sin congregación vinculada","No congregation linked"))+'</p>')+card(t("Tu Agenda","Your calendar"),'<p>'+t("Explora reuniones, servicio y asignaciones de prueba.","Explore sample meetings, service and assignments.")+'</p><button class="primary" data-fixture-nav="agenda">'+t("Abrir Agenda","Open calendar")+'</button>','card-feature')+'</div></div>';
}
function calendarHtml(f){
 const first=new Date(month.getFullYear(),month.getMonth(),1);
 const last=new Date(month.getFullYear(),month.getMonth()+1,0).getDate();
 const monday=(first.getDay()+6)%7;
 const days=locale()==="en"?["M","T","W","T","F","S","S"]:["L","M","M","J","V","S","D"];
 const counts=new Map();
 for(const a of f.activities)counts.set(a.date,(counts.get(a.date)||0)+1);
 const monthLabel=new Intl.DateTimeFormat(locale()==="en"?"en-US":"es-DO",{month:"long",year:"numeric"}).format(month);
 let html='<div class="month"><button type="button" data-fixture-month="-1" aria-label="'+t("Mes anterior","Previous month")+'">‹</button><h2>'+safe(monthLabel)+'</h2><button type="button" data-fixture-month="1" aria-label="'+t("Mes siguiente","Next month")+'">›</button></div><div class="calendar fixture-calendar" role="group" aria-label="'+t("Calendario de demostración","Demo calendar")+'">';
 for(const d of days)html+='<span>'+d+'</span>';
 for(let i=0;i<monday;i++)html+='<span aria-hidden="true"></span>';
 for(let d=1;d<=last;d++){
  const date=[month.getFullYear(),String(month.getMonth()+1).padStart(2,"0"),String(d).padStart(2,"0")].join("-");
  const count=counts.get(date)||0;
  html+='<button type="button" data-fixture-day="'+date+'" aria-pressed="'+(date===selectedDate)+'" class="'+(date===selectedDate?"selected":"")+'" aria-label="'+safe(formatDate(date))+(count?" · "+count+" "+t("actividades","activities"):"")+'">'+d+(count?'<span class="fixture-day-dot" aria-hidden="true"></span>':"")+'</button>';
 }
 return html+'</div><p class="small">'+(selectedDate?t("Fecha seleccionada: ","Selected date: ")+safe(formatDate(selectedDate)):'')+'</p>';
}
function renderAgenda(f){
 const list=source.filterFixtureActivities(f,{filter,date:selectedDate});
 const filters=[["todo",t("Todo","All")],["reuniones",t("Reuniones","Meetings")],["servicio",t("Servicio","Service")],["mis_asignaciones",t("Mis asignaciones","My assignments")]];
 const controls='<div class="filters" role="group" aria-label="'+t("Filtros de actividades","Activity filters")+'">'+filters.map(([id,label])=>'<button type="button" data-fixture-filter="'+id+'" aria-pressed="'+(id===filter)+'">'+label+'</button>').join("")+'</div>';
 const listHtml=f.agendaState!=="ready"?'<div class="empty"><strong>'+safe(stateLabel(f.agendaState))+'</strong><span>'+safe(stateMessage(f))+'</span></div>':
  list.length?'<div class="fixture-list">'+list.sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time)).map(a=>itemHtml(a)).join("")+'</div>':
  '<div class="empty"><strong>'+t("Sin resultados","No results")+'</strong><span>'+t("Prueba otra fecha o filtro.","Try another date or filter.")+'</span></div>';
 $("agenda").querySelector(".fixture-panel").innerHTML='<div class="kicker">'+t("AGENDA · DEMOSTRACIÓN","CALENDAR · DEMO")+'</div><h1>'+t("Agenda","Calendar")+'</h1><p>'+t("Filtra y selecciona días; todo es ficticio.","Filter and select dates; everything is fictional.")+'</p>'+card(t("Calendario","Calendar"),calendarHtml(f))+card(t("Actividades","Activities"),controls+listHtml);
}
function renderMe(f){
 const identity=f.scenarioId==="signup-pending"?'<strong>'+t("Revisa tu correo","Check your email")+'</strong><p>'+t("El registro ficticio espera confirmación. No se envió ningún mensaje real.","Sample registration awaits confirmation. No real message was sent.")+'</p>':f.account==="verified"?'<strong>'+safe(f.displayName)+'</strong><p>'+safe(f.email)+'</p><span class="fixture-chip">'+t("Identidad simulada","Simulated identity")+'</span>':
 f.account==="expired"?'<strong>'+t("Sesión vencida","Session expired")+'</strong><p>'+t("Vuelve a iniciar sesión para consultar información.","Sign in again to view information.")+'</p>':
 '<strong>'+t("Sin iniciar sesión","Signed out")+'</strong><p>'+t("Puedes probar el recorrido de una cuenta nueva.","You can try the new-account journey.")+'</p>';
 const nextStep=f.scenarioId==="signup-pending"?'<div class="fixture-onboarding"><strong>'+t("Paso 2 de 3 · Confirmación ficticia","Step 2 of 3 · Sample confirmation")+'</strong><p>'+t("Imagina que recibiste el correo de confirmación. No se envía ningún mensaje real.","Imagine you received the confirmation email. No real message is sent.")+'</p><button type="button" class="primary" data-fixture-action="confirm">'+t("Confirmar correo ficticio","Confirm sample email")+'</button></div>':
 f.scenarioId==="unlinked"?'<div class="fixture-onboarding"><strong>'+t("Paso 3 de 3 · Vincular congregación ficticia","Step 3 of 3 · Link sample congregation")+'</strong><p>'+t("La cuenta de demostración está confirmada, pero todavía no tiene una congregación vinculada.","The demo account is confirmed, but has no linked congregation yet.")+'</p><button type="button" class="primary" data-fixture-action="link">'+t("Vincular congregación de ejemplo","Link sample congregation")+'</button></div>':
 f.scenarioId==="guest"?'<div class="fixture-onboarding"><strong>'+t("Paso 1 de 3 · Crear cuenta de ejemplo","Step 1 of 3 · Create sample account")+'</strong><p>'+t("Prueba el registro sin introducir nombre, correo ni contraseña.","Try signup without entering a name, email or password.")+'</p><button type="button" class="primary" data-fixture-action="signup">'+t("Crear cuenta ficticia","Create sample account")+'</button></div>':"";
 const actions=nextStep+'<div class="fixture-actions"><button type="button" class="secondary" data-fixture-action="login">'+t("Simular ingreso","Simulate sign-in")+'</button><button type="button" class="secondary" data-fixture-action="signup">'+t("Simular registro","Simulate signup")+'</button><button type="button" class="secondary" data-fixture-action="logout">'+t("Simular salida","Simulate sign-out")+'</button></div><p class="small">'+t("Ninguna acción inicia sesión, crea cuentas o vincula congregaciones reales.","No action signs in, creates accounts or links real congregations.")+'</p>';
 const mine=source.fixturePersonalAssignments(f);
 const assignmentBody=f.agendaState!=="ready"?'<p>'+safe(stateMessage(f))+'</p>':mine.length?'<div class="fixture-list">'+mine.map(a=>itemHtml(a,{personal:true})).join("")+'</div>':'<div class="empty">'+t("No tienes asignaciones publicadas.","You have no published assignments.")+'</div>';
 $("yo").querySelector(".fixture-panel").innerHTML='<div class="kicker">'+t("ESPACIO PERSONAL · DEMOSTRACIÓN","PERSONAL SPACE · DEMO")+'</div><h1>'+t("Yo","Me")+'</h1>'+card(t("Cuenta Holoteles","Holoteles Account"),'<div class="fixture-identity">'+identity+'</div><p>'+safe(f.organization||t("Congregación no vinculada","Congregation not linked"))+'</p>'+actions)+card(t("Mis asignaciones","My assignments"),assignmentBody);
}
function bindPanels(f){
 for(const btn of document.querySelectorAll("[data-fixture-nav]"))btn.addEventListener("click",()=>{
  document.querySelector('[data-tab="'+btn.dataset.fixtureNav+'"]')?.click();
 });
 for(const btn of document.querySelectorAll("[data-fixture-filter]"))btn.addEventListener("click",()=>{filter=btn.dataset.fixtureFilter;render()});
 for(const btn of document.querySelectorAll("[data-fixture-month]"))btn.addEventListener("click",()=>{month=new Date(month.getFullYear(),month.getMonth()+Number(btn.dataset.fixtureMonth),1);selectedDate=null;render()});
 for(const btn of document.querySelectorAll("[data-fixture-day]"))btn.addEventListener("click",()=>{selectedDate=selectedDate===btn.dataset.fixtureDay?null:btn.dataset.fixtureDay;render()});
 for(const btn of document.querySelectorAll("[data-fixture-action]"))btn.addEventListener("click",()=>{
  scenario=({login:"full",signup:"signup-pending",confirm:"unlinked",link:"full",logout:"guest"})[btn.dataset.fixtureAction];extra=[];completed.clear();selectedDate=null;storeScenario();render();
 });
 for(const btn of document.querySelectorAll("[data-fixture-complete]"))btn.addEventListener("click",()=>{const id=btn.dataset.fixtureComplete;completed.has(id)?completed.delete(id):completed.add(id);render()});
}
function render(){
 if(!active()||!source)return;
 const f=fixture(),sel=$("fixtureScenario");
 sel.replaceChildren();
 for(const s of source.FIXTURE_SCENARIOS){
  const option=document.createElement("option");option.value=s.id;option.textContent=locale()==="en"?s.en:s.es;sel.append(option);
 }
 sel.value=scenario;
 $("fixtureTitle").textContent=t("Laboratorio DEV","DEV workbench");
 $("fixtureHelp").textContent=t("Escenarios ficticios, aislados y sin sincronización. No son datos de tu congregación.","Synthetic scenarios, isolated and unsynced. Not your congregation's data.");
 $("fixtureScenarioLabel").textContent=t("Escenario","Scenario");
 $("fixtureHint").textContent=locale()==="en"?source.FIXTURE_SCENARIOS.find(s=>s.id===scenario).hintEn:source.FIXTURE_SCENARIOS.find(s=>s.id===scenario).hintEs;
 $("fixtureAdd").textContent=t("Añadir actividad ficticia","Add sample activity");
 $("fixtureReset").textContent=t("Restablecer demo","Reset demo");$("fixtureAdd").disabled=f.agendaState!=="ready";$("fixtureAdd").title=f.agendaState!=="ready"?t("Disponible solo con agenda de demostración conectada","Available only with connected demo calendar"):"";
 renderBoard(f);renderAgenda(f);renderMe(f);bindPanels(f);
}
function createWorkbench(){
 const root=document.createElement("div");root.id="devWorkbench";root.className="dev-workbench";root.innerHTML='<div class="dev-workbench-head"><div><strong id="fixtureTitle"></strong><p id="fixtureHelp"></p></div><span class="fixture-chip fixture-dev-label">DEV · FIXTURES</span></div><div class="dev-workbench-controls"><label><span id="fixtureScenarioLabel"></span><select id="fixtureScenario" aria-describedby="fixtureHint"></select></label><button id="fixtureAdd" class="secondary" type="button"></button><button id="fixtureReset" class="secondary" type="button"></button></div><p class="small" id="fixtureHint" aria-live="polite"></p>';
 document.querySelector("main").prepend(root);
 for(const name of ["tablero","agenda","yo"]){const panel=document.createElement("div");panel.className="fixture-panel";$(name).prepend(panel)}
 $("fixtureScenario").addEventListener("change",e=>{scenario=e.target.value;extra=[];completed.clear();selectedDate=null;storeScenario();render()});
 $("fixtureAdd").addEventListener("click",()=>{
  if(fixture().agendaState!=="ready")return;
  const tomorrow=new Date();tomorrow.setDate(tomorrow.getDate()+1);
  const date=[tomorrow.getFullYear(),String(tomorrow.getMonth()+1).padStart(2,"0"),String(tomorrow.getDate()).padStart(2,"0")].join("-");
  extra.push({id:"demo-added-"+(++version),date,time:"17:00",category:"servicio",titleEs:"Actividad añadida en DEV",titleEn:"Activity added in DEV",placeEs:"Lugar ficticio",placeEn:"Sample location",isMine:false,status:"published"});
  month=new Date(tomorrow.getFullYear(),tomorrow.getMonth(),1);selectedDate=null;render();
 });
 $("fixtureReset").addEventListener("click",()=>{scenario="full";extra=[];completed.clear();filter="todo";selectedDate=null;month=new Date(new Date().getFullYear(),new Date().getMonth(),1);storeScenario();render()});
}
async function synchronize(){
 if(!active()){document.body.classList.remove("dev-fixture-active");$("devWorkbench")?.remove();document.querySelectorAll(".fixture-panel").forEach(x=>x.remove());return}
 if(!source){
  try{source=await import("./dev-fixtures.mjs")}catch{return}
 }
 if(!active())return;
 if(!source.FIXTURE_SCENARIOS.some(s=>s.id===scenario))scenario="full";
 if(!$("devWorkbench"))createWorkbench();
 document.body.classList.add("dev-fixture-active");
 render();
}
scenario=scenarioFromStorage();
window.addEventListener("mi-congregacion:dev-change",()=>{void synchronize()});
window.addEventListener("mi-congregacion:locale-change",()=>{if(active())render()});
void synchronize();
