import {HOLOTELES_AUTH_CONFIG as config} from "./holoteles-auth-config.mjs";
import {createHolotelesAccountAdapter} from "./holoteles-account-adapter.mjs";
const $=id=>document.getElementById(id);
let adapter=null,activeMode="login",busy=false;
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
async function initializeAuth(){
 if(adapter||!configAllowed())return;
 try{
  const {createClient}=await import("https://esm.sh/@supabase/supabase-js@2.90.0");
  const client=createClient(config.supabaseUrl,config.publishableKey,{
   auth:{autoRefreshToken:true,persistSession:true,detectSessionInUrl:true,flowType:"pkce",
    storageKey:"mi-congregacion-holoteles-auth"}
  });
  adapter=createHolotelesAccountAdapter(client);
  $("accountForm").hidden=false;
  $("accountDialog").querySelector(".auth-status").hidden=true;
  try{
   const user=await adapter.getVerifiedUser();
   if(user)showVerified(user);
  }catch{showStatus(safeMessage("pending"))}
 }catch{showStatus(safeMessage("error"))}
}
function showVerified(user){
 $("accountForm").hidden=true;
 $("connectedAccount").hidden=false;
 $("verifiedEmail").textContent=user.email||"";
 showStatus(safeMessage("signedIn"));
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
   const user=await adapter.signIn({email,password});
   showVerified(user);
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
 busy=true;try{await adapter.signOut();$("connectedAccount").hidden=true;$("accountForm").hidden=false;$("verifiedEmail").textContent="";showStatus("")}
 catch{showStatus(safeMessage("error"))}
 finally{busy=false}
});
showMode("login");
void initializeAuth();
