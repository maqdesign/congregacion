import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import vm from "node:vm";
import {createAccountPrivacyGate} from "../app/account-privacy-gate.mjs";
const read=x=>readFileSync(new URL("../app/"+x,import.meta.url),"utf8");
const auth=read("account-ui.mjs"),gateSource=read("account-privacy-gate.mjs"),html=read("index.html"),sw=read("sw.js");
test("gate and auth scripts parse; production auth remains disabled",()=>{
 assert.doesNotThrow(()=>new vm.Script(gateSource.replace("export function","function")));
 assert.doesNotThrow(()=>new vm.Script(auth.replace(/^import .*;\n/gm,"")));
 assert.match(read("holoteles-auth-config.mjs"),/enabled:true/);
 assert.match(read("holoteles-auth-config.mjs"),/allowProduction:false/);
});
test("signed-out state hides full application and shows only account access",()=>{
 assert.match(html,/body\.auth-locked>header,body\.auth-locked>main,body\.auth-locked>nav/);
 assert.match(html,/\.account-access-page\[hidden\]\{display:none!important\}/);
 assert.match(gateSource,/gate\.hidden=false/);
 assert.match(gateSource,/gate\.hidden=true/);
 assert.match(gateSource,/data-access="login"/);
 assert.match(gateSource,/data-access="signup"/);
});
test("sign-out locks before awaiting provider and clears sensitive fields",()=>{
 assert.match(auth,/busy=true;lockAccount\(\);\s*try\{await adapter\.signOut\(\)/);
 assert.match(auth,/\$\("verifiedEmail"\)\.textContent=""/);
 assert.match(auth,/\$\("authPassword"\)\.value=""/);
 assert.match(auth,/\$\("authEmail"\)\.value=""/);
 assert.match(auth,/\$\("givenName"\)\.value=""/);
 assert.match(auth,/\$\("familyName"\)\.value=""/);
 assert.match(gateSource,/\[data-private-content\]/);
 assert.match(gateSource,/replaceChildren\(\)/);
 assert.match(gateSource,/mi-congregacion:auth-locked/);
});
test("expiry and provider sign-out revoke view without trusting cached session",()=>{
 assert.match(auth,/event==="SIGNED_OUT"\|\|event==="USER_DELETED"/);
 assert.match(auth,/event==="TOKEN_REFRESHED"/);
 assert.match(auth,/adapter\.getVerifiedUser\(\)/);
 assert.match(auth,/if\(current!==generation\)return/);
 assert.match(auth,/if\(current===generation\)showVerified\(user\)/);
 assert.match(auth,/if\(current===generation\)lockAccount\(\)/);
});
test("access gate is available offline and not a data-sync workaround",()=>{
 assert.match(sw,/mi-congregacion-shell-v3-20261024/);
 assert.match(sw,/"\/account-privacy-gate\.mjs"/);
 assert.doesNotMatch(gateSource,/fetch\(|localStorage|sessionStorage|supabase/);
});
