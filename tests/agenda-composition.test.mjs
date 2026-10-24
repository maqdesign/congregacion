import test from 'node:test';
import assert from 'node:assert/strict';
import {composeAgendaPresentation} from '../src/ui/agenda-composition.mjs';
const now=Date.parse('2026-10-23T20:00:00Z');
const context={authenticated:true,membership:{status:'active',organizationId:'org-a'},verifiedPersonId:'person-a'};
const base={organizationId:'org-a',publicationStatus:'published',classification:'non_confidential',deliveredByAuthorizedEndpoint:true,publishedAt:'2026-10-23T10:00:00Z'};
const pub={schemaVersion:1,organizationId:'org-a',state:'published',timeZone:'America/Santo_Domingo',generatedAt:'2026-10-23T19:59:00Z',expiresAt:'2026-10-23T20:01:00Z',schedules:[],exceptions:[],activities:[{...base,id:'s1',sourceApp:'servicio',category:'servicio',date:'2026-10-28',time:'09:00',title:'Salida'}]};
const own={schemaVersion:1,organizationId:'org-a',personId:'person-a',generatedAt:'2026-10-23T19:59:00Z',expiresAt:'2026-10-23T20:01:00Z',activities:[{...base,id:'a1',sourceApp:'reuniones',category:'asignaciones',personId:'person-a',personalDelivery:true,date:'2026-10-28',time:'19:00',title:'Mi parte'}]};
const args={context,publicEnvelope:pub,privateEnvelope:own,from:'2026-10-01',to:'2026-10-31',now};
test('combines independently validated feeds without duplicating assignments',()=>{
 const v=composeAgendaPresentation(args);assert.equal(v.status,'ready');assert.equal(v.partial,false);
 assert.deepEqual(v.events.map(x=>x.id),['s1','a1']);
});
test('public-only is marked partial, never claims private list is empty',()=>{
 const v=composeAgendaPresentation({...args,privateEnvelope:null});
 assert.equal(v.status,'ready');assert.equal(v.partial,true);assert.equal(v.privateStatus,'unavailable');
 assert.deepEqual(v.events.map(x=>x.id),['s1']);
 const mine=composeAgendaPresentation({...args,privateEnvelope:null,filter:'mis_asignaciones'});
 assert.equal(mine.status,'unavailable');assert.equal(mine.events.length,0);
});
test('private assignments are never shown on invalid org or person',()=>{
 const v=composeAgendaPresentation({...args,privateEnvelope:{...own,personId:'person-b'}});
 assert.equal(v.privateStatus,'unavailable');assert.equal(v.partial,true);
 assert.deepEqual(v.events.map(x=>x.id),['s1']);
});
test('unlinked session never leaks either feed',()=>{
 const v=composeAgendaPresentation({...args,context:{...context,authenticated:false}});
 assert.equal(v.status,'unlinked');assert.equal(v.events.length,0);
});
test('invalid public feed does not hide independently authorized private section',()=>{
 const invalid={...pub,organizationId:'org-b'};
 const v=composeAgendaPresentation({...args,publicEnvelope:invalid});
 assert.equal(v.status,'unavailable');assert.equal(v.events.length,0);
 const mine=composeAgendaPresentation({...args,publicEnvelope:invalid,filter:'mis_asignaciones'});
 assert.equal(mine.status,'ready');assert.deepEqual(mine.events.map(x=>x.id),['a1']);
});

test('upcoming event uses congregation time, not device UTC',()=>{
 const later={...pub,activities:[{...pub.activities[0],date:'2026-10-23',time:'22:30'}]};
 const v=composeAgendaPresentation({...args,publicEnvelope:later,
   now:Date.parse('2026-10-24T02:15:00Z'),privateEnvelope:null});
 // Fresh envelopes must be supplied for this timestamp.
 assert.equal(v.status,'ready');
 assert.equal(v.next?.id,'s1');
});
