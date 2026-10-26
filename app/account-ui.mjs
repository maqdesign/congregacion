import {HOLOTELES_AUTH_CONFIG as config} from "./holoteles-auth-config.mjs";
import {createHolotelesAccountAdapter} from "./holoteles-account-adapter.mjs";
import {createAccountPrivacyGate} from "./account-privacy-gate.mjs";
const $=id=>document.getElementById(id);
let adapter=null,activeMode="login",busy=false,generation=0,gate=null;
const safeMessage=(key)=>document.documentElement.lang==="en"?({
 pending:"Holoteles Core has not enabled sign-in for this app yet.",
 loading:"Connecting to Holoteles…",
 signedIn:"Your Holoteles identity was verified. Congregation permissions are not connected yet.",
 confirm:"Check your email if account confirmation is required.",
 recovered:"If this account exists, recovery instructions have been requested.",
 error:"The account request could not be completed. Please try again.",
 missing:"Complete the required fields.",
}[key]):({
 pending:"Holoteles Core todavía no ha habilitado el acceso para esta app.",
 loading:"Conectando con Holoteles…",
 signedIn:"Tu identidad Holoteles fue verificada. Los permisos de congregación aún no están conectados.",
 confirm:"Revisa tu correo si se requiere confirmar la cuenta.",
 recovered:"Si existe esta cuenta, se han solicitado instrucciones de recuperación.",
 error:"No se pudo completar la solicitud. Inténtalo nuevamente.",
 missing:"Completa los campos requeridos.",
}[key]);
function showStatus(text){$("accountFormStatus").textContent=text}
function devAllowed(){try{return sessionStorage.getItem("mi-congregacion-dev-ui-v1")==="1"}catch{return false}}
function configAllowed(){
 if(!config.enabled||!config.supabaseUrl||!config.publishableKey)return false;
 if(!/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/.test(config.supabaseUrl))return false;
 // Explicitly isolate the fixture sandbox from a real identity flow.
 const authTest=new URLSearchParams(location.search).get("authTest")==="1";
 return devAllowed()?authTest:config.allowProduction===true;
}
function openAccess(mode){
 showMode(mode);
 $("accountDialog").showModal();
}
function hideAccountData(){
 $("connectedAccount").hidden=true;
 $("accountForm").hidden=false;
 $("verifiedEmail").textContent="";
 $("authPassword").value="";
 $("authEmail").value="";
 $("givenName").value="";
 $("familyName").value="";
}
function lockAccount(message=""){
 generation++;
 hideAccountData();
 gate?.lock();
 if(message)gate?.notice(message);
}
async function refreshVerified(){
 const current=++generation;
 try{
  const user=await adapter.getVerifiedUser();
  if(current!==generation)return;
  if(user)await showVerified(user);
  else lockAccount();
 }catch{
  if(current===generation)lockAccount();
 }
}
async function initializeAuth(){
 if(adapter||!configAllowed())return;
 if(!gate){gate=createAccountPrivacyGate(document,{onLogin:()=>openAccess("login"),onSignup:()=>openAccess("signup")});lockAccount()}
 try{
  const {createClient}=await import("https://esm.sh/@supabase/supabase-js@2.90.0");
  const client=createClient(config.supabaseUrl,config.publishableKey,{
   auth:{autoRefreshToken:true,persistSession:true,detectSessionInUrl:true,flowType:"pkce",
    storageKey:"mi-congregacion-holoteles-auth"}
  });
  adapter=createHolotelesAccountAdapter(client);
  $("accountForm").hidden=false;
  $("accountDialog").querySelector(".auth-status").hidden=true;
  client.auth.onAuthStateChange?.((event)=>{
   if(event==="SIGNED_OUT"||event==="USER_DELETED")lockAccount();
   else if(event==="SIGNED_IN"||event==="TOKEN_REFRESHED")void refreshVerified();
  });
  await refreshVerified();
 }catch{showStatus(safeMessage("error"))}
}
async function showVerified(user){
 // Identity alone cannot unlock. A same-origin Core server must decide.
 lockAccount();
 const ticket=generation;
 if(devAllowed()||!configAllowed())return;
 try{
  const response=await fetch("/api/congregation/access",{method:"GET",credentials:"same-origin",cache:"no-store",headers:{"accept":"application/json"}});
  if(ticket!==generation||devAllowed()||!configAllowed())return;
  if(!response.ok)return;
  const result=await response.json();
  if(ticket!==generation||devAllowed()||!configAllowed())return;
  if(result?.authorized===true&&result.identityVerified===true&&result.sessionActive===true&&result.membershipActive===true&&result.scopeGranted===true&&result.consentActive===true){
   gate?.unlock();
   $("accountForm").hidden=true;
   $("connectedAccount").hidden=false;
   $("verifiedEmail").textContent=user.email||"";
   showStatus(safeMessage("signedIn"));
  }
 }catch{/* Keep application locked when Core is unavailable. */}
}
function showMode(mode){
 activeMode=mode;
 $("accountNames").hidden=mode!=="signup";
 $("authPassword").autocomplete=mode==="signup"?"new-password":"current-password";
 $("submitAccount").textContent=mode==="signup"?(document.documentElement.lang==="en"?"Create account":"Crear cuenta"):(document.documentElement.lang==="en"?"Sign in":"Entrar");
}
document.querySelectorAll("[data-auth-view]").forEach(b=>b.addEventListener("click",()=>showMode(b.dataset.authView)));
$("accountDialog").addEventListener("close",()=>{$("authPassword").value="";showStatus("")});
$("devModeToggle").addEventListener("change",()=>{void initializeAuth()});
$("accountForm").addEventListener("submit",async event=>{
 event.preventDefault();if(!adapter||busy)return;
 busy=true;$("submitAccount").disabled=true;showStatus(safeMessage("loading"));
 try{
  const email=$("authEmail").value,password=$("authPassword").value;
  if(activeMode==="signup"){
   await adapter.signUp({email,password,givenName:$("givenName").value,familyName:$("familyName").value,redirectTo:location.origin});
   showStatus(safeMessage("confirm"));
  }else{
   const current=++generation;
   const user=await adapter.signIn({email,password});
   if(current===generation)await showVerified(user);
  }
 }catch{showStatus(safeMessage("error"))}
 finally{$("authPassword").value="";busy=false;$("submitAccount").disabled=false}
});
$("recoverAccount").addEventListener("click",async()=>{
 if(!adapter||busy)return;
 busy=true;try{await adapter.recover({email:$("authEmail").value,redirectTo:location.origin});showStatus(safeMessage("recovered"))}
 catch{showStatus(safeMessage("error"))}
 finally{busy=false}
});
$("signOutAccount").addEventListener("click",async()=>{
 if(!adapter||busy)return;
 busy=true;lockAccount();
 try{await adapter.signOut();showStatus("");}
 catch{gate?.notice(document.documentElement.lang==="en"?"Sign-out could not be confirmed. Please try again.":"No se pudo confirmar el cierre de sesión. Inténtalo de nuevo.");}
 finally{busy=false}
});
showMode("login");
void initializeAuth();
