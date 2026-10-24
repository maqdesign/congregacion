import test from 'node:test';
import assert from 'node:assert/strict';
import {projectOwnAssignments,PrivateAssignmentsError} from '../src/integrations/own-assignments.mjs';
const now=Date.parse('2026-10-23T20:00:00Z');
const context={authenticated:true,membership:{organizationId:'org-a',status:'active'},verifiedPersonId:'person-a'};
const row={id:'a1',organizationId:'org-a',personId:'person-a',category:'asignaciones',sourceApp:'reuniones',publicationStatus:'published',classification:'non_confidential',personalDelivery:true,deliveredByAuthorizedEndpoint:true,publishedAt:'2026-10-23T10:00:00Z',date:'2026-10-28',time:'19:00',title:'Mi asignación',secret:'should not leak'};
const envelope={schemaVersion:1,organizationId:'org-a',personId:'person-a',generatedAt:'2026-10-23T19:59:00Z',expiresAt:'2026-10-23T20:01:00Z',activities:[row]};
const args={context,envelope,from:'2026-10-01',to:'2026-10-31',now};
const code=(args,expected)=>assert.throws(()=>projectOwnAssignments(args),e=>e instanceof PrivateAssignmentsError&&e.code===expected);
test('only own minimal fields are projected, sorted, no secret metadata',()=>{
 const r=projectOwnAssignments(args); assert.equal(r.items.length,1);
 assert.equal(r.items[0].isMine,true);assert.equal('secret' in r.items[0],false);
});
test('inactive session and unverified person denied',()=>{
 code({...args,context:{...context,verifiedPersonId:null}},'not-authorized');
 code({...args,context:{...context,membership:{...context.membership,status:'revoked'}}},'not-authorized');
});
test('other org/person rejected at envelope and row level',()=>{
 code({...args,envelope:{...envelope,organizationId:'org-b'}},'invalid-envelope');
 code({...args,envelope:{...envelope,activities:[{...row,personId:'person-b'}]}},'invalid-records');
});
test('drafts, duplicates, expired or invalid date are rejected',()=>{
 code({...args,envelope:{...envelope,activities:[{...row,publicationStatus:'draft'}]}},'invalid-records');
 code({...args,envelope:{...envelope,activities:[row,row]}},'invalid-records');
 code({...args,envelope:{...envelope,expiresAt:'2026-10-23T19:00:00Z'}},'stale');
 code({...args,envelope:{...envelope,activities:[{...row,date:'2026-02-30'}]}},'invalid-records');
});
test('outside requested window, future publications and missing time rejected',()=>{
 code({...args,envelope:{...envelope,activities:[{...row,date:'2026-11-01'}]}},'invalid-records');
 code({...args,envelope:{...envelope,activities:[{...row,publishedAt:'2027-01-01T00:00:00Z'}]}},'invalid-records');
 code({...args,envelope:{...envelope,activities:[{...row,time:undefined}]}},'invalid-records');
});
