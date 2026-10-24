/**
 * Thin adapter for the SAME Holoteles Auth authority used by Core.
 * The caller must supply a configured @supabase/supabase-js client.
 * No tokens/passwords are copied to app storage and no congregation permissions are inferred.
 */
export function createHolotelesAccountAdapter(client){
 if(!client?.auth?.signInWithPassword||!client.auth.signUp||!client.auth.getUser||!client.auth.signOut)throw new TypeError("Holoteles Auth client required");
 const emailOf=email=>{
  if(typeof email!=="string"||email.length>254||!/^\S+@\S+\.\S+$/.test(email.trim()))throw new TypeError("Valid email required");
  return email.trim();
 };
 const passwordOf=password=>{
  if(typeof password!=="string"||password.length<8||password.length>256)throw new TypeError("Password must have 8–256 characters");
  return password;
 };
 const fail=async promise=>{const {data,error}=await promise;if(error)throw error;return data};
 return Object.freeze({
  async signIn({email,password}){
   await fail(client.auth.signInWithPassword({email:emailOf(email),password:passwordOf(password)}));
   // A local cached session alone is NOT identity proof; ask the canonical authority.
   const {user}=await fail(client.auth.getUser());
   if(!user?.id)throw new Error("Holoteles identity could not be verified");
   return {id:user.id,email:user.email??null};
  },
  async signUp({email,password,givenName,familyName,redirectTo}){
   if(typeof givenName!=="string"||!givenName.trim()||typeof familyName!=="string"||!familyName.trim())throw new TypeError("First and family names required");
   if(typeof redirectTo!=="string"||!/^https:\/\/[^/?#]+\/?$/.test(redirectTo))throw new TypeError("Exact HTTPS redirect origin required");
   const data=await fail(client.auth.signUp({email:emailOf(email),password:passwordOf(password),options:{emailRedirectTo:redirectTo,data:{given_name:givenName.trim(),family_name:familyName.trim(),display_name:[givenName.trim(),familyName.trim()].join(" ")}}}));
   return {confirmationRequired:!data?.session};
  },
  async recover({email,redirectTo}){
   if(typeof redirectTo!=="string"||!/^https:\/\/[^/?#]+\/?$/.test(redirectTo))throw new TypeError("Exact HTTPS redirect origin required");
   await fail(client.auth.resetPasswordForEmail(emailOf(email),{redirectTo}));
   return {requested:true};
  },
  async getVerifiedUser(){
   const {user}=await fail(client.auth.getUser());
   return user?.id?{id:user.id,email:user.email??null}:null;
  },
  async signOut(){await fail(client.auth.signOut());return {signedOut:true}}
 });
}
