// Standalone, synthetic-only membership UX. Not wired to Auth, RPC, or production UI.
const STATES=Object.freeze({
 unlinked:{title:"Vincula tu congregación",description:"Para ver información de una congregación necesitas una Cuenta Holoteles y una vinculación aprobada.",action:"Solicitar vinculación"},
 pending_review:{title:"Solicitud enviada",description:"Tu solicitud está pendiente de revisión por una persona autorizada.",action:null},
 person_verification_required:{title:"Falta verificar tu identidad",description:"Un responsable autorizado debe confirmar tu vínculo con el registro de la congregación antes de solicitar acceso.",action:null},
 permission_limited:{title:"Agenda sin permiso",description:"La vinculación de demostración existe, pero no incluye permiso para consultar la agenda.",action:null},
 rejected:{title:"Solicitud no aprobada",description:"No se concedió acceso a la congregación. Consulta con un responsable autorizado si necesitas ayuda.",action:null},
 revoked:{title:"Acceso retirado",description:"Tu vinculación ya no está activa. La información privada permanece protegida.",action:null},
 approved:{title:"Vinculación aprobada",description:"La solicitud fue aprobada. El acceso a cada sección sigue dependiendo de permisos verificados.",action:null},
 unavailable:{title:"No pudimos consultar el estado",description:"Inténtalo más tarde. No se ha concedido acceso ni se ha enviado una solicitud.",action:null}
});
const EN_STATES=Object.freeze({
 unlinked:{title:"Link your congregation",description:"To view congregation information you need a Holoteles Account and approved membership.",action:"Request membership"},
 pending_review:{title:"Request submitted",description:"An authorized reviewer still needs to review your request.",action:null},
 person_verification_required:{title:"Identity verification required",description:"An authorized reviewer must confirm your connection to the congregation record before you request access.",action:null},
 permission_limited:{title:"No calendar permission",description:"Sample membership exists, but it does not include permission to read the calendar.",action:null},
 rejected:{title:"Request not approved",description:"Access was not granted. Contact an authorized reviewer if you need help.",action:null},
 revoked:{title:"Access withdrawn",description:"Your membership is no longer active. Private information remains protected.",action:null},
 approved:{title:"Membership approved",description:"The request was approved. Each section still requires verified permissions.",action:null},
 unavailable:{title:"Status unavailable",description:"Try again later. No access was granted and no request was submitted.",action:null}
});
const escapeHTML=value=>String(value).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
export const DEMO_MEMBERSHIP_STATES=Object.freeze(Object.keys(STATES));
export function getDemoMembershipView(status,locale="es"){
 const found=Object.prototype.hasOwnProperty.call(STATES,status);
 const state=found?status:"unavailable";
 return Object.freeze({state,...(locale==="en"?EN_STATES[state]:STATES[state]),synthetic:true,authorized:false,mayRequest:false});
}
export function renderDemoMembershipCard(status,locale="es"){
 const model=getDemoMembershipView(status,locale),en=locale==="en";
 // The action is explanatory and intentionally disabled: no request submission is permitted.
 return `<section class="dev-membership-card" aria-label="${en?"Sample membership state":"Estado de membresía de demostración"}" data-demo-membership="${escapeHTML(model.state)}"><p class="dev-membership-tag">${en?"DEV · Sample data · No real connection":"DEV · Ejemplo ficticio · Sin conexión real"}</p><h2>${escapeHTML(model.title)}</h2><p>${escapeHTML(model.description)}</p>${model.action?`<button type="button" disabled aria-disabled="true" title="${en?"Demonstration only":"Solo demostración"}">${escapeHTML(model.action)} (${en?"demo":"demostración"})</button>`:""}<p role="status">${en?"This is a simulation. It does not change your account or grant permissions.":"Esto es una simulación. No modifica tu cuenta ni concede permisos."}</p></section>`;
}
