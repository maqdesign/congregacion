// Local Workers-runtime smoke. Install pinned Miniflare in work/, never deploy.
// Usage: node scripts/qa-pages-runtime.mjs /path/to/miniflare/dist/src/index.js
// All outbound calls are intercepted with synthetic responses; zero Core traffic.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath,pathToFileURL} from 'node:url';
import path from 'node:path';
const root=fileURLToPath(new URL('../',import.meta.url));
const modulePath=process.argv[2]||path.resolve(root,'../work/pages-runtime/node_modules/miniflare/dist/src/index.js');
const {Miniflare}=await import(pathToFileURL(modulePath).href);
let mode='active',outbound=0,checks=0;
const mf=new Miniflare({
 host:'127.0.0.1',port:0,compatibilityDate:'2026-07-30',modulesRoot:root,
 modules:[
  {type:'ESModule',path:'qa-entry.mjs',contents:'import {onRequest} from "./functions/api/dev/membership-status.js";export default {fetch(request){return onRequest({request})}}'},
  ...['functions/api/dev/membership-status.js','app/api/dev/membership-status.mjs'].map(name=>({type:'ESModule',path:name,contents:readFileSync(path.join(root,name),'utf8')}))
 ],
 outboundService:async request=>{
  outbound++;
  const url=new URL(request.url);
  assert.equal(url.hostname,'hghpliyjctmctjgrrbcs.supabase.co');
  assert.equal(request.method,'GET');
  if(mode==='network')throw Error('synthetic network failure');
  if(url.pathname==='/auth/v1/user'){
   if(mode==='signed_out')return new Response('{}',{status:401});
   if(mode==='invalid_json')return new Response('not json');
   return Response.json({id:'synthetic-user-only'});
  }
  assert.equal(url.pathname,'/rest/v1/holoteles_organization_memberships');
  assert.equal(url.searchParams.get('user_id'),'eq.synthetic-user-only');
  if(mode==='unavailable')return new Response('{}',{status:503});
  const rows=mode==='unlinked'?[]:mode==='ambiguous'?[{status:'active'},{status:'active'}]:[{status:mode==='revoked'?'former':'active'}];
  return Response.json(rows);
 }
});
try{
 for(const spec of [
  {name:'missing bearer',status:401},
  {name:'unsupported method',method:'POST',status:405},
  {name:'invalid bearer syntax',token:'contains spaces',status:401},
  {name:'oversize bearer',token:'x'.repeat(8200),status:401}
 ]){
  const before=outbound;
  const response=await mf.dispatchFetch('https://synthetic.invalid/api/dev/membership-status',{method:spec.method||'GET',headers:spec.token?{authorization:'Bearer '+spec.token}:{}});
  assert.equal(response.status,spec.status,spec.name);assert.equal(outbound,before,spec.name+' must not reach Core');
  assert.equal(response.headers.get('cache-control'),'no-store, private');
  assert.equal(response.headers.get('x-frame-options'),'DENY');checks++;
 }
 for(const [next,status,state] of [
  ['active',200,'membership_found'],['unlinked',200,'not_linked'],['revoked',200,'not_linked'],
  ['ambiguous',503,'unavailable'],['unavailable',503,'unavailable'],['signed_out',401,'signed_out'],['invalid_json',503,'unavailable'],['network',503,'unavailable']
 ]){
  mode=next;
  const response=await mf.dispatchFetch('https://synthetic.invalid/api/dev/membership-status',{headers:{authorization:'Bearer synthetic-token'}});
  assert.equal(response.status,status,next);const body=await response.json();assert.equal(body.state,state,next);
  if(status===200)assert.equal(body.privateAccess,false,next);
  assert.equal(JSON.stringify(body).includes('synthetic-user-only'),false,'no identity returned');
  assert.equal(response.headers.get('cache-control'),'no-store, private');checks++;
 }
 console.log(JSON.stringify({checks,pass:checks,fail:0,external_requests:0,runtime:'Miniflare 4.20260730.0 / workerd, local compatibility 2026-07-30; Pages uses 2026-11-12',core:'synthetic outbound responses only'}));
}finally{await mf.dispose()}
