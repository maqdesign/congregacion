/** Real membership request adapter using existing Holoteles RPC.
 * No auto-approval, no name/email matching, no fixture writes.
 * UI must call request() only after explicit user confirmation.
 */
const uuid=x=>typeof x==="string"&&/^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(x);
export function createMembershipRequestAdapter(client){
 if(!client?.auth?.getUser||!client?.rpc)throw new TypeError("Verified Holoteles client required");
 return Object.freeze({
  async readiness(){
   const {data:auth,error:authError}=await client.auth.getUser();
   if(authError||!auth?.user?.id)return Object.freeze({state:"signed_out"});
   const {data:person,error}=await client.rpc("holoteles_current_person_id");
   if(error)return Object.freeze({state:"unavailable"});
   return Object.freeze({state:uuid(person)?"ready":"person_verification_required"});
  },
  async request({organizationId,idempotencyKey}={}){
   if(!uuid(organizationId)||typeof idempotencyKey!=="string"||!/^[-a-zA-Z0-9_]{8,96}$/.test(idempotencyKey))throw new TypeError("Organization and stable idempotency key required");
   const preflight=await this.readiness();
   if(preflight.state!=="ready")return Object.freeze(preflight);
   const {data,error}=await client.rpc("holoteles_request_membership",{
    p_organization_id:organizationId,p_requested_role:"publisher",p_idempotency_key:idempotencyKey
   });
   if(error)throw new Error("membership_request_failed");
   if(!uuid(data))throw new Error("invalid_membership_request");
   return Object.freeze({state:"submitted",requestId:data,privateAccess:false});
  }
 });
}
