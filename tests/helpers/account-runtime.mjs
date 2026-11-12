// Execute the actual account UI against synthetic DOM/Auth/HTTP boundaries.
// No SDK import, credentials, network or real membership is involved.
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
export function accountRuntime({dev=false,origin='https://synthetic.invalid',fetchImpl=async()=>({ok:false})}={}){
 const elements=new Map();
 const element=id=>{
  if(!elements.has(id))elements.set(id,{hidden:false,value:'',textContent:'',disabled:false,
   listeners:{},addEventListener(event,fn){this.listeners[event]=fn},
   querySelector(){return element(id+' child')},append(){},setAttribute(){},showModal(){}});
  return elements.get(id);
 };
 const log=[];
 const config={enabled:false,supabaseUrl:'https://synthetic.supabase.co',publishableKey:'synthetic',allowProduction:true};
 const context=vm.createContext({config,URLSearchParams,location:{search:dev?'?authTest=1':'',origin,hostname:new URL(origin).hostname},
  sessionStorage:{getItem:()=>dev?'1':'0'},
  document:{documentElement:{lang:'es'},getElementById:element,querySelectorAll:()=>[]},
  window:{addEventListener(){}},fetch:fetchImpl,log});
 const source=readFileSync(new URL('../../app/account-ui.mjs',import.meta.url),'utf8').replace(/^import .*;\n/gm,'');
 vm.runInContext(source,context);
 config.enabled=true;
 vm.runInContext('gate={lock(){log.push("lock")},unlock(){log.push("unlock")},notice(){}}',context);
 return {element,log,config,run:code=>vm.runInContext(code,context),set:(key,value)=>{context[key]=value}};
}
export function deferred(){let resolve;const promise=new Promise(r=>resolve=r);return {promise,resolve}}
