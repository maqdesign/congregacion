import test from "node:test";
import assert from "node:assert/strict";
import {createHolotelesAccountAdapter} from "../app/holoteles-account-adapter.mjs";
const calls=[];
const client={auth:{
 signInWithPassword:async x=>{calls.push(["login",x]);return {data:{},error:null}},
 signUp:async x=>{calls.push(["signup",x]);return {data:{session:null},error:null}},
 getUser:async()=>({data:{user:{id:"verified-user-1",email:"verified@example.test"}},error:null}),
 resetPasswordForEmail:async(...x)=>{calls.push(["recover",x]);return {data:{},error:null}},
 signOut:async()=>({data:{},error:null})
}};
test("verified login does not return session tokens or infer congregation access",async()=>{
 const a=createHolotelesAccountAdapter(client);
 assert.deepEqual(await a.signIn({email:" verified@example.test ",password:"correct-password"}),{id:"verified-user-1",email:"verified@example.test"});
 assert.equal(calls.at(-1)[1].email,"verified@example.test");
 assert.ok(!("access_token" in (await a.getVerifiedUser())));
});
test("signup requires names and exact HTTPS redirect and does not auto-grant permissions",async()=>{
 const a=createHolotelesAccountAdapter(client);
 await assert.rejects(a.signUp({email:"a@b.test",password:"12345678",givenName:"A",familyName:"B",redirectTo:"http://localhost:3000"}));
 assert.deepEqual(await a.signUp({email:"a@b.test",password:"12345678",givenName:"A",familyName:"B",redirectTo:"https://congregacion.holoteles.app"}),{confirmationRequired:true});
 assert.deepEqual(calls.at(-1)[1].options.data,{given_name:"A",family_name:"B",display_name:"A B"});
});
test("invalid credentials never call provider",async()=>{
 const a=createHolotelesAccountAdapter(client),n=calls.length;
 await assert.rejects(a.signIn({email:"bad",password:"12345678"}));
 await assert.rejects(a.signIn({email:"a@b.test",password:"short"}));
 assert.equal(calls.length,n);
});
test("adapter fails closed without canonical client",()=>assert.throws(()=>createHolotelesAccountAdapter({}),/client required/));
