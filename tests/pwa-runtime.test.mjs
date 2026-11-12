import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync,existsSync} from 'node:fs';
const root=new URL('../app/',import.meta.url);
const read=path=>readFileSync(new URL(path,root),'utf8');
function worker(){
 const handlers={},stored=new Map(),requests=[],removed=[],state={offline:false,response:null,activated:false};
 const response=path=>({ok:true,type:'basic',redirected:false,headers:new Headers(),body:read(path.slice(1)||'index.html'),clone(){return this}});
 const cache={async addAll(paths){for(const path of paths)stored.set(path,response(path))},
  async put(path,value){stored.set(path,value)},async match(path){return stored.get(path)}};
 const sandbox={URL,Response,Set,self:{location:{origin:'https://synthetic.invalid'},clients:{async claim(){}},
  addEventListener:(event,fn)=>handlers[event]=fn,skipWaiting:()=>state.activated=true},
  caches:{async open(){return cache},async keys(){return ['mi-congregacion-shell-old','unrelated-cache']},async delete(key){removed.push(key)}},
  fetch:async(request)=>{requests.push(request);if(state.offline)throw Error('offline');return state.response||response(new URL(typeof request==='string'?request:request.url,'https://synthetic.invalid').pathname)}};
 vm.runInNewContext(read('sw.js'),sandbox);
 const lifecycle=async event=>{let pending;handlers[event]({waitUntil:p=>pending=p});await pending};
 const dispatch=async(path,options={})=>{let pending;handlers.fetch({request:{url:'https://synthetic.invalid'+path,method:'GET',mode:'cors',headers:new Headers(),...options},respondWith:p=>pending=p});return pending?await pending:undefined};
 return {handlers,stored,requests,removed,state,lifecycle,dispatch};
}
test('precache contains every transitive first-party UI module and manifest/icon asset',async()=>{
 const w=worker();await w.lifecycle('install');assert.equal(w.state.activated,false);
 for(const [path,response] of w.stored){
  assert.ok(existsSync(new URL('.'+path,root)),path);
  if(!/\.(mjs|html)$/.test(path))continue;
  const refs=[...response.body.matchAll(/(?:from\s*|import\s*\()\s*["'](\.\/[^"']+)["']/g)];
  for(const [,ref] of refs){const dependency=new URL(ref,'https://synthetic.invalid'+path).pathname;assert.ok(w.stored.has(dependency),`${path} requires offline ${dependency}`)}
 }
 const manifest=JSON.parse(read('manifest.webmanifest'));
 for(const icon of manifest.icons)assert.ok(w.stored.has(icon.src));
 assert.ok(w.stored.has('/dev-membership-status-ui.mjs'));
});
test('offline navigation uses public shell; API, credentials, query and foreign-origin requests are never intercepted',async()=>{
 const w=worker();await w.lifecycle('install');const installedRequests=w.requests.length;w.state.offline=true;
 assert.ok((await w.dispatch('/',{mode:'navigate'})).body.includes('normalAccessGuide'));
 for(const path of ['/api/congregation/agenda','/api/dev/membership-status','/auth/callback','/?dev=1','/account-ui.mjs?token=synthetic'])assert.equal(await w.dispatch(path,{mode:'navigate'}),undefined,path);
 assert.equal(await w.dispatch('/account-ui.mjs',{headers:new Headers({authorization:'Bearer synthetic'})}),undefined);
 assert.equal(await w.dispatch('/account-ui.mjs',{method:'POST'}),undefined);
 assert.equal(await w.dispatch('/',{url:'https://foreign.invalid/',mode:'navigate'}),undefined);
 assert.equal(w.requests.length,installedRequests+1);
});
test('install rejects Access redirects and private responses before caching anything',async()=>{
 for(const changes of [{redirected:true},{headers:new Headers({'cache-control':'no-store'})},{headers:new Headers({'cache-control':'private'})}]){
  const w=worker();w.state.response={ok:true,type:'basic',redirected:false,headers:new Headers(),...changes};
  await assert.rejects(w.lifecycle('install'),/public shell only/);
  assert.equal(w.stored.size,0);
 }
});
test('no-store/private/redirected/error navigation responses never replace public offline shell',async()=>{
 const w=worker();await w.lifecycle('install');const original=w.stored.get('/index.html');
 for(const changes of [{headers:new Headers({'cache-control':'private'})},{headers:new Headers({'cache-control':'no-store'})},{redirected:true},{ok:false}]){
  w.state.response={ok:true,type:'basic',redirected:false,headers:new Headers(),clone(){return this},...changes};
  await w.dispatch('/',{mode:'navigate'});assert.equal(w.stored.get('/index.html'),original);
 }
});
test('activation removes only obsolete app caches; update activation requires user message',async()=>{
 const w=worker();await w.lifecycle('activate');assert.deepEqual(w.removed,['mi-congregacion-shell-old']);
 w.handlers.message({data:{type:'OTHER'}});assert.equal(w.state.activated,false);
 w.handlers.message({data:{type:'ACTIVATE_UPDATE'}});assert.equal(w.state.activated,true);
});
