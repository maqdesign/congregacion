import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { onRequest } from "../functions/api/dev/membership-status.js";

const routes=JSON.parse(readFileSync(new URL("../app/_routes.json",import.meta.url),"utf8"));

test("Pages invokes Functions only for the DEV membership diagnostic",()=>{
 assert.equal(routes.version,1);
 assert.deepEqual(routes.include,["/api/dev/membership-status"]);
 assert.deepEqual(routes.exclude,[]);
});

test("Cloudflare adapter rejects unauthenticated reads without querying Core",async()=>{
 const request=new Request("https://private-preview.example/api/dev/membership-status",{method:"GET"});
 const response=await onRequest({request});
 assert.equal(response.status,401);
 assert.equal(response.headers.get("cache-control"),"no-store, private");
 assert.deepEqual(await response.json(),{state:"signed_out"});
});

test("Cloudflare adapter rejects unsupported HTTP methods",async()=>{
 const request=new Request("https://private-preview.example/api/dev/membership-status",{method:"POST"});
 const response=await onRequest({request});
 assert.equal(response.status,405);
 assert.deepEqual(await response.json(),{state:"unavailable"});
});

test("Pages adapter cannot grant private agenda access",()=>{
 const source=readFileSync(new URL("../app/api/dev/membership-status.mjs",import.meta.url),"utf8");
 assert.match(source,/privateAccess:false/);
 const bridge=readFileSync(new URL("../functions/api/dev/membership-status.js",import.meta.url),"utf8");
 assert.doesNotMatch(bridge,/service_role|privateAccess:true|allowProduction:true/);
});
