import test from 'node:test';
import assert from 'node:assert/strict';
import {createMembershipRequestAdapter} from '../app/holoteles-membership-request.mjs';
const org='11111111-1111-4111-8111-111111111111',person='22222222-2222-4222-8222-222222222222',requestId='33333333-3333-4333-8333-333333333333';
test('no account means no request',async()=>{
 let writes=0;const a=createMembershipRequestAdapter({auth:{getUser:async()=>({data:{user:null}})},rpc:async()=>{writes++;return {}}});
 assert.deepEqual(await a.request({organizationId:org,idempotencyKey:'test-req-0001'}),{state:'signed_out'});assert.equal(writes,0);
});
test('person link missing fails closed',async()=>{
 let calls=[];const a=createMembershipRequestAdapter({auth:{getUser:async()=>({data:{user:{id:org}}})},rpc:async(name)=>{calls.push(name);return {data:null}}});
 assert.equal((await a.request({organizationId:org,idempotencyKey:'test-req-0002'})).state,'person_verification_required');
 assert.deepEqual(calls,['holoteles_current_person_id']);
});
test('ready user submits publisher request, never grants membership',async()=>{
 let calls=[];const a=createMembershipRequestAdapter({auth:{getUser:async()=>({data:{user:{id:org}}})},rpc:async(name,args)=>{calls.push([name,args]);return {data:name==='holoteles_current_person_id'?person:requestId}}});
 assert.deepEqual(await a.request({organizationId:org,idempotencyKey:'test-req-0003'}),{state:'submitted',requestId,privateAccess:false});
 assert.equal(calls[1][0],'holoteles_request_membership');assert.equal(calls[1][1].p_requested_role,'publisher');
});
test('invalid org and idempotency blocked before RPC',async()=>{
 const a=createMembershipRequestAdapter({auth:{getUser:async()=>({data:{user:{id:org}}})},rpc:async()=>{throw Error('should not run')}});
 await assert.rejects(()=>a.request({organizationId:'bad',idempotencyKey:'weak'}),TypeError);
});
