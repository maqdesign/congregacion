// Presentation-only gate. The server remains the sole authorization authority.
// No fixtures, local flags, email or Auth getUser() result grant private access.
export function resolveNormalAccess({identityVerified=false,sessionActive=false,membershipActive=false,scopeGranted=false,consentActive=false}={}){
 const allowed=[identityVerified,sessionActive,membershipActive,scopeGranted,consentActive].every(v=>v===true);
 return Object.freeze({privateVisible:allowed,canReadAgenda:allowed,status:allowed?"authorized":"restricted"});
}
export function createNormalAccessController({lock,unlock,clearPrivate,abortPending}={}){
 if([lock,unlock,clearPrivate,abortPending].some(fn=>typeof fn!=="function"))throw new TypeError("All callbacks required");
 let generation=0;
 const revoke=()=>{
  generation++;
  abortPending();
  clearPrivate();
  lock();
 };
 const evaluate=async getServerDecision=>{
  const token=++generation;
  // Lock before any asynchronous authorization check; outdated results never unlock.
  abortPending();clearPrivate();lock();
  try{
   const decision=await getServerDecision();
   if(token!==generation)return false;
   const access=resolveNormalAccess(decision);
   if(access.privateVisible){unlock();return true}
  }catch{/* fail closed */}
  return false;
 };
 return Object.freeze({evaluate,revoke});
}
