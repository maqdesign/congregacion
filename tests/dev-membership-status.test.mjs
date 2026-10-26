import test from "node:test";
import assert from "node:assert/strict";
import {handleMembershipStatus} from "../app/api/dev/membership-status.mjs";
const request=(token)=>new Request("https://congregacion.holoteles.app/api/dev/membership-status",{headers:token?{authorization:"Bearer "+token}:{}});
const respond=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:{"content-type":"application/json"}});
test("no bearer fails closed",async()=>assert.equal((await handleMembershipStatus(request(),{fetcher:async()=>{throw Error("unexpected network")}})).status,401));
test("signed JWT must be verified by Supabase authority",async()=>{
 const result=await handleMembershipStatus(request("synthetic.token.signature"),{fetcher:async()=>respond({},401)});
 assert.equal(result.status,401);assert.equal((await result.json()).state,"signed_out");
});
test("verified unlinked user receives minimal diagnostic, never permissions",async()=>{
 const responses=[respond({id:"user-1"}),respond([])];
 const result=await handleMembershipStatus(request("synthetic.token.signature"),{fetcher:async()=>responses.shift()});
 const body=await result.json();assert.equal(result.status,200);assert.deepEqual(body,{state:"not_linked",privateAccess:false});
 assert.match(result.headers.get("cache-control"),/no-store/);
});
test("linked user still never gets permission grant",async()=>{
 const responses=[respond({id:"user-1"}),respond([{status:"active"}])];
 const result=await handleMembershipStatus(request("synthetic.token.signature"),{fetcher:async()=>responses.shift()});
 assert.deepEqual(await result.json(),{state:"membership_found",privateAccess:false});
});
test("database outage does not claim absence of membership",async()=>{
 const responses=[respond({id:"user-1"}),respond({},503)];
 const result=await handleMembershipStatus(request("synthetic.token.signature"),{fetcher:async()=>responses.shift()});
 assert.equal(result.status,503);
});
