import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=name=>readFileSync(new URL("../app/"+name,import.meta.url),"utf8");
test("DEV mode activation triggers Auth initialization after sessionStorage switches",()=>{
 const account=read("account-ui.mjs"),html=read("index.html");
 assert.match(account,/window\.addEventListener\("mi-congregacion:dev-change",\(\)=>\{void initializeAuth\(\)\}\)/);
 assert.match(html,/window\.dispatchEvent\(new Event\("mi-congregacion:dev-change"\)\)/);
});
test("DEV auth does not lock behind account access page",()=>{
 const account=read("account-ui.mjs");
 assert.match(account,/if\(!devAllowed\(\)&&!gate\)/);
 assert.match(account,/\$\("accountForm"\)\.hidden=false/);
 assert.match(read("holoteles-auth-config.mjs"),/allowProduction:false/);
});
test("Safari PWA refreshes authentication modules instead of serving stale static first",()=>{
 const sw=read("sw.js");
 assert.match(sw,/mi-congregacion-shell-v7-20261026/);
 assert.match(sw,/AUTH_ASSETS\.has\(url\.pathname\)/);
 assert.match(sw,/fetch\(request,\{cache:"no-store"\}\)/);
 assert.match(sw,/\/holoteles-auth-config\.mjs/);
});
