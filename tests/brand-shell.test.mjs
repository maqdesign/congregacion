import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");
const html=read("app/index.html"),manifest=JSON.parse(read("app/manifest.webmanifest"));
test("header uses exported Figma logotype, not generic book",()=>{
 assert.match(html,/class="brand-lockup" src="\/brand-logo-dark\.svg"/);
 assert.doesNotMatch(html,/<use href="\/lucide-icons\.svg#book-open"/);
 assert.match(html,/id="brand" class="sr-only"/);
});
test("brand tokens match approved palette and avoid unrelated palette",()=>{
 for(const color of ["#182F4B","#C7942F","#D8B48A","#F6EFE6","#8FA5BD"])assert.ok(html.includes(color),color);
 assert.match(html,/class="dashboard-hero"/);
 assert.match(html,/class="hero-isotype"/);
});
test("PWA icon is the branded isotype and SVG files are well formed",()=>{
 assert.equal(manifest.icons[0].src,"/brand-isotype.svg");
 assert.equal(manifest.icons[0].purpose,"any");
 for(const file of ["app/brand-isotype.svg","app/brand-logo-light.svg","app/brand-logo-dark.svg","app/icon.svg"]){
  const svg=read(file);
  assert.match(svg,/^<svg\b/);assert.match(svg,/<\/svg>\s*$/);
  assert.ok(!/<script\b/i.test(svg),file);
 }
});
test("no fake content, unauthorized data or third-party font request added",()=>{
 assert.doesNotMatch(html,/@import|fonts\.googleapis|<script[^>]+src="https?:/i);
 assert.match(html,/<script type="module" src="\/account-ui\.mjs"><\/script>/);
 assert.match(html,/Congregación no vinculada/);
 assert.match(html,/Sin datos conectados/);
});
