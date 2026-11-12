// File-level equivalent when this environment denies listening sockets.
// This intentionally does not claim HTTP, layout, or browser accessibility QA.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import vm from 'node:vm';
const root=new URL('../app/',import.meta.url),read=path=>readFileSync(new URL(path,root),'utf8');
const html=read('index.html');
test('required local routes, manifest JSON and every HTML resource resolve in app root',()=>{
 for(const route of ['/','/?dev=1','/dev-ui.mjs','/manifest.webmanifest','/sw.js','/brand-isotype.svg']){
  const url=new URL(route,'https://synthetic.invalid');
  assert.ok(read(url.pathname==='/'?'index.html':'.'+url.pathname).length,route);
 }
 const manifest=JSON.parse(read('manifest.webmanifest'));assert.equal(manifest.display,'standalone');
 for(const [,value] of html.matchAll(/(?:src|href)="(\/[^\"]*)"/g)){
  const url=new URL(value,'https://synthetic.invalid');assert.ok(existsSync(new URL('.'+url.pathname,root)),value);
  if(url.hash){const svg=read('.'+url.pathname);assert.ok(svg.includes('id="'+url.hash.slice(1)+'"'),value)}
 }
 for(const [,source] of html.matchAll(/<script>([\s\S]*?)<\/script>/g))assert.doesNotThrow(()=>new vm.Script(source));
});
test('static accessible names point to existing unique IDs; form labels and dialog titles resolve',()=>{
 const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(x=>x[1]);assert.equal(new Set(ids).size,ids.length);
 for(const [,refs] of html.matchAll(/(?:aria-labelledby|aria-describedby|for)="([^"]+)"/g)){
  for(const id of refs.split(/\s+/))assert.ok(ids.includes(id),id);
 }
 assert.match(html,/<html lang="es">/);assert.match(html,/name="viewport"/);
 assert.match(html,/@media\(prefers-reduced-motion:reduce\)/);
 assert.match(html,/:is\(button,summary,input,select,textarea,a\):focus-visible/);
});
function luminance(hex){const channels=hex.match(/[0-9a-f]{2}/gi).map(x=>parseInt(x,16)/255).map(x=>x<=0.04045?x/12.92:((x+0.055)/1.055)**2.4);return channels[0]*0.2126+channels[1]*0.7152+channels[2]*0.0722}
function contrast(a,b){const x=luminance(a),y=luminance(b);return (Math.max(x,y)+0.05)/(Math.min(x,y)+0.05)}
test('primary text, muted copy and keyboard focus tokens have sufficient contrast on public surfaces',()=>{
 const value=name=>[...html.matchAll(new RegExp('--'+name+':(#[0-9a-f]{6})','gi'))].at(-1)?.[1];
 for(const bg of [value('cream'),value('surface')]){
  assert.ok(contrast(value('ink'),bg)>=4.5);assert.ok(contrast(value('muted'),bg)>=4.5);
  assert.ok(contrast(value('focus'),bg)>=3);
 }
 assert.ok(contrast('#FFFDF9',value('navy'))>=3);
 assert.match(html,/header :is\(button,summary\):focus-visible\{outline-color:#FFFDF9\}/);
});
