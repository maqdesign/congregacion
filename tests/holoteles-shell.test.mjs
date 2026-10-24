import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import vm from "node:vm";
const html=readFileSync(new URL("../app/index.html",import.meta.url),"utf8");
const js=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
test("shell script parses",()=>assert.doesNotThrow(()=>new vm.Script(js)));
test("Holoteles shell preserves app identity and global control order",()=>{
 assert.match(html,/brand-logo-dark\.svg/);
 const ids=["openSearch","updatesMenu","accountMenu","language"];
 const indexes=ids.map(x=>html.indexOf('id="'+x+'"'));
 assert.ok(indexes.every(x=>x>=0));
 assert.deepEqual(indexes,[...indexes].sort((a,b)=>a-b));
 assert.match(html,/aria-label="Agregar: disponible cuando se habiliten acciones autorizadas"/);
 assert.match(html,/class="icon-action" type="button" disabled/);
});
test("notification center offers individual and bulk read and never claims server sync",()=>{
 assert.match(html,/data-read-release="0961f66"/);
 assert.match(html,/data-read-release="6acaa62"/);
 assert.match(html,/id="markAllRead"/);
 assert.match(js,/localStorage\.setItem\(readKey/);
 assert.match(js,/updateNews\(\)/);
 assert.match(html,/id="unreadDot" hidden/);
 assert.doesNotMatch(html,/Sincronizado|Synchroni[sz]ed/);
});
test("avatar has no fake identity or cloud sync indicator",()=>{
 assert.match(html,/id="accountMenu"/);
 assert.match(html,/Sin Cuenta Holoteles conectada/);
 assert.match(html,/No hay sincronización activa/);
 assert.match(html,/id="goAbout"/);
 assert.doesNotMatch(html,/id="syncNow"/);
});
test("search explicitly scopes itself to existing sections",()=>{
 assert.match(html,/id="navSearch"/);
 for(const dest of ["tablero","agenda","yo"])assert.match(html,new RegExp('data-jump="'+dest+'"'));
 assert.match(html,/La búsqueda de actividades estará disponible/);
 assert.match(js,/function filterSearch\(\)/);
});
test("About identifies beta and independent, unofficial nature",()=>{
 assert.match(html,/Beta · versión de prueba/);
 assert.match(html,/No es una aplicación oficial de los testigos de Jehová/);
 assert.match(html,/Powered by Holoteles/);
});
