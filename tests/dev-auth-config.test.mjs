import test from "node:test";
import assert from "node:assert/strict";
import {HOLOTELES_AUTH_CONFIG as config} from "../app/holoteles-auth-config.mjs";

test("DEV auth configuration parses with a public key and is enabled only behind DEV option",()=>{
 assert.equal(config.enabled,true);
 assert.equal(config.allowProduction,false);
 assert.match(config.supabaseUrl,/^https:\/\/[a-z0-9-]+\.supabase\.co$/);
 assert.match(config.publishableKey,/^sb_publishable_[A-Za-z0-9_-]+$/);
 assert.doesNotMatch(config.publishableKey,/\s/);
});
