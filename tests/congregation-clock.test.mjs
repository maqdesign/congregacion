import test from 'node:test';
import assert from 'node:assert/strict';
import {congregationClock} from '../src/ui/congregation-clock.mjs';
test('Santo Domingo uses authorized zone, not UTC date',()=>{
 const r=congregationClock('America/Santo_Domingo',Date.parse('2026-10-24T02:15:00Z'));
 assert.deepEqual(r,{today:'2026-10-23',nowTime:'22:15'});
});
test('DST changes are resolved by Intl for another valid zone',()=>{
 const r=congregationClock('America/New_York',Date.parse('2026-07-01T12:00:00Z'));
 assert.equal(r.nowTime,'08:00');
});
test('invalid timezone and instant fail closed',()=>{
 assert.throws(()=>congregationClock('Mars/Nowhere'),TypeError);
 assert.throws(()=>congregationClock('America/Santo_Domingo',NaN),TypeError);
});
