// Read-only identity/membership diagnostic. NEVER grants access to an agenda.
const authority="https://hghpliyjctmctjgrrbcs.supabase.co";
const publicKey="sb_publishable_Ii3Stg7gugiXkuELmXAeiQ__ZkImURs";
const response=(status,body)=>new Response(JSON.stringify(body),{status,headers:{"content-type":"application/json; charset=utf-8","cache-control":"no-store, private","x-content-type-options":"nosniff"}});
export async function handleMembershipStatus(request,{fetcher=fetch}={}){
 if(request.method!=="GET")return response(405,{state:"unavailable"});
 const token=request.headers.get("authorization")?.match(/^Bearer ([A-Za-z0-9_\-.]+)$/)?.[1];
 if(!token||token.length>8192)return response(401,{state:"signed_out"});
 try{
  const headers={apikey:publicKey,authorization:"Bearer "+token};
  const auth=await fetcher(authority+"/auth/v1/user",{headers,cache:"no-store"});
  if(!auth.ok)return response(401,{state:"signed_out"});
  const user=await auth.json();
  if(typeof user.id!=="string"||!user.id)return response(401,{state:"signed_out"});
  const url=new URL(authority+"/rest/v1/holoteles_organization_memberships");
  url.searchParams.set("select","status");
  url.searchParams.set("user_id","eq."+user.id);
  url.searchParams.set("primary_membership","eq.true");
  url.searchParams.set("limit","2");
  const result=await fetcher(url,{headers,cache:"no-store"});
  if(!result.ok)return response(503,{state:"unavailable"});
  const rows=await result.json();
  if(!Array.isArray(rows)||rows.length>1)return response(503,{state:"unavailable"});
  return response(200,{state:rows.length===1&&rows[0]?.status==="active"?"membership_found":"not_linked",privateAccess:false});
 }catch{return response(503,{state:"unavailable"})}
}
export default async function handler(req,res){
 const origin="https://congregacion.holoteles.app";
 const url=new URL(req.url,origin);
 if(url.pathname!=="/api/dev/membership-status"){res.status(404).json({state:"unavailable"});return}
 const out=await handleMembershipStatus(new Request(url,{method:req.method,headers:req.headers}));
 res.status(out.status);
 for(const [k,v]of out.headers)res.setHeader(k,v);
 res.send(await out.text());
}
