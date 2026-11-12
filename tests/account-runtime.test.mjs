import test from 'node:test';
import assert from 'node:assert/strict';
import {accountRuntime,deferred} from './helpers/account-runtime.mjs';
const allowed={authorized:true,identityVerified:true,sessionActive:true,membershipActive:true,scopeGranted:true,consentActive:true};
test('Pages origins cannot initialize shared Auth through DEV/authTest flags',async()=>{
 for(const origin of ['https://mi-congregacion-preview.pages.dev','https://branch.mi-congregacion-preview.pages.dev']){
  let calls=0;const r=accountRuntime({dev:true,origin,fetchImpl:async()=>{calls++;throw Error('must not fetch')}});
  assert.equal(r.run('configAllowed()'),false);
  r.set('operation',()=>{calls++;throw Error('must not sign in')});
  r.run('adapter={signIn:operation,getVerifiedUser:operation}');
  await r.element('accountForm').listeners.submit({preventDefault(){}});
  await r.run('refreshVerified()');
  assert.equal(calls,0);assert.equal(r.log.includes('unlock'),false);
 }
});
test('actual account UI requires every server condition; 401/403, malformed and offline remain locked',async()=>{
 const decisions=[{},null,...Object.keys(allowed).flatMap(key=>[{...allowed,[key]:false},{...allowed,[key]:'true'}])];
 for(const decision of decisions){
  const r=accountRuntime({fetchImpl:async()=>({ok:true,json:async()=>decision})});
  await r.run('showVerified({email:"synthetic@example.invalid"})');
  assert.deepEqual(r.log,['lock']);
 }
 for(const status of [401,403,500]){
  const r=accountRuntime({fetchImpl:async()=>({ok:false,status,json:async()=>allowed})});
  await r.run('showVerified({})');assert.deepEqual(r.log,['lock']);
 }
 for(const fetchImpl of [async()=>{throw Error('offline')},async()=>({ok:true,json:async()=>{throw Error('invalid json')}})]){
  const r=accountRuntime({fetchImpl});await r.run('showVerified({})');assert.deepEqual(r.log,['lock']);
 }
 const r=accountRuntime({fetchImpl:async()=>({ok:true,json:async()=>allowed})});
 await r.run('showVerified({})');assert.deepEqual(r.log,['lock','unlock']);
});
test('revocation while response JSON is pending discards an otherwise authorized response',async()=>{
 const body=deferred(),entered=deferred();
 const r=accountRuntime({fetchImpl:async()=>({ok:true,json:()=>{entered.resolve();return body.promise}})});
 const pending=r.run('showVerified({})');await entered.promise;
 r.run('lockAccount()');body.resolve(allowed);await pending;
 assert.equal(r.log.includes('unlock'),false);
});
test('sign-in completion after session revocation never restores the old identity or calls access endpoint',async()=>{
 const user=deferred();let requests=0;
 const r=accountRuntime({fetchImpl:async()=>{requests++;return {ok:false}}});
 r.set('signInResult',user.promise);r.run('adapter={signIn:()=>signInResult}');
 const pending=r.element('accountForm').listeners.submit({preventDefault(){}});
 r.run('lockAccount()');user.resolve({email:'synthetic@example.invalid'});await pending;
 assert.equal(requests,0);assert.equal(r.element('verifiedEmail').textContent,'');
 assert.equal(r.log.includes('unlock'),false);
});
test('verification completion after logout and DEV diagnostic membership cannot grant private access',async()=>{
 const user=deferred();const r=accountRuntime();r.set('userResult',user.promise);
 r.run('adapter={getVerifiedUser:()=>userResult}');const pending=r.run('refreshVerified()');
 r.run('lockAccount()');user.resolve({email:'synthetic@example.invalid'});await pending;
 assert.equal(r.element('verifiedEmail').textContent,'');
 const dev=accountRuntime({dev:true,fetchImpl:async()=>({json:async()=>({state:'membership_found'})})});
 dev.run('authClient={auth:{getSession:async()=>({data:{session:{access_token:"synthetic"}}})}}');
 await dev.run('showVerified({email:"synthetic@example.invalid"})');
 assert.equal(dev.log.includes('unlock'),false);
});
test('leaving an allowed Auth mode invalidates pending requests and disables further account operations',async()=>{
 const body=deferred(),entered=deferred();let calls=0;
 const r=accountRuntime({fetchImpl:async()=>({ok:true,json:()=>{entered.resolve();return body.promise}})});
 const pending=r.run('showVerified({})');await entered.promise;
 r.config.allowProduction=false;await r.run('initializeAuth()');body.resolve(allowed);await pending;
 assert.equal(r.log.includes('unlock'),false);assert.equal(r.element('accountForm').hidden,true);
 r.set('operation',()=>{calls++;throw Error('must not run')});
 r.run('adapter={signIn:operation,signUp:operation,recover:operation,getVerifiedUser:operation}');
 await r.element('accountForm').listeners.submit({preventDefault(){}});
 r.run('showMode("signup")');await r.element('accountForm').listeners.submit({preventDefault(){}});
 await r.element('recoverAccount').listeners.click();await r.run('refreshVerified()');
 assert.equal(calls,0);
});
test('logout locks and clears identity before provider completion, including provider failure',async()=>{
 const r=accountRuntime();r.element('verifiedEmail').textContent='synthetic@example.invalid';
 let seenLocked=false;r.set('providerSignOut',async()=>{seenLocked=r.log.includes('lock')&&r.element('verifiedEmail').textContent==='';throw Error('offline')});
 r.run('adapter={signOut:providerSignOut}');await r.element('signOutAccount').listeners.click();
 assert.equal(seenLocked,true);assert.equal(r.log.includes('unlock'),false);
});
test('a revoked DEV token read never starts a diagnostic request; access fetches reject redirects',async()=>{
 const session=deferred();let requests=0;
 const r=accountRuntime({dev:true,fetchImpl:async()=>{requests++;return {json:async()=>({})}}});
 r.set('sessionResult',session.promise);r.run('authClient={auth:{getSession:()=>sessionResult}}');
 const pending=r.run('showVerified({})');r.run('lockAccount()');
 session.resolve({data:{session:{access_token:'synthetic'}}});await pending;assert.equal(requests,0);
 const normal=accountRuntime({fetchImpl:async(url,options)=>{assert.equal(options.redirect,'error');return {ok:false}}});
 await normal.run('showVerified({})');
});
