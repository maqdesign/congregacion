// Standalone, synthetic-only membership UX. Not wired to Auth, RPC, or production UI.
const STATES=Object.freeze({
 unlinked:{title:"Vincula tu congregación",description:"Tu cuenta está lista. Para ver información de una congregación, primero necesitas una vinculación aprobada.",action:"Solicitar vinculación"},
 pending_review:{title:"Solicitud enviada",description:"Tu solicitud está pendiente de revisión por una persona autorizada.",action:null},
 person_verification_required:{title:"Falta verificar tu identidad",description:"Un responsable autorizado debe confirmar tu vínculo con el registro de la congregación antes de solicitar acceso.",action:null},
 permission_limited:{title:"Agenda sin permiso",description:"La vinculación de demostración existe, pero no incluye permiso para consultar la agenda.",action:null},
 rejected:{title:"Solicitud no aprobada",description:"No se concedió acceso a la congregación. Consulta con un responsable autorizado si necesitas ayuda.",action:null},
 revoked:{title:"Acceso retirado",description:"Tu vinculación ya no está activa. La información privada permanece protegida.",action:null},
 approved:{title:"Vinculación aprobada",description:"La solicitud fue aprobada. El acceso a cada sección sigue dependiendo de permisos verificados.",action:null},
 unavailable:{title:"No pudimos consultar el estado",description:"Inténtalo más tarde. No se ha concedido acceso ni se ha enviado una solicitud.",action:null}
});
const escapeHTML=value=>String(value).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
export const DEMO_MEMBERSHIP_STATES=Object.freeze(Object.keys(STATES));
export function getDemoMembershipView(status){
 const found=Object.prototype.hasOwnProperty.call(STATES,status);
 const state=found?status:"unavailable";
 return Object.freeze({state,...STATES[state],synthetic:true,authorized:false,mayRequest:false});
}
export function renderDemoMembershipCard(status){
 const model=getDemoMembershipView(status);
 // The action is explanatory and intentionally disabled: no request submission is permitted.
 return `<section class="dev-membership-card" aria-label="Estado de membresía de demostración" data-demo-membership="${escapeHTML(model.state)}"><p class="dev-membership-tag">DEV · Ejemplo ficticio · Sin conexión real</p><h2>${escapeHTML(model.title)}</h2><p>${escapeHTML(model.description)}</p>${model.action?`<button type="button" disabled aria-disabled="true" title="Solo demostración">${escapeHTML(model.action)} (demostración)</button>`:""}<p role="status">Esto es una simulación. No modifica tu cuenta ni concede permisos.</p></section>`;
}
