// Privacy boundary for the future approved Holoteles Auth flow.
// Lock before displaying any account-scoped content; never use the DEV fixture state as identity.
export function createAccountPrivacyGate(doc,{onLogin,onSignup}={}){
 if(!doc?.body||typeof onLogin!=="function"||typeof onSignup!=="function")throw new TypeError("Privacy gate requires document and access actions");
 const gate=doc.createElement("section");
 gate.id="accountAccessPage";
 gate.className="account-access-page";
 gate.setAttribute("aria-labelledby","accountAccessTitle");
 gate.hidden=true;
 gate.innerHTML='<div class="account-access-card"><img src="/brand-logo-dark.svg" alt="" width="170" height="68"><p class="kicker" data-access="eyebrow">ACCESO A TU ESPACIO</p><h1 id="accountAccessTitle" data-access="title">Bienvenido a Mi Congregación</h1><p data-access="detail">Inicia sesión o crea una Cuenta Holoteles para acceder a tu información.</p><div class="account-access-actions"><button type="button" class="primary" id="accessLogin" data-access="login">Iniciar sesión</button><button type="button" class="secondary" id="accessSignup" data-access="signup">Crear cuenta</button></div><p class="small" id="accountAccessNotice" role="status" aria-live="polite"></p></div>';
 doc.body.prepend(gate);
 const notice=gate.querySelector("#accountAccessNotice");
 const translate=()=>{
  const en=doc.documentElement.lang==="en";
  const strings=en?{eyebrow:"YOUR SPACE · SIGN IN",title:"Welcome to My Congregation",detail:"Sign in or create a Holoteles Account to access your information.",login:"Sign in",signup:"Create account"}:{eyebrow:"ACCESO A TU ESPACIO",title:"Bienvenido a Mi Congregación",detail:"Inicia sesión o crea una Cuenta Holoteles para acceder a tu información.",login:"Iniciar sesión",signup:"Crear cuenta"};
  for(const [key,value] of Object.entries(strings))gate.querySelector('[data-access="'+key+'"]').textContent=value;
 };
 gate.querySelector("#accessLogin").addEventListener("click",onLogin);
 gate.querySelector("#accessSignup").addEventListener("click",onSignup);
 const lock=()=>{
  // Only explicitly marked private data containers may hold account data.
  // Integrations must abort pending requests on the auth-locked event and clear their own stores.
  doc.body.classList.add("auth-locked");
  for(const element of doc.querySelectorAll("[data-private-content]"))element.replaceChildren();
  for(const dialog of doc.querySelectorAll("dialog[open]"))dialog.close();
  gate.hidden=false;
  translate();
  doc.defaultView?.dispatchEvent(new Event("mi-congregacion:auth-locked"));
 };
 const unlock=()=>{
  notice.textContent="";
  gate.hidden=true;
  doc.body.classList.remove("auth-locked");
  doc.defaultView?.dispatchEvent(new Event("mi-congregacion:auth-unlocked"));
 };
 doc.defaultView?.addEventListener("mi-congregacion:locale-change",translate);
 return Object.freeze({lock,unlock,notice(message){notice.textContent=message},isLocked(){return !gate.hidden}});
}
