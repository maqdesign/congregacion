// Offline-only fixtures for the future Core approval contract. No real invitation secrets.
export const DEMO_INVITE_CODE="DEMO-4821";
export function createDemoAccessRequest({method="direct",code=""}={}){
 if(!["direct","code","link"].includes(method))throw new TypeError("Unknown invitation method");
 if(method==="code"&&code.trim().toUpperCase()!==DEMO_INVITE_CODE)return Object.freeze({status:"invalid",grantsAccess:false});
 return Object.freeze({id:"DEMO-REQ-4821",method,reference:"MC-4821",displayName:"Publicador de ejemplo",organization:"Congregación de ejemplo",status:"pending_review",grantsAccess:false});
}
export function reviewDemoAccessRequest(request,decision){
 if(!request||request.status!=="pending_review"||!["approve","reject"].includes(decision))throw new TypeError("Request cannot be reviewed");
 return Object.freeze({...request,status:decision==="approve"?"approved":"rejected",grantsAccess:decision==="approve"});
}
