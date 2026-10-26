import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const src=readFileSync(new URL('../app/account-ui.mjs',import.meta.url),'utf8');
test('Core access is same-origin no-store and credentials scoped',()=>{
 assert.match(src,/fetch\("\/api\/congregation\/access"/);
 assert.match(src,/credentials:"same-origin",cache:"no-store"/);
});
test('all five server checks and async generation gate unlock',()=>{
 for(const key of ['authorized','identityVerified','sessionActive','membershipActive','scopeGranted','consentActive'])assert.match(src,new RegExp('result\\.?'+(key==='authorized'?'\\?\\.':'\\.')+key+'===true'));
 assert.match(src,/ticket!==generation/);
 assert.match(src,/devAllowed\(\)/);
});
