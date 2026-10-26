import test from "node:test";
import assert from "node:assert/strict";
import {resolveNormalAccess,createNormalAccessController} from "../app/core-normal-access.mjs";
test("all five server conditions are necessary",()=>{
 const all={identityVerified:true,sessionActive:true,membershipActive:true,scopeGranted:true,consentActive:true};
 assert.equal(resolveNormalAccess(all).privateVisible,true);
 for(const key of Object.keys(all))assert.equal(resolveNormalAccess({...all,[key]:false}).privateVisible,false,key);
});
test("string truthy claims are rejected",()=>assert.equal(resolveNormalAccess({identityVerified:"true",sessionActive:true,membershipActive:true,scopeGranted:true,consentActive:true}).privateVisible,false));
test("late response cannot unlock after revocation",async()=>{
 let done;const log=[];const ctl=createNormalAccessController({lock:()=>log.push("lock"),unlock:()=>log.push("unlock"),clearPrivate:()=>log.push("purge"),abortPending:()=>log.push("abort")});
 const pending=ctl.evaluate(()=>new Promise(resolve=>done=resolve));
 ctl.revoke();done({identityVerified:true,sessionActive:true,membershipActive:true,scopeGranted:true,consentActive:true});
 assert.equal(await pending,false);assert.equal(log.includes("unlock"),false);
});
test("errors remain locked",async()=>{
 let unlocks=0;const ctl=createNormalAccessController({lock:()=>{},unlock:()=>unlocks++,clearPrivate:()=>{},abortPending:()=>{}});
 assert.equal(await ctl.evaluate(async()=>{throw Error("offline")}),false);assert.equal(unlocks,0);
});
